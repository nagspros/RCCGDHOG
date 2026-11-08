import json
import os
import sqlite3
import ssl
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlsplit

from dotenv import load_dotenv

from .content_store import TABLES, load_content, save_content, table_schema

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

SCHEMA = """
CREATE TABLE IF NOT EXISTS admin (
    email VARCHAR(320) PRIMARY KEY, password VARCHAR(200) NOT NULL,
    role VARCHAR(16) NOT NULL CHECK(role IN ('admin', 'pastor'))
);
CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(64) PRIMARY KEY, email VARCHAR(320) NOT NULL,
    expires BIGINT NOT NULL, FOREIGN KEY(email) REFERENCES admin(email) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS limits (
    bucket VARCHAR(400) NOT NULL, window_start BIGINT NOT NULL, count INTEGER NOT NULL,
    PRIMARY KEY(bucket, window_start)
);
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY, kind VARCHAR(24) NOT NULL, created VARCHAR(40) NOT NULL, data LONGTEXT NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'New'
);
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(36) PRIMARY KEY, email VARCHAR(320) NOT NULL UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL,
    status VARCHAR(24) NOT NULL CHECK(status IN ('pending','active','inactive')),
    subscribed INTEGER NOT NULL, opted_out INTEGER NOT NULL DEFAULT 0,
    unsubscribe_token VARCHAR(64) NOT NULL UNIQUE, created VARCHAR(40) NOT NULL
);
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY, created VARCHAR(40) NOT NULL, created_by VARCHAR(320) NOT NULL,
    subject TEXT NOT NULL, body TEXT NOT NULL,
    audience VARCHAR(16) NOT NULL CHECK(audience IN ('member','all')),
    due BIGINT NOT NULL, fingerprint TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(36) PRIMARY KEY, campaign_id VARCHAR(36) NOT NULL,
    member_id VARCHAR(36) NOT NULL, recipient VARCHAR(320) NOT NULL,
    state VARCHAR(24) NOT NULL DEFAULT 'queued',
    started BIGINT, provider_id TEXT, error TEXT,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id)
);
CREATE TABLE IF NOT EXISTS inbox_notifications (
    id VARCHAR(36) PRIMARY KEY, created VARCHAR(40) NOT NULL,
    recipient VARCHAR(320) NOT NULL, reply_to VARCHAR(320),
    subject VARCHAR(180) NOT NULL, body TEXT NOT NULL,
    state VARCHAR(24) NOT NULL DEFAULT 'queued',
    started BIGINT, provider_id TEXT, error TEXT
);

"""


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class PostgresConnection:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, query, parameters=()):
        return self.connection.execute(query.replace("?", "%s"), parameters)

    def executemany(self, query, parameters):
        with self.connection.cursor() as cursor:
            cursor.executemany(query.replace("?", "%s"), parameters)


@contextmanager
def postgres(write=False, create=False):
    import psycopg
    from psycopg.rows import dict_row

    # Use a schema outside Supabase's public Data API and serialize the short
    # write transactions the same way SQLite's BEGIN IMMEDIATE does.
    with psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row, connect_timeout=8) as connection:
        if write:
            connection.execute("SELECT pg_advisory_xact_lock(687445720301)")
        else:
            connection.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        if create:
            connection.execute("CREATE SCHEMA IF NOT EXISTS dhog")
            connection.execute("REVOKE ALL ON SCHEMA dhog FROM PUBLIC")
        connection.execute("SET LOCAL search_path TO dhog, pg_catalog")
        yield PostgresConnection(connection)


def database_mode():
    mode = os.getenv("DHOG_DB_MODE", "supabase").lower()
    if mode not in {"supabase", "mysql", "sqlite"}:
        raise RuntimeError("DHOG_DB_MODE must be supabase, mysql, or sqlite.")
    if mode == "supabase" and not os.getenv("DATABASE_URL"):
        raise RuntimeError("Set DATABASE_URL to the Supabase Postgres connection string.")
    if mode == "mysql" and not os.getenv("MYSQL_URL"):
        raise RuntimeError("Set MYSQL_URL to the MySQL connection string.")
    return mode


class MysqlConnection:
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, query, parameters=()):
        self.cursor.execute(query.replace("?", "%s"), parameters)
        return self.cursor

    def executemany(self, query, parameters):
        self.cursor.executemany(query.replace("?", "%s"), parameters)


@contextmanager
def mysql(write=False):
    import pymysql
    from pymysql.constants import CLIENT

    url = urlsplit(os.environ["MYSQL_URL"])
    if url.scheme != "mysql" or not url.hostname or not url.username or not url.path.strip("/") or url.query or url.fragment:
        raise RuntimeError("MYSQL_URL must use mysql://user:password@host:port/database.")
    use_tls = os.getenv("MYSQL_TLS", "1") != "0"
    tls = ssl.create_default_context(cafile=os.getenv("MYSQL_SSL_CA")) if use_tls else None
    database = unquote(url.path.lstrip("/"))
    connection = pymysql.connect(
        host=url.hostname, port=url.port or 3306, user=unquote(url.username),
        password=unquote(url.password or ""), database=database, charset="utf8mb4",
        ssl=tls, ssl_disabled=not use_tls, cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=8, read_timeout=15, write_timeout=15, client_flag=CLIENT.FOUND_ROWS,
    )
    try:
        with connection.cursor() as cursor:
            adapter = MysqlConnection(cursor)
            if not write:
                adapter.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
            if write:
                lock = "dhog:" + database
                if len(lock) > 64:
                    raise RuntimeError("Use a MySQL database name shorter than 60 characters.")
                if adapter.execute("SELECT GET_LOCK(?, 10) AS acquired", (lock,)).fetchone()["acquired"] != 1:
                    raise RuntimeError("The MySQL database is busy.")
            yield adapter
        if write:
            connection.commit()
    finally:
        connection.close()


