from app.domain.metrics import normalize_metric_response
from app.integrations.roblox.models import MetricResponse


def test_normalize_metric_response_preserves_dimensions_and_status() -> None:
    raw = MetricResponse.model_validate(
        {
            "values": [
                {
                    "breakdowns": [{"dimension": "Platform", "value": "Phone"}],
                    "dataPoints": [
                        {
                            "time": "2026-10-01T00:00:00Z",
                            "value": 3400,
                            "status": "Valid",
                        }
                    ],
                }
            ]
        }
    )

    observations = normalize_metric_response("DailyActiveUsers", raw)

    assert len(observations) == 1
    assert observations[0].metric == "DailyActiveUsers"
    assert observations[0].dimensions == {"Platform": "Phone"}
    assert observations[0].value == 3400
    assert observations[0].status == "Valid"
