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

**Status: CODE COMPLETE / PROVIDER CONFIGURATION + ACCEPTANCE PENDING**

Provider direction: **Resend** for transactional email.

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

Remaining activation:
- verify `playdirective.com` as a sender domain in Resend using Hetzner DNS
- configure Resend API key/sender/operator mailbox in the Hetzner `.env.production`
- execute the email sections of `docs/REAL_LIFE_ACCEPTANCE_TEST.md`

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

Remaining activation:
- create test-mode Stripe Products/Prices and Customer Portal configuration
- configure test secret key, webhook signing secret and Price IDs in the Hetzner `.env.production`
- execute Stripe test-mode section H of `docs/REAL_LIFE_ACCEPTANCE_TEST.md`

## R16 — Real Pilot Go-Live

**Status: CODE COMPLETE / HETZNER DEPLOYMENT + EXTERNAL CONFIGURATION + REAL-LIFE ACCEPTANCE PENDING**

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

R16 is not `DONE` until the current main release is running on Hetzner, external provider configuration is active and sections A–I of `docs/REAL_LIFE_ACCEPTANCE_TEST.md` pass on that exact production release.

## Sprint 1 — Pilot expiry enforcement

**Status: DONE**

Goal: an expired unpaid founding pilot must not retain access to commercial product capabilities.

Implemented scope:
- centralized server-side product-access decision combining pilot lifecycle and subscription state
- Day 29 remains available while the pilot is still before `ends_at`
- Day 30 is blocked as soon as `ends_at` is reached; access does not depend on the daily lifecycle cron having run first
- Day 31 / `EXPIRED` + unpaid has zero commercial feature entitlement
- Roblox connection changes, Roblox sync, observations, Decision Queue, AI Analyst, Experiment Copilot and Weekly Brief are protected server-side
- functional decision/analyst/experiment API paths cannot be used as an expired-pilot bypass; public static demo paths remain available
- login, account, pilot status, billing, pricing/plan discovery, Stripe Checkout and Customer Portal remain reachable
- active or trialing paid subscriptions restore product access immediately after Stripe state synchronization
- `past_due` remains temporarily access-bearing until Sprint 5 introduces the explicit grace-period policy
- canceled/non-active paid state does not unlock an expired pilot
- missing legacy `PilotLifecycle` records are anchored to the original organization creation time instead of silently starting a fresh 30-day window
- workspace UI explicitly states `Your founding pilot has ended` and presents a `Choose a plan` CTA

Validation:
- regression coverage for Day 29, Day 30 boundary, Day 31, expired/unpaid, expired/active paid, canceled, `past_due`, missing lifecycle fallback and the central 403 guard
- GitHub CI passed backend tests, Ruff and frontend validation on the merged Sprint 1 release
- Hetzner production deployed at commit `edaabdb79063a9f6991ed7e28fcd062af9239561`
- production Compose validation passed without replacing `.env.production`
- PostgreSQL remained healthy; FastAPI `/health` returned `ok` and `/ready` returned `ready`
- public landing page, pricing, login and workspace routes returned HTTP 200 through nginx/TLS
- production database state was inspected read-only; no existing expired pilot or paid subscription record was available for a non-destructive live tenant test
- the actually deployed access-control module passed a synthetic in-container runtime acceptance for Day 29, exact Day 30 expiry, Day 31/expired unpaid, active paid restoration, canceled blocking and the temporary Sprint 1 `past_due` policy

Acceptance result:
- `SPRINT_1_RUNTIME_ACCEPTANCE=PASS`
- no production data was modified for acceptance

## Sprint 2 — Automated Roblox data sync

**Status: DONE**

Goal: active entitled customers receive fresh Roblox analytics automatically without manually triggering sync.

Implemented scope:
- scheduler discovery is limited to active organizations, LIVE data mode and active Roblox connections
- Sprint 1 product entitlement is re-evaluated before each external sync
- the existing retry-enabled Roblox analytics client and idempotent observation persistence are reused
- each tenant connection is processed in its own database session so one tenant failure does not stop later tenants
- per-connection sync state persists health status, last attempt, last success and last error in a new non-destructive table
- expired/unpaid tenants are marked `BLOCKED` and no external Roblox request is made
- successful syncs become `HEALTHY`; failures become `ERROR`
- a dedicated CLI job runs the scheduler and returns a failing process status only after every candidate has been processed
- Hetzner runner script executes the job inside the production API container
- Hetzner cron schedule runs automated Roblox analytics sync daily at 06:10 server time

