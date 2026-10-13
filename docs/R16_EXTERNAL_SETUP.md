# R16 External Service Setup

The application code for email enrollment, lifecycle notifications and Stripe subscriptions is designed to run safely without provider secrets in CI. Production activation requires the following account-side configuration. Never commit or paste provider secrets into source control.

## 1. Canonical application URL

Production public URL:

`https://playdirective.com`

Set on the API production environment:

- `PUBLIC_APP_URL=https://playdirective.com`

Keep the frontend's server-side `API_BASE_URL` pointed at the production FastAPI service.

## 2. Resend transactional email

### Account-side setup

1. Add and verify `playdirective.com` in Resend.
2. Add the DNS records Resend provides at the domain's DNS provider.
3. Create a sending API key scoped only as broadly as required for PlayDirective transactional email.
4. Use a sender on the verified domain, recommended:
   - `PlayDirective <pilot@playdirective.com>`
5. Choose the operator mailbox that should receive new-pilot notifications.

### API production environment

Set directly in the hosting provider's secret/environment UI:

- `RESEND_API_KEY=<secret>`
- `EMAIL_FROM=PlayDirective <pilot@playdirective.com>`
- `OPERATOR_EMAIL=<operator mailbox>`
- `LIFECYCLE_STALE_DAYS=7`

Do not expose `RESEND_API_KEY` to the frontend or any `NEXT_PUBLIC_*` variable.

### Acceptance

The `/ready` endpoint should report `transactional_email_configured: true`. Then execute acceptance-test sections A, B, C and G.

## 3. Stripe test mode

Use Stripe **test mode first**. Do not configure live-mode credentials until the complete manual acceptance run has passed.

### Products / recurring prices

Create three monthly recurring USD prices:

- **Indie** — `$19.00 / month` — 1 experience
- **Growth** — `$49.00 / month` — up to 3 experiences
- **Studio** — `$99.00 / month` — up to 10 experiences

Record the three Stripe `price_...` IDs.

### Customer Portal

Enable Stripe Customer Portal in test mode and allow the actions intended for launch:

- update payment method
- view invoices
- change subscription plan among the configured PlayDirective plans
- cancel subscription / cancel at period end

### Webhook

Create a Stripe test-mode webhook endpoint:

`https://playdirective.com/api/billing/webhook`

Subscribe at minimum to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the resulting test-mode `whsec_...` signing secret directly into the API host secret store.

### API production environment

Set directly in the hosting provider's secret/environment UI:

- `STRIPE_SECRET_KEY=<test sk_... secret>`
- `STRIPE_WEBHOOK_SECRET=<test whsec_... secret>`
- `STRIPE_PRICE_INDIE=<price_...>`
- `STRIPE_PRICE_GROWTH=<price_...>`
- `STRIPE_PRICE_STUDIO=<price_...>`

Do not expose any of these values to browser JavaScript or `NEXT_PUBLIC_*` variables.

### Acceptance

The `/ready` endpoint should report `stripe_configured: true`. Then execute acceptance-test section H end to end with Stripe test mode.

## 4. Roblox final acceptance

For the final real-pilot gate, use a real published Roblox experience with sufficient real analytics history. A successful HTTP request that returns zero datapoints does not close the real-data gate.

Required final proof:

- at least one tenant-scoped real observation from Roblox
- at least one supported evidence-backed priority, or documented proof that real data was ingested correctly but intentionally did not cross a decision threshold
- second tenant remains isolated

## 5. Go-live rule

Do not mark R16 `DONE` solely because provider settings are present. Mark it done only after `docs/REAL_LIFE_ACCEPTANCE_TEST.md` sections A–I are completed and the exact production commit/deployments used for the test are recorded.
