import hashlib
import hmac
import json
import secrets
import string
import time
from datetime import UTC, datetime, timedelta
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access
from app.commercial_catalog import catalog, plans_by_id
from app.config import get_settings
from app.db import SessionLocal
from app.models import (
    DecisionCreditUsageRecord,
    OrganizationRecord,
    PilotInviteRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
    StripeWebhookEventRecord,
    SubscriptionRecord,
)
from app.r17_models import PilotLifecycleRecord
from app.services.decision_credits import credit_period
from app.stripe_constants import STRIPE_API_VERSION
from app.tenant_security import TenantDep

router = APIRouter(prefix="/v1/billing", tags=["billing"])

PLANS = plans_by_id()
EU_VAT_COUNTRIES = {
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
    "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
    "RO", "SK", "SI", "ES", "SE",
}

MANAGED_SUBSCRIPTION_STATUSES = {
    "active",
    "trialing",
    "past_due",
    "unpaid",
    "incomplete",
    "paused",
}
CHECKOUT_PENDING_TTL = timedelta(minutes=30)


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]


class CheckoutCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_id: str = Field(pattern=r"^(indie|growth|studio)$")
    trial: bool = False


class BillingProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_type: str = Field(pattern=r"^(personal|business)$")
    company_name: str | None = Field(default=None, max_length=240)
    billing_country: str = Field(min_length=2, max_length=2)
    vat_id: str | None = Field(default=None, min_length=4, max_length=32)
    confirm_type_change: bool = False


class PlanChangeCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plan_id: str = Field(pattern=r"^(indie|growth|studio)$")
    request_key: str = Field(min_length=12, max_length=160)


class BillingActionCreate(BaseModel):
    request_key: str = Field(min_length=12, max_length=160)


def _owner_only(role: str) -> None:
    if role != "OWNER":
        raise HTTPException(status_code=403, detail="Owner role required")


def _price_ids() -> dict[tuple[str, str], str | None]:
    settings = get_settings()
    return {
        ("indie", "personal"): settings.stripe_price_indie_personal,
        ("indie", "business"): settings.stripe_price_indie_business,
        ("growth", "personal"): settings.stripe_price_growth_personal,
        ("growth", "business"): settings.stripe_price_growth_business,
        ("studio", "personal"): settings.stripe_price_studio_personal,
        ("studio", "business"): settings.stripe_price_studio_business,
    }


def _price_id(plan_id: str, customer_type: str | None) -> str | None:
    if customer_type not in {"personal", "business"}:
        return None
    return _price_ids().get((plan_id, customer_type))


def _stripe_billing_enabled(settings=None) -> bool:
    settings = settings or get_settings()
    return settings.stripe_billing_enabled


def _plan_customer_for_price(price_id: str | None) -> tuple[str, str] | None:
    if not price_id:
        return None
    for (plan_id, customer_type), configured in _price_ids().items():
        if configured == price_id:
            return plan_id, customer_type
    return None


def _plan_for_price(price_id: str | None) -> str | None:
    mapped = _plan_customer_for_price(price_id)
    return mapped[0] if mapped else None


def _stripe_headers() -> dict[str, str]:
    settings = get_settings()
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe billing is not configured")
    key = settings.stripe_secret_key.get_secret_value()
    if settings.stripe_mode == "test":
        if not (settings.stripe_test_billing_mode or settings.stripe_managed_payments_enabled):
            raise HTTPException(status_code=503, detail="Stripe test billing is disabled")
        if not key.startswith(("sk_test_", "rk_test_")):
            raise HTTPException(status_code=503, detail="Stripe test mode requires a test-mode API key")
    elif not (
        settings.app_env.lower() == "production"
        and settings.stripe_managed_payments_enabled
        and not settings.stripe_test_billing_mode
        and key.startswith(("sk_live_", "rk_live_"))
    ):
        raise HTTPException(
            status_code=503,
            detail="Live Stripe billing requires production mode and verified Managed Payments configuration",
        )
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": STRIPE_API_VERSION,
    }


async def _stripe_post(
    path: str,
    data: list[tuple[str, str]],
    *,
    idempotency_key: str | None = None,
) -> dict:
    settings = get_settings()
    headers = _stripe_headers()
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    async with httpx.AsyncClient(timeout=settings.external_request_timeout_seconds) as client:
        response = await client.post(
            f"https://api.stripe.com/v1/{path.lstrip('/')}",
            data=data,
            headers=headers,
        )
    if response.status_code >= 400:
        try:
            message = response.json().get("error", {}).get("message")
        except ValueError:
            message = None
        raise HTTPException(
            status_code=502, detail=message or f"Stripe HTTP {response.status_code}"
        )
    return response.json()


async def _stripe_get(path: str) -> dict:
    settings = get_settings()
    headers = _stripe_headers()
    async with httpx.AsyncClient(timeout=settings.external_request_timeout_seconds) as client:
        response = await client.get(f"https://api.stripe.com/v1/{path.lstrip('/')}", headers=headers)
    if response.status_code >= 400:
        try:
            message = response.json().get("error", {}).get("message")
        except ValueError:
            message = None
        raise HTTPException(status_code=502, detail=message or f"Stripe HTTP {response.status_code}")
    return response.json()


async def _stripe_delete(path: str) -> dict:
    settings = get_settings()
    headers = _stripe_headers()
    async with httpx.AsyncClient(timeout=settings.external_request_timeout_seconds) as client:
        response = await client.delete(f"https://api.stripe.com/v1/{path.lstrip('/')}", headers=headers)
    if response.status_code >= 400:
        try:
            message = response.json().get("error", {}).get("message")
        except ValueError:
            message = None
        raise HTTPException(status_code=502, detail=message or f"Stripe HTTP {response.status_code}")
    return response.json()


def _stripe_change_key(organization_id: int, request_key: str, action: str) -> str:
    digest = hashlib.sha256(request_key.encode()).hexdigest()[:32]
    return f"playdirective-{action}-{organization_id}-{digest}"


