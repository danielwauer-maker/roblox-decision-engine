# R16 Architecture Decisions

- Customer auth remains passwordless. Existing single-use workspace invites are extended with single-use email login links for returning users.
- Transactional email provider: Resend. Development/test environments support a non-delivery mode so secrets are never required for CI.
- Billing provider: Stripe Checkout + Stripe Customer Portal + verified webhooks. PlayDirective never handles raw card details.
- Founding pilot remains free. Paid plan prices are validation hypotheses: Indie $19/month, Growth $49/month, Studio $99/month.
- Billing entitlements are derived server-side from subscription state. Pilot access is explicitly represented separately from paid subscription access.
- Customer onboarding progress is derived from real tenant state, not manually toggled badges.
- Lifecycle notifications are recorded for idempotency before/after provider delivery so repeated jobs do not intentionally resend the same event key.
