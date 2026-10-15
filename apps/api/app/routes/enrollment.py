import re
from datetime import UTC, datetime, timedelta
from html import escape
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
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
    StandardTrialSignupRecord,
    SubscriptionRecord,
)
from app.r17_models import (
    ApplicationAttributionRecord,
    ApplicationReviewRecord,
    PilotLifecycleRecord,
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
    utm_source: str | None = Field(default=None, max_length=160)
    utm_medium: str | None = Field(default=None, max_length=160)
    utm_campaign: str | None = Field(default=None, max_length=240)
    utm_content: str | None = Field(default=None, max_length=240)
    utm_term: str | None = Field(default=None, max_length=240)
    referrer: str | None = Field(default=None, max_length=1000)
    landing_page: str | None = Field(default=None, max_length=1000)


class ApplicationApprove(BaseModel):
    slug: str | None = Field(default=None, max_length=80, pattern=r"^[a-z0-9-]*$")


class ApplicationReviewUpdate(BaseModel):
    pipeline_status: Literal[
        "APPLIED", "REVIEWING", "APPROVED", "ACTIVATED", "CONNECTED",
        "FIRST_VALUE", "PILOT_ACTIVE", "CONVERSION", "PAID", "REJECTED",
        "PAUSED", "EXPIRED", "CHURNED"
    ]
    internal_note: str | None = Field(default=None, max_length=5000)


class LoginLinkRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    organization_slug: str | None = Field(default=None, max_length=80)


class LoginLinkRedeem(BaseModel):
    token: str = Field(min_length=20, max_length=200)


class StandardTrialSignup(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    contact_name: str = Field(min_length=2, max_length=160)
    studio_name: str = Field(min_length=2, max_length=160)


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


def _clean_optional(value: str | None) -> str | None:
    return (value or "").strip() or None


def _email_has_consumed_trial(session: Session, email: str) -> bool:
    users = session.scalars(select(PilotUserRecord).where(func.lower(PilotUserRecord.email) == email)).all()
    for user in users:
        if session.scalar(select(PilotLifecycleRecord.id).where(PilotLifecycleRecord.organization_id == user.organization_id)):
            return True
        subscription = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == user.organization_id))
        if subscription and (subscription.stripe_trial_consumed_at or subscription.trial_consumed_at):
            return True
    return False


@router.post("/standard-trial-signups")
async def create_standard_trial_signup(payload: StandardTrialSignup, session: SessionDep):
    settings = get_settings()
    if settings.playdirective_commercial_mode != "standard":
        raise HTTPException(status_code=409, detail="Standard trial signup is not enabled")
    if not (
        settings.stripe_billing_enabled
        and settings.stripe_price_indie_personal
        and settings.stripe_price_indie_business
    ):
        raise HTTPException(status_code=503, detail="Standard trial signup is unavailable until Stripe billing is enabled and configured")
    email = _clean_email(payload.email)
    if session.scalar(select(PilotUserRecord.id).where(func.lower(PilotUserRecord.email) == email)):
        raise HTTPException(status_code=409, detail="An account already exists for this email. Sign in to continue.")
    if _email_has_consumed_trial(session, email):
        raise HTTPException(status_code=409, detail="This email is not eligible for another trial")

    now = datetime.now(UTC)
    signup = session.scalar(select(StandardTrialSignupRecord).where(StandardTrialSignupRecord.email == email))
    token = new_opaque_token()
    if signup and signup.redeemed_at:
        raise HTTPException(status_code=409, detail="This signup link has already been used")
    if not signup:
        signup = StandardTrialSignupRecord(
            email=email,
            contact_name=payload.contact_name.strip(),
            studio_name=payload.studio_name.strip(),
            token_hash=hash_token(token),
            expires_at=now + timedelta(minutes=settings.pilot_login_link_minutes),
            redeemed_at=None,
            created_at=now,
        )
        session.add(signup)
    else:
        signup.contact_name = payload.contact_name.strip()
        signup.studio_name = payload.studio_name.strip()
        signup.token_hash = hash_token(token)
        signup.expires_at = now + timedelta(minutes=settings.pilot_login_link_minutes)
        signup.created_at = now
    session.commit()
    session.refresh(signup)
    signup_url = f"{settings.public_origin}/app/login?standard_signup_token={token}"
    await send_notification_once(
        session,
        event_key=f"standard-trial-signup:{signup.id}:{signup.token_hash[:12]}",
        recipient=email,
        kind="STANDARD_TRIAL_SIGNUP",
        subject="Finish setting up your PlayDirective trial",
        body_html=(
            f"<p>Hi {escape(payload.contact_name.strip())},</p>"
            f'<p><a href="{signup_url}">Verify your email and continue</a></p>'
            f"<p>The link expires in {settings.pilot_login_link_minutes} minutes. Your 14-day Indie trial starts after you add a payment method in Stripe Checkout.</p>"
        ),
    )
    return {"status": "accepted", "message": "Check your email for a secure signup link."}


