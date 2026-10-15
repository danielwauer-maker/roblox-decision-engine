# Roblox Decision Engine — Product Master

Status: Validation → Pilot
Start: 2026-10-12

## Product thesis
Roblox already provides strong analytics. The product therefore does not compete on charts. It acts as an AI Product & Growth Analyst that answers: **What should I do next?**

## Primary ICP hypothesis
Small to mid-sized Roblox studios with meaningful live traffic and monetization but without a dedicated data/product analyst. Initial target hypothesis: experiences with roughly 5k–250k DAU.

## Core jobs-to-be-done
1. Detect the highest-impact retention, onboarding or monetization issue.
2. Explain the evidence and affected segment.
3. Prioritize opportunities by likely impact and confidence.
4. Recommend the next concrete product action.
5. Draft an experiment hypothesis, audience, KPI and guardrails.
6. Warn when acquisition should not be scaled yet.
7. Compare product health before and after updates.
8. Produce a concise weekly growth brief.

## Product principles
- Decisions over dashboards.
- Evidence before explanation.
- No fabricated metrics.
- Native Roblox analytics remain the source for broad exploration.
- The AI layer receives deterministic calculations and evidence, not raw permission to invent causes.
- Every recommendation exposes confidence, evidence and an experiment path.

## Current commercial model (V1)

PlayDirective has no permanent Free plan. The launch offer is a 30-Day Founding Pilot, managed by PlayDirective, with no card and no automatic paid conversion. Pilot access is capped at 3 Experiences, 3 seats and 250 Decision credits for its 30-day term. A Pilot participant cannot receive the later standard-mode trial.

Paid plans are monthly USD: Indie $24 (1 Experience, 1 seat, 90 days history, 50 Decision credits); Growth $59 (3 Experiences, 3 seats, 365 days, 250 credits; recommended); Studio $119 (10 Experiences, 10 seats, 730 days, 1,000 credits). Taxes are included where applicable through Managed Payments; coverage varies by customer location and eligibility. No annual prices or public MAU/event-volume limits. Entitlements come from the canonical `apps/shared/commercial_plans.json`; Stripe stores the plan key and billing state only.

Public feature claims must match `feature_status` in the catalog. Planned functionality is labeled Coming soon. The standard mode is configured with `PLAYDIRECTIVE_COMMERCIAL_MODE=standard` and offers an eligible new workspace a 14-day Indie trial with payment method required; previously consumed Pilot accounts are excluded.

Standard trial signup verifies the Owner's email before creating a workspace. The trial begins only in Stripe Checkout after a payment method is collected. An expired or abandoned Checkout session does not grant access. Upgrades take effect after Stripe confirms the full new monthly charge with no proration credit; downgrades take effect at period end. Cancellation is at period end, and paid access lasts through that date. Past-due subscriptions retain access for seven days from the first failure; afterward product features are read-only/inactive while accounts and stored data remain.

Only Owners can manage billing. The Stripe Customer Portal is restricted to payment method, invoice history, and period-end cancellation; plan switching is handled by PlayDirective. Standard Stripe Test Mode and Managed Payments Sandbox paths are separate. Live calls require production mode, an explicit Managed Payments enablement, live credentials, and all six live Prices; the flag remains false until account eligibility, taxes, and supported jurisdictions are approved. See `docs/STRIPE_BILLING.md` for the configuration matrix and local setup.