@contextmanager
def db(write=False):
    mode = database_mode()
    if mode in {"supabase", "mysql"}:
        driver = postgres if mode == "supabase" else mysql
        with driver(write=write) as connection:
            yield connection
        return

    path = Path(os.getenv("DHOG_DATABASE", str(ROOT / "backend/data/church.sqlite3"))).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    try:
        connection.execute("BEGIN IMMEDIATE" if write else "BEGIN")
        yield connection
        if write:
            connection.commit()
    finally:
        connection.close()


def initialize():
    seed_data = json.loads((ROOT / "backend/seed.json").read_text())
    archive = json.loads((ROOT / "src/data/legacyArchive.json").read_text())
    seed_data.update(sermons=archive["sermons"], archiveEvents=archive["events"],
                     recurringPrograms=archive["recurringPrograms"], ministries=archive["ministries"])
    mode = database_mode()
    if mode == "sqlite":
        with db() as connection:
            connection.rollback()
            connection.execute("PRAGMA journal_mode=WAL")
    context = postgres(write=True, create=True) if mode == "supabase" else db(write=True)
    schema = SCHEMA if mode == "mysql" else SCHEMA.replace("LONGTEXT", "TEXT")
    with context as connection:
        if mode == "sqlite":
            tables = connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('staff', 'admin', 'site', 'site_legacy_backup')"
            ).fetchall()
        else:
            schema_expression = "current_schema()" if mode == "supabase" else "DATABASE()"
            tables = connection.execute(
                f"""SELECT table_name AS name FROM information_schema.tables
                    WHERE table_schema={schema_expression} AND table_name IN ('staff', 'admin', 'site', 'site_legacy_backup')"""
            ).fetchall()
        table_names = {row["name"] for row in tables}
        if "staff" in table_names:
            if "admin" in table_names:
                raise RuntimeError("Both staff and admin tables exist. Resolve the conflict before starting the API.")
            connection.execute("ALTER TABLE staff RENAME TO admin")

        statements = schema.split(";") + table_schema()
        for statement in statements:
            if statement.strip():
                connection.execute(statement if mode == "mysql" else statement.replace("LONGTEXT", "TEXT"))
        if mode == "mysql":
            index = connection.execute("SHOW INDEX FROM deliveries WHERE Key_name='delivery_state'").fetchone()
            if not index:
                connection.execute("CREATE INDEX delivery_state ON deliveries(state, campaign_id)")
        else:
            connection.execute("CREATE INDEX IF NOT EXISTS delivery_state ON deliveries(state, campaign_id)")
        if not connection.execute("SELECT id FROM site_state WHERE id=1").fetchone():
            legacy = connection.execute("SELECT version, data FROM site WHERE id=1").fetchone() if "site" in table_names else None
            original = json.loads(legacy["data"]) if legacy else {}
            if set(original) - {*TABLES, "lastBackupDate"}:
                raise RuntimeError("The legacy site contains unrecognized data. Review it before migration.")
            content = seed_data | original
            save_content(connection, content)
            connection.execute(
                "INSERT INTO site_state (id, version, last_backup_date) VALUES (1, ?, ?)",
                ((legacy["version"] + 1) if legacy else 1, content.get("lastBackupDate", "")),
            )
        if "site" in table_names and "site_legacy_backup" not in table_names:
            connection.execute("ALTER TABLE site RENAME TO site_legacy_backup")


def site_data(connection, keys=None):
    state = connection.execute("SELECT version, last_backup_date FROM site_state WHERE id=1").fetchone()
    data = load_content(connection, TABLES if keys is None else keys)
    if keys is None:
        data["lastBackupDate"] = state["last_backup_date"]
    return state["version"], data


def save_site(connection, version, data):
    save_content(connection, data)
    if "lastBackupDate" in data:
        connection.execute("UPDATE site_state SET version=?, last_backup_date=? WHERE id=1",
                           (version + 1, data["lastBackupDate"]))
    else:
        connection.execute("UPDATE site_state SET version=? WHERE id=1", (version + 1,))
    return version + 1


def within_limit(bucket, maximum, seconds):
    timestamp = int(time.time())
    window = timestamp // seconds * seconds
    with db(write=True) as connection:
        connection.execute("DELETE FROM limits WHERE window_start < ?", (timestamp - 86400,))
        row = connection.execute(
            "SELECT count FROM limits WHERE bucket=? AND window_start=?", (bucket, window),
        ).fetchone()
        count = (row["count"] if row else 0) + 1
        if row:
            connection.execute("UPDATE limits SET count=? WHERE bucket=? AND window_start=?", (count, bucket, window))
        else:
            connection.execute("INSERT INTO limits VALUES (?, ?, ?)", (bucket, window, count))
    return count <= maximum
