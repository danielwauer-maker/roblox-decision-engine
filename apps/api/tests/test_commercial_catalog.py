from datetime import UTC, datetime
from pathlib import Path

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.commercial_catalog import _catalog_path, catalog, plans_by_id
from app.db import Base
from app.models import (
    DecisionCreditUsageRecord,
    MetricObservationRecord,
    OrganizationRecord,
    PilotUserRecord,
    SubscriptionRecord,
)
from app.routes.billing import PLANS
from app.routes.tenant_insights import DecisionGenerationRequest, generate_decision
from app.routes.tenants import InviteCreate, create_invite
from app.services.decision_credits import consume_credit, credit_period
from app.services.decision_snapshots import _rows
from app.stripe_catalog_validation import validate_price
from app.tenant_security import TenantPrincipal


def test_catalog_exact_plan_matrix_and_api_contract():
    expected = {"indie": (24, 1, 1, 90, 50), "growth": (59, 3, 3, 365, 250), "studio": (119, 10, 10, 730, 1000)}
    assert set(plans_by_id()) == set(expected)
    for plan_id, values in expected.items():
        plan = plans_by_id()[plan_id]
        assert (plan["monthly_price_usd"], plan["max_experiences"], plan["max_team_members"], plan["history_days"], plan["monthly_decision_credits"]) == values
        assert PLANS[plan_id] == plan
    assert plans_by_id()["growth"]["recommended"] is True


@pytest.mark.parametrize("layout", ["docker", "repository"])
def test_catalog_path_supports_docker_and_repository_layouts(monkeypatch, layout):
    root = Path(__file__).resolve().parents[2] / "synthetic-layout"
    if layout == "docker":
        module = root / "docker" / "app" / "commercial_catalog.py"
        expected = module.parents[1] / "shared" / "commercial_plans.json"
    else:
        module = root / "repository" / "apps" / "api" / "app" / "commercial_catalog.py"
        expected = module.parents[2] / "shared" / "commercial_plans.json"
    expected = expected.resolve()
    monkeypatch.setattr(Path, "is_file", lambda path: path == expected)

    assert _catalog_path(module) == expected


def test_website_uses_same_catalog_without_duplicate_plan_values():
    page = (catalog_path := __import__("pathlib").Path(__file__).resolve().parents[2] / "shared" / "commercial_plans.json").read_text(encoding="utf-8")
    web = (catalog_path.parents[1] / "web" / "app" / "pricing" / "page.tsx").read_text(encoding="utf-8")
    assert 'import catalog from "../../../shared/commercial_plans.json"' in web
    assert all(f'"monthly_price_usd": {amount}' in page for amount in (24, 59, 119))
    assert "MOST POPULAR" in web and "Coming soon" in web
    master = (catalog_path.parents[2] / "docs" / "PRODUCT_MASTER.md").read_text(encoding="utf-8")
    assert "$24 (1 Experience, 1 seat, 90 days history, 50 Decision credits)" in master
    assert "$59 (3 Experiences, 3 seats, 365 days, 250 credits; recommended)" in master
    assert "$119 (10 Experiences, 10 seats, 730 days, 1,000 credits)" in master


def test_pilot_and_standard_trial_rules_are_central():
    pilot = catalog()["pilot"]
    trial = catalog()["standard_trial"]
    assert (pilot["duration_days"], pilot["payment_method_required"], pilot["automatic_paid_conversion"], pilot["max_experiences"], pilot["max_team_members"], pilot["decision_credits"]) == (30, False, False, 3, 3, 250)
    assert (trial["plan_id"], trial["duration_days"], trial["payment_method_required"], trial["automatic_paid_conversion"]) == ("indie", 14, True, True)


def test_decision_credit_deduplicates_request_and_counts_usage():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        org = OrganizationRecord(slug="credit-test", name="Credit Test", data_mode="LIVE", active=True, created_at=datetime.now(UTC))
        session.add(org); session.commit()
        first = consume_credit(session, org.id, "request-0001")
        duplicate = consume_credit(session, org.id, "request-0001")
        assert first["consumed"] is True and first["used"] == 1
        assert duplicate["duplicate"] is True and duplicate["consumed"] is False
        assert session.query(DecisionCreditUsageRecord).count() == 1


def test_stripe_preflight_detects_amount_currency_and_metadata_mismatches():
    plan = plans_by_id()["growth"]
    okay = {"active": True, "currency": "usd", "unit_amount": 5900, "recurring": {"interval": "month", "interval_count": 1}, "tax_behavior": "inclusive", "metadata": {"playdirective_plan": "growth", "playdirective_customer_type": "personal"}}
    product = {"active": True, "name": "PlayDirective Growth - Personal", "tax_code": "txcd_10103000", "metadata": {"playdirective_plan": "growth", "playdirective_customer_type": "personal"}}
    assert validate_price("growth", "personal", plan, okay, product) == []
    bad = {"currency": "eur", "unit_amount": 19, "recurring": {"interval": "year"}}
    assert len(validate_price("growth", "personal", plan, bad, {})) >= 9


def test_stripe_preflight_validates_business_tax_variant():
    plan = plans_by_id()["indie"]
    price = {"active": True, "currency": "usd", "unit_amount": 2400, "recurring": {"interval": "month", "interval_count": 1}, "tax_behavior": "inclusive", "metadata": {"playdirective_plan": "indie", "playdirective_customer_type": "business"}}
    product = {"active": True, "name": "PlayDirective Indie - Business", "tax_code": "txcd_10103001", "metadata": {"playdirective_plan": "indie", "playdirective_customer_type": "business"}}
    assert validate_price("indie", "business", plan, price, product) == []


