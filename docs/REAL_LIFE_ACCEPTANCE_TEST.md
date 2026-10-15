# PlayDirective Real-Life Acceptance Test

Status: IN PROGRESS — Sprint 8 Final Go-Live Acceptance & Operations is active; email/provider acceptance completed; full production acceptance remains open.

This runbook is the manual customer-path acceptance test. It intentionally uses a real browser, a real mailbox, Stripe test mode and (for the live-data section) a real Roblox experience.

## Sprint 8 execution tracker

Run in this order and do not mark Sprint 8 DONE until all required gates pass:

- Phase A — Admin QA: `PENDING`
- Phase B — Real Customer Journey / sections A–G: `PENDING`
- Phase C — Stripe Test Mode / section H plus billing-hardening scenarios: `PENDING`
- Phase D — Failure & Recovery / section I plus provider/service failure matrix: `PENDING`
- Phase E — Final Production Gate and cleanup/sign-off: `PENDING`
- Final result: `FINAL_GO_LIVE_ACCEPTANCE=PENDING`

Phase A minimum runtime evidence:
1. desktop admin route/layout acceptance
2. mobile admin route/layout acceptance
3. Applications workflow
4. Studios & customers workflow
5. Pilot operations workflow
6. Billing workflow
7. Workspace access workflow
8. Data & simulation workflow
9. Build Log review
10. Email template override saved
11. matching automatic email received with override copy
12. template disabled and built-in fallback copy received
13. manual admin email received
14. Delivery History contains expected status/provider message ID or visible provider error

Customer-360 consolidation is post-go-live unless this acceptance exposes a real support blocker. Existing go-live MUST HAVE controls are customer/studio lookup, pilot/plan/billing visibility, experience/sync state, workspace access, revoke/disable/reactivate, feedback and email delivery observability.

## Test identities

Use two independent email addresses and, where possible, two independent Roblox test experiences. Never reuse an operator/admin session as the customer session.

## A. Public acquisition

1. Open the canonical PlayDirective production domain in a private browser window.
2. Start the Founding Studio Pilot application from the public CTA.
3. Submit a real email address and studio/application details.
4. Confirm the success screen does not expose internal IDs, tokens or admin information.
5. Verify the applicant confirmation email arrives.
6. Verify the operator notification arrives at the configured operator mailbox.

Pass: one application exists, no workspace exists before approval, and both expected emails arrive.

## B. Operator approval and enrollment

1. Sign in to `/admin` as operator.
2. Locate the pending application.
3. Approve it and create the studio workspace.
4. Verify an OWNER invitation email is sent to the applicant.
5. Open the invite from the applicant mailbox in a private browser.
6. Redeem it once.
7. Confirm reusing the same invite fails.

Pass: the customer enters only their own studio workspace and the invite is single-use.

## C. Passwordless return login

1. Sign out of the customer workspace.
2. Open `/app/login` without an invite token.
3. Request a login link using the enrolled email address.
4. Verify the response does not reveal whether arbitrary unknown addresses are registered.
5. Open the email link and sign in.
6. Reuse the same link and confirm it is rejected.

Pass: login works without an operator-created invite and magic links are single-use.

## D. Roblox connection and live sync

1. In Roblox Open Cloud, create a key scoped only to the intended experience and required read-only analytics permissions.
2. In PlayDirective, connect the real Universe ID and key.
3. Confirm the key is never shown again after save.
4. Run a 30-day sync.
5. If Roblox returns zero datapoints, use a live experience with sufficient real traffic/history and repeat.
6. Confirm observations appear only in this studio.

Pass: at least one real Roblox analytics observation is stored for the tenant. For the final go-live gate, do not substitute simulated observations.

## E. Customer decision journey

1. Review onboarding progress.
2. Open Priorities.
3. Open Evidence and verify current/baseline values correspond to the connected tenant.
4. Open AI Analyst and verify it does not invent metrics absent from Evidence.
5. Open Experiment and review KPI, sample/runtime and guardrails.
6. Open Weekly Brief.
7. Submit useful/not-useful feedback.

Pass: the flow works without operator assistance and all states are clearly live, waiting, completed or needs-attention.

## F. Second-tenant isolation

Repeat B–E with a second email/studio. Then verify:

- Studio A cannot see Studio B's organization details.
- Studio A cannot see Studio B's connection, observations, priorities, analyst output or feedback.
- Disabling Studio B does not affect Studio A.
- Revoking Studio B sessions immediately blocks Studio B but not Studio A.

Pass: no cross-tenant data is visible even when both tenants use the same test Universe ID in controlled test data.

## G. Email lifecycle

Verify at minimum:

- application received (customer)
- application received (operator)
- workspace invite
- workspace activated/welcome
- passwordless login link
- sync-needs-attention notification when deliberately using an invalid/revoked test key
- weekly-brief-ready notification when the lifecycle job is run for an eligible tenant

Pass: delivery events are logged and repeated lifecycle runs do not spam duplicate notifications for the same event window.

### Sprint 3 production acceptance evidence — 14 October 2026

