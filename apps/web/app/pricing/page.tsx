const plans = [
  {
    name: "Indie",
    price: "$19",
    subtitle: "For live indie teams that need one clear weekly priority.",
    experiences: "1 active experience",
    features: ["Top-3 decision queue", "AI Product Analyst", "Experiment Copilot", "Weekly Growth Brief"],
    cta: "Apply for founding pilot",
    href: "/apply",
    featured: true,
  },
  {
    name: "Growth",
    price: "$49",
    subtitle: "For teams running recurring updates and paid acquisition.",
    experiences: "Up to 3 active experiences",
    features: ["Everything in Indie", "Priority evidence history", "Pilot feedback workflow", "Multi-experience coverage"],
    cta: "Apply for founding pilot",
    href: "/apply",
  },
  {
    name: "Studio",
    price: "$99",
    subtitle: "For multi-experience teams that need one decision layer.",
    experiences: "Up to 10 active experiences",
    features: ["Everything in Growth", "Portfolio-level weekly review", "Priority support", "Expanded experience limits"],
    cta: "Apply for founding pilot",
    href: "/apply",
  },
];

const pilotSteps = [
  ["01", "Day 1", "Connect", "Activate your private workspace and connect one live Roblox experience with read-only analytics access."],
  ["02", "Week 1", "First value", "Review the first supported priorities and the evidence behind them."],
  ["03", "Week 2", "Experiment", "Turn a supported priority into a bounded experiment with KPI and guardrails."],
  ["04", "Day 30", "Decide", "Continue only if PlayDirective has earned a place in your workflow. No automatic paid conversion."],
];

const trustItems = [
  ["Do you need write access?", "No. The founding workflow is designed around read-only Roblox analytics access."],
  ["Where is the app hosted?", "The PlayDirective production runtime is self-hosted on the Hetzner server in Germany."],
  ["Do I need a credit card for the pilot?", "No. A paid plan starts only after explicit Stripe Checkout confirmation."],
  ["Can I revoke the Roblox key?", "Yes. You control the Roblox credential and can revoke it in Roblox at any time."],
];

