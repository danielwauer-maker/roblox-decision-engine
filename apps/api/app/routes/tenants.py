from dataclasses import asdict
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.access_control import ProductAccessDep, evaluate_product_access
from app.commercial_catalog import catalog, plans_by_id
from app.db import SessionLocal
from app.domain.decision_engine import evaluate_snapshot
from app.integrations.roblox.client import RobloxAnalyticsError
from app.models import (
    MetricObservationRecord,
    OrganizationRecord,
    PilotInviteRecord,
    PilotSessionRecord,
    PilotUserRecord,
    RobloxConnectionRecord,
    RobloxSyncStateRecord,
)
from app.services.decision_snapshots import build_decision_snapshot
from app.services.experience_entitlements import (
    active_connections_for_organization,
    entitled_connection_ids,
    entitled_connections_for_organization,
    stored_connections_for_organization,
)
from app.services.roblox_metrics import (
    sync_default_metrics_for_connection,
    sync_metric_for_connection,
)
from app.tenant_security import (
    TenantDep,
    decrypt_credential,
    encrypt_credential,
    hash_token,
    invite_expiry,
    new_opaque_token,
    require_admin,
    session_expiry,
)

router = APIRouter(prefix="/v1/tenant", tags=["tenant"])


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


SessionDep = Annotated[Session, Depends(get_session)]
AdminDep = Annotated[None, Depends(require_admin)]


class OrganizationCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=2, max_length=160)


class InviteCreate(BaseModel):
    organization_id: int
    email: str = Field(min_length=3, max_length=254)
    role: str = Field(default="MEMBER", pattern=r"^(OWNER|MEMBER)$")


class InviteRedeem(BaseModel):
    token: str = Field(min_length=20, max_length=200)


class RobloxConnectionCreate(BaseModel):
    universe_id: str = Field(min_length=1, max_length=64, pattern=r"^[0-9]+$")
    api_key: str = Field(min_length=20, max_length=4000)
    experience_name: str | None = Field(default=None, max_length=160)


class RobloxConnectionSelection(BaseModel):
    active: bool


def _owner_only(role: str) -> None:
    if role != "OWNER":
        raise HTTPException(status_code=403, detail="Owner role required")


def _organization_for_principal(session: Session, organization_id: int) -> OrganizationRecord:
    organization = session.get(OrganizationRecord, organization_id)
    if not organization or not organization.active:
        raise HTTPException(status_code=403, detail="Organization disabled")
    return organization


def _experience_limit(session: Session, organization_id: int) -> int:
    return evaluate_product_access(session, organization_id).experience_limit


@router.post("/admin/organizations")
def create_organization(payload: OrganizationCreate, session: SessionDep, _: AdminDep):
    if session.scalar(select(OrganizationRecord.id).where(OrganizationRecord.slug == payload.slug)):
        raise HTTPException(status_code=409, detail="Organization slug already exists")
    organization = OrganizationRecord(slug=payload.slug, name=payload.name, data_mode="LIVE", active=True, created_at=datetime.now(UTC))
    session.add(organization)
    session.commit()
    session.refresh(organization)
    return {"id": organization.id, "slug": organization.slug, "name": organization.name, "data_mode": organization.data_mode}


@router.post("/admin/invites")
def create_invite(payload: InviteCreate, session: SessionDep, _: AdminDep):
    organization = session.get(OrganizationRecord, payload.organization_id)
    if not organization or not organization.active:
        raise HTTPException(status_code=404, detail="Organization not found")
    access = evaluate_product_access(session, organization.id)
    seat_limit = catalog()["pilot"]["max_team_members"] if access.plan_id == "pilot" else plans_by_id().get(access.plan_id or "", {}).get("max_team_members", 0)
    existing_seats = session.scalar(select(func.count()).select_from(PilotUserRecord).where(PilotUserRecord.organization_id == organization.id, PilotUserRecord.active.is_(True))) or 0
    pending_seats = session.scalar(select(func.count()).select_from(PilotInviteRecord).where(PilotInviteRecord.organization_id == organization.id, PilotInviteRecord.redeemed_at.is_(None), PilotInviteRecord.expires_at > datetime.now(UTC))) or 0
    if existing_seats + pending_seats >= seat_limit:
        raise HTTPException(status_code=409, detail=f"Team seat limit reached ({seat_limit}); resolve membership or plan capacity first")
    raw_token = new_opaque_token()
    invite = PilotInviteRecord(organization_id=organization.id, email=payload.email.strip().lower(), role=payload.role, token_hash=hash_token(raw_token), expires_at=invite_expiry(), redeemed_at=None, created_at=datetime.now(UTC))
    session.add(invite)
    session.commit()
    return {"invite_token": raw_token, "expires_at": invite.expires_at, "organization_id": organization.id, "email": invite.email}


