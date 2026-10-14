# PlayDirective Delivery Roadmap

This document is the working source of truth for post-go-live product delivery. Update it whenever a phase materially changes state, scope, or validation status.

## Status legend

- `DONE` — implemented and validated
- `CODE COMPLETE / ACCEPTANCE PENDING` — implementation is complete, but provider configuration and/or real production acceptance is still required
- `IN PROGRESS` — actively being built
- `NEXT` — committed next phase
- `PLANNED` — scoped but not started

## Phase 2A — Private workspace parity

**Status: CODE COMPLETE / ACCEPTANCE PENDING**

Goal: bring the real invited studio workspace to the same decision workflow demonstrated in the public product demo.

Implemented scope:
- authenticated studio overview
- real tenant decision queue
- evidence drill-down for each priority
- AI Product Analyst using tenant observations
- investigation/evidence view with supported hypotheses
- Experiment Copilot using the top supported priority
- Weekly Brief using tenant observations
- live/simulated/empty/degraded state separation
- tenant isolation and no simulated data presented as live customer data

Remaining acceptance:
- execute the complete flow with a real external studio and real Roblox analytics data

## Phase 2B — Pilot progress and onboarding state machine

**Status: CODE COMPLETE / ACCEPTANCE PENDING**

Implemented customer journey:
1. Connect experience
2. Complete first successful sync
3. Review first priority and evidence
4. Review first generated experiment
5. Receive/review first Weekly Brief

Implemented scope:
- customer-facing pilot progress view
- dynamic state derived from real tenant data
- persisted review milestones for priority/evidence, experiment and Weekly Brief
- clear next action for every state
- tenant-scoped feedback prompt inside the workspace
- internal QA criteria kept out of the customer UI

Remaining acceptance:
- confirm state transitions in the real-life acceptance run on Hetzner production

## Phase 3 — Notification and lifecycle system

**Status: DONE**

Provider direction: **Resend** for transactional sending, **Zoho Mail** for human inbound/replies.

Implemented notifications:
- pilot request received — customer confirmation
- pilot request received — operator notification
- approved workspace invite with secure single-use link
- invite redeemed / workspace activated
- passwordless email sign-in link
- sync failed / connection needs attention
- no fresh analytics for the configured stale period
- experiment-ready notification
- Weekly Brief notification with deep link

Implemented controls:
- provider secrets remain server-side
- templates never contain Roblox API credentials
- one-time auth links are the only intended email tokens
- idempotent notification event keys prevent intentional repeat sends for the same event window
- delivery state/provider errors are visible in the operator console
- customers can disable non-essential experiment/Weekly Brief lifecycle email while essential auth/invite/connection-attention email remains transactional

Production activation and acceptance:
- Zoho MX, SPF and DKIM are verified for `playdirective.com`
- Resend sender domain, DKIM and sending CNAME records are verified
- production uses a least-privilege Resend sending key restricted to `playdirective.com`
- production sender is `PlayDirective <support@playdirective.com>`
- `support@playdirective.com` is a Zoho alias for the PlayDirective mailbox and real Gmail replies arrive in Zoho
- `OPERATOR_EMAIL` uses `support@playdirective.com`; `admin@playdirective.com` is retained as the account/login identity but was not used as the inbound operator recipient because it was not accepted as a mailbox recipient during acceptance
- `/ready` reports `transactional_email_configured: true`
- real external delivery to Gmail succeeded with a Resend provider message ID
- real pilot-application customer confirmation and operator notification both arrived
- real workspace invite arrived and redeemed successfully once; a second redemption was rejected
- real passwordless sign-in email arrived and authenticated successfully once; a second use was rejected
- a real lifecycle acceptance email arrived exactly once; a repeated execution returned the same notification record and same provider message ID with exactly one persisted event-key record
- API keys, invite tokens and session tokens were not recorded in repository acceptance evidence

Acceptance result:
- `SPRINT_3_LIFECYCLE_IDEMPOTENCY=PASS`
- outbound Resend delivery and inbound Zoho reply routing are production-verified

## Phase 4 — Subscription and billing

**Status: CODE COMPLETE / STRIPE TEST CONFIGURATION + ACCEPTANCE PENDING**

Provider direction: **Stripe hosted Checkout + Customer Portal + verified webhooks**.

Implemented scope:
- founding pilot stays explicitly free
- plan selection in the private OWNER workspace
- Indie `$19/month` / 1 experience
- Growth `$49/month` / up to 3 experiences
- Studio `$99/month` / up to 10 experiences
- Stripe subscription Checkout Session creation server-side
- Stripe Customer Portal launch for existing customers
- raw card details are never handled by PlayDirective
- signed webhook verification using the original request payload
- subscription create/update/delete state synchronization
- plan entitlement mapping
- cancellation-at-period-end state
- billing/subscription state visible to both studio OWNER and operator console
- plan changes, invoices, payment methods and cancellation delegated to Stripe Customer Portal
- duplicate-checkout protection, checkout idempotency and canonical subscription protection
- explicit 7-day `past_due` grace policy without shortening the 30-day founding pilot
- plan experience limits remain enforced after upgrades/downgrades

