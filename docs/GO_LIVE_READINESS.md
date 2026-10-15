# PlayDirective Go-Live Readiness

**Review date:** 2026-10-15  
**Overall readiness:** **54%** on the weighted pre-registration technical checklist below  
**Decision:** **NO — not at least 99% ready, excluding live/KYC-only actions.**  
**Deployment/live mode:** not used.

The score counts only evidence available in this repository and the connected Stripe Sandbox. Live-only gates are listed separately and are excluded from the denominator. Test Mode journeys that have not been run remain in the denominator. A working code path or a unit-test fixture is not counted as an end-to-end acceptance pass.

## Weighted score

| Category | Weight | Earned | Status | Evidence / remaining work |
| --- | ---: | ---: | --- | --- |
| Commercial model and six-Price Sandbox catalog | 10 | 10 | PASS | Canonical plans and all six current Sandbox Price/Product objects read back with correct amount, USD, monthly recurrence, inclusive behavior, active state, tax code, and metadata. |
| Test/live mode separation and startup gates | 10 | 10 | PASS | Explicit Test Billing flag; incompatible flags and key prefixes fail validation; production refuses Test Mode. Eight configuration/catalog tests passed in the available synchronous run. |
| Billing state machine implementation | 15 | 13 | PARTIAL | Checkout, trial, tax-ID, upgrade, downgrade, cancellation, Portal, invoice, and idempotency code pass mocked contract tests. Real Stripe Test Mode journeys remain unrun. |
| Real Stripe Test Mode customer journeys | 25 | 0 | BLOCKED | No local Test key or webhook secret; API, database, and webhook receiver were not running. No Checkout, invoice, Portal, 3DS, or real webhook journey is claimed as tested. |
| Database migrations and model/schema verification | 10 | 2 | BLOCKED | Local migration runner and column parity check added. Migrations were not applied because local Postgres is unavailable. |
| Security and tenant/billing boundaries | 10 | 7 | PARTIAL | Full API suite passes, including security/tenant tests. Static review confirms server-selected Prices, strict request models, Owner checks, tenant scope, raw-body signature validation, event-id uniqueness, controlled redirects, key-mode guards, and masked VAT storage. Browser CSRF and secret/log scans remain unverified. |
| Website, product claims, legal and email UX | 7 | 6 | PARTIAL | Public plan figures match the catalog; taxes are qualified; unavailable features are labelled Coming soon; VAT statuses now have specific UI copy; production build passes. Legal identity still uses post-registration placeholders; real mail delivery was not tested. |
| Production configuration and deployment preflight | 5 | 2 | PARTIAL | Production Compose defaults to live mode with both billing gates off; live configuration requires a live key, webhook secret, Portal configuration, and six live Prices. Production was not deployed or exercised. |
| Observability and alerting | 5 | 3 | PARTIAL | Request IDs, bounded request metadata logs, health/readiness endpoints, webhook idempotency records, and reliability guidance exist. No external alert or operator incident workflow was exercised. |
| Backup and recovery | 3 | 1 | PARTIAL | PostgreSQL backup script and checksum exist. Restore and webhook-recovery drills were not run. |
| **Total** | **100** | **54** | **NO** | **The missing Test Mode runtime acceptance is a non-live blocker, not a business-registration or KYC-only action.** |

## Verified product and Stripe facts

The public catalog remains three plans and three entitlement definitions:

| Plan | Monthly USD | Experiences | Seats | History | Decisions/month |
| --- | ---: | ---: | ---: | ---: | ---: |
| Indie | $24 | 1 | 1 | 90 days | 50 |
| Growth | $59 | 3 | 3 | 365 days | 250 |
| Studio | $119 | 10 | 10 | 730 days | 1,000 |

On 2026-10-15, read-only Stripe MCP calls retrieved the six configured Prices and expanded Products from the connected `PlayDirective Sandbox` account (`livemode=false`). All six were active USD monthly Prices with `tax_behavior=inclusive`, expected amount, expected `playdirective_plan` and `playdirective_customer_type` metadata, and the expected Product tax code:

