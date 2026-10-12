import asyncio
import json
import logging
import uuid
from collections.abc import Awaitable, Callable
from time import monotonic

import httpx
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("rde.request")


async def retry_http_request[T](
    operation: Callable[[], Awaitable[T]],
    *,
    attempts: int = 3,
    backoff_seconds: float = 0.25,
) -> T:
    """Retry transient HTTP failures with bounded exponential backoff."""
    last_error: Exception | None = None
    for attempt in range(max(1, attempts)):
        try:
            return await operation()
        except httpx.HTTPStatusError as exc:
            last_error = exc
            if exc.response.status_code not in {408, 429, 500, 502, 503, 504}:
                raise
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            last_error = exc

        if attempt + 1 < max(1, attempts):
            await asyncio.sleep(backoff_seconds * (2**attempt))

    assert last_error is not None
    raise last_error


class RequestObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        started = monotonic()
        response = await call_next(request)
        elapsed_ms = round((monotonic() - started) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        logger.info(
            json.dumps(
                {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": elapsed_ms,
                },
                separators=(",", ":"),
            )
        )
        return response
