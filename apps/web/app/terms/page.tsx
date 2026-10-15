import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Founding-pilot and subscription terms baseline for PlayDirective.",
};

const sections = [
  ["Service", "PlayDirective is a decision-intelligence service for Roblox studios. Recommendations, priorities, AI explanations, experiment proposals and reports are decision-support outputs and do not guarantee retention, revenue, engagement or any other commercial result."],
  ["30-day founding pilot", "Approved founding studios receive a guided 30-day pilot at no charge. The pilot begins when the private workspace is first activated. No payment method is required for the Pilot and the pilot does not automatically become a paid subscription."],
  ["Paid subscriptions", "After the pilot, an authorized workspace owner may explicitly choose a paid PlayDirective plan through hosted Stripe Checkout. A paid subscription begins only after the customer confirms the checkout. Available plans, experience limits, billing interval and current prices are shown before purchase."],
  ["Plan limits", "Indie, Growth and Studio plans currently allow 1, 3 and 10 active Roblox experiences respectively. Limits are enforced server-side. Plan features and limits may be changed for future billing periods with appropriate notice where required."],
  ["Billing and cancellation", "Payment processing is provided through Stripe. Customers can use the hosted Customer Portal for supported billing actions such as payment-method management and cancellation. When cancellation at period end is selected, access continues until the end of the paid billing period unless otherwise required."],
  ["Connected Roblox access", "A studio remains responsible for the Roblox credentials and permissions it provides. PlayDirective is designed for least-privilege, read-only analytics access and does not require permission to edit or publish a connected Roblox experience. Credentials must only be entered inside the private workspace."],
  ["Customer responsibilities", "Customers must have authority to connect the Roblox experiences and data they submit, keep their account access secure, use least-privilege credentials, and not attempt to bypass security controls or access another studio's data."],
  ["Availability and third parties", "PlayDirective relies on infrastructure and third-party services including Roblox, hosting, email, AI and payment providers. Their availability may affect the service. During the founding phase, service levels are provided on a reasonable-efforts basis unless a separate written agreement states otherwise."],
  ["Data and privacy", "Processing of account, pilot, analytics and billing information is described in the PlayDirective Privacy Notice. Customer-specific data-processing terms can be agreed where legally or contractually required."],
  ["Pilot changes or termination", "During the founding phase, PlayDirective may reject an application, pause a workspace, extend a pilot or end access for security, abuse, legal or operational reasons. A studio may stop the pilot and revoke its Roblox credential at any time."],
  ["Commercial status", "These terms are the operating baseline for the founding-studio release and should be reviewed together with the applicable checkout details and any customer-specific agreement. Mandatory statutory rights are not excluded."],
] as const;

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← PlayDirective</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Founding Release · Terms</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Terms</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>These terms describe the operating baseline for the 30-day Founding Pilot and the optional paid subscription that can follow it.</p>
        {sections.map(([title, copy]) => <section key={title} style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}><h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2><p style={{ margin: "10px 0 0", color: "#9fb1c7", lineHeight: 1.75 }}>{copy}</p></section>)}
        <p style={{ marginTop: 38, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>Last updated: 13 October 2026 · Founding-studio commercial baseline.</p>
      </section>
    </main>
  );
}
