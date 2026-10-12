# R11 Go-Live Gate

Date: 2026-10-12

## Release objective

Move Roblox Decision Engine from an internally validated early-access product to a production-ready public validation release without pretending that commercial general availability has already been proven.

## Public release baseline

- Canonical production URL: https://roblox-decision-engine.vercel.app
- Production branch: `main`
- Frontend root: `apps/web`
- Framework: Next.js
- API: FastAPI with `/health` and `/ready`
- Public demo uses simulated data
- Real Roblox analytics require explicit authorized read-only access

## R11 exit gates

- [x] Public landing, pricing, demo, pilot workspace and portfolio routes exist
- [x] Privacy baseline is publicly accessible
- [x] Early-access terms are publicly accessible
- [x] Global metadata, robots.txt and sitemap.xml are configured
- [x] Server-side secret boundary remains in place
- [x] Roblox live smoke validated after reliability hardening
- [x] OpenAI live smoke validated after reliability hardening
- [x] Deterministic fallback remains available when the model path is unavailable or rejected by guardrails
- [x] CI requires backend tests, Ruff and frontend production build
- [ ] Final production deployment for this R11 release is READY
- [ ] Canonical production routes verified after deployment

## Launch smoke path

Verify these URLs after the release deploy:

1. `/`
2. `/pricing`
3. `/demo`
4. `/demo/priorities`
5. `/demo/investigation`
6. `/demo/experiment`
7. `/demo/report`
8. `/demo/analyst`
9. `/demo/pilot`
10. `/portfolio`
11. `/privacy`
12. `/terms`
13. `/robots.txt`
14. `/sitemap.xml`

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
