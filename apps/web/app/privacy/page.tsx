import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the PlayDirective early-access pilot.",
};

const sections = [
  [
    "What we process",
    "For a connected Roblox experience, PlayDirective is designed to process aggregated analytics needed for product decision support, including retention, engagement, funnel and monetization signals. PlayDirective does not require a Roblox password or write access to the connected experience.",
  ],
  [
    "Access model",
    "Roblox data access is designed around least-privilege, read-only credentials. Connection credentials are handled server-side, encrypted before storage and are not returned to browser JavaScript or the operator console.",
  ],
  [
    "AI processing",
    "Structured evidence may be sent to the configured AI provider to generate grounded analyst explanations. Deterministic metrics, evidence and priority logic remain authoritative, and the product is designed to avoid unsupported numeric or causal claims.",
  ],
  [
    "Pilot workspaces",
    "Each studio pilot uses a tenant-isolated workspace, session and analytics path. A studio's connected analytics are not intended to become evidence for another studio.",
  ],
  [
    "Data retention",
    "During early access, data is retained only as needed for the active pilot, decision history, reliability and product validation. Pilot data should be removed when it is no longer needed for the active validation relationship, subject to any legal retention obligations that may apply.",
  ],
  [
    "Public demo data",
    "The public PlayDirective demo uses simulated data unless explicitly stated otherwise. Demo metrics should not be interpreted as live customer analytics.",
  ],
  [
    "Early-access status",
    "This page describes the current technical privacy baseline for the founding-studio pilot. It is not a substitute for any customer-specific data-processing agreement that may be required for a later commercial engagement.",
  ],
] as const;

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← PlayDirective</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Early Access · Privacy</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Privacy</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>PlayDirective is an early-access decision-intelligence product for Roblox studios. Real Roblox analytics are processed only when an authorized studio explicitly connects an experience.</p>

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
