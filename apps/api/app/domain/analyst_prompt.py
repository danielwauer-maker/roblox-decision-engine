import json
from dataclasses import asdict, dataclass

from app.domain.decision_engine import DecisionPriority

SYSTEM_POLICY = """You are the Roblox Decision Engine Product Analyst.
Use only facts present in the supplied decision bundle.
Never invent metrics, dates, segments, benchmarks, causes, experiments, or certainty.
Root-cause candidates are hypotheses unless causal_claim_allowed is true.
If evidence is weak or incomplete, say so explicitly.
Return concise product-analysis language suitable for a studio lead.
"""


@dataclass(slots=True)
class AnalystPromptPackage:
    system: str
    payload_json: str


def build_prompt_package(priorities: list[DecisionPriority]) -> AnalystPromptPackage:
    payload = {
        "contract_version": "1.0",
        "rules": {
            "max_priorities": 3,
            "evidence_only": True,
            "causal_claims_require_permission": True,
            "unsupported_numbers_forbidden": True,
        },
        "priorities": [
            {
                "key": priority.key,
                "title": priority.title,
                "recommendation": priority.recommendation,
                "priority_score": priority.priority_score,
                "impact_score": priority.impact_score,
                "confidence_score": priority.confidence_score,
                "evidence_quality": priority.evidence_quality.value,
                "causal_claim_allowed": priority.causal_claim_allowed,
                "guardrail": priority.guardrail,
                "evidence": [asdict(item) for item in priority.evidence],
                "root_cause_candidates": [asdict(item) for item in priority.root_causes],
            }
            for priority in priorities[:3]
        ],
    }
    return AnalystPromptPackage(
        system=SYSTEM_POLICY.strip(),
        payload_json=json.dumps(payload, separators=(",", ":"), sort_keys=True),
    )
