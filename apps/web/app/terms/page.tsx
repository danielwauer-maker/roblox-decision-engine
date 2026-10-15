import type { Metadata } from "next";
import { LegalBody, LegalSection, LegalShell } from "../_components/legal-shell";

export const metadata: Metadata = {
  title: "Terms",
  description: "Founding-pilot and subscription terms baseline for PlayDirective.",
};

const sections = [
  ["service", "Service", "PlayDirective is a decision-intelligence service for Roblox studios. Recommendations, priorities, AI explanations, experiment proposals and reports are decision-support outputs and do not guarantee retention, revenue, engagement or any other commercial result."],
  ["pilot", "30-day founding pilot", "Approved founding studios receive a guided 30-day pilot at no charge. The pilot begins when the private workspace is first activated. No payment method is required for the free pilot and the pilot does not automatically become a paid subscription."],
  ["subscriptions", "Paid subscriptions", "After the pilot, an authorized workspace owner may explicitly choose a paid PlayDirective plan through hosted Stripe Checkout. A paid subscription begins only after the customer confirms the checkout. Available plans, experience limits, billing interval and current prices are shown before purchase."],
  ["limits", "Plan limits", "Indie, Growth and Studio plans currently allow 1, 3 and 10 active Roblox experiences respectively. Limits are enforced server-side. Plan features and limits may be changed for future billing periods with appropriate notice where required."],
  ["billing", "Billing and cancellation", "Payment processing is provided through Stripe. Customers can use the hosted Customer Portal for supported billing actions such as payment-method management and cancellation. When cancellation at period end is selected, access continues until the end of the paid billing period unless otherwise required."],
  ["roblox", "Connected Roblox access", "A studio remains responsible for the Roblox credentials and permissions it provides. PlayDirective is designed for least-privilege, read-only analytics access and does not require permission to edit or publish a connected Roblox experience. Credentials must only be entered inside the private workspace."],
  ["responsibilities", "Customer responsibilities", "Customers must have authority to connect the Roblox experiences and data they submit, keep their account access secure, use least-privilege credentials, and not attempt to bypass security controls or access another studio's data."],
  ["availability", "Availability and third parties", "PlayDirective relies on infrastructure and third-party services including Roblox, hosting, email, AI and payment providers. Their availability may affect the service. During the founding phase, service levels are provided on a reasonable-efforts basis unless a separate written agreement states otherwise."],
  ["privacy", "Data and privacy", "Processing of account, pilot, analytics and billing information is described in the PlayDirective Privacy Notice. Customer-specific data-processing terms can be agreed where legally or contractually required."],
  ["termination", "Pilot changes or termination", "During the founding phase, PlayDirective may reject an application, pause a workspace, extend a pilot or end access for security, abuse, legal or operational reasons. A studio may stop the pilot and revoke its Roblox credential at any time."],
  ["status", "Commercial status", "These terms are the operating baseline for the founding-studio release and should be reviewed together with the applicable checkout details and any customer-specific agreement. Mandatory statutory rights are not excluded."],
] as const;

export default function TermsPage() {
  const toc = sections.map(([id, title]) => ({ id, label: title }));
  return (
    <LegalShell eyebrow="Founding release · Terms" title="Terms" intro="These terms describe the operating baseline for the free 30-day founding pilot and the optional paid subscription that can follow it." updated="Last updated · 13 Oct 2026">
      <LegalBody
        toc={toc}
        highlights={[
          { label: "Pilot", text: "30 days, guided, free during validation and no automatic paid conversion." },
          { label: "Access", text: "PlayDirective is designed around read-only Roblox analytics access." },
          { label: "Billing", text: "Paid service starts only after an authorized owner explicitly confirms checkout." },
        ]}
      >
        {sections.map(([id, title, copy]) => <LegalSection id={id} title={title} key={id}>{copy}</LegalSection>)}
        <div style={{ marginTop: 8, color: "#718198", fontSize: 12, lineHeight: 1.65 }}>Founding-studio commercial baseline.</div>
      </LegalBody>
    </LegalShell>
  );
}
