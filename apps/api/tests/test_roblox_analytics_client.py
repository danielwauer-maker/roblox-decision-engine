from datetime import UTC, datetime

import httpx
import pytest

from app.integrations.roblox.client import RobloxAnalyticsClient, RobloxAnalyticsError
from app.integrations.roblox.models import Granularity, MetricQuery


def query() -> MetricQuery:
    return MetricQuery(
        metric="DailyActiveUsers",
        granularity=Granularity.ONE_DAY,
        startTime=datetime(2026, 10, 1, tzinfo=UTC),
        endTime=datetime(2026, 10, 8, tzinfo=UTC),
        breakdown=["Platform"],
    )


@pytest.mark.asyncio
async def test_immediate_metric_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-api-key"] == "secret"
        assert request.url.path.endswith("/v1/universes/123/metrics")
        return httpx.Response(
            200,
            json={
                "path": "v1/universes/123/operations/metrics/op-1",
                "done": True,
                "response": {
                    "values": [
                        {
                            "breakdowns": [{"dimension": "Platform", "value": "Phone"}],
                            "dataPoints": [
                                {"time": "2026-10-01T00:00:00Z", "value": 3400}
                            ],
                        }
                    ]
                },
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        client = RobloxAnalyticsClient(
            universe_id="123", api_key="secret", http_client=http_client
        )
        result = await client.query_metric(query())

    assert result.values[0].breakdowns[0].value == "Phone"
    assert result.values[0].data_points[0].value == 3400


@pytest.mark.asyncio
async def test_immediate_empty_response_without_operation_path() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        return httpx.Response(
            200,
            json={
                "done": True,
                "response": {"values": []},
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        client = RobloxAnalyticsClient(
            universe_id="123", api_key="secret", http_client=http_client
        )
        result = await client.query_metric(query())

    assert result.values == []


@pytest.mark.asyncio
async def test_long_running_metric_response_is_polled() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        if request.method == "POST":
            return httpx.Response(
                202,
                json={
                    "path": "v1/universes/123/operations/metrics/op-2",
                    "done": False,
                },
            )
        return httpx.Response(
            200,
            json={
                "path": "v1/universes/123/operations/metrics/op-2",
                "done": True,
                "response": {
                    "values": [
                        {
                            "breakdowns": [],
                            "dataPoints": [
                                {"time": "2026-10-01T00:00:00Z", "value": 10000}
                            ],
                        }
                    ]
                },
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        client = RobloxAnalyticsClient(
            universe_id="123",
            api_key="secret",
            http_client=http_client,
            poll_interval_seconds=0,
        )
        result = await client.query_metric(query())

    assert calls == 2
    assert result.values[0].data_points[0].value == 10000


@pytest.mark.asyncio
async def test_operation_error_is_raised() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            400,
            json={
                "path": "v1/universes/123/operations/metrics/op-3",
                "done": True,
                "error": {"code": 2001, "message": "Unsupported metric"},
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        client = RobloxAnalyticsClient(
            universe_id="123", api_key="secret", http_client=http_client
        )
        with pytest.raises(RobloxAnalyticsError, match="2001"):
            await client.query_metric(query())
