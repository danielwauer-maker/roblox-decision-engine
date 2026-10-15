from datetime import UTC, datetime, timedelta

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.access_control import PAST_DUE_GRACE_PERIOD, evaluate_product_access
from app.db import Base
from app.models import OrganizationRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord
from app.routes.billing import _upsert_from_subscription
from app.routes.r17 import _mark_converted_if_paid


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _expired_tenant(session: Session, now: datetime) -> OrganizationRecord:
    organization = OrganizationRecord(
        slug="past-due-test",
        name="Past Due Test",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=60),
    )
    session.add(organization)
    session.flush()
    session.add(
        PilotLifecycleRecord(
            organization_id=organization.id,
            status="EXPIRED",
            started_at=now - timedelta(days=60),
            ends_at=now - timedelta(days=30),
            converted_at=None,
            closed_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=30),
        )
    )
    session.commit()
    session.refresh(organization)
    return organization


def _active_pilot_tenant(session: Session, now: datetime) -> OrganizationRecord:
    organization = OrganizationRecord(
        slug="past-due-active-pilot",
        name="Past Due Active Pilot",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=10),
    )
    session.add(organization)
    session.flush()
    session.add(
        PilotLifecycleRecord(
            organization_id=organization.id,
            status="ACTIVE",
            started_at=now - timedelta(days=10),
            ends_at=now + timedelta(days=20),
            converted_at=None,
            closed_at=None,
            updated_at=now - timedelta(days=10),
        )
    )
    session.commit()
    session.refresh(organization)
    return organization


def _subscription(
    session: Session,
    organization_id: int,
    *,
    status: str,
    status_since: datetime,
) -> SubscriptionRecord:
    row = SubscriptionRecord(
        organization_id=organization_id,
        plan_id="growth",
        status=status,
        stripe_customer_id="cus_grace",
        stripe_subscription_id="sub_grace",
        current_period_end=status_since + timedelta(days=30),
        cancel_at_period_end=False,
        created_at=status_since - timedelta(days=30),
        updated_at=status_since,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def test_past_due_is_allowed_inside_seven_day_grace():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    status_since = now - timedelta(days=6, hours=23)
    _subscription(session, organization.id, status="past_due", status_since=status_since)

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is True
    assert access.access_mode == "paid"
    assert access.reason == "paid_subscription_past_due_grace"
    assert access.experience_limit == 3
    assert access.billing_grace_ends_at == status_since + PAST_DUE_GRACE_PERIOD


def test_past_due_is_blocked_exactly_at_grace_boundary():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=now - PAST_DUE_GRACE_PERIOD,
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.access_mode == "blocked"
    assert access.reason == "past_due_grace_expired"
    assert access.experience_limit == 0


def test_past_due_after_grace_is_blocked_for_expired_pilot():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=now - timedelta(days=8),
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.reason == "past_due_grace_expired"
    assert access.billing_status == "past_due"


def test_active_pilot_falls_back_to_pilot_after_payment_grace_expires():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _active_pilot_tenant(session, now)
    _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=now - timedelta(days=8),
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.access_mode == "blocked"
    assert access.reason == "past_due_grace_expired"
    assert access.experience_limit == 0
    assert access.billing_status == "past_due"


def test_converted_lifecycle_still_falls_back_inside_original_pilot_window():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _active_pilot_tenant(session, now)
    lifecycle = session.scalar(
        select(PilotLifecycleRecord).where(
            PilotLifecycleRecord.organization_id == organization.id
        )
    )
    assert lifecycle is not None
    lifecycle.status = "CONVERTED"
    lifecycle.converted_at = now - timedelta(days=2)
    session.commit()
    _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=now - timedelta(days=8),
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.access_mode == "blocked"
    assert access.reason == "past_due_grace_expired"
    assert access.experience_limit == 0


def test_past_due_alone_does_not_mark_active_pilot_converted():
    now = datetime.now(UTC)
    session = _session()
    organization = _active_pilot_tenant(session, now)
    _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=now,
    )
    lifecycle = session.scalar(
        select(PilotLifecycleRecord).where(
            PilotLifecycleRecord.organization_id == organization.id
        )
    )
    assert lifecycle is not None

    _mark_converted_if_paid(session, organization.id, lifecycle)
    session.refresh(lifecycle)

    assert lifecycle.status == "ACTIVE"
    assert lifecycle.converted_at is None


def test_recovered_active_subscription_restores_paid_access_immediately():
    now = datetime(2026, 10, 14, 12, 0, tzinfo=UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    _subscription(
        session,
        organization.id,
        status="active",
        status_since=now,
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is True
    assert access.access_mode == "paid"
    assert access.reason == "paid_subscription_active"
    assert access.billing_grace_ends_at is None


def test_repeated_past_due_webhook_does_not_extend_grace_anchor():
    now = datetime.now(UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    original_anchor = now - timedelta(days=3)
    record = _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=original_anchor,
    )

    _upsert_from_subscription(
        session,
        {
            "id": "sub_grace",
            "customer": "cus_grace",
            "status": "past_due",
            "metadata": {"organization_id": str(organization.id), "plan_id": "growth"},
            "items": {"data": []},
            "current_period_end": int((now + timedelta(days=30)).timestamp()),
            "cancel_at_period_end": False,
        },
    )
    session.commit()
    session.refresh(record)

    assert record.updated_at.replace(tzinfo=UTC) == original_anchor


def test_status_recovery_moves_anchor_for_future_status_changes():
    now = datetime.now(UTC)
    session = _session()
    organization = _expired_tenant(session, now)
    original_anchor = now - timedelta(days=3)
    record = _subscription(
        session,
        organization.id,
        status="past_due",
        status_since=original_anchor,
    )

    _upsert_from_subscription(
        session,
        {
            "id": "sub_grace",
            "customer": "cus_grace",
            "status": "active",
            "metadata": {"organization_id": str(organization.id), "plan_id": "growth"},
            "items": {"data": []},
            "current_period_end": int((now + timedelta(days=30)).timestamp()),
            "cancel_at_period_end": False,
        },
    )
    session.commit()
    session.refresh(record)

    assert record.status == "active"
    assert record.updated_at.replace(tzinfo=UTC) > original_anchor
