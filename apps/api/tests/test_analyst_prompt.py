import json

from app.domain.analyst_prompt import build_prompt_package
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot


def test_prompt_contract_contains_only_grounded_priority_fields() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention_mobile=0.087,
            d1_retention_desktop=0.179,
        )
    )

    package = build_prompt_package(priorities)
    payload = json.loads(package.payload_json)

    assert payload["rules"]["evidence_only"] is True
    assert payload["rules"]["causal_claims_require_permission"] is True
    assert payload["rules"]["unsupported_numbers_forbidden"] is True
    assert payload["priorities"][0]["key"] == "mobile_retention_gap"
    assert payload["priorities"][0]["causal_claim_allowed"] is False


def test_prompt_contract_caps_priorities_at_three() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention=0.10,
            d1_retention_baseline=0.15,
            d1_retention_mobile=0.08,
            d1_retention_desktop=0.18,
            daily_revenue=1000,
            daily_revenue_baseline=1000,
            dau=1300,
            dau_baseline=1000,
        ),
        limit=10,
    )

    payload = json.loads(build_prompt_package(priorities).payload_json)
    assert len(payload["priorities"]) <= 3
