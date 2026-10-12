# R14 — Operator / Admin Console

## Purpose

R14 adds a private operator surface for running the Founding Studio Pilot with 5–10 studios without exposing platform secrets to the browser.

The public product and studio workspaces remain separate from the operator console.

## Routes

- `/admin/login` — private operator login
- `/admin` — operator dashboard
- `/api/admin/*` — same-origin Next.js server proxy for operator actions
- `/v1/admin/*` — FastAPI operator endpoints protected by `X-Admin-Token`

`/admin`, `/app`, and `/api` are excluded from search-engine crawling through `robots.txt`.

## Admin authentication

The browser never receives `PILOT_ADMIN_TOKEN`.

The operator enters `ADMIN_DASHBOARD_USERNAME` and `ADMIN_DASHBOARD_PASSWORD`. Next.js validates these server-side and issues a signed HttpOnly, Secure, SameSite=Strict cookie with a 12-hour lifetime. The Next.js server uses `PILOT_ADMIN_TOKEN` only when proxying authorized operator requests to FastAPI.

Production environment values:

- `ADMIN_DASHBOARD_USERNAME`
- `ADMIN_DASHBOARD_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `PILOT_ADMIN_TOKEN`
- `API_BASE_URL`

Generate long random production values directly on the Hetzner server. Never commit or paste real values into source files.

## Dashboard information

### Portfolio / customer overview

- total studios
- active studios
- disabled studios
- total users
- active user sessions
- Roblox connections
- tenant-scoped analytics observation count
- pending invitations
- pilot feedback count

### Studio operations

For each organization:

- studio name and slug
- operational state
- creation date
- active users and sessions
- pending/redeemed/expired invite counts
- connected Roblox experience and Universe ID
- latest analytics observation and ingestion timestamps
- number of stored observations
- current Top-3 Decision Engine priorities
- pilot feedback count

Roblox API keys are never returned or shown.

### Data-flow visibility

The console shows which metric names have been received, how many tenant observations are stored and when each metric was last observed.

It intentionally does not display encrypted credentials or raw secret material.

### Customer feedback

The latest tenant-scoped pilot feedback is visible with studio, category, usefulness score and timestamp.

## Operator actions

- create a new studio tenant
- issue a single-use OWNER invite
- copy the generated founding-studio invite link
- disable a studio immediately
- reactivate a studio
- revoke all active sessions for a studio
- refresh the operational dashboard

Disabling an organization blocks tenant authentication at the server-side authorization boundary.

## Invite flow

1. Operator creates studio + owner invitation in `/admin`.
2. The server returns the raw invite token only once.
3. The dashboard renders a one-time invitation URL.
4. The studio owner opens `/app/login?token=...`.
5. The login page pre-fills the token.
6. FastAPI exchanges it for a hashed server-side session record.
7. Next.js stores the raw session only in an HttpOnly cookie.

## R14 exit gate

R14 code is complete when:

- admin API is protected by the server-only admin token
- operator login is server-side and cookie protected
- secrets are absent from dashboard responses
- studio onboarding and invite creation work
- organization disable/reactivate works
- session revoke works
- studio analytics freshness and current decisions are visible
- admin and tenant routes are excluded from robots
- backend tests, Ruff, frontend dependency audit and production build are green

R14 production is not considered fully closed until the Hetzner deployment is live and the operator console has passed a real two-tenant smoke test.
