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

const screens = [
  "Landing / Early Access",
  "Connect Roblox",
  "Today's Priorities",
  "Investigation / Evidence",
  "Experiment Copilot",
  "Weekly Growth Brief",
];

const card = {
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(255,255,255,.03)",
  borderRadius: 22,
};

export const metadata = {
  title: "Portfolio | Roblox Decision Engine",
  description: "Build log, architecture and sprint readiness for Roblox Decision Engine.",
};

export default function PortfolioPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px 40px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← Product landing page</a>
        <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28, alignItems: "start" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em" }}>Portfolio / SaaS build log</div>
            <h1 style={{ margin: "14px 0 0", fontSize: "clamp(44px,8vw,76px)", lineHeight: 1, letterSpacing: "-.055em" }}>Roblox Decision Engine</h1>
            <p style={{ marginTop: 24, maxWidth: 760, color: "#9fb1c7", fontSize: 19, lineHeight: 1.7 }}>
              AI Product & Growth Analyst for Roblox studios. The product sits above Roblox Analytics and turns validated metric changes into grounded priorities, evidence and experiment proposals.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Roblox Open Cloud", "FastAPI", "PostgreSQL", "Next.js", "Decision Intelligence", "AI Agents", "Experimentation"].map((item) => (
                <span key={item} style={{ border: "1px solid rgba(255,255,255,.10)", borderRadius: 999, padding: "7px 11px", color: "#c8d5e5", fontSize: 12 }}>{item}</span>
              ))}
            </div>
          </div>

          <aside style={{ ...card, padding: 24 }}>
            <div style={{ color: "#71849a", fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em" }}>Current delivery</div>
            <div style={{ marginTop: 10, color: "#a5f3fc", fontWeight: 700, fontSize: 28 }}>R1 + R3 active</div>
            <p style={{ color: "#9fb1c7", lineHeight: 1.6, marginBottom: 18 }}>Validation experience and real Roblox analytics integration are progressing in parallel.</p>
            <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><div style={{ height: "100%", width: "31%", background: "#67e8f9" }} /></div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", color: "#71849a", fontSize: 12 }}><span>2 done · 2 active</span><span>13 sprints</span></div>
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
          {[
            ["Validation", "45%", "Problem, ICP, competition and validation flow established"],
            ["Product", "40%", "Decision-first workflow and six V1 surfaces defined"],
            ["Engineering", "40%", "SaaS foundation complete; Roblox adapter tested"],
            ["Commercial", "5%", "Pricing remains a validation hypothesis"],
          ].map(([label, value, copy]) => (
            <article key={label} style={{ ...card, padding: 20 }}>
              <div style={{ color: "#71849a", fontSize: 11, textTransform: "uppercase", letterSpacing: ".13em" }}>{label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 8 }}>{value}</div>
              <p style={{ color: "#9fb1c7", fontSize: 13, lineHeight: 1.6 }}>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em" }}>Product thesis</div>
        <h2 style={{ marginTop: 12, maxWidth: 850, fontSize: "clamp(34px,5vw,52px)", letterSpacing: "-.04em", lineHeight: 1.05 }}>Roblox tells you what happened. The Decision Engine tells you what to do next.</h2>
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {[
            ["01", "Detect", "Find the highest-impact retention, onboarding, monetization or acquisition issue."],
            ["02", "Explain", "Show affected KPI, segment, baseline, confidence and evidence before advice."],
            ["03", "Act", "Convert findings into a concrete product action and structured experiment."],
          ].map(([id, title, copy]) => (
            <article key={id} style={{ ...card, padding: 22 }}>
              <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700 }}>{id}</div>
              <h3 style={{ fontSize: 21, margin: "12px 0 0" }}>{title}</h3>
              <p style={{ color: "#9fb1c7", lineHeight: 1.65 }}>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em" }}>Validation MVP</div>
        <h2 style={{ marginTop: 12, fontSize: 38, letterSpacing: "-.035em" }}>Six screens validate the complete product story.</h2>
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {screens.map((screen, index) => (
            <div key={screen} style={{ ...card, padding: 18 }}><div style={{ color: "#71849a", fontSize: 11 }}>0{index + 1}</div><div style={{ marginTop: 7, fontWeight: 700 }}>{screen}</div></div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em" }}>Architecture</div>
        <h2 style={{ marginTop: 12, fontSize: 38, letterSpacing: "-.035em" }}>Thin analytics layer. Strong decision layer.</h2>
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
          {["Roblox Analytics", "Query Adapter", "PostgreSQL", "Decision Engine", "Evidence Bundle", "AI Analyst", "Actions / Experiments"].map((item, index) => (
            <div key={item} style={{ ...card, padding: 16, textAlign: "center", color: "#c8d5e5", fontSize: 13 }}><div style={{ color: "#52667e", fontSize: 10, marginBottom: 7 }}>{String(index + 1).padStart(2, "0")}</div>{item}</div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 96px" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div><div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".18em" }}>Delivery</div><h2 style={{ marginTop: 12, fontSize: 38, letterSpacing: "-.035em" }}>Sprint path to paid Go-Live</h2></div>
          <a href="https://github.com/danielwauer-maker/roblox-decision-engine" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>Open GitHub repository ↗</a>
        </div>
        <div style={{ marginTop: 24, ...card, overflow: "hidden" }}>
          {sprints.map(([id, title, status], index) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "70px 1fr auto", gap: 14, alignItems: "center", padding: "14px 18px", borderTop: index ? "1px solid rgba(255,255,255,.08)" : undefined }}>
              <div style={{ color: "#67e8f9", fontFamily: "monospace" }}>{id}</div>
              <div style={{ color: "#d8e2ee", fontSize: 14 }}>{title}</div>
              <div style={{ borderRadius: 999, padding: "5px 9px", fontSize: 10, fontWeight: 700, color: status === "DONE" ? "#a7f3d0" : status === "IN PROGRESS" ? "#a5f3fc" : "#71849a", background: status === "DONE" ? "rgba(52,211,153,.10)" : status === "IN PROGRESS" ? "rgba(103,232,249,.10)" : "rgba(255,255,255,.04)" }}>{status}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
