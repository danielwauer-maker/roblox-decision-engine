from dataclasses import dataclass, field
from enum import StrEnum

from app.domain.decision_engine import DecisionPriority


class ExperimentOutcome(StrEnum):
    SHIP = "ship"
    ITERATE = "iterate"
    STOP = "stop"


@dataclass(slots=True)
class Guardrail:
    metric: str
    max_deterioration_pct: float
    rationale: str


@dataclass(slots=True)
class ExperimentPlan:
    priority_key: str
    title: str
    hypothesis: str
    audience: str
    control: str
    variant: str
    primary_kpi: str
    secondary_kpis: list[str]
    target_lift_pct: float
    minimum_sample_size: int
    runtime_days_min: int
    runtime_days_max: int
    guardrails: list[Guardrail] = field(default_factory=list)
    causality_note: str = (
        "The experiment tests a supported hypothesis; the underlying evidence does not prove causality."
    )


@dataclass(slots=True)
class ExperimentResult:
    outcome: ExperimentOutcome
    reason: str
    primary_lift_pct: float
    sample_size: int
    guardrail_breaches: list[str] = field(default_factory=list)


def build_experiment_plan(priority: DecisionPriority) -> ExperimentPlan:
    if priority.key == "mobile_retention_gap":
        return ExperimentPlan(
            priority_key=priority.key,
            title="Shorten mobile onboarding Step 3",
            hypothesis=(
                "If new mobile players complete a shorter onboarding Step 3, D1 retention will improve "
                "without materially harming monetization or session quality."
            ),
            audience="New mobile players",
            control="Current Step 3 with 5 required actions",
            variant="Short Step 3 with 3 required actions",
            primary_kpi="ForwardD1Retention",
            secondary_kpis=["TutorialCompletion", "SessionLength"],
            target_lift_pct=10.0,
            minimum_sample_size=3000,
            runtime_days_min=7,
            runtime_days_max=14,
            guardrails=[
                Guardrail("ARPDAU", 5.0, "Protect monetization efficiency."),
                Guardrail("PayerConversion", 5.0, "Do not trade retention for payer loss."),
                Guardrail("CrashRate", 2.0, "Do not ship a technically less stable flow."),
            ],
        )

    if priority.key == "monetization_lag":
        return ExperimentPlan(
            priority_key=priority.key,
            title="Test earlier starter-offer timing",
            hypothesis=(
                "If the starter offer appears at a higher-intent moment, payer conversion will improve "
                "without reducing retention or session quality."
            ),
            audience="Eligible active players who have not purchased",
            control="Current starter-offer timing",
            variant="Starter offer shown at the selected higher-intent moment",
            primary_kpi="PayerConversion",
            secondary_kpis=["DailyRevenue", "ARPDAU"],
            target_lift_pct=8.0,
            minimum_sample_size=4000,
            runtime_days_min=7,
            runtime_days_max=14,
            guardrails=[
                Guardrail("ForwardD1Retention", 3.0, "Protect early player quality."),
                Guardrail("SessionLength", 5.0, "Avoid disruptive monetization pressure."),
            ],
        )

    return ExperimentPlan(
        priority_key=priority.key,
        title=f"Validate: {priority.title}",
        hypothesis=f"If the recommended change is effective, the primary signal for {priority.title} will improve.",
        audience="Affected player segment",
        control="Current experience",
        variant=priority.recommendation,
        primary_kpi=priority.evidence[0].metric if priority.evidence else "PrimaryMetric",
        secondary_kpis=[],
        target_lift_pct=8.0,
        minimum_sample_size=3000,
        runtime_days_min=7,
        runtime_days_max=14,
        guardrails=[],
    )


def evaluate_experiment(
    plan: ExperimentPlan,
    *,
    primary_lift_pct: float,
    sample_size: int,
    guardrail_changes_pct: dict[str, float] | None = None,
) -> ExperimentResult:
    changes = guardrail_changes_pct or {}
    breaches = [
        guardrail.metric
        for guardrail in plan.guardrails
        if changes.get(guardrail.metric, 0.0) <= -guardrail.max_deterioration_pct
    ]

    if breaches:
        return ExperimentResult(
            outcome=ExperimentOutcome.STOP,
            reason="A protected guardrail deteriorated beyond the allowed threshold.",
            primary_lift_pct=primary_lift_pct,
            sample_size=sample_size,
            guardrail_breaches=breaches,
        )

    if sample_size < plan.minimum_sample_size:
        return ExperimentResult(
            outcome=ExperimentOutcome.ITERATE,
            reason="The result is directionally useful but the minimum sample has not been reached.",
            primary_lift_pct=primary_lift_pct,
            sample_size=sample_size,
        )

    if primary_lift_pct >= plan.target_lift_pct:
        return ExperimentResult(
            outcome=ExperimentOutcome.SHIP,
            reason="The primary KPI cleared the success threshold with no guardrail breach.",
            primary_lift_pct=primary_lift_pct,
            sample_size=sample_size,
        )

    return ExperimentResult(
        outcome=ExperimentOutcome.ITERATE,
        reason="The sample is sufficient, but the primary KPI did not clear the success threshold.",
        primary_lift_pct=primary_lift_pct,
        sample_size=sample_size,
    )
