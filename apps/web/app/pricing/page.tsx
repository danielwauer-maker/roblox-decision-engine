const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Validate the workflow before committing.",
    experiences: "1 experience",
    features: ["Demo workspace", "1 connected experience", "Weekly decision brief"],
    cta: "Start with demo",
    href: "/demo",
  },
  {
    name: "Indie",
    price: "$19",
    subtitle: "For live indie teams that need one clear weekly priority.",
    experiences: "1 experience",
    features: ["Top-3 decision queue", "AI Product Analyst", "Experiment Copilot", "Weekly Growth Brief"],
    cta: "Join early access",
    href: "/demo/pilot",
    featured: true,
  },
  {
    name: "Growth",
    price: "$49",
    subtitle: "For teams running recurring updates and paid acquisition.",
    experiences: "Up to 3 experiences",
    features: ["Everything in Indie", "Priority evidence history", "Pilot feedback workflow", "Multi-experience coverage"],
    cta: "Join pilot",
    href: "/demo/pilot",
  },
  {
    name: "Studio",
    price: "$99",
    subtitle: "For multi-experience teams that need one decision layer.",
    experiences: "Up to 10 experiences",
    features: ["Everything in Growth", "Portfolio-level weekly review", "Priority support", "Expanded experience limits"],
    cta: "Talk to us",
    href: "/demo/pilot",
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(20px,5vw,24px)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <a href="/" style={{ color: "#eef7ff", textDecoration: "none", fontWeight: 800 }}>Roblox Decision Engine</a>
          <div style={{ display: "flex", gap: 8 }}><a href="/demo" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px" }}>Demo</a><a href="/portfolio" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px" }}>Build log</a></div>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 28px", textAlign: "center" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Commercial validation</div>
        <h1 style={{ margin: "16px auto 0", maxWidth: 850, fontSize: "clamp(42px,8vw,68px)", lineHeight: .98, letterSpacing: "-.05em" }}>Pay for clearer decisions, not more dashboards.</h1>
        <p style={{ margin: "24px auto 0", maxWidth: 760, color: "#9fb1c7", fontSize: 18, lineHeight: 1.65 }}>Roblox already tells you what happened. The Decision Engine ranks what deserves attention, shows the evidence and turns the strongest finding into a bounded experiment plan.</p>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px clamp(20px,5vw,24px)" }}>
        <div style={{ border: "1px solid rgba(103,232,249,.28)", background: "rgba(103,232,249,.07)", borderRadius: 22, padding: 22, display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>Early access offer</div><h2 style={{ margin: "8px 0 4px" }}>30-day guided pilot · $0</h2><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6 }}>The goal is simple: prove at least one useful decision with your real Roblox analytics before asking you to pay.</p></div>
          <a href="/demo/pilot" style={{ background: "#67e8f9", color: "#07101f", padding: "12px 16px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>Preview pilot flow</a>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(20px,5vw,24px) 72px" }}>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
          {plans.map((plan) => <article key={plan.name} style={{ border: plan.featured ? "1px solid rgba(103,232,249,.38)" : "1px solid rgba(255,255,255,.1)", background: plan.featured ? "rgba(103,232,249,.055)" : "rgba(255,255,255,.025)", borderRadius: 22, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><h2 style={{ margin: 0 }}>{plan.name}</h2>{plan.featured && <span style={{ color: "#a5f3fc", fontSize: 10, fontWeight: 800, border: "1px solid rgba(103,232,249,.28)", borderRadius: 999, padding: "5px 7px" }}>BEST FIT</span>}</div>
            <div style={{ marginTop: 16, fontSize: 38, fontWeight: 800 }}>{plan.price}<span style={{ color: "#718198", fontSize: 13, fontWeight: 500 }}>/mo</span></div>
            <p style={{ color: "#9fb1c7", lineHeight: 1.6, minHeight: 72 }}>{plan.subtitle}</p>
            <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>{plan.experiences}</div>
            <div>{plan.features.map((feature) => <div key={feature} style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.07)", color: "#c7d5e5", fontSize: 14 }}>✓ {feature}</div>)}</div>
            <a href={plan.href} style={{ display: "block", marginTop: 20, textAlign: "center", background: plan.featured ? "#67e8f9" : "transparent", color: plan.featured ? "#07101f" : "#eef7ff", border: plan.featured ? "none" : "1px solid rgba(255,255,255,.13)", padding: "11px 14px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>{plan.cta}</a>
          </article>)}
        </div>
        <p style={{ color: "#718198", fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>Pricing is a validation hypothesis for early access and may change before general availability. No payment is required for the guided pilot.</p>
      </section>
    </main>
  );
}
