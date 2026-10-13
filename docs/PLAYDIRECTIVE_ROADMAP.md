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

Last updated: 13 October 2026
