import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Early-access terms for Roblox Decision Engine.",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← Roblox Decision Engine</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Early Access · Terms</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Terms</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>Roblox Decision Engine is currently an early-access product used for validation, pilot testing and portfolio demonstration. These terms describe the current operating baseline before general availability.</p>

        {[
          ["Early-access service", "Features, limits and pricing may change while the product is being validated. The public demo is provided for evaluation and may use simulated data."],
          ["Decision support, not guarantees", "Recommendations, priorities and experiments are decision-support outputs. They do not guarantee retention, revenue, engagement or any other commercial result."],
          ["Connected Roblox access", "A studio remains responsible for the Roblox credentials and permissions it chooses to provide. The product is designed for least-privilege, read-only analytics access."],
          ["Pilot pricing", "The guided early-access pilot is currently offered at no charge. Any paid subscription would require a separate explicit agreement after the pilot; no payment is collected through the current validation site."],
          ["Availability", "The early-access service may be changed, paused or withdrawn while reliability, security and commercial fit are being validated."],
          ["Acceptable use", "Do not use the service to access data you are not authorized to access, attempt to bypass security controls, or submit secrets through public demo fields."],
          ["General availability", "Formal commercial terms, support commitments and any studio-specific contractual requirements will be finalized before a general-availability release."],
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
