import asyncio
from datetime import UTC, datetime

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base
from app.models import OrganizationRecord, RobloxConnectionRecord, RobloxSyncStateRecord
from app.services import automated_roblox_sync as sync_service


def test_failed_sync_recovers_to_healthy_on_next_success(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session: Session = factory()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="sync-recovery",
        name="Sync Recovery",
        data_mode="LIVE",
        active=True,
        created_at=now,
    )
    session.add(organization)
    session.flush()
    connection = RobloxConnectionRecord(
        organization_id=organization.id,
        universe_id="123",
        experience_name="Recovery Experience",
        encrypted_api_key="encrypted-test-key",
        active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(connection)
    session.commit()
    session.refresh(connection)

    monkeypatch.setattr(sync_service, "decrypt_credential", lambda _: "plain-key")

    async def failing_sync(*_args, **_kwargs):
        raise RuntimeError("temporary Roblox outage")

    monkeypatch.setattr(sync_service, "sync_default_metrics_for_connection", failing_sync)
    failed = asyncio.run(sync_service.sync_connection(session, connection_id=connection.id))
    assert failed.status == "failed"

    state = session.scalar(
        select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.connection_id == connection.id)
    )
    assert state is not None
    assert state.health_status == "ERROR"
    assert "temporary Roblox outage" in (state.last_error or "")
    assert state.last_success_at is None

    async def successful_sync(_session, **kwargs):
        return {"metrics": [], "days": kwargs["days"]}

    monkeypatch.setattr(sync_service, "sync_default_metrics_for_connection", successful_sync)
    recovered = asyncio.run(sync_service.sync_connection(session, connection_id=connection.id))
    assert recovered.status == "synced"

    session.refresh(state)
    assert state.health_status == "HEALTHY"
    assert state.last_success_at is not None
    assert state.last_error is None
