# Sprint 8 — Final Go-Live Acceptance & Operations

Status: IN PROGRESS

Opened: 14 October 2026

Goal: move PlayDirective from the current production-hardened baseline to a realistic ~99% go-live readiness through final acceptance, provider activation, failure/recovery verification and a formal production gate. This sprint must not add unrelated product scope.

## Execution strategy

The original A → E order may be reordered when doing so reduces operator/manual work without weakening acceptance. Repository/code/static/CI work is completed first; only evidence that inherently requires a real browser, real provider account, live tenant or production host is left for operator execution.

Current phase state:

- Phase A — Admin QA: `RUNTIME ACCEPTANCE PENDING`
- Phase B — Real customer journey: `RUNTIME ACCEPTANCE PENDING`
- Phase C — Stripe: `CODE/HARDENING VERIFIED; TEST-MODE PROVIDER ACCEPTANCE PENDING`
- Phase D — Failure & Recovery: `AUTOMATED HARDENING COMPLETE; PRODUCTION DEPLOY/SMOKE PENDING`
- Phase E — Final production gate: `TECHNICAL AUDIT IN PROGRESS; FINAL SIGN-OFF PENDING`
- Final result: `FINAL_GO_LIVE_ACCEPTANCE=PENDING`

## Phase A — Admin QA

Acceptance target:
- desktop admin accepted
- mobile admin accepted
- every sidebar route opens without visible layout/workflow blocker
- Applications, Studios & customers, Pilot operations, Billing, Workspace access, Data & simulation and Build Log complete their intended operator task
- Email Template Editor is real-runtime accepted: save override, automatic notification uses override, inactive override falls back to built-in copy, manual send succeeds, Delivery History records provider ID/status

Automated/static evidence already available:
- every intended admin route exists in the production web application
- frontend production build is part of mandatory CI
- backend tests cover operator/application/billing/email-template functionality
- email notification persistence explicitly covers sent/failed status, provider message ID/error and event-key idempotency

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

The implementation, tenant-isolation controls and automated regression suite are already code-complete; this phase intentionally remains a real production/customer-path test rather than being closed from unit tests.

## Phase C — Stripe activation

Stripe remains TEST MODE for Sprint 8 acceptance.

Required plans:
- Indie — $19/month — 1 experience
- Growth — $49/month — up to 3 experiences
- Studio — $99/month — up to 10 experiences

Automated code/hardening verification covers:
- duplicate active-subscription checkout blocking
- fresh pending-checkout blocking
- stale pending-checkout retry with deterministic idempotency key
- Price ID as authoritative plan source after Customer Portal changes
- foreign/stale subscription protection for the canonical managed subscription
- new subscription after terminal/canceled state
- exact seven-day `past_due` grace
- repeated `past_due` without grace extension
- immediate access recovery on `active`
- founding-pilot fallback separation
- experience entitlement enforcement after upgrade/downgrade

Remaining provider acceptance must cover real Stripe Test Mode Checkout, signed webhook delivery, Customer Portal and the corresponding end-to-end states on production.

Production secrets are configured only in Hetzner `.env.production` and are never recorded in repository evidence.

## Phase D — Failure & recovery

Automated hardening now covers:

Roblox:
- invalid/revoked credential fails without pointless retry
- 429/5xx/network/timeout paths use bounded retry
- failed sync persists controlled `ERROR` health/error state
- subsequent successful sync returns the connection to `HEALTHY`, clears the error and records success
- tenant/plan entitlement is checked before credential use

Email:
- Resend 429/5xx/network/timeout paths use bounded retry
- permanent invalid-recipient/client failures do not retry
- failed delivery persists visible status/error
- successful delivery persists provider message ID and sent timestamp
- event keys remain idempotent
- inactive template uses built-in fallback copy

Auth/tenant:
- expired/redeemed invite rejection
- expired/redeemed passwordless-link rejection
- expired/revoked session rejection
- disabled studio denial
- existing tenant-isolation/authorization regression coverage remains in force

Billing:
- no-subscription/pilot fallback, `past_due`, grace expiry/recovery, cancellation and canonical-subscription protections are covered by the existing hardening suite

AI:
- provider outage after bounded retries falls back deterministically
- malformed output falls back deterministically
- unsupported numeric/grounding output cannot become authoritative

Service/runtime:
- `/health` is liveness and `/ready` is dependency readiness
- production API/web were already safely rebuilt/restarted during Sprint 8 opening and returned healthy/ready before this hardening branch
- PostgreSQL restart remains optional/risk-based and is not performed merely to manufacture failure evidence; backup/restore evidence is handled separately

Phase D is not marked fully accepted until this hardening commit is deployed to production and the normal production health/readiness smoke passes.

## Phase E — Final production gate

Automated/technical audit completed or prepared:
- production scripts are tracked executable in Git; Hetzner no longer requires four local mode-only modifications
- `.env*` remains ignored from Git except the example file
- production web/API ports are loopback-bound and PostgreSQL has no public host port
- Next.js security headers include HSTS, anti-framing, anti-sniffing, referrer and permissions restrictions
- security/privacy documentation now matches tenant-scoped auth/credentials and current controls
- reliability documentation now includes Roblox, AI, email, auth and billing recovery behavior
- canonical hosting documentation now identifies Hetzner/playdirective.com, not historical Vercel, as production
- a scheduled independent GitHub Actions public uptime check has been added so local cron is not the only availability signal
- CI now preserves Ruff diagnostics even when tests fail, while retaining the Ruff quality gate
- pricing/Terms/Privacy code contains the current founding-pilot and $19/$49/$99 product model
- Vercel status failures are classified as non-production integration status unless Vercel is deliberately restored to the production architecture

Production/manual evidence still required before final sign-off:
- deploy the final merged Sprint 8 hardening commit to Hetzner and confirm clean working tree/containers/health/readiness
- resolve or explicitly accept any host-health blocker discovered at sign-off (including the unusually high zombie-process count observed on 14 October)
- verify real legal-notice operator values are configured/displayed
- complete Phase A visual/email-template runtime acceptance
- complete Phase B real customer journey and second-tenant production isolation smoke
- configure and complete Phase C Stripe Test Mode provider acceptance
- clean temporary acceptance subscriptions/connections/data
- confirm current backup/cron evidence and that no acceptance artifact contains secrets

Final result must remain unset until those production gates complete.

Target result after all phases pass:

`FINAL_GO_LIVE_ACCEPTANCE=PASS`

## Sprint discipline

- Do not mark this sprint DONE from code or documentation alone.
- CI must pass for code changes.
- Production acceptance evidence is required.
- If a true blocker requires implementation, fix it inside Sprint 8 when reasonably bounded; create Sprint 9 only for a genuine separate go-live blocker.
