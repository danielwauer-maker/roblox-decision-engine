import json
from functools import lru_cache
from pathlib import Path


@lru_cache
def catalog() -> dict:
    path = Path(__file__).resolve().parents[2] / "shared" / "commercial_plans.json"
    return json.loads(path.read_text(encoding="utf-8"))


def plans_by_id() -> dict[str, dict]:
    return {plan["plan_id"]: plan for plan in catalog()["plans"]}
