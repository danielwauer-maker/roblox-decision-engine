import hashlib
import hmac
import json
import time
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException, Request
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access
from app.config import get_settings
from app.db import Base
from app.models import (
    OrganizationRecord,
    PilotUserRecord,
    StandardTrialSignupRecord,
    SubscriptionRecord,
)
from app.r17_models import PilotLifecycleRecord
from app.routes import billing, enrollment
from app.routes.billing import PlanChangeCreate, change_plan, stripe_webhook
from app.routes.enrollment import (
    LoginLinkRedeem,
    StandardTrialSignup,
    create_standard_trial_signup,
    redeem_standard_trial_signup,
)
from app.tenant_security import TenantPrincipal


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def _org(session: Session, name: str = "Studio") -> OrganizationRecord:
    now = datetime.now(UTC)
    row = OrganizationRecord(slug=f"studio-{int(now.timestamp() * 1000000)}", name=name, data_mode="LIVE", active=True, created_at=now)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def _principal(org_id: int, role: str = "OWNER") -> TenantPrincipal:
    return TenantPrincipal(user_id=1, organization_id=org_id, email="owner@example.com", role=role)


def _configure(monkeypatch, *, mode="standard"):
    for key, value in {
        "STRIPE_MODE": "test",
        "STRIPE_MANAGED_PAYMENTS_ENABLED": "true",
        "STRIPE_TEST_BILLING_MODE": "false",
        "STRIPE_SECRET_KEY": "sk_test_fake",
        "STRIPE_WEBHOOK_SECRET": "whsec_fake",
        "STRIPE_PRICE_INDIE_PERSONAL": "price_indie",
        "STRIPE_PRICE_INDIE_BUSINESS": "price_indie_business",
        "STRIPE_PRICE_GROWTH_PERSONAL": "price_growth",
        "STRIPE_PRICE_GROWTH_BUSINESS": "price_growth_business",
        "STRIPE_PRICE_STUDIO_PERSONAL": "price_studio",
        "STRIPE_PRICE_STUDIO_BUSINESS": "price_studio_business",
        "PLAYDIRECTIVE_COMMERCIAL_MODE": mode,
    }.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()


def _webhook_request(event: dict) -> Request:
    payload = json.dumps(event, separators=(",", ":")).encode()
    timestamp = int(time.time())
    signature = hmac.new(b"whsec_fake", f"{timestamp}.".encode() + payload, hashlib.sha256).hexdigest()
    async def receive():
        return {"type": "http.request", "body": payload, "more_body": False}
    return Request({"type": "http", "method": "POST", "path": "/v1/billing/webhook", "headers": [(b"stripe-signature", f"t={timestamp},v1={signature}".encode())]}, receive)


