# R16 External Service Setup

PlayDirective production is intentionally self-hosted on the existing Hetzner server in Germany. Vercel, Neon and Render are not part of the production runtime. The production application stack is Next.js + FastAPI + PostgreSQL in Docker Compose on Hetzner; external providers are used only for their specialist services (Roblox Open Cloud, OpenAI, Resend and Stripe).

Never commit or paste provider secrets into source control.

## 1. Canonical production architecture

Public URL:

`https://playdirective.com`

Production runtime:

- DNS / domain: Hetzner DNS
- reverse proxy / TLS: existing Hetzner host configuration
- Web: `rde-web`, bound to `127.0.0.1:8090`
- API: `rde-api`, bound to `127.0.0.1:8091`
- PostgreSQL: `rde-postgres`, internal Docker network only
- persistent database path: `${RDE_DATA_DIR}/postgres`

The Web container reaches FastAPI internally through `http://api:8000`. PostgreSQL is not exposed publicly.

Required production URL values:

- `PUBLIC_APP_URL=https://playdirective.com`
- `CORS_ORIGINS=https://playdirective.com`
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8091`

For an existing Hetzner install, run `deploy/hetzner/upgrade-r16-env.sh`. It appends missing R16 variables and never overwrites existing secrets.

## 2. Hetzner deployment / upgrade

From the existing repository directory on the server:

```bash
cd /opt/roblox-decision-engine
git pull --ff-only
bash deploy/hetzner/upgrade-r16-env.sh
```

Then add provider secrets directly to `/opt/roblox-decision-engine/.env.production` using a server-side editor. Keep file mode `600`.

Validate Compose before replacing containers:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml config >/dev/null
```

Build and start the current release:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

Verify:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
curl -fsS http://127.0.0.1:8091/health
curl -fsS http://127.0.0.1:8091/ready
curl -I https://playdirective.com
```

Do not run `bootstrap-env.sh` on the existing server because it intentionally refuses to overwrite an existing `.env.production`.

## 3. Resend transactional email

### Account-side setup

1. Add and verify `playdirective.com` in Resend.
2. Add the DNS records Resend provides in Hetzner DNS.
3. Create a sending API key scoped only as broadly as required for PlayDirective transactional email.
4. Use a sender on the verified domain, recommended:
   - `PlayDirective <pilot@playdirective.com>`
5. Choose the operator mailbox that should receive new-pilot notifications.

### Hetzner production environment

Set in `/opt/roblox-decision-engine/.env.production`:

- `RESEND_API_KEY=<secret>`
- `EMAIL_FROM=PlayDirective <pilot@playdirective.com>`
- `OPERATOR_EMAIL=<operator mailbox>`
- `LIFECYCLE_STALE_DAYS=7`

Do not expose `RESEND_API_KEY` to the frontend or any `NEXT_PUBLIC_*` variable.

### Acceptance

The `/ready` endpoint should report `transactional_email_configured: true`. Then execute acceptance-test sections A, B, C and G.

## 4. Stripe test mode

Use Stripe **Sandbox/test mode only** for the current billing acceptance. Do not configure live-mode credentials or deploy billing until account eligibility and tax/legal requirements have been reviewed.

### Products / recurring prices

Create three monthly recurring USD prices:

- **Indie** — `$24.00 / month` — 1 experience
- **Growth** — `$59.00 / month` — up to 3 experiences
- **Studio** — `$119.00 / month` — up to 10 experiences

Set each Price to `tax_behavior=inclusive`. Customer total stays at the displayed amount where Managed Payments supports and applies tax; tax-liability coverage is jurisdiction-specific. Keep `STRIPE_MANAGED_PAYMENTS_ENABLED=false` until Stripe confirms account eligibility.

Record the three Stripe `price_...` IDs.

### Customer Portal

Enable Stripe Customer Portal in test mode and allow:

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

Copy the resulting test-mode `whsec_...` signing secret directly into the Hetzner `.env.production` file.

### Hetzner production environment

Set:

- `STRIPE_SECRET_KEY=<test sk_... secret>`
- `STRIPE_WEBHOOK_SECRET=<test whsec_... secret>`
- `STRIPE_PRICE_INDIE_PERSONAL=<price_...>`
- `STRIPE_PRICE_INDIE_BUSINESS=<price_...>`
- `STRIPE_PRICE_GROWTH_PERSONAL=<price_...>`
- `STRIPE_PRICE_GROWTH_BUSINESS=<price_...>`
- `STRIPE_PRICE_STUDIO_PERSONAL=<price_...>`
- `STRIPE_PRICE_STUDIO_BUSINESS=<price_...>`
- `STRIPE_WEBHOOK_TOLERANCE_SECONDS=300`

Do not expose any of these values to browser JavaScript or `NEXT_PUBLIC_*` variables.

### Acceptance

The `/ready` endpoint should report `stripe_configured: true`. Then execute acceptance-test section H end to end with Stripe test mode.

## 5. Roblox final acceptance

For the final real-pilot gate, use a real published Roblox experience with sufficient real analytics history. A successful HTTP request that returns zero datapoints does not close the real-data gate.

Required final proof:

- at least one tenant-scoped real observation from Roblox
- at least one supported evidence-backed priority, or documented proof that real data was ingested correctly but intentionally did not cross a decision threshold
- second tenant remains isolated

## 6. Infrastructure that is no longer required

The production application must not depend on:

- Vercel frontend or serverless functions
- Neon PostgreSQL
- Render services

Existing validation/test resources may remain temporarily for rollback/reference, but they are not production dependencies and can be removed after the Hetzner A–I acceptance run passes.

## 7. Go-live rule

Do not mark R16 `DONE` solely because provider settings are present. Mark it done only after `docs/REAL_LIFE_ACCEPTANCE_TEST.md` sections A–I are completed on the Hetzner production release and the exact Git commit plus test evidence are recorded.
