# Security & Privacy Baseline

## Principles

- Least privilege: Roblox access is read-only analytics access only.
- Secrets stay server-side in environment variables or secret stores and are never exposed through `NEXT_PUBLIC_*` variables.
- Data minimization: the product stores aggregated analytics required for decision support, not Roblox passwords, source code, private messages, or unnecessary player-level personal data.
- Evidence before explanation: AI receives bounded evidence bundles instead of unrestricted raw data.

## Secrets

Required secrets such as `ROBLOX_API_KEY` and `OPENAI_API_KEY` must be injected at runtime through environment variables or the hosting platform's secret manager. Secrets must not be committed to Git, logged, returned by API responses, or embedded in frontend bundles.

Recommended rotation: every 90 days and immediately after any suspected exposure.

## Transport and browser security

- HTTPS is required in production.
- API and web responses set anti-sniffing, anti-framing, referrer and permissions-policy headers.
- The frontend adds HSTS for production HTTPS traffic.
- API CORS is an explicit allow-list configured through `CORS_ORIGINS`; wildcard production origins are not part of the baseline.

## Abuse protection

Write endpoints are protected by an in-process per-client/per-route request limiter. The default is 60 write requests per minute. This is a baseline for pilot traffic; distributed production scaling should move the limiter to shared infrastructure.

## Input validation

External request bodies use typed Pydantic models with bounded lengths, enums and numeric ranges. Unknown operational secrets are not accepted through public product forms.

## Data retention

Pilot baseline:

- Aggregated metric observations: retain up to 13 months to support year-over-year and historical-baseline analysis.
- Pilot feedback: retain up to 12 months unless the studio requests earlier deletion.
- Application/security logs: target 30 days unless a security incident requires temporary preservation.
- API credentials: retained only while an integration is active; delete/revoke immediately when disconnected.

Retention jobs are an R10/R11 operational concern; these limits define the product policy now so implementation cannot silently become indefinite retention.

## Deletion and disconnect

A studio disconnect must revoke or delete stored integration credentials and stop future ingestion. Customer-requested deletion must remove customer-scoped stored observations and pilot feedback from active storage, subject only to legally required records.

## AI data boundary

Only structured evidence needed for the requested analyst output should be sent to the model provider. Roblox credentials are never included in prompts. The model is not permitted to invent unsupported metrics or claim causality beyond the evidence bundle.

## Known pilot limitations

- The current rate limiter is process-local rather than distributed.
- Full tenant authentication/authorization and automated retention deletion are go-live controls, not claimed as complete in the pilot baseline.
- Pricing remains validation pricing and is unrelated to security guarantees.
