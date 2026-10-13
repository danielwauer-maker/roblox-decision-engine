const sprints = [
  ["R0", "Product foundation", "DONE"],
  ["R1", "Validation experience", "DONE"],
  ["R2", "SaaS foundation", "DONE"],
  ["R3", "Roblox data connection", "DONE"],
  ["R4", "Decision Engine v1", "DONE"],
  ["R5", "AI Product Analyst", "DONE"],
  ["R6", "Experiment Copilot", "DONE"],
  ["R7", "Pilot readiness", "DONE"],
  ["R8", "Commercial readiness", "DONE"],
  ["R9", "Security & privacy", "DONE"],
  ["R10", "Reliability", "DONE"],
  ["R11", "Go-Live", "DONE"],
  ["R12", "Portfolio closure", "DONE"],
] as const;

const capabilities = ["Roblox Open Cloud", "Product Analytics", "Decision Intelligence", "FastAPI", "PostgreSQL", "AI Agents", "Experimentation", "Next.js"];

const proofPoints = [
  ["39", "backend tests", "Reliability gate passed with the full backend suite."],
  ["2", "live providers", "Roblox analytics and OpenAI model paths both passed live smoke validation."],
  ["0", "frontend vulnerabilities", "Dependency audit was cleared after the Next.js security upgrade."],
  ["15", "launch routes", "Landing, product demo, pilot, portfolio and public release metadata are included in the production route manifest."],
];

