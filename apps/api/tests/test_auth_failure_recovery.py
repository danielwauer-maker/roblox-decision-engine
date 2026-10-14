from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models import OrganizationRecord, PilotUserRecord
from app.routes.enrollment import LoginLinkRedeem, redeem_login_link
from app.routes.tenants import InviteRedeem, redeem_invite
from app.tenant_security import require_tenant


class FakeSession:
    def __init__(self, *, scalar_value=None, gets=None):
        self.scalar_value = scalar_value
        self.gets = gets or {}

    def scalar(self, _statement):
        return self.scalar_value

    def get(self, model, identity):
        return self.gets.get((model, identity))


def test_expired_session_is_rejected():
    now = datetime.now(UTC)
    record = SimpleNamespace(
        revoked_at=None,
        expires_at=now - timedelta(seconds=1),
        user_id=1,
        organization_id=1,
    )
    session = FakeSession(scalar_value=record)

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization="Bearer expired-session-token-1234567890")

    assert exc.value.status_code == 401
    assert exc.value.detail == "Session expired or invalid"


def test_revoked_session_is_rejected():
    now = datetime.now(UTC)
    record = SimpleNamespace(
        revoked_at=now,
        expires_at=now + timedelta(days=1),
        user_id=1,
        organization_id=1,
    )
    session = FakeSession(scalar_value=record)

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization="Bearer revoked-session-token-1234567890")

    assert exc.value.status_code == 401
    assert exc.value.detail == "Session expired or invalid"


def test_disabled_organization_blocks_valid_session():
    now = datetime.now(UTC)
    record = SimpleNamespace(
        revoked_at=None,
        expires_at=now + timedelta(days=1),
        user_id=1,
        organization_id=1,
    )
    user = SimpleNamespace(
        id=1,
        organization_id=1,
        email="owner@example.com",
        role="OWNER",
        active=True,
    )
    organization = SimpleNamespace(id=1, active=False)
    session = FakeSession(
        scalar_value=record,
        gets={
            (PilotUserRecord, 1): user,
            (OrganizationRecord, 1): organization,
        },
    )

    with pytest.raises(HTTPException) as exc:
        require_tenant(session, authorization="Bearer disabled-org-session-token-1234567890")

    assert exc.value.status_code == 403
    assert exc.value.detail == "Pilot access disabled"


def test_redeemed_invite_cannot_be_used_again():
    now = datetime.now(UTC)
    invite = SimpleNamespace(
        redeemed_at=now,
        expires_at=now + timedelta(hours=1),
    )
    session = FakeSession(scalar_value=invite)

    with pytest.raises(HTTPException) as exc:
        redeem_invite(InviteRedeem(token="redeemed-invite-token-1234567890"), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invite expired or invalid"


def test_expired_invite_is_rejected():
    now = datetime.now(UTC)
    invite = SimpleNamespace(
        redeemed_at=None,
        expires_at=now - timedelta(seconds=1),
    )
    session = FakeSession(scalar_value=invite)

    with pytest.raises(HTTPException) as exc:
        redeem_invite(InviteRedeem(token="expired-invite-token-123456789012"), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Invite expired or invalid"


def test_redeemed_login_link_cannot_be_used_again():
    now = datetime.now(UTC)
    record = SimpleNamespace(
        redeemed_at=now,
        expires_at=now + timedelta(minutes=20),
    )
    session = FakeSession(scalar_value=record)

    with pytest.raises(HTTPException) as exc:
        redeem_login_link(LoginLinkRedeem(token="redeemed-login-link-token-1234567890"), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Sign-in link expired or invalid"


def test_expired_login_link_is_rejected():
    now = datetime.now(UTC)
    record = SimpleNamespace(
        redeemed_at=None,
        expires_at=now - timedelta(seconds=1),
    )
    session = FakeSession(scalar_value=record)

    with pytest.raises(HTTPException) as exc:
        redeem_login_link(LoginLinkRedeem(token="expired-login-link-token-12345678901"), session)

    assert exc.value.status_code == 401
    assert exc.value.detail == "Sign-in link expired or invalid"
