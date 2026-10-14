import httpx
import pytest
from fastapi.testclient import TestClient

from app.integrations.roblox.client import RobloxAnalyticsClient
from app.integrations.roblox.models import Granularity, MetricQuery
from app.main import app
from app.reliability import retry_http_request

client = TestClient(app)


def test_ready_endpoint_degrades_without_database_and_keeps_observability_headers() -> None:
    response = client.get("/ready", headers={"X-Request-ID": "rde-test-request"})

    assert response.status_code in {200, 503}
    if response.status_code == 200:
        assert response.json()["status"] == "ready"
        assert response.json()["database"] == "ok"
    else:
        assert response.json()["status"] == "not_ready"
        assert response.json()["database"] == "unavailable"
    assert response.headers["x-request-id"] == "rde-test-request"
    assert float(response.headers["x-response-time-ms"]) >= 0


@pytest.mark.asyncio
async def test_retry_helper_recovers_from_transient_http_error() -> None:
    attempts = 0

    async def operation() -> str:
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            request = httpx.Request("GET", "https://example.test")
            response = httpx.Response(503, request=request)
            raise httpx.HTTPStatusError("temporary", request=request, response=response)
        return "ok"

    result = await retry_http_request(operation, attempts=3, backoff_seconds=0)

    assert result == "ok"
    assert attempts == 3


@pytest.mark.asyncio
async def test_roblox_client_retries_transient_failure() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        if calls == 1:
            return httpx.Response(503, request=request)
        return httpx.Response(
            200,
            request=request,
            json={"done": True, "response": {"values": []}},
        )

    query = MetricQuery(
        metric="DailyActiveUsers",
        granularity=Granularity.ONE_DAY,
        startTime="2026-10-01T00:00:00Z",
        endTime="2026-10-02T00:00:00Z",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        roblox = RobloxAnalyticsClient(
            universe_id="123",
            api_key="secret",
            http_client=http_client,
            retry_attempts=2,
            retry_backoff_seconds=0,
        )
        result = await roblox.query_metric(query)

    assert result.values == []
    assert calls == 2


@pytest.mark.asyncio
async def test_roblox_client_retries_rate_limit_429() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        if calls == 1:
            return httpx.Response(429, request=request, headers={"Retry-After": "0"})
        return httpx.Response(
            200,
            request=request,
            json={"done": True, "response": {"values": []}},
        )

    query = MetricQuery(
        metric="DailyActiveUsers",
        granularity=Granularity.ONE_DAY,
        startTime="2026-10-01T00:00:00Z",
        endTime="2026-10-02T00:00:00Z",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        roblox = RobloxAnalyticsClient(
            universe_id="123",
            api_key="secret",
            http_client=http_client,
            retry_attempts=2,
            retry_backoff_seconds=0,
        )
        result = await roblox.query_metric(query)

    assert result.values == []
    assert calls == 2
