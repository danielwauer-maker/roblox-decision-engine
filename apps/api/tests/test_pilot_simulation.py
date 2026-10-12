from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app.domain.decision_engine import evaluate_snapshot
from app.models import MetricObservationRecord, OrganizationRecord
from app.routes.admin_simulation import seed_simulations
from app.services.decision_snapshots import build_decision_snapshot


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def test_seed_creates_two_explicit_simulated_studios_with_90_day_histories():
    session = _session()

    result = seed_simulations(session, None)

    assert len(result["studios"]) == 2
    organizations = session.scalars(select(OrganizationRecord).order_by(OrganizationRecord.slug)).all()
    assert len(organizations) == 2
    assert {organization.data_mode for organization in organizations} == {"SIMULATED"}

    for organization in organizations:
        count = len(
            session.scalars(
                select(MetricObservationRecord).where(
                    MetricObservationRecord.organization_id == organization.id
                )
            ).all()
        )
        assert count == 450


def test_novaquest_surfaces_retention_and_monetization_priorities():
    session = _session()
    seed_simulations(session, None)
    organization = session.scalar(
        select(OrganizationRecord).where(OrganizationRecord.slug == "novaquest-studios-sim")
    )

    snapshot = build_decision_snapshot(session, "900000001", organization.id)
    decisions = evaluate_snapshot(snapshot)
    keys = {decision.key for decision in decisions}

    assert snapshot.d1_retention_mobile == 0.19
    assert snapshot.d1_retention_desktop == 0.33
    assert "mobile_retention_gap" in keys
    assert "monetization_lag" in keys


def test_tycoon_forge_keeps_retention_healthy_and_flags_monetization_only():
    session = _session()
    seed_simulations(session, None)
    organization = session.scalar(
        select(OrganizationRecord).where(OrganizationRecord.slug == "tycoon-forge-sim")
    )

    snapshot = build_decision_snapshot(session, "900000002", organization.id)
    decisions = evaluate_snapshot(snapshot)
    keys = {decision.key for decision in decisions}

    assert snapshot.d1_retention_mobile == 0.34
    assert snapshot.d1_retention_desktop == 0.35
    assert "monetization_lag" in keys
    assert "mobile_retention_gap" not in keys
    assert "retention_decline" not in keys
