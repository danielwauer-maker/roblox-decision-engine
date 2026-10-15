from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base
from app.models import OrganizationRecord, SubscriptionRecord
from app.routes import billing
from app.routes.billing import CheckoutCreate, _upsert_from_subscription, create_checkout
from app.tenant_security import TenantPrincipal


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _organization(session: Session) -> OrganizationRecord:
    organization = OrganizationRecord(
        slug="billing-hardening",
        name="Billing Hardening",
        data_mode="LIVE",
        active=True,
        created_at=datetime.now(UTC),
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)
    return organization


def _principal(organization_id: int) -> TenantPrincipal:
    return TenantPrincipal(
        user_id=1,
        organization_id=organization_id,
        email="owner@example.com",
        role="OWNER",
    )


def _subscription(
    session: Session,
    organization_id: int,
    *,
    plan_id: str = "indie",
    status: str = "active",
    subscription_id: str | None = "sub_current",
    updated_at: datetime | None = None,
) -> SubscriptionRecord:
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization_id,
        plan_id=plan_id,
        status=status,
        stripe_customer_id="cus_current",
        customer_type="personal",
        stripe_subscription_id=subscription_id,
        current_period_end=now + timedelta(days=30),
        cancel_at_period_end=False,
        created_at=now,
        updated_at=updated_at or now,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def _configure_stripe(monkeypatch) -> None:
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_hardening")
    monkeypatch.setenv("STRIPE_MODE", "test")
    monkeypatch.setenv("STRIPE_MANAGED_PAYMENTS_ENABLED", "true")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    monkeypatch.setenv("STRIPE_PRICE_INDIE_PERSONAL", "price_indie")
    monkeypatch.setenv("STRIPE_PRICE_INDIE_BUSINESS", "price_indie_business")
    monkeypatch.setenv("STRIPE_PRICE_GROWTH_PERSONAL", "price_growth")
    monkeypatch.setenv("STRIPE_PRICE_GROWTH_BUSINESS", "price_growth_business")
    monkeypatch.setenv("STRIPE_PRICE_STUDIO_PERSONAL", "price_studio")
    monkeypatch.setenv("STRIPE_PRICE_STUDIO_BUSINESS", "price_studio_business")
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_active_subscription_cannot_start_second_checkout(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    _subscription(session, organization.id, status="active")

    async def unexpected_stripe_call(*args, **kwargs):
        raise AssertionError("Stripe must not be called for an already managed subscription")

    monkeypatch.setattr(billing, "_stripe_post", unexpected_stripe_call)

    with pytest.raises(HTTPException) as exc:
        await create_checkout(CheckoutCreate(plan_id="growth"), _principal(organization.id), session)

    assert exc.value.status_code == 409
    assert "Manage subscription" in exc.value.detail
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_fresh_pending_checkout_cannot_be_duplicated(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    _subscription(
        session,
        organization.id,
        status="checkout_pending",
        subscription_id=None,
        updated_at=datetime.now(UTC) - timedelta(minutes=5),
    )

    async def unexpected_stripe_call(*args, **kwargs):
        raise AssertionError("Stripe must not be called while checkout is already pending")

    monkeypatch.setattr(billing, "_stripe_post", unexpected_stripe_call)

    with pytest.raises(HTTPException) as exc:
        await create_checkout(CheckoutCreate(plan_id="growth"), _principal(organization.id), session)

    assert exc.value.status_code == 409
    assert "already in progress" in exc.value.detail
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_stale_pending_checkout_can_retry_with_idempotency_key(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    record = _subscription(
        session,
        organization.id,
        status="checkout_pending",
        subscription_id=None,
        updated_at=datetime.now(UTC) - timedelta(minutes=31),
    )
    captured: dict[str, object] = {}

    async def fake_stripe_post(path, data, *, idempotency_key=None):
        captured["path"] = path
        captured["data"] = data
        captured["idempotency_key"] = idempotency_key
        return {"id": "cs_retry", "url": "https://checkout.stripe.test/retry"}

    monkeypatch.setattr(billing, "_stripe_post", fake_stripe_post)

    result = await create_checkout(
        CheckoutCreate(plan_id="growth"),
        _principal(organization.id),
        session,
    )

    session.refresh(record)
    assert result["checkout_session_id"] == "cs_retry"
    assert captured["path"] == "checkout/sessions"
    assert str(captured["idempotency_key"]).startswith(
        f"playdirective-checkout-{organization.id}-growth-"
    )
    assert record.plan_id == "growth"
    assert record.status == "checkout_pending"
    get_settings.cache_clear()


def test_subscription_price_wins_over_stale_metadata_after_portal_plan_change(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    record = _subscription(session, organization.id, plan_id="indie", status="active")

    _upsert_from_subscription(
        session,
        {
            "id": "sub_current",
            "customer": "cus_current",
            "status": "active",
            "metadata": {"organization_id": str(organization.id), "plan_id": "indie"},
            "items": {"data": [{"price": {"id": "price_growth"}}]},
            "cancel_at_period_end": False,
        },
    )
    session.commit()
    session.refresh(record)

    assert record.plan_id == "growth"
    assert record.stripe_subscription_id == "sub_current"
    get_settings.cache_clear()


def test_different_subscription_webhook_cannot_replace_managed_subscription(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    record = _subscription(session, organization.id, plan_id="indie", status="active")

    _upsert_from_subscription(
        session,
        {
            "id": "sub_duplicate",
            "customer": "cus_current",
            "status": "active",
            "metadata": {"organization_id": str(organization.id), "plan_id": "growth"},
            "items": {"data": [{"price": {"id": "price_growth"}}]},
        },
    )
    session.commit()
    session.refresh(record)

    assert record.plan_id == "indie"
    assert record.stripe_subscription_id == "sub_current"
    assert record.status == "active"
    get_settings.cache_clear()


def test_terminal_subscription_can_be_replaced_by_new_subscription(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    record = _subscription(
        session,
        organization.id,
        plan_id="indie",
        status="canceled",
        subscription_id="sub_old",
    )

    _upsert_from_subscription(
        session,
        {
            "id": "sub_new",
            "customer": "cus_current",
            "status": "active",
            "metadata": {"organization_id": str(organization.id), "plan_id": "growth"},
            "items": {"data": [{"price": {"id": "price_growth"}}]},
        },
    )
    session.commit()
    session.refresh(record)

    assert record.plan_id == "growth"
    assert record.stripe_subscription_id == "sub_new"
    assert record.status == "active"
    get_settings.cache_clear()
