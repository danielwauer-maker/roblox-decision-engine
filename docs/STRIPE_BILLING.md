# Stripe billing and commercial rules

`apps/shared/commercial_plans.json` is the shared source for PlayDirective prices, limits, plan features, Pilot terms, and trial terms. Stripe Price IDs come only from server environment variables. Stripe metadata uses `playdirective_plan`; it never supplies entitlement limits.

## Sandbox safety and setup

The API supports two explicitly separated Sandbox lanes. Standard Stripe mechanics may be exercised with `STRIPE_MODE=test`, a test-only API key, `STRIPE_TEST_BILLING_MODE=true`, and `STRIPE_MANAGED_PAYMENTS_ENABLED=false`. That lane can test subscription lifecycle behavior, but it is not evidence of Merchant-of-Record, tax, or Managed Payments behavior. The Managed Payments contract path remains available only with `STRIPE_MODE=test` and `STRIPE_MANAGED_PAYMENTS_ENABLED=true`; never set both flags. Production rejects test billing and requires `STRIPE_MODE=live`. Live API calls are accepted only in `APP_ENV=production` with the explicit Managed Payments flag, live-prefixed credentials, webhook secret, Portal configuration, and all six configured live Prices; all remain absent/disabled until post-registration approval.

Configuration matrix:

| APP_ENV | STRIPE_MODE | TEST_BILLING | MANAGED_PAYMENTS | Behavior |
| --- | --- | --- | --- | --- |
| development/test | test | true | false | Standard Stripe Test Mode mechanics |
| development/test | test | false | true | Managed Payments Sandbox contract path |
| development/test | test | false | false | Billing calls disabled |
| any | live | true | any | Startup refused |
| production | test | any | any | Startup refused |
| production | live | false | false | Fail-closed default; paid flows unavailable |
| production | live | false | true | Live Managed Payments; startup requires a live key, webhook secret, Portal configuration, and all six live Prices |

The API refuses live-prefixed credentials in test mode and test-prefixed credentials in live mode. Keep local values in the ignored `.env` file. Do not use standard Stripe Payments as a Merchant-of-Record substitute.

