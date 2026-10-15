import type { Metadata } from "next";
import { LegalBody, LegalSection, LegalShell } from "../_components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the PlayDirective founding-studio service.",
};

const sections = [
  ["controller", "Controller and contact", "The operator identified in the PlayDirective Legal Notice is responsible for the service unless a separate agreement states otherwise. Privacy and service questions can be sent to the contact address published there."],
  ["applications", "Pilot applications", "When you apply for a founding pilot, PlayDirective processes the contact name, email address, studio name, optional Roblox experience information, optional monthly-active-user range and your message. We also store campaign attribution such as UTM parameters, landing page and referrer so we can understand which acquisition channels create qualified pilot applications."],
  ["accounts", "Workspace accounts and authentication", "Approved studios receive tenant-isolated workspace access. Account email addresses, roles, invitation records, passwordless sign-in links and session records are processed to provide and secure access. Invitation, login and session tokens are stored as hashes where applicable."],
  ["roblox", "Roblox analytics and credentials", "For a connected Roblox experience, PlayDirective processes aggregated analytics needed for product decision support, including retention, engagement, funnel and monetization signals. PlayDirective does not require a Roblox password or write access. Open Cloud credentials are handled server-side, encrypted before storage and are not returned to browser JavaScript or the operator console."],
  ["ai", "AI processing", "Structured tenant evidence may be sent to the configured AI provider to generate grounded analyst explanations. Deterministic metrics, evidence and priority logic remain authoritative. PlayDirective is designed not to send Roblox API credentials to the AI provider."],
  ["email", "Email and lifecycle messages", "PlayDirective processes the account or application email address to send transactional messages such as application confirmations, workspace invitations, passwordless sign-in links, connection-attention messages, pilot lifecycle reminders and optional experiment or Weekly Brief notifications. Optional lifecycle notifications can be disabled inside the workspace."],
  ["billing", "Billing", "If an authorized workspace owner chooses a paid plan, PlayDirective stores subscription identifiers and status needed to enforce access and plan limits. Payment details are processed through Stripe-hosted checkout and billing surfaces; PlayDirective is not designed to receive raw card numbers."],
  ["hosting", "Hosting and service providers", "The production application, API and PostgreSQL database are intended to run on the PlayDirective Hetzner server in Germany. The service also relies on specialist providers for Roblox analytics, AI processing, transactional email and payment processing. Provider-specific processing and international-transfer safeguards must be assessed and maintained as part of the commercial service configuration."],
  ["isolation", "Tenant isolation", "Each studio has its own organization, users, sessions, Roblox connections, observations, decision context and pilot state. Tenant boundaries are enforced server-side and tested with cross-tenant isolation scenarios."],
  ["security", "Security and logs", "PlayDirective uses encrypted credentials, server-side secret boundaries, secure session cookies, request observability, rate limiting and production health checks. Technical logs may contain request metadata needed for security, reliability and troubleshooting but should not intentionally contain Roblox API credentials."],
  ["retention", "Retention and deletion", "Application, workspace, analytics, lifecycle and billing records are retained only as long as needed for the pilot or customer relationship, security, reliability, accounting or other applicable legal obligations. Pilot data should be deleted or anonymized when it is no longer needed, subject to required retention periods."],
  ["demo", "Public demo", "The public PlayDirective demo uses simulated data unless explicitly stated otherwise. Demo metrics are not live customer analytics."],
  ["rights", "Your rights", "Depending on applicable data-protection law, individuals may have rights including access, rectification, deletion, restriction, portability and objection, as well as the right to complain to a competent supervisory authority. Requests can be sent to the contact address in the Legal Notice."],
  ["marketing", "Marketing technology", "The founding release is designed to support campaign measurement through server-side UTM/referrer attribution without requiring advertising pixels. If non-essential tracking or remarketing technology is added later, the privacy and consent setup must be updated before activation."],
] as const;

export default function PrivacyPage() {
  const toc = sections.map(([id, title]) => ({ id, label: title }));
  return (
    <LegalShell eyebrow="Founding release · Privacy" title="Privacy" intro="PlayDirective processes only the information needed to review pilot applications, operate private studio workspaces, generate decision support, communicate with customers and administer optional subscriptions." updated="Last updated · 13 Oct 2026">
      <LegalBody
        toc={toc}
        highlights={[
          { label: "Credentials", text: "Roblox credentials stay server-side, encrypted and outside browser JavaScript." },
          { label: "Hosting", text: "Production application, API and database are intended to run on the PlayDirective Hetzner server in Germany." },
          { label: "Isolation", text: "Studio data is separated by tenant boundaries enforced server-side." },
        ]}
      >
        {sections.map(([id, title, copy]) => <LegalSection id={id} title={title} key={id}>{copy}</LegalSection>)}
        <div style={{ marginTop: 8, color: "#718198", fontSize: 12, lineHeight: 1.65 }}>Founding-studio commercial baseline. This notice should be reviewed before materially changing providers, tracking technologies or categories of personal data.</div>
      </LegalBody>
    </LegalShell>
  );
}
