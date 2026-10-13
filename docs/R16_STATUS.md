# R16 Status

Date: 2026-10-13

## Code gate

Status: **CODE COMPLETE / EXTERNAL CONFIGURATION + REAL-LIFE ACCEPTANCE PENDING**

Validated final code head before this status-only commit:

`030c9db07d70d4af485e9c4202916989b58d3a51`

CI result for that exact head:

- backend pytest: **53 passed**
- Ruff: **passed**
- frontend dependency audit: **passed**
- Next.js production build: **passed**

## Canonical domain

- `playdirective.com` is attached and verified on the production frontend project.
- `www.playdirective.com` is attached and redirects to `playdirective.com` with HTTP 308.

## Production environment prepared

API environment now includes the non-secret production values:

- `PUBLIC_APP_URL=https://playdirective.com`
- CORS includes `playdirective.com`, `www.playdirective.com` and the legacy Vercel validation alias
- `EMAIL_FROM=PlayDirective <pilot@playdirective.com>`
- `PILOT_LOGIN_LINK_MINUTES=20`
- `LIFECYCLE_STALE_DAYS=7`

## External secrets/configuration still required

Resend:
- verify sender domain
- add `RESEND_API_KEY`
- add `OPERATOR_EMAIL`

Stripe test mode:
- create Indie $19/mo, Growth $49/mo and Studio $99/mo recurring prices
- configure Customer Portal
- create webhook to `https://playdirective.com/api/billing/webhook`
- add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and the three `STRIPE_PRICE_*` IDs

## Deployment state

The final code head is not yet the active Vercel production artifact. On 13 October 2026, Vercel rejected an additional manual deployment because the Hobby team exceeded the daily API-deployment limit (`api-deployments-free-per-day`, more than 100 deployments).

The latest observed READY frontend production deployment at the time of this status update was commit:

`c29cc3872ff69412d898adf1295310eb3083ba7a`

Therefore do **not** run the final A–I real-life acceptance test until the final R16 main head has reached READY production state after the deployment quota becomes available again.

## Final closure rule

R16 becomes `DONE` only after:

1. final R16 main head is deployed to both frontend and API production,
2. Resend production/test delivery configuration is active,
3. Stripe test-mode configuration is active,
4. `docs/REAL_LIFE_ACCEPTANCE_TEST.md` sections A–I pass,
5. the exact production commit/deployment IDs and test evidence are recorded.
