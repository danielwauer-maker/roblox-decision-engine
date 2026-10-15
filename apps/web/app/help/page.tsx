const helpCards = [
  {
    eyebrow: "Getting started",
    title: "Connect Roblox safely",
    copy: "Create a dedicated least-privilege Roblox Open Cloud key and connect one experience without granting publish access.",
    href: "/help/roblox-connection",
    cta: "Open connection guide →",
  },
  {
    eyebrow: "Product tour",
    title: "Explore the simulated demo",
    copy: "Walk through priorities, investigation, experiments and the Weekly Growth Brief before connecting live studio data.",
    href: "/demo",
    cta: "Open demo →",
  },
  {
    eyebrow: "Founding pilot",
    title: "Understand the pilot flow",
    copy: "See how application, private invite, read-only connection and the first evidence-backed decision fit together.",
    href: "/demo/pilot",
    cta: "View pilot flow →",
  },
  {
    eyebrow: "Plans",
    title: "Pricing after validation",
    copy: "Review the founding pilot and the Indie, Growth and Studio plans available after PlayDirective proves useful.",
    href: "/pricing",
    cta: "View pricing →",
  },
];

const quickAnswers = [
  ["Does PlayDirective need write access?", "No. The workflow is designed around read-only analytics access."],
  ["Where is production hosted?", "The PlayDirective production runtime is hosted on Hetzner in Germany."],
  ["Can I revoke the Roblox key?", "Yes. Your studio controls the Roblox credential and can revoke it in Roblox at any time."],
  ["Do I need a card for the pilot?", "No. The founding pilot is free during validation and does not auto-convert to a paid plan."],
];

export default function HelpPage() {
  return (
    <main className="help-shell">
      <style>{`
        :root{color-scheme:dark}html{scroll-behavior:smooth}body{margin:0;background:#06101e}
        .help-shell{--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(0,202,255,.11),transparent 26%),linear-gradient(180deg,#06101e,#071220 58%,#06101e);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;position:relative}
        .help-shell *{box-sizing:border-box}.help-shell a{color:inherit;text-decoration:none}.wrap{width:min(1080px,calc(100% - 40px));margin:0 auto;position:relative}
        .header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.82);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.08)}.header-inner{height:78px;display:flex;align-items:center;justify-content:space-between}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:24px;font-size:14px;color:#b9c9da}.nav a:hover{color:white}.nav-cta{padding:11px 16px;border:1px solid rgba(89,230,255,.34);border-radius:12px;background:rgba(24,211,246,.08);color:#efffff!important}
        .hero{padding:72px 0 44px;text-align:center}.eyebrow,.kicker{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:var(--cyan)}.hero h1{font-size:clamp(48px,6vw,72px);line-height:.98;letter-spacing:-.055em;margin:16px auto 18px;max-width:820px}.hero p{max-width:720px;margin:0 auto;color:#9fb1c7;font-size:18px;line-height:1.65}
        .card-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:18px 0 58px}.help-card{border:1px solid rgba(91,169,217,.18);background:linear-gradient(145deg,rgba(10,27,47,.95),rgba(6,17,31,.98));border-radius:24px;padding:26px;min-height:230px;display:flex;flex-direction:column;box-shadow:inset 0 1px 0 rgba(255,255,255,.025);transition:.2s ease}.help-card:hover{transform:translateY(-2px);border-color:rgba(89,230,255,.3)}.help-card h2{font-size:26px;letter-spacing:-.03em;margin:10px 0 10px}.help-card p{color:#91a6bf;line-height:1.62;margin:0 0 22px}.help-card .link{margin-top:auto;color:#bff8ff;font-weight:800;font-size:14px}
        .answers{padding:10px 0 74px}.answers-head{margin-bottom:22px}.answers-head h2{font-size:clamp(34px,4vw,48px);letter-spacing:-.045em;margin:9px 0 0}.answer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.answer{border-top:1px solid rgba(132,173,205,.17);padding:20px 2px}.answer strong{display:block;font-size:15px;margin-bottom:8px}.answer p{margin:0;color:#879bb3;font-size:13px;line-height:1.65}
        .contact{margin-bottom:78px;border:1px solid rgba(89,230,255,.23);background:radial-gradient(circle at 85% 30%,rgba(0,198,255,.08),transparent 30%),linear-gradient(145deg,rgba(11,33,55,.97),rgba(7,21,36,.98));border-radius:24px;padding:30px;display:flex;align-items:center;justify-content:space-between;gap:28px}.contact h2{margin:8px 0 7px;font-size:28px}.contact p{margin:0;color:#91a6bf;line-height:1.6;max-width:690px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 20px;border-radius:12px;font-size:14px;font-weight:850;background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f!important;white-space:nowrap;box-shadow:0 12px 34px rgba(46,216,239,.14)}
        .footer{border-top:1px solid rgba(132,173,205,.12);background:rgba(4,12,23,.42)}.footer-inner{min-height:102px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#758aa1;font-size:12px}.footer-links{display:flex;gap:20px}.footer a:hover{color:#dfefff}
        .deco{position:absolute;pointer-events:none;opacity:.08;filter:drop-shadow(0 12px 24px rgba(0,191,255,.12));z-index:0}.deco-1{width:78px;left:4%;top:24%}.deco-2{width:100px;right:4%;top:48%}.help-shell>header,.help-shell>section,.help-shell>footer{position:relative;z-index:1}
        @media(max-width:820px){.nav>a:not(.nav-cta){display:none}.card-grid,.answer-grid{grid-template-columns:1fr}.contact{align-items:flex-start;flex-direction:column}.deco{opacity:.04}}
        @media(max-width:560px){.wrap{width:calc(100% - 24px)}.header-inner{height:68px}.brand-logo{width:168px}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding:48px 0 28px}.hero h1{font-size:44px}.hero p{font-size:16px}.help-card{padding:21px;min-height:auto}.contact{padding:24px 19px}.contact .btn{width:100%}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0}.footer-links{flex-wrap:wrap}.deco{display:none}}
      `}</style>

      <img className="deco deco-1" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />
      <img className="deco deco-2" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/demo">Demo</a><a href="/pricing">Pricing</a><a href="/apply">Pilot</a><a className="nav-cta" href="/app/login">Pilot sign in</a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <div className="eyebrow">PlayDirective help center</div>
        <h1>Everything you need to get started safely.</h1>
        <p>Find the core setup, pilot and product guidance for PlayDirective. Start with the Roblox connection guide or explore the simulated workflow before connecting live studio data.</p>
      </section>

      <section className="wrap card-grid">
        {helpCards.map((card) => <a className="help-card" href={card.href} key={card.title}><div className="kicker">{card.eyebrow}</div><h2>{card.title}</h2><p>{card.copy}</p><span className="link">{card.cta}</span></a>)}
      </section>

      <section className="wrap answers">
        <div className="answers-head"><div className="kicker">Quick answers</div><h2>Common questions, answered clearly.</h2></div>
        <div className="answer-grid">{quickAnswers.map(([q,a]) => <div className="answer" key={q}><strong>{q}</strong><p>{a}</p></div>)}</div>
      </section>

      <section className="wrap contact">
        <div><div className="kicker">Founding studio pilot</div><h2>Need a private workspace?</h2><p>Apply for the guided founding pilot. Approved studios receive a private invite before any real Roblox credential is entered.</p></div>
        <a className="btn" href="/apply">Apply for founding pilot →</a>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><span>PlayDirective · Early Access</span><div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a></div></div></footer>
    </main>
  );
}
