const sprints = [
  ["R0", "Product foundation", "DONE"],
  ["R1", "Validation experience", "DONE"],
  ["R2", "SaaS foundation", "DONE"],
  ["R3", "Roblox data connection", "DONE"],
  ["R4", "Decision Engine v1", "DONE"],
  ["R5", "AI Product Analyst", "DONE"],
  ["R6", "Experiment Copilot", "DONE"],
  ["R7", "Pilot readiness", "IN PROGRESS"],
  ["R8", "Commercial readiness", "PLANNED"],
  ["R9", "Security & privacy", "PLANNED"],
  ["R10", "Reliability", "PLANNED"],
  ["R11", "Go-Live", "PLANNED"],
  ["R12", "Portfolio closure", "PLANNED"],
] as const;

const capabilities = ["Roblox Open Cloud", "Product Analytics", "Decision Intelligence", "FastAPI", "PostgreSQL", "AI Agents", "Experimentation", "Next.js"];

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(64px, 12vw, 80px) clamp(20px, 5vw, 24px) 44px" }}>
        <a href="/" style={{ color: "#67e8f9", fontSize: 14, textDecoration: "none" }}>← Roblox Decision Engine</a>
        <div style={{ marginTop: 32, display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: "clamp(10px, 2.8vw, 12px)", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Portfolio Case Study · Active Build</div>
            <h1 style={{ margin: "16px 0 0", fontSize: "clamp(42px, 11vw, 58px)", lineHeight: 0.98, letterSpacing: "-.05em" }}>Roblox Decision Engine</h1>
            <p style={{ marginTop: 22, maxWidth: 760, color: "#9fb1c7", fontSize: "clamp(17px, 4.5vw, 19px)", lineHeight: 1.62 }}>AI Product & Growth Analyst for Roblox studios. The product turns retention, monetization and funnel signals into prioritized, evidence-backed actions and experiment decisions.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>{capabilities.map((item) => <span key={item} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.03)", borderRadius: 999, padding: "7px 10px", fontSize: 12, color: "#c7d5e5" }}>{item}</span>)}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}><a href="/demo" style={{ background: "#67e8f9", color: "#07101f", padding: "11px 14px", borderRadius: 11, fontWeight: 800, textDecoration: "none", fontSize: 13 }}>Open validation demo</a><a href="/demo/analyst" style={{ border: "1px solid rgba(103,232,249,.24)", color: "#a5f3fc", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>View AI Analyst</a><a href="/demo/experiment" style={{ border: "1px solid rgba(255,255,255,.12)", color: "#eef7ff", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>View Experiment Copilot</a></div>
          </div>
          <aside style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 22 }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Current readiness</div>
            <div style={{ marginTop: 12, fontSize: "clamp(26px, 7vw, 31px)", fontWeight: 700, color: "#a5f3fc" }}>R7 active</div>
            <div style={{ marginTop: 8, color: "#9fb1c7", fontSize: 14 }}>Experiment Copilot is complete with deterministic plan generation, guardrails, success thresholds and Ship / Iterate / Stop interpretation. Pilot readiness is now active.</div>
            <div style={{ marginTop: 22, height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><div style={{ width: "77%", height: "100%", background: "#67e8f9" }} /></div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12, color: "#718198", fontSize: 12 }}><span>7 done · R7 active</span><span>77%</span></div>
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "20px clamp(20px, 5vw, 24px)" }}>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[["Validation", "100%", "Landing page and clickable validation experience complete"],["Product", "100%", "Decision Engine, grounded AI Analyst and Experiment Copilot implemented"],["Engineering", "98%", "Roblox ingestion, deterministic decision path, model fallback and experiment rules validated"],["Commercial", "15%", "Pilot positioning defined; pilot onboarding and commercial validation now active"]].map(([label, value, copy]) => <article key={label} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 20, padding: 20 }}><div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 10, fontSize: 30, fontWeight: 700 }}>{value}</div><p style={{ color: "#9fb1c7", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px clamp(20px, 5vw, 24px) 20px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Product Thesis</div><h2 style={{ marginTop: 12, maxWidth: 850, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Roblox tells studios what happened. The Decision Engine tells them what to do next.</h2><p style={{ maxWidth: 840, color: "#9fb1c7", fontSize: 16, lineHeight: 1.75 }}>The system validates metric changes deterministically, compares baselines and segments, generates a structured evidence bundle and only then lets the AI layer explain the finding. Supported findings can be turned into bounded experiments with explicit success thresholds and guardrails.</p></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Architecture</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Thin analytics layer. Strong decision layer.</h2><div style={{ marginTop: 24, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>{["Roblox Analytics", "Query Adapter", "Metric Normalization", "PostgreSQL", "Decision Engine", "Evidence Bundle", "AI Analyst", "Experiment Copilot"].map((item, index) => <div key={item} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 18, padding: 15, textAlign: "center", color: "#c7d5e5", fontSize: 13 }}><div style={{ color: "#52627a", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</div><div style={{ marginTop: 7 }}>{item}</div></div>)}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px) 80px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Delivery</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Sprint path to paid Go-Live</h2><div style={{ marginTop: 24, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden" }}>{sprints.map(([id, title, status], index) => <div key={id} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", gap: 10, alignItems: "center", padding: "14px", borderTop: index ? "1px solid rgba(255,255,255,.08)" : "none" }}><div style={{ color: "#67e8f9", fontFamily: "monospace", fontSize: 13 }}>{id}</div><div style={{ color: "#dce8f5", fontSize: 13 }}>{title}</div><div style={{ borderRadius: 999, padding: "5px 7px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", color: status === "DONE" ? "#a7f3d0" : status === "IN PROGRESS" ? "#a5f3fc" : "#718198", background: status === "DONE" ? "rgba(52,211,153,.1)" : status === "IN PROGRESS" ? "rgba(103,232,249,.1)" : "rgba(255,255,255,.035)" }}>{status}</div></div>)}</div></section>
    </main>
  );
}