export default function PricingPage() {
  return (
    <main className="pricing-shell">
      <style>{`
        :root{color-scheme:dark}
        html{scroll-behavior:smooth}
        body{margin:0;background:#06101e}
        .pricing-shell{--bg:#06101e;--panel:#0a192b;--panel2:#0d2035;--line:#163854;--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(0,202,255,.12),transparent 26%),radial-gradient(circle at 90% 46%,rgba(37,99,235,.045),transparent 30%),linear-gradient(180deg,#06101e,#071220 56%,#06101e);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden;position:relative}
        .pricing-shell *{box-sizing:border-box}.pricing-shell a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 40px));margin:0 auto;position:relative}
        .header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.82);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.08)}
        .header-inner{height:78px;display:flex;align-items:center;justify-content:space-between}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:24px;font-size:14px;color:#b9c9da}.nav a{transition:.2s ease}.nav a:hover{color:white}.nav-cta{padding:11px 16px;border:1px solid rgba(89,230,255,.34);border-radius:12px;background:rgba(24,211,246,.08);color:#efffff!important}
        .hero{padding:68px 0 34px;text-align:center}.eyebrow,.kicker{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:var(--cyan)}
        .hero h1{font-size:clamp(48px,6.2vw,76px);line-height:.97;letter-spacing:-.055em;max-width:900px;margin:17px auto 0}.hero p{max-width:760px;margin:23px auto 0;font-size:18px;line-height:1.65;color:#9fb1c7}
        .pilot-cta{margin-top:34px;border:1px solid rgba(89,230,255,.28);background:radial-gradient(circle at 88% 24%,rgba(0,198,255,.11),transparent 29%),linear-gradient(145deg,rgba(11,33,55,.98),rgba(7,21,36,.98));border-radius:26px;padding:31px 32px;display:grid;grid-template-columns:1fr auto;gap:28px;align-items:center;box-shadow:0 24px 75px rgba(0,0,0,.13),inset 0 1px 0 rgba(255,255,255,.03)}
        .pilot-cta h2{margin:8px 0 7px;font-size:29px;letter-spacing:-.025em}.pilot-cta p{margin:0;color:#9eb0c4;line-height:1.6;max-width:760px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 21px;border-radius:12px;font-size:14px;font-weight:850;transition:.2s ease;white-space:nowrap}.btn:hover{transform:translateY(-2px)}.btn-primary{background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f!important;box-shadow:0 12px 34px rgba(46,216,239,.15)}.btn-secondary{border:1px solid rgba(147,169,194,.3);background:rgba(7,16,31,.4)}
        .steps-section{padding:34px 0 62px}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;position:relative}.step{position:relative;border:1px solid rgba(91,169,217,.16);border-radius:20px;padding:20px;background:linear-gradient(145deg,rgba(12,30,50,.8),rgba(7,18,32,.92));min-height:178px}.step-num{position:absolute;right:16px;top:14px;color:rgba(89,230,255,.18);font-size:38px;font-weight:900;letter-spacing:-.06em}.step-time{font-size:11px;font-weight:900;color:var(--cyan);letter-spacing:.08em;text-transform:uppercase}.step h3{margin:10px 0 8px;font-size:20px}.step p{margin:0;color:#8fa2ba;font-size:13px;line-height:1.6;max-width:250px}
        .pricing-section{padding:6px 0 82px}.pricing-intro{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;margin-bottom:24px}.pricing-intro h2{font-size:clamp(36px,4vw,52px);line-height:1.02;letter-spacing:-.045em;margin:8px 0 0}.pricing-note{max-width:470px;color:#718198;font-size:12px;line-height:1.65;text-align:right}
        .plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.plan-card{position:relative;border:1px solid rgba(91,169,217,.17);background:linear-gradient(145deg,rgba(10,27,47,.95),rgba(6,17,31,.98));border-radius:24px;padding:25px;display:flex;flex-direction:column;min-height:500px;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.plan-card.featured{border-color:rgba(89,230,255,.4);background:radial-gradient(circle at 96% 0%,rgba(0,198,255,.09),transparent 35%),linear-gradient(145deg,rgba(11,34,55,.98),rgba(6,18,31,.99));box-shadow:0 24px 70px rgba(0,190,255,.06),inset 0 1px 0 rgba(255,255,255,.04)}
        .plan-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.plan-head h3{font-size:24px;margin:0}.badge{font-size:10px;font-weight:900;letter-spacing:.07em;color:#a5f3fc;border:1px solid rgba(103,232,249,.3);background:rgba(103,232,249,.06);border-radius:999px;padding:6px 9px}.price{margin-top:17px;font-size:48px;font-weight:900;letter-spacing:-.045em}.price span{font-size:12px;color:#718198;font-weight:650;letter-spacing:0;margin-left:3px}.plan-subtitle{color:#9fb1c7;line-height:1.58;min-height:76px;margin:11px 0 18px}.experience{font-size:11px;color:var(--cyan);font-weight:900;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px}.features{display:grid;gap:0;margin-bottom:22px}.feature{padding:10px 0;border-top:1px solid rgba(255,255,255,.065);font-size:14px;color:#c7d5e5}.feature:before{content:"✓";color:#78ebd0;margin-right:7px}.plan-card .btn{margin-top:auto;width:100%}
        .trust-panel{border-top:1px solid rgba(132,173,205,.15);border-bottom:1px solid rgba(132,173,205,.15);padding:34px 0 36px;margin-top:10px}.trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}.trust-item strong{display:block;font-size:13px;margin-bottom:9px}.trust-item p{margin:0;color:#879bb3;font-size:12px;line-height:1.65}
        .footer{margin-top:70px;border-top:1px solid rgba(132,173,205,.12);background:rgba(4,12,23,.42)}.footer-inner{min-height:102px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#758aa1;font-size:12px}.footer-links{display:flex;gap:20px}.footer a:hover{color:#dfefff}
        .deco{position:absolute;pointer-events:none;opacity:.13;filter:drop-shadow(0 12px 24px rgba(0,191,255,.12));z-index:0}.deco-1{width:80px;left:3%;top:18%}.deco-2{width:110px;right:3%;top:39%}.deco-3{width:62px;left:7%;top:62%}.deco-4{width:92px;right:7%;top:77%}.deco-5{width:44px;left:46%;top:31%}.pricing-shell>header,.pricing-shell>section,.pricing-shell>footer{position:relative;z-index:1}
        @media(max-width:920px){.nav>a:not(.nav-cta){display:none}.hero{padding-top:50px}.pilot-cta{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr}.plan-grid{grid-template-columns:1fr}.plan-card{min-height:auto}.pricing-intro{align-items:flex-start;flex-direction:column}.pricing-note{text-align:left}.trust-grid{grid-template-columns:1fr 1fr}.deco{opacity:.07}}
        @media(max-width:560px){.wrap{width:calc(100% - 24px)}.header-inner{height:68px}.brand-logo{width:168px}.nav-cta{font-size:12px;padding:10px 12px}.hero h1{font-size:45px}.hero p{font-size:16px}.pilot-cta{padding:24px 19px}.pilot-cta h2{font-size:25px}.pilot-cta .btn{width:100%}.steps{grid-template-columns:1fr}.pricing-section{padding-bottom:58px}.pricing-intro h2{font-size:38px}.plan-card{padding:20px}.price{font-size:44px}.trust-grid{grid-template-columns:1fr}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0}.footer-links{flex-wrap:wrap}.deco{display:none}}
      `}</style>

      <img className="deco deco-1" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />
      <img className="deco deco-2" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />
      <img className="deco deco-3" src="/brand/playdirective/deco-cubes2.png" alt="" aria-hidden="true" />
      <img className="deco deco-4" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />
      <img className="deco deco-5" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/demo">Demo</a>
            <a href="/pricing">Pricing</a>
            <a href="/app/login">Pilot sign in</a>
            <a className="nav-cta" href="/apply">Apply for pilot</a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <div className="eyebrow">Founding studio pricing</div>
        <h1>Prove the value first. Pay only after PlayDirective earns its place.</h1>
        <p>Every founding studio starts with the same guided 30-day pilot. Connect one live Roblox experience, review evidence-backed priorities and see whether PlayDirective produces decisions your team genuinely wants to act on.</p>

        <div className="pilot-cta">
          <div>
            <div className="kicker">30-day founding studio pilot · free</div>
            <h2>One live experience. One useful decision before you pay.</h2>
            <p>Invite-only and guided during validation. No card required. The pilot does not auto-convert to a paid subscription. Paid service begins only after an authorized owner explicitly confirms Stripe Checkout.</p>
          </div>
          <a className="btn btn-primary" href="/apply">Apply for founding pilot →</a>
        </div>
      </section>

      <section className="steps-section wrap">
        <div className="steps">
          {pilotSteps.map(([num, when, title, copy]) => (
            <article className="step" key={when}>
              <div className="step-num">{num}</div>
              <div className="step-time">{when}</div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section wrap">
        <div className="pricing-intro">
          <div>
            <div className="kicker">Plans after validation</div>
            <h2>Choose the layer your studio needs.</h2>
          </div>
          <div className="pricing-note">After the founding pilot, choose the plan that matches your studio. Prices are shown in USD per month. Applicable taxes may be added depending on customer location and tax status.</div>
        </div>

        <div className="plan-grid">
          {plans.map((plan) => (
            <article className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.name}>
              <div className="plan-head"><h3>{plan.name}</h3>{plan.featured && <span className="badge">BEST FIT</span>}</div>
              <div className="price">{plan.price}<span>/mo</span></div>
              <p className="plan-subtitle">{plan.subtitle}</p>
              <div className="experience">{plan.experiences}</div>
              <div className="features">{plan.features.map((feature) => <div className="feature" key={feature}>{feature}</div>)}</div>
              <a className={`btn ${plan.featured ? "btn-primary" : "btn-secondary"}`} href={plan.href}>{plan.cta}</a>
            </article>
          ))}
        </div>

        <div className="trust-panel">
          <div className="trust-grid">
            {trustItems.map(([q,a]) => <div className="trust-item" key={q}><strong>{q}</strong><p>{a}</p></div>)}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>PlayDirective · Early Access</span>
          <div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a></div>
        </div>
      </footer>
    </main>
  );
}
