import getpass
import hashlib
import hmac
import os
import secrets
import time
from argparse import ArgumentParser

from fastapi import HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

from .db import db, initialize, within_limit

COOKIE = "dhog_staff"
DEFAULT_STAFF_EMAIL = "admin@rccgdhog.org"
SESSION_SECONDS = 8 * 60 * 60


class Login(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=512)


class CredentialChange(BaseModel):
    email: EmailStr
    currentPassword: str = Field(min_length=1, max_length=512)
    newPassword: str | None = Field(default=None, min_length=12, max_length=512)


def password_digest(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1).hex()


def hash_password(password):
    salt = secrets.token_bytes(16)
    return f"{salt.hex()}:{password_digest(password, salt)}"


def password_matches(password, stored):
    salt, expected = stored.split(":") if stored else ("00" * 16, "0" * 128)
    return hmac.compare_digest(password_digest(password, bytes.fromhex(salt)), expected)


def session_digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def session_account(connection, token):
    account = connection.execute(
        """SELECT admin.email, admin.role, admin.password FROM sessions JOIN admin USING(email)
           WHERE token=? AND expires>?""",
        (session_digest(token), int(time.time())),
    ).fetchone()
    if not account:
        raise HTTPException(401, "Staff sign-in required.")
    return account


def staff(request: Request):
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(401, "Staff sign-in required.")
    with db() as connection:
        account = session_account(connection, token)
    return {"email": account["email"], "role": account["role"]}


def login(data: Login, request: Request, response: Response):
    email = data.email.lower()
    ip = request.client.host if request.client else "unknown"
    if not within_limit(f"login-ip:{ip}", 30, 900) or not within_limit(f"login-account:{email}", 8, 900):
        raise HTTPException(429, "Too many sign-in attempts. Try again later.")
    with db() as connection:
        account = connection.execute("SELECT * FROM admin WHERE email=?", (email,)).fetchone()
    stored = account["password"] if account else None
    if not password_matches(data.password, stored) or not account:
        raise HTTPException(401, "Invalid email or password.")
    token = secrets.token_urlsafe(32)
    timestamp = int(time.time())
    with db(write=True) as connection:
        account = connection.execute("SELECT role, password FROM admin WHERE email=?", (email,)).fetchone()
        if not account or account["password"] != stored:
            raise HTTPException(401, "Invalid email or password.")
        connection.execute("DELETE FROM sessions WHERE expires<=?", (timestamp,))
        connection.execute("INSERT INTO sessions VALUES (?, ?, ?)", (session_digest(token), email, timestamp + SESSION_SECONDS))
    response.set_cookie(COOKIE, token, max_age=SESSION_SECONDS, httponly=True,
                        secure=os.getenv("DHOG_SECURE_COOKIE", "0") == "1", samesite="strict", path="/api")
    return {"email": email, "role": account["role"]}


def change_credentials(data: CredentialChange, request: Request, response: Response):
    token = request.cookies.get(COOKIE, "")
    account = staff(request)
    if not within_limit(f"credentials:{account['email']}", 8, 900):
        raise HTTPException(429, "Too many attempts. Try again later.")
    email = data.email.lower()
    with db(write=True) as connection:
        current = session_account(connection, token)
        if not password_matches(data.currentPassword, current["password"]):
            raise HTTPException(403, "The current password is incorrect.")
        if email == current["email"] and data.newPassword is None:
            raise HTTPException(400, "Enter a new sign-in email or password.")
        if email != current["email"] and connection.execute("SELECT email FROM admin WHERE email=?", (email,)).fetchone():
            raise HTTPException(409, "That email is already used by a staff account.")
        digest = hash_password(data.newPassword) if data.newPassword else current["password"]
        connection.execute("DELETE FROM sessions WHERE email=?", (current["email"],))
        connection.execute("UPDATE admin SET email=?, password=? WHERE email=?", (email, digest, current["email"]))
    response.delete_cookie(COOKIE, path="/api")
    return {"email": email}


def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE)
    if token:
        with db(write=True) as connection:
            connection.execute("DELETE FROM sessions WHERE token=?", (session_digest(token),))
    response.delete_cookie(COOKIE, path="/api")
    return {"signedOut": True}


def main():
    parser = ArgumentParser(description="Create a staff account or reset its password and role.")
    parser.add_argument("email", nargs="?", default=DEFAULT_STAFF_EMAIL)
    parser.add_argument("--role", choices=["admin", "pastor"], default="admin")
    args = parser.parse_args()
    password = getpass.getpass("Password (at least 12 characters): ")
    if not 12 <= len(password) <= 512 or password != getpass.getpass("Confirm password: "):
        parser.error("Passwords must match and contain 12–512 characters.")
    email = Login(email=args.email, password=password).email.lower()
    initialize()
    with db(write=True) as connection:
        digest = hash_password(password)
        if connection.execute("SELECT email FROM admin WHERE email=?", (email,)).fetchone():
            connection.execute("UPDATE admin SET password=?, role=? WHERE email=?", (digest, args.role, email))
        else:
            connection.execute("INSERT INTO admin VALUES (?, ?, ?)", (email, digest, args.role))
        connection.execute("DELETE FROM sessions WHERE email=?", (email,))
    print(f"Configured {args.role} account {email}.")


if __name__ == "__main__":
    main()
