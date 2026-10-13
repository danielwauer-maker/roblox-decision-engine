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
  ["R11", "Go-Live foundation", "DONE"],
  ["R12", "Portfolio closure", "DONE"],
  ["R13", "Multi-tenant pilot SaaS", "CODE COMPLETE"],
  ["R14", "Operator / Admin Console", "CODE COMPLETE"],
  ["R16", "Real Pilot Go-Live", "CODE COMPLETE"],
  ["R17", "Final Commercial Go-Live", "ACCEPTANCE PENDING"],
] as const;

const capabilities = ["Roblox Open Cloud", "Product Analytics", "Decision Intelligence", "FastAPI", "PostgreSQL", "Multi-Tenant SaaS", "AI Agents", "Experimentation", "Next.js", "Stripe", "Resend", "Docker"];

const proofPoints = [
  ["56", "backend tests", "R17 extends the regression suite with acquisition attribution, real pilot-term state and server-side plan-limit coverage."],
  ["2", "live providers", "Roblox analytics and OpenAI model paths both passed live smoke validation."],
  ["1", "production host", "Next.js, FastAPI and PostgreSQL are designed to run together on the existing Hetzner server in Germany."],
  ["A–I", "acceptance runbook", "The final release is gated by a documented real-life enrollment, isolation, email, billing and recovery test."],
];

const roadmapPhases = [
  ["2A", "Private workspace parity", "CODE COMPLETE", "Authenticated studios get priorities, evidence, grounded AI analysis, experiment design and Weekly Brief from tenant-scoped data."],
  ["2B", "Pilot progress state machine", "CODE COMPLETE", "Dynamic onboarding tracks connection, first sync, first priority review, experiment review and Weekly Brief review with persisted milestones."],
  ["3", "Notifications & lifecycle", "CODE COMPLETE", "Application, invite, activation, passwordless login, sync attention, stale analytics, experiment-ready and Weekly Brief notifications are implemented with Resend integration."],
  ["4", "Subscription & billing", "CODE COMPLETE", "Stripe hosted Checkout, Customer Portal, signed webhooks, entitlements and server-side 1/3/10 experience limits are implemented."],
  ["R16", "Real Pilot Go-Live", "CODE COMPLETE", "Public application, approval, passwordless login, private workspace, billing plumbing and acceptance runbook are implemented."],
  ["R17", "Final Commercial Go-Live", "ACCEPTANCE PENDING", "30-day pilot term, conversion lifecycle, UTM attribution, operator CRM controls, onboarding guide, legal baseline, backups and Hetzner scheduled operations are implemented. Real production acceptance remains."],
] as const;

