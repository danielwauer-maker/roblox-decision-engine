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

const trust = [
  ["READ-ONLY", "Least-privilege Roblox analytics access"],
  ["ENCRYPTED", "Studio credentials encrypted before storage"],
  ["PRIVATE", "Tenant-isolated data and decisions"],
];

const security = [
  ["Read-only analytics", "PlayDirective only needs analytics access. It does not require permission to edit or publish your Roblox experience."],
  ["Encrypted credentials", "Your Roblox Open Cloud key is encrypted before storage and is never returned to browser JavaScript or the operator dashboard."],
  ["Studio-isolated workspace", "Each studio has its own private tenant, session and analytics path so one customer's data never becomes another studio's evidence."],
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(7,16,31,.92)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(20px,5vw,24px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, letterSpacing: "-.035em", fontSize: 22 }}>PlayDirective</div>
            <div style={{ color: "#718198", fontSize: 10, marginTop: 4, letterSpacing: ".02em" }}>Decision intelligence for game studios</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <a href="#security" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px", fontSize: 13 }}>Security</a>
            <a href="/pricing" style={{ color: "#9fb1c7", textDecoration: "none", padding: "9px 11px", fontSize: 13 }}>Pricing</a>
            <a href="/demo" style={{ border: "1px solid rgba(103,232,249,.34)", color: "#a5f3fc", textDecoration: "none", padding: "10px 13px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>See PlayDirective in action</a>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(68px,10vw,104px) clamp(20px,5vw,24px) 44px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(34px,6vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "clamp(11px,3vw,12px)", letterSpacing: ".18em", textTransform: "uppercase", color: "#67e8f9", fontWeight: 800 }}>Decision intelligence for Roblox studios</div>
            <h1 style={{ margin: "18px 0 0", maxWidth: 720, fontSize: "clamp(46px,7vw,76px)", lineHeight: .96, letterSpacing: "-.058em" }}>Know what changed. Know what to do next.</h1>
            <p style={{ margin: "26px 0 0", maxWidth: 690, color: "#9fb1c7", fontSize: "clamp(18px,3vw,21px)", lineHeight: 1.58 }}>PlayDirective turns retention, monetization and funnel signals into evidence-backed priorities and concrete experiments — without forcing your team to live inside another analytics dashboard.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32 }}>
              <a href="/demo/priorities" style={{ background: "#67e8f9", color: "#07101f", padding: "13px 18px", borderRadius: 12, fontWeight: 900, textDecoration: "none", fontSize: 15 }}>See PlayDirective in action</a>
              <a href="/pricing" style={{ border: "1px solid rgba(255,255,255,.14)", color: "#eef7ff", padding: "13px 18px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: 15 }}>Start free pilot</a>
            </div>
          </div>

          <div style={{ border: "1px solid rgba(103,232,249,.18)", borderRadius: 24, background: "linear-gradient(145deg, rgba(103,232,249,.075), rgba(255,255,255,.018))", padding: "clamp(18px,3vw,24px)", boxShadow: "0 28px 80px rgba(0,0,0,.22)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#718198", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>Today&apos;s decision queue</div>
                <div style={{ marginTop: 7, fontWeight: 900, fontSize: 19 }}>What deserves attention first</div>
              </div>
              <div style={{ color: "#86efac", fontSize: 11, fontWeight: 800, padding: "6px 9px", borderRadius: 999, background: "rgba(134,239,172,.07)", border: "1px solid rgba(134,239,172,.14)" }}>LIVE SIGNALS</div>
            </div>
            <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
              {[
                ["01", "Fix mobile onboarding friction", "Mobile D1 retention fell while desktop remained stable.", "88.0"],
                ["02", "Protect paid acquisition efficiency", "Traffic is growing faster than retained users.", "83.0"],
                ["03", "Test starter-offer timing", "Returning players monetize materially better.", "74.0"],
              ].map(([rank, title, copy, score], index) => (
                <div key={rank} style={{ border: "1px solid rgba(255,255,255,.085)", borderRadius: 14, padding: 14, background: index === 0 ? "rgba(103,232,249,.055)" : "rgba(7,16,31,.42)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto", gap: 10, alignItems: "start" }}>
                    <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 900 }}>{rank}</div>
                    <div>
                      <div style={{ fontWeight: 850, fontSize: 14 }}>{title}</div>
                      <div style={{ marginTop: 5, color: "#8095ae", fontSize: 11, lineHeight: 1.5 }}>{copy}</div>
                    </div>
                    <div style={{ textAlign: "right" }}><div style={{ color: "#67e8f9", fontSize: 14, fontWeight: 900 }}>{score}</div><div style={{ color: "#52627a", fontSize: 8, marginTop: 2, textTransform: "uppercase" }}>priority</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 15, color: "#60738c", fontSize: 10, lineHeight: 1.55 }}>Illustrative decision queue based on the product&apos;s current pilot workflow.</div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px clamp(20px,5vw,24px) 66px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "14px 0" }}>
          {trust.map(([label, copy]) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px" }}><span style={{ color: "#67e8f9", fontSize: 9, fontWeight: 900, letterSpacing: ".12em" }}>{label}</span><span style={{ color: "#8095ae", fontSize: 11 }}>{copy}</span></div>)}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "12px clamp(20px,5vw,24px) 78px" }}>
        <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>What PlayDirective surfaces</div>
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {examples.map(([rank, title, evidence, impact], index) => <div key={title} style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto", gap: 14, alignItems: "center", border: "1px solid rgba(255,255,255,.09)", background: index === 0 ? "rgba(103,232,249,.055)" : "rgba(255,255,255,.025)", borderRadius: 18, padding: "17px 18px" }}><div style={{ color: "#67e8f9", fontWeight: 800 }}>{rank}</div><div><div style={{ fontWeight: 800, fontSize: 17 }}>{title}</div><div style={{ marginTop: 5, color: "#8fa2ba", fontSize: 13, lineHeight: 1.5 }}>{evidence}</div></div><div style={{ color: index === 0 ? "#fb7185" : index === 1 ? "#fbbf24" : "#86efac", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>{impact}</div></div>)}
        </div>
      </section>

      <section id="workflow" style={{ maxWidth: 1180, margin: "0 auto", padding: "42px clamp(20px,5vw,24px) 78px" }}>
        <div style={{ maxWidth: 760 }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Decision workflow</div><h2 style={{ margin: "12px 0 0", fontSize: "clamp(32px,6vw,46px)", letterSpacing: "-.04em" }}>Roblox shows what happened. PlayDirective helps decide what happens next.</h2></div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 26 }}>
          {steps.map(([id,title,copy]) => <article key={id} style={{ border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: 22, background: "rgba(255,255,255,.025)" }}><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800 }}>{id}</div><h3 style={{ margin: "12px 0 8px", fontSize: 21 }}>{title}</h3><p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.65 }}>{copy}</p></article>)}
        </div>
      </section>

      <section id="security" style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(20px,5vw,24px) 86px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 22, alignItems: "start" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Built for studio trust</div>
            <h2 style={{ margin: "12px 0 0", fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.04, letterSpacing: "-.04em" }}>Your game stays yours. PlayDirective reads signals, not control.</h2>
            <p style={{ margin: "18px 0 0", color: "#8fa2ba", lineHeight: 1.7, maxWidth: 560 }}>Studios should not have to hand over publishing access just to get better product decisions. The pilot is designed around read-only analytics access and private tenant boundaries.</p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {security.map(([title, copy]) => <article key={title} style={{ border: "1px solid rgba(255,255,255,.085)", background: "rgba(255,255,255,.022)", borderRadius: 16, padding: 17 }}><div style={{ fontWeight: 850, fontSize: 15 }}>{title}</div><p style={{ margin: "7px 0 0", color: "#8095ae", lineHeight: 1.6, fontSize: 12 }}>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section id="pilot" style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(20px,5vw,24px) 96px" }}>
        <div style={{ border: "1px solid rgba(103,232,249,.24)", background: "linear-gradient(135deg, rgba(103,232,249,.09), rgba(255,255,255,.02))", borderRadius: 26, padding: "clamp(26px,6vw,38px)" }}>
          <div style={{ color: "#67e8f9", fontWeight: 800, fontSize: 12, letterSpacing: ".13em", textTransform: "uppercase" }}>30-day founding studio pilot</div>
          <h2 style={{ margin: "12px 0 0", maxWidth: 800, fontSize: "clamp(30px,6vw,44px)", lineHeight: 1.06, letterSpacing: "-.04em" }}>Prove PlayDirective is useful before you pay for it.</h2>
          <p style={{ maxWidth: 790, color: "#9fb1c7", lineHeight: 1.7 }}>The founding pilot is free during validation. Connect one Roblox experience, let PlayDirective surface the highest-priority decisions, and only consider a paid plan after your team has seen something genuinely useful.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}><a href="/pricing" style={{ background: "#67e8f9", color: "#07101f", padding: "12px 16px", borderRadius: 11, fontWeight: 900, textDecoration: "none" }}>Start free pilot</a><a href="/demo/pilot" style={{ border: "1px solid rgba(255,255,255,.13)", color: "#eef7ff", padding: "12px 16px", borderRadius: 11, fontWeight: 800, textDecoration: "none" }}>Preview pilot workspace</a></div>
        </div>
      </section>
    </main>
  );
}
