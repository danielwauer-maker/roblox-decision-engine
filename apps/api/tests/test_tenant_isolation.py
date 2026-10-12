from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotSessionRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
)
from app.services.decision_snapshots import build_decision_snapshot
from app.tenant_security import hash_token


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _seed_org(session: Session, slug: str, name: str) -> OrganizationRecord:
    organization = OrganizationRecord(
        slug=slug,
        name=name,
        active=True,
        created_at=datetime.now(UTC),
    )
    session.add(organization)
    session.flush()
    return organization


def test_observations_and_decisions_are_isolated_by_organization():
    session = _session()
    alpha = _seed_org(session, "alpha-studio", "Alpha Studio")
    beta = _seed_org(session, "beta-studio", "Beta Studio")
    now = datetime.now(UTC)

    session.add_all(
        [
            MetricObservationRecord(
                organization_id=alpha.id,
                universe_id="100",
                metric="ForwardD1Retention",
                observed_at=now,
                value=0.10,
                dimensions_json="{}",
                dimensions_key="",
                status="ok",
                ingested_at=now,
            ),
            MetricObservationRecord(
                organization_id=beta.id,
                universe_id="100",
                metric="ForwardD1Retention",
                observed_at=now,
                value=0.42,
                dimensions_json="{}",
                dimensions_key="",
                status="ok",
                ingested_at=now,
            ),
        ]
    )
    session.commit()

    alpha_rows = session.scalars(
        select(MetricObservationRecord).where(
            MetricObservationRecord.organization_id == alpha.id
        )
    ).all()
    beta_rows = session.scalars(
        select(MetricObservationRecord).where(
            MetricObservationRecord.organization_id == beta.id
        )
    ).all()

    assert [row.value for row in alpha_rows] == [0.10]
    assert [row.value for row in beta_rows] == [0.42]
    assert build_decision_snapshot(session, "100", alpha.id).d1_retention == 0.10
    assert build_decision_snapshot(session, "100", beta.id).d1_retention == 0.42


def test_connections_are_scoped_even_for_same_universe_id():
    session = _session()
    alpha = _seed_org(session, "alpha-studio", "Alpha Studio")
    beta = _seed_org(session, "beta-studio", "Beta Studio")
    now = datetime.now(UTC)
    session.add_all(
        [
            RobloxConnectionRecord(
                organization_id=alpha.id,
                universe_id="777",
                experience_name="Alpha Game",
                encrypted_api_key="encrypted-alpha",
                active=True,
                created_at=now,
                updated_at=now,
            ),
            RobloxConnectionRecord(
                organization_id=beta.id,
                universe_id="777",
                experience_name="Beta Game",
                encrypted_api_key="encrypted-beta",
                active=True,
                created_at=now,
                updated_at=now,
            ),
        ]
    )
    session.commit()

    alpha_connection = session.scalar(
        select(RobloxConnectionRecord).where(
            RobloxConnectionRecord.organization_id == alpha.id,
            RobloxConnectionRecord.universe_id == "777",
        )
    )
    beta_connection = session.scalar(
        select(RobloxConnectionRecord).where(
            RobloxConnectionRecord.organization_id == beta.id,
            RobloxConnectionRecord.universe_id == "777",
        )
    )
    assert alpha_connection.experience_name == "Alpha Game"
    assert beta_connection.experience_name == "Beta Game"


def test_session_store_contains_only_token_hash():
    session = _session()
    organization = _seed_org(session, "pilot-studio", "Pilot Studio")
    now = datetime.now(UTC)
    user = PilotUserRecord(
        organization_id=organization.id,
        email="owner@example.com",
        role="OWNER",
        active=True,
        created_at=now,
    )
    session.add(user)
    session.flush()

    raw_token = "pilot-session-token-that-is-never-stored-raw"
    session.add(
        PilotSessionRecord(
            user_id=user.id,
            organization_id=organization.id,
            token_hash=hash_token(raw_token),
            expires_at=now + timedelta(days=14),
            revoked_at=None,
            created_at=now,
        )
    )
    session.commit()

    stored = session.scalar(select(PilotSessionRecord))
    assert stored.token_hash != raw_token
    assert stored.token_hash == hash_token(raw_token)
