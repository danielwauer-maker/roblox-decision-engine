export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#07101f', color: '#eef7ff', fontFamily: 'Arial, sans-serif' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 700 }}>
          AI Product & Growth Analyst for Roblox
        </div>
        <h1 style={{ marginTop: 18, maxWidth: 900, fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.05em' }}>
          Know what to fix next.
        </h1>
        <p style={{ marginTop: 24, maxWidth: 760, color: '#9fb1c7', fontSize: 20, lineHeight: 1.7 }}>
          Roblox Decision Engine turns retention, monetization and funnel signals into three grounded priorities, the evidence behind them and a concrete experiment plan.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 34 }}>
          <a href="#early-access" style={{ background: '#67e8f9', color: '#07101f', padding: '14px 20px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Join Early Access</a>
          <a href="#workflow" style={{ border: '1px solid rgba(255,255,255,.14)', color: '#eef7ff', padding: '14px 20px', borderRadius: 12, textDecoration: 'none' }}>See how it works</a>
        </div>
      </section>

      <section id="workflow" style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 24px 72px' }}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            ['1', 'Connect', 'Connect one Roblox experience with least-privilege analytics access.'],
            ['2', 'Detect', 'Identify the highest-impact retention, onboarding or monetization issue.'],
            ['3', 'Explain', 'See the metric, segment, baseline and confidence behind every recommendation.'],
            ['4', 'Act', 'Turn the finding into a structured experiment with KPI and guardrails.']
          ].map(([id, title, copy]) => (
            <article key={id} style={{ border: '1px solid rgba(255,255,255,.10)', borderRadius: 20, padding: 24, background: 'rgba(255,255,255,.025)' }}>
              <div style={{ color: '#67e8f9', fontSize: 12, fontWeight: 700 }}>{id}</div>
              <h2 style={{ marginTop: 12, fontSize: 22 }}>{title}</h2>
              <p style={{ color: '#9fb1c7', lineHeight: 1.6 }}>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="early-access" style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 96px' }}>
        <div style={{ border: '1px solid rgba(103,232,249,.25)', background: 'rgba(103,232,249,.05)', borderRadius: 24, padding: 32 }}>
          <div style={{ color: '#67e8f9', fontWeight: 700 }}>Early Access Pilot</div>
          <h2 style={{ marginTop: 10, fontSize: 34 }}>Built for studios with live traffic, without a full-time product analyst.</h2>
          <p style={{ maxWidth: 760, color: '#9fb1c7', lineHeight: 1.7 }}>Initial pilot target: Roblox teams with meaningful live traffic and monetization that want clearer priorities, better experiments and less wasted acquisition spend.</p>
        </div>
      </section>
    </main>
  );
}