@pytest.mark.parametrize("plan_id,customer_type,amount", [
    ("indie", "personal", 2400), ("indie", "business", 2400),
    ("growth", "personal", 5900), ("growth", "business", 5900),
    ("studio", "personal", 11900), ("studio", "business", 11900),
])
def test_stripe_catalog_validator_accepts_each_of_six_variants(plan_id, customer_type, amount):
    plan = plans_by_id()[plan_id]
    tax_code = "txcd_10103000" if customer_type == "personal" else "txcd_10103001"
    label = "Personal" if customer_type == "personal" else "Business"
    metadata = {"playdirective_plan": plan_id, "playdirective_customer_type": customer_type}
    price = {"active": True, "currency": "usd", "unit_amount": amount, "recurring": {"interval": "month", "interval_count": 1}, "tax_behavior": "inclusive", "metadata": metadata}
    product = {"active": True, "name": f"PlayDirective {plan['display_name']} - {label}", "tax_code": tax_code, "metadata": metadata}
    assert validate_price(plan_id, customer_type, plan, price, product) == []


def test_paid_credits_exhaust_and_reset_with_new_billing_period():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime(2026, 10, 15, tzinfo=UTC)
    with Session(engine) as session:
        org = OrganizationRecord(slug="paid-credit", name="Paid Credit", data_mode="LIVE", active=True, created_at=now)
        session.add(org); session.flush()
        start = datetime(2026, 10, 1, tzinfo=UTC)
        subscription = SubscriptionRecord(organization_id=org.id, plan_id="indie", status="active", stripe_customer_id="cus", stripe_subscription_id="sub", current_period_start=start, current_period_end=datetime(2026, 11, 1, tzinfo=UTC), cancel_at_period_end=False, created_at=start, updated_at=now)
        session.add(subscription); session.commit()
        assert credit_period(session, org.id, now) == (start, 50)
        for index in range(50):
            consume_credit(session, org.id, f"october-request-{index:03d}", now)
        try:
            consume_credit(session, org.id, "october-request-over", now)
            assert False, "expected exhausted allowance"
        except HTTPException as exc:
            assert exc.status_code == 402
        november = datetime(2026, 11, 1, tzinfo=UTC)
        subscription.current_period_start = november; session.commit()
        result = consume_credit(session, org.id, "november-request-001", november)
        assert result["used"] == 1 and result["allowance"] == 50


def test_pilot_seat_limit_counts_active_members_and_pending_invites():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)
    with Session(engine) as session:
        org = OrganizationRecord(slug="seat-limit", name="Seat Limit", data_mode="LIVE", active=True, created_at=now)
        session.add(org); session.flush()
        for index in range(2):
            session.add(PilotUserRecord(organization_id=org.id, email=f"member{index}@example.com", role="MEMBER", active=True, created_at=now))
        session.commit()
        first = create_invite(InviteCreate(organization_id=org.id, email="new@example.com", role="MEMBER"), session, None)
        assert first["organization_id"] == org.id
        with __import__("pytest").raises(HTTPException) as exc:
            create_invite(InviteCreate(organization_id=org.id, email="another@example.com", role="MEMBER"), session, None)
        assert exc.value.status_code == 409


def test_history_query_uses_entitled_cutoff_without_deleting_observations():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)
    with Session(engine) as session:
        org = OrganizationRecord(slug="history", name="History", data_mode="LIVE", active=True, created_at=now)
        session.add(org); session.flush()
        for offset in (30, 120):
            observed = now - __import__("datetime").timedelta(days=offset)
            session.add(MetricObservationRecord(organization_id=org.id, universe_id="123", metric="DailyActiveUsers", observed_at=observed, value=1, dimensions_json="{}", dimensions_key="", status=None, ingested_at=now))
        session.commit()
        visible = _rows(session, "123", "DailyActiveUsers", organization_id=org.id, since=now - __import__("datetime").timedelta(days=90))
        assert len(visible) == 1
        assert session.query(MetricObservationRecord).filter_by(organization_id=org.id).count() == 2


@pytest.mark.asyncio
async def test_failed_decision_generation_does_not_consume_credit(monkeypatch):
    from types import SimpleNamespace

    import app.routes.tenant_insights as insights

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        now = datetime.now(UTC)
        org = OrganizationRecord(slug="failed-generation", name="Failed Generation", data_mode="LIVE", active=True, created_at=now)
        session.add(org); session.commit()
        principal = TenantPrincipal(user_id=1, organization_id=org.id, email="owner@example.com", role="OWNER")
        monkeypatch.setattr(insights, "_snapshot", lambda *_args: (SimpleNamespace(id=1, universe_id="123"), object()))
        monkeypatch.setattr(insights, "evaluate_snapshot", lambda _snapshot: [object()])

        async def fail_generation(_priorities):
            raise RuntimeError("model provider unavailable")

        monkeypatch.setattr(insights, "generate_analyst_brief", fail_generation)
        try:
            await generate_decision(principal, session, DecisionGenerationRequest(request_key="failed-request-001"))
            assert False, "expected provider failure"
        except RuntimeError as exc:
            assert str(exc) == "model provider unavailable"
        assert session.query(DecisionCreditUsageRecord).count() == 0