@router.post("/auth/redeem")
def redeem_invite(payload: InviteRedeem, session: SessionDep):
    invite = session.scalar(select(PilotInviteRecord).where(PilotInviteRecord.token_hash == hash_token(payload.token)))
    now = datetime.now(UTC)
    if not invite or invite.redeemed_at is not None or invite.expires_at <= now:
        raise HTTPException(status_code=401, detail="Invite expired or invalid")
    organization = session.get(OrganizationRecord, invite.organization_id)
    if not organization or not organization.active:
        raise HTTPException(status_code=403, detail="Organization disabled")
    user = session.scalar(select(PilotUserRecord).where(PilotUserRecord.organization_id == invite.organization_id, PilotUserRecord.email == invite.email))
    if not user:
        access = evaluate_product_access(session, invite.organization_id)
        seat_limit = catalog()["pilot"]["max_team_members"] if access.plan_id == "pilot" else plans_by_id().get(access.plan_id or "", {}).get("max_team_members", 0)
        active_seats = session.scalar(select(func.count()).select_from(PilotUserRecord).where(PilotUserRecord.organization_id == invite.organization_id, PilotUserRecord.active.is_(True))) or 0
        if active_seats >= seat_limit:
            raise HTTPException(status_code=409, detail="Team seat limit reached; ask the Owner to resolve seats or change plan")
        user = PilotUserRecord(organization_id=invite.organization_id, email=invite.email, role=invite.role, active=True, created_at=now)
        session.add(user)
        session.flush()
    raw_session = new_opaque_token()
    session.add(PilotSessionRecord(user_id=user.id, organization_id=invite.organization_id, token_hash=hash_token(raw_session), expires_at=session_expiry(), revoked_at=None, created_at=now))
    invite.redeemed_at = now
    session.commit()
    return {"access_token": raw_session, "token_type": "bearer", "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name, "data_mode": organization.data_mode}, "user": {"email": user.email, "role": user.role}}


@router.get("/me")
def me(principal: TenantDep, session: SessionDep):
    organization = _organization_for_principal(session, principal.organization_id)
    return {"user": {"id": principal.user_id, "email": principal.email, "role": principal.role}, "organization": {"id": organization.id, "slug": organization.slug, "name": organization.name, "data_mode": organization.data_mode}}


@router.put("/roblox/connection")
def upsert_connection(payload: RobloxConnectionCreate, principal: ProductAccessDep, session: SessionDep):
    _owner_only(principal.role)
    organization = _organization_for_principal(session, principal.organization_id)
    if organization.data_mode == "SIMULATED":
        raise HTTPException(status_code=409, detail="Simulation tenants cannot store live Roblox credentials")
    connection = session.scalar(select(RobloxConnectionRecord).where(RobloxConnectionRecord.organization_id == principal.organization_id, RobloxConnectionRecord.universe_id == payload.universe_id))
    now = datetime.now(UTC)
    encrypted = encrypt_credential(payload.api_key)
    if connection:
        connection.encrypted_api_key = encrypted
        connection.experience_name = payload.experience_name
        connection.updated_at = now
    else:
        limit = _experience_limit(session, principal.organization_id)
        active_count = len(active_connections_for_organization(session, principal.organization_id))
        connection = RobloxConnectionRecord(
            organization_id=principal.organization_id,
            universe_id=payload.universe_id,
            experience_name=payload.experience_name,
            encrypted_api_key=encrypted,
            active=active_count < limit,
            created_at=now,
            updated_at=now,
        )
        session.add(connection)
    session.commit()
    session.refresh(connection)
    return {"id": connection.id, "universe_id": connection.universe_id, "experience_name": connection.experience_name, "configured": True, "active": connection.active, "experience_limit": _experience_limit(session, principal.organization_id)}


@router.patch("/roblox/connections/{connection_id}")
def select_connection(connection_id: int, payload: RobloxConnectionSelection, principal: ProductAccessDep, session: SessionDep):
    _owner_only(principal.role)
    connection = session.scalar(select(RobloxConnectionRecord).where(RobloxConnectionRecord.id == connection_id, RobloxConnectionRecord.organization_id == principal.organization_id))
    if connection is None:
        raise HTTPException(status_code=404, detail="Roblox experience not found")
    if payload.active and not connection.active:
        limit = _experience_limit(session, principal.organization_id)
        active_count = len(active_connections_for_organization(session, principal.organization_id))
        if active_count >= limit:
            raise HTTPException(status_code=409, detail=f"Deactivate another experience first. Your current plan allows {limit} active experience{'s' if limit != 1 else ''}.")
    connection.active = payload.active
    connection.updated_at = datetime.now(UTC)
    session.commit()
    return {"id": connection.id, "active": connection.active}


@router.get("/roblox/connections")
def connections(principal: TenantDep, session: SessionDep):
    rows = stored_connections_for_organization(session, principal.organization_id)
    active_rows = [row for row in rows if row.active]
    limit = _experience_limit(session, principal.organization_id)
    entitled_ids = entitled_connection_ids(session, principal.organization_id, limit)
    states = {state.connection_id: state for state in session.scalars(select(RobloxSyncStateRecord).where(RobloxSyncStateRecord.organization_id == principal.organization_id)).all()}
    selection_required = len(active_rows) > limit
    return {
        "count": len(rows),
        "active_count": len(active_rows),
        "experience_limit": limit,
        "entitled_count": len(entitled_ids),
        "over_limit_count": max(0, len(active_rows) - limit),
        "selection_required": selection_required,
        "items": [
            {
                "id": row.id,
                "universe_id": row.universe_id,
                "experience_name": row.experience_name,
                "configured": True,
                "active": row.active,
                "entitled": row.id in entitled_ids,
                "over_limit": row.active and selection_required,
                "sync_status": states[row.id].health_status if row.id in states else "NEVER_SYNCED",
                "last_success_at": states[row.id].last_success_at if row.id in states else None,
            }
            for row in rows
        ],
    }


def _connection_for_tenant(session: Session, organization_id: int, connection_id: int | None = None) -> RobloxConnectionRecord:
    limit = _experience_limit(session, organization_id)
    rows = entitled_connections_for_organization(session, organization_id, limit)
    if not rows:
        active_count = len(active_connections_for_organization(session, organization_id))
        if active_count > limit:
            raise HTTPException(status_code=409, detail="Experience selection required after plan change")
        raise HTTPException(status_code=409, detail="No entitled Roblox experience connected")
    if connection_id is None:
        if len(rows) > 1:
            raise HTTPException(status_code=409, detail="Choose an experience for this action")
        return rows[0]
    for row in rows:
        if row.id == connection_id:
            return row
    raise HTTPException(status_code=403, detail="Experience is not active or entitled for this workspace")


@router.post("/roblox/sync")
async def sync_tenant(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1), metric: str | None = Query(default=None), days: int = Query(default=30, ge=1, le=730)):
    organization = _organization_for_principal(session, principal.organization_id)
    connection = _connection_for_tenant(session, principal.organization_id, connection_id)
    access = evaluate_product_access(session, principal.organization_id)
    history_days = catalog()["pilot"]["history_days"] if access.plan_id == "pilot" else plans_by_id().get(access.plan_id or "", {}).get("history_days", 30)
    days = min(days, history_days)
    if organization.data_mode == "SIMULATED":
        return {"status": "simulated", "organization_id": organization.id, "universe_id": connection.universe_id, "detail": "Simulation data is pre-seeded; no external Roblox request was made."}
    try:
        api_key = decrypt_credential(connection.encrypted_api_key)
        if metric:
            return await sync_metric_for_connection(session, organization_id=principal.organization_id, universe_id=connection.universe_id, api_key=api_key, metric=metric, days=days)
        return await sync_default_metrics_for_connection(session, organization_id=principal.organization_id, universe_id=connection.universe_id, api_key=api_key, days=days)
    except RobloxAnalyticsError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/roblox/observations")
