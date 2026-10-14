# Sprint 8 — Final Go-Live Acceptance & Operations

Status: IN PROGRESS

Opened: 14 October 2026

Goal: move PlayDirective from the current production-hardened baseline to a realistic ~99% go-live readiness through final acceptance, provider activation, failure/recovery verification and a formal production gate. This sprint must not add unrelated product scope.

## Order of execution

1. Phase A — Admin QA
2. Phase B — Real customer journey
3. Phase C — Stripe test-mode activation
4. Phase D — Failure & recovery
5. Phase E — Final production gate
6. Landing-page visual polish only after A–E pass

## Phase A — Admin QA

Acceptance target:
- desktop admin accepted
- mobile admin accepted
- every sidebar route opens without visible layout/workflow blocker
- Applications, Studios & customers, Pilot operations, Billing, Workspace access, Data & simulation and Build Log complete their intended operator task
- Email Template Editor is real-runtime accepted: save override, automatic notification uses override, inactive override falls back to built-in copy, manual send succeeds, Delivery History records provider ID/status

Customer-support scope for go-live:

MUST HAVE:
- reliable studio/customer lookup through existing pages
- plan/subscription and pilot status visibility
- experience/sync status visibility
- invite/access controls
- session revoke and studio disable/reactivate
- feedback visibility
- email delivery history and provider errors

POST-GO-LIVE CUSTOMER-360:
- consolidated single-studio view combining contacts, current priorities, Weekly Brief, support notes, audit history and the existing operational datasets

No separate Customer-360 feature is required to close Sprint 8 unless Phase A exposes a real operator blocker.

## Phase B — Real customer journey

Run the real production journey from public application through approval, invite, OWNER enrollment, Roblox connection, first sync, Decision Queue, Evidence, AI Analyst, Experiment Copilot, Weekly Brief, pilot progress, feedback and passwordless return login.

Phase 2A and Phase 2B may only move from `CODE COMPLETE / ACCEPTANCE PENDING` to accepted after this production run succeeds with real tenant-scoped data.

## Phase C — Stripe activation

Stripe remains TEST MODE for Sprint 8 acceptance.

Required plans:
- Indie — $19/month — 1 experience
- Growth — $49/month — up to 3 experiences
- Studio — $99/month — up to 10 experiences

Acceptance must cover Checkout, verified webhooks, Customer Portal, upgrades, downgrade entitlement behavior, cancel-at-period-end, `past_due` grace, recovery, terminal cancellation, new subscription after terminal state, duplicate checkout/subscription protection and stale webhook protection.

Production secrets are configured only in Hetzner `.env.production` and are never recorded in repository evidence.

## Phase D — Failure & recovery

Verify Roblox credential/provider failures and recovery, email delivery/fallback visibility, auth token/session failures, billing failure states, health/readiness/restart behavior, and AI deterministic fallback/grounding behavior.

Any destructive database action or risky PostgreSQL restart requires explicit operator confirmation before execution.

## Phase E — Final production gate

Required evidence:
- `main` current and intended CI checks green or explicitly documented non-production exception
- expected Hetzner working tree only
- web/API/PostgreSQL healthy
- `/health` ok and `/ready` ready
- Roblox, OpenAI/fallback, Resend/Zoho and Stripe configured/accepted as applicable
- cron jobs present and working
- backup current; restore procedure already proven/documented
- acceptance data cleaned up
- security and legal gates reviewed
- admin and full customer journey accepted
- roadmap, Build Log and real-life acceptance evidence updated

Final result must remain unset until the production gate completes.

Target result after all phases pass:

`FINAL_GO_LIVE_ACCEPTANCE=PASS`

## Sprint discipline

- Do not mark this sprint DONE from code or documentation alone.
- CI must pass for code changes.
- Production acceptance evidence is required.
- If a true blocker requires implementation, fix it inside Sprint 8 when reasonably bounded; create Sprint 9 only for a genuine separate go-live blocker.
