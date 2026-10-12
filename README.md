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

**Portfolio delivery remains complete.** R13 is the post-portfolio production expansion required to run 5–10 real studio pilots safely in parallel.

Production validation site: https://roblox-decision-engine.vercel.app

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
- the pilot database is provisioned separately from the public validation frontend

R13 is not considered complete until the production FastAPI service is connected to the pilot database, the frontend `API_BASE_URL` points to it, and two independent organizations pass a production isolation smoke test.

## Quick start

Requirements: Docker + Docker Compose.

```bash
make dev
```

This starts the complete local baseline:

- Web: http://localhost:3000
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
3. Invite-only pilot login
4. Private studio workspace
5. Tenant Roblox connection and sync
6. Today's Priorities
7. Investigation / Evidence
8. AI Product Analyst
9. Experiment Copilot
10. Weekly Growth Brief
11. Pilot feedback
12. Pricing / commercial validation
13. Portfolio case study
14. Privacy / early-access terms

## Architecture

Roblox Analytics / Open Cloud → Query Adapter → Metric Normalization → PostgreSQL History → Deterministic Decision Engine → Evidence Bundle → AI Product Analyst → Priorities / Experiments / Weekly Brief.

## Verified evidence

- R10 reliability gate: 39 backend tests passed
- R13 tenant gate: 42 backend tests passed
- Ruff checks passing
- cross-tenant isolation tests passing
- live Roblox provider smoke passing
- live OpenAI model smoke passing
- deterministic AI fallback and grounded repair path validated
- Next.js 16.3.8 + React 19.2.1 frontend baseline
- frontend dependency audit reports 0 vulnerabilities
- `npm audit --audit-level=high` enforced in CI
- production frontend build passing

## Reliability and security baseline

- bounded external-request timeouts and retries
- retry only for transient provider/network failures
- `/health` liveness and `/ready` dependency readiness
- request IDs and latency logging
- deterministic AI fallback
- one guarded repair attempt for model prose that violates grounding constraints
- server-side secret boundaries and least-privilege analytics access
- security headers, CORS baseline, write-rate limiting and documented retention/deletion behavior

## Repository layout

- `apps/web` — Next.js / TypeScript frontend
- `apps/api` — FastAPI backend
- `docs` — product, architecture, sprint, security, reliability, release and portfolio evidence
- `.github/workflows` — CI and provider smoke workflows

## Core product rule

The LLM never owns authoritative metric calculation. Unsupported causes or numbers must not be invented. Recommendations are generated only from structured evidence; insufficient or invalid model output is rejected or falls back safely.

## Portfolio boundary

R0–R12 remain the completed portfolio case study. R13 is the operational expansion for real founding-studio pilots and must not be presented as production-complete until its infrastructure exit gates pass.

R11 release evidence is documented in `docs/R11_GO_LIVE.md`. Final case-study evidence and limitations are documented in `docs/R12_PORTFOLIO_CLOSURE.md`.
