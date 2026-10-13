import hashlib
import hmac
import json
import time
from datetime import UTC, datetime

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import Base
from app.models import (
    NotificationRecord,
    OrganizationRecord,
    PilotApplicationRecord,
    SubscriptionRecord,
)
from app.routes.billing import _entitlements, _verify_signature
from app.routes.enrollment import (
    ApplicationApprove,
    ApplicationCreate,
    _slugify,
    approve_application,
    create_application,
)


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


def test_r16_tables_are_created_in_clean_database():
    session = _session()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="billing-test",
        name="Billing Test",
        data_mode="LIVE",
        active=True,
        created_at=now,
    )
    session.add(organization)
    session.flush()
    session.add(
        SubscriptionRecord(
            organization_id=organization.id,
            plan_id="pilot",
            status="pilot",
            stripe_customer_id=None,
            stripe_subscription_id=None,
            current_period_end=None,
            cancel_at_period_end=False,
            created_at=now,
            updated_at=now,
        )
    )
    session.commit()
    assert session.scalar(select(SubscriptionRecord)).plan_id == "pilot"


def test_slugify_produces_safe_studio_slug():
    assert _slugify("Daniel's Awesome Studio GmbH!") == "daniel-s-awesome-studio-gmbh"


@pytest.mark.asyncio
async def test_application_can_be_received_and_approved_without_email_provider():
    get_settings.cache_clear()
    session = _session()
    result = await create_application(
        ApplicationCreate(
            contact_name="Pilot Owner",
            email="owner@example.com",
            studio_name="Pilot Studio",
            universe_id="123456",
        ),
        session,
    )
    assert result["status"] == "received"
    application = session.scalar(select(PilotApplicationRecord))
    assert application.status == "PENDING"
    assert application.email == "owner@example.com"
    assert session.scalar(select(NotificationRecord)).status == "SKIPPED"

    approved = await approve_application(application.id, ApplicationApprove(), session, None)
    assert approved["status"] == "approved"
    assert approved["organization"]["slug"] == "pilot-studio"
    assert "token=" in approved["invite_url"]
    session.refresh(application)
    assert application.status == "APPROVED"
    assert application.organization_id == approved["organization"]["id"]


def test_pilot_and_paid_entitlements_are_explicit():
    pilot = _entitlements("pilot", "pilot")
    assert pilot["pilot_access"] is True
    assert pilot["paid"] is False
    assert pilot["experience_limit"] == 1

    growth = _entitlements("growth", "active")
    assert growth["paid"] is True
    assert growth["experience_limit"] == 3

    canceled = _entitlements("growth", "canceled")
    assert canceled["paid"] is False
    assert canceled["experience_limit"] == 0


def test_stripe_webhook_signature_is_verified(monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret")
    monkeypatch.setenv("STRIPE_WEBHOOK_TOLERANCE_SECONDS", "300")
    get_settings.cache_clear()
    payload = json.dumps({"id": "evt_test", "type": "customer.subscription.updated"}).encode()
    timestamp = int(time.time())
    signature = hmac.new(
        b"whsec_test_secret",
        f"{timestamp}.".encode() + payload,
        hashlib.sha256,
    ).hexdigest()
    _verify_signature(payload, f"t={timestamp},v1={signature}")
    get_settings.cache_clear()


def test_stripe_webhook_rejects_bad_signature(monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret")
    get_settings.cache_clear()
    with pytest.raises(HTTPException) as exc:
        _verify_signature(b"{}", f"t={int(time.time())},v1=wrong")
    assert exc.value.status_code == 400
    get_settings.cache_clear()
