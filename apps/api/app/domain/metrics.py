from datetime import datetime

from pydantic import BaseModel, Field

from app.integrations.roblox.models import MetricResponse


class MetricObservation(BaseModel):
    metric: str
    time: datetime
    value: float
    dimensions: dict[str, str] = Field(default_factory=dict)
    status: str | None = None


def normalize_metric_response(metric: str, response: MetricResponse) -> list[MetricObservation]:
    observations: list[MetricObservation] = []
    for series in response.values:
        dimensions = {item.dimension: item.value for item in series.breakdowns}
        for point in series.data_points:
            observations.append(
                MetricObservation(
                    metric=metric,
                    time=point.time,
                    value=point.value,
                    dimensions=dimensions,
                    status=point.status,
                )
            )
    return observations
