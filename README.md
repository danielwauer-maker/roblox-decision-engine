# Roblox Decision Engine

AI Product & Growth Analyst for Roblox studios.

**Product thesis:** Roblox already explains what happened. Roblox Decision Engine helps a studio decide what to do next.

The SaaS sits above Roblox analytics, validates KPI changes deterministically, compares segments and baselines, creates an evidence bundle, and only then asks an AI layer to explain the finding and propose the next experiment.

## Current delivery status

- R0 Product foundation — DONE
- R1 Validation experience — IN PROGRESS / product flow implemented in portfolio validation shell
- R2 SaaS foundation — DONE
- R3 Roblox data connection — IN PROGRESS / adapter + contracts + tests implemented; first live query requires a Universe ID and read-only API key
- R4 Decision Engine v1 — PLANNED
- R5 AI Product Analyst — PLANNED
- R6 Experiment Copilot — PLANNED
- R7 Pilot readiness — PLANNED
- R8 Commercial readiness — PLANNED
- R9 Security & privacy — PLANNED
- R10 Reliability — PLANNED
- R11 Go-Live — PLANNED
- R12 Portfolio closure — PLANNED

## Quick start

Requirements: Docker + Docker Compose.

```bash
make dev
```

This starts the complete local baseline:

- Web: http://localhost:3000
- API: http://localhost:8000
- API health: http://localhost:8000/health
- PostgreSQL: localhost:5432

Stop with:

```bash
make down
```

## Roblox Analytics connection

The current adapter uses Roblox Open Cloud Analytics Query API with a Universe-scoped API key. Configure only these local environment values; never commit the real key:

```text
ROBLOX_UNIVERSE_ID=<your universe id>
ROBLOX_API_KEY=<read-only key with universe.analytics:read>
```

## V1 surfaces

1. Landing / Early Access
2. Connect Roblox
3. Today's Priorities
4. Investigation / Evidence
5. Experiment Copilot
6. Weekly Growth Brief
7. Minimal Product Health

## Architecture

Roblox Analytics / Open Cloud → Query Adapter → Metric Normalization → PostgreSQL History → Deterministic Decision Engine → Evidence Bundle → AI Product Analyst → Priorities / Experiments / Weekly Brief.

## Repository layout

- `apps/web` — Next.js / TypeScript frontend
- `apps/api` — FastAPI backend
- `docs` — product, architecture, sprint and decision documentation
- `.github/workflows` — CI

## Core product rule

The LLM never owns authoritative metric calculation. Unsupported causes or numbers must not be invented. Recommendations are generated only from structured evidence; insufficient evidence produces an abstention.

## Portfolio

The project is tracked from day zero in `danielwauer-maker/enterprise-data-ai-portfolio`, including sprint/readiness status and validation evidence.
