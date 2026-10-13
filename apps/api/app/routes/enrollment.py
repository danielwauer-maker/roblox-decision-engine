import re
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models import (
    OrganizationRecord,
    PilotApplicationRecord,
    PilotInviteRecord,
    PilotLoginLinkRecord,
    PilotSessionRecord,
    PilotUserRecord,
)
from app.services.notifications import send_notification_once
from app.tenant_security import (
    hash_token,
    invite_expiry,
    new_opaque_token,
    require_admin,
    session_expiry,
)

router = APIRouter(prefix="/v1/enrollment", tags=["enrollment"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class ApplicationCreate(BaseModel):
    contact_name: str = Field(min_length=2, max_length=160)
    email: str = Field(min_length=5, max_length=254)
    studio_name: str = Field(min_length=2, max_length=160)
    experience_url: str | None = Field(default=None, max_length=500)
    universe_id: str | None = Field(default=None, max_length=64, pattern=r"^[0-9]*$")
    monthly_active_users: str | None = Field(default=None, max_length=64)
    message: str | None = Field(default=None, max_length=3000)


class ApplicationApprove(BaseModel):
    slug: str | None = Field(default=None, max_length=80, pattern=r"^[a-z0-9-]*$")


class LoginLinkRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    organization_slug: str | None = Field(default=None, max_length=80)


class LoginLinkRedeem(BaseModel):
    token: str = Field(min_length=20, max_length=200)


def _clean_email(value: str) -> str:
    email = value.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    return email


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return (slug or "studio")[:70]


def _unique_slug(session: Session, preferred: str) -> str:
    base = preferred[:70]
    candidate = base
    suffix = 2
    while session.scalar(select(OrganizationRecord.id).where(OrganizationRecord.slug == candidate)):
        candidate = f"{base[: max(2, 78 - len(str(suffix)))]}-{suffix}"
        suffix += 1
    return candidate


@router.post("/applications")
async def create_application(payload: ApplicationCreate, session: SessionDep):
    email = _clean_email(payload.email)
    now = datetime.now(UTC)
    application = PilotApplicationRecord(
        contact_name=payload.contact_name.strip(),
        email=email,
        studio_name=payload.studio_name.strip(),
        experience_url=(payload.experience_url or "").strip() or None,
        universe_id=(payload.universe_id or "").strip() or None,
        monthly_active_users=(payload.monthly_active_users or "").strip() or None,
        message=(payload.message or "").strip() or None,
        status="PENDING",
        organization_id=None,
        created_at=now,
        reviewed_at=None,
    )
    session.add(application)
    session.commit()
    session.refresh(application)

    await send_notification_once(
        session,
        event_key=f"pilot-application-customer:{application.id}",
        recipient=email,
        kind="PILOT_APPLICATION_RECEIVED",
        subject="We received your PlayDirective founding-pilot application",
        body_html=(
            f"<p>Hi {application.contact_name},</p>"
            "<p>Thanks for applying to the 30-day PlayDirective founding-studio pilot. "
            "We review pilot applications before creating a private studio workspace.</p>"
            "<p>You do not need to send Roblox credentials by email. If approved, your "
            "private invite will take you to the secure workspace connection flow.</p>"
        ),
    )

    settings = get_settings()
    if settings.operator_email:
        await send_notification_once(
            session,
            event_key=f"pilot-application-operator:{application.id}",
            recipient=settings.operator_email,
            kind="PILOT_APPLICATION_OPERATOR",
            subject=f"New PlayDirective pilot application · {application.studio_name}",
            body_html=(
                f"<p><strong>{application.contact_name}</strong> from "
                f"<strong>{application.studio_name}</strong> applied using {application.email}.</p>"
                "<p>Review and approve the application in the operator console.</p>"
            ),
        )

    return {
        "status": "received",
        "message": "Application received. Check your email for confirmation.",
    }


@router.get("/admin/applications")
def list_applications(
    session: SessionDep,
    _: AdminDep,
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = select(PilotApplicationRecord)
    if status:
        query = query.where(PilotApplicationRecord.status == status.upper())
    rows = session.scalars(query.order_by(desc(PilotApplicationRecord.created_at)).limit(limit)).all()
    return {
        "count": len(rows),
        "items": [
            {
                "id": row.id,
                "contact_name": row.contact_name,
                "email": row.email,
                "studio_name": row.studio_name,
                "experience_url": row.experience_url,
                "universe_id": row.universe_id,
                "monthly_active_users": row.monthly_active_users,
                "message": row.message,
                "status": row.status,
                "organization_id": row.organization_id,
                "created_at": row.created_at,
                "reviewed_at": row.reviewed_at,
            }
            for row in rows
        ],
    }


@router.post("/admin/applications/{application_id}/approve")
async def approve_application(
    application_id: int,
    payload: ApplicationApprove,
    session: SessionDep,
    _: AdminDep,
):
    application = session.get(PilotApplicationRecord, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.status == "APPROVED" and application.organization_id:
        raise HTTPException(status_code=409, detail="Application already approved")

    preferred = (payload.slug or "").strip() or _slugify(application.studio_name)
    slug = _unique_slug(session, preferred)
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug=slug,
        name=application.studio_name,
        data_mode="LIVE",
        active=True,
        created_at=now,
    )
    session.add(organization)
    session.flush()

    raw_invite = new_opaque_token()
    invite = PilotInviteRecord(
        organization_id=organization.id,
        email=application.email,
        role="OWNER",
        token_hash=hash_token(raw_invite),
        expires_at=invite_expiry(),
        redeemed_at=None,
        created_at=now,
    )
    session.add(invite)
    application.status = "APPROVED"
    application.organization_id = organization.id
    application.reviewed_at = now
    session.commit()

    invite_url = f"{get_settings().public_origin}/app/login?token={raw_invite}"
    await send_notification_once(
        session,
        event_key=f"workspace-invite:{invite.id}",
        recipient=application.email,
        organization_id=organization.id,
        kind="WORKSPACE_INVITE",
        subject=f"Your PlayDirective workspace for {organization.name} is ready",
        body_html=(
            "<p>Your founding-pilot workspace has been approved.</p>"
            f'<p><a href="{invite_url}">Open your private PlayDirective workspace</a></p>'
            "<p>This invitation is single-use and expires automatically. Never send your Roblox "
            "Open Cloud key by email; add it only inside the private workspace.</p>"
        ),
    )
    return {
        "status": "approved",
        "organization": {"id": organization.id, "name": organization.name, "slug": organization.slug},
        "invite_url": invite_url,
        "invite_expires_at": invite.expires_at,
    }


@router.post("/login-links/request")
async def request_login_link(payload: LoginLinkRequest, session: SessionDep):
    email = _clean_email(payload.email)
    query = (
        select(PilotUserRecord)
        .join(OrganizationRecord, OrganizationRecord.id == PilotUserRecord.organization_id)
        .where(
            PilotUserRecord.email == email,
            PilotUserRecord.active.is_(True),
            OrganizationRecord.active.is_(True),
        )
        .order_by(PilotUserRecord.id)
    )
    if payload.organization_slug:
        query = query.where(OrganizationRecord.slug == payload.organization_slug.strip().lower())
    user = session.scalar(query)

    if user:
        raw_token = new_opaque_token()
        now = datetime.now(UTC)
        record = PilotLoginLinkRecord(
            user_id=user.id,
            organization_id=user.organization_id,
            token_hash=hash_token(raw_token),
            expires_at=now + timedelta(minutes=get_settings().pilot_login_link_minutes),
            redeemed_at=None,
            created_at=now,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        login_url = f"{get_settings().public_origin}/app/login?login_token={raw_token}"
        await send_notification_once(
            session,
            event_key=f"login-link:{record.id}",
            recipient=user.email,
            organization_id=user.organization_id,
            kind="PASSWORDLESS_LOGIN",
            subject="Your PlayDirective sign-in link",
            body_html=(
                f'<p><a href="{login_url}">Sign in to PlayDirective</a></p>'
                f"<p>This single-use link expires in {get_settings().pilot_login_link_minutes} minutes.</p>"
            ),
        )

    return {
        "status": "accepted",
        "message": "If that email has pilot access, a sign-in link has been sent.",
    }


@router.post("/login-links/redeem")
def redeem_login_link(payload: LoginLinkRedeem, session: SessionDep):
    record = session.scalar(
        select(PilotLoginLinkRecord).where(PilotLoginLinkRecord.token_hash == hash_token(payload.token))
    )
    now = datetime.now(UTC)
    if not record or record.redeemed_at is not None or record.expires_at <= now:
        raise HTTPException(status_code=401, detail="Sign-in link expired or invalid")
    user = session.get(PilotUserRecord, record.user_id)
    organization = session.get(OrganizationRecord, record.organization_id)
    if not user or not user.active or not organization or not organization.active:
        raise HTTPException(status_code=403, detail="Pilot access disabled")

    raw_session = new_opaque_token()
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw_session),
            expires_at=session_expiry(),
            revoked_at=None,
            created_at=now,
        )
    )
    record.redeemed_at = now
    session.commit()
    return {
        "access_token": raw_session,
        "token_type": "bearer",
        "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name},
        "user": {"email": user.email, "role": user.role},
    }
