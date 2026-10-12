import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated

from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models import OrganizationRecord, PilotSessionRecord, PilotUserRecord


@dataclass(frozen=True, slots=True)
class TenantPrincipal:
    user_id: int
    organization_id: int
    email: str
    role: str


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_opaque_token() -> str:
    return secrets.token_urlsafe(32)


def session_expiry() -> datetime:
    return datetime.now(UTC) + timedelta(hours=get_settings().pilot_session_hours)


def invite_expiry() -> datetime:
    return datetime.now(UTC) + timedelta(hours=get_settings().pilot_invite_hours)


def _fernet() -> Fernet:
    settings = get_settings()
    if not settings.pilot_credential_key:
        raise RuntimeError("PILOT_CREDENTIAL_KEY is not configured")
    return Fernet(settings.pilot_credential_key.get_secret_value().encode("ascii"))


def encrypt_credential(value: str) -> str:
    return _fernet().encrypt(value.encode("utf-8")).decode("ascii")


def decrypt_credential(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode("ascii")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Stored credential could not be decrypted") from exc


def require_admin(x_admin_token: Annotated[str | None, Header()] = None) -> None:
    settings = get_settings()
    expected = settings.pilot_admin_token.get_secret_value() if settings.pilot_admin_token else None
    if not expected or not x_admin_token or not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(status_code=401, detail="Invalid pilot admin token")


def require_tenant(
    session: SessionDep,
    authorization: Annotated[str | None, Header()] = None,
) -> TenantPrincipal:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    raw_token = authorization[7:].strip()
    if not raw_token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    record = session.scalar(
        select(PilotSessionRecord).where(PilotSessionRecord.token_hash == hash_token(raw_token))
    )
    now = datetime.now(UTC)
    if not record or record.revoked_at is not None or record.expires_at <= now:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    user = session.get(PilotUserRecord, record.user_id)
    organization = session.get(OrganizationRecord, record.organization_id)
    if not user or not user.active or not organization or not organization.active:
        raise HTTPException(status_code=403, detail="Pilot access disabled")
    if user.organization_id != record.organization_id:
        raise HTTPException(status_code=403, detail="Tenant boundary violation")

    return TenantPrincipal(
        user_id=user.id,
        organization_id=organization.id,
        email=user.email,
        role=user.role,
    )


TenantDep = Annotated[TenantPrincipal, Depends(require_tenant)]