const productionStack = [
  ["01", "Hetzner DNS + TLS", "playdirective.com remains routed to the German Hetzner server."],
  ["02", "Next.js", "Public product, application flow, private workspace and operator console on loopback port 8090."],
  ["03", "FastAPI", "Tenant APIs, decision engine, pilot lifecycle, billing and Roblox/OpenAI provider integration on loopback port 8091."],
  ["04", "PostgreSQL 16", "Persistent tenant, observation, attribution, lifecycle and billing state on the Hetzner volume inside the private Docker network."],
];

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(64px, 12vw, 80px) clamp(20px, 5vw, 24px) 44px" }}>
        <a href="/" style={{ color: "#67e8f9", fontSize: 14, textDecoration: "none" }}>← PlayDirective</a>
        <div style={{ marginTop: 32, display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: "clamp(10px, 2.8vw, 12px)", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Portfolio Case Study · Commercial Go-Live Delivery</div>
            <h1 style={{ margin: "16px 0 0", fontSize: "clamp(42px, 11vw, 58px)", lineHeight: 0.98, letterSpacing: "-.05em" }}>PlayDirective</h1>
            <p style={{ marginTop: 22, maxWidth: 760, color: "#9fb1c7", fontSize: "clamp(17px, 4.5vw, 19px)", lineHeight: 1.62 }}>Decision intelligence for Roblox studios. PlayDirective turns retention, monetization and funnel signals into prioritized, evidence-backed actions and experiment decisions — backed by a multi-tenant pilot SaaS, a real 30-day customer lifecycle, attribution, billing and operator tooling.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>{capabilities.map((item) => <span key={item} style={{ border: "1px solid rgba(255,255,255,.11)", background: "rgba(255,255,255,.03)", borderRadius: 999, padding: "7px 10px", fontSize: 12, color: "#c7d5e5" }}>{item}</span>)}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}><a href="/demo" style={{ background: "#67e8f9", color: "#07101f", padding: "11px 14px", borderRadius: 11, fontWeight: 800, textDecoration: "none", fontSize: 13 }}>Open validation demo</a><a href="/pricing" style={{ border: "1px solid rgba(103,232,249,.24)", color: "#a5f3fc", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>View pricing</a><a href="/apply" style={{ border: "1px solid rgba(255,255,255,.12)", color: "#eef7ff", padding: "11px 14px", borderRadius: 11, fontWeight: 700, textDecoration: "none", fontSize: 13 }}>Founding Studio flow</a></div>
          </div>
          <aside style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 22 }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase" }}>Current delivery state</div>
            <div style={{ marginTop: 12, fontSize: "clamp(26px, 7vw, 31px)", fontWeight: 700, color: "#a5f3fc" }}>R17 code complete</div>
            <div style={{ marginTop: 8, color: "#9fb1c7", fontSize: 14, lineHeight: 1.65 }}>The customer lifecycle, attribution, conversion controls and production operations are implemented. Final readiness now depends on deploying the exact release to Hetzner, activating real provider settings and passing the production acceptance run.</div>
            <div style={{ marginTop: 22, height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><div style={{ width: "96%", height: "100%", background: "#67e8f9" }} /></div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12, color: "#718198", fontSize: 12 }}><span>Go-live readiness</span><span>96%</span></div>
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "20px clamp(20px, 5vw, 24px)" }}><div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>{[["Foundation", "100%", "R0–R12 product, security, reliability and portfolio gates remain complete."],["Pilot product", "100%", "Multi-tenant workspace, enrollment, real 30-day pilot state, operator controls, progress tracking, lifecycle and billing code are implemented."],["Production", "96%", "Hetzner-only runtime, scheduled lifecycle, local health checks and DB backup tooling are prepared; deployment and real acceptance remain."],["Commercial", "75%", "Acquisition attribution and conversion plumbing are ready, but paying studios, willingness to pay, retention lift and recurring revenue are not yet validated."]].map(([label, value, copy]) => <article key={label} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 20, padding: 20 }}><div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 10, fontSize: 30, fontWeight: 700 }}>{value}</div><p style={{ color: "#9fb1c7", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "48px clamp(20px, 5vw, 24px) 20px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Product Thesis</div><h2 style={{ marginTop: 12, maxWidth: 850, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Roblox tells studios what happened. PlayDirective helps decide what to do next.</h2><p style={{ maxWidth: 840, color: "#9fb1c7", fontSize: 16, lineHeight: 1.75 }}>The system validates metric changes deterministically, compares baselines and segments, generates a structured evidence bundle and only then lets the AI layer explain the finding. Supported findings can be turned into bounded experiments with explicit success thresholds and guardrails.</p></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Production architecture</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>One production host. Clear data boundary.</h2><p style={{ maxWidth: 860, color: "#9fb1c7", fontSize: 15, lineHeight: 1.7 }}>The production target is the existing Hetzner server in Germany. Vercel, Neon and Render are not part of the PlayDirective production runtime. External services are limited to Roblox Open Cloud, OpenAI, Resend and Stripe.</p><div style={{ marginTop: 24, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>{productionStack.map(([index, title, copy]) => <article key={title} style={{ border: "1px solid rgba(103,232,249,.14)", background: "rgba(103,232,249,.025)", borderRadius: 20, padding: 20 }}><div style={{ color: "#52627a", fontFamily: "monospace", fontSize: 11 }}>{index}</div><div style={{ marginTop: 8, color: "#dce8f5", fontSize: 16, fontWeight: 800 }}>{title}</div><p style={{ color: "#8fa2ba", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}</div><div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 18, color: "#9fb1c7", fontSize: 13, lineHeight: 1.7 }}>Internet → Hetzner DNS/TLS → Next.js → FastAPI → PostgreSQL. The web and API containers are loopback-bound; PostgreSQL remains inside the private Docker network.</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Decision architecture</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Thin analytics layer. Strong decision layer.</h2><div style={{ marginTop: 24, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>{["Roblox Analytics", "Query Adapter", "Metric Normalization", "PostgreSQL", "Decision Engine", "Evidence Bundle", "AI Analyst", "Experiment Copilot"].map((item, index) => <div key={item} style={{ border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.025)", borderRadius: 18, padding: 15, textAlign: "center", color: "#c7d5e5", fontSize: 13 }}><div style={{ color: "#52627a", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</div><div style={{ marginTop: 7 }}>{item}</div></div>)}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Verified Evidence</div><h2 style={{ marginTop: 12, maxWidth: 780, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>The portfolio claim is backed by gates, not screenshots alone.</h2><div style={{ marginTop: 24, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>{proofPoints.map(([value, label, copy]) => <article key={label} style={{ border: "1px solid rgba(103,232,249,.16)", background: "rgba(103,232,249,.035)", borderRadius: 20, padding: 20 }}><div style={{ color: "#a5f3fc", fontSize: 34, fontWeight: 800 }}>{value}</div><div style={{ marginTop: 4, color: "#dce8f5", fontSize: 14, fontWeight: 800 }}>{label}</div><p style={{ color: "#8fa2ba", fontSize: 13, lineHeight: 1.65 }}>{copy}</p></article>)}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}><article style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: 22, background: "rgba(255,255,255,.025)" }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Engineering principle</div><h2 style={{ margin: "10px 0 8px", fontSize: 26 }}>AI explains. Evidence decides.</h2><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.72 }}>Authoritative metrics and priority logic stay deterministic. The model receives structured evidence, cannot invent unsupported numbers or causal certainty, and falls back safely when validation fails.</p></article><article style={{ border: "1px solid rgba(251,191,36,.18)", borderRadius: 22, padding: 22, background: "rgba(251,191,36,.025)" }}><div style={{ color: "#fbbf24", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Still unvalidated</div><h2 style={{ margin: "10px 0 8px", fontSize: 26 }}>Build complete ≠ market proven.</h2><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.72 }}>There are no claims of paying studios, recurring revenue, validated willingness to pay or proven KPI lift. Commercial validation remains separate from engineering readiness until real founding studios provide evidence.</p></article></div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px)" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Active delivery roadmap</div><h2 style={{ marginTop: 12, maxWidth: 860, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>Commercial lifecycle built. Production acceptance next.</h2><p style={{ maxWidth: 860, color: "#9fb1c7", fontSize: 15, lineHeight: 1.7 }}>Phase 2A, 2B, 3, 4 and R16 are code complete. R17 is the final feature-freeze gate and remains open only for real Hetzner/provider/Roblox acceptance.</p><div style={{ marginTop: 24, display: "grid", gap: 14 }}>{roadmapPhases.map(([id, title, status, copy]) => { const pending = status === "ACCEPTANCE PENDING"; return <article key={id} style={{ display: "grid", gridTemplateColumns: "58px minmax(0,1fr) auto", gap: 14, alignItems: "start", border: pending ? "1px solid rgba(251,191,36,.28)" : "1px solid rgba(103,232,249,.2)", background: pending ? "rgba(251,191,36,.035)" : "rgba(103,232,249,.035)", borderRadius: 20, padding: 20 }}><div style={{ color: pending ? "#fbbf24" : "#67e8f9", fontFamily: "monospace", fontWeight: 800 }}>{id}</div><div><div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div><p style={{ margin: "7px 0 0", color: "#9fb1c7", lineHeight: 1.65, fontSize: 14 }}>{copy}</p></div><div style={{ borderRadius: 999, padding: "6px 9px", fontSize: 9, fontWeight: 800, whiteSpace: "nowrap", color: pending ? "#fde68a" : "#a7f3d0", background: pending ? "rgba(251,191,36,.08)" : "rgba(52,211,153,.08)" }}>{status}</div></article>; })}</div></section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "42px clamp(20px, 5vw, 24px) 80px" }}><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Delivery history</div><h2 style={{ marginTop: 12, fontSize: "clamp(30px, 7vw, 40px)", lineHeight: 1.08, letterSpacing: "-.035em" }}>From product thesis to commercial pilot infrastructure.</h2><div style={{ marginTop: 24, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden" }}>{sprints.map(([id, title, status], index) => { const done = status === "DONE" || status === "CODE COMPLETE"; return <div key={id} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", gap: 10, alignItems: "center", padding: "14px", borderTop: index ? "1px solid rgba(255,255,255,.08)" : "none" }}><div style={{ color: "#67e8f9", fontFamily: "monospace", fontSize: 13 }}>{id}</div><div style={{ color: "#dce8f5", fontSize: 13 }}>{title}</div><div style={{ borderRadius: 999, padding: "5px 7px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", color: done ? "#a7f3d0" : "#fde68a", background: done ? "rgba(52,211,153,.1)" : "rgba(251,191,36,.08)" }}>{status}</div></div>; })}</div></section>
    </main>
  );
}