def observations(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1), metric: str | None = Query(default=None), limit: int = Query(default=100, ge=1, le=1000)):
    query = select(MetricObservationRecord).where(MetricObservationRecord.organization_id == principal.organization_id)
    if connection_id is not None:
        connection = _connection_for_tenant(session, principal.organization_id, connection_id)
        query = query.where(MetricObservationRecord.universe_id == connection.universe_id)
    if metric:
        query = query.where(MetricObservationRecord.metric == metric)
    access = evaluate_product_access(session, principal.organization_id)
    history_days = catalog()["pilot"]["history_days"] if access.plan_id == "pilot" else plans_by_id().get(access.plan_id or "", {}).get("history_days")
    if history_days:
        query = query.where(MetricObservationRecord.observed_at >= datetime.now(UTC) - timedelta(days=history_days))
    rows = session.scalars(query.order_by(desc(MetricObservationRecord.observed_at)).limit(limit)).all()
    return {"count": len(rows), "items": [{"universe_id": row.universe_id, "metric": row.metric, "time": row.observed_at, "value": row.value, "dimensions": row.dimensions_json, "status": row.status} for row in rows]}


@router.get("/decisions/current")
def current_decisions(principal: ProductAccessDep, session: SessionDep, connection_id: int | None = Query(default=None, ge=1)):
    organization = _organization_for_principal(session, principal.organization_id)
    connection = _connection_for_tenant(session, principal.organization_id, connection_id)
    snapshot = build_decision_snapshot(session, connection.universe_id, organization_id=principal.organization_id)
    priorities = evaluate_snapshot(snapshot)
    return {"source": "simulation_observations" if organization.data_mode == "SIMULATED" else "tenant_roblox_observations", "data_mode": organization.data_mode, "connection_id": connection.id, "universe_id": connection.universe_id, "snapshot": asdict(snapshot), "count": len(priorities), "items": [{**asdict(item), "priority_score": item.priority_score} for item in priorities]}
