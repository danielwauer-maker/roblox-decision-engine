# Security & Privacy Baseline

## Principles

- Least privilege: Roblox access is read-only analytics access only.
- Secrets stay server-side and are never exposed through `NEXT_PUBLIC_*` variables.
- Data minimization: the product stores aggregated analytics required for decision support, not Roblox passwords, source code, private messages, or unnecessary player-level personal data.
- Evidence before explanation: AI receives bounded evidence bundles instead of unrestricted raw data.

## Secrets and credentials

Platform secrets such as `OPENAI_API_KEY`, Resend, Stripe and operator/admin credentials are injected at runtime through the production environment and must not be committed to Git, logged, returned by API responses, or embedded in frontend bundles.

Roblox Open Cloud credentials are tenant-scoped. They are accepted only inside the authenticated private workspace, encrypted before database storage, decrypted server-side only for an entitled connection, and are not returned to browser JavaScript or the operator console.

Recommended secret rotation: every 90 days and immediately after any suspected exposure. A studio-controlled Roblox credential can be revoked at any time in Roblox.

## Tenant authentication and authorization

- Private workspaces use tenant-scoped users and sessions.
- Workspace invitations and passwordless sign-in links are opaque, hashed at rest where applicable, expire, and are single-use.
- Sessions can be revoked; disabled studios/users are denied access.
- OWNER/MEMBER authorization is enforced server-side for privileged operations.
- Cross-tenant access is denied and covered by isolation regression tests.
- Experience access is evaluated against organization ownership, active state and plan entitlement before stored Roblox credentials are decrypted or a provider call is attempted.

## Transport and browser security

- HTTPS is required in production.
- API and web responses set anti-sniffing, anti-framing, referrer and permissions-policy headers.
- The frontend adds HSTS for production HTTPS traffic.
- API CORS is an explicit allow-list configured through `CORS_ORIGINS`; wildcard production origins are not part of the baseline.
- Production web/API ports are loopback-bound behind the HTTPS reverse proxy; PostgreSQL is Docker-network internal and is not publicly published.

## Abuse protection

Write endpoints are protected by an in-process per-client/per-route request limiter. The default is 60 write requests per minute. This is appropriate for the founding-studio traffic model; distributed production scaling should move the limiter to shared infrastructure.

## Input validation

External request bodies use typed Pydantic models with bounded lengths, enums and numeric ranges. Unknown operational secrets are not accepted through public product forms.

## Data retention

Founding-release policy baseline:

- Aggregated metric observations: retain up to 13 months to support year-over-year and historical-baseline analysis.
- Pilot feedback: retain up to 12 months unless the studio requests earlier deletion.
- Application/security logs: target 30 days unless a security incident requires temporary preservation.
- API credentials: retained only while an integration is active; delete/revoke when disconnected or when the customer relationship no longer requires them.

Automated retention deletion remains an operational follow-up unless separately documented as deployed. The policy above is the governing retention target and customer-requested deletion must be handled when applicable.

## Deletion and disconnect

A studio disconnect must stop future ingestion and remove or invalidate the stored integration credential when the connection is removed. Customer-requested deletion must remove customer-scoped stored observations and pilot feedback from active storage, subject only to legally required records.

## AI data boundary

Only structured evidence needed for the requested analyst output should be sent to the model provider. Roblox credentials are never included in prompts. Deterministic metrics, evidence and priority calculations remain authoritative. Model output that is unavailable, malformed or fails grounding validation falls back to deterministic analyst output rather than inventing unsupported values.

## Current founding-release limitations

- The rate limiter is process-local rather than distributed.
- Automated retention deletion is not claimed as deployed unless production evidence explicitly says otherwise.
- Provider availability can affect live Roblox ingestion, transactional email, AI prose and billing, with controlled failure/fallback behavior documented in the reliability baseline.
