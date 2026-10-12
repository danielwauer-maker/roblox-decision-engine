from dataclasses import dataclass, field
from enum import StrEnum


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass(slots=True)
class EvidenceItem:
    metric: str
    current: float
    baseline: float
    unit: str
    delta: float
    segment: str | None = None
    note: str | None = None


@dataclass(slots=True)
class RootCauseCandidate:
    label: str
    support: str
    confidence: float


@dataclass(slots=True)
class DecisionPriority:
    key: str
    title: str
    recommendation: str
    impact_score: int
    confidence_score: int
    severity: Severity
    evidence: list[EvidenceItem] = field(default_factory=list)
    root_causes: list[RootCauseCandidate] = field(default_factory=list)

    @property
    def priority_score(self) -> int:
        return round((self.impact_score * 0.6) + (self.confidence_score * 0.4))


@dataclass(slots=True)
class DecisionSnapshot:
    d1_retention: float | None = None
    d1_retention_baseline: float | None = None
    d1_retention_mobile: float | None = None
    d1_retention_desktop: float | None = None
    daily_revenue: float | None = None
    daily_revenue_baseline: float | None = None
    dau: float | None = None
    dau_baseline: float | None = None


def _pct_change(current: float, baseline: float) -> float:
    if baseline == 0:
        return 0.0
    return ((current - baseline) / baseline) * 100


def evaluate_snapshot(snapshot: DecisionSnapshot) -> list[DecisionPriority]:
    priorities: list[DecisionPriority] = []

    if (
        snapshot.d1_retention_mobile is not None
        and snapshot.d1_retention_desktop is not None
        and snapshot.d1_retention_desktop > 0
    ):
        gap = snapshot.d1_retention_desktop - snapshot.d1_retention_mobile
        if gap >= 0.05:
            confidence = min(95, 70 + round(gap * 100))
            priorities.append(
                DecisionPriority(
                    key="mobile_retention_gap",
                    title="Investigate mobile onboarding friction",
                    recommendation=(
                        "Compare the first-session funnel by device and test a shorter mobile onboarding flow."
                    ),
                    impact_score=min(100, 65 + round(gap * 180)),
                    confidence_score=confidence,
                    severity=Severity.HIGH if gap >= 0.08 else Severity.MEDIUM,
                    evidence=[
                        EvidenceItem(
                            metric="ForwardD1Retention",
                            current=snapshot.d1_retention_mobile,
                            baseline=snapshot.d1_retention_desktop,
                            unit="ratio",
                            delta=-gap,
                            segment="mobile vs desktop",
                            note="Segment divergence is material enough to warrant investigation.",
                        )
                    ],
                    root_causes=[
                        RootCauseCandidate(
                            label="Onboarding friction",
                            support="Mobile D1 materially underperforms desktop D1.",
                            confidence=0.82,
                        ),
                        RootCauseCandidate(
                            label="Device-specific UX issue",
                            support="The gap is isolated to a device segment.",
                            confidence=0.68,
                        ),
                    ],
                )
            )

    if snapshot.d1_retention is not None and snapshot.d1_retention_baseline is not None:
        change = _pct_change(snapshot.d1_retention, snapshot.d1_retention_baseline)
        if change <= -10:
            priorities.append(
                DecisionPriority(
                    key="retention_decline",
                    title="Recover Day-1 retention before scaling growth",
                    recommendation=(
                        "Pause aggressive acquisition scaling and localize the largest first-session drop-off."
                    ),
                    impact_score=min(100, 70 + round(abs(change) * 0.8)),
                    confidence_score=88,
                    severity=Severity.HIGH,
                    evidence=[
                        EvidenceItem(
                            metric="ForwardD1Retention",
                            current=snapshot.d1_retention,
                            baseline=snapshot.d1_retention_baseline,
                            unit="ratio",
                            delta=snapshot.d1_retention - snapshot.d1_retention_baseline,
                            note=f"D1 retention is {abs(change):.1f}% below baseline.",
                        )
                    ],
                    root_causes=[
                        RootCauseCandidate(
                            label="First-session funnel regression",
                            support="D1 declined materially versus its own baseline.",
                            confidence=0.76,
                        )
                    ],
                )
            )

    if (
        snapshot.daily_revenue is not None
        and snapshot.daily_revenue_baseline is not None
        and snapshot.dau is not None
        and snapshot.dau_baseline is not None
    ):
        revenue_change = _pct_change(snapshot.daily_revenue, snapshot.daily_revenue_baseline)
        dau_change = _pct_change(snapshot.dau, snapshot.dau_baseline)
        if dau_change >= 10 and revenue_change <= 2:
            priorities.append(
                DecisionPriority(
                    key="monetization_lag",
                    title="Convert traffic growth into monetization",
                    recommendation=(
                        "Inspect payer conversion and offer timing before increasing acquisition spend further."
                    ),
                    impact_score=min(100, 62 + round(dau_change * 0.8)),
                    confidence_score=80,
                    severity=Severity.MEDIUM,
                    evidence=[
                        EvidenceItem(
                            metric="DailyActiveUsers",
                            current=snapshot.dau,
                            baseline=snapshot.dau_baseline,
                            unit="users",
                            delta=snapshot.dau - snapshot.dau_baseline,
                            note=f"DAU is up {dau_change:.1f}%.",
                        ),
                        EvidenceItem(
                            metric="DailyRevenue",
                            current=snapshot.daily_revenue,
                            baseline=snapshot.daily_revenue_baseline,
                            unit="robux",
                            delta=snapshot.daily_revenue - snapshot.daily_revenue_baseline,
                            note=f"Revenue changed only {revenue_change:.1f}%.",
                        ),
                    ],
                    root_causes=[
                        RootCauseCandidate(
                            label="Low payer conversion",
                            support="Traffic grew materially faster than revenue.",
                            confidence=0.79,
                        ),
                        RootCauseCandidate(
                            label="Offer timing mismatch",
                            support="New traffic may not yet be reaching a high-intent purchase moment.",
                            confidence=0.57,
                        ),
                    ],
                )
            )

    priorities.sort(key=lambda item: item.priority_score, reverse=True)
    return priorities