@router.post("/standard-trial-signups/redeem")
def redeem_standard_trial_signup(payload: LoginLinkRedeem, session: SessionDep):
    settings = get_settings()
    if settings.playdirective_commercial_mode != "standard":
        raise HTTPException(status_code=409, detail="Standard trial signup is not enabled")
    signup = session.scalar(select(StandardTrialSignupRecord).where(StandardTrialSignupRecord.token_hash == hash_token(payload.token)))
    now = datetime.now(UTC)
    if not signup or signup.redeemed_at or (signup.expires_at if signup.expires_at.tzinfo else signup.expires_at.replace(tzinfo=UTC)) <= now:
        raise HTTPException(status_code=401, detail="Signup link expired or invalid")
    if session.scalar(select(PilotUserRecord.id).where(func.lower(PilotUserRecord.email) == signup.email)) or _email_has_consumed_trial(session, signup.email):
        raise HTTPException(status_code=409, detail="This email already has an account or has used its trial")

    slug = _unique_slug(session, _slugify(signup.studio_name))
    organization = OrganizationRecord(slug=slug, name=signup.studio_name, data_mode="LIVE", active=True, created_at=now)
    session.add(organization)
    session.flush()
    user = PilotUserRecord(organization_id=organization.id, email=signup.email, role="OWNER", active=True, created_at=now)
    session.add(user)
    subscription = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status="trial_signup_pending",
        stripe_customer_id=None,
        stripe_subscription_id=None,
        current_period_end=None,
        cancel_at_period_end=False,
        trial_source="standard",
        created_at=now,
        updated_at=now,
    )
    session.add(subscription)
    session.flush()
    raw_session = new_opaque_token()
    session.add(PilotSessionRecord(
        user_id=user.id,
        organization_id=organization.id,
        token_hash=hash_token(raw_session),
        expires_at=session_expiry(),
        revoked_at=None,
        created_at=now,
    ))
    signup.redeemed_at = now
    session.commit()
    return {
        "access_token": raw_session,
        "token_type": "bearer",
        "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name},
        "user": {"email": user.email, "role": user.role},
        "start_trial_checkout": True,
    }


@router.post("/applications")
async def create_application(payload: ApplicationCreate, session: SessionDep):
    email = _clean_email(payload.email)
    now = datetime.now(UTC)
    duplicate_since = now - timedelta(hours=24)
    existing = session.scalar(
        select(PilotApplicationRecord).where(
            PilotApplicationRecord.email == email,
            PilotApplicationRecord.created_at >= duplicate_since,
            PilotApplicationRecord.status == "PENDING",
        ).order_by(desc(PilotApplicationRecord.created_at))
    )
    if existing:
        return {
            "status": "received",
            "message": "Application received. Check your email for confirmation.",
        }

    application = PilotApplicationRecord(
        contact_name=payload.contact_name.strip(),
        email=email,
        studio_name=payload.studio_name.strip(),
        experience_url=_clean_optional(payload.experience_url),
        universe_id=_clean_optional(payload.universe_id),
        monthly_active_users=_clean_optional(payload.monthly_active_users),
        message=_clean_optional(payload.message),
        status="PENDING",
        organization_id=None,
        created_at=now,
        reviewed_at=None,
    )
    session.add(application)
    session.flush()
    session.add(
        ApplicationAttributionRecord(
            application_id=application.id,
            utm_source=_clean_optional(payload.utm_source),
            utm_medium=_clean_optional(payload.utm_medium),
            utm_campaign=_clean_optional(payload.utm_campaign),
            utm_content=_clean_optional(payload.utm_content),
            utm_term=_clean_optional(payload.utm_term),
            referrer=_clean_optional(payload.referrer),
            landing_page=_clean_optional(payload.landing_page),
            created_at=now,
        )
    )
    session.add(
        ApplicationReviewRecord(
            application_id=application.id,
            pipeline_status="APPLIED",
            internal_note=None,
            updated_at=now,
        )
    )
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
    items = []
    for row in rows:
        attribution = session.scalar(
            select(ApplicationAttributionRecord).where(ApplicationAttributionRecord.application_id == row.id)
        )
        review = session.scalar(
            select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == row.id)
        )
        items.append({
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
            "pipeline_status": review.pipeline_status if review else row.status,
            "internal_note": review.internal_note if review else None,
            "attribution": {
                "utm_source": attribution.utm_source if attribution else None,
                "utm_medium": attribution.utm_medium if attribution else None,
                "utm_campaign": attribution.utm_campaign if attribution else None,
                "utm_content": attribution.utm_content if attribution else None,
                "utm_term": attribution.utm_term if attribution else None,
                "referrer": attribution.referrer if attribution else None,
                "landing_page": attribution.landing_page if attribution else None,
            },
        })
    return {"count": len(items), "items": items}


@router.put("/admin/applications/{application_id}/review")
def update_application_review(
    application_id: int,
    payload: ApplicationReviewUpdate,
    session: SessionDep,
    _: AdminDep,
):
    application = session.get(PilotApplicationRecord, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    now = datetime.now(UTC)
    review = session.scalar(
        select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == application_id)
    )
    if not review:
        review = ApplicationReviewRecord(
            application_id=application_id,
            pipeline_status=payload.pipeline_status,
            internal_note=_clean_optional(payload.internal_note),
            updated_at=now,
        )
        session.add(review)
    else:
        review.pipeline_status = payload.pipeline_status
        review.internal_note = _clean_optional(payload.internal_note)
        review.updated_at = now
    if payload.pipeline_status == "REJECTED":
        application.status = "REJECTED"
        application.reviewed_at = now
    session.commit()
    return {"status": "updated", "pipeline_status": review.pipeline_status}


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
    review = session.scalar(
        select(ApplicationReviewRecord).where(ApplicationReviewRecord.application_id == application.id)
    )
    if review:
        review.pipeline_status = "APPROVED"
        review.updated_at = now
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
