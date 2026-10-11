import asyncio

import httpx

from app.integrations.roblox.models import MetricOperation, MetricQuery, MetricResponse


class RobloxAnalyticsError(RuntimeError):
    pass


class RobloxAnalyticsClient:
    def __init__(
        self,
        *,
        universe_id: str,
        api_key: str,
        base_url: str = "https://apis.roblox.com/analytics-query-api",
        http_client: httpx.AsyncClient | None = None,
        poll_interval_seconds: float = 0.5,
        max_polls: int = 20,
    ) -> None:
        self.universe_id = universe_id
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self._client = http_client
        self.poll_interval_seconds = poll_interval_seconds
        self.max_polls = max_polls

    @property
    def _headers(self) -> dict[str, str]:
        return {"x-api-key": self.api_key, "Content-Type": "application/json"}

    async def query_metric(self, query: MetricQuery) -> MetricResponse:
        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=30.0)
        try:
            url = f"{self.base_url}/v1/universes/{self.universe_id}/metrics"
            payload = query.model_dump(mode="json", by_alias=True, exclude_none=True)
            response = await client.post(url, headers=self._headers, json=payload)
            operation = self._parse_operation(response)

            if operation.done:
                return self._unwrap(operation)

            for _ in range(self.max_polls):
                await asyncio.sleep(self.poll_interval_seconds)
                poll_url = f"{self.base_url}/{operation.path.lstrip('/')}"
                poll_response = await client.get(poll_url, headers=self._headers)
                operation = self._parse_operation(poll_response)
                if operation.done:
                    return self._unwrap(operation)

            raise RobloxAnalyticsError("Roblox analytics operation timed out before completion")
        finally:
            if owns_client:
                await client.aclose()

    @staticmethod
    def _parse_operation(response: httpx.Response) -> MetricOperation:
        if response.status_code in {401, 404}:
            raise RobloxAnalyticsError(
                f"Roblox analytics HTTP {response.status_code}: authentication/resource failure"
            )
        response.raise_for_status()
        return MetricOperation.model_validate(response.json())

    @staticmethod
    def _unwrap(operation: MetricOperation) -> MetricResponse:
        if operation.error is not None:
            raise RobloxAnalyticsError(
                f"Roblox analytics error {operation.error.code}: {operation.error.message}"
            )
        if operation.response is None:
            raise RobloxAnalyticsError("Roblox analytics operation completed without a response")
        return operation.response
