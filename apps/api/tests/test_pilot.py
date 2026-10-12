from app.domain.pilot import PilotState, evaluate_pilot_readiness


def test_disconnected_state_blocks_pilot() -> None:
    result = evaluate_pilot_readiness(
        configured=False,
        observation_count=0,
        priority_count=0,
    )
    assert result.state is PilotState.DISCONNECTED
    assert result.ready_for_pilot is False


def test_connected_empty_state_requires_data() -> None:
    result = evaluate_pilot_readiness(
        configured=True,
        observation_count=0,
        priority_count=0,
    )
    assert result.state is PilotState.CONNECTED_EMPTY
    assert "no analytics observations" in result.blockers[0].lower()


def test_ready_state_without_priority_is_still_pilot_ready() -> None:
    result = evaluate_pilot_readiness(
        configured=True,
        observation_count=24,
        priority_count=0,
    )
    assert result.state is PilotState.READY
    assert result.ready_for_pilot is True
    assert "monitoring" in result.next_action.lower()


def test_ready_state_with_priority_points_to_evidence() -> None:
    result = evaluate_pilot_readiness(
        configured=True,
        observation_count=24,
        priority_count=2,
    )
    assert result.state is PilotState.READY
    assert result.ready_for_pilot is True
    assert "top priority" in result.next_action.lower()


def test_sync_error_enters_degraded_state() -> None:
    result = evaluate_pilot_readiness(
        configured=True,
        observation_count=24,
        priority_count=1,
        sync_error=True,
    )
    assert result.state is PilotState.DEGRADED
    assert result.ready_for_pilot is False
