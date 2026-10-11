# R3 — Live Roblox Analytics Setup

Status: **implementation complete; live credential validation pending**

## Required Roblox access

The pilot uses the Roblox Analytics Query API with an API key restricted to one experience and the read-only scope:

- `universe.analytics:read`

Never commit the API key. Keep it only in local/server environment variables or a secret manager.

## Environment variables

```env
ROBLOX_UNIVERSE_ID=<your universe id>
ROBLOX_API_KEY=<read-only API key>
ROBLOX_ANALYTICS_BASE_URL=https://apis.roblox.com/analytics-query-api
```

## R3 API endpoints

- `GET /v1/roblox/connection` — reports `demo` or `live` mode without returning the key.
- `POST /v1/roblox/sync?days=30` — syncs the default metric pack.
- `POST /v1/roblox/sync?metric=DailyActiveUsers&days=30` — syncs one metric.
- `GET /v1/roblox/observations` — reads persisted normalized observations.

## Default metric pack

The initial live-data pack uses the official case-sensitive metric identifiers:

- `DailyActiveUsers`
- `DailyRevenue`
- `ForwardD1Retention`
- `ForwardD7Retention`

## Data flow

Roblox Analytics Query API
→ async operation polling when needed
→ Pydantic response validation
→ normalized `MetricObservation`
→ idempotent PostgreSQL persistence
→ Decision Engine evidence layer (R4)

## R3 exit gate

R3 is DONE only when all of the following are true:

1. CI is green.
2. A real Roblox experience is configured with a least-privilege analytics key.
3. `GET /v1/roblox/connection` returns `live`.
4. At least one real `DailyActiveUsers` query succeeds.
5. Re-running the same sync does not duplicate observations.
6. No Roblox credential is stored in GitHub source files.