def _entitlements(plan_id: str, status: str) -> dict[str, object]:
    if plan_id == "pilot" or status == "pilot":
        return {
            "pilot_access": True,
            "paid": False,
            "experience_limit": catalog()["pilot"]["max_experiences"],
            "decision_queue": True,
            "ai_analyst": True,
            "experiment_copilot": True,
            "weekly_brief": True,
        }
    plan = PLANS.get(plan_id)
    active = status in {"active", "trialing", "past_due"}
    return {
        "pilot_access": False,
        "paid": active,
        "experience_limit": plan["max_experiences"] if plan and active else 0,
        "decision_queue": active,
        "ai_analyst": active,
        "experiment_copilot": active,
        "weekly_brief": active,
    }


def _blocked_entitlements() -> dict[str, object]:
    return {
        "pilot_access": False,
        "paid": False,
        "experience_limit": 0,
        "decision_queue": False,
        "ai_analyst": False,
        "experiment_copilot": False,
        "weekly_brief": False,
    }


def _subscription(session: Session, organization_id: int) -> SubscriptionRecord | None:
    return session.scalar(
        select(SubscriptionRecord).where(SubscriptionRecord.organization_id == organization_id)
    )


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _checkout_block_reason(record: SubscriptionRecord | None, now: datetime) -> str | None:
    if not record:
        return None
    if record.status in MANAGED_SUBSCRIPTION_STATUSES:
        return "An existing Stripe subscription is already managed. Use Manage subscription to change plans."
    if record.status in {"unpaid", "incomplete", "paused"} and record.stripe_subscription_id:
        return "This Stripe subscription needs payment or reactivation. Use Manage subscription first."
    if record.status == "pending_subscription_webhook":
        return "Subscription activation is still being confirmed. Refresh billing status shortly."
    if record.status == "checkout_pending" and now - _utc(record.updated_at) < CHECKOUT_PENDING_TTL:
        return "A Stripe Checkout session is already in progress. Complete it or retry after 30 minutes."
    return None


def _checkout_idempotency_key(organization_id: int, plan_id: str, now: datetime) -> str:
    window = int(now.timestamp()) // int(CHECKOUT_PENDING_TTL.total_seconds())
    return f"playdirective-checkout-{organization_id}-{plan_id}-{window}"


def _has_different_managed_subscription(
    record: SubscriptionRecord,
    incoming_subscription_id: str | None,
) -> bool:
    return bool(
        incoming_subscription_id
        and record.stripe_subscription_id
        and record.stripe_subscription_id != incoming_subscription_id
        and record.status in MANAGED_SUBSCRIPTION_STATUSES
    )


@router.get("/plans")
def plans():
    price_ids = _price_ids()
    settings = get_settings()
    billing_ready = bool(
        settings.stripe_billing_enabled
        and settings.stripe_webhook_secret
        and settings.stripe_portal_configuration_id
    )
    return {
        "currency": "USD",
        "billing_period": "month",
        "commercial_mode": get_settings().playdirective_commercial_mode,
        "pilot": catalog()["pilot"],
        "plans": [
            {**plan, "id": plan_id, "stripe_ready": bool(all(price_ids.get((plan_id, kind)) for kind in ("personal", "business")) and billing_ready)}
            for plan_id, plan in PLANS.items()
        ],
    }


@router.get("/tenant")
def tenant_billing(principal: TenantDep, session: SessionDep):
    record = _subscription(session, principal.organization_id)
    access = evaluate_product_access(session, principal.organization_id)
    settings = get_settings()
    stripe_configured = bool(
        _stripe_billing_enabled(settings)
        and settings.stripe_webhook_secret
        and settings.stripe_portal_configuration_id
        and all(_price_ids().values())
    )
    plan = PLANS.get(record.plan_id) if record else None
    if record and plan:
        period_start, credit_allowance = credit_period(session, principal.organization_id)
        credit_used = session.scalar(select(func.count()).select_from(DecisionCreditUsageRecord).where(
            DecisionCreditUsageRecord.organization_id == principal.organization_id,
            DecisionCreditUsageRecord.period_start == period_start,
        )) or 0
    else:
        period_start, credit_allowance = None, catalog()["pilot"]["decision_credits"]
        credit_used = 0
    experience_used = session.scalar(select(func.count()).select_from(RobloxConnectionRecord).where(
        RobloxConnectionRecord.organization_id == principal.organization_id,
        RobloxConnectionRecord.active.is_(True),
    )) or 0
    seat_used = session.scalar(select(func.count()).select_from(PilotUserRecord).where(
        PilotUserRecord.organization_id == principal.organization_id,
        PilotUserRecord.active.is_(True),
    )) or 0
    pending_invites = session.scalar(select(func.count()).select_from(PilotInviteRecord).where(
        PilotInviteRecord.organization_id == principal.organization_id,
        PilotInviteRecord.redeemed_at.is_(None),
        PilotInviteRecord.expires_at > datetime.now(UTC),
    )) or 0
    seat_used += pending_invites
    billing_details = {
        "customer_type": record.customer_type if record else None,
        "company_name": record.company_name if record and record.customer_type == "business" else None,
        "billing_country": record.billing_country if record else None,
        "vat_id_last4": record.tax_id_last4 if record and record.customer_type == "business" else None,
        "vat_verification_status": record.tax_id_verification_status if record and record.customer_type == "business" else None,
        "last_invoice_status": record.last_invoice_status if record else None,
        "current_price_usd": plan["monthly_price_usd"] if plan else 0,
        "has_stripe_subscription": bool(record and record.stripe_subscription_id),
        "current_plan": plan,
        "credit_usage": {"used": credit_used, "allowance": credit_allowance},
        "experience_usage": {"used": experience_used, "limit": plan["max_experiences"] if plan else catalog()["pilot"]["max_experiences"]},
        "seat_usage": {"used": seat_used, "limit": plan["max_team_members"] if plan else catalog()["pilot"]["max_team_members"]},
        "history_days": plan["history_days"] if plan else catalog()["pilot"]["history_days"],
        "pending_plan_id": record.pending_plan_id if record else None,
        "pending_plan_effective_at": record.pending_plan_effective_at if record else None,
        "pending_plan_change_type": record.pending_plan_change_type if record else None,
        "pending_plan_overage": ({
            "experiences": max(0, experience_used - int(PLANS[record.pending_plan_id]["max_experiences"])),
            "seats": max(0, seat_used - int(PLANS[record.pending_plan_id]["max_team_members"])),
        } if record and record.pending_plan_id in PLANS else None),
        "trial_checkout_required": bool(record and record.status == "trial_signup_pending"),
        "is_owner": principal.role == "OWNER",
        "available_plans": list(PLANS.values()),
    }

    if access.access_mode == "paid" and record:
        return {
            **billing_details,
            "plan_id": record.plan_id,
            "status": record.status,
            "cancel_at_period_end": record.cancel_at_period_end,
            "current_period_end": record.current_period_end,
            "billing_grace_ends_at": access.billing_grace_ends_at,
            "entitlements": _entitlements(record.plan_id, record.status),
            "stripe_configured": stripe_configured,
            "portal_available": bool(
                record
                and record.stripe_customer_id
                and settings.stripe_portal_configuration_id
                and settings.stripe_secret_key
                and _stripe_billing_enabled(settings)
            ),
        }

    if access.access_mode == "pilot":
        return {
            **billing_details,
            "plan_id": "pilot",
            "status": "pilot",
            "cancel_at_period_end": record.cancel_at_period_end if record else False,
            "current_period_end": record.current_period_end if record else None,
            "billing_grace_ends_at": access.billing_grace_ends_at,
            "entitlements": _entitlements("pilot", "pilot"),
            "stripe_configured": stripe_configured,
            "portal_available": bool(
                record
                and record.stripe_customer_id
                and settings.stripe_portal_configuration_id
                and settings.stripe_secret_key
                and _stripe_billing_enabled(settings)
            ),
        }

    return {
        **billing_details,
        "plan_id": record.plan_id if record else "pilot",
        "status": record.status if record else "expired",
        "cancel_at_period_end": record.cancel_at_period_end if record else False,
        "current_period_end": record.current_period_end if record else None,
        "billing_grace_ends_at": access.billing_grace_ends_at,
        "entitlements": _blocked_entitlements(),
        "stripe_configured": stripe_configured,
        "portal_available": bool(
                record
                and record.stripe_customer_id
                and settings.stripe_portal_configuration_id
                and settings.stripe_secret_key
                and _stripe_billing_enabled(settings)
            ),
    }