| Variant | Price ID | Amount | Product tax code |
| --- | --- | ---: | --- |
| Indie Personal | `price_1UQsajBHHBXZwKG4EVP12WgP` | $24 | `txcd_10103000` |
| Indie Business | `price_1UQsalBHHBXZwKG4mIfK1e1E` | $24 | `txcd_10103001` |
| Growth Personal | `price_1UQsaoBHHBXZwKG4hNZzFyMS` | $59 | `txcd_10103000` |
| Growth Business | `price_1UQsasBHHBXZwKG40tLjeBUy` | $59 | `txcd_10103001` |
| Studio Personal | `price_1UQsavBHHBXZwKG4Zkba7hfS` | $119 | `txcd_10103000` |
| Studio Business | `price_1UQsaxBHHBXZwKG4OOiUecef` | $119 | `txcd_10103001` |

The local `scripts/validate_stripe_catalog.py` did **not** pass: it refused to run because `.env` has no Sandbox secret/restricted key. The direct readback above verifies the current objects, but does not replace running that repository validator. Product creation and these readbacks do not prove Managed Payments tax-code eligibility or reverse-charge treatment.

The Stripe account readback remains `details_submitted=false`, `charges_enabled=false`, `payouts_enabled=false`, and `requirements.disabled_reason=requirements.pending_verification`. Managed Payments eligibility, Managed Payments terms, and whether either Product tax code is eligible for Managed Payments are not exposed in that readback and remain unconfirmed.

## Mode matrix and safety

| APP_ENV | STRIPE_MODE | TEST_BILLING | MANAGED_PAYMENTS | Result |
| --- | --- | --- | --- | --- |
| development/test | test | true | false | Standard Stripe Test Mode billing mechanics; not Managed Payments evidence |
| development/test | test | false | true | Managed Payments Sandbox contract path |
| development/test | test | false | false | Stripe billing and webhooks disabled |
| any | live | true | any | Startup refused |
| production | test | any | any | Startup refused |
| production | live | false | false | Production defaults fail closed; paid billing unavailable |
| production | live | false | true | Accepted only with live-prefixed key, webhook secret, Portal configuration, and all six live Prices |

The local ignored `.env` has `STRIPE_MODE=test`, `STRIPE_TEST_BILLING_MODE=true`, `STRIPE_MANAGED_PAYMENTS_ENABLED=false`, six Sandbox Price IDs, and **no** Stripe or webhook secret. No key value was written, printed, or committed. No Stripe live API call was made.

## Flow status