const roadmapPhases = [
  ["2A", "Private workspace parity", "IN PROGRESS", "Bring the invited customer workspace to the same decision workflow as the demo: priorities, evidence, analyst, investigation, experiment and weekly brief."],
  ["2B", "Pilot progress state machine", "NEXT", "Replace internal QA concepts with a dynamic customer journey: connect, sync, review priority, build experiment and complete the first weekly review."],
  ["3", "Notifications & lifecycle", "PLANNED", "Pilot request, invite, activation, sync alerts, experiment milestones and Weekly Report email delivery."],
  ["4", "Subscription & billing", "PLANNED", "Convert validated pilots to paid plans with hosted checkout, manage-subscription portal, invoices and plan entitlements."],
] as const;

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(64px, 12vw, 80px) clamp(20px, 5vw, 24px) 44px" }}>
        <a href="/" style={{ color: "#67e8f9", fontSize: 14, textDecoration: "none" }}>← PlayDirective</a>
        <div style={{ marginTop: 32, display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: "clamp(10px, 2.8vw, 12px)", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Portfolio Case Study · Active Product Delivery</div>
            <h1 style={{ margin: "16px 0 0", fontSize: "clamp(42px, 11vw, 58px)", lineHeight: 0.98, letterSpacing: "-.05em" }}>PlayDirective</h1>
            <p style={{ marginTop: 22, maxWidth: 760, color: "#9fb1c7", fontSize: "clamp(17px, 4.5vw, 19px)", lineHeight: 1.62 }}>Decision intelligence for Roblox studios. PlayDirective turns retention, monetization and funnel signals into prioritized, evidence-backed actions and experiment decisions.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>{capabilities.map((item) => <span key={item} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.03)", borderRadius: 999, padding: "7px 10px", fontSize: 12, color: "#c7d5e5" }}>{item}</span>)}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}><a href="/demo" style={{ background: "#67e8f9", color: "#07101f", padding: "11px 14px", borderRadius: 11, fontWeight: 800, textDecoration: "none", fontSize: 13 }}>Open validation demo</a><a href="/pricing" style={{ border: "1px solid rgba(103,232,249,.24)", color: "#a5f3fc", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>View pricing</a><a href="/demo/pilot" style={{ border: "1px solid rgba(255,255,255,.12)", color: "#eef7ff", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>View pilot flow</a></div>
          </div>
          <aside style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 22 }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Foundation delivery</div>
            <div style={{ marginTop: 12, fontSize: "clamp(26px, 7vw, 31px)", fontWeight: 700, color: "#a5f3fc" }}>R0–R12 complete</div>
            <div style={{ marginTop: 8, color: "#9fb1c7", fontSize: 14 }}>The original product, engineering, security and launch gates are complete. Post-launch work now focuses on private workspace parity, pilot lifecycle, notifications and commercial conversion.</div>
            <div style={{ marginTop: 22, height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><div style={{ width: "100%", height: "100%", background: "#67e8f9" }} /></div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12, color: "#718198", fontSize: 12 }}><span>Foundation gates</span><span>100%</span></div>
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "20px clamp(20px, 5vw, 24px)" }}>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[["Validation", "100%", "Landing page and clickable validation experience complete"],["Product", "100%", "Decision Engine, grounded AI Analyst and Experiment Copilot implemented"],["Engineering", "100%", "Roblox ingestion, decision path, model safeguards, security, reliability and production build are validated with CI and live provider smoke tests"],["Commercial", "70%", "Plans, validation pricing and 30-day guided pilot are defined; paid conversion remains to be validated with real studios"]].map(([label, value, copy]) => <article key={label} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 20, padding: 20 }}><div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 10, fontSize: 30, fontWeight: 700 }}>{value}</div><p style={{ color: "#9fb1c7", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px clamp(20px, 5vw, 24px) 20px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Product Thesis</div><h2 style={{ marginTop: 12, maxWidth: 850, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Roblox tells studios what happened. PlayDirective helps decide what to do next.</h2><p style={{ maxWidth: 840, color: "#9fb1c7", fontSize: 16, lineHeight: 1.75 }}>The system validates metric changes deterministically, compares baselines and segments, generates a structured evidence bundle and only then lets the AI layer explain the finding. Supported findings can be turned into bounded experiments with explicit success thresholds and guardrails.</p></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Architecture</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Thin analytics layer. Strong decision layer.</h2><div style={{ marginTop: 24, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>{["Roblox Analytics", "Query Adapter", "Metric Normalization", "PostgreSQL", "Decision Engine", "Evidence Bundle", "AI Analyst", "Experiment Copilot"].map((item, index) => <div key={item} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 18, padding: 15, textAlign: "center", color: "#c7d5e5", fontSize: 13 }}><div style={{ color: "#52627a", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</div><div style={{ marginTop: 7 }}>{item}</div></div>)}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Verified Evidence</div>
        <h2 style={{ marginTop: 12, maxWidth: 780, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>The portfolio claim is backed by gates, not screenshots alone.</h2>
        <div style={{ marginTop: 24, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {proofPoints.map(([value, label, copy]) => <article key={label} style={{ border: "1px solid rgba(103,232,249,.16)", background: "rgba(103,232,249,.035)", borderRadius: 20, padding: 20 }}><div style={{ color: "#a5f3fc", fontSize: 34, fontWeight: 800 }}>{value}</div><div style={{ marginTop: 4, color: "#dce8f5", fontSize: 14, fontWeight: 800 }}>{label}</div><p style={{ color: "#8fa2ba", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <article style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: 22, background: "rgba(255,255,255,.025)" }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Engineering principle</div><h2 style={{ margin: "10px 0 8px", fontSize: 26 }}>AI explains. Evidence decides.</h2><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.72 }}>Authoritative metrics and priority logic stay deterministic. The model receives structured evidence, cannot invent unsupported numbers or causal certainty, and falls back safely when validation fails.</p></article>
          <article style={{ border: "1px solid rgba(251,191,36,.18)", borderRadius: 22, padding: 22, background: "rgba(251,191,36,.025)" }}><div style={{ color: "#fbbf24", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Still unvalidated</div><h2 style={{ margin: "10px 0 8px", fontSize: 26 }}>Build complete ≠ market proven.</h2><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.72 }}>There are no claims of paying studios, recurring revenue, validated willingness to pay or proven KPI lift. That is why commercial validation remains at 70% even though engineering and portfolio delivery are complete.</p></article>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Active delivery roadmap</div>
        <h2 style={{ marginTop: 12, maxWidth: 860, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>From pilot-ready infrastructure to a complete customer lifecycle.</h2>
        <p style={{ maxWidth: 860, color: "#9fb1c7", fontSize: 15, lineHeight: 1.7 }}>The canonical roadmap is tracked in <code>docs/PLAYDIRECTIVE_ROADMAP.md</code>. This page mirrors the current phase status and should be updated whenever delivery state changes.</p>
        <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
          {roadmapPhases.map(([id, title, status, copy]) => {
            const active = status === "IN PROGRESS";
            const next = status === "NEXT";
            return <article key={id} style={{ display: "grid", gridTemplateColumns: "58px minmax(0,1fr) auto", gap: 14, alignItems: "start", border: active ? "1px solid rgba(103,232,249,.35)" : "1px solid rgba(255,255,255,.1)", background: active ? "rgba(103,232,249,.055)" : "rgba(255,255,255,.025)", borderRadius: 20, padding: 20 }}><div style={{ color: "#67e8f9", fontFamily: "monospace", fontWeight: 800 }}>{id}</div><div><div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div><p style={{ margin: "7px 0 0", color: "#9fb1c7", lineHeight: 1.65, fontSize: 14 }}>{copy}</p></div><div style={{ borderRadius: 999, padding: "6px 9px", fontSize: 9, fontWeight: 800, whiteSpace: "nowrap", color: active ? "#a5f3fc" : next ? "#fde68a" : "#9fb1c7", background: active ? "rgba(103,232,249,.09)" : next ? "rgba(251,191,36,.08)" : "rgba(255,255,255,.04)" }}>{status}</div></article>;
          })}
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px) 80px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Foundation delivery</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>R0–R12 delivery complete</h2><div style={{ marginTop: 24, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden" }}>{sprints.map(([id, title, status], index) => <div key={id} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", gap: 10, alignItems: "center", padding: "14px", borderTop: index ? "1px solid rgba(255,255,255,.08)" : "none" }}><div style={{ color: "#67e8f9", fontFamily: "monospace", fontSize: 13 }}>{id}</div><div style={{ color: "#dce8f5", fontSize: 13 }}>{title}</div><div style={{ borderRadius: 999, padding: "5px 7px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", color: "#a7f3d0", background: "rgba(52,211,153,.1)" }}>{status}</div></div>)}</div></section>
    </main>
  );
}
