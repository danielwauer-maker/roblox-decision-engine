import hashlib
import hmac
import json
import time
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException, Request
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base
from app.models import OrganizationRecord, StripeWebhookEventRecord, SubscriptionRecord
from app.r17_models import PilotLifecycleRecord
from app.routes import billing
from app.routes.billing import (
    BillingProfileUpdate,
    CheckoutCreate,
    create_checkout,
    create_portal,
    stripe_webhook,
    update_billing_profile,
)
from app.tenant_security import TenantPrincipal


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _organization(session: Session) -> OrganizationRecord:
    row = OrganizationRecord(
        slug="stripe-integration",
        name="Stripe Integration Studio",
        data_mode="LIVE",
        active=True,
        created_at=datetime.now(UTC),
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _principal(organization_id: int) -> TenantPrincipal:
    return TenantPrincipal(
        user_id=1,
        organization_id=organization_id,
        email="owner@example.com",
        role="OWNER",
    )


def _configure_stripe(monkeypatch) -> None:
    monkeypatch.setenv("STRIPE_MODE", "test")
    monkeypatch.setenv("STRIPE_MANAGED_PAYMENTS_ENABLED", "true")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_integration")
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_integration")
    monkeypatch.setenv("STRIPE_PORTAL_CONFIGURATION_ID", "bpc_restricted")
    monkeypatch.setenv("STRIPE_PRICE_INDIE_PERSONAL", "price_indie")
    monkeypatch.setenv("STRIPE_PRICE_INDIE_BUSINESS", "price_indie_business")
    monkeypatch.setenv("STRIPE_PRICE_GROWTH_PERSONAL", "price_growth")
    monkeypatch.setenv("STRIPE_PRICE_GROWTH_BUSINESS", "price_growth_business")
    monkeypatch.setenv("STRIPE_PRICE_STUDIO_PERSONAL", "price_studio")
    monkeypatch.setenv("STRIPE_PRICE_STUDIO_BUSINESS", "price_studio_business")
    get_settings.cache_clear()


def _webhook_request(monkeypatch, event: dict) -> Request:
    _configure_stripe(monkeypatch)
    payload = json.dumps(event, separators=(",", ":")).encode()
    timestamp = int(time.time())
    signed = f"{timestamp}.".encode() + payload
    digest = hmac.new(b"whsec_integration", signed, hashlib.sha256).hexdigest()
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/v1/billing/webhook",
        "headers": [(b"stripe-signature", f"t={timestamp},v1={digest}".encode())],
    }

    async def receive():
        return {"type": "http.request", "body": payload, "more_body": False}

    return Request(scope, receive)


