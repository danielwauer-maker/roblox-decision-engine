import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the Roblox Decision Engine early-access validation environment.",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← Roblox Decision Engine</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Early Access · Privacy</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Privacy</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>Roblox Decision Engine is currently an early-access validation product. The public demo uses simulated data. Real Roblox analytics are only processed when a studio explicitly connects an authorized experience.</p>

        {[
          ["What we process", "For a connected experience, the product is designed to read aggregated Roblox analytics needed for product decision support, such as retention, engagement and monetization signals. The product does not require Roblox player passwords or write access to the connected experience."],
          ["Access model", "Roblox data access is designed around least-privilege, read-only credentials. Product secrets are kept server-side and are not intentionally exposed to the browser."],
          ["AI processing", "Structured evidence may be sent to the configured AI provider to generate grounded analyst prose. The deterministic decision layer remains authoritative for metrics and scoring, and the system includes guardrails against unsupported numeric or causal claims."],
          ["Data retention", "Early-access retention is intentionally limited to what is needed for product validation, decision history and reliability. Pilot data should be deleted when it is no longer needed for the active validation relationship."],
          ["Demo data", "The public demo is simulated and should not be interpreted as a live studio account or as production Roblox analytics."],
          ["Early-access status", "This page documents the current product design baseline and is not a substitute for a studio-specific data processing agreement. Commercial legal terms will be finalized before general availability."],
        ].map(([title, copy]) => (
          <section key={title} style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
            <p style={{ margin: "10px 0 0", color: "#9fb1c7", lineHeight: 1.75 }}>{copy}</p>
          </section>
        ))}

        <p style={{ marginTop: 38, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>Last updated: 12 October 2026 · Early-access validation baseline.</p>
      </section>
    </main>
  );
}
