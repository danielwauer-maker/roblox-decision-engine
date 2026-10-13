# R17 — Final Commercial Go-Live

Date: 2026-10-13

## Goal

R17 closes the gap between a technically pilot-ready SaaS and an operable founding-customer product:

Advertising / outreach → application → qualification → approval → private workspace → 30-day guided pilot → first value → conversion decision → Stripe subscription → ongoing customer.

## Implemented in R17

### Acquisition and attribution

- UTM source, medium, campaign, content and term captured with pilot applications.
- Referrer and landing URL captured for campaign-level attribution.
- Duplicate pending applications for the same email within 24 hours are de-duplicated.
- Application form links directly to Privacy and Terms.
- Landing page now explains target customer, 30-day journey, hosting/trust model and launch FAQ.
- Pricing page explicitly states that the founding pilot is free, requires no card and never auto-converts to paid.

### 30-day pilot state

- Dedicated additive `pilot_lifecycle` table; no destructive change to existing organization tables.
- Pilot starts when an authenticated studio first loads the R17 pilot state in the workspace.
- Start date, end date, current day, days remaining, active/expired/converted status persisted.
- Workspace shows Day X / 30 and the exact end date.
- Operator can extend a pilot by seven days from the admin console.
- Paid subscription state converts the pilot to `CONVERTED` and the lead pipeline to `PAID`.

### Pilot lifecycle automation

R17 lifecycle milestones:

- Day 3 — connection help
- Day 7 — first-value review
- Day 14 — experiment review
- Day 21 — value check
- Day 27–29 — pilot ending soon
- Day 30 — conversion decision

Notification event keys are idempotent so the scheduled job cannot intentionally send the same milestone repeatedly.

### Lead / founding-customer operations

Application pipeline states:

`APPLIED → REVIEWING → APPROVED → ACTIVATED → CONNECTED → FIRST_VALUE → PILOT_ACTIVE → CONVERSION → PAID`

Additional terminal/support states:

`REJECTED`, `PAUSED`, `EXPIRED`, `CHURNED`.

The operator console now supports:

- campaign/source visibility
- qualification state
- internal notes
- reject / pause / conversion states
- pilot day and days remaining
- pilot extension
- billing state
- lifecycle delivery visibility

### Billing enforcement

Server-side active-experience limits:

- Founding pilot / Indie: 1
- Growth: 3
- Studio: 10

The limit is enforced in the tenant API, not only in frontend copy. A studio cannot bypass the limit by calling the API directly.

### Customer onboarding

- Added a public customer-safe Roblox connection guide.
- Guide instructs customers to create a dedicated least-privilege Open Cloud key and never send credentials by email or through the public application form.

### Production operations

Added under `deploy/hetzner/`:

- `backup-postgres.sh` — compressed PostgreSQL dump, SHA-256 checksum, local retention.
- `r17-lifecycle.sh` — invokes both product and commercial lifecycle jobs using the server-side admin token.
- `healthcheck.sh` — checks public site, API health/readiness and required Docker containers.
- `install-r17-cron.sh` — installs daily lifecycle, daily DB backup and 5-minute local health jobs.

### Legal / privacy baseline

Customer-facing Terms now distinguish:

- free 30-day pilot
- explicit paid Stripe subscription
- no automatic conversion
- plan limits
- billing/cancellation
- customer Roblox authorization responsibilities
- third-party/provider dependency

Privacy now covers:

- pilot applications and attribution
- account/authentication data
- Roblox analytics and encrypted credentials
- AI processing
- transactional/lifecycle email
- Stripe billing state
- Hetzner production hosting
- tenant isolation
- logs/security
- retention/deletion
- data-subject rights baseline
- marketing technology baseline

These pages are an operational product baseline and are not a substitute for professional legal/tax review where required.

## Hetzner deployment sequence

```bash
cd /opt/roblox-decision-engine
git pull --ff-only
bash deploy/hetzner/upgrade-r16-env.sh

docker compose --env-file .env.production -f docker-compose.production.yml config >/dev/null
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build

sudo bash deploy/hetzner/install-r17-cron.sh
bash deploy/hetzner/healthcheck.sh
bash deploy/hetzner/backup-postgres.sh
```

## Hard external gates before paid advertising

These cannot be completed solely by repository code and must be verified on real production infrastructure/accounts:

1. Latest R17 commit deployed on Hetzner.
2. `https://playdirective.com` and TLS verified against that release.
3. Real legal-notice operator name, postal address and contact email configured.
4. Resend domain verified and production API key/operator mailbox configured.
5. Stripe account configured in test mode; Products/Prices/Portal/Webhook tested end to end.
6. Tax/VAT/invoicing treatment for the actual operator/customer markets confirmed before live payments.
7. Stripe switched to live mode only after the complete test-mode acceptance run.
8. At least one real published Roblox experience returns real analytics observations.
9. Two independent LIVE tenants pass cross-tenant isolation smoke validation in production.
10. Database backup generated and a restore rehearsal completed.
11. Independent external uptime alerting configured; local cron health checks alone are not sufficient independent monitoring.
12. Full `docs/REAL_LIFE_ACCEPTANCE_TEST.md` A–I run passes on the exact production commit.

## Advertising gate

Paid advertising is approved only when all hard external gates above pass. UTM attribution is already implemented and should be used on every campaign link. Do not enable non-essential advertising pixels/remarketing tags until the applicable consent/privacy setup has been reviewed and configured.

## Feature freeze

After R17 production acceptance, do not add speculative product features before gathering real founding-customer evidence. New functionality should be prioritized from observed onboarding friction, customer feedback, conversion behavior and retention.