@pytest.mark.asyncio
async def test_upgrade_waits_for_paid_invoice_and_uses_full_new_price(monkeypatch):
    _configure(monkeypatch, mode="pilot")
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(organization_id=org.id, plan_id="indie", status="active", stripe_customer_id="cus", customer_type="personal", stripe_subscription_id="sub", current_period_start=now - timedelta(days=10), current_period_end=now + timedelta(days=20), cancel_at_period_end=False, created_at=now - timedelta(days=10), updated_at=now - timedelta(days=1))
    session.add(record)
    session.commit()
    calls = []
    async def fake_get(path):
        assert path == "subscriptions/sub?expand[]=items.data.price"
        return {"items": {"data": [{"id": "si_1", "price": {"id": "price_indie"}}]}}
    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data, idempotency_key))
        return {"status": "active"}
    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)

    result = await change_plan(PlanChangeCreate(plan_id="growth", request_key="upgrade-request-001"), _principal(org.id), session)
    session.refresh(record)
    params = dict(calls[0][1])
    assert result["status"] == "awaiting_billing_confirmation"
    assert params["items[0][price]"] == "price_growth"
    assert params["proration_behavior"] == "none"
    assert params["billing_cycle_anchor"] == "now"
    assert params["payment_behavior"] == "error_if_incomplete"
    assert record.plan_id == "indie"
    assert record.pending_plan_id == "growth"

    billing._upsert_from_subscription(session, {"id": "sub", "customer": "cus", "status": "active", "items": {"data": [{"price": {"id": "price_growth"}}]}})
    session.commit()
    session.refresh(record)
    assert record.plan_id == "indie"

    await stripe_webhook(_webhook_request({
        "id": "evt_upgrade_paid", "type": "invoice.paid", "data": {"object": {
            "id": "in_upgrade", "customer": "cus", "subscription": "sub", "billing_reason": "subscription_update",
            "lines": {"data": [{"price": {"id": "price_growth"}}]},
        }},
    }), session)
    session.refresh(record)
    assert record.plan_id == "growth"
    assert record.pending_plan_id is None
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_downgrade_is_scheduled_at_current_period_end(monkeypatch):
    _configure(monkeypatch, mode="pilot")
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    period_end = now + timedelta(days=17)
    record = SubscriptionRecord(organization_id=org.id, plan_id="studio", status="active", stripe_customer_id="cus", customer_type="personal", stripe_subscription_id="sub", current_period_start=now - timedelta(days=13), current_period_end=period_end, cancel_at_period_end=False, created_at=now - timedelta(days=13), updated_at=now)
    session.add(record)
    session.commit()
    calls = []
    async def fake_get(path):
        return {"items": {"data": [{"id": "si_1", "quantity": 1, "price": {"id": "price_studio"}}]}}
    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data, idempotency_key))
        if path == "subscription_schedules":
            return {"id": "sub_sched_1", "current_phase": {"start_date": int((now - timedelta(days=13)).timestamp()), "end_date": int(period_end.timestamp())}}
        return {"id": "sub_sched_1"}
    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    result = await change_plan(PlanChangeCreate(plan_id="indie", request_key="downgrade-request-1"), _principal(org.id), session)
    session.refresh(record)
    assert result["status"] == "scheduled"
    assert record.plan_id == "studio"
    assert record.pending_plan_id == "indie"
    assert record.pending_plan_effective_at.replace(tzinfo=UTC) == period_end
    assert record.stripe_subscription_schedule_id == "sub_sched_1"
    update = dict(calls[1][1])
    assert update["phases[1][items][0][price]"] == "price_indie"
    assert update["phases[1][start_date]"] == str(int(period_end.timestamp()))
    assert update["phases[1][iterations]"] == "1"
    billing._upsert_from_subscription(session, {"id": "sub", "customer": "cus", "status": "active", "items": {"data": [{"price": {"id": "price_indie"}}]}})
    session.commit()
    session.refresh(record)
    assert record.plan_id == "indie"
    assert record.pending_plan_id is None
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_standard_trial_signup_verifies_email_then_creates_owner_without_starting_pilot(monkeypatch):
    _configure(monkeypatch)
    session = _session()
    monkeypatch.setattr(enrollment, "new_opaque_token", lambda: "A" * 40)
    sent = []
    async def fake_send(*args, **kwargs):
        sent.append(kwargs)
    monkeypatch.setattr(enrollment, "send_notification_once", fake_send)
    response = await create_standard_trial_signup(StandardTrialSignup(email="Owner@Example.com", contact_name="Owner", studio_name="Trial Studio"), session)
    signup = session.scalar(select(StandardTrialSignupRecord))
    assert response["status"] == "accepted"
    assert signup is not None and signup.email == "owner@example.com"
    assert sent

    result = redeem_standard_trial_signup(LoginLinkRedeem(token="A" * 40), session)
    org = session.get(OrganizationRecord, result["organization"]["id"])
    owner = session.scalar(select(PilotUserRecord).where(PilotUserRecord.organization_id == org.id))
    subscription = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.organization_id == org.id))
    assert result["start_trial_checkout"] is True
    assert owner.role == "OWNER"
    assert subscription.plan_id == "indie"
    assert subscription.status == "trial_signup_pending"
    assert session.scalar(select(PilotLifecycleRecord).where(PilotLifecycleRecord.organization_id == org.id)) is None
    assert evaluate_product_access(session, org.id).allowed is False
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_standard_trial_rejects_existing_pilot_email(monkeypatch):
    _configure(monkeypatch)
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    session.add(PilotUserRecord(organization_id=org.id, email="pilot@example.com", role="OWNER", active=True, created_at=now))
    session.add(PilotLifecycleRecord(organization_id=org.id, status="EXPIRED", started_at=now-timedelta(days=40), ends_at=now-timedelta(days=10), pilot_consumed_at=now-timedelta(days=40), converted_at=None, closed_at=now-timedelta(days=10), updated_at=now))
    session.commit()
    with pytest.raises(HTTPException) as exc:
        await create_standard_trial_signup(StandardTrialSignup(email="pilot@example.com", contact_name="Owner", studio_name="Old Pilot"), session)
    assert exc.value.status_code == 409
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_repeated_upgrade_request_is_idempotent_and_owner_only(monkeypatch):
    _configure(monkeypatch, mode="pilot")
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(organization_id=org.id, plan_id="indie", status="active", stripe_customer_id="cus", customer_type="personal", stripe_subscription_id="sub", current_period_start=now-timedelta(days=3), current_period_end=now+timedelta(days=27), cancel_at_period_end=False, created_at=now-timedelta(days=3), updated_at=now)
    session.add(record)
    session.commit()
    calls = []
    async def fake_get(path):
        return {"items": {"data": [{"id": "si_1", "price": {"id": "price_indie"}}]}}
    async def fake_post(path, data, *, idempotency_key=None):
        calls.append(path)
        return {"status": "active"}
    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    payload = PlanChangeCreate(plan_id="growth", request_key="repeat-upgrade-0001")
    first = await change_plan(payload, _principal(org.id), session)
    second = await change_plan(payload, _principal(org.id), session)
    assert first["status"] == "awaiting_billing_confirmation"
    assert second["status"] == "pending"
    assert calls == [f"subscriptions/{record.stripe_subscription_id}"]
    with pytest.raises(HTTPException) as exc:
        await change_plan(PlanChangeCreate(plan_id="studio", request_key="owner-required-0001"), _principal(org.id, "MEMBER"), session)
    assert exc.value.status_code == 403
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_business_upgrade_uses_business_price_and_preserves_customer_type(monkeypatch):
    _configure(monkeypatch, mode="pilot")
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    record = SubscriptionRecord(organization_id=org.id, plan_id="indie", status="active", stripe_customer_id="cus_business", customer_type="business", stripe_tax_id_id="txi", tax_id_verification_status="verified", stripe_subscription_id="sub_business", current_period_start=now-timedelta(days=3), current_period_end=now+timedelta(days=27), cancel_at_period_end=False, created_at=now-timedelta(days=3), updated_at=now)
    session.add(record)
    session.commit()
    calls = []

    async def fake_get(path):
        return {"items": {"data": [{"id": "si_business", "price": {"id": "price_indie_business"}}]}}

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data))
        return {"status": "active"}

    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    await change_plan(PlanChangeCreate(plan_id="growth", request_key="business-upgrade-0001"), _principal(org.id), session)
    assert dict(calls[0][1])["items[0][price]"] == "price_growth_business"
    await stripe_webhook(_webhook_request({
        "id": "evt_business_upgrade_paid", "type": "invoice.paid", "data": {"object": {
            "id": "in_business_upgrade", "customer": "cus_business", "subscription": "sub_business",
            "lines": {"data": [{"price": {"id": "price_growth_business"}}]},
        }},
    }), session)
    session.refresh(record)
    assert record.plan_id == "growth"
    assert record.customer_type == "business"
    assert record.stripe_price_id == "price_growth_business"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_business_scheduled_downgrade_keeps_business_price(monkeypatch):
    _configure(monkeypatch, mode="pilot")
    session = _session()
    org = _org(session)
    now = datetime.now(UTC)
    period_end = now + timedelta(days=20)
    record = SubscriptionRecord(organization_id=org.id, plan_id="studio", status="active", stripe_customer_id="cus_business", customer_type="business", stripe_subscription_id="sub_business", current_period_start=now-timedelta(days=10), current_period_end=period_end, cancel_at_period_end=False, created_at=now-timedelta(days=10), updated_at=now)
    session.add(record)
    session.commit()
    calls = []

    async def fake_get(path):
        return {"items": {"data": [{"id": "si_business", "quantity": 1, "price": {"id": "price_studio_business"}}]}}

    async def fake_post(path, data, *, idempotency_key=None):
        calls.append((path, data))
        if path == "subscription_schedules":
            return {"id": "schedule_business", "current_phase": {"start_date": int(now.timestamp()), "end_date": int(period_end.timestamp())}}
        return {"id": "schedule_business"}

    monkeypatch.setattr(billing, "_stripe_get", fake_get)
    monkeypatch.setattr(billing, "_stripe_post", fake_post)
    result = await change_plan(PlanChangeCreate(plan_id="indie", request_key="business-downgrade-0001"), _principal(org.id), session)
    schedule_update = dict(calls[1][1])
    assert result["status"] == "scheduled"
    assert schedule_update["phases[1][items][0][price]"] == "price_indie_business"
    assert record.customer_type == "business"
    get_settings.cache_clear()
