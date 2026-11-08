"""Integration tests. Local SQLite by default. Use disposable databases for other modes."""

import os
import io
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from .auth import password_digest
from .db import db
from .main import app
from .mailer import configuration, deliver, process_one
from .youtube import public_stream

HEADERS = {"X-DHOG-Request": "1"}
PASSWORD = "test-only-password-long"
TAG = uuid4().hex[:8]


class ChurchApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        mode = os.getenv("DHOG_TEST_DB_MODE", "sqlite")
        cls.environment = patch.dict(os.environ, {
            "DHOG_DB_MODE": mode,
            "DHOG_DATABASE": f"{cls.temp.name}/test.sqlite3",
            "DHOG_SECURE_COOKIE": "0",
            "MAIL_PROVIDER": "resend",
            "RESEND_API_KEY": "not-a-real-key",
            "MAIL_FROM": "church@example.com",
            "PUBLIC_SITE_URL": "http://localhost:3000",
            "YOUTUBE_API_KEY": "",
        })
        cls.environment.start()
        cls.addClassCleanup(cls.environment.stop)
        cls.addClassCleanup(cls.temp.cleanup)
        cls.client = TestClient(app, headers=HEADERS)
        cls.client.__enter__()
        cls.addClassCleanup(cls.client.__exit__, None, None, None)
        cls.admin_email = f"admin-{TAG}@example.com"
        cls.pastor_email = f"pastor-{TAG}@example.com"
        salt = bytes(16)
        digest = f"{salt.hex()}:{password_digest(PASSWORD, salt)}"
        with db(write=True) as connection:
            connection.executemany("INSERT INTO admin VALUES (?, ?, ?)", [
                (cls.admin_email, digest, "admin"), (cls.pastor_email, digest, "pastor"),
            ])

    def setUp(self):
        self.client.cookies.clear()

    def login(self, role="admin"):
        email = self.pastor_email if role == "pastor" else self.admin_email
        response = self.client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertIn("HttpOnly", response.headers["set-cookie"])
        return response

    def test_access_and_confidential_prayers(self):
        self.assertEqual(self.client.get("/api/admin/site").status_code, 401)
        self.assertEqual(self.client.get("/api/admin/members").status_code, 401)
        self.assertEqual(self.client.post("/api/auth/logout", headers={"X-DHOG-Request": ""}).status_code, 403)
        prayer = self.client.post("/api/forms/prayer", json={
            "name": "Private request", "message": "Test pastoral request",
            "category": "Spiritual Growth", "subjectOrTopic": "Confidential", "isConfidentialToPastorOnly": True,
        })
        self.assertEqual(prayer.status_code, 201, prayer.text)
        prayer_id = prayer.json()["id"]
        self.login()
        state = self.client.get("/api/admin/site").json()
        self.assertNotIn(prayer_id, [item["id"] for item in state["data"]["prayers"]])
        self.assertEqual(self.client.put("/api/admin/site", json=state).status_code, 200)
        self.assertEqual(self.client.put("/api/admin/site", json=state).status_code, 409)
        self.client.post("/api/auth/logout")
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)
        self.login("pastor")
        self.assertIn(prayer_id, [item["id"] for item in self.client.get("/api/admin/site").json()["data"]["prayers"]])
        public = self.client.get("/api/public/site").json()
        self.assertNotIn("prayers", public)
        self.assertNotIn("contactMessages", public)

    def test_account_credentials_require_password_and_revoke_sessions(self):
        original_email = f"settings-{TAG}@example.com"
        new_email = f"updated-{TAG}@example.com"
        new_password = "updated-test-password-long"
        salt = bytes(16)
        with db(write=True) as connection:
            connection.execute("INSERT INTO admin VALUES (?, ?, ?)",
                               (original_email, f"{salt.hex()}:{password_digest(PASSWORD, salt)}", "pastor"))

        route = "/api/auth/credentials"
        update = {"email": new_email.upper(), "currentPassword": PASSWORD, "newPassword": new_password}
        self.assertEqual(self.client.post(route, json=update).status_code, 401)
        with TestClient(app, headers=HEADERS) as other:
            for client in (self.client, other):
                login = client.post("/api/auth/login", json={"email": original_email, "password": PASSWORD})
                self.assertEqual(login.status_code, 200)
            self.assertEqual(self.client.post(route, json={**update, "currentPassword": "wrong"}).status_code, 403)
            self.assertEqual(self.client.post(route, json={**update, "email": self.admin_email}).status_code, 409)
            self.assertEqual(self.client.post(route, json={**update, "newPassword": "short"}).status_code, 422)
            response = self.client.post(route, json=update)
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json(), {"email": new_email})
            self.assertIn("Max-Age=0", response.headers["set-cookie"])
            for client in (self.client, other):
                self.assertEqual(client.get("/api/auth/me").status_code, 401)
        for email, password in ((original_email, PASSWORD), (new_email, PASSWORD)):
            self.assertEqual(self.client.post("/api/auth/login", json={"email": email, "password": password}).status_code, 401)
        signed_in = self.client.post("/api/auth/login", json={"email": new_email, "password": new_password})
        self.assertEqual(signed_in.json(), {"email": new_email, "role": "pastor"})
        email_only = self.client.post(route, json={"email": original_email, "currentPassword": new_password})
        self.assertEqual(email_only.status_code, 200, email_only.text)
        signed_in = self.client.post("/api/auth/login", json={"email": original_email, "password": new_password})
        self.assertEqual(signed_in.json(), {"email": original_email, "role": "pastor"})

    def test_forms_persist_and_create_pending_member(self):
        member_email = f"application-{TAG}@example.com"
        responses = [
            self.client.post("/api/forms/connect", json={"formType": "Membership", "fullName": "New Member", "email": member_email, "subscribe": True}),
            self.client.post("/api/forms/contact", json={"name": "Visitor", "email": member_email, "subject": "Office", "message": "Test office message"}),
            self.client.post("/api/forms/visit", json={"name": "Visitor", "email": member_email, "serviceDate": "Sunday"}),
            self.client.post("/api/forms/ride", json={"name": "Visitor", "phone": "555-0100", "address": "Test address", "service": "Sunday"}),
            self.client.post("/api/forms/ministry", json={"name": "Visitor", "email": member_email, "ministry": "Choir"}),
        ]
        for response in responses:
            self.assertEqual(response.status_code, 201, response.text)
        self.login()
        directory = self.client.get("/api/admin/members").json()
        member = next(item for item in directory if item["email"] == member_email)
        self.assertEqual(member["status"], "pending")
        self.assertNotIn("unsubscribe_token", member)
        saved = self.client.get("/api/admin/site").json()["data"]
        self.assertTrue(any(item["id"] == responses[1].json()["id"] for item in saved["contactMessages"]))
        ids = {item["id"] for item in self.client.get("/api/admin/submissions").json()}
        self.assertTrue({response.json()["id"] for response in responses[2:]} <= ids)
        self.assertEqual(self.client.patch(f"/api/admin/submissions/{responses[2].json()['id']}", json={"status": "Closed"}).status_code, 200)

    def test_mail_queue_schedule_idempotency_and_opt_out(self):
        self.login()
        opted_in = f"mail-{TAG}@example.com"
        excluded = f"no-mail-{TAG}@example.com"
        csv = f"name,email,subscribed\nSubscriber,{opted_in},true\nOther,{excluded},false"
        imported = self.client.post("/api/admin/members/import", json={"csv": csv})
        self.assertEqual(imported.json(), {"added": 2, "duplicates": 0})
        duplicate = self.client.post("/api/admin/members/import", json={"csv": csv})
        self.assertEqual(duplicate.json(), {"added": 0, "duplicates": 2})
        directory = self.client.get("/api/admin/members").json()
        recipient = next(item for item in directory if item["email"] == opted_in)
        private = {"id": str(uuid4()), "audience": "member", "memberId": recipient["id"],
                   "subject": "Private note", "body": "Test message",
                   "sendAt": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()}
        response = self.client.post("/api/admin/mail", json=private)
        self.assertEqual(response.status_code, 202, response.text)
        self.assertEqual(self.client.post("/api/admin/mail", json=private).json()["counts"], {"queued": 1})
        self.assertEqual(self.client.post("/api/admin/mail", json={**private, "subject": "Different"}).status_code, 409)
        self.assertEqual(self.client.post(f"/api/admin/mail/{private['id']}/cancel").json(), {"cancelled": 1})

        mailing = {"id": str(uuid4()), "audience": "all", "subject": "Service update", "body": "Test announcement"}
        self.assertEqual(self.client.post("/api/admin/mail", json=mailing).status_code, 202)
        url = f"/api/admin/mail/{mailing['id']}"
        queued = {row["recipient"] for row in self.client.get(url).json()["deliveries"]}
        self.assertIn(opted_in, queued)
        self.assertNotIn(excluded, queued)
        with db() as connection:
            token = connection.execute("SELECT unsubscribe_token FROM members WHERE id=?", (recipient["id"],)).fetchone()["unsubscribe_token"]
        self.assertEqual(self.client.get(f"/api/unsubscribe/{token}").status_code, 200)
        self.assertEqual(self.client.post(f"/api/unsubscribe/{token}").status_code, 200)
        with patch("backend.mailer.deliver", return_value="fake-provider-id") as send:
            while process_one(configuration()) != "idle":
                pass
            self.assertFalse(any(call.args[0]["recipient"] == opted_in for call in send.call_args_list))
        deliveries = self.client.get(url).json()["deliveries"]
        self.assertEqual(next(row["state"] for row in deliveries if row["recipient"] == opted_in), "skipped")

        directory = self.client.get("/api/admin/members").json()
        direct_recipient = next(item for item in directory if item["email"] == excluded)
        state = self.client.get("/api/admin/site").json()
        event = state["data"]["services"][0]
        event["status"] = "Scheduled"
        self.assertEqual(self.client.put("/api/admin/site", json=state).status_code, 200)
        public_event = next(item for item in self.client.get("/api/public/site").json()["services"] if item["id"] == event["id"])
        self.assertNotIn("roster", public_event)
        event_message = {**private, "id": str(uuid4()), "eventId": event["id"],
                         "sendAt": None, "memberId": direct_recipient["id"]}
        accepted = self.client.post("/api/admin/mail", json=event_message)
        self.assertEqual(accepted.status_code, 202, accepted.text)
        with patch("backend.mailer.deliver", return_value="fake-provider-id") as send:
            self.assertEqual(process_one(configuration()), "accepted")
            self.assertEqual(send.call_args.args[0]["recipient"], excluded)
            self.assertIn(event["title"], send.call_args.args[0]["body"])
        self.assertEqual(self.client.get(f"/api/admin/mail/{event_message['id']}").json()["counts"], {"accepted": 1})

    def test_youtube_embed_normalization(self):
        live = public_stream({"videoIdOrUrl": "https://youtu.be/abcdefghijk", "status": "Replay Archive"})
        self.assertEqual(live["embedUrl"], "https://www.youtube-nocookie.com/embed/abcdefghijk")
        self.assertIsNone(public_stream({"videoIdOrUrl": "https://evil.example/abcdefghijk"})["embedUrl"])
        with patch.dict(os.environ, {"YOUTUBE_API_KEY": "fake"}), patch("backend.youtube.live_video", return_value=("abcdefghijk", "Service")):
            self.assertEqual(public_stream({})["status"], "LIVE NOW")

    def test_contact_and_prayer_notifications_keep_prayer_details_private(self):
        contact = self.client.post("/api/forms/contact", json={
            "name": "Office visitor", "email": "visitor@example.com",
            "subject": "Visit question", "message": "Can I visit on Sunday?",
        })
        prayer = self.client.post("/api/forms/prayer", json={
            "name": "Private visitor", "email": "private@example.com",
            "category": "Spiritual Growth", "subjectOrTopic": "Sensitive topic",
            "message": "Private prayer text", "isConfidentialToPastorOnly": True,
        })
        self.assertEqual(contact.status_code, 201, contact.text)
        self.assertEqual(prayer.status_code, 201, prayer.text)
        with db() as connection:
            notifications = {
                row["id"]: dict(row) for row in connection.execute(
                    "SELECT * FROM inbox_notifications WHERE id IN (?, ?)",
                    (contact.json()["id"], prayer.json()["id"]),
                )
            }
        contact_mail = notifications[contact.json()["id"]]
        prayer_mail = notifications[prayer.json()["id"]]
        self.assertEqual(contact_mail["recipient"], "admin@rccgdhog.org")
        self.assertEqual(contact_mail["reply_to"], "visitor@example.com")
        self.assertIn("Can I visit on Sunday?", contact_mail["body"])
        self.assertEqual(prayer_mail["recipient"], "admin@rccgdhog.org")
        self.assertIsNone(prayer_mail["reply_to"])
        self.assertNotIn("Private prayer text", prayer_mail["body"])
        self.assertNotIn("Private visitor", prayer_mail["body"])
        with patch("backend.mailer.deliver", return_value="fake-provider-id"):
            while process_one(configuration()) != "idle":
                pass
        self.login()
        history = self.client.get("/api/admin/mail").json()["notifications"]
        for item_id in notifications:
            alert = next(item for item in history if item["id"] == item_id)
            self.assertEqual(alert["state"], "accepted")
            self.assertNotIn("body", alert)

    def test_mail_transports_use_one_envelope_recipient(self):
        job = {"id": str(uuid4()), "audience": "all", "recipient": "only@example.com",
               "subject": "Church event", "body": "Test details", "unsubscribe_token": uuid4().hex}
        sender = "church@example.com"
        with patch("backend.mailer.urlopen", return_value=io.BytesIO(b'{"id":"resend-test-id"}')) as request:
            self.assertEqual(deliver(job, ("resend", sender, "http://localhost:3000")), "resend-test-id")
            payload = json.loads(request.call_args.args[0].data)
            self.assertEqual(payload["to"], [job["recipient"]])
            self.assertIn(job["unsubscribe_token"], payload["text"])
        with patch.dict(os.environ, {"SMTP_HOST": "smtp.example.com", "SMTP_IMPLICIT_TLS": "0"}), patch("backend.mailer.smtplib.SMTP") as smtp:
            deliver(job, ("smtp", sender, "http://localhost:3000"))
            client = smtp.return_value.__enter__.return_value
            client.starttls.assert_called_once()
            message = client.send_message.call_args.args[0]
            self.assertEqual(message["To"], job["recipient"])
            self.assertIsNone(message["Bcc"])
