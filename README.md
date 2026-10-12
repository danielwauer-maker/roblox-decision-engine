# Roblox Decision Engine

AI Product & Growth Analyst for Roblox studios.

**Product thesis:** Roblox already explains what happened. Roblox Decision Engine helps a studio decide what to do next.

The SaaS sits above Roblox analytics, validates KPI changes deterministically, compares segments and baselines, creates an evidence bundle, and only then asks an AI layer to explain the finding and propose the next experiment.

## Current delivery status

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
- R11 Go-Live — IN PROGRESS
- R12 Portfolio closure — PLANNED

Production validation site: https://roblox-decision-engine.vercel.app

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

```text
ROBLOX_UNIVERSE_ID=<your universe id>
ROBLOX_API_KEY=<read-only key with universe.analytics:read>
```

## Product surfaces

1. Landing / Early Access
2. Connect Roblox
3. Today's Priorities
4. Investigation / Evidence
5. AI Product Analyst
6. Experiment Copilot
7. Weekly Growth Brief
8. Pilot workspace
9. Pricing / commercial validation
10. Portfolio build log
11. Privacy / early-access terms

## Architecture

Roblox Analytics / Open Cloud → Query Adapter → Metric Normalization → PostgreSQL History → Deterministic Decision Engine → Evidence Bundle → AI Product Analyst → Priorities / Experiments / Weekly Brief.

## Reliability baseline

- bounded external-request timeouts and retries
- retry only for transient provider/network failures
- `/health` liveness and `/ready` dependency readiness
- request IDs and latency logging
- deterministic AI fallback
- one guarded repair attempt for model prose that violates grounding constraints
- live Roblox and OpenAI smoke workflows

## Repository layout

- `apps/web` — Next.js / TypeScript frontend
- `apps/api` — FastAPI backend
- `docs` — product, architecture, sprint, security, reliability and release documentation
- `.github/workflows` — CI and provider smoke workflows

## Core product rule

The LLM never owns authoritative metric calculation. Unsupported causes or numbers must not be invented. Recommendations are generated only from structured evidence; insufficient or invalid model output is rejected or falls back safely.

## Go-Live

The R11 release gate and rollback procedure are documented in `docs/R11_GO_LIVE.md`.

The public release remains an **early-access validation release**. Pricing is still a commercial hypothesis, the guided pilot is free, and no payment is collected through the current site.
