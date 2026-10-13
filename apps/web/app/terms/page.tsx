import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Early-access terms for the PlayDirective founding-studio pilot.",
};

const sections = [
  [
    "Early-access service",
    "PlayDirective is currently offered as an early-access founding-studio pilot. Features, limits, integrations and pricing may change while product reliability and commercial fit are being validated.",
  ],
  [
    "Decision support, not guarantees",
    "Recommendations, priorities, analyst explanations and experiment proposals are decision-support outputs. They do not guarantee retention, revenue, engagement or any other commercial result.",
  ],
  [
    "Connected Roblox access",
    "A studio remains responsible for the Roblox credentials and permissions it chooses to provide. PlayDirective is designed for least-privilege, read-only analytics access and does not require permission to edit or publish the connected experience.",
  ],
  [
    "Founding-studio pilot",
    "The guided 30-day founding-studio pilot is currently offered at no charge during validation. Any paid subscription would require a separate explicit agreement after the pilot; no payment is collected through the current early-access site.",
  ],
  [
    "Availability",
    "The early-access service may be changed, paused or withdrawn while reliability, security, provider integrations and commercial fit are being validated.",
  ],
  [
    "Acceptable use",
    "Do not use PlayDirective to access data you are not authorized to access, attempt to bypass security controls, interfere with the service, or submit real secrets through public demo fields.",
  ],
  [
    "Third-party services",
    "PlayDirective relies on third-party services and APIs, including Roblox services and configured infrastructure or AI providers. Availability or behavior of those services may affect the pilot experience.",
  ],
  [
    "Commercial release",
    "Formal commercial terms, support commitments and any customer-specific contractual requirements will be finalized before a general-availability paid release.",
  ],
] as const;

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← PlayDirective</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Early Access · Terms</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Terms</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>These terms describe the current operating baseline for the PlayDirective founding-studio pilot before a general-availability commercial release.</p>

        {sections.map(([title, copy]) => (
          <section key={title} style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
            <p style={{ margin: "10px 0 0", color: "#9fb1c7", lineHeight: 1.75 }}>{copy}</p>
          </section>
        ))}

        <p style={{ marginTop: 38, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>Last updated: 13 October 2026 · Founding-studio pilot baseline.</p>
      </section>
    </main>
  );
}
