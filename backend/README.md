# DHOG FastAPI backend

FastAPI serves the public forms, staff console, member directory, mail queue, announcements, service schedule, gallery, sermons, giving ledger, and YouTube player settings. The browser uses the same-origin `/api` routes. It never needs a database credential.

## Set up the database

From the project root:

```sh
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
cp .env.example .env
```

Edit the ignored root `.env` locally or set the variables in your host's secret manager.

| `DHOG_DB_MODE` | Connection | Setup |
| --- | --- | --- |
| `supabase` (default) | `DATABASE_URL` | Copy the **Session pooler** connection string from the project's **Connect** panel, enter the database password, and add `?sslmode=require` (or `&sslmode=require` if the URI already has a query). FastAPI initializes its own `dhog` schema outside the public Data API. |
| `mysql` | `MYSQL_URL` | Create a dedicated MySQL 8+ database first. Use `mysql://user:password@host:3306/database`. TLS is on by default. Set `MYSQL_SSL_CA` if your server uses a private CA. For a disposable local database only, use `MYSQL_TLS=0` if needed. |
| `sqlite` | `DHOG_DATABASE` (optional) | Local development mode. Defaults to `backend/data/church.sqlite3`. |

Encode special characters in connection-string passwords. The Supabase project URL and API keys are for the Data API. This app connects to Postgres and needs the database connection string. [Supabase connection instructions](https://supabase.com/docs/guides/database/connecting-to-postgres)

To install the schema from the Supabase dashboard, run [setup.sql](supabase/setup.sql) in SQL Editor. The script preserves existing records. FastAPI seeds the site's initial content when it first connects to an empty schema.

Site content is stored in the private `dhog` schema. Sermons, archived events, gallery items, recurring programmes, ministries, and other collections each have their own table. `site_state` tracks the content revision and backup date. If the installer finds an older `site` table, it migrates its records and keeps the original as `site_legacy_backup` for rollback. Restart FastAPI with the updated code after migrating an existing database.

Restart both the API and the mail worker after changing databases. Each database has its own staff accounts, site records, member directory, and queue. Changing the driver does not copy records. Use a dedicated database or schema and a role with permission to create and write the app's tables.

## Run the site and create staff accounts

```sh
backend/.venv/bin/python -m backend.auth
backend/.venv/bin/python -m backend.auth pastor@example.com --role pastor
backend/.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

The account command defaults to `admin@rccgdhog.org` and prompts for a password without echoing it. Re-running it for an account changes its password and revokes its sessions. Use the pastor role only for staff who may see pastor-only prayer requests and questions.

Run `npm run dev` in a second terminal for frontend development. Vite proxies `/api` to port 8000. Alternatively, run `npm run build` before starting FastAPI to serve the built website and API together on port 8000. The staff console is at `/#/admin`, and API documentation is at `/api/docs`. API mutations require the header `X-DHOG-Request: 1`.

When hosting, route the website and `/api` through the same HTTPS origin. Set `DHOG_SECURE_COOKIE=1` and `PUBLIC_SITE_URL` to that origin. Keep the API and mail worker on a persistent host, with both using the same database.

The first run includes the site's existing public content and draft service templates. It starts with empty membership, private submissions, and giving records. The previous browser-local demo data is not imported.

## Members and email

Open **Staff Admin → Members & Mailing**. Add members individually or import a CSV with `name,email` and optional `phone,status,subscribed` columns. Public membership applications arrive as pending. Review and activate the applicant in the member directory. Select bulk email opt-in only for people who agreed to receive updates.

Set `MAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `MAIL_FROM` with a verified sender. For SMTP, set `MAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `MAIL_FROM`. Use STARTTLS on port 587, or set `SMTP_IMPLICIT_TLS=1` for port 465. Set `PUBLIC_SITE_URL` so unsubscribe links lead to the site.

```sh
backend/.venv/bin/python -m backend.mailer
```

Run one worker continuously, or use `--once` to process due mail and exit. Staff can send a private note to one active member, mail all opted-in active members, or include a published service's event details. The composer supports scheduling, recipient review, and cancellation of mail still in the queue. Bulk recipients receive separate messages with an unsubscribe link. **Accepted** means the provider accepted a message. For an **uncertain** result, check the provider before resending.

The composer includes editable templates for Contact Us follow-ups, prayer follow-ups, sermon broadcasts, event invitations, and service reminders. Contact and prayer submissions appear in the staff dashboard and queue a branded alert to `admin@rccgdhog.org`. Contact alerts include the message and set Reply-To to the submitter. Prayer alerts link to the dashboard and omit the submitter and prayer details. The worker sends these alerts using the same provider as member email.

## YouTube and church events

In **Live Stream Manager**, save a YouTube video ID or a watch/live link. The Watch page refreshes the player settings automatically and offers church recordings when no broadcast is configured. To discover public embeddable live broadcasts automatically, configure `YOUTUBE_API_KEY` with YouTube Data API v3 enabled and `YOUTUBE_CHANNEL_ID`. Discovery is cached to limit API usage. Create and start the actual broadcast in YouTube Studio.

In **Services**, change a service from Draft to Scheduled to show it under **Upcoming church events**. In **Parish Announcements**, set publication dates to show notices on the homepage. The Giving page lists the church’s Zelle and SMS giving options. Staff can record confirmed gifts in the ledger.

## Checks

```sh
backend/.venv/bin/python -m unittest backend.test_api -v
npm run lint
npm run build
```

The integration tests use a temporary SQLite database by default and mock email and YouTube provider calls. To run the same suite on Postgres or MySQL, set `DHOG_TEST_DB_MODE` and the matching connection variable for a disposable database. The test suite writes fixture records.