Set these server-side values for a local Sandbox only:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_INDIE_PERSONAL`, `STRIPE_PRICE_INDIE_BUSINESS`
- `STRIPE_PRICE_GROWTH_PERSONAL`, `STRIPE_PRICE_GROWTH_BUSINESS`
- `STRIPE_PRICE_STUDIO_PERSONAL`, `STRIPE_PRICE_STUDIO_BUSINESS`
- `STRIPE_PORTAL_CONFIGURATION_ID`
- `STRIPE_MODE=test`
- `STRIPE_TEST_BILLING_MODE=true` for ordinary Stripe Test Mode mechanics
- `STRIPE_MANAGED_PAYMENTS_ENABLED=false` until verified

The API explicitly sends Stripe API version `2026-08-26.dahlia` on all server-side REST requests. This is the current Stripe-documented integration version in this repository and is later than Managed Payments' `2025-03-31.basil` minimum.

Run `python scripts/validate_stripe_catalog.py` from the repository root to read and validate all six configured Sandbox Prices against the canonical three-plan catalog. It checks USD, monthly recurrence, amounts, inclusive tax behavior, Product names/tax codes, active status, and plan/customer-type metadata without modifying Stripe.

Apply local schema changes with `python scripts/apply_migrations.py` after PostgreSQL is available. The command is restricted to development/test environments and local database hosts. It creates the baseline tables, then applies ordered SQL migrations with checksums and repeat-safe tracking; it refuses production databases.

## Founding Pilot

Pilot mode is PlayDirective-managed for 30 days. It costs $0, requires no payment method, provides the catalog's Pilot limits and 250 one-time Decision credits, and never converts automatically. At expiry, the Owner can choose a paid plan; Pilot participants cannot receive the standard trial later.

## Standard 14-day trial

Standard mode exposes `/start-trial`. A new Owner enters contact, studio, and email details, then verifies email through a single-use expiring link. The backend rejects existing accounts, Pilot lifecycle users, and accounts with a consumed Stripe trial. Verification creates an Indie workspace in `trial_signup_pending`; it does not grant product access. After sign-in, the workspace starts Stripe Checkout with a required payment method and a 14-day Indie trial. The missing-payment-method end behavior is `cancel`, preventing an unpaid trial from converting to an invoice. `checkout.session.completed` and `customer.subscription.created` mark the trial consumed. A successful trial becomes $24 USD/month, tax-inclusive where Managed Payments supports the jurisdiction, unless canceled. An expired Checkout session can be retried without consuming the trial.

## Plan changes

Only an Owner can change a plan. Upgrades change the Stripe subscription item immediately with `billing_cycle_anchor=now`, `proration_behavior=none`, and `payment_behavior=error_if_incomplete`. The existing plan remains the local entitlement until `invoice.paid` confirms the target Price. Each request carries an idempotency key. A declined or action-required invoice does not grant the higher plan; the current plan stays active, and the Owner must resolve payment.

Downgrades create a Stripe Subscription Schedule from the existing subscription. The current phase retains its Price through `current_period_end`; the next phase switches to the selected lower Price without proration, then releases the schedule while leaving the lower recurring Price in place. The current higher plan remains the local entitlement until Stripe reports the lower subscription Price. The Owner can cancel a scheduled downgrade by releasing the schedule. Existing Experiences and team memberships are preserved; the billing panel surfaces projected overages.

Cancellation is scheduled for period end and can be reactivated before that date. Stripe webhooks update local cancellation state. No subscription action deletes workspace data.

## Customer Portal

Use a restricted Stripe Customer Portal configuration for payment method updates, invoice history, and cancellation at period end. Disable plan switching and quantity changes. The configuration ID is supplied through `STRIPE_PORTAL_CONFIGURATION_ID`; before creating a portal session, the server reads that configuration and verifies Sandbox mode, payment-method updates, invoice history, period-end cancellation, and disabled subscription updates/pauses. PlayDirective endpoints enforce custom upgrades and downgrades. The application also provides Owner-only cancellation and reactivation controls.

## Access, grace, and read-only behavior

`active` and `trialing` receive the current plan's entitlements. `past_due` retains them for seven days from the first failure; repeated failure webhooks do not extend the grace anchor. After grace, and for `unpaid`, `incomplete`, `incomplete_expired`, `paused`, or ended `canceled` subscriptions, product access is blocked while sign-in and billing management remain available. Data and memberships are preserved. A cancellation scheduled at period end retains access until that end date.

## Decision credits, seats, and history

One successful explicit user-requested Decision Engine generation consumes one credit. Failed generation, system errors, dashboard loads, and viewing an existing Decision do not. Paid usage follows the current Stripe period; Pilot's allowance is one-time for the Pilot term. Credit limits are catalog values.

Experience and seat checks run in the API. Pending invitations count toward seat limits. Downgrades do not delete Experiences, connections, or memberships; Owners resolve overages. History windows restrict visible/queryable records but do not purge older source data.

## Webhooks

Configure a Sandbox endpoint for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Stripe's Managed Payments Checkout guide requires handling asynchronous methods, and its payment-method matrix includes recurring methods beyond cards; the app keeps delayed success pending until `invoice.paid`, while delayed failure stays incomplete and never receives renewal grace. The webhook verifies the signature over the raw body, deduplicates event IDs, and commits event receipt and subscription changes transactionally. Subscription updates can precede invoice payment; an upgrade stays pending until a matching `invoice.paid` confirms its new Price.

## Managed Payments and tax

Stripe's current Managed Payments Checkout guide says Checkout uses the `tax_behavior` on the Price; if unspecified it adds tax on top. All six Sandbox Prices explicitly use `inclusive`; this marks the configured amount as tax-inclusive when tax applies. It does not establish account eligibility or guarantee a particular invoice/tax result before a real Managed Payments invoice is inspected. The public copy remains “Taxes included where applicable.”

Managed Payments account access is individually reviewed by Stripe. It supports direct integrations and eligible digital products only; geography alone does not confer access. The Sandbox account is DE / standard account, but `details_submitted=false`, `charges_enabled=false`, `payouts_enabled=false`, and `requirements.disabled_reason=requirements.pending_verification`. No current/past-due fields are listed, but account-specific Managed Payments eligibility is not returned by the Account API and remains unconfirmed. Keep `STRIPE_MANAGED_PAYMENTS_ENABLED=false`.

The six Sandbox Products carry the requested tax classification: `txcd_10103000` for personal SaaS and `txcd_10103001` for business SaaS, repeated across Indie, Growth, and Studio. Stripe Tax documentation identifies these as SaaS personal/business categories, but the Managed Payments eligibility page requires its eligible-code list and the MCP-rendered list does not expose entries for these IDs. Product creation acceptance is not proof of Managed Payments eligibility. Confirm each Product's Dashboard label says “Eligible for Managed Payments” or get Stripe confirmation before accepting a Managed Payments Checkout.

Workspace billing has one `customer_type`: `personal` or `business`. A personal profile collects no VAT ID. The controlled profile endpoint creates/updates the Stripe Customer first; for EU business profiles it requires company name, country, and an EU VAT ID, attaches `type=eu_vat` before Checkout, retrieves validation if needed, and stores only the Stripe Tax ID resource ID, last four characters, and status locally. Checkout receives the existing Customer and the mapped business Price. `tax_id_collection`, `automatic_tax`, and `customer_update` parameters are omitted. A profile type/VAT change requires explicit confirmation; type changes are blocked during an active subscription, business-to-personal removes the current Customer Tax ID, and historical invoices are untouched.

The validation policy is fail-closed: `verified` may pass the local VAT gate; `pending`, `unverified`, and `unavailable` cannot start Checkout. Stripe says pending VIES checks can take longer and are retried; it assigns the merchant responsibility for unverified IDs and says unavailable IDs need manual verification. Manual review is not implemented, so unavailable remains blocked. Stripe also says the merchant must check the verified business name/address against registration details; that comparison is not implemented yet. Stripe's general Customer Tax ID docs discuss reverse charge under Stripe Tax, but do not establish that Managed Payments uses this pre-attached Customer ID for B2B reverse charge. No claim is made about first-invoice reverse charge or wording until a real Managed Payments Sandbox subscription and invoice confirm it.

Business billing profiles are currently restricted server-side to EU VAT countries. Stripe's account-specific purchase/tax coverage list is not exposed through the Account API, and the Personal purchase-country coverage has not been independently verified. The Managed Payments gate therefore remains closed; before opening it, add a verified server-side purchase-country policy or Stripe-supported equivalent.

The restricted Sandbox Customer Portal configuration enables payment-method update, invoice history and period-end cancellation, while plan switching, quantity changes and pauses are disabled. It was read back as a Sandbox object, but compatibility with a real Managed Payments customer session is not yet tested.

## Products, Prices, events, and validation

There are six internal Product/Price mappings (three public plans times personal/business), all USD, recurring monthly, `tax_behavior=inclusive`, with plan and customer-type metadata on Products and Prices. Only the canonical three-plan commercial catalog is public. Plan changes resolve their Price using both persisted plan and customer type.

The integration listens for Checkout completion, async success/failure, and expiration to reconcile session state; subscription created/updated/deleted to track lifecycle and periods; invoice paid/failed/action-required to gate access on payment, handle renewal grace, and show payment action state; `customer.tax_id.updated` to update the saved VAT validation status; and `customer.updated` to record an idempotent audit event without overriding canonical workspace fields. Refund, dispute, and Radar events are not entitlement inputs for this subscription flow and are not handled.

The read-only `scripts/validate_stripe_catalog.py` checks each of the six configured prices against the canonical amount and expected recurrence, currency, inclusive behavior, product name, tax code, activity, and metadata. A local Sandbox secret is not configured in this workspace, so the script cannot authenticate here; the six records were read back directly from the connected Sandbox API and matched those expectations.

## Local procedure

1. Copy `.env.example` to a local `.env`; configure only Sandbox credentials and Price IDs.
2. Apply `migrations/20261015_stripe_webhook_idempotency.sql`, `migrations/20261015_commercial_entitlements.sql`, `migrations/20261016_commercial_billing_completion.sql`, and `migrations/20261017_billing_customer_type_and_vat.sql` to the development database.
3. Keep `STRIPE_MANAGED_PAYMENTS_ENABLED=false` until Stripe confirms account/product eligibility and the B2B/tax and country policy are resolved. After review, enable only in the local Sandbox environment.
4. Run `docker compose up --build` from the repository root.
5. Run `python scripts/validate_stripe_catalog.py` once a local Sandbox key and all six Sandbox Price IDs are configured.
6. Forward Sandbox webhooks to the local endpoint and test trial checkout, upgrades, scheduled downgrades, cancellation, and payment failure using Stripe test payment methods only.
7. Run API tests from `apps/api` with `python -m pytest tests -q -k "not ready_endpoint_degrades_without_database_and_keeps_observability_headers"`; run `python -m ruff check app tests`.
8. Run `npm run build` from `apps/web`.

No production deployment or live-mode Stripe changes are part of this workflow.