Remaining activation:
- create Stripe test-mode Products/Prices and Customer Portal configuration
- configure test secret key, webhook signing secret and Price IDs in Hetzner `.env.production`
- execute Stripe test-mode section H of `docs/REAL_LIFE_ACCEPTANCE_TEST.md`

## R16 — Real Pilot Go-Live

**Status: PRODUCTION DEPLOYED / FINAL REAL-LIFE ACCEPTANCE PENDING**

R16 combines the remaining customer-acquisition and production acceptance work:
- public `/apply` Founding Studio application
- customer/operator application emails
- operator approval flow
- secure single-use invite enrollment
- passwordless email return login
- Phase 2A live workspace
- Phase 2B progress/milestones/feedback
- Phase 3 lifecycle notifications/preferences/operator observability
- Phase 4 Stripe test-mode subscription plumbing and operator visibility
- canonical `playdirective.com` production domain
- Hetzner-only application/database production runtime
- manual acceptance runbook

Current production state:
- Hetzner application/database runtime is live
- automated Roblox sync is live
- transactional email is live and accepted
- pilot expiry, billing hardening, payment grace, experience-limit enforcement and explicit experience selection/management are deployed and runtime-tested
- Stripe remains intentionally unconfigured in production (`stripe_configured: false`) until its acceptance phase

R16 is not `DONE` until sections A–I of `docs/REAL_LIFE_ACCEPTANCE_TEST.md` pass on the intended production release or any remaining exception is explicitly accepted and documented.

## Sprint 1 — Pilot expiry enforcement

**Status: DONE**

Goal: an expired unpaid founding pilot must not retain access to commercial product capabilities.

Implemented scope:
- centralized server-side product-access decision combining pilot lifecycle and subscription state
- Day 29 remains available while the pilot is still before `ends_at`
- Day 30 is blocked as soon as `ends_at` is reached
- Day 31 / `EXPIRED` + unpaid has zero commercial feature entitlement
- protected server-side access to Roblox sync, observations, Decision Queue, AI Analyst, Experiment Copilot and Weekly Brief
- active/trialing paid subscriptions restore product access
- missing legacy lifecycle records are anchored to original organization creation time

Validation:
- GitHub CI passed
- Hetzner production runtime acceptance passed

Acceptance result:
- `SPRINT_1_RUNTIME_ACCEPTANCE=PASS`

## Sprint 2 — Automated Roblox data sync

**Status: DONE**

Goal: active entitled customers receive fresh Roblox analytics automatically without manually triggering sync.

Implemented scope:
- active LIVE entitled connections are discovered and synced automatically
- per-connection sync health is persisted
- one tenant failure does not stop later tenants
- blocked/expired tenants do not call Roblox
- daily Hetzner cron runs at 06:10 server time

Validation:
- GitHub CI #365 passed 69 backend tests, Ruff and frontend build
- real production scheduler run synced a real Roblox universe successfully
- persisted sync state became `HEALTHY`

Acceptance result:
- automated production sync is live and scheduled daily

## Sprint 3 — Transactional email / Resend production activation

**Status: DONE**

Goal: activate PlayDirective transactional email on production and prove the real acquisition/auth/lifecycle mail path.

Production configuration:
- Resend `playdirective.com` verified
- least-privilege sending API key configured server-side
- `EMAIL_FROM=PlayDirective <support@playdirective.com>`
- `OPERATOR_EMAIL=support@playdirective.com`
- Zoho handles replies/inbound mail for `support@playdirective.com`
- `/ready` reports transactional email configured

Real acceptance:
- direct production API send delivered to Gmail
- Gmail reply delivered to Zoho
- customer pilot-application confirmation delivered
- operator application notification delivered
- workspace invite delivered and single-use enforcement passed
- passwordless sign-in delivered and single-use enforcement passed
- lifecycle email delivered
- duplicate lifecycle execution returned the same notification record/provider message ID and persisted exactly one event record

Acceptance result:
- `SPRINT_3_LIFECYCLE_IDEMPOTENCY=PASS`

## Sprint 4 — Billing hardening

**Status: DONE**

Goal: prevent duplicate subscriptions/checkouts and keep Stripe plan state canonical during subscription lifecycle changes.

Implemented scope:
- existing managed Stripe subscription blocks a second checkout
- fresh checkout-pending state blocks duplicate checkout
- abandoned checkout may retry after 30 minutes
- deterministic Stripe idempotency key per checkout window
- actual Stripe Price ID is authoritative for plan synchronization
- stale/foreign subscription webhook cannot replace the managed canonical subscription
- new subscription can start after terminal/canceled state

Validation:
- GitHub CI #369 passed 75 backend tests, Ruff and frontend build
- production deploy passed health/readiness checks
- in-container runtime acceptance proved initial checkout, duplicate blocking, active-subscription blocking and abandoned-checkout retry

