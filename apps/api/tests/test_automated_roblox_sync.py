import asyncio
from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base
from app.models import (
    OrganizationRecord,
    RobloxConnectionRecord,
    RobloxSyncStateRecord,
)
from app.r17_models import PilotLifecycleRecord
from app.services import automated_roblox_sync as sync_service


def _session_factory():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)


def _organization(
    session: Session,
    *,
    slug: str,
    active: bool = True,
    data_mode: str = "LIVE",
    created_at: datetime | None = None,
) -> OrganizationRecord:
    row = OrganizationRecord(
        slug=slug,
        name=slug,
        data_mode=data_mode,
        active=active,
        created_at=created_at or datetime.now(UTC),
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _connection(
    session: Session,
    organization_id: int,
    *,
    universe_id: str,
    active: bool = True,
) -> RobloxConnectionRecord:
    now = datetime.now(UTC)
    row = RobloxConnectionRecord(
        organization_id=organization_id,
        universe_id=universe_id,
        experience_name=f"Experience {universe_id}",
        encrypted_api_key="encrypted-test-key",
        active=active,
        created_at=now,
        updated_at=now,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _expire_pilot(session: Session, organization_id: int) -> None:
    now = datetime.now(UTC)
    session.add(
        PilotLifecycleRecord(
            organization_id=organization_id,
            status="EXPIRED",
            started_at=now - timedelta(days=31),
            ends_at=now - timedelta(days=1),
            converted_at=None,
            closed_at=now - timedelta(days=1),
            updated_at=now,
        )
    )
    session.commit()


def test_candidate_discovery_only_returns_active_live_connections():
    factory = _session_factory()
    session = factory()

    live = _organization(session, slug="live")
    inactive_org = _organization(session, slug="inactive", active=False)
    simulated = _organization(session, slug="simulated", data_mode="SIMULATED")

    expected = _connection(session, live.id, universe_id="100")
    _connection(session, live.id, universe_id="101", active=False)
    _connection(session, inactive_org.id, universe_id="200")
    _connection(session, simulated.id, universe_id="300")

    assert sync_service.candidate_connection_ids(session) == [expected.id]


def test_active_entitled_connection_syncs_and_persists_health(monkeypatch):
    factory = _session_factory()
    session = factory()
    organization = _organization(session, slug="active-pilot")
    connection = _connection(session, organization.id, universe_id="123")

    calls = []

    async def fake_sync(_session, **kwargs):
        calls.append(kwargs)
        return {"metrics": [], "days": kwargs["days"]}

    monkeypatch.setattr(sync_service, "decrypt_credential", lambda _: "plain-key")
    monkeypatch.setattr(sync_service, "sync_default_metrics_for_connection", fake_sync)

    result = asyncio.run(sync_service.sync_connection(session, connection_id=connection.id))

    assert result.status == "synced"
    assert calls[0]["organization_id"] == organization.id
    assert calls[0]["universe_id"] == "123"

    state = session.scalar(
        select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.connection_id == connection.id)
    )
    assert state is not None
    assert state.health_status == "HEALTHY"
    assert state.last_attempt_at is not None
    assert state.last_success_at is not None
    assert state.last_error is None


def test_expired_unpaid_connection_is_blocked_without_external_sync(monkeypatch):
    factory = _session_factory()
    session = factory()
    organization = _organization(
        session,
        slug="expired",
        created_at=datetime.now(UTC) - timedelta(days=31),
    )
    connection = _connection(session, organization.id, universe_id="456")
    _expire_pilot(session, organization.id)

    async def should_not_sync(*_args, **_kwargs):
        raise AssertionError("blocked tenant attempted external Roblox sync")

    monkeypatch.setattr(sync_service, "sync_default_metrics_for_connection", should_not_sync)

    result = asyncio.run(sync_service.sync_connection(session, connection_id=connection.id))

    assert result.status == "skipped"
    assert result.error == "entitlement_inactive"
    state = session.scalar(
        select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.connection_id == connection.id)
    )
    assert state is not None
    assert state.health_status == "BLOCKED"
    assert state.last_attempt_at is None
    assert state.last_success_at is None


def test_one_tenant_failure_does_not_stop_following_tenant(monkeypatch):
    factory = _session_factory()
    session = factory()
    first_org = _organization(session, slug="first")
    second_org = _organization(session, slug="second")
    first = _connection(session, first_org.id, universe_id="111")
    second = _connection(session, second_org.id, universe_id="222")
    session.close()

    monkeypatch.setattr(sync_service, "decrypt_credential", lambda _: "plain-key")

    async def fake_sync(_session, **kwargs):
        if kwargs["universe_id"] == "111":
            raise RuntimeError("Roblox unavailable for first tenant")
        return {"metrics": [], "days": kwargs["days"]}

    monkeypatch.setattr(sync_service, "sync_default_metrics_for_connection", fake_sync)

    summary, results = asyncio.run(sync_service.run_automated_sync(factory))

    assert summary.candidates == 2
    assert summary.failed == 1
    assert summary.synced == 1
    assert [item.status for item in results] == ["failed", "synced"]

    verify = factory()
    first_state = verify.scalar(
        select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.connection_id == first.id)
    )
    second_state = verify.scalar(
        select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.connection_id == second.id)
    )
    assert first_state.health_status == "ERROR"
    assert "Roblox unavailable" in first_state.last_error
    assert second_state.health_status == "HEALTHY"
    assert second_state.last_success_at is not None
