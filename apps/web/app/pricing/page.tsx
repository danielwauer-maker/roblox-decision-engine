const plans = [
  {
    name: "Indie",
    price: "$19",
    subtitle: "For live indie teams that need one clear weekly priority.",
    experiences: "1 experience",
    features: ["Top-3 decision queue", "AI Product Analyst", "Experiment Copilot", "Weekly Growth Brief"],
    cta: "Apply for founding pilot",
    href: "/apply",
    featured: true,
  },
  {
    name: "Growth",
    price: "$49",
    subtitle: "For teams running recurring updates and paid acquisition.",
    experiences: "Up to 3 experiences",
    features: ["Everything in Indie", "Priority evidence history", "Pilot feedback workflow", "Multi-experience coverage"],
    cta: "Apply for founding pilot",
    href: "/apply",
  },
  {
    name: "Studio",
    price: "$99",
    subtitle: "For multi-experience teams that need one decision layer.",
    experiences: "Up to 10 experiences",
    features: ["Everything in Growth", "Portfolio-level weekly review", "Priority support", "Expanded experience limits"],
    cta: "Apply for founding pilot",
    href: "/apply",
  },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(20px,5vw,24px)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <a href="/" style={{ color: "#eef7ff", textDecoration: "none", fontWeight: 800 }}>PlayDirective</a>
          <div style={{ display: "flex", gap: 8 }}><a href="/demo" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px" }}>Demo</a></div>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 28px", textAlign: "center" }}>
        <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Founding studio pricing</div>
        <h1 style={{ margin: "16px auto 0", maxWidth: 850, fontSize: "clamp(42px,8vw,68px)", lineHeight: .98, letterSpacing: "-.05em" }}>Prove the value first. Pay only after PlayDirective earns its place.</h1>
        <p style={{ margin: "24px auto 0", maxWidth: 760, color: "#9fb1c7", fontSize: 18, lineHeight: 1.65 }}>Every founding studio starts with the same guided 30-day pilot. Connect one live Roblox experience, review evidence-backed priorities and see whether PlayDirective produces decisions your team genuinely wants to act on.</p>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px clamp(20px,5vw,24px)" }}>
        <div style={{ border: "1px solid rgba(103,232,249,.32)", background: "rgba(103,232,249,.075)", borderRadius: 22, padding: 24, display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>30-day founding studio pilot · free</div>
            <h2 style={{ margin: "8px 0 6px", fontSize: 28 }}>One live experience. One useful decision before you pay.</h2>
            <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.65 }}>Invite-only and guided during validation. No card required. We only ask you to consider a paid plan after PlayDirective has surfaced something your team finds genuinely useful.</p>
          </div>
          <a href="/apply" style={{ background: "#67e8f9", color: "#07101f", padding: "13px 17px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>Apply for founding pilot</a>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(20px,5vw,24px) 72px" }}>
        <div style={{ marginBottom: 18, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>After the founding pilot, choose the plan that matches your studio. These prices remain validation hypotheses and may change before general availability.</div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
          {plans.map((plan) => <article key={plan.name} style={{ border: plan.featured ? "1px solid rgba(103,232,249,.38)" : "1px solid rgba(255,255,255,.1)", background: plan.featured ? "rgba(103,232,249,.055)" : "rgba(255,255,255,.025)", borderRadius: 22, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><h2 style={{ margin: 0 }}>{plan.name}</h2>{plan.featured && <span style={{ color: "#a5f3fc", fontSize: 10, fontWeight: 800, border: "1px solid rgba(103,232,249,.28)", borderRadius: 999, padding: "5px 7px" }}>BEST FIT</span>}</div>
            <div style={{ marginTop: 16, fontSize: 38, fontWeight: 800 }}>{plan.price}<span style={{ color: "#718198", fontSize: 13, fontWeight: 500 }}>/mo</span></div>
            <p style={{ color: "#9fb1c7", lineHeight: 1.6, minHeight: 72 }}>{plan.subtitle}</p>
            <div style={{ color: "#67e8f9", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>{plan.experiences}</div>
            <div>{plan.features.map((feature) => <div key={feature} style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.07)", color: "#c7d5e5", fontSize: 14 }}>✓ {feature}</div>)}</div>
            <a href={plan.href} style={{ display: "block", marginTop: 20, textAlign: "center", background: plan.featured ? "#67e8f9" : "transparent", color: plan.featured ? "#07101f" : "#eef7ff", border: plan.featured ? "none" : "1px solid rgba(255,255,255,.13)", padding: "11px 14px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>{plan.cta}</a>
          </article>)}
        </div>
        <p style={{ color: "#718198", fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>The founding pilot is currently free during validation. No payment method is required. Paid plans begin only after the pilot and require explicit confirmation.</p>
      </section>
    </main>
  );
}