Acceptance result:
- `SPRINT_4_RUNTIME_ACCEPTANCE=PASS`

## Sprint 5 — `past_due` payment grace and pilot fallback

**Status: DONE**

Goal: protect paying customers from immediate lockout after a failed payment while preserving the full original 30-day founding pilot.

Implemented scope:
- `past_due` receives a 7-day billing grace period
- repeated `past_due` updates do not restart the grace window
- exact grace expiry blocks paid access
- payment recovery to `active` restores paid access immediately
- if the original 30-day pilot is still running, an expired billing grace falls back to remaining pilot access
- a previously `CONVERTED` pilot can still fall back to its unexpired original pilot window

Validation:
- GitHub CI and regression tests passed
- production runtime tests covered day 6, exact day 7, day 8, payment recovery and active-pilot fallback
- final converted-pilot fallback regression passed on production

Acceptance result:
- `SPRINT_5_RUNTIME_ACCEPTANCE=PASS`
- `SPRINT_5_FINAL_RUNTIME_ACCEPTANCE=PASS`

## Sprint 6 — Experience entitlement enforcement after plan change

**Status: DONE**

Goal: enforce Indie/Growth/Studio experience limits after a downgrade without deleting stored customer configuration.

Implemented scope:
- current plan experience limit is enforced for automated sync and product workflows
- over-limit connections remain stored but are blocked from use/sync
- over-limit credentials are not decrypted and no Roblox request is made
- a later upgrade can restore entitlement without re-entering the saved connection

Validation:
- GitHub CI #380 passed 87 backend tests, Ruff and frontend build
- production Growth → Indie runtime acceptance proved 3 stored connections remain while only 1 is entitled
- over-limit sync was skipped with `experience_limit_exceeded`

Acceptance result:
- `SPRINT_6_RUNTIME_ACCEPTANCE=PASS`

## Sprint 7 — Experience selection & management

**Status: DONE**

Goal: let multi-experience studios explicitly control which saved experience is selected for the decision workflow and which connections remain active inside the current plan entitlement, instead of relying on implicit recency ordering.

Implemented scope:
- explicit OWNER-managed active/inactive experience state using the existing connection record
- customer-facing experience management in the private workspace
- clear active, entitled, over-limit and sync state after plan changes
- saved connections are never automatically deleted during downgrade handling
- Decision Queue, Analyst, Experiments and Weekly Brief are scoped to an explicit selected connection when more than one experience is entitled
- plan downgrade is fail-closed: if active connections exceed the new limit, no connection is implicitly selected or entitled until the OWNER resolves the selection
- automated sync checks entitlement before credential decryption or any Roblox request

Validation:
- GitHub CI #387 passed 88 backend tests, Ruff and frontend build
- production deployed from merge commit `d67985e3d8dfabd3b6c3794108ecef8100b543ae`
- Growth runtime acceptance: limit 3 with 3 active connections produced 3 entitled connections
- Studio runtime acceptance: limit 10 with the same 3 active connections produced 3 entitled connections
- Studio → Indie downgrade with 3 active connections produced 0 entitled connections, proving fail-closed selection instead of implicit ordering
- explicit OWNER resolution left only the real connection active and restored exactly 1 entitled connection under Indie
- an inactive over-limit test connection was skipped by automated sync with `inactive`, before credential use or a Roblox request
- temporary subscription and test connections were removed after acceptance; the original live connection remained active
- final production `/health` returned `ok`, `/ready` returned `ready`, PostgreSQL remained healthy, and API/web containers remained up

Acceptance result:
- `SPRINT_7_RUNTIME_ACCEPTANCE=PASS`

## Public demo / internal QA separation

The public demo explains the product workflow using clearly labelled simulated data. It must never look like a place where a visitor should enter real Roblox credentials.

The production landing page labels the illustrative decision queue as simulated. Real credentials are accepted only after approval inside the private studio workspace.

## Go-live baseline

Current production pilot baseline includes:
- PlayDirective brand and canonical domain
- HTTPS/domain routing to Hetzner production
- Next.js + FastAPI + PostgreSQL colocated on the Hetzner server using Docker Compose
- landing page and public simulated demo
- public founding-pilot application flow
- invite-only first enrollment plus passwordless return login
- production transactional email through Resend with Zoho reply handling
- encrypted Roblox credentials in private workspace
- automated tenant-scoped Roblox sync
- tenant-scoped decisions and decision workflow
- dynamic customer progress and persisted milestones
- operator console with applications, delivery events and billing state
- pilot expiry/payment-grace/plan-limit enforcement
- explicit multi-experience selection and downgrade-safe entitlement management
- privacy / terms / legal notice
- public sitemap and robots configuration for playdirective.com

Commercial validation remains separate from engineering readiness. Paid conversion, willingness to pay, retention lift and recurring revenue must not be presented as validated until supported by real pilot evidence.

Last updated: 14 October 2026
