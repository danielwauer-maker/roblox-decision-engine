# Reliability baseline

This document describes the current PlayDirective production reliability baseline for the founding-studio release.

## External requests

Roblox Analytics, OpenAI and Resend transactional-email requests use bounded retries for transient failures only:

- HTTP 408, 429, 500, 502, 503 and 504
- network failures
- request timeouts

Retries use exponential backoff and are capped by `EXTERNAL_RETRY_ATTEMPTS`. Non-transient client errors such as invalid credentials, invalid recipients or unsupported requests are not retried.

Default configuration:

- `EXTERNAL_REQUEST_TIMEOUT_SECONDS=15`
- `EXTERNAL_RETRY_ATTEMPTS=3`
- `EXTERNAL_RETRY_BACKOFF_SECONDS=0.25`

The AI analyst retains its deterministic fallback if the model provider remains unavailable after retries, returns malformed output or fails numeric grounding validation.

## Roblox sync recovery

- Automated and user-triggered syncs persist controlled health state per entitled connection.
- A failed sync records `ERROR` and a bounded error description rather than silently reporting success.
- A subsequent successful sync returns the connection to `HEALTHY`, clears the previous error and records the new success timestamp.
- Invalid/revoked credentials fail without pointless retries; transient rate limits and provider failures use bounded retry.
- Metric persistence remains idempotent so a repeated sync does not duplicate existing observations.

## Transactional email recovery and history

- Resend 429/5xx, network and timeout failures use the same bounded retry policy.
- Permanent 4xx delivery errors are not retried automatically.
- Notification attempts persist `SENT`, `FAILED` or `SKIPPED` status, provider message ID when supplied, bounded error text and sent timestamp when successful.
- Notification event keys are idempotent so lifecycle jobs do not resend the same logical event on repeated runs.
- Built-in email copy remains the fallback when an operator template override is inactive.

## Authentication failure behavior

- Expired or redeemed invites are rejected.
- Expired or redeemed passwordless login links are rejected.
- Expired or revoked sessions are rejected.
- Disabled users or studios are denied even if an older session token still exists.
- Session, invite and login-link tokens are stored as hashes where applicable.

## Billing recovery

- `past_due` access is bounded by the configured grace period and repeated `past_due` events do not extend the original deadline.
- Recovery to an active subscription clears the grace restriction immediately.
- Terminal subscriptions do not override a newer canonical subscription.
- Duplicate checkout/subscription creation and stale webhook replacement paths are guarded by regression tests.
- Founding-pilot fallback remains separate from paid-subscription state.

## Health and readiness

`GET /health` is the liveness check. It confirms that the API process can serve requests and does not claim dependency readiness.

`GET /ready` is the readiness check. It verifies database connectivity and reports provider/configuration state. A database failure returns HTTP 503 with `status=not_ready`; missing optional provider configuration is reported explicitly rather than making the API process falsely unhealthy.

In the production model Roblox credentials are tenant-scoped, so the global `roblox_configured` flag can be false while tenant connections are correctly configured.

## Request observability

Every API response includes:

- `X-Request-ID`
- `X-Response-Time-Ms`

An incoming `X-Request-ID` is preserved. Otherwise the API generates one. Structured request logs include request ID, method, path, status code and duration only; request bodies and credentials are not logged.

## Recovery principles

- Prefer bounded retries over unbounded provider loops.
- Fail closed before credential use when entitlement or tenant scope is invalid.
- Preserve deterministic product behavior when AI prose is unavailable or ungrounded.
- Surface provider failures in operational state/history instead of silently discarding them.
- Keep database connections on pre-ping to avoid reusing dead pooled connections.
- PostgreSQL connection attempts have a five-second timeout so readiness checks and requests fail boundedly when the database is unavailable.
- PostgreSQL backup/restore and service restart procedures remain production operations and must be executed with the documented safety boundaries.
