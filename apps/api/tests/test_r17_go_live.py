from datetime import UTC, datetime

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app.models import OrganizationRecord, SubscriptionRecord
from app.r17_models import (
    ApplicationAttributionRecord,
    ApplicationReviewRecord,
    PilotLifecycleRecord,
)
from app.routes.enrollment import ApplicationCreate, create_application
from app.routes.r17 import _ensure_lifecycle, _payload
from app.routes.tenants import _experience_limit


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return Session(engine)


@pytest.mark.asyncio
async def test_application_attribution_and_pipeline_are_persisted():
    session = _session()
    result = await create_application(
        ApplicationCreate(
            contact_name="Growth Lead",
            email="growth@example.com",
            studio_name="Growth Studio",
            utm_source="reddit",
            utm_medium="paid-social",
            utm_campaign="founding-pilot",
            landing_page="https://playdirective.com/apply?utm_source=reddit",
        ),
        session,
    )
    assert result["status"] == "received"
    attribution = session.scalar(select(ApplicationAttributionRecord))
    review = session.scalar(select(ApplicationReviewRecord))
    assert attribution.utm_source == "reddit"
    assert attribution.utm_campaign == "founding-pilot"
    assert review.pipeline_status == "APPLIED"


def test_pilot_lifecycle_starts_at_thirty_days():
    session = _session()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="pilot-30-days",
        name="Pilot 30 Days",
        data_mode="LIVE",
        active=True,
        created_at=now,
    )
    session.add(organization)
    session.commit()
    session.refresh(organization)

    lifecycle = _ensure_lifecycle(session, organization.id)
    payload = _payload(lifecycle)
    assert isinstance(session.scalar(select(PilotLifecycleRecord)), PilotLifecycleRecord)
    assert payload["status"] == "ACTIVE"
    assert payload["current_day"] == 1
    assert payload["days_remaining"] == 30


def test_experience_limits_follow_subscription_plan():
    session = _session()
    now = datetime.now(UTC)
    organization = OrganizationRecord(
        slug="limits",
        name="Limits",
        data_mode="LIVE",
        active=True,
        created_at=now,
    )
    session.add(organization)
    session.flush()
    assert _experience_limit(session, organization.id) == 3

    subscription = SubscriptionRecord(
        organization_id=organization.id,
        plan_id="growth",
        status="active",
        stripe_customer_id="cus_test",
        stripe_subscription_id="sub_test",
        current_period_end=None,
        cancel_at_period_end=False,
        created_at=now,
        updated_at=now,
    )
    session.add(subscription)
    session.commit()
    assert _experience_limit(session, organization.id) == 3

    subscription.plan_id = "studio"
    session.commit()
    assert _experience_limit(session, organization.id) == 10
