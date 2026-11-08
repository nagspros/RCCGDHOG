"""Table definitions and persistence for the site's content and settings."""

import json
import re

# Names are fixed here. SQL identifiers never come from API requests.
COLLECTIONS = {
    "services": ("services", "title serviceType date startTime endTime location status theme scriptureAnchor targetAttendance:int actualAttendance:int roster:json orderOfService:json bulletinNotes liveStreamUrl"),
    "sermons": ("sermons", "title preacher date scripture type videoUrl audioDuration summary content:json imageSrc audioUrl series sourceUrl"),
    "gallery": ("gallery_items", "title category categoryLabel imageSrc date description scripture featured:bool"),
    "contactMessages": ("contact_messages", "name email phone subject message submittedAt status internalNotes"),
    "prayers": ("prayer_requests", "type name email phone category subjectOrTopic message submittedAt status pastoralNotes assignedMinister pastorOnly:bool urgency wantsCall:bool preferredContact"),
    "discipleship": ("discipleship_records", "formType fullName email phone address submittedAt status notes assignedFollowUp subscribe:bool waterBaptized"),
    "giving": ("giving_records", "donorName amount:number fund channel date referenceId status"),
    "announcements": ("announcements", "title content category priority isActive:bool publishedDate expiryDate"),
    "archiveEvents": ("archived_events", "title date endDate dateLabel time category summary content:json imageSrc sourceUrl"),
    "recurringPrograms": ("recurring_programmes", "title frequency day time location description badge"),
    "ministries": ("ministries", "name category leaderOrTeam description iconName"),
}
SETTINGS = {
    "liveStream": ("live_stream_settings", "status streamTitle streamSubtitle videoIdOrUrl thumbnailUrl activeServiceType scheduledTime preacher theme scripture viewerCount:int pinnedNotice enableLiveChatNotice:bool"),
    "churchContactConfig": ("church_contact_settings", "phone directoryPhone email sanctuaryAddress mailingAddress youtubeUrl facebookUrl zelleEmail smsGivingNumber officeHours"),
}
TABLES = COLLECTIONS | SETTINGS
COLUMN_TYPES = {"text": "LONGTEXT", "json": "LONGTEXT", "int": "BIGINT", "bool": "INTEGER", "number": "DOUBLE PRECISION"}


def fields(spec):
    for entry in spec.split():
        key, _, kind = entry.partition(":")
        column = "record_type" if key == "type" else re.sub(r"(?<!^)(?=[A-Z])", "_", key).lower()
        yield key, column, kind or "text"


def table_schema():
    statements = [
        """CREATE TABLE IF NOT EXISTS site_state (
            id INTEGER PRIMARY KEY CHECK(id = 1), version INTEGER NOT NULL, last_backup_date TEXT NOT NULL
        )"""
    ]
    for key, (table, spec) in TABLES.items():
        if key in SETTINGS:
            identity = "id INTEGER PRIMARY KEY CHECK(id = 1)"
        elif key == "recurringPrograms":
            identity = "sort_order INTEGER PRIMARY KEY"
        else:
            identity = "id VARCHAR(255) PRIMARY KEY, sort_order INTEGER NOT NULL"
        columns = [f"{column} {COLUMN_TYPES[kind]}" for _, column, kind in fields(spec)]
        statements.append(
            f"CREATE TABLE IF NOT EXISTS {table} (\n    "
            + ",\n    ".join([identity, *columns, "extra_fields LONGTEXT NOT NULL"])
            + "\n)"
        )
    return statements


def column_value(value, kind):
    if kind == "text" and isinstance(value, str):
        return value
    if kind == "int" and type(value) is int and -(2**63) <= value < 2**63:
        return value
    if kind == "bool" and type(value) is bool:
        return int(value)
    if kind == "number" and type(value) in {int, float}:
        return value
    if kind == "json" and value is not None:
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return None


def encode(record, spec, identity):
    remaining = record.copy()
    if "id" in identity and type(identity["id"]) is str:
        remaining.pop("id")
    columns = identity.copy()
    for key, column, kind in fields(spec):
        value = column_value(remaining.get(key), kind)
        columns[column] = value
        if value is not None:
            remaining.pop(key)
    columns["extra_fields"] = json.dumps(remaining, ensure_ascii=False, sort_keys=True)
    return columns


def decode(row, spec, include_id):
    record = json.loads(row["extra_fields"])
    if include_id:
        record["id"] = row["id"]
    for key, column, kind in fields(spec):
        value = row[column]
        if value is not None:
            record[key] = json.loads(value) if kind == "json" else bool(value) if kind == "bool" else value
    return record


def load_content(connection, keys):
    data = {}
    for key in keys:
        table, spec = TABLES[key]
        if key in SETTINGS:
            row = connection.execute(f"SELECT * FROM {table} WHERE id=1").fetchone()
            data[key] = decode(row, spec, False) if row else {}
        else:
            rows = connection.execute(f"SELECT * FROM {table} ORDER BY sort_order").fetchall()
            data[key] = [decode(row, spec, key != "recurringPrograms") for row in rows]
    return data


def save_content(connection, data):
    for key, value in data.items():
        if key not in TABLES:
            continue
        table, spec = TABLES[key]
        if key in SETTINGS:
            records = [encode(value, spec, {"id": 1})]
        elif key == "recurringPrograms":
            records = [encode(row, spec, {"sort_order": index}) for index, row in enumerate(value)]
        else:
            records = [encode(row, spec, {"id": row["id"], "sort_order": index}) for index, row in enumerate(value)]

        primary_key = "sort_order" if key == "recurringPrograms" else "id"
        existing = {row[primary_key]: dict(row) for row in connection.execute(f"SELECT * FROM {table}").fetchall()}
        for record in records:
            identity = record[primary_key]
            current = existing.pop(identity, None)
            if current is None:
                placeholders = ",".join("?" for _ in record)
                connection.execute(f"INSERT INTO {table} ({','.join(record)}) VALUES ({placeholders})", tuple(record.values()))
            elif current != record:
                changes = {column: value for column, value in record.items() if column != primary_key and current[column] != value}
                assignments = ", ".join(f"{column}=?" for column in changes)
                connection.execute(f"UPDATE {table} SET {assignments} WHERE {primary_key}=?", (*changes.values(), identity))
        if existing:
            connection.executemany(f"DELETE FROM {table} WHERE {primary_key}=?", [(identity,) for identity in existing])
