import hashlib
import hmac
import json
import time
from datetime import UTC, datetime, timedelta
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access
from app.config import get_settings
from app.db import SessionLocal
from app.models import SubscriptionRecord
from app.tenant_security import TenantDep

router = APIRouter(prefix="/v1/billing", tags=["billing"])

PLANS = {
    "indie": {"name": "Indie", "monthly_price_usd": 19, "experiences": 1},
    "growth": {"name": "Growth", "monthly_price_usd": 49, "experiences": 3},
    "studio": {"name": "Studio", "monthly_price_usd": 99, "experiences": 10},
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
    plan_id: str = Field(pattern=r"^(indie|growth|studio)$")


def _owner_only(role: str) -> None:
    if role != "OWNER":
        raise HTTPException(status_code=403, detail="Owner role required")


def _price_ids() -> dict[str, str | None]:
    settings = get_settings()
    return {
        "indie": settings.stripe_price_indie,
        "growth": settings.stripe_price_growth,
        "studio": settings.stripe_price_studio,
    }


def _plan_for_price(price_id: str | None) -> str | None:
    if not price_id:
        return None
    for plan_id, configured in _price_ids().items():
        if configured == price_id:
            return plan_id
    return None


def _stripe_headers() -> dict[str, str]:
    settings = get_settings()
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")
    return {
        "Authorization": f"Bearer {settings.stripe_secret_key.get_secret_value()}",
        "Content-Type": "application/x-www-form-urlencoded",
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
        raise HTTPException(status_code=502, detail=message or f"Stripe HTTP {response.status_code}")
    return response.json()


def _entitlements(plan_id: str, status: str) -> dict[str, object]:
    if plan_id == "pilot" or status == "pilot":
        return {
            "pilot_access": True,
            "paid": False,
            "experience_limit": 1,
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
        "experience_limit": plan["experiences"] if plan and active else 0,
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
    return {
        "currency": "USD",
        "billing_period": "month",
        "plans": [
            {
                "id": plan_id,
                **plan,
                "stripe_ready": bool(price_ids[plan_id] and get_settings().stripe_secret_key),
            }
            for plan_id, plan in PLANS.items()
        ],
    }


@router.get("/tenant")
def tenant_billing(principal: TenantDep, session: SessionDep):
    record = _subscription(session, principal.organization_id)
    access = evaluate_product_access(session, principal.organization_id)
    stripe_configured = bool(get_settings().stripe_secret_key)

    if access.access_mode == "paid" and record:
        return {
            "plan_id": record.plan_id,
            "status": record.status,
            "cancel_at_period_end": record.cancel_at_period_end,
            "current_period_end": record.current_period_end,
            "entitlements": _entitlements(record.plan_id, record.status),
            "stripe_configured": stripe_configured,
        }

    if access.access_mode == "pilot":
        return {
            "plan_id": "pilot",
            "status": "pilot",
            "cancel_at_period_end": record.cancel_at_period_end if record else False,
            "current_period_end": record.current_period_end if record else None,
            "entitlements": _entitlements("pilot", "pilot"),
            "stripe_configured": stripe_configured,
        }

    return {
        "plan_id": record.plan_id if record else "pilot",
        "status": record.status if record else "expired",
        "cancel_at_period_end": record.cancel_at_period_end if record else False,
        "current_period_end": record.current_period_end if record else None,
        "entitlements": _blocked_entitlements(),
        "stripe_configured": stripe_configured,
    }


@router.post("/checkout")
async def create_checkout(payload: CheckoutCreate, principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    settings = get_settings()
    price_id = _price_ids().get(payload.plan_id)
    if not price_id:
        raise HTTPException(status_code=503, detail=f"Stripe price for {payload.plan_id} is not configured")

    existing = _subscription(session, principal.organization_id)
    now = datetime.now(UTC)
    if block_reason := _checkout_block_reason(existing, now):
        raise HTTPException(status_code=409, detail=block_reason)

    data: list[tuple[str, str]] = [
        ("mode", "subscription"),
        ("line_items[0][price]", price_id),
        ("line_items[0][quantity]", "1"),
        ("success_url", f"{settings.public_origin}/app/workspace?billing=success"),
        ("cancel_url", f"{settings.public_origin}/app/workspace?billing=cancelled"),
        ("client_reference_id", str(principal.organization_id)),
        ("metadata[organization_id]", str(principal.organization_id)),
        ("metadata[plan_id]", payload.plan_id),
        ("subscription_data[metadata][organization_id]", str(principal.organization_id)),
        ("subscription_data[metadata][plan_id]", payload.plan_id),
        ("allow_promotion_codes", "true"),
    ]
    if existing and existing.stripe_customer_id:
        data.append(("customer", existing.stripe_customer_id))
    else:
        data.append(("customer_email", principal.email))

    checkout = await _stripe_post(
        "checkout/sessions",
        data,
        idempotency_key=_checkout_idempotency_key(
            principal.organization_id,
            payload.plan_id,
            now,
        ),
    )
    if not existing:
        existing = SubscriptionRecord(
            organization_id=principal.organization_id,
            plan_id=payload.plan_id,
            status="checkout_pending",
            stripe_customer_id=None,
            stripe_subscription_id=None,
            current_period_end=None,
            cancel_at_period_end=False,
            created_at=now,
            updated_at=now,
        )
        session.add(existing)
    else:
        existing.plan_id = payload.plan_id
        existing.status = "checkout_pending"
        existing.updated_at = now
    session.commit()
    return {"checkout_url": checkout.get("url"), "checkout_session_id": checkout.get("id")}


@router.post("/portal")
async def create_portal(principal: TenantDep, session: SessionDep):
    _owner_only(principal.role)
    record = _subscription(session, principal.organization_id)
    if not record or not record.stripe_customer_id:
        raise HTTPException(status_code=409, detail="No Stripe customer exists for this workspace")
    portal = await _stripe_post(
        "billing_portal/sessions",
        [
            ("customer", record.stripe_customer_id),
            ("return_url", f"{get_settings().public_origin}/app/workspace"),
        ],
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

    price_id = None
    items = (obj.get("items") or {}).get("data") or []
    if items:
        price_id = ((items[0].get("price") or {}).get("id"))
    mapped_plan = _plan_for_price(price_id) or metadata.get("plan_id")
    if mapped_plan in PLANS:
        record.plan_id = mapped_plan
    record.status = str(obj.get("status") or record.status)
    record.stripe_customer_id = str(customer_id) if customer_id else record.stripe_customer_id
    record.stripe_subscription_id = subscription_id or record.stripe_subscription_id
    record.current_period_end = _period_end(obj.get("current_period_end"))
    record.cancel_at_period_end = bool(obj.get("cancel_at_period_end", False))
    record.updated_at = datetime.now(UTC)


@router.post("/webhook")
async def stripe_webhook(request: Request, session: SessionDep):
    payload = await request.body()
    _verify_signature(payload, request.headers.get("Stripe-Signature"))
    try:
        event = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe payload") from exc

    event_type = event.get("type")
    obj = ((event.get("data") or {}).get("object") or {})
    if event_type == "checkout.session.completed":
        metadata = obj.get("metadata") or {}
        try:
            organization_id = int(metadata.get("organization_id"))
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
                record.stripe_subscription_id = incoming_subscription_id or record.stripe_subscription_id
                record.status = "pending_subscription_webhook"
            record.updated_at = datetime.now(UTC)
    elif event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        _upsert_from_subscription(session, obj)
    session.commit()
    return {"received": True}