| Flow | Status | What is and is not verified |
| --- | --- | --- |
| Personal customer | PARTIAL | Server-side Personal Price mapping exists. No real signup, Indie trial, Checkout, invoice, Portal, entitlement, credits, limits, or history journey ran. |
| Business customer | PARTIAL | Company/country/VAT profile code, existing Customer reuse, Tax ID attachment, status handling, Business Price mapping, last-four-only storage, and verified-only Checkout are implemented. No real VAT scenario or Checkout ran. This is test-mode behavioral validation only; Managed Payments final acceptance is pending. |
| VAT UX | PARTIAL | Pending, verified, unverified, unavailable and unknown states now have distinct messaging. Full VAT values are not returned by billing status. TypeScript and production build pass; browser acceptance remains unrun. |
| Standard trial | PARTIAL | 14-day trial mechanics, payment-method requirement, expiry/retry handling, and prior-Pilot rejection are implemented. No real Test Mode trial/abandonment/cancellation/conversion journey ran. |
| Founding Pilot | PARTIAL | Catalog defines 30 days, no card, no automatic conversion, 3 Experiences, 3 seats, and 250 one-time credits. Regression journey was not run in this environment. |
| Upgrade | PARTIAL | Server-mapped Personal/Business target Price, no proration, cycle reset, idempotency, and invoice-confirmed entitlement code are present. No Stripe Test Mode upgrade ran. |
| SCA / 3DS | PARTIAL | `invoice.payment_action_required` state and Portal recovery path are implemented. Success, failure, authentication UI, and retry were not exercised. |
| Downgrade | PARTIAL | Subscription Schedule logic, period-end state, overage display, and pending downgrade cancellation exist. No real schedule was verified. |
| Cancellation/reactivation | PARTIAL | Period-end cancellation, preserved data, and reactivation endpoints exist. No real subscription was exercised. |
| Payment failure/grace | PARTIAL | Seven-day renewal grace and no initial-payment grace are implemented. No real failed renewal or recovery was run. |
| Customer Portal | PARTIAL | Server verifies required enabled/disabled Portal features and uses an Owner-scoped Customer. No Sandbox Portal session was created. |
| Webhooks | PARTIAL | Signature, raw-body, event-id idempotency, invoice/subscription/checkout/tax/customer handlers are implemented. No forwarding or real/replayed/out-of-order events were tested. |
| Refund/dispute/fraud alerts | PARTIAL | No entitlement change is made from these event types. Operator notification and dispute/refund policy are not implemented or verified; keep `charge.refunded`, `charge.dispute.created`, and `radar.early_fraud_warning.created` out of the endpoint subscription until that operational behavior is specified. |
| Emails | PARTIAL | Application email templates and provider delivery/retry records exist. Resend is unconfigured locally; no signup, Pilot, warning, trial, or recovery email was delivered in this run. Stripe should own payment receipts/invoice notices; PlayDirective owns signup, Pilot, and workspace lifecycle messages. |

## Security, data and operations

- **Price/entitlement boundary — PASS by static review:** the server selects Price IDs from the six configured mappings; client input accepts plan IDs, not arbitrary Prices. Entitlements are derived from the shared plan catalog and subscription state.
- **Authorization — PARTIAL:** billing mutations are Owner-only and tenant-scoped in code. Runtime cross-tenant and CSRF acceptance was not completed. CORS is allowlisted and credentialed CORS is disabled; the write limiter is process-local and needs shared infrastructure before horizontal scaling.
- **Secrets and PII — PARTIAL:** Stripe keys remain server-side; test/live prefixes are checked; no complete VAT ID is stored in the workspace model; request observability excludes bodies. Runtime secret/log scanning was not run.
- **Downgrade safety — PARTIAL:** usage checks preserve excess Experiences and memberships and do not delete history. Runtime acceptance for each limit was not run.
- **Database — BLOCKED:** `scripts/apply_migrations.py` now refuses production, applies ordered checksummed SQL migrations, and compares database column names with model metadata. It could not connect to local Postgres (`localhost:5432` returned Windows `Permission denied`), so neither migration was applied nor parity verified against a database.
- **Monitoring — PARTIAL:** `/health` is liveness; `/ready` checks DB and reports provider state, and standard production billing returns not-ready unless fully configured. Request IDs and bounded metadata are logged. No external alerting, webhook dead-letter process, or operator payment incident delivery was exercised.
- **Backup/recovery — PARTIAL:** production backup script creates compressed `pg_dump` files with checksums and retention. There is no completed isolated restore drill in this run; recovery should restore into a separate database before any production cutover. Stripe event replay should be done from Dashboard after endpoint recovery; stored `event.id` makes repeated delivery safe.

## Website and legal placeholders

- Pricing page reflects the canonical three plans and says USD monthly, taxes included where applicable, tax treatment varies by location, and Business customers can provide company/VAT details. No old $19/$49/$99 values were found in the reviewed public pricing/trial pages.
- Public Pilot copy says no card and no automatic conversion. Planned catalog features display **Coming soon**.
- `/legal`, Privacy, and Terms are technical baseline pages, not legal review. Complete operator name, registered German entity, address, contact email, business/VAT identity, cancellation and subscription details after formation and before accepting customers. Do not publish invented identity details.

