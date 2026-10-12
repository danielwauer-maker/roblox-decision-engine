# R11 Go-Live Gate

Date: 2026-10-12
Status: DONE

## Release objective

Move Roblox Decision Engine from an internally validated early-access product to a production-ready public validation release without pretending that commercial general availability has already been proven.

## Public release baseline

- Canonical production URL: https://roblox-decision-engine.vercel.app
- Production branch: `main`
- Frontend root: `apps/web`
- Frontend: Next.js 16.3.8 + React 19.2.1
- API: FastAPI with `/health` and `/ready`
- Public demo uses simulated data
- Real Roblox analytics require explicit authorized read-only access

## R11 exit gates

- [x] Public landing, pricing, demo, pilot workspace and portfolio routes exist
- [x] Privacy baseline is included in the production build
- [x] Early-access terms are included in the production build
- [x] Global metadata, robots.txt and sitemap.xml are configured
- [x] Server-side secret boundary remains in place
- [x] Roblox live smoke validated after reliability hardening
- [x] OpenAI live smoke validated after reliability hardening
- [x] Deterministic fallback remains available when the model path is unavailable or rejected by guardrails
- [x] CI requires backend tests, Ruff, frontend security audit and production build
- [x] Frontend dependency audit reports 0 vulnerabilities
- [x] Secure Next.js 16 production deployment is READY
- [x] Production build route manifest contains every launch route

## Production evidence

The secure frontend baseline was deployed successfully to production after the dependency upgrade. A later READY production deployment also includes the committed Next.js 16 TypeScript configuration. The subsequent CI-only commit added the mandatory `npm audit --audit-level=high` gate; its GitHub CI passed, while its automatic Vercel trigger returned `git_info_fail`. That Vercel event does not change the application artifact because the commit only modifies the CI workflow.

Direct browser-style fetching of the canonical domain could not be performed by the connected Vercel inspection tool because its current team/project access scope returned HTTP 403. Therefore R11 evidence deliberately does **not** claim an independent browser fetch. Instead, the gate is based on a READY production deployment plus the successful Next production-build route manifest.

## Launch route manifest

The successful production build generated these routes:

1. `/`
2. `/pricing`
3. `/demo`
4. `/demo/connect`
5. `/demo/priorities`
6. `/demo/investigation`
7. `/demo/experiment`
8. `/demo/report`
9. `/demo/analyst`
10. `/demo/pilot`
11. `/portfolio`
12. `/privacy`
13. `/terms`
14. `/robots.txt`
15. `/sitemap.xml`

## Rollback procedure

1. Do not modify secrets during an incident unless the incident involves credential exposure.
2. Identify the last known-good READY production deployment in Vercel.
3. Promote or rollback to that deployment.
4. Confirm `/`, `/portfolio`, `/privacy`, `/terms` and the validation demo load.
5. For API incidents, confirm `/health`; use `/ready` to distinguish process health from dependency readiness.
6. Record the failing commit, provider state and request IDs before making the corrective change.
7. Ship the fix through `main`, require green CI, then promote the new READY production build.

## Commercial boundary

This release is an early-access validation release, not a claim of full commercial general availability. Pricing remains a hypothesis; the guided pilot is free and no payment is collected through the current site. Formal commercial legal terms and studio-specific contractual requirements remain a future general-availability gate.