@router.post("/profile")
async def update_billing_profile(payload: BillingProfileUpdate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    country = payload.billing_country.upper()
    customer_type = payload.customer_type
    record = _subscription(session, principal.organization_id)
    old_type = record.customer_type if record else None
    if record and record.stripe_subscription_id and record.status in {"active", "trialing", "past_due", "incomplete"} and old_type is None:
        raise HTTPException(status_code=409, detail="This existing subscription needs an explicit customer-type migration before its billing profile can change")
    if old_type and old_type != customer_type:
        if not payload.confirm_type_change:
            raise HTTPException(status_code=409, detail="Confirm this billing customer-type change explicitly")
        if record and record.stripe_subscription_id and record.status in {"active", "trialing", "past_due", "incomplete"}:
            raise HTTPException(status_code=409, detail="Customer type cannot change while a paid subscription is active")
    if customer_type == "business":
        if not payload.company_name or not payload.company_name.strip():
            raise HTTPException(status_code=422, detail="Company name is required for business billing")
        if country not in EU_VAT_COUNTRIES:
            raise HTTPException(status_code=422, detail="Business checkout is currently limited to EU VAT countries")
        if not payload.vat_id and not (record and record.stripe_tax_id_id):
            raise HTTPException(status_code=422, detail="An EU VAT ID is required for business billing")
    settings = get_settings()
    if not _stripe_billing_enabled(settings):
        raise HTTPException(status_code=503, detail="Billing profile changes are restricted to Stripe Sandbox")
    now = datetime.now(UTC)
    organization = session.get(OrganizationRecord, principal.organization_id)
    if not record:
        record = SubscriptionRecord(
            organization_id=principal.organization_id,
            plan_id="pilot",
            status="pilot",
            cancel_at_period_end=False,
            created_at=now,
            updated_at=now,
        )
        session.add(record)
        session.flush()
    existing_tax = None
    if customer_type == "business" and record.stripe_tax_id_id:
        existing_tax = await _stripe_get(f"customers/{record.stripe_customer_id}/tax_ids/{record.stripe_tax_id_id}") if record.stripe_customer_id else None
        if existing_tax and payload.vat_id and existing_tax.get("value", "").replace(" ", "").upper() != payload.vat_id.replace(" ", "").upper() and not payload.confirm_type_change:
            raise HTTPException(status_code=409, detail="Confirm replacing the saved VAT ID")
    if not record.stripe_customer_id:
        customer = await _stripe_post(
            "customers",
            [
                ("email", principal.email),
                ("name", (payload.company_name or (organization.name if organization else "PlayDirective workspace")).strip()),
                ("address[country]", country),
                ("metadata[organization_id]", str(principal.organization_id)),
                ("metadata[playdirective_customer_type]", customer_type),
            ],
            idempotency_key=f"playdirective-customer-{principal.organization_id}",
        )
        record.stripe_customer_id = str(customer["id"])
        session.commit()
    customer_name = payload.company_name.strip() if customer_type == "business" else (organization.name if organization else "PlayDirective workspace")
    await _stripe_post(
        f"customers/{record.stripe_customer_id}",
        [("name", customer_name), ("address[country]", country), ("metadata[organization_id]", str(principal.organization_id)), ("metadata[playdirective_customer_type]", customer_type)],
        idempotency_key=f"playdirective-customer-profile-{principal.organization_id}-{customer_type}-{country}-{hmac.new(str(principal.organization_id).encode(), customer_name.encode(), 'sha256').hexdigest()[:10]}",
    )
    if customer_type == "personal":
        if record.stripe_tax_id_id:
            await _stripe_delete(f"customers/{record.stripe_customer_id}/tax_ids/{record.stripe_tax_id_id}")
        record.customer_type = "personal"
        record.company_name = None
        record.billing_country = country
        record.stripe_tax_id_id = None
        record.tax_id_last4 = None
        record.tax_id_verification_status = None
        record.updated_at = now
        session.commit()
        return {"customer_type": "personal", "tax_id_verification_status": None}

    # Reuse a matching Stripe Tax ID; otherwise replace only after explicit profile-change confirmation.
    if existing_tax and (not payload.vat_id or existing_tax.get("value", "").replace(" ", "").upper() == payload.vat_id.replace(" ", "").upper()):
        tax_id = existing_tax
    else:
        if existing_tax:
            if not payload.confirm_type_change:
                raise HTTPException(status_code=409, detail="Confirm replacing the saved VAT ID")
            await _stripe_delete(f"customers/{record.stripe_customer_id}/tax_ids/{record.stripe_tax_id_id}")
        if not payload.vat_id:
            raise HTTPException(status_code=422, detail="An EU VAT ID is required for business billing")
        tax_id = await _stripe_post(
            f"customers/{record.stripe_customer_id}/tax_ids",
            [("type", "eu_vat"), ("value", payload.vat_id.strip())],
            idempotency_key=f"playdirective-euvat-{principal.organization_id}-{hmac.new(str(principal.organization_id).encode(), payload.vat_id.strip().upper().encode(), 'sha256').hexdigest()[:20]}",
        )
        if not (tax_id.get("verification") or {}).get("status"):
            tax_id = await _stripe_get(f"customers/{record.stripe_customer_id}/tax_ids/{tax_id['id']}")
    status = (tax_id.get("verification") or {}).get("status") or "pending"
    record.customer_type = "business"
    record.company_name = payload.company_name.strip()
    record.billing_country = country
    record.stripe_tax_id_id = str(tax_id.get("id"))
    record.tax_id_last4 = str(tax_id.get("value") or payload.vat_id)[-4:]
    record.tax_id_verification_status = status if status in {"pending", "verified", "unverified", "unavailable"} else "unavailable"
    record.updated_at = now
    session.commit()
    return {"customer_type": "business", "company_name": record.company_name, "billing_country": country, "vat_id_last4": record.tax_id_last4, "tax_id_verification_status": record.tax_id_verification_status}


@router.post("/checkout")
async def create_checkout(payload: CheckoutCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    settings = get_settings()
    if not _stripe_billing_enabled(settings):
        raise HTTPException(
            status_code=503,
            detail="Sandbox Checkout requires STRIPE_TEST_BILLING_MODE or verified Sandbox Managed Payments",
        )
    existing = _subscription(session, principal.organization_id)
    now = datetime.now(UTC)
    if block_reason := _checkout_block_reason(existing, now):
        raise HTTPException(status_code=409, detail=block_reason)
    if not existing or existing.customer_type not in {"personal", "business"} or not existing.stripe_customer_id:
        raise HTTPException(status_code=409, detail="Complete the workspace billing profile before Checkout")
    if existing.customer_type == "business" and existing.tax_id_verification_status != "verified":
        raise HTTPException(status_code=409, detail=f"Business VAT verification is {existing.tax_id_verification_status or 'pending'}; Checkout waits for verified status")
    price_id = _price_id(payload.plan_id, existing.customer_type)
    if not price_id:
        raise HTTPException(
            status_code=503, detail=f"Stripe price for {payload.plan_id} is not configured"
        )

    standard_trial = payload.trial
    if standard_trial and settings.playdirective_commercial_mode != "standard":
        raise HTTPException(status_code=409, detail="The 14-day trial is not enabled")
    if existing and existing.status == "trial_signup_pending" and not standard_trial:
        raise HTTPException(status_code=409, detail="This workspace must complete its 14-day Indie trial setup")
    if standard_trial and existing and existing.status == "checkout_pending" and now - _utc(existing.updated_at) >= CHECKOUT_PENDING_TTL:
        if not existing.stripe_checkout_session_id:
            raise HTTPException(status_code=409, detail="The previous trial Checkout is awaiting expiration confirmation")
        previous_checkout = await _stripe_get(f"checkout/sessions/{existing.stripe_checkout_session_id}")
        if previous_checkout.get("status") == "open":
            return {"checkout_url": previous_checkout.get("url"), "checkout_session_id": previous_checkout.get("id"), "reused": True}
        if previous_checkout.get("status") != "expired":
            raise HTTPException(status_code=409, detail="Trial Checkout is complete and subscription activation is being confirmed")
        existing.status = "trial_signup_pending"
        existing.stripe_checkout_session_id = None
        existing.updated_at = now
        session.commit()
    if standard_trial:
        lifecycle = session.scalar(select(PilotLifecycleRecord).where(PilotLifecycleRecord.organization_id == principal.organization_id))
        organization = session.get(OrganizationRecord, principal.organization_id)
        pilot_window_elapsed = bool(organization and _utc(organization.created_at) + timedelta(days=catalog()["pilot"]["duration_days"]) <= now)
        if payload.plan_id != "indie" or lifecycle is not None or pilot_window_elapsed or (existing and (existing.trial_consumed_at or existing.stripe_trial_consumed_at or existing.trial_source == "pilot")):
            raise HTTPException(status_code=409, detail="This workspace is not eligible for the 14-day Indie trial")

    data: list[tuple[str, str]] = [
        ("mode", "subscription"),
        ("integration_identifier", "playdirective_checkout_" + "".join(secrets.choice(string.ascii_letters) for _ in range(8))),
        ("line_items[0][price]", price_id),
        ("line_items[0][quantity]", "1"),
        ("success_url", f"{settings.public_origin}/app/workspace?billing=success"),
        ("cancel_url", f"{settings.public_origin}/app/workspace?billing=cancelled"),
        ("client_reference_id", str(principal.organization_id)),
        ("metadata[organization_id]", str(principal.organization_id)),
        ("metadata[plan_id]", payload.plan_id),
        ("metadata[playdirective_plan]", payload.plan_id),
        ("metadata[playdirective_customer_type]", existing.customer_type),
        ("subscription_data[metadata][organization_id]", str(principal.organization_id)),
        ("subscription_data[metadata][plan_id]", payload.plan_id),
        ("subscription_data[metadata][playdirective_plan]", payload.plan_id),
        ("subscription_data[metadata][playdirective_customer_type]", existing.customer_type),
        ("allow_promotion_codes", "true"),
        ("billing_address_collection", "required"),
    ]
    if settings.stripe_managed_payments_enabled:
        data.append(("managed_payments[enabled]", "true"))
    data.append(("customer", existing.stripe_customer_id))
    if standard_trial:
        data.extend([
            ("payment_method_collection", "always"),
            ("subscription_data[trial_period_days]", str(catalog()["standard_trial"]["duration_days"])),
            ("metadata[trial_source]", "standard"),
            ("subscription_data[metadata][trial_source]", "standard"),
            ("subscription_data[trial_settings][end_behavior][missing_payment_method]", "cancel"),
        ])

    checkout = await _stripe_post(
        "checkout/sessions",
        data,
        idempotency_key=_checkout_idempotency_key(
            principal.organization_id,
            payload.plan_id,
            now,
        ),
    )
    existing.plan_id = payload.plan_id
    existing.status = "checkout_pending"
    existing.stripe_checkout_session_id = str(checkout.get("id")) if checkout.get("id") else None
    if standard_trial:
        existing.trial_source = "standard"
    existing.updated_at = now
    session.commit()
    return {"checkout_url": checkout.get("url"), "checkout_session_id": checkout.get("id")}


@router.post("/plan-change")
async def change_plan(payload: PlanChangeCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    settings = get_settings()
    record = _subscription(session, principal.organization_id)
    if not record or not record.stripe_subscription_id or record.plan_id not in PLANS:
        raise HTTPException(status_code=409, detail="An active Stripe subscription is required to change plans")
    if not _stripe_billing_enabled(settings):
        raise HTTPException(status_code=503, detail="Plan changes are disabled until Stripe Sandbox Managed Payments is verified")
    if record.status not in {"active", "trialing"}:
        raise HTTPException(status_code=409, detail="Plan changes require an active or trialing subscription")

    current = record.plan_id
    current_price = int(PLANS[current]["monthly_price_usd"])
    target_price = int(PLANS[payload.plan_id]["monthly_price_usd"])
    if target_price == current_price:
        raise HTTPException(status_code=409, detail="This plan is already active")
    if record.pending_plan_id:
        if record.plan_change_request_key == payload.request_key and record.pending_plan_id == payload.plan_id:
            return {"status": "pending", "change_type": record.pending_plan_change_type, "plan_id": record.pending_plan_id, "effective_at": record.pending_plan_effective_at}
        raise HTTPException(status_code=409, detail="A plan change is already pending")

    price_id = _price_id(payload.plan_id, record.customer_type)
    if not price_id:
        raise HTTPException(status_code=503, detail=f"Stripe price for {payload.plan_id} is not configured")
    change_key = _stripe_change_key(principal.organization_id, payload.request_key, "plan-change")
    now = datetime.now(UTC)
    if target_price > current_price:
        subscription = await _stripe_get(f"subscriptions/{record.stripe_subscription_id}?expand[]=items.data.price")
        items = (subscription.get("items") or {}).get("data") or []
        if not items or not items[0].get("id"):
            raise HTTPException(status_code=409, detail="Stripe subscription has no billable plan item")
        effective_at = now
        record.pending_plan_id = payload.plan_id
        record.pending_plan_effective_at = effective_at
        record.pending_plan_change_type = "upgrade"
        record.plan_change_request_key = payload.request_key
        session.commit()
        try:
            result = await _stripe_post(
                f"subscriptions/{record.stripe_subscription_id}",
                [
                    ("items[0][id]", str(items[0]["id"])),
                    ("items[0][price]", price_id),
                    ("proration_behavior", "none"),
                    ("billing_cycle_anchor", "now"),
                    ("payment_behavior", "error_if_incomplete"),
                    ("metadata[playdirective_plan_change_target]", payload.plan_id),
                ],
                idempotency_key=change_key,
            )
        except HTTPException:
            record.pending_plan_id = None
            record.pending_plan_effective_at = None
            record.pending_plan_change_type = None
            record.plan_change_request_key = None
            session.commit()
            raise
        return {
            "status": "awaiting_billing_confirmation",
            "change_type": "upgrade",
            "plan_id": payload.plan_id,
            "effective_at": effective_at,
            "stripe_status": result.get("status"),
        }

    if not record.current_period_end:
        raise HTTPException(status_code=409, detail="Current billing period end is unavailable")
    subscription = await _stripe_get(f"subscriptions/{record.stripe_subscription_id}?expand[]=items.data.price")
    items = (subscription.get("items") or {}).get("data") or []
    if not items or not items[0].get("price", {}).get("id"):
        raise HTTPException(status_code=409, detail="Stripe subscription has no billable plan item")
    current_item = items[0]
    current_price_id = str(current_item["price"]["id"])
    effective_at = _utc(record.current_period_end)
    schedule = await _stripe_post(
        "subscription_schedules",
        [("from_subscription", record.stripe_subscription_id)],
        idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "schedule-create"),
    )
    schedule_id = str(schedule.get("id") or "")
    if not schedule_id:
        raise HTTPException(status_code=502, detail="Stripe did not return a subscription schedule")
    current_phase = (schedule.get("current_phase") or {})
    phase_start = current_phase.get("start_date") or int(_utc(record.current_period_start or now).timestamp())
    phase_end = current_phase.get("end_date") or int(effective_at.timestamp())
    phases = [
        ("phases[0][start_date]", str(phase_start)),
        ("phases[0][end_date]", str(phase_end)),
        ("phases[0][items][0][price]", current_price_id),
        ("phases[0][items][0][quantity]", str(current_item.get("quantity") or 1)),
        ("phases[0][proration_behavior]", "none"),
        ("phases[1][start_date]", str(phase_end)),
        ("phases[1][items][0][price]", price_id),
        ("phases[1][items][0][quantity]", str(current_item.get("quantity") or 1)),
        ("phases[1][iterations]", "1"),
        ("phases[1][proration_behavior]", "none"),
        ("end_behavior", "release"),
        ("proration_behavior", "none"),
        ("metadata[playdirective_plan_change_target]", payload.plan_id),
    ]
    try:
        await _stripe_post(
            f"subscription_schedules/{schedule_id}",
            phases,
            idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "schedule-update"),
        )
    except HTTPException:
        await _stripe_post(
            f"subscription_schedules/{schedule_id}/release",
            [("preserve_cancel_date", "true")],
            idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "schedule-release-on-error"),
        )
        raise
    record.pending_plan_id = payload.plan_id
    record.pending_plan_effective_at = effective_at
    record.pending_plan_change_type = "downgrade"
    record.stripe_subscription_schedule_id = schedule_id
    record.plan_change_request_key = payload.request_key
    session.commit()
    return {"status": "scheduled", "change_type": "downgrade", "plan_id": payload.plan_id, "effective_at": effective_at}


