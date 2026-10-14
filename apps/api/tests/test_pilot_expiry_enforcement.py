from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access, require_product_access
from app.db import Base
from app.models import OrganizationRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord
from app.tenant_security import TenantPrincipal


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _organization(session: Session, now: datetime) -> OrganizationRecord:
    organization = OrganizationRecord(
        slug="expiry-test",
        name="Expiry Test",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=29),
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)
    return organization


def _lifecycle(
    session: Session,
    organization_id: int,
    *,
    started_at: datetime,
    ends_at: datetime,
    status: str = "ACTIVE",
) -> PilotLifecycleRecord:
    row = PilotLifecycleRecord(
        organization_id=organization_id,
        status=status,
        started_at=started_at,
        ends_at=ends_at,
        converted_at=None,
        closed_at=None,
        updated_at=started_at,
    )
    session.add(row)
    session.commit()
    return row


def _subscription(session: Session, organization_id: int, status: str) -> SubscriptionRecord:
    now = datetime.now(UTC)
    row = SubscriptionRecord(
        organization_id=organization_id,
        plan_id="growth",
        status=status,
        stripe_customer_id="cus_test",
        stripe_subscription_id="sub_test",
        current_period_end=now + timedelta(days=30),
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(row)
    session.commit()
    return row


def test_day_29_pilot_has_product_access():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=29),
        ends_at=now + timedelta(days=1),
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is True
    assert access.access_mode == "pilot"
    assert access.experience_limit == 1


def test_day_30_at_ends_at_is_blocked():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=30),
        ends_at=now,
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.pilot_status == "EXPIRED"
    assert access.experience_limit == 0


def test_day_31_expired_unpaid_is_blocked():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=31),
        ends_at=now - timedelta(days=1),
        status="EXPIRED",
    )

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.reason == "pilot_ended_paid_plan_required"


def test_expired_pilot_with_active_subscription_is_restored_immediately():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=31),
        ends_at=now - timedelta(days=1),
        status="EXPIRED",
    )
    _subscription(session, organization.id, "active")

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is True
    assert access.access_mode == "paid"
    assert access.plan_id == "growth"
    assert access.experience_limit == 3


def test_canceled_subscription_does_not_unlock_expired_pilot():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=31),
        ends_at=now - timedelta(days=1),
        status="EXPIRED",
    )
    _subscription(session, organization.id, "canceled")

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.billing_status == "canceled"


def test_past_due_remains_temporarily_allowed_until_billing_hardening_sprint():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = _organization(session, now)
    _lifecycle(
        session,
        organization.id,
        started_at=now - timedelta(days=31),
        ends_at=now - timedelta(days=1),
        status="EXPIRED",
    )
    _subscription(session, organization.id, "past_due")

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is True
    assert access.access_mode == "paid"


def test_missing_lifecycle_never_restarts_old_pilot():
    now = datetime(2026, 10, 14, 10, 0, tzinfo=UTC)
    session = _session()
    organization = OrganizationRecord(
        slug="old-pilot",
        name="Old Pilot",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=45),
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)

    access = evaluate_product_access(session, organization.id, now=now)

    assert access.allowed is False
    assert access.pilot_status == "EXPIRED"


def test_require_product_access_returns_403_for_expired_unpaid():
    now = datetime.now(UTC)
    session = _session()
    organization = OrganizationRecord(
        slug="blocked",
        name="Blocked",
        data_mode="LIVE",
        active=True,
        created_at=now - timedelta(days=31),
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)
    principal = TenantPrincipal(
        user_id=1,
        organization_id=organization.id,
        email="owner@example.com",
        role="OWNER",
    )

    try:
        require_product_access(principal, session)
    except HTTPException as exc:
        assert exc.status_code == 403
        assert exc.detail["code"] == "PRODUCT_ACCESS_REQUIRED"
        assert exc.detail["message"] == "Your founding pilot has ended"
    else:
        raise AssertionError("Expired unpaid tenant was not blocked")
