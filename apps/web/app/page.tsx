const steps = [
  ["01", "Connect", "Read aggregated Roblox analytics with least-privilege access."],
  ["02", "Prioritize", "Rank the three product decisions with the highest likely impact."],
  ["03", "Prove", "Show the segment, baseline and funnel evidence behind every recommendation."],
  ["04", "Experiment", "Turn a supported finding into a test plan with KPIs and guardrails."],
];

const examples = [
  ["#1", "Fix mobile onboarding", "Mobile D1 is 8.7% vs 17.9% desktop", "HIGH IMPACT"],
  ["#2", "Hold paid acquisition", "Traffic is rising before retention is fixed", "PROTECT SPEND"],
  ["#3", "Move starter offer", "Returning users convert 3.4× better", "OPPORTUNITY"],
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(20px,5vw,24px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, letterSpacing: "-.02em" }}>Roblox Decision Engine</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/pricing" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px", fontSize: 13 }}>Pricing</a>
            <a href="/portfolio" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px", fontSize: 13 }}>Build log</a>
            <a href="/demo" style={{ border: "1px solid rgba(103,232,249,.3)", color: "#a5f3fc", textDecoration: "none", padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>Open product demo</a>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(72px,12vw,116px) clamp(20px,5vw,24px) 58px" }}>
        <div style={{ maxWidth: 900 }}>
          <div style={{ fontSize: "clamp(11px,3vw,12px)", letterSpacing: ".18em", textTransform: "uppercase", color: "#67e8f9", fontWeight: 800 }}>AI Product & Growth Analyst for Roblox studios</div>
          <h1 style={{ margin: "18px 0 0", maxWidth: 960, fontSize: "clamp(46px,10vw,82px)", lineHeight: .95, letterSpacing: "-.06em" }}>Know what to fix next.</h1>
          <p style={{ margin: "26px 0 0", maxWidth: 780, color: "#9fb1c7", fontSize: "clamp(18px,4.4vw,21px)", lineHeight: 1.58 }}>Turn retention, monetization and funnel signals into three evidence-backed priorities and a concrete experiment plan — without hiring a full-time product analyst.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
            <a href="/demo/priorities" style={{ background: "#67e8f9", color: "#07101f", padding: "13px 18px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 15 }}>Explore the live demo</a>
            <a href="/pricing" style={{ border: "1px solid rgba(255,255,255,.13)", color: "#eef7ff", padding: "13px 18px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>See pricing & pilot</a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(20px,5vw,24px) 78px" }}>
        <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>What the product surfaces</div>
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {examples.map(([rank, title, evidence, impact], index) => <div key={title} style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto", gap: 14, alignItems: "center", border: "1px solid rgba(255,255,255,.09)", background: index === 0 ? "rgba(103,232,249,.055)" : "rgba(255,255,255,.025)", borderRadius: 18, padding: "17px 18px" }}><div style={{ color: "#67e8f9", fontWeight: 800 }}>{rank}</div><div><div style={{ fontWeight: 800, fontSize: 17 }}>{title}</div><div style={{ marginTop: 5, color: "#8fa2ba", fontSize: 13, lineHeight: 1.5 }}>{evidence}</div></div><div style={{ color: index === 0 ? "#fb7185" : index === 1 ? "#fbbf24" : "#86efac", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>{impact}</div></div>)}
        </div>
      </section>

      <section id="workflow" style={{ maxWidth: 1180, margin: "0 auto", padding: "42px clamp(20px,5vw,24px) 78px" }}>
        <div style={{ maxWidth: 700 }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Decision workflow</div><h2 style={{ margin: "12px 0 0", fontSize: "clamp(32px,7vw,46px)", letterSpacing: "-.04em" }}>A thin analytics layer. A strong decision layer.</h2></div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 26 }}>
          {steps.map(([id,title,copy]) => <article key={id} style={{ border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: 22, background: "rgba(255,255,255,.025)" }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800 }}>{id}</div><h3 style={{ margin: "12px 0 8px", fontSize: 21 }}>{title}</h3><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.65 }}>{copy}</p></article>)}
        </div>
      </section>

      <section id="pilot" style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(20px,5vw,24px) 96px" }}>
        <div style={{ border: "1px solid rgba(103,232,249,.24)", background: "linear-gradient(135deg, rgba(103,232,249,.08), rgba(255,255,255,.02))", borderRadius: 26, padding: "clamp(26px,6vw,38px)" }}>
          <div style={{ color: "#67e8f9", fontWeight: 800, fontSize: 12, letterSpacing: ".13em", textTransform: "uppercase" }}>Early Access Pilot</div>
          <h2 style={{ margin: "12px 0 0", maxWidth: 760, fontSize: "clamp(30px,7vw,44px)", lineHeight: 1.06, letterSpacing: "-.04em" }}>Built for live Roblox teams without a dedicated product analyst.</h2>
          <p style={{ maxWidth: 760, color: "#9fb1c7", lineHeight: 1.7 }}>Start with a 30-day guided pilot at $0. We only ask you to consider a paid plan after the product has produced at least one decision your team finds genuinely useful.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}><a href="/pricing" style={{ background: "#67e8f9", color: "#07101f", padding: "12px 16px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>View plans</a><a href="/demo/pilot" style={{ border: "1px solid rgba(255,255,255,.13)", color: "#eef7ff", padding: "12px 16px", borderRadius: 11, fontWeight: 700, textDecoration: "none" }}>Preview pilot workspace</a></div>
        </div>
      </section>
    </main>
  );
}
