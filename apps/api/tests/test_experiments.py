from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.domain.experiments import ExperimentOutcome, build_experiment_plan, evaluate_experiment


def _mobile_priority():
    snapshot = DecisionSnapshot(
        d1_retention=0.118,
        d1_retention_baseline=0.151,
        d1_retention_mobile=0.087,
        d1_retention_desktop=0.179,
        daily_revenue=22100,
        daily_revenue_baseline=21900,
        dau=13800,
        dau_baseline=11800,
    )
    return evaluate_snapshot(snapshot)[0]


def test_builds_mobile_onboarding_experiment_from_top_priority():
    plan = build_experiment_plan(_mobile_priority())

    assert plan.priority_key == "mobile_retention_gap"
    assert plan.primary_kpi == "ForwardD1Retention"
    assert plan.target_lift_pct == 10.0
    assert plan.minimum_sample_size == 3000
    assert {item.metric for item in plan.guardrails} == {"ARPDAU", "PayerConversion", "CrashRate"}
    assert "does not prove causality" in plan.causality_note


def test_ship_when_success_threshold_is_cleared_without_guardrail_breach():
    plan = build_experiment_plan(_mobile_priority())
    result = evaluate_experiment(
        plan,
        primary_lift_pct=12.4,
        sample_size=3420,
        guardrail_changes_pct={"ARPDAU": 1.2, "PayerConversion": 0.4, "CrashRate": 0.1},
    )

    assert result.outcome == ExperimentOutcome.SHIP
    assert result.guardrail_breaches == []


def test_iterate_when_sample_is_too_small():
    plan = build_experiment_plan(_mobile_priority())
    result = evaluate_experiment(plan, primary_lift_pct=15.0, sample_size=1200)

    assert result.outcome == ExperimentOutcome.ITERATE
    assert "minimum sample" in result.reason


def test_stop_when_guardrail_deteriorates_materially():
    plan = build_experiment_plan(_mobile_priority())
    result = evaluate_experiment(
        plan,
        primary_lift_pct=18.0,
        sample_size=4000,
        guardrail_changes_pct={"ARPDAU": -6.0},
    )

    assert result.outcome == ExperimentOutcome.STOP
    assert result.guardrail_breaches == ["ARPDAU"]


def test_iterate_when_lift_misses_threshold_with_sufficient_sample():
    plan = build_experiment_plan(_mobile_priority())
    result = evaluate_experiment(plan, primary_lift_pct=4.0, sample_size=3500)

    assert result.outcome == ExperimentOutcome.ITERATE
    assert "did not clear" in result.reason
