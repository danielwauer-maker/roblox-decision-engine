from dataclasses import asdict

from fastapi import APIRouter

from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot

router = APIRouter(prefix="/v1/decisions", tags=["decisions"])


@router.post("/evaluate")
def evaluate(snapshot: DecisionSnapshot) -> dict[str, object]:
    priorities = evaluate_snapshot(snapshot)
    return {
        "count": len(priorities),
        "items": [
            {
                **asdict(priority),
                "priority_score": priority.priority_score,
            }
            for priority in priorities
        ],
    }


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
    priorities = evaluate_snapshot(snapshot)
    return {
        "source": "simulated_validation_data",
        "count": len(priorities),
        "items": [
            {
                **asdict(priority),
                "priority_score": priority.priority_score,
            }
            for priority in priorities
        ],
    }