def test_six_explicit_price_mappings_are_server_owned(monkeypatch):
    _configure_stripe(monkeypatch)
    assert billing._price_ids() == {
        ("indie", "personal"): "price_indie",
        ("indie", "business"): "price_indie_business",
        ("growth", "personal"): "price_growth",
        ("growth", "business"): "price_growth_business",
        ("studio", "personal"): "price_studio",
        ("studio", "business"): "price_studio_business",
    }
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_checkout_reuses_existing_personal_customer_and_uses_mapped_price(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(organization_id=organization.id, plan_id="pilot", status="pilot", stripe_customer_id="cus_created", customer_type="personal", cancel_at_period_end=False, created_at=now, updated_at=now)
    session.add(record)
    session.commit()
    calls = []

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data, idempotency_key))
        return {"id": "cs_created", "url": "https://checkout.stripe.test/session"}

    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    result = await create_checkout(
        CheckoutCreate(plan_id="growth"), _principal(organization.id), session
    )

    record = session.scalar(
        select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization.id)
    )
    assert result["checkout_session_id"] == "cs_created"
    assert calls[0][0] == "checkout/sessions"
    assert ("line_items[0][price]", "price_growth") in calls[0][1]
    assert ("customer", "cus_created") in calls[0][1]
    assert ("metadata[playdirective_customer_type]", "personal") in calls[0][1]
    assert ("subscription_data[metadata][playdirective_customer_type]", "personal") in calls[0][1]
    assert ("managed_payments[enabled]", "true") in calls[0][1]
    assert not any(key.startswith(("tax_id_collection", "customer_update")) for key, _ in calls[0][1])
    assert record and record.stripe_customer_id == "cus_created"
    assert record.status == "checkout_pending"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_standard_test_billing_mode_creates_checkout_without_managed_payments(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("STRIPE_MANAGED_PAYMENTS_ENABLED", "false")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "true")
    get_settings.cache_clear()
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(SubscriptionRecord(
        organization_id=organization.id,
        plan_id="pilot",
        status="pilot",
        stripe_customer_id="cus_test_lane",
        customer_type="personal",
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    ))
    session.commit()
    calls = []

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data))
        return {"id": "cs_test_lane", "url": "https://checkout.stripe.test/session"}

    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    result = await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)

    assert result["checkout_session_id"] == "cs_test_lane"
    assert ("line_items[0][price]", "price_indie") in calls[0][1]
    assert ("customer", "cus_test_lane") in calls[0][1]
    assert not any(key == "managed_payments[enabled]" for key, _ in calls[0][1])
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_checkout_stays_disabled_when_both_test_lanes_are_off(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("STRIPE_MANAGED_PAYMENTS_ENABLED", "false")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    get_settings.cache_clear()
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(SubscriptionRecord(
        organization_id=organization.id,
        plan_id="pilot",
        status="pilot",
        stripe_customer_id="cus_test_lane",
        customer_type="personal",
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    ))
    session.commit()

    with pytest.raises(HTTPException) as error:
        await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)
    assert error.value.status_code == 503
    assert "STRIPE_TEST_BILLING_MODE" in error.value.detail
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_business_profile_attaches_and_verifies_vat_before_checkout(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    calls = []

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data))
        if path == "customers": return {"id": "cus_business"}
        if path.endswith("/tax_ids"): return {"id": "txi_verified", "type": "eu_vat", "value": "DE123456789", "verification": {"status": "verified"}}
        if path == "checkout/sessions": return {"id": "cs_business", "url": "https://checkout.stripe.test/business"}
        return {"id": "cus_business"}

    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    profile = await update_billing_profile(
        BillingProfileUpdate(customer_type="business", company_name="Example GmbH", billing_country="DE", vat_id="DE123456789"),
        _principal(organization.id), session,
    )
    assert profile["tax_id_verification_status"] == "verified"
    assert calls[0][0] == "customers"
    assert calls[1][0] == "customers/cus_business"
    assert calls[2][0] == "customers/cus_business/tax_ids"
    assert ("type", "eu_vat") in calls[2][1]
    stored = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization.id))
    assert stored.stripe_tax_id_id == "txi_verified"
    assert stored.tax_id_last4 == "6789"
    assert not hasattr(stored, "vat_id")

    result = await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)
    checkout_data = calls[-1][1]
    assert result["checkout_session_id"] == "cs_business"
    assert ("line_items[0][price]", "price_indie_business") in checkout_data
    assert ("customer", "cus_business") in checkout_data
    assert calls.index(("customers/cus_business/tax_ids", calls[2][1])) < len(calls) - 1
    assert not any(key.startswith(("tax_id_collection", "customer_update")) for key, _ in checkout_data)
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_business_checkout_fails_closed_until_vat_is_verified(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(SubscriptionRecord(organization_id=organization.id, plan_id="pilot", status="pilot", stripe_customer_id="cus", customer_type="business", stripe_tax_id_id="txi", tax_id_verification_status="pending", cancel_at_period_end=False, created_at=now, updated_at=now))
    session.commit()
    with pytest.raises(HTTPException, match="verification is pending"):
        await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)
    get_settings.cache_clear()


def test_checkout_rejects_arbitrary_price_id():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        CheckoutCreate(plan_id="indie", price_id="price_attacker")


