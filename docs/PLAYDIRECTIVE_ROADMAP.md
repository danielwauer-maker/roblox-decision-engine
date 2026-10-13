# PlayDirective Delivery Roadmap

This document is the working source of truth for post-go-live product delivery. Update it whenever a phase materially changes state, scope, or validation status.

## Status legend

- `DONE` — implemented and validated
- `IN PROGRESS` — actively being built
- `NEXT` — committed next phase
- `PLANNED` — scoped but not started

## Phase 2A — Private workspace parity

**Status: IN PROGRESS**

Goal: bring the real invited studio workspace to the same decision workflow demonstrated in the public product demo.

Scope:
- authenticated studio overview
- real tenant decision queue
- evidence drill-down for each priority
- AI Product Analyst using tenant observations
- investigation view with evidence and supported hypotheses
- Experiment Copilot using the top supported priority
- Weekly Brief using tenant observations
- consistent navigation, empty states, degraded states, and tenant isolation
- no simulated data presented as live customer data

Exit criteria:
- invited pilot customer can move from connection -> sync -> priority -> evidence -> analyst -> experiment -> weekly brief without operator assistance
- all views are tenant-scoped
- empty/live/simulated states are visually explicit
- real workspace does not promise capabilities that only exist in the public demo

## Phase 2B — Pilot progress and onboarding state machine

**Status: NEXT**

Goal: replace internal pilot-readiness/QA concepts with a customer-facing progress experience driven by real workspace state.

Customer journey:
1. Connect experience
2. Complete first successful sync
3. Review first priority and evidence
4. Build first experiment
5. Receive/review first Weekly Brief

Status examples:
- `Locked`
- `Waiting for connection`
- `Waiting for data`
- `Ready`
- `Completed`
- `Needs attention`

Scope:
- customer-facing pilot progress view
- dynamic state derived from tenant data, not static badges
- clear next action for every state
- feedback prompts after useful product moments
- keep internal QA/success criteria out of the customer UI

## Phase 3 — Notification and lifecycle system

**Status: PLANNED**

Goal: provide reliable transactional and lifecycle notifications for studios and operators.

Planned notifications:
- pilot request received — customer confirmation
- pilot request received — operator notification
- invite created — email with secure invite link and expiration
- invite redeemed / workspace activated
- sync failed / connection needs attention
- no new analytics for a configurable period
- experiment decision threshold reached
- Weekly Report / Weekly Brief notification with deep link back to PlayDirective

Delivery principles:
- use a transactional email provider rather than running our own mail server
- templates must never contain raw API credentials or session tokens beyond the intended one-time invite link
- unsubscribe/preferences for non-essential lifecycle mail where applicable
- delivery status and provider errors observable to operators

Likely provider candidates: Resend or Postmark. Final provider choice remains open until implementation.

## Phase 4 — Subscription and billing

**Status: PLANNED**

Goal: convert validated pilots into manageable paid subscriptions without building billing infrastructure ourselves.

Scope:
- plan selection and conversion after pilot
- checkout through a billing provider
- customer portal / `Manage subscription`
- invoices and payment method management
- plan changes and cancellation
- entitlement mapping to PlayDirective plan limits
- billing state visible in operator console

Preferred direction: hosted billing/customer portal, e.g. Stripe, rather than custom card handling.

## Public demo / internal QA separation

The public demo explains the product workflow using clearly labelled simulated data. It must never look like a place where a visitor should enter real Roblox credentials.

The old `/demo/pilot` internal-readiness presentation is being converted into a customer-facing explanation of how the founding pilot works. Internal success criteria and QA notes belong in repository documentation/tests/operator tooling, not in the public customer journey.

## Go-live baseline

Current public pilot baseline includes:
- PlayDirective brand and domain
- HTTPS
- landing page and public simulated demo
- pricing hypothesis and founding pilot positioning
- invite-only tenant authentication
- encrypted Roblox credentials in private workspace
- tenant-scoped sync and decisions
- operator console
- privacy / terms / legal notice
- public sitemap and robots configuration for playdirective.com

Commercial validation remains separate from engineering readiness. Paid conversion, willingness to pay, retention lift, and recurring revenue must not be presented as validated until supported by real pilot evidence.

Last updated: 13 October 2026
