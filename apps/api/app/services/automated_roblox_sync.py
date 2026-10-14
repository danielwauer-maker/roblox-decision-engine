from __future__ import annotations

from collections.abc import Callable
from dataclasses import asdict, dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.access_control import evaluate_product_access
from app.models import OrganizationRecord, RobloxConnectionRecord, RobloxSyncStateRecord
from app.services.roblox_metrics import sync_default_metrics_for_connection
from app.tenant_security import decrypt_credential


@dataclass(slots=True)
class ConnectionSyncResult:
    connection_id: int
    organization_id: int
    universe_id: str
    status: str
    error: str | None = None


@dataclass(slots=True)
class SyncRunSummary:
    candidates: int = 0
    synced: int = 0
    failed: int = 0
    skipped: int = 0

    def as_dict(self) -> dict[str, int]:
        return asdict(self)


def _sync_state(
    session: Session,
    connection: RobloxConnectionRecord,
    *,
    now: datetime,
) -> RobloxSyncStateRecord:
    state = session.scalar(
        select(RobloxSyncStateRecord).where(
            RobloxSyncStateRecord.connection_id == connection.id
        )
    )
    if state is None:
        state = RobloxSyncStateRecord(
            connection_id=connection.id,
            organization_id=connection.organization_id,
            universe_id=connection.universe_id,
            health_status="NEVER_SYNCED",
            last_attempt_at=None,
            last_success_at=None,
            last_error=None,
            updated_at=now,
        )
        session.add(state)
        session.flush()
    return state


def candidate_connection_ids(session: Session) -> list[int]:
    return list(
        session.scalars(
            select(RobloxConnectionRecord.id)
            .join(
                OrganizationRecord,
                OrganizationRecord.id == RobloxConnectionRecord.organization_id,
            )
            .where(
                OrganizationRecord.active.is_(True),
                OrganizationRecord.data_mode == "LIVE",
                RobloxConnectionRecord.active.is_(True),
            )
            .order_by(RobloxConnectionRecord.id)
        ).all()
    )


async def sync_connection(
    session: Session,
    *,
    connection_id: int,
    days: int = 30,
) -> ConnectionSyncResult:
    connection = session.get(RobloxConnectionRecord, connection_id)
    if connection is None:
        return ConnectionSyncResult(connection_id, 0, "", "skipped", "connection_missing")

    organization = session.get(OrganizationRecord, connection.organization_id)
    now = datetime.now(UTC)
    state = _sync_state(session, connection, now=now)

    if (
        organization is None
        or not organization.active
        or organization.data_mode != "LIVE"
        or not connection.active
    ):
        state.health_status = "INACTIVE"
        state.last_error = None
        state.updated_at = now
        session.commit()
        return ConnectionSyncResult(
            connection.id,
            connection.organization_id,
            connection.universe_id,
            "skipped",
            "inactive",
        )

    access = evaluate_product_access(session, connection.organization_id, now=now)
    if not access.allowed:
        state.health_status = "BLOCKED"
        state.last_error = "Product entitlement inactive"
        state.updated_at = now
        session.commit()
        return ConnectionSyncResult(
            connection.id,
            connection.organization_id,
            connection.universe_id,
            "skipped",
            "entitlement_inactive",
        )

    state.health_status = "SYNCING"
    state.last_attempt_at = now
    state.last_error = None
    state.updated_at = now
    session.commit()

    try:
        api_key = decrypt_credential(connection.encrypted_api_key)
        await sync_default_metrics_for_connection(
            session,
            organization_id=connection.organization_id,
            universe_id=connection.universe_id,
            api_key=api_key,
            days=days,
        )
    except Exception as exc:  # noqa: BLE001 - tenant boundary must persist unexpected failures
        session.rollback()
        failed_at = datetime.now(UTC)
        state = _sync_state(session, connection, now=failed_at)
        state.health_status = "ERROR"
        state.last_error = str(exc)[:4000]
        state.updated_at = failed_at
        session.commit()
        return ConnectionSyncResult(
            connection.id,
            connection.organization_id,
            connection.universe_id,
            "failed",
            str(exc),
        )

    succeeded_at = datetime.now(UTC)
    state = _sync_state(session, connection, now=succeeded_at)
    state.health_status = "HEALTHY"
    state.last_success_at = succeeded_at
    state.last_error = None
    state.updated_at = succeeded_at
    session.commit()
    return ConnectionSyncResult(
        connection.id,
        connection.organization_id,
        connection.universe_id,
        "synced",
    )


async def run_automated_sync(
    session_factory: Callable[[], Session],
    *,
    days: int = 30,
) -> tuple[SyncRunSummary, list[ConnectionSyncResult]]:
    discovery_session = session_factory()
    try:
        connection_ids = candidate_connection_ids(discovery_session)
    finally:
        discovery_session.close()

    summary = SyncRunSummary(candidates=len(connection_ids))
    results: list[ConnectionSyncResult] = []

    for connection_id in connection_ids:
        tenant_session = session_factory()
        try:
            result = await sync_connection(
                tenant_session,
                connection_id=connection_id,
                days=days,
            )
        except Exception as exc:  # noqa: BLE001 - one tenant must never abort the scheduler
            tenant_session.rollback()
            result = ConnectionSyncResult(
                connection_id=connection_id,
                organization_id=0,
                universe_id="",
                status="failed",
                error=str(exc),
            )
        finally:
            tenant_session.close()

        results.append(result)
        if result.status == "synced":
            summary.synced += 1
        elif result.status == "failed":
            summary.failed += 1
        else:
            summary.skipped += 1

    return summary, results
