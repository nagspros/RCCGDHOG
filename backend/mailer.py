import argparse
import json
import os
import smtplib
import ssl
import time
from email.message import EmailMessage
from email.utils import parseaddr
from html import escape
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from .db import db, initialize


class Rejected(Exception):
    pass


class RetryLater(Exception):
    pass


def configuration():
    provider = os.getenv("MAIL_PROVIDER", "").lower()
    sender = os.getenv("MAIL_FROM", "")
    base_url = os.getenv("PUBLIC_SITE_URL", "").rstrip("/")
    origin = urlsplit(base_url)
    valid_origin = origin.scheme == "https" or (origin.scheme == "http" and origin.hostname in {"localhost", "127.0.0.1"})
    if (not sender or "@" not in parseaddr(sender)[1] or any(char in sender for char in "\r\n")
            or not valid_origin or not origin.hostname or origin.path or origin.query or origin.fragment or origin.username):
        return None
    if provider == "resend" and os.getenv("RESEND_API_KEY"):
        return provider, sender, base_url
    if provider == "smtp" and os.getenv("SMTP_HOST"):
        return provider, sender, base_url
    return None


def deliver(job, config):
    provider, sender, base_url = config
    text = job["body"]
    reply_to = dict(job).get("reply_to")
    footer = ""
    if job["audience"] == "all":
        link = f"{base_url}/api/unsubscribe/{job['unsubscribe_token']}"
        text += f"\n\nUnsubscribe from church updates: {link}"
        footer = f'<a href="{escape(link)}" style="color:#53645a">Unsubscribe from church updates</a>'
    elif job["audience"] == "staff":
        link = f"{base_url}/#/admin"
        text += f"\n\nOpen the staff dashboard: {link}"
        footer = f'<a href="{escape(link)}" style="color:#234f3a">Open the staff dashboard</a>'
    html = f"""<!doctype html><html lang="en"><body style="margin:0;background:#f7f3e9;padding:24px 12px;font-family:Arial,sans-serif;color:#172c23">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border:1px solid #e6dfce">
<tr><td style="background:#05291f;padding:24px;color:#fae19c;font-size:19px;font-weight:bold">RCCG Dominion Hope of Glory</td></tr>
<tr><td style="padding:24px;border-top:3px solid #d8b267"><h1 style="font-size:23px;margin:0 0 16px">{escape(job["subject"])}</h1>
<div style="font-size:15px;line-height:1.6;overflow-wrap:anywhere">{escape(job["body"]).replace(chr(10), "<br>")}</div></td></tr>
<tr><td style="padding:16px 24px;background:#f7f3e9;font-size:13px">RCCG DHOG · Newark, New Jersey<br>{footer}</td></tr>
</table></body></html>"""
    if provider == "resend":
        payload = {"from": sender, "to": [job["recipient"]], "subject": job["subject"], "text": text, "html": html}
        if reply_to:
            payload["reply_to"] = reply_to
        request = Request(
            "https://api.resend.com/emails",
            method="POST",
            headers={"Authorization": f"Bearer {os.environ['RESEND_API_KEY']}", "Content-Type": "application/json",
                     "Idempotency-Key": job["id"], "User-Agent": "RCCG-DHOG/1.0"},
            data=json.dumps(payload).encode(),
        )
        try:
            with urlopen(request, timeout=15) as response:
                return json.load(response)["id"]
        except HTTPError as error:
            if error.code == 429:
                raise RetryLater from None
            if error.code in {400, 401, 403, 404, 422}:
                raise Rejected(f"Resend rejected the request ({error.code}).") from None
            raise

    message = EmailMessage()
    message["From"] = sender
    message["To"] = job["recipient"]
    message["Subject"] = job["subject"]
    if reply_to:
        message["Reply-To"] = reply_to
    message["Message-ID"] = f"<{job['id']}@{parseaddr(sender)[1].split('@')[-1]}>"
    message.set_content(text)
    message.add_alternative(html, subtype="html")
    context = ssl.create_default_context()
    implicit_tls = os.getenv("SMTP_IMPLICIT_TLS", "0") == "1"
    smtp_class = smtplib.SMTP_SSL if implicit_tls else smtplib.SMTP
    port = int(os.getenv("SMTP_PORT", "465" if implicit_tls else "587"))
    kwargs = {"context": context} if implicit_tls else {}
    try:
        with smtp_class(os.environ["SMTP_HOST"], port, timeout=15, **kwargs) as client:
            if not implicit_tls:
                client.starttls(context=context)
            if os.getenv("SMTP_USERNAME"):
                client.login(os.environ["SMTP_USERNAME"], os.environ.get("SMTP_PASSWORD", ""))
            client.send_message(message)
    except (smtplib.SMTPAuthenticationError, smtplib.SMTPRecipientsRefused, smtplib.SMTPSenderRefused) as error:
        raise Rejected(type(error).__name__) from None
    return message["Message-ID"]


