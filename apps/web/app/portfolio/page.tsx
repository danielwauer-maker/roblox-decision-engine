const sprints = [
  ["R0", "Product foundation", "DONE"],
  ["R1", "Validation experience", "IN PROGRESS"],
  ["R2", "SaaS foundation", "DONE"],
  ["R3", "Roblox data connection", "IN PROGRESS"],
  ["R4", "Decision Engine v1", "PLANNED"],
  ["R5", "AI Product Analyst", "PLANNED"],
  ["R6", "Experiment Copilot", "PLANNED"],
  ["R7", "Pilot readiness", "PLANNED"],
  ["R8", "Commercial readiness", "PLANNED"],
  ["R9", "Security & privacy", "PLANNED"],
  ["R10", "Reliability", "PLANNED"],
  ["R11", "Go-Live", "PLANNED"],
  ["R12", "Portfolio closure", "PLANNED"],
] as const;

const capabilities = [
  "Roblox Open Cloud",
  "Product Analytics",
  "Decision Intelligence",
  "FastAPI",
  "PostgreSQL",
  "AI Agents",
  "Experimentation",
  "Next.js",
];

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 24px 48px" }}>
        <a href="/" style={{ color: "#67e8f9", fontSize: 14, textDecoration: "none" }}>← Roblox Decision Engine</a>
        <div style={{ marginTop: 36, display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Portfolio Case Study · Active Build</div>
            <h1 style={{ margin: "16px 0 0", fontSize: 58, lineHeight: 1.02, letterSpacing: "-.05em" }}>Roblox Decision Engine</h1>
            <p style={{ marginTop: 22, maxWidth: 760, color: "#9fb1c7", fontSize: 19, lineHeight: 1.7 }}>
              AI Product & Growth Analyst for Roblox studios. The product turns retention, monetization and funnel signals into prioritized, evidence-backed actions and experiment proposals.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
              {capabilities.map((item) => (
                <span key={item} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.03)", borderRadius: 999, padding: "7px 11px", fontSize: 12, color: "#c7d5e5" }}>{item}</span>
              ))}
            </div>
          </div>

          <aside style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 24 }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Current readiness</div>
            <div style={{ marginTop: 12, fontSize: 31, fontWeight: 700, color: "#a5f3fc" }}>R1 + R3 active</div>
            <div style={{ marginTop: 8, color: "#9fb1c7", fontSize: 14 }}>Validation experience + live Roblox data integration</div>
            <div style={{ marginTop: 24, height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{ width: "31%", height: "100%", background: "#67e8f9" }} />
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", color: "#718198", fontSize: 12 }}>
              <span>2 done · 2 active · 9 planned</span><span>31%</span>
            </div>
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            ["Validation", "45%", "Research, product thesis and validation flow established"],
            ["Product", "40%", "Decision-first V1 workflow defined"],
            ["Engineering", "40%", "SaaS foundation complete; analytics adapter tested"],
            ["Commercial", "5%", "Pricing remains a validation hypothesis"],
          ].map(([label, value, copy]) => (
            <article key={label} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 20, padding: 20 }}>
              <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 700 }}>{value}</div>
              <p style={{ color: "#9fb1c7", fontSize: 13, lineHeight: 1.65 }}>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 24px 24px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Product Thesis</div>
        <h2 style={{ marginTop: 12, maxWidth: 850, fontSize: 40, letterSpacing: "-.035em" }}>Roblox tells studios what happened. The Decision Engine tells them what to do next.</h2>
        <p style={{ maxWidth: 840, color: "#9fb1c7", fontSize: 16, lineHeight: 1.8 }}>
          The system validates metric changes deterministically, compares baselines and segments, generates a structured evidence bundle and only then lets the AI layer explain the finding and propose an experiment. Unsupported metrics or causal claims are not allowed.
        </p>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Architecture</div>
        <h2 style={{ marginTop: 12, fontSize: 40, letterSpacing: "-.035em" }}>Thin analytics layer. Strong decision layer.</h2>
        <div style={{ marginTop: 28, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          {["Roblox Analytics", "Query Adapter", "Metric Normalization", "PostgreSQL", "Decision Engine", "Evidence Bundle", "AI Analyst", "Actions / Experiments"].map((item, index) => (
            <div key={item} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 18, padding: 16, textAlign: "center", color: "#c7d5e5", fontSize: 13 }}>
              <div style={{ color: "#52627a", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</div>
              <div style={{ marginTop: 7 }}>{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px 88px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Delivery</div>
        <h2 style={{ marginTop: 12, fontSize: 40, letterSpacing: "-.035em" }}>Sprint path to paid Go-Live</h2>
        <div style={{ marginTop: 28, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden" }}>
          {sprints.map(([id, title, status], index) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 16, alignItems: "center", padding: "15px 18px", borderTop: index ? "1px solid rgba(255,255,255,.08)" : "none" }}>
              <div style={{ color: "#67e8f9", fontFamily: "monospace" }}>{id}</div>
              <div style={{ color: "#dce8f5", fontSize: 14 }}>{title}</div>
              <div style={{ borderRadius: 999, padding: "6px 9px", fontSize: 10, fontWeight: 700, color: status === "DONE" ? "#a7f3d0" : status === "IN PROGRESS" ? "#a5f3fc" : "#718198", background: status === "DONE" ? "rgba(52,211,153,.1)" : status === "IN PROGRESS" ? "rgba(103,232,249,.1)" : "rgba(255,255,255,.035)" }}>{status}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
