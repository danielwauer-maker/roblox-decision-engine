import json
from functools import lru_cache
from pathlib import Path


def _catalog_path(module_file: str | Path | None = None) -> Path:
    source = Path(module_file or __file__).resolve()
    candidates = (
        source.parents[1] / "shared" / "commercial_plans.json",
        source.parents[2] / "shared" / "commercial_plans.json",
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("Could not locate shared/commercial_plans.json from the API module")


@lru_cache
def catalog() -> dict:
    return json.loads(_catalog_path().read_text(encoding="utf-8"))


def plans_by_id() -> dict[str, dict]:
    return {plan["plan_id"]: plan for plan in catalog()["plans"]}