@pytest.mark.asyncio
async def test_tax_id_verification_webhook_updates_only_matching_saved_tax_id(monkeypatch):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(organization_id=organization.id, plan_id="indie", status="pilot", stripe_customer_id="cus_tax", customer_type="business", stripe_tax_id_id="txi_1", tax_id_last4="6789", tax_id_verification_status="pending", cancel_at_period_end=False, created_at=now, updated_at=now)
    session.add(record)
    session.commit()
    await stripe_webhook(_webhook_request(monkeypatch, {
        "id": "evt_tax_verified", "type": "customer.tax_id.updated", "data": {"object": {
            "id": "txi_1", "customer": "cus_tax", "type": "eu_vat", "value": "DE123456789", "verification": {"status": "verified"},
        }},
    }), session)
    session.refresh(record)
    assert record.tax_id_verification_status == "verified"
    assert record.tax_id_last4 == "6789"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_portal_uses_mapped_customer(monkeypatch):
    _configure_stripe(monkeypatch)
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(
        SubscriptionRecord(
            organization_id=organization.id,
            plan_id="indie",
            status="active",
            stripe_customer_id="cus_mapped",
            stripe_subscription_id="sub_active",
            cancel_at_period_end=False,
            created_at=now,
            updated_at=now,
        )
    )
    session.commit()
    captured = {}

    async def fake_post(path, data, *, idempotency_key=None):
        captured.update(path=path, data=data)
        return {"url": "https://billing.stripe.test/portal"}

    async def fake_get(path):
        assert path == "billing_portal/configurations/bpc_restricted"
        return {
            "livemode": False,
            "features": {
                "payment_method_update": {"enabled": True},
                "invoice_history": {"enabled": True},
                "subscription_cancel": {"enabled": True, "mode": "at_period_end", "proration_behavior": "none"},
                "subscription_update": {"enabled": False},
                "subscription_pause": {"enabled": False},
            },
        }

    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    result = await create_portal(_principal(organization.id), session)
    assert result["portal_url"].endswith("/portal")
    assert captured["path"] == "billing_portal/sessions"
    assert ("customer", "cus_mapped") in captured["data"]
    assert ("configuration", "bpc_restricted") in captured["data"]
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_checkout_completed_maps_customer_and_waits_for_subscription_confirmation(
    monkeypatch,
):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="growth",
        status="checkout_pending",
        stripe_customer_id=None,
        stripe_subscription_id=None,
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.commit()
    event = {
        "id": "evt_checkout_complete",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_complete",
                "customer": "cus_checkout",
                "subscription": "sub_checkout",
                "client_reference_id": str(organization.id),
                "metadata": {"organization_id": str(organization.id), "plan_id": "growth"},
            }
        },
    }

    assert await stripe_webhook(_webhook_request(monkeypatch, event), session) == {"received": True}
    session.refresh(record)
    assert record.stripe_customer_id == "cus_checkout"
    assert record.stripe_subscription_id == "sub_checkout"
    assert record.status == "pending_subscription_webhook"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_async_checkout_success_maps_subscription_but_waits_for_paid_invoice(monkeypatch):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status="checkout_pending",
        stripe_customer_id=None,
        stripe_subscription_id=None,
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.commit()
    event = {
        "id": "evt_async_checkout_success",
        "type": "checkout.session.async_payment_succeeded",
        "data": {"object": {
            "id": "cs_async_success", "customer": "cus_async", "subscription": "sub_async",
            "client_reference_id": str(organization.id),
            "metadata": {"organization_id": str(organization.id), "plan_id": "indie"},
        }},
    }

    await stripe_webhook(_webhook_request(monkeypatch, event), session)
    session.refresh(record)
    assert record.stripe_customer_id == "cus_async"
    assert record.stripe_subscription_id == "sub_async"
    assert record.status == "pending_subscription_webhook"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_async_checkout_failure_keeps_initial_subscription_incomplete(monkeypatch):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status="checkout_pending",
        stripe_customer_id=None,
        stripe_subscription_id=None,
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.commit()
    event = {
        "id": "evt_async_checkout_failure",
        "type": "checkout.session.async_payment_failed",
        "data": {"object": {
            "id": "cs_async_failure", "customer": "cus_async_failed", "subscription": "sub_async_failed",
            "client_reference_id": str(organization.id),
            "metadata": {"organization_id": str(organization.id), "plan_id": "indie"},
        }},
    }

    await stripe_webhook(_webhook_request(monkeypatch, event), session)
    session.refresh(record)
    assert record.stripe_customer_id == "cus_async_failed"
    assert record.stripe_subscription_id == "sub_async_failed"
    assert record.status == "incomplete"
    assert record.last_invoice_status == "payment_failed"
    assert record.last_payment_failed_at is None
    get_settings.cache_clear()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("event_type", "initial_status", "expected_status"),
    [
        ("customer.subscription.created", "checkout_pending", "incomplete"),
        ("customer.subscription.updated", "incomplete", "incomplete"),
        ("customer.subscription.updated", "active", "past_due"),
        ("customer.subscription.deleted", "active", "canceled"),
        ("invoice.paid", "past_due", "active"),
        ("invoice.payment_failed", "active", "past_due"),
    ],
)
async def test_subscription_and_invoice_events_persist_once(
    monkeypatch, event_type, initial_status, expected_status
):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status=initial_status,
        stripe_customer_id="cus_event",
        stripe_subscription_id="sub_event",
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.commit()
    obj = {
        "id": "in_event" if event_type.startswith("invoice.") else "sub_event",
        "customer": "cus_event",
        "subscription": "sub_event",
        "status": expected_status if event_type.startswith("customer.subscription.") else "active",
        "metadata": {"organization_id": str(organization.id), "plan_id": "indie"},
        "items": {"data": [{"price": {"id": "price_indie"}}]},
    }
    event = {"id": f"evt_{event_type}", "type": event_type, "data": {"object": obj}}
    request = _webhook_request(monkeypatch, event)

    assert await stripe_webhook(request, session) == {"received": True}
    session.refresh(record)
    assert record.status == expected_status
    assert session.scalar(
        select(StripeWebhookEventRecord).where(StripeWebhookEventRecord.event_id == event["id"])
    )
    if event_type.startswith("invoice."):
        assert record.last_invoice_id == "in_event"
        assert record.last_invoice_status == (
            "paid" if event_type == "invoice.paid" else "payment_failed"
        )
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_initial_subscription_access_waits_for_paid_invoice(monkeypatch):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status="pending_subscription_webhook",
        stripe_customer_id="cus_initial",
        stripe_subscription_id="sub_initial",
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.commit()
    request = _webhook_request(
        monkeypatch,
        {
            "id": "evt_initial_invoice_paid",
            "type": "invoice.paid",
            "data": {"object": {"id": "in_initial", "customer": "cus_initial", "subscription": "sub_initial"}},
        },
    )

    await stripe_webhook(request, session)
    session.refresh(record)
    assert record.status == "active"
    assert record.last_invoice_status == "paid"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_duplicate_webhook_event_is_ignored(monkeypatch):
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="indie",
        status="active",
        stripe_customer_id="cus_event",
        stripe_subscription_id="sub_event",
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(record)
    session.add(
        StripeWebhookEventRecord(
            event_id="evt_duplicate", event_type="invoice.payment_failed", processed_at=now
        )
    )
    session.commit()
    event = {
        "id": "evt_duplicate",
        "type": "invoice.payment_failed",
        "data": {
            "object": {"id": "in_duplicate", "customer": "cus_event", "subscription": "sub_event"}
        },
    }

    assert await stripe_webhook(_webhook_request(monkeypatch, event), session) == {
        "received": True,
        "duplicate": True,
    }
    session.refresh(record)
    assert record.status == "active"
    get_settings.cache_clear()


