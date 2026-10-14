from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access
from app.db import Base
from app.models import (
    OrganizationRecord,
    RobloxConnectionRecord,
    RobloxSyncStateRecord,
    SubscriptionRecord,
)
from app.services import automated_roblox_sync
from app.services.experience_entitlements import (
    active_connections_for_organization,
    entitled_connection_ids,
    entitled_connections_for_organization,
)


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _paid_org_with_connections(session: Session, *, plan_id: str = "growth"):
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="downgrade-test",
        name="Downgrade Test",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=60),
    )
    session.add(organization)
    session.flush()
    session.add(
        SubscriptionRecord(
            organization_id=organization.id,
            plan_id=plan_id,
            status="active",
            stripe_customer_id="cus_downgrade",
            stripe_subscription_id="sub_downgrade",
            current_period_end=now + timedelta(days=20),
            cancel_at_period_end=False,
            created_at=now - timedelta(days=40),
            updated_at=now,
        )
    )
    connections = []
    for index, universe_id in enumerate(("1001", "1002", "1003"), start=1):
        connection = RobloxConnectionRecord(
            organization_id=organization.id,
            universe_id=universe_id,
            experience_name=f"Experience {index}",
            encrypted_api_key=f"encrypted-{index}",
            active=True,
            created_at=now - timedelta(days=10 - index),
            updated_at=now - timedelta(minutes=10 - index),
        )
        session.add(connection)
        connections.append(connection)
    session.commit()
    for connection in connections:
        session.refresh(connection)
    return organization, connections


def test_entitled_connections_follow_current_plan_after_downgrade():
    session = _session()
    organization, connections = _paid_org_with_connections(session, plan_id="growth")

    growth_access = evaluate_product_access(session, organization.id)
    assert growth_access.experience_limit == 3
    assert len(entitled_connections_for_organization(session, organization.id, 3)) == 3

    subscription = session.scalar(
        select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization.id)
    )
    assert subscription is not None
    subscription.plan_id = "indie"
    session.commit()

    indie_access = evaluate_product_access(session, organization.id)
    entitled = entitled_connections_for_organization(
        session,
        organization.id,
        indie_access.experience_limit,
    )

    assert indie_access.experience_limit == 1
    assert len(active_connections_for_organization(session, organization.id)) == 3
    assert [row.id for row in entitled] == [connections[-1].id]
    assert entitled_connection_ids(session, organization.id, 1) == {connections[-1].id}


@pytest.mark.asyncio
async def test_automated_sync_skips_connections_over_downgraded_limit(monkeypatch):
    session = _session()
    _organization, connections = _paid_org_with_connections(session, plan_id="indie")
    blocked_connection = connections[0]

    def should_not_decrypt(_value: str) -> str:
        raise AssertionError("over-limit connection must not decrypt credentials")

    async def should_not_sync(*args, **kwargs):
        raise AssertionError("over-limit connection must not call Roblox")

    monkeypatch.setattr(automated_roblox_sync, "decrypt_credential", should_not_decrypt)
    monkeypatch.setattr(
        automated_roblox_sync,
        "sync_default_metrics_for_connection",
        should_not_sync,
    )

    result = await automated_roblox_sync.sync_connection(
        session,
        connection_id=blocked_connection.id,
    )

    assert result.status == "skipped"
    assert result.error == "experience_limit_exceeded"

    state = session.scalar(
        select(RobloxSyncStateRecord).where(
            RobloxSyncStateRecord.connection_id == blocked_connection.id
        )
    )
    assert state is not None
    assert state.health_status == "BLOCKED"
    assert state.last_error == "Experience limit exceeded for current plan"
    assert state.last_attempt_at is None


@pytest.mark.asyncio
async def test_automated_sync_still_runs_for_entitled_connection(monkeypatch):
    session = _session()
    organization, connections = _paid_org_with_connections(session, plan_id="indie")
    entitled_connection = connections[-1]
    calls: list[str] = []

    monkeypatch.setattr(
        automated_roblox_sync,
        "decrypt_credential",
        lambda value: f"plain:{value}",
    )

    async def fake_sync(
        session,
        *,
        organization_id,
        universe_id,
        api_key,
        days,
    ):
        calls.append(universe_id)
        assert organization_id == organization.id
        assert api_key == f"plain:{entitled_connection.encrypted_api_key}"
        assert days == 30
        return {"status": "ok"}

    monkeypatch.setattr(
        automated_roblox_sync,
        "sync_default_metrics_for_connection",
        fake_sync,
    )

    result = await automated_roblox_sync.sync_connection(
        session,
        connection_id=entitled_connection.id,
    )

    assert result.status == "synced"
    assert calls == [entitled_connection.universe_id]

    state = session.scalar(
        select(RobloxSyncStateRecord).where(
            RobloxSyncStateRecord.connection_id == entitled_connection.id
        )
    )
    assert state is not None
    assert state.health_status == "HEALTHY"
