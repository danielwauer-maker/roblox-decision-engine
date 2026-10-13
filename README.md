# Roblox Decision Engine

AI Product & Growth Analyst for Roblox studios.

**Product thesis:** Roblox already explains what happened. Roblox Decision Engine helps a studio decide what to do next.

The SaaS sits above Roblox analytics, validates KPI changes deterministically, compares segments and baselines, creates an evidence bundle, and only then asks an AI layer to explain the finding and propose the next experiment.

## Delivery status

- R0 Product foundation — DONE
- R1 Validation experience — DONE
- R2 SaaS foundation — DONE
- R3 Roblox data connection — DONE
- R4 Decision Engine v1 — DONE
- R5 AI Product Analyst — DONE
- R6 Experiment Copilot — DONE
- R7 Pilot readiness — DONE
- R8 Commercial readiness — DONE
- R9 Security & privacy — DONE
- R10 Reliability — DONE
- R11 Go-Live — DONE
- R12 Portfolio closure — DONE
- R13 Multi-tenant pilot SaaS — IN PROGRESS
- R14 Operator / Admin Console — CODE COMPLETE, PRODUCTION VALIDATION PENDING
- R16 Real Pilot Go-Live — CODE COMPLETE, HETZNER DEPLOYMENT + EXTERNAL CONFIGURATION + ACCEPTANCE PENDING

**Portfolio delivery remains complete.** R13–R16 are post-portfolio production expansions required to run and support real studio pilots safely in parallel.

## Production target

PlayDirective production is self-hosted on the existing Hetzner server in Germany.

Production runtime:

- Next.js web container
- FastAPI API container
- PostgreSQL 16 container with persistent Hetzner volume storage
- existing Hetzner DNS / reverse proxy / TLS for `https://playdirective.com`
- Roblox Open Cloud, OpenAI, Resend and Stripe used only as external specialist services

Vercel, Neon and Render are not part of the PlayDirective production runtime. Previous Vercel/Neon resources are legacy validation infrastructure only and may be removed after the Hetzner real-life acceptance run passes.

See `docs/R16_EXTERNAL_SETUP.md` for the production deployment and provider setup.

## R13 multi-tenant pilot architecture

R13 adds an invite-only tenant boundary for real studio pilots:

Organization → User / Session → Roblox Connection → Tenant Observations → Decisions → AI Analyst → Experiment → Weekly Brief → Feedback.

Key controls:

- organizations are explicit tenants
- invite tokens and session tokens are stored only as hashes
- the browser session uses an HttpOnly cookie through the Next.js server proxy
- Roblox Open Cloud API keys are encrypted at rest and never returned by the API
- observations and downstream decision snapshots are scoped by `organization_id`
- Analyst, Experiment Copilot, Weekly Brief and pilot feedback use the same tenant boundary
- OWNER and MEMBER roles are separated; only OWNER can configure the Roblox connection
- cross-tenant isolation tests cover same-Universe-ID scenarios

R13 is not considered complete until the Hetzner production stack is live and two independent organizations pass a production isolation smoke test.

## R14 operator console

The private `/admin` surface is the operating console for founding-studio pilots. It provides:

- studio/customer overview and operational state
- owner invitation creation with single-use invite links
- user/session and invite counts
- connected Roblox experience visibility without exposing API keys
- analytics volume and latest data freshness timestamps
- current Top-3 Decision Engine priorities per studio
- recent pilot feedback
- studio disable/reactivate control
- immediate session revocation

Admin credentials are verified server-side. The backend `PILOT_ADMIN_TOKEN` is used only by the Next.js server proxy and is never sent to browser JavaScript. See `docs/R14_OPERATOR_CONSOLE.md`.

## Quick start

Requirements: Docker + Docker Compose.

```bash
make dev
```

This starts the complete local baseline:

- Web: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:8000
- API liveness: http://localhost:8000/health
- API readiness: http://localhost:8000/ready
- PostgreSQL: localhost:5432

Stop with:

```bash
make down
```

## Roblox Analytics connection

The adapter uses Roblox Open Cloud Analytics Query API with Universe-scoped least-privilege access. Configure local or server-side environment values only; never commit real credentials.

Legacy single-environment validation supports server-side `ROBLOX_UNIVERSE_ID` and `ROBLOX_API_KEY`. R13 pilot tenants instead store one encrypted Roblox connection per organization through the authenticated workspace.

## Product surfaces

1. Landing / Early Access
2. Public validation demo
3. Founding Studio application
4. Invite / passwordless login
5. Private studio workspace
6. Tenant Roblox connection and sync
7. Today's Priorities
8. Investigation / Evidence
9. AI Product Analyst
10. Experiment Copilot
11. Weekly Growth Brief
12. Pilot progress and feedback
13. Private operator/admin console
14. Billing / Stripe Customer Portal
15. Privacy / early-access terms
16. Portfolio case study

## Architecture

Roblox Analytics / Open Cloud → Query Adapter → Metric Normalization → PostgreSQL History → Deterministic Decision Engine → Evidence Bundle → AI Product Analyst → Priorities / Experiments / Weekly Brief.

Operator path: Admin browser → signed HttpOnly admin session → Next.js server proxy → FastAPI admin API → tenant-scoped PostgreSQL data.

Production path: Internet → Hetzner reverse proxy/TLS → Next.js (`127.0.0.1:8090`) → FastAPI (`api:8000` internally) → PostgreSQL (`postgres:5432` internally).

## Verified evidence

- R10 reliability gate: 39 backend tests passed
- R13 tenant gate: 42 backend tests passed
- R14 operator tests extend the suite to 44 backend tests
- R16 functional gate: 53 backend tests passed
- Ruff checks enforced in CI
- cross-tenant isolation tests passing
- admin tests verify credentials are not exposed and studio disable/session revoke controls work
- live Roblox provider smoke passing
- live OpenAI model smoke passing
- deterministic AI fallback and grounded repair path validated
- Next.js 16.3.8 + React 19.2.1 frontend baseline
- frontend dependency audit enforced in CI
- production frontend build enforced in CI

## Reliability and security baseline

- bounded external-request timeouts and retries
- retry only for transient provider/network failures
- `/health` liveness and `/ready` dependency readiness
- request IDs and latency logging
- deterministic AI fallback
- one guarded repair attempt for model prose that violates grounding constraints
- server-side secret boundaries and least-privilege analytics access
- security headers, CORS baseline, write-rate limiting and documented retention/deletion behavior
- tenant disable switch and session revocation for pilot support incidents
- PostgreSQL not exposed publicly in production
- API and web containers loopback-bound behind the Hetzner reverse proxy

## Repository layout

- `apps/web` — Next.js / TypeScript frontend, pilot workspace and operator console
- `apps/api` — FastAPI backend and tenant/admin authorization
- `deploy/hetzner` — production environment bootstrap/upgrade tooling
- `docs` — product, architecture, sprint, security, reliability, release and portfolio evidence
- `.github/workflows` — CI and provider smoke workflows

## Core product rule

The LLM never owns authoritative metric calculation. Unsupported causes or numbers must not be invented. Recommendations are generated only from structured evidence; insufficient or invalid model output is rejected or falls back safely.

## Portfolio boundary

R0–R12 remain the completed portfolio case study. R13–R16 are operational expansions for real founding-studio pilots and must not be presented as production-complete until the Hetzner infrastructure and real-life acceptance gates pass.

R11 release evidence is documented in `docs/R11_GO_LIVE.md`. Final case-study evidence and limitations are documented in `docs/R12_PORTFOLIO_CLOSURE.md`. Operator-console controls are documented in `docs/R14_OPERATOR_CONSOLE.md`.
