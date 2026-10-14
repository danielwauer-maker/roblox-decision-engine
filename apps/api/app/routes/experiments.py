from dataclasses import asdict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.access_control import ProductAccessDep
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.domain.experiments import build_experiment_plan, evaluate_experiment

router = APIRouter(prefix="/v1/experiments", tags=["experiments"])


class ExperimentEvaluationRequest(BaseModel):
    snapshot: DecisionSnapshot
    primary_lift_pct: float
    sample_size: int = Field(ge=0)
    guardrail_changes_pct: dict[str, float] = Field(default_factory=dict)


def _plan_for_snapshot(snapshot: DecisionSnapshot):
    priorities = evaluate_snapshot(snapshot)
    if not priorities:
        raise HTTPException(status_code=422, detail="No supported decision priority is available")
    return build_experiment_plan(priorities[0])


@router.post("/plan")
def plan(snapshot: DecisionSnapshot, _: ProductAccessDep) -> dict[str, object]:
    experiment = _plan_for_snapshot(snapshot)
    return {"source": "decision_engine", "plan": asdict(experiment)}


@router.post("/evaluate")
def evaluate(request: ExperimentEvaluationRequest, _: ProductAccessDep) -> dict[str, object]:
    experiment = _plan_for_snapshot(request.snapshot)
    result = evaluate_experiment(
        experiment,
        primary_lift_pct=request.primary_lift_pct,
        sample_size=request.sample_size,
        guardrail_changes_pct=request.guardrail_changes_pct,
    )
    return {"plan": asdict(experiment), "result": asdict(result)}


@router.get("/demo")
def demo() -> dict[str, object]:
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
    experiment = _plan_for_snapshot(snapshot)
    result = evaluate_experiment(
        experiment,
        primary_lift_pct=12.4,
        sample_size=3420,
        guardrail_changes_pct={"ARPDAU": 1.2, "PayerConversion": 0.4, "CrashRate": 0.1},
    )
    return {
        "source": "simulated_validation_data",
        "plan": asdict(experiment),
        "example_result": asdict(result),
    }
