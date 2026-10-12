from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotSessionRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.routes.admin_console import OrganizationStatusUpdate, _studio_summary, organization_status, revoke_sessions


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def test_admin_summary_exposes_operational_state_without_credentials():
    session = _session()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="alpha",
        name="Alpha Studio",
        active=True,
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
    session.flush()
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash="hashed-session",
            expires_at=now + timedelta(days=1),
            revoked_at=None,
            created_at=now,
        )
    )
    session.add(
        RobloxConnectionRecord(
            organization_id=organization.id,
            universe_id="777",
            experience_name="Alpha Game",
            encrypted_api_key="must-never-leave-backend",
            active=True,
            created_at=now,
            updated_at=now,
        )
    )
    session.add(
        MetricObservationRecord(
            organization_id=organization.id,
            universe_id="777",
            metric="ForwardD1Retention",
            observed_at=now,
            value=0.2,
            dimensions_json="{}",
            dimensions_key="",
            status="ok",
            ingested_at=now,
        )
    )
    session.commit()

    summary = _studio_summary(session, organization, now)

    assert summary["state"] == "active"
    assert summary["users"] == 1
    assert summary["active_sessions"] == 1
    assert summary["connection"]["universe_id"] == "777"
    assert "encrypted_api_key" not in summary["connection"]
    assert summary["data"]["observation_count"] == 1


def test_admin_can_disable_studio_and_revoke_sessions():
    session = _session()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="beta",
        name="Beta Studio",
        active=True,
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
    session.flush()
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash="another-hashed-session",
            expires_at=now + timedelta(days=1),
            revoked_at=None,
            created_at=now,
        )
    )
    session.commit()

    status = organization_status(
        organization.id,
        OrganizationStatusUpdate(active=False),
        session,
        None,
    )
    revoked = revoke_sessions(organization.id, session, None)

    assert status == {"id": organization.id, "active": False}
    assert revoked["revoked_sessions"] == 1
    assert session.get(OrganizationRecord, organization.id).active is False
