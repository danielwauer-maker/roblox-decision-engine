export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#07101f', color: '#eef7ff', fontFamily: 'Arial, sans-serif' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(64px, 12vw, 96px) clamp(20px, 5vw, 24px)' }}>
        <div style={{ fontSize: 'clamp(11px, 3vw, 12px)', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#67e8f9', fontWeight: 700 }}>
          AI Product & Growth Analyst for Roblox
        </div>
        <h1 style={{ marginTop: 18, maxWidth: 900, fontSize: 'clamp(44px, 11vw, 64px)', lineHeight: 0.98, letterSpacing: '-0.05em' }}>
          Know what to fix next.
        </h1>
        <p style={{ marginTop: 24, maxWidth: 760, color: '#9fb1c7', fontSize: 'clamp(17px, 4.6vw, 20px)', lineHeight: 1.6 }}>
          Roblox Decision Engine turns retention, monetization and funnel signals into three grounded priorities, the evidence behind them and a concrete experiment plan.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
          <a href="#early-access" style={{ background: '#67e8f9', color: '#07101f', padding: '13px 18px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>Join Early Access</a>
          <a href="#workflow" style={{ border: '1px solid rgba(255,255,255,.14)', color: '#eef7ff', padding: '13px 18px', borderRadius: 12, textDecoration: 'none', fontSize: 16 }}>See how it works</a>
          <a href="/portfolio" style={{ border: '1px solid rgba(103,232,249,.24)', color: '#a5f3fc', padding: '13px 18px', borderRadius: 12, textDecoration: 'none', fontSize: 16 }}>Portfolio / Build Log</a>
        </div>
      </section>

      <section id="workflow" style={{ maxWidth: 1120, margin: '0 auto', padding: '12px clamp(20px, 5vw, 24px) 72px' }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            ['1', 'Connect', 'Connect one Roblox experience with least-privilege analytics access.'],
            ['2', 'Detect', 'Identify the highest-impact retention, onboarding or monetization issue.'],
            ['3', 'Explain', 'See the metric, segment, baseline and confidence behind every recommendation.'],
            ['4', 'Act', 'Turn the finding into a structured experiment with KPI and guardrails.']
          ].map(([id, title, copy]) => (
            <article key={id} style={{ border: '1px solid rgba(255,255,255,.10)', borderRadius: 20, padding: 22, background: 'rgba(255,255,255,.025)' }}>
              <div style={{ color: '#67e8f9', fontSize: 12, fontWeight: 700 }}>{id}</div>
              <h2 style={{ marginTop: 12, fontSize: 22 }}>{title}</h2>
              <p style={{ color: '#9fb1c7', lineHeight: 1.6 }}>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="early-access" style={{ maxWidth: 1120, margin: '0 auto', padding: '32px clamp(20px, 5vw, 24px) 88px' }}>
        <div style={{ border: '1px solid rgba(103,232,249,.25)', background: 'rgba(103,232,249,.05)', borderRadius: 24, padding: 'clamp(24px, 6vw, 32px)' }}>
          <div style={{ color: '#67e8f9', fontWeight: 700 }}>Early Access Pilot</div>
          <h2 style={{ marginTop: 10, fontSize: 'clamp(28px, 7vw, 34px)', lineHeight: 1.1 }}>Built for studios with live traffic, without a full-time product analyst.</h2>
          <p style={{ maxWidth: 760, color: '#9fb1c7', lineHeight: 1.7 }}>Initial pilot target: Roblox teams with meaningful live traffic and monetization that want clearer priorities, better experiments and less wasted acquisition spend.</p>
        </div>
      </section>
    </main>
  );
}