## Environment and verification results

| Check | Result |
| --- | --- |
| Python compile | PASS: `python -m compileall -q apps/api/app apps/api/tests scripts` |
| Ruff | PASS for the complete API app and the changed Stripe tests/migration script |
| Focused synchronous tests | PASS: 24 passed, 1 known failing-decision-generation test deselected |
| Full API suite | PASS: `python -m pytest apps/api/tests -q` — 167 passed. It required local asyncio socket access; one Starlette/httpx deprecation warning remains. |
| TypeScript | PASS: `npx tsc --noEmit` |
| Next.js production build | PASS with elevated local file access: all 67 routes prerendered/rendered after ordinary sandbox builds received `EPERM` on `.next` directories. No deployment. |
| Docker Compose development config | PASS: syntax validation |
| Docker Compose production config | PASS: syntax validation with temporary validation-only required environment placeholders |
| Docker/DB stack | BLOCKED: Docker daemon pipe access denied; service query and WSL status return Access denied. Recheck found no listeners on ports 3000, 5432, 5434, or 8000. |
| Stripe CLI | PARTIAL: installed `stripe` CLI 1.53.1. `stripe whoami --format json` reports unauthenticated; `stripe login --non-interactive` cannot resolve `dashboard.stripe.com` in this host session. No webhook tunnel/forwarding was started. |
| Local six-Price validator | BLOCKED: no Sandbox key in `.env`; validator safely refuses without it. |
| `git diff --check` | PASS |

## Remaining blockers

### Non-live blockers that can be completed before business registration

These are **not** live/KYC-only actions and keep readiness below 99%:

1. Restore local Docker Desktop/WSL engine access. The installed client cannot access `dockerDesktopLinuxEngine`; querying the Docker service and WSL is denied for this Windows session. Use a host/session with the required Docker/WSL permissions, then run `docker compose -f docker-compose.yml -f compose.local-validation.yml up --build` (the override publishes Postgres on 5434 to avoid a default 5432 collision).
2. Add a Stripe **Sandbox-only** restricted/secret key and Sandbox webhook signing secret directly to the ignored local `.env` using the Stripe Dashboard/CLI. Do not send either value in chat. Keep `STRIPE_MODE=test`, `STRIPE_TEST_BILLING_MODE=true`, and `STRIPE_MANAGED_PAYMENTS_ENABLED=false` for standard Test Mode mechanics.
3. With Postgres/API running, execute `python scripts/apply_migrations.py`; confirm both migration records and all model columns; run `python scripts/validate_stripe_catalog.py`.
4. Authenticate the installed Stripe CLI in Test Mode once DNS/network access to `dashboard.stripe.com` is available, forward to `POST /v1/billing/webhook`, and run the full personal, business/VAT, trial, Pilot, upgrade, SCA, downgrade, cancellation, renewal failure, Portal, duplicate/out-of-order webhook, and UI journeys in `docs/REAL_LIFE_ACCEPTANCE_TEST.md`. Do not claim reverse charge from standard Test Mode; Managed Payments final tax acceptance remains separate.
5. The full API suite passes when local asyncio socket access is available; verify actual Resend test delivery after configuring a development key.
6. Perform browser-based responsive and customer journey checks. The production build and TypeScript checks now pass.
7. Perform an isolated PostgreSQL backup/restore drill and verify payment incident/email alert ownership before any paid production traffic.

### BLOCKED-LIVE-ONLY — excluded from the score

- Registered German business identity and final legal copy.
- Production Stripe KYC, production bank account, `charges_enabled`/`payouts_enabled`.
- Account-specific Managed Payments approval, Managed Payments terms, and final Product tax-code eligibility.
- Six production live Prices, live restricted key, live webhook endpoint/secret, and live Portal configuration.
- Final production tax/Merchant-of-Record acceptance, HTTPS/domain/secret acceptance on the real host, and one controlled live payment/smoke test.

No production deployment, live Stripe API call, or live payment was made.
