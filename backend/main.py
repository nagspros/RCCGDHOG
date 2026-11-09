import csv
import hashlib
import io
import json
import time
from contextlib import asynccontextmanager
from typing import Annotated
from datetime import datetime
from zoneinfo import ZoneInfo
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from . import auth, models
from .db import ROOT, db, initialize, now, save_site, site_data, within_limit
from .mailer import configuration
from .youtube import public_stream, video_id

Staff = Annotated[dict, Depends(auth.staff)]
COLLECTIONS = ("services", "sermons", "gallery", "contactMessages", "prayers", "discipleship", "giving", "announcements")
IMPORTED_CATALOGS = {"archiveEvents", "recurringPrograms", "ministries"}
PUBLIC_SERVICE_FIELDS = ("id", "title", "serviceType", "date", "startTime", "endTime", "location", "status", "theme", "scriptureAnchor")
MEMBER_FIELDS = "id, email, name, phone, status, subscribed, opted_out, created"


@asynccontextmanager
async def lifespan(_app):
    initialize()
    yield


app = FastAPI(title="RCCG DHOG Church API", lifespan=lifespan, docs_url="/api/docs", openapi_url="/api/openapi.json")
app.post("/api/auth/login")(auth.login)
app.post("/api/auth/logout")(auth.logout)
app.post("/api/auth/credentials")(auth.change_credentials)


@app.exception_handler(RequestValidationError)
async def validation_error(_request, error):
    return JSONResponse({
        "detail": [{"loc": item["loc"], "msg": item["msg"]} for item in error.errors()],
    }, status_code=422)


@app.middleware("http")
async def api_request(request, call_next):
    if not request.url.path.startswith("/api/"):
        return await call_next(request)
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and not request.url.path.startswith("/api/unsubscribe/"):
        # Cross-origin forms cannot add this header and this API does not enable CORS.
        if request.headers.get("X-DHOG-Request") != "1":
            return JSONResponse({"detail": "Missing request header."}, status_code=403)
        size = request.headers.get("content-length", "0")
        if not size.isdecimal() or len(size) > 9 or int(size) > 16_000_000 or request.headers.get("transfer-encoding"):
            return JSONResponse({"detail": "Request is too large."}, status_code=413)
    response = await call_next(request)
    response.headers.setdefault("Cache-Control", "no-store")
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.get("/api/health")
def health():
    with db() as connection:
        connection.execute("SELECT id FROM site_state WHERE id=1").fetchone()
    return {"status": "ok"}


@app.get("/api/auth/me")
def me(account: Staff):
    return account


@app.get("/api/public/site")
def public_site(request: Request):
    with db() as connection:
        _, data = site_data(connection, ("services", "sermons", "gallery", "churchContactConfig",
                                         "announcements", *sorted(IMPORTED_CATALOGS)))
    services = [{key: row.get(key) for key in PUBLIC_SERVICE_FIELDS}
                for row in data["services"] if row.get("status") != "Draft"]
    today = datetime.now(ZoneInfo("America/New_York")).date().isoformat()
    announcements = [row for row in data["announcements"]
                     if row.get("isActive") and row.get("publishedDate", "") <= today
                     and (not row.get("expiryDate") or row["expiryDate"] >= today)]
    for collection in ("sermons", "archiveEvents"):
        for row in data[collection]:
            row.pop("sourceUrl", None)
    response = JSONResponse({"services": services, "sermons": data["sermons"], "gallery": data["gallery"],
                             **{key: data.get(key) for key in sorted(IMPORTED_CATALOGS)},
                             "churchContactConfig": data["churchContactConfig"], "announcements": announcements})
    etag = '"' + hashlib.sha256(response.body).hexdigest() + '"'
    headers = {"ETag": etag, "Cache-Control": "public, no-cache"}
    if request.headers.get("If-None-Match") == etag:
        return HTMLResponse(status_code=304, headers=headers)
    response.headers.update(headers)
    return response


