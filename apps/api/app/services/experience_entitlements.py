from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import RobloxConnectionRecord


def stored_connections_for_organization(
    session: Session,
    organization_id: int,
) -> list[RobloxConnectionRecord]:
    return list(
        session.scalars(
            select(RobloxConnectionRecord)
            .where(RobloxConnectionRecord.organization_id == organization_id)
            .order_by(RobloxConnectionRecord.created_at, RobloxConnectionRecord.id)
        ).all()
    )


def active_connections_for_organization(
    session: Session,
    organization_id: int,
) -> list[RobloxConnectionRecord]:
    return [
        row
        for row in stored_connections_for_organization(session, organization_id)
        if row.active
    ]


def entitled_connections_for_organization(
    session: Session,
    organization_id: int,
    experience_limit: int,
) -> list[RobloxConnectionRecord]:
    if experience_limit <= 0:
        return []
    active = active_connections_for_organization(session, organization_id)
    # Never silently choose winners after a downgrade. Until the OWNER resolves
    # an over-limit selection, no connection is entitled and no credential may
    # be decrypted for product use.
    if len(active) > experience_limit:
        return []
    return active


def entitled_connection_ids(
    session: Session,
    organization_id: int,
    experience_limit: int,
) -> set[int]:
    return {
        row.id
        for row in entitled_connections_for_organization(
            session,
            organization_id,
            experience_limit,
        )
    }
