from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import OrganizationRecord, SubscriptionRecord
from app.tenant_security import require_admin

router = APIRouter(prefix="/v1/billing/admin", tags=["billing-admin"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


@router.get("/subscriptions")
def subscriptions(session: SessionDep, _: AdminDep):
    organizations = session.scalars(select(OrganizationRecord).order_by(OrganizationRecord.id)).all()
    subscriptions_by_org = {
        item.organization_id: item for item in session.scalars(select(SubscriptionRecord)).all()
    }
    items = []
    for organization in organizations:
        subscription = subscriptions_by_org.get(organization.id)
        items.append(
            {
                "organization_id": organization.id,
                "organization_name": organization.name,
                "organization_slug": organization.slug,
                "active": organization.active,
                "plan_id": subscription.plan_id if subscription else "pilot",
                "status": subscription.status if subscription else "pilot",
                "stripe_customer_configured": bool(subscription and subscription.stripe_customer_id),
                "stripe_subscription_configured": bool(
                    subscription and subscription.stripe_subscription_id
                ),
                "current_period_end": subscription.current_period_end if subscription else None,
                "cancel_at_period_end": (
                    subscription.cancel_at_period_end if subscription else False
                ),
            }
        )
    return {"count": len(items), "items": items}