@app.get("/api/public/live")
def live():
    with db() as connection:
        _, data = site_data(connection, ("liveStream",))
    return public_stream(data["liveStream"])


def visible_state(data, account):
    if account["role"] == "pastor":
        return data
    return {**data, "prayers": [row for row in data["prayers"] if not row.get("pastorOnly")]}


@app.get("/api/admin/site")
def admin_site(account: Staff):
    with db() as connection:
        version, data = site_data(connection)
    return {"version": version, "data": visible_state(data, account)}


@app.put("/api/admin/site")
def update_site(update: models.SiteUpdate, account: Staff):
    data = update.data
    if set(data) - IMPORTED_CATALOGS != {*COLLECTIONS, "liveStream", "churchContactConfig", "lastBackupDate"}:
        raise HTTPException(422, "Invalid site data fields.")
    for key in COLLECTIONS:
        items = data[key]
        if not isinstance(items, list) or any(
            not isinstance(row, dict) or not isinstance(row.get("id"), str) or not 1 <= len(row["id"]) <= 255
            for row in items
        ):
            raise HTTPException(422, f"Invalid {key} collection.")
        if len({row["id"] for row in items}) != len(items):
            raise HTTPException(422, f"Duplicate IDs in {key}.")
    if not isinstance(data["liveStream"], dict) or not isinstance(data["churchContactConfig"], dict) or not isinstance(data["lastBackupDate"], str):
        raise HTTPException(422, "Invalid site settings.")
    source = data["liveStream"].get("videoIdOrUrl")
    if source and not video_id(source):
        raise HTTPException(422, "Enter a YouTube video ID or a YouTube video link.")
    with db(write=True) as connection:
        version, previous = site_data(connection)
        if version != update.version:
            raise HTTPException(409, "The site changed since you opened it. Reload the console and retry.")
        for catalog in IMPORTED_CATALOGS:
            data.pop(catalog, None)
            if catalog in previous:
                data[catalog] = previous[catalog]
        if account["role"] != "pastor":
            private = [row for row in previous["prayers"] if row.get("pastorOnly")]
            if {row["id"] for row in private} & {row["id"] for row in data["prayers"]}:
                raise HTTPException(403, "Restricted pastoral request.")
            data["prayers"] += private
        changes = {key: value for key, value in data.items() if previous.get(key) != value}
        version = save_site(connection, version, changes)
    return {"version": version, "data": visible_state(data, account)}


def submission_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not within_limit(f"forms:{ip}", 25, 600):
        raise HTTPException(429, "Too many submissions. Try again in a few minutes.")


def insert_member(connection, item):
    if connection.execute("SELECT id FROM members WHERE email=?", (item.email.lower(),)).fetchone():
        return 0
    return connection.execute(
        """INSERT INTO members (id,email,name,phone,status,subscribed,unsubscribe_token,created)
           VALUES (?,?,?,?,?,?,?,?)""",
        (str(uuid4()), item.email.lower(), item.name, item.phone, item.status,
         int(item.subscribed), uuid4().hex, now()),
    ).rowcount