def process_one(config):
    now = int(time.time())
    with db(write=True) as connection:
        # A crashed worker may have sent the message before it could record the result.
        connection.execute("""UPDATE deliveries SET state='uncertain', error='Worker stopped before recording the result.'
                              WHERE state='sending' AND started<?""", (now - 600,))
        connection.execute("""UPDATE inbox_notifications SET state='uncertain', error='Worker stopped before recording the result.'
                              WHERE state='sending' AND started<?""", (now - 600,))
        notification = connection.execute(
            """SELECT *, 'staff' AS audience FROM inbox_notifications
               WHERE state='queued' ORDER BY created, id LIMIT 1"""
        ).fetchone()
        table = "inbox_notifications" if notification else "deliveries"
        job = notification or connection.execute(
            """SELECT d.*, c.subject, c.body, c.audience, m.status AS member_status, m.subscribed,
                      m.opted_out, m.unsubscribe_token
               FROM deliveries d JOIN campaigns c ON c.id=d.campaign_id JOIN members m ON m.id=d.member_id
               WHERE d.state='queued' AND c.due<=?
               ORDER BY c.due, d.id LIMIT 1""", (now,)
        ).fetchone()
        if not job:
            return "idle"
        if not notification and (job["member_status"] != "active" or
                                 (job["audience"] == "all" and (not job["subscribed"] or job["opted_out"]))):
            connection.execute("UPDATE deliveries SET state='skipped' WHERE id=?", (job["id"],))
            return "skipped"
        connection.execute(f"UPDATE {table} SET state='sending', started=? WHERE id=?", (now, job["id"]))

    try:
        provider_id = deliver(job, config)
        state, error = "accepted", None
    except RetryLater:
        state, provider_id, error = "queued", None, "Provider rate limit; will retry."
    except Rejected as rejection:
        state, provider_id, error = "failed", None, str(rejection)
    except Exception:
        state, provider_id, error = "uncertain", None, "Could not verify provider acceptance. Check the provider before resending."

    with db(write=True) as connection:
        connection.execute(
            f"UPDATE {table} SET state=?, provider_id=?, error=? WHERE id=? AND state='sending'",
            (state, provider_id, error, job["id"]),
        )
    return state


def main():
    parser = argparse.ArgumentParser(description="Send due church email from the persistent queue.")
    parser.add_argument("--once", action="store_true", help="Process currently due mail and exit.")
    args = parser.parse_args()
    config = configuration()
    if not config:
        parser.error("Configure MAIL_PROVIDER, MAIL_FROM, PUBLIC_SITE_URL and provider credentials first.")
    initialize()
    while True:
        result = process_one(config)
        if args.once and result in {"idle", "queued"}:
            break
        time.sleep(30 if result == "queued" else 2 if result == "idle" else 0.6)


if __name__ == "__main__":
    main()
