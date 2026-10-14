from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base
from app.models import (
    OrganizationRecord,
    PilotInviteRecord,
    PilotLoginLinkRecord,
    PilotSessionRecord,
    PilotUserRecord,
)
from app.routes.enrollment import LoginLinkRedeem, redeem_login_link
from app.routes.tenants import InviteRedeem, redeem_invite
from app.tenant_security import hash_token, require_tenant


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _seed_identity(session: Session, *, organization_active: bool = True):
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="auth-failure",
        name="Auth Failure Studio",
        data_mode="LIVE",
        active=organization_active,
        created_at=now,
    )
    session.add(organization)
    session.flush()
    user = PilotUserRecord(
        organization_id=organization.id,
        email="owner@example.com",
        role="OWNER",
        active=True,
        created_at=now,
    )
    session.add(user)
    session.commit()
    session.refresh(organization)
    session.refresh(user)
    return organization, user


def test_expired_session_is_rejected():
    session = _session()
    organization, user = _seed_identity(session)
    raw = "expired-session-token-1234567890"
    now = datetime.now(UTC)
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw),
            expires_at=now - timedelta(seconds=1),
            revoked_at=None,
            created_at=now - timedelta(days=1),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization=f"Bearer {raw}")

    assert exc.value.status_code == 401
    assert exc.value.detail == "Session expired or invalid"


def test_revoked_session_is_rejected():
    session = _session()
    organization, user = _seed_identity(session)
    raw = "revoked-session-token-1234567890"
    now = datetime.now(UTC)
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw),
            expires_at=now + timedelta(days=1),
            revoked_at=now,
            created_at=now - timedelta(hours=1),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization=f"Bearer {raw}")

    assert exc.value.status_code == 401


def test_disabled_organization_blocks_valid_session():
    session = _session()
    organization, user = _seed_identity(session, organization_active=False)
    raw = "disabled-org-session-token-1234567890"
    now = datetime.now(UTC)
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw),
            expires_at=now + timedelta(days=1),
            revoked_at=None,
            created_at=now,
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization=f"Bearer {raw}")

    assert exc.value.status_code == 403
    assert exc.value.detail == "Pilot access disabled"


def test_redeemed_invite_cannot_be_used_again():
    session = _session()
    organization, _user = _seed_identity(session)
    raw = "redeemed-invite-token-1234567890"
    now = datetime.now(UTC)
    session.add(
        PilotInviteRecord(
            organization_id=organization.id,
            email="owner@example.com",
            role="OWNER",
            token_hash=hash_token(raw),
            expires_at=now + timedelta(hours=1),
            redeemed_at=now,
            created_at=now - timedelta(minutes=5),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        redeem_invite(InviteRedeem(token=raw), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invite expired or invalid"


def test_expired_invite_is_rejected():
    session = _session()
    organization, _user = _seed_identity(session)
    raw = "expired-invite-token-123456789012"
    now = datetime.now(UTC)
    session.add(
        PilotInviteRecord(
            organization_id=organization.id,
            email="owner@example.com",
            role="OWNER",
            token_hash=hash_token(raw),
            expires_at=now - timedelta(seconds=1),
            redeemed_at=None,
            created_at=now - timedelta(hours=1),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        redeem_invite(InviteRedeem(token=raw), session)

    assert exc.value.status_code == 401


def test_redeemed_login_link_cannot_be_used_again():
    session = _session()
    organization, user = _seed_identity(session)
    raw = "redeemed-login-link-token-1234567890"
    now = datetime.now(UTC)
    session.add(
        PilotLoginLinkRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw),
            expires_at=now + timedelta(minutes=20),
            redeemed_at=now,
            created_at=now - timedelta(minutes=1),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        redeem_login_link(LoginLinkRedeem(token=raw), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Sign-in link expired or invalid"


def test_expired_login_link_is_rejected():
    session = _session()
    organization, user = _seed_identity(session)
    raw = "expired-login-link-token-12345678901"
    now = datetime.now(UTC)
    session.add(
        PilotLoginLinkRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw),
            expires_at=now - timedelta(seconds=1),
            redeemed_at=None,
            created_at=now - timedelta(minutes=30),
        )
    )
    session.commit()

    with pytest.raises(HTTPException) as exc:
        redeem_login_link(LoginLinkRedeem(token=raw), session)

    assert exc.value.status_code == 401
