from app.domain.decision_engine import DecisionSnapshot, EvidenceQuality, evaluate_snapshot


def test_mobile_gap_is_ranked_first_and_deduplicates_generic_retention_signal() -> None:
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

    assert len(priorities) == 2
    assert priorities[0].key == "mobile_retention_gap"
    assert priorities[0].family == "retention"
    assert priorities[0].evidence_quality == EvidenceQuality.HIGH
    assert priorities[0].causal_claim_allowed is False
    assert "not a proven causal explanation" in priorities[0].guardrail
    assert priorities[0].evidence[0].segment == "mobile vs desktop"
    assert all(item.key != "retention_decline" for item in priorities)


def test_no_signal_returns_no_priorities() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention=0.15,
            d1_retention_baseline=0.15,
            d1_retention_mobile=0.15,
            d1_retention_desktop=0.16,
            daily_revenue=22000,
            daily_revenue_baseline=22000,
            dau=12000,
            dau_baseline=12000,
        )
    )

    assert priorities == []


def test_revenue_lag_detected_when_dau_growth_outpaces_revenue() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            daily_revenue=1010,
            daily_revenue_baseline=1000,
            dau=1200,
            dau_baseline=1000,
        )
    )

    assert len(priorities) == 1
    assert priorities[0].key == "monetization_lag"
    assert priorities[0].evidence_quality == EvidenceQuality.HIGH
    assert len(priorities[0].evidence) == 2


def test_generic_retention_signal_remains_when_no_specific_segment_signal_exists() -> None:
    priorities = evaluate_snapshot(
        DecisionSnapshot(
            d1_retention=0.10,
            d1_retention_baseline=0.15,
        )
    )

    assert len(priorities) == 1
    assert priorities[0].key == "retention_decline"
    assert priorities[0].evidence_quality == EvidenceQuality.MEDIUM


def test_limit_caps_output_to_requested_top_n() -> None:
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
        ),
        limit=1,
    )

    assert len(priorities) == 1
    assert priorities[0].key == "mobile_retention_gap"