Completed and verified on Hetzner production:
- `playdirective.com` verified in Resend for sending
- Zoho MX/SPF/DKIM verified; Resend DKIM and sending CNAME records verified
- production uses `PlayDirective <support@playdirective.com>` as sender
- `support@playdirective.com` receives replies in Zoho
- `/ready` reports `transactional_email_configured: true`
- direct production send delivered to a real Gmail mailbox with provider message ID
- real pilot-application customer confirmation delivered
- real operator notification delivered to the configured operator mailbox
- real workspace invite delivered and redeemed successfully once
- second use of the same invite was rejected as expired/invalid
- real passwordless sign-in link delivered and authenticated successfully once
- second use of the same sign-in link was rejected as expired/invalid
- lifecycle acceptance email delivered to Gmail
- repeated execution of the exact same lifecycle event returned the same persisted notification row and the same provider message ID; exactly one event-key record existed
- acceptance output: `SPRINT_3_LIFECYCLE_IDEMPOTENCY=PASS`

Notes:
- `admin@playdirective.com` was not accepted by Zoho as an inbound mailbox recipient during provider acceptance, so production `OPERATOR_EMAIL` was set to the working `support@playdirective.com` mailbox alias.
- Zoho displayed a warning for same-domain automated inbound mail from Resend; delivery nevertheless succeeded. Treat this as a low-priority mail-hardening item, not a go-live blocker.
- this evidence closes Sprint 3 provider activation; it does not by itself mark the entire A–I runbook complete.

## H. Stripe test mode

Do not use live-mode keys for this acceptance test.

1. Ensure the configured Stripe Sandbox Price IDs correspond to Indie $24/month, Growth $59/month and Studio $119/month, with inclusive tax behavior.
2. As the workspace OWNER, open Billing and choose Indie.
3. Confirm Stripe Checkout opens with the correct product, amount and recurring interval.
4. Complete payment using a Stripe test card.
5. Return to PlayDirective and verify subscription status/plan updates after webhook delivery.
6. Open Manage subscription and verify Stripe Customer Portal opens.
7. Upgrade Indie → Growth and verify the entitlement limit moves 1 → 3.
8. Upgrade Growth → Studio and verify the entitlement limit moves 3 → 10.
9. Downgrade and verify fail-closed multi-experience handling remains correct.
10. Cancel at period end and verify state is displayed correctly.
11. Simulate payment failure / `past_due` and verify the seven-day grace starts once.
12. Repeat `past_due` and verify the grace deadline does not move.
13. Recover payment to `active` and verify paid access immediately recovers.
14. Verify terminal canceled state permits a later new subscription.
15. Verify fresh duplicate checkout is blocked.
16. Verify an existing managed subscription blocks duplicate subscription creation.
17. Verify a stale/foreign webhook cannot replace the canonical managed subscription.

Pass: PlayDirective never handles raw card details, subscription state is driven by verified Stripe webhooks, and all Sprint 4–7 billing/entitlement protections hold against real Stripe test events.

## I. Failure/recovery

### Roblox
1. Use an invalid/revoked Roblox API key and run sync: customer gets a safe needs-attention state and the failure is visible operationally.
2. Exercise a transient/rate-limit/provider-unavailable path where safely reproducible and verify bounded failure rather than cross-tenant impact.
3. Restore a valid key and confirm sync recovers.
4. Confirm another tenant remains unaffected.

### Email
1. Verify inactive template fallback.
2. Exercise an invalid recipient/provider failure path without exposing secrets.
3. Confirm error/status is visible in Delivery History.

### Auth / tenant
1. Confirm expired invite rejection.
2. Confirm already-redeemed invite rejection.
3. Confirm expired passwordless-link rejection.
4. Confirm second-use rejection.
5. Revoke the customer session from admin: next authenticated request fails.
6. Request a new email login link: access recovers.
7. Disable the tenant: login/API access is blocked.
8. Reactivate the tenant and issue/redeem a fresh login link.

### Billing
Verify no-subscription, active pilot fallback, expired pilot, `past_due` grace/recovery and cancellation behavior against the same server-side product access guard.

### Database / service
1. Verify `/health` and `/ready` communicate different responsibilities.
2. Restart API and verify recovery.
3. Restart Web and verify recovery.
4. PostgreSQL restart is optional and only performed after explicit operator confirmation when safely justified.

### AI
1. Verify provider-unavailable path falls back deterministically.
2. Verify malformed/ungrounded model output cannot invent authoritative metrics and does not bypass deterministic evidence.

Pass: the operator can recover the pilot without database edits or exposing secrets, provider failures remain bounded, and deterministic product behavior remains available where designed.

## Final go-live sign-off

Record date, production commit SHA, frontend/API container/deployment identifiers, database/runtime identity, tester emails (redacted), Roblox Universe IDs (non-secret), Stripe test event IDs, and any explicitly accepted exceptions.

Also verify before GO:
- `main` is current
- intended CI checks are green; unrelated external deployment checks are documented rather than silently ignored
- Hetzner working tree contains only expected production-local changes
- web/API/PostgreSQL are healthy
- `/health` = ok and `/ready` = ready
- provider configuration/status is correct
- backup/cron jobs are current
- acceptance subscriptions, dummy experiences and temporary test data are cleaned up
- no secrets/credentials appear in repository or logs/evidence
- Privacy, Terms, legal notice, pricing, founding-pilot and billing/cancellation wording are current
- roadmap, Build Log and this document match the actual status

Mark GO only if the required Sprint 8 phases pass or any remaining exception has an explicitly accepted documented risk.

Target final result:

`FINAL_GO_LIVE_ACCEPTANCE=PASS`
