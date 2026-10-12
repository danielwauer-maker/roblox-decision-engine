from dataclasses import asdict, dataclass

from app.domain.decision_engine import DecisionPriority, EvidenceQuality


@dataclass(slots=True)
class AnalystInsight:
    key: str
    headline: str
    summary: str
    why_it_matters: str
    next_action: str
    confidence: str
    evidence: list[dict[str, object]]
    hypotheses: list[str]
    guardrail: str


@dataclass(slots=True)
class AnalystBrief:
    executive_summary: str
    priorities: list[AnalystInsight]
    data_quality_note: str


def _format_metric(metric: str, value: float, unit: str) -> str:
    if unit == "ratio":
        return f"{value * 100:.1f}%"
    if unit == "users":
        return f"{value:,.0f} users"
    if unit == "robux":
        return f"R$ {value:,.0f}"
    return f"{value:.2f}"


def _evidence_sentence(priority: DecisionPriority) -> str:
    if not priority.evidence:
        return "The current evidence bundle is too thin for a strong recommendation."

    parts: list[str] = []
    for item in priority.evidence[:2]:
        current = _format_metric(item.metric, item.current, item.unit)
        baseline = _format_metric(item.metric, item.baseline, item.unit)
        segment = f" ({item.segment})" if item.segment else ""
        parts.append(f"{item.metric}{segment}: {current} vs {baseline}")
    return "; ".join(parts) + "."


def _confidence_label(priority: DecisionPriority) -> str:
    if priority.confidence_score >= 85 and priority.evidence_quality == EvidenceQuality.HIGH:
        return "high"
    if priority.confidence_score >= 70:
        return "medium"
    return "low"


def compose_insight(priority: DecisionPriority) -> AnalystInsight:
    evidence_sentence = _evidence_sentence(priority)
    hypotheses = [
        f"{candidate.label}: {candidate.support}"
        for candidate in priority.root_causes
        if candidate.confidence >= 0.6
    ]

    summary = f"{priority.title}. {evidence_sentence}"
    why_it_matters = (
        f"This signal ranks at {priority.priority_score}/100 because the estimated impact is "
        f"{priority.impact_score}/100 with {priority.confidence_score}/100 confidence."
    )

    guardrail = priority.guardrail
    if hypotheses:
        guardrail += " Root-cause candidates are hypotheses and must be validated through analysis or an experiment."

    return AnalystInsight(
        key=priority.key,
        headline=priority.title,
        summary=summary,
        why_it_matters=why_it_matters,
        next_action=priority.recommendation,
        confidence=_confidence_label(priority),
        evidence=[asdict(item) for item in priority.evidence],
        hypotheses=hypotheses,
        guardrail=guardrail,
    )


def compose_brief(priorities: list[DecisionPriority]) -> AnalystBrief:
    if not priorities:
        return AnalystBrief(
            executive_summary=(
                "No material product or growth issue crossed the current decision thresholds. "
                "Keep monitoring retention, traffic and monetization before changing strategy."
            ),
            priorities=[],
            data_quality_note="No priority was generated from the currently supported metrics.",
        )

    insights = [compose_insight(priority) for priority in priorities]
    lead = priorities[0]
    executive_summary = (
        f"Your top priority is: {lead.title}. "
        f"The engine ranks it {lead.priority_score}/100 and recommends acting on it before lower-ranked signals."
    )

    qualities = {priority.evidence_quality for priority in priorities}
    data_quality_note = (
        "Evidence quality is high across all surfaced priorities."
        if qualities == {EvidenceQuality.HIGH}
        else "Some priorities rely on medium-strength evidence; treat explanations as hypotheses until validated."
    )

    return AnalystBrief(
        executive_summary=executive_summary,
        priorities=insights,
        data_quality_note=data_quality_note,
    )
