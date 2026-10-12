# Reliability baseline

R10 establishes the operational reliability baseline for Roblox Decision Engine.

## External requests

Roblox Analytics and OpenAI requests use bounded retries for transient failures only:

- HTTP 408, 429, 500, 502, 503 and 504
- network failures
- request timeouts

Retries use exponential backoff and are capped by `EXTERNAL_RETRY_ATTEMPTS`. Non-transient client errors are not retried.

Default configuration:

- `EXTERNAL_REQUEST_TIMEOUT_SECONDS=15`
- `EXTERNAL_RETRY_ATTEMPTS=3`
- `EXTERNAL_RETRY_BACKOFF_SECONDS=0.25`

The AI analyst retains its deterministic fallback if the model provider remains unavailable after retries.

## Health and readiness

`GET /health` is the liveness check. It only confirms that the API process can serve requests.

`GET /ready` is the readiness check. It verifies database connectivity and reports whether Roblox live credentials are configured and whether the analyst is in model or deterministic mode.

## Request observability

Every API response includes:

- `X-Request-ID`
- `X-Response-Time-Ms`

An incoming `X-Request-ID` is preserved. Otherwise the API generates one. Structured request logs include request ID, method, path, status code and duration only; request bodies and credentials are not logged.

## Recovery principles

- Metric persistence remains idempotent, so a repeated sync does not duplicate existing observations.
- Roblox transient failures are retried before surfacing a controlled integration error.
- OpenAI transient failures are retried before falling back to deterministic analyst output.
- Long-running Roblox Analytics operations remain bounded by the polling limit.
- Database connections use pre-ping to avoid reusing dead pooled connections.

## R10 exit gate

R10 is complete when retry behavior, readiness, observability headers, regression tests, CI and the production frontend deployment are all green.
