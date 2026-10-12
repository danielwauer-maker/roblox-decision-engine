from app.domain.analyst import compose_brief, compose_insight
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot


def test_analyst_brief_uses_ranked_priority() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention=0.118,
            d1_retention_baseline=0.151,
            d1_retention_mobile=0.087,
            d1_retention_desktop=0.179,
            daily_revenue=22100,
            daily_revenue_baseline=21900,
            dau=13800,
            dau_baseline=11800,
        )
    )

    brief = compose_brief(priorities)

    assert brief.priorities
    assert brief.priorities[0].key == priorities[0].key
    assert priorities[0].title in brief.executive_summary
    assert "ranks" in brief.executive_summary


def test_analyst_keeps_causal_language_guarded() -> None:
    priority = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention_mobile=0.087,
            d1_retention_desktop=0.179,
        )
    )[0]

    insight = compose_insight(priority)

    assert insight.hypotheses
    assert "hypotheses" in insight.guardrail.lower()
    assert "must be validated" in insight.guardrail.lower()


def test_analyst_exposes_only_supported_evidence() -> None:
    priority = evaluate_snapshot(
        DecisionSnapshot(
            daily_revenue=1010,
            daily_revenue_baseline=1000,
            dau=1200,
            dau_baseline=1000,
        )
    )[0]

    insight = compose_insight(priority)

    metrics = {item["metric"] for item in insight.evidence}
    assert metrics == {"DailyActiveUsers", "DailyRevenue"}
    assert "120.0%" not in insight.summary


def test_empty_priorities_return_monitoring_message() -> None:
    brief = compose_brief([])

    assert brief.priorities == []
    assert "No material product or growth issue" in brief.executive_summary