def test_sandbox_refuses_live_api_keys(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_live_do_not_use")
    get_settings.cache_clear()
    with pytest.raises(Exception, match="test-mode secret"):
        billing._stripe_headers()
    get_settings.cache_clear()


def test_stripe_headers_pin_managed_payments_compatible_api_version(monkeypatch):
    _configure_stripe(monkeypatch)
    assert billing._stripe_headers()["Stripe-Version"] == "2026-08-26.dahlia"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_standard_trial_requires_method_is_14_days_and_records_source(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("PLAYDIRECTIVE_COMMERCIAL_MODE", "standard")
    get_settings.cache_clear()
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(SubscriptionRecord(organization_id=organization.id, plan_id="indie", status="trial_signup_pending", stripe_customer_id="cus_trial", customer_type="personal", cancel_at_period_end=False, created_at=now, updated_at=now))
    session.commit()
    calls = []

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data))
        return {"id": "cs_trial", "url": "https://checkout.stripe.test/trial"}

    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    await create_checkout(CheckoutCreate(plan_id="indie", trial=True), _principal(organization.id), session)
    checkout_data = calls[-1][1]
    assert ("payment_method_collection", "always") in checkout_data
    assert ("subscription_data[trial_period_days]", "14") in checkout_data
    assert ("subscription_data[trial_settings][end_behavior][missing_payment_method]", "cancel") in checkout_data
    assert ("subscription_data[metadata][trial_source]", "standard") in checkout_data
    assert ("line_items[0][price]", "price_indie") in checkout_data
    record = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization.id))
    assert record is not None and record.trial_source == "standard"
    assert record.trial_consumed_at is None
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_prior_pilot_workspace_is_rejected_from_standard_trial_before_stripe_calls(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("PLAYDIRECTIVE_COMMERCIAL_MODE", "standard")
    get_settings.cache_clear()
    session = _session()
    organization = _organization(session)
    now = datetime.now(UTC)
    session.add(SubscriptionRecord(organization_id=organization.id, plan_id="pilot", status="pilot", stripe_customer_id="cus_post_pilot", customer_type="personal", cancel_at_period_end=False, created_at=now, updated_at=now))
    session.add(PilotLifecycleRecord(
        organization_id=organization.id, status="EXPIRED", started_at=now - timedelta(days=40),
        ends_at=now - timedelta(days=10), pilot_consumed_at=now - timedelta(days=40),
        converted_at=None, closed_at=now - timedelta(days=10), updated_at=now,
    ))
    session.commit()
    calls = []

    async def should_not_call(path, data, *, idempotency_key=None):
        calls.append(path)
        return {}

    monkeypatch.setattr(billing, "_stripe_post", should_not_call)
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        await create_checkout(CheckoutCreate(plan_id="indie", trial=True), _principal(organization.id), session)
    assert exc.value.status_code == 409
    assert calls == []

    async def paid_checkout(path, data, *, idempotency_key=None):
        calls.append((path, data))
        return {"id": "cs_paid", "url": "https://checkout.stripe.test/paid"}

    monkeypatch.setattr(billing, "_stripe_post", paid_checkout)
    result = await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)
    paid_data = calls[-1][1]
    assert result["checkout_session_id"] == "cs_paid"
    assert not any(key == "subscription_data[trial_period_days]" for key, _ in paid_data)
    assert not any(key == "payment_method_collection" for key, _ in paid_data)
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_checkout_is_blocked_until_managed_payments_is_verified(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("STRIPE_MANAGED_PAYMENTS_ENABLED", "false")
    monkeypatch.setenv("STRIPE_TEST_BILLING_MODE", "false")
    get_settings.cache_clear()
    session = _session()
    organization = _organization(session)
    calls = []

    async def should_not_call(path, data, *, idempotency_key=None):
        calls.append(path)
        return {}

    monkeypatch.setattr(billing, "_stripe_post", should_not_call)
    with pytest.raises(HTTPException) as exc:
        await create_checkout(CheckoutCreate(plan_id="indie"), _principal(organization.id), session)
    assert exc.value.status_code == 503
    assert calls == []
    get_settings.cache_clear()


def test_live_mode_is_rejected(monkeypatch):
    _configure_stripe(monkeypatch)
    monkeypatch.setenv("STRIPE_MODE", "live")
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_live_never_use")
    get_settings.cache_clear()
    with pytest.raises(HTTPException) as exc:
        billing._stripe_headers()
    assert exc.value.status_code == 503
    get_settings.cache_clear()