@router.post("/plan-change/cancel")
async def cancel_plan_change(principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    record = _subscription(session, principal.organization_id)
    if not record or record.pending_plan_change_type != "downgrade" or not record.stripe_subscription_schedule_id:
        raise HTTPException(status_code=409, detail="No scheduled downgrade can be canceled")
    await _stripe_post(
        f"subscription_schedules/{record.stripe_subscription_schedule_id}/release",
        [("preserve_cancel_date", "true")],
        idempotency_key=_stripe_change_key(principal.organization_id, record.plan_change_request_key or str(record.id), "schedule-cancel"),
    )
    record.pending_plan_id = None
    record.pending_plan_effective_at = None
    record.pending_plan_change_type = None
    record.stripe_subscription_schedule_id = None
    record.plan_change_request_key = None
    session.commit()
    return {"status": "canceled"}


@router.post("/cancel")
async def cancel_subscription(payload: BillingActionCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    if not _stripe_billing_enabled():
        raise HTTPException(status_code=503, detail="Subscription changes are disabled until Sandbox billing is verified")
    record = _subscription(session, principal.organization_id)
    if not record or not record.stripe_subscription_id:
        raise HTTPException(status_code=409, detail="No Stripe subscription exists")
    if record.pending_plan_change_type == "upgrade":
        raise HTTPException(status_code=409, detail="Wait for the pending upgrade payment result before canceling")
    if record.pending_plan_change_type == "downgrade" and record.stripe_subscription_schedule_id:
        await _stripe_post(
            f"subscription_schedules/{record.stripe_subscription_schedule_id}/release",
            [("preserve_cancel_date", "true")],
            idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "cancel-release-schedule"),
        )
        record.pending_plan_id = None
        record.pending_plan_effective_at = None
        record.pending_plan_change_type = None
        record.stripe_subscription_schedule_id = None
        record.plan_change_request_key = None
        session.commit()
    result = await _stripe_post(
        f"subscriptions/{record.stripe_subscription_id}",
        [("cancel_at_period_end", "true")],
        idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "cancel"),
    )
    return {"status": result.get("status"), "cancel_at_period_end": result.get("cancel_at_period_end")}