def save_form(kind, item):
    row = {"id": str(uuid4()), "submittedAt": now(), **item.model_dump(mode="json")}
    with db(write=True) as connection:
        collection = {"contact": "contactMessages", "prayer": "prayers",
                      "ask-pastor": "prayers", "connect": "discipleship"}.get(kind)
        if collection is None:
            connection.execute("INSERT INTO submissions (id,kind,created,data) VALUES (?,?,?,?)",
                               (row["id"], kind, row["submittedAt"], json.dumps(row)))
            return row
        version, data = site_data(connection, (collection,))
        if kind == "contact":
            row["status"] = "Unread"
            data["contactMessages"].insert(0, row)
        elif kind in {"prayer", "ask-pastor"}:
            if kind == "ask-pastor":
                row.update(category="Theological / Doctrine", subjectOrTopic=row.pop("topic"),
                           type="Ask the Pastor", pastorOnly=True)
            else:
                row.update(type="Prayer Request", pastorOnly=row.pop("isConfidentialToPastorOnly"))
            row["status"] = "In Prayer Altar"
            row["assignedMinister"] = "Pastor Remi Afolabi" if row["pastorOnly"] else "Prayer Team"
            row["pastoralNotes"] = " · ".join(filter(None, [
                row.get("urgency"), "Requests a call" if row.get("wantsCall") else None,
            ]))
            data["prayers"].insert(0, row)
        elif kind == "connect":
            row["status"] = "Pending Contact"
            data["discipleship"].insert(0, row)
            if item.formType == "Membership":
                insert_member(connection, models.Member(name=item.fullName, email=item.email,
                                                        phone=item.phone, status="pending", subscribed=item.subscribe))
        save_site(connection, version, data)
        if kind in {"contact", "prayer"}:
            if kind == "contact":
                subject = "New Contact Us message"
                body = (f"Name: {row['name']}\nEmail: {row['email']}\n"
                        f"Phone: {row['phone'] or 'Not provided'}\nTopic: {row['subject']}\n\n{row['message']}")
                reply_to = row["email"]
            else:
                subject = "New prayer request"
                body = ("A new prayer request is available in the staff dashboard. "
                        "Sign in with the appropriate staff account to review it.")
                reply_to = None
            connection.execute(
                """INSERT INTO inbox_notifications (id, created, recipient, reply_to, subject, body)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (row["id"], row["submittedAt"], auth.DEFAULT_STAFF_EMAIL, reply_to, subject, body),
            )
    return row


@app.post("/api/forms/contact", status_code=201, dependencies=[Depends(submission_limit)])
def contact(item: models.Contact):
    return save_form("contact", item)


@app.post("/api/forms/prayer", status_code=201, dependencies=[Depends(submission_limit)])
def prayer(item: models.Prayer):
    return save_form("prayer", item)


@app.post("/api/forms/ask-pastor", status_code=201, dependencies=[Depends(submission_limit)])
def ask_pastor(item: models.AskPastor):
    return save_form("ask-pastor", item)


@app.post("/api/forms/connect", status_code=201, dependencies=[Depends(submission_limit)])
def connect(item: models.Connect):
    return save_form("connect", item)


@app.post("/api/forms/visit", status_code=201, dependencies=[Depends(submission_limit)])
def visit(item: models.Visit):
    return save_form("visit", item)


@app.post("/api/forms/ride", status_code=201, dependencies=[Depends(submission_limit)])
def ride(item: models.Ride):
    return save_form("ride", item)


@app.post("/api/forms/ministry", status_code=201, dependencies=[Depends(submission_limit)])
def ministry(item: models.Ministry):
    return save_form("ministry", item)


@app.get("/api/admin/submissions")
def submissions(account: Staff):
    with db() as connection:
        rows = connection.execute("SELECT * FROM submissions ORDER BY created DESC").fetchall()
    return [{"id": row["id"], "kind": row["kind"], "status": row["status"], "data": json.loads(row["data"])} for row in rows]


@app.patch("/api/admin/submissions/{item_id}")
def update_submission(item_id: UUID, item: models.SubmissionUpdate, account: Staff):
    with db(write=True) as connection:
        if not connection.execute("UPDATE submissions SET status=? WHERE id=?", (item.status, str(item_id))).rowcount:
            raise HTTPException(404, "Submission not found.")
    return {"status": item.status}


@app.get("/api/admin/members")
def members(account: Staff):
    with db() as connection:
        return [dict(row) for row in connection.execute(f"SELECT {MEMBER_FIELDS} FROM members ORDER BY name, email")]


@app.post("/api/admin/members", status_code=201)
def add_member(item: models.Member, account: Staff):
    with db(write=True) as connection:
        if not insert_member(connection, item):
            raise HTTPException(409, "A member with this email is already registered.")
    return {"email": item.email}


@app.patch("/api/admin/members/{item_id}")
def edit_member(item_id: UUID, item: models.MemberUpdate, account: Staff):
    with db(write=True) as connection:
        changed = connection.execute(
            """UPDATE members SET name=?, phone=?, status=?,
               subscribed=CASE WHEN opted_out=1 THEN 0 ELSE ? END WHERE id=?""",
            (item.name, item.phone, item.status, int(item.subscribed), str(item_id)),
        ).rowcount
        if not changed:
            raise HTTPException(404, "Member not found.")
    return {"updated": True}


@app.post("/api/admin/members/import")
def import_members(item: models.MemberImport, account: Staff):
    reader = csv.DictReader(io.StringIO(item.csv.lstrip("\ufeff")), strict=True)
    batch = []
    try:
        headers = set(reader.fieldnames or [])
        if not {"name", "email"} <= headers or headers - {"name", "email", "phone", "status", "subscribed"}:
            raise HTTPException(422, "CSV needs name,email and may include phone,status,subscribed.")
        for row in reader:
            if len(batch) == 2000:
                raise HTTPException(422, "Import up to 2,000 members at a time.")
            if None in row:
                raise HTTPException(422, f"Too many columns on CSV line {reader.line_num}.")
            try:
                batch.append(models.Member(name=row["name"], email=row["email"], phone=row.get("phone") or "",
                                           status=row.get("status") or "active", subscribed=row.get("subscribed") or False))
            except ValidationError:
                raise HTTPException(422, f"Invalid member on CSV line {reader.line_num}.") from None
    except csv.Error:
        raise HTTPException(422, f"Invalid CSV near line {reader.line_num}.") from None
    with db(write=True) as connection:
        added = sum(insert_member(connection, row) for row in batch)
    return {"added": added, "duplicates": len(batch) - added}


def campaign_summary(connection, campaign_id=None):
    where = "WHERE c.id=?" if campaign_id else ""
    rows = connection.execute(
        f"""SELECT c.id, c.created, c.subject, c.audience, c.due, d.state, COUNT(d.id) AS count
            FROM campaigns c LEFT JOIN deliveries d ON d.campaign_id=c.id
            {where} GROUP BY c.id, c.created, c.subject, c.audience, c.due, d.state ORDER BY c.created DESC""",
        (campaign_id,) if campaign_id else (),
    ).fetchall()
    campaigns = {}
    for row in rows:
        summary = campaigns.setdefault(row["id"], {
            key: row[key] for key in ("id", "created", "subject", "audience", "due")
        } | {"counts": {}})
        if row["state"]:
            summary["counts"][row["state"]] = row["count"]
    return list(campaigns.values())


@app.get("/api/admin/mail")
def mail_history(account: Staff):
    with db() as connection:
        history = campaign_summary(connection)
        notifications = connection.execute(
            "SELECT id, created, subject, state, error FROM inbox_notifications ORDER BY created DESC, id DESC LIMIT 50"
        ).fetchall()
    return {"configured": configuration() is not None, "campaigns": history,
            "notifications": [dict(row) for row in notifications]}


@app.get("/api/admin/mail/{campaign_id}")
def mail_details(campaign_id: UUID, account: Staff):
    with db() as connection:
        summary = campaign_summary(connection, str(campaign_id))
        if not summary:
            raise HTTPException(404, "Campaign not found.")
        deliveries = connection.execute(
            "SELECT recipient,state,provider_id,error FROM deliveries WHERE campaign_id=? ORDER BY recipient",
            (str(campaign_id),),
        ).fetchall()
    return {**summary[0], "deliveries": [dict(row) for row in deliveries]}


@app.post("/api/admin/mail", status_code=202)
def queue_mail(item: models.Campaign, account: Staff):
    campaign_id = str(item.id)
    fingerprint = hashlib.sha256(item.model_dump_json().encode()).hexdigest()
    with db(write=True) as connection:
        existing = connection.execute("SELECT fingerprint FROM campaigns WHERE id=?", (campaign_id,)).fetchone()
        if existing:
            if existing["fingerprint"] != fingerprint:
                raise HTTPException(409, "This mailing ID was already used for different content.")
            return campaign_summary(connection, campaign_id)[0]
        if not configuration():
            raise HTTPException(503, "Mail is not configured. Set up Resend or SMTP on the server.")
        if item.audience == "member":
            recipients = connection.execute("SELECT id,email FROM members WHERE id=? AND status='active'", (str(item.memberId),)).fetchall()
        else:
            recipients = connection.execute("SELECT id,email FROM members WHERE status='active' AND subscribed=1 AND opted_out=0").fetchall()
        if not recipients:
            raise HTTPException(422, "There are no eligible recipients.")
        body = item.body
        if item.eventId:
            _, data = site_data(connection, ("services",))
            event = next((row for row in data["services"] if row["id"] == item.eventId and row["status"] != "Draft"), None)
            if not event:
                raise HTTPException(422, "Choose a published church event.")
            details = "\n".join(str(event[key]) for key in ("title", "date", "startTime", "location") if event.get(key))
            body += "\n\nEvent details\n" + details
        due = int(item.sendAt.timestamp()) if item.sendAt else int(time.time())
        connection.execute("INSERT INTO campaigns VALUES (?,?,?,?,?,?,?,?)",
                           (campaign_id, now(), account["email"], item.subject, body, item.audience, due, fingerprint))
        connection.executemany("INSERT INTO deliveries (id,campaign_id,member_id,recipient) VALUES (?,?,?,?)",
                               [(str(uuid4()), campaign_id, row["id"], row["email"]) for row in recipients])
        return campaign_summary(connection, campaign_id)[0]


@app.post("/api/admin/mail/{campaign_id}/cancel")
def cancel_mail(campaign_id: UUID, account: Staff):
    with db(write=True) as connection:
        if not campaign_summary(connection, str(campaign_id)):
            raise HTTPException(404, "Campaign not found.")
        count = connection.execute("UPDATE deliveries SET state='cancelled' WHERE campaign_id=? AND state='queued'",
                                   (str(campaign_id),)).rowcount
    return {"cancelled": count}


@app.get("/api/unsubscribe/{token}", response_class=HTMLResponse)
def unsubscribe_page(token: UUID):
    return """<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribe from DHOG updates</title>
    <h1>Unsubscribe from church updates</h1><form method="post"><button>Unsubscribe</button></form></html>"""


@app.post("/api/unsubscribe/{token}", response_class=HTMLResponse)
def unsubscribe(token: UUID):
    with db(write=True) as connection:
        connection.execute("UPDATE members SET subscribed=0,opted_out=1 WHERE unsubscribe_token=?", (token.hex,))
    return """<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribed</title>
    <h1>You are unsubscribed from church updates.</h1></html>"""


if (ROOT / "dist/index.html").is_file():
    app.mount("/assets", StaticFiles(directory=ROOT / "dist/assets"), name="assets")

    @app.get("/{section}/{path:path}", include_in_schema=False)
    @app.get("/{section}", include_in_schema=False)
    def website_route(section: str, path: str = ""):
        if section not in {
            "about", "ministries", "programmes", "programs", "sermons",
            "events", "visit", "prayer", "ask-pastor", "give", "contact", "connect", "watch", "gallery", "admin",
        }:
            raise HTTPException(404)
        return FileResponse(ROOT / "dist/index.html", media_type="text/html")

    @app.get("/", include_in_schema=False)
    def website_home():
        return FileResponse(ROOT / "dist/index.html", media_type="text/html")