Validation:
- candidate filtering covers active LIVE connections only
- successful entitled sync persists `HEALTHY`, `last_attempt_at` and `last_success_at`
- expired/unpaid entitlement blocks external sync
- one tenant failure does not prevent the following tenant from syncing
- Roblox HTTP 429 rate-limit retry behavior is covered explicitly
- GitHub CI #365 passed 69 backend tests, Ruff and frontend build
- Hetzner production deployed at commit `80e9c61d7e7f5b248b97902f350ef56c381a4b8f`
- Compose validation returned `CONFIG_EXIT=0`
- PostgreSQL stayed healthy; API and web containers started cleanly
- `roblox_sync_state` was created successfully with per-connection uniqueness and foreign keys
- a real production scheduler run found one active LIVE connection and synced Roblox universe `10770494757` successfully with `failed=0`, `skipped=0`, `synced=1`
- production state persisted connection `3` as `HEALTHY` with both last attempt and last success timestamps and no error
- `/etc/cron.d/playdirective-r17` contains the daily automated Roblox sync at 06:10 server time
- final production logs showed clean Next.js/FastAPI startup and repeated HTTP 200 responses from `/health` and `/ready`

Acceptance result:
- automated production sync is live and scheduled daily
- active customers no longer need to manually initiate routine Roblox analytics sync

## Sprint 3 — Transactional email / Resend production activation

**Status: IN PROGRESS**

Goal: activate PlayDirective transactional email on production so acquisition, authentication and lifecycle messages are delivered reliably from the verified `playdirective.com` domain.

Existing code baseline:
- Resend delivery integration is implemented server-side
- sender defaults to `PlayDirective <pilot@playdirective.com>`
- provider secrets remain server-side and are read from production environment configuration
- notification records persist provider, status, provider message ID, error and sent timestamp
- event keys provide application-level idempotency for lifecycle sends
- applicant confirmation, operator notification, invite, activation/welcome, passwordless login, connection-attention and Weekly Brief notification flows already exist

Activation scope:
- add and verify `playdirective.com` in Resend for sending using the DNS records generated for the account
- use Resend's provider-specific DNS status to confirm DKIM/SPF/MX/return-path records required for sending
- create a production API key with `Sending access`, restricted to `playdirective.com` where supported
- configure `RESEND_API_KEY`, `EMAIL_FROM` and `OPERATOR_EMAIL` in Hetzner `.env.production` without committing or exposing secrets
- restart only the required production service(s) and verify `/ready` reports email configuration active
- execute real production email acceptance for customer application confirmation, operator notification, workspace invite, passwordless login and lifecycle notification coverage
- verify PlayDirective notification records contain successful provider message IDs and no secrets
- verify duplicate lifecycle execution does not send the same event window twice

DONE criteria:
- `playdirective.com` has verified sending capability in Resend
- production uses a least-privilege sending API key, not a full-access key
- `PlayDirective <pilot@playdirective.com>` can deliver to a real external mailbox
- the operator mailbox receives its expected production notification
- invite and passwordless login links arrive and remain single-use
- lifecycle email delivery is observable in PlayDirective with provider message IDs/errors
- repeated lifecycle execution is idempotent for the same event window
- no API keys, auth tokens or Roblox credentials are exposed in logs, UI, repository or acceptance evidence

## Public demo / internal QA separation

The public demo explains the product workflow using clearly labelled simulated data. It must never look like a place where a visitor should enter real Roblox credentials.

The production landing page labels the illustrative decision queue as simulated. Real credentials are accepted only after approval inside the private studio workspace.

## Go-live baseline

Current code-complete pilot baseline includes:
- PlayDirective brand and canonical domain
- HTTPS/domain routing to the Hetzner production host
- Next.js + FastAPI + PostgreSQL colocated on the Hetzner server using Docker Compose
- no production dependency on Vercel, Neon or Render
- landing page and public simulated demo
- real public founding-pilot application flow
- pricing hypothesis and founding pilot positioning
- invite-only first enrollment plus passwordless email return login
- encrypted Roblox credentials in private workspace
- tenant-scoped sync and decisions
- dynamic customer progress and persisted milestones
- operator console with applications, delivery events and billing state
- privacy / terms / legal notice
- public sitemap and robots configuration for playdirective.com

Commercial validation remains separate from engineering readiness. Paid conversion, willingness to pay, retention lift, and recurring revenue must not be presented as validated until supported by real pilot evidence.

Last updated: 14 October 2026
