from dataclasses import dataclass
from enum import StrEnum


class PilotState(StrEnum):
    DISCONNECTED = "disconnected"
    CONNECTED_EMPTY = "connected_empty"
    READY = "ready"
    DEGRADED = "degraded"


@dataclass(slots=True)
class PilotReadiness:
    state: PilotState
    ready_for_pilot: bool
    blockers: list[str]
    next_action: str


def evaluate_pilot_readiness(
    *,
    configured: bool,
    observation_count: int,
    priority_count: int,
    sync_error: bool = False,
) -> PilotReadiness:
    if sync_error:
        return PilotReadiness(
            state=PilotState.DEGRADED,
            ready_for_pilot=False,
            blockers=["Roblox analytics sync needs attention."],
            next_action="Reconnect or retry the analytics sync before continuing.",
        )
    if not configured:
        return PilotReadiness(
            state=PilotState.DISCONNECTED,
            ready_for_pilot=False,
            blockers=["Roblox analytics credentials are not configured."],
            next_action="Connect a read-only Roblox analytics key and universe ID.",
        )
    if observation_count <= 0:
        return PilotReadiness(
            state=PilotState.CONNECTED_EMPTY,
            ready_for_pilot=False,
            blockers=["Connection is valid but no analytics observations are available yet."],
            next_action="Run a sync after the experience has generated analytics data.",
        )
    if priority_count <= 0:
        return PilotReadiness(
            state=PilotState.READY,
            ready_for_pilot=True,
            blockers=[],
            next_action="No material issue is currently detected. Continue monitoring the weekly brief.",
        )
    return PilotReadiness(
        state=PilotState.READY,
        ready_for_pilot=True,
        blockers=[],
        next_action="Review the top priority, evidence bundle and proposed experiment.",
    )