@router.post("/reactivate")
async def reactivate_subscription(payload: BillingActionCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    if not _stripe_billing_enabled():
        raise HTTPException(status_code=503, detail="Subscription changes are disabled until Sandbox billing is verified")
    record = _subscription(session, principal.organization_id)
    if not record or not record.stripe_subscription_id or not record.cancel_at_period_end:
        raise HTTPException(status_code=409, detail="No period-end cancellation can be reactivated")
    result = await _stripe_post(
        f"subscriptions/{record.stripe_subscription_id}",
        [("cancel_at_period_end", "false")],
        idempotency_key=_stripe_change_key(principal.organization_id, payload.request_key, "reactivate"),
    )
    return {"status": result.get("status"), "cancel_at_period_end": result.get("cancel_at_period_end")}


@router.post("/portal")
async def create_portal(principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    if not _stripe_billing_enabled():
        raise HTTPException(status_code=503, detail="Customer Portal is disabled until Sandbox billing is verified")
    record = _subscription(session, principal.organization_id)
    if not record or not record.stripe_customer_id:
        raise HTTPException(status_code=409, detail="No Stripe customer exists for this workspace")
    portal_configuration = get_settings().stripe_portal_configuration_id
    if not portal_configuration:
        raise HTTPException(status_code=503, detail="A restricted Customer Portal configuration is required")
    configuration = await _stripe_get(f"billing_portal/configurations/{portal_configuration}")
    features = configuration.get("features") or {}
    cancel_feature = features.get("subscription_cancel") or {}
    if (
        configuration.get("livemode") is not False
        or not (features.get("payment_method_update") or {}).get("enabled")
        or not (features.get("invoice_history") or {}).get("enabled")
        or not cancel_feature.get("enabled")
        or cancel_feature.get("mode") != "at_period_end"
        or cancel_feature.get("proration_behavior") not in {None, "none"}
        or (features.get("subscription_update") or {}).get("enabled")
        or (features.get("subscription_pause") or {}).get("enabled")
    ):
        raise HTTPException(status_code=503, detail="Customer Portal configuration must allow payment/invoice management and period-end cancellation only")
    portal = await _stripe_post(
        "billing_portal/sessions",
        [
            ("customer", record.stripe_customer_id),
            ("return_url", f"{get_settings().public_origin}/app/workspace"),
        ] + [("configuration", portal_configuration)],
    )
    return {"portal_url": portal.get("url")}


def _verify_signature(payload: bytes, signature_header: str | None) -> None:
    settings = get_settings()
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured")
    if not signature_header:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature")

    parts: dict[str, list[str]] = {}
    for item in signature_header.split(","):
        if "=" not in item:
            continue
        key, value = item.split("=", 1)
        parts.setdefault(key, []).append(value)
    try:
        timestamp = int(parts["t"][0])
        signatures = parts["v1"]
    except (KeyError, ValueError, IndexError) as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe-Signature") from exc
    if abs(int(time.time()) - timestamp) > settings.stripe_webhook_tolerance_seconds:
        raise HTTPException(status_code=400, detail="Expired Stripe webhook signature")

    signed_payload = f"{timestamp}.".encode() + payload
    expected = hmac.new(
        settings.stripe_webhook_secret.get_secret_value().encode(),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    if not any(hmac.compare_digest(expected, signature) for signature in signatures):
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")


def _period_end(value: object) -> datetime | None:
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value, tz=UTC)
    return None


def _upsert_from_subscription(session: Session, obj: dict) -> None:
    metadata = obj.get("metadata") or {}
    organization_id_raw = metadata.get("organization_id")
    customer_id = obj.get("customer")
    subscription_id = str(obj.get("id")) if obj.get("id") else None
    record = None
    if subscription_id:
        record = session.scalar(
            select(SubscriptionRecord).where(
                SubscriptionRecord.stripe_subscription_id == subscription_id
            )
        )
    if not record and organization_id_raw:
        try:
            record = _subscription(session, int(organization_id_raw))
        except (TypeError, ValueError):
            record = None
    if not record or _has_different_managed_subscription(record, subscription_id):
        return

    previous_status = record.status
    price_id = None
    items = (obj.get("items") or {}).get("data") or []
    if items:
        price_id = (items[0].get("price") or {}).get("id")
    mapped_price = _plan_customer_for_price(price_id)
    mapped_plan = mapped_price[0] if mapped_price else metadata.get("plan_id")
    mapped_customer_type = mapped_price[1] if mapped_price else metadata.get("playdirective_customer_type")
    if mapped_customer_type in {"personal", "business"} and record.customer_type not in {None, mapped_customer_type}:
        mapped_plan = None
    if mapped_plan in PLANS:
        if mapped_customer_type in {"personal", "business"} and record.customer_type in {None, mapped_customer_type}:
            record.customer_type = mapped_customer_type
        if record.pending_plan_change_type == "upgrade" and mapped_plan == record.pending_plan_id:
            # Stripe can emit the subscription update before its immediate invoice is paid.
            # Keep the old entitlement until invoice.paid confirms the upgrade.
            pass
        else:
            record.plan_id = mapped_plan
            record.stripe_price_id = price_id or record.stripe_price_id
            if record.pending_plan_change_type == "downgrade" and mapped_plan == record.pending_plan_id:
                record.pending_plan_id = None
                record.pending_plan_effective_at = None
                record.pending_plan_change_type = None
                record.stripe_subscription_schedule_id = None
                record.plan_change_request_key = None
    incoming_status = str(obj.get("status") or record.status)
    # Stripe can mark a new subscription active while its first invoice is still
    # processing. Keep first-time paid access blocked until invoice.paid confirms it.
    if (
        incoming_status == "active"
        and previous_status in {"checkout_pending", "pending_subscription_webhook", "incomplete"}
        and record.last_invoice_status != "paid"
    ):
        record.status = "incomplete"
    elif incoming_status == "incomplete" and record.last_invoice_status == "paid":
        # Ignore a stale pre-payment status event delivered after invoice.paid.
        record.status = "active"
    else:
        record.status = incoming_status
    record.stripe_customer_id = str(customer_id) if customer_id else record.stripe_customer_id
    record.stripe_subscription_id = subscription_id or record.stripe_subscription_id
    first_item = items[0] if items else {}
    record.current_period_start = _period_end(obj.get("current_period_start")) or _period_end(first_item.get("current_period_start")) or record.current_period_start
    record.current_period_end = _period_end(obj.get("current_period_end")) or _period_end(first_item.get("current_period_end")) or record.current_period_end
    record.cancel_at_period_end = bool(obj.get("cancel_at_period_end", False))
    if incoming_status == "trialing" and (metadata.get("trial_source") == "standard" or record.trial_source == "standard"):
        record.trial_source = "standard"
        record.trial_consumed_at = record.trial_consumed_at or datetime.now(UTC)
        record.stripe_trial_consumed_at = record.stripe_trial_consumed_at or datetime.now(UTC)
    if incoming_status in {"canceled", "unpaid", "incomplete_expired"}:
        record.pending_plan_id = None
        record.pending_plan_effective_at = None
        record.pending_plan_change_type = None
        record.stripe_subscription_schedule_id = None
    if not (previous_status == "past_due" and incoming_status == "past_due"):
        record.updated_at = datetime.now(UTC)


@router.post("/webhook")
async def stripe_webhook(request: Request, session: SessionDep):
    settings = get_settings()
    if not settings.stripe_billing_enabled or not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook processing is disabled")
    payload = await request.body()
    _verify_signature(payload, request.headers.get("Stripe-Signature"))
    try:
        event = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe payload") from exc

    event_type = event.get("type")
    event_id = event.get("id")
    if not isinstance(event_id, str) or not event_id:
        raise HTTPException(status_code=400, detail="Stripe event id is required")
    if session.scalar(
        select(StripeWebhookEventRecord).where(StripeWebhookEventRecord.event_id == event_id)
    ):
        return {"received": True, "duplicate": True}
    obj = (event.get("data") or {}).get("object") or {}
    if event_type in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
    }:
        metadata = obj.get("metadata") or {}
        try:
            organization_id = int(metadata.get("organization_id") or obj.get("client_reference_id"))
        except (TypeError, ValueError):
            organization_id = 0
        record = _subscription(session, organization_id) if organization_id else None
        incoming_subscription_id = str(obj.get("subscription")) if obj.get("subscription") else None
        if record and not _has_different_managed_subscription(record, incoming_subscription_id):
            record.stripe_customer_id = (
                str(obj.get("customer")) if obj.get("customer") else record.stripe_customer_id
            )
            if record.status not in MANAGED_SUBSCRIPTION_STATUSES:
                record.plan_id = metadata.get("plan_id") or record.plan_id
                record.stripe_subscription_id = (
                    incoming_subscription_id or record.stripe_subscription_id
                )
                record.status = "pending_subscription_webhook"
            if (metadata.get("trial_source") == "standard" or record.trial_source == "standard") and incoming_subscription_id:
                record.trial_source = "standard"
                record.trial_consumed_at = record.trial_consumed_at or datetime.now(UTC)
                record.stripe_trial_consumed_at = record.stripe_trial_consumed_at or datetime.now(UTC)
    elif event_type == "checkout.session.async_payment_failed":
        metadata = obj.get("metadata") or {}
        try:
            organization_id = int(metadata.get("organization_id") or obj.get("client_reference_id"))
        except (TypeError, ValueError):
            organization_id = 0
        record = _subscription(session, organization_id) if organization_id else None
        incoming_subscription_id = str(obj.get("subscription")) if obj.get("subscription") else None
        if record and not _has_different_managed_subscription(record, incoming_subscription_id):
            record.stripe_customer_id = (
                str(obj.get("customer")) if obj.get("customer") else record.stripe_customer_id
            )
            record.stripe_subscription_id = incoming_subscription_id or record.stripe_subscription_id
            if record.status in {"checkout_pending", "pending_subscription_webhook", "incomplete"}:
                record.status = "incomplete"
                record.last_invoice_status = "payment_failed"
                record.updated_at = datetime.now(UTC)
    elif event_type == "checkout.session.expired":
        metadata = obj.get("metadata") or {}
        try:
            organization_id = int(metadata.get("organization_id") or obj.get("client_reference_id"))
        except (TypeError, ValueError):
            organization_id = 0
        record = _subscription(session, organization_id) if organization_id else None
        if record and record.status == "checkout_pending" and not record.stripe_subscription_id:
            record.status = "trial_signup_pending" if record.trial_source == "standard" and not record.stripe_trial_consumed_at else "checkout_expired"
            record.stripe_checkout_session_id = None
            record.updated_at = datetime.now(UTC)
            record.updated_at = datetime.now(UTC)
    elif event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        _upsert_from_subscription(session, obj)
    elif event_type in {"invoice.paid", "invoice.payment_failed", "invoice.payment_action_required"}:
        customer_id = str(obj.get("customer")) if obj.get("customer") else None
        subscription_id = obj.get("subscription")
        parent = obj.get("parent") or {}
        details = parent.get("subscription_details") or {}
        subscription_id = subscription_id or details.get("subscription")
        if isinstance(subscription_id, dict):
            subscription_id = subscription_id.get("id")
        record = None
        if subscription_id:
            record = session.scalar(
                select(SubscriptionRecord).where(
                    SubscriptionRecord.stripe_subscription_id == str(subscription_id)
                )
            )
        if not record and customer_id:
            record = session.scalar(
                select(SubscriptionRecord).where(
                    SubscriptionRecord.stripe_customer_id == customer_id
                )
            )
        if record:
            record.last_invoice_id = str(obj.get("id")) if obj.get("id") else record.last_invoice_id
            record.last_invoice_status = {
                "invoice.paid": "paid",
                "invoice.payment_failed": "payment_failed",
                "invoice.payment_action_required": "payment_action_required",
            }[event_type]
            if event_type == "invoice.payment_failed":
                if record.status in {"checkout_pending", "pending_subscription_webhook", "incomplete"}:
                    # A failed first invoice must not receive the renewal grace period.
                    record.status = "incomplete"
                else:
                    if record.status != "past_due" or record.last_payment_failed_at is None:
                        record.last_payment_failed_at = datetime.now(UTC)
                    record.status = "past_due"
            elif event_type == "invoice.payment_action_required":
                if record.status not in {"checkout_pending", "pending_subscription_webhook", "incomplete"}:
                    record.status = "past_due"
                    record.last_payment_failed_at = record.last_payment_failed_at or datetime.now(UTC)
            elif record.status in {"past_due", "incomplete", "checkout_pending", "pending_subscription_webhook"}:
                # A paid invoice confirms initial access or restores access after failure.
                record.status = "active"
                record.last_payment_failed_at = None
            if event_type == "invoice.paid" and record.pending_plan_change_type == "upgrade":
                line_items = ((obj.get("lines") or {}).get("data") or [])
                line_price_ids: set[str] = set()
                for line in line_items:
                    line_price = line.get("price") or {}
                    details = (line.get("pricing") or {}).get("price_details") or {}
                    candidate = line_price.get("id") or details.get("price")
                    if candidate:
                        line_price_ids.add(str(candidate))
                confirmed = next((mapping for mapping, configured in _price_ids().items() if configured in line_price_ids), None)
                confirmed_plan, confirmed_customer_type = confirmed if confirmed else (None, None)
                if confirmed_plan == record.pending_plan_id and confirmed_customer_type == record.customer_type:
                    record.plan_id = confirmed_plan
                    record.stripe_price_id = _price_ids().get((confirmed_plan, confirmed_customer_type)) or record.stripe_price_id
                    record.pending_plan_id = None
                    record.pending_plan_effective_at = None
                    record.pending_plan_change_type = None
                    record.plan_change_request_key = None
            record.updated_at = datetime.now(UTC)

    elif event_type == "customer.tax_id.updated":
        customer_id = obj.get("customer")
        if isinstance(customer_id, dict):
            customer_id = customer_id.get("id")
        record = session.scalar(select(SubscriptionRecord).where(SubscriptionRecord.stripe_customer_id == str(customer_id))) if customer_id else None
        if record and str(obj.get("id") or "") == record.stripe_tax_id_id and obj.get("type") == "eu_vat":
            status = (obj.get("verification") or {}).get("status") or "unavailable"
            record.tax_id_verification_status = status if status in {"pending", "verified", "unverified", "unavailable"} else "unavailable"
            record.tax_id_last4 = str(obj.get("value") or "")[-4:] or record.tax_id_last4
            record.updated_at = datetime.now(UTC)
    elif event_type == "customer.updated":
        # Record for signature/idempotency audit. The app remains canonical for workspace billing profile data.
        pass

    session.add(
        StripeWebhookEventRecord(
            event_id=event_id,
            event_type=str(event_type or "unknown"),
            processed_at=datetime.now(UTC),
        )
    )
    try:
        session.commit()
    except IntegrityError:
        # Concurrent Stripe retries can race on the unique event id. The winner
        # committed the event and its state changes atomically.
        session.rollback()
        if session.scalar(
            select(StripeWebhookEventRecord).where(StripeWebhookEventRecord.event_id == event_id)
        ):
            return {"received": True, "duplicate": True}
        raise
    return {"received": True}
