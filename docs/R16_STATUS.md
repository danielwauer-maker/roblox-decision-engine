# R16 Status

Date: 2026-10-13

## Code gate

Status: **CODE COMPLETE / HETZNER DEPLOYMENT + EXTERNAL CONFIGURATION + REAL-LIFE ACCEPTANCE PENDING**

Validated functional R16 head before the Hetzner deployment-alignment changes:

`030c9db07d70d4af485e9c4202916989b58d3a51`

CI result for that exact functional head:

- backend pytest: **53 passed**
- Ruff: **passed**
- frontend dependency audit: **passed**
- Next.js production build: **passed**

The subsequent deployment-alignment commits only change production configuration/scripts/documentation and must still pass the repository CI before final acceptance.

## Production architecture decision

PlayDirective production is **Hetzner-only** for application hosting and database persistence:

- `playdirective.com` DNS remains on Hetzner nameservers
- apex A record points to the Hetzner server
- Next.js runs in Docker on Hetzner
- FastAPI runs in Docker on Hetzner
- PostgreSQL 16 runs in Docker on Hetzner with persistent local volume storage
- API and Web application ports are loopback-bound and expected to be published through the existing reverse proxy/TLS configuration

Vercel, Neon and Render are **not production dependencies**.

## Hetzner R16 deployment preparation

The repository now includes the complete R16 production environment surface in `docker-compose.production.yml`:

- `PUBLIC_APP_URL`
- `PILOT_LOGIN_LINK_MINUTES`
- Resend email variables
- lifecycle variables
- Stripe test-mode variables

The Hetzner environment template and bootstrap script have been updated as well.

For the existing server, use:

`deploy/hetzner/upgrade-r16-env.sh`

This script appends only missing R16 variables and deliberately never overwrites existing server secrets.

## External secrets/configuration still required

Resend:
- verify `playdirective.com` sender domain using Hetzner DNS
- add `RESEND_API_KEY`
- add `OPERATOR_EMAIL`

Stripe test mode:
- create Indie $19/mo, Growth $49/mo and Studio $99/mo recurring prices
- configure Customer Portal
- create webhook to `https://playdirective.com/api/billing/webhook`
- add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the three `STRIPE_PRICE_*` IDs

## Deployment state

The current R16 main branch has **not yet been deployed and verified on the Hetzner production server** after the R16 deployment-alignment changes.

Do not run the final A–I real-life acceptance test until:

1. the server has pulled the current `main`,
2. the existing `.env.production` has been safely upgraded,
3. Docker Compose validates,
4. all three production containers are running,
5. `http://127.0.0.1:8091/health` succeeds,
6. `http://127.0.0.1:8091/ready` returns the expected provider/readiness state,
7. `https://playdirective.com` serves the new release.

## Legacy infrastructure

Previous Vercel and Neon resources were used for validation while the product was being built. They are no longer part of the target architecture. Render currently has no PlayDirective services.

Keep legacy Vercel/Neon resources temporarily only as rollback/reference until the Hetzner A–I acceptance run passes. After that they can be removed without affecting PlayDirective production.

## Final closure rule

R16 becomes `DONE` only after:

1. the final R16 `main` commit is deployed on Hetzner,
2. Resend delivery configuration is active,
3. Stripe test-mode configuration is active,
4. `docs/REAL_LIFE_ACCEPTANCE_TEST.md` sections A–I pass,
5. the exact production Git commit and test evidence are recorded.
