import catalog from "../../../shared/commercial_plans.json";

export const dynamic = "force-dynamic";

const planCatalog = catalog.plans;
const pilotCatalog = catalog.pilot;
const trialCatalog = catalog.standard_trial;
const trialPlan = planCatalog.find((plan) => plan.plan_id === trialCatalog.plan_id)!;
const commercialMode = process.env.PLAYDIRECTIVE_COMMERCIAL_MODE || catalog.commercial_mode_default;
const featureLabels: Record<string, string> = {
  core_analytics: "Core Analytics",
  advanced_analytics: "Advanced Analytics",
  decision_engine: "Decision Engine",
  recommendations: "Recommendations",
  alerts: "Alerts and anomaly detection",
  cross_experience: "Cross-Experience analytics",
  exports: "Exports",
  api_access: "API access",
  portfolio_intelligence: "Studio / Portfolio Intelligence",
  priority_processing: "Priority processing",
};
const display = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

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
  const pilot = commercialMode !== "standard";
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
        .mobile-menu{display:none;position:relative}.mobile-menu summary{list-style:none;width:40px;height:40px;border:1px solid rgba(89,230,255,.3);border-radius:10px;display:grid;place-items:center;cursor:pointer;background:rgba(24,211,246,.06);color:#dffbff;font-size:0}.mobile-menu summary::-webkit-details-marker{display:none}.mobile-menu summary:before{content:"☰";font-size:20px;line-height:1}.mobile-menu[open] summary:before{content:"×";font-size:25px}.mobile-menu-panel{position:absolute;right:0;top:48px;width:min(290px,calc(100vw - 32px));padding:10px;background:rgba(8,23,39,.98);border:1px solid rgba(89,230,255,.22);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4);display:grid;gap:4px}.mobile-menu-panel a{padding:13px 14px;border-radius:10px;color:#c9d8e7;font-size:14px;font-weight:700}.mobile-menu-panel a:hover{background:rgba(89,230,255,.08);color:#fff}.mobile-menu-panel .mobile-primary{margin-top:4px;text-align:center;background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f!important}
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
        @media(max-width:920px){.nav{display:none}.mobile-menu{display:block}.hero{padding-top:46px}.pilot-cta{grid-template-columns:1fr}.steps{grid-template-columns:1fr 1fr}.plan-grid{grid-template-columns:1fr}.plan-card{min-height:auto}.pricing-intro{align-items:flex-start;flex-direction:column}.pricing-note{text-align:left}.trust-grid{grid-template-columns:1fr 1fr}.deco{opacity:.07}}
        @media(max-width:560px){.wrap{width:calc(100% - 32px)}.header-inner{height:60px}.brand-logo{width:150px}.mobile-menu summary{width:38px;height:38px}.mobile-menu-panel{top:45px}.hero{padding:34px 0 26px}.eyebrow,.kicker{font-size:10.5px;letter-spacing:.18em}.hero h1{font-size:40px;line-height:.99;margin-top:13px}.hero p{font-size:15px;line-height:1.55;margin-top:18px;color:#a7b9cc}.pilot-cta{margin-top:28px;padding:22px 18px;border-radius:22px;gap:18px}.pilot-cta h2{font-size:25px;line-height:1.08;margin:8px 0 9px}.pilot-cta p{font-size:14px;line-height:1.55}.pilot-cta .btn{width:100%;min-height:52px;font-size:13.5px}.steps-section{padding:26px 0 50px}.steps{grid-template-columns:1fr;gap:11px}.step{min-height:auto;padding:17px 18px;border-radius:18px}.step-num{font-size:34px;right:15px;top:12px}.step h3{font-size:19px;margin:8px 0 6px}.step p{font-size:13.5px;line-height:1.55;max-width:88%}.pricing-section{padding:0 0 54px}.pricing-intro{gap:12px;margin-bottom:20px}.pricing-intro h2{font-size:36px;line-height:1.02}.pricing-note{font-size:12.5px;line-height:1.55;color:#8ca0b8}.plan-grid{gap:13px}.plan-card{padding:20px;border-radius:20px}.plan-card:not(.featured){border-color:rgba(91,169,217,.24);background:linear-gradient(145deg,rgba(11,29,49,.97),rgba(6,18,32,.99))}.plan-head h3{font-size:23px}.price{font-size:44px;margin-top:14px}.plan-subtitle{font-size:14px;line-height:1.55;min-height:auto;margin:9px 0 17px}.experience{font-size:10px;margin-bottom:10px}.feature{font-size:13.5px;line-height:1.4;padding:9px 0}.features{margin-bottom:18px}.plan-card .btn{min-height:50px;font-size:13px}.trust-panel{padding:26px 0 28px;margin-top:7px}.trust-grid{grid-template-columns:1fr;gap:20px}.trust-item{padding-bottom:18px;border-bottom:1px solid rgba(132,173,205,.11)}.trust-item:last-child{padding-bottom:0;border-bottom:0}.trust-item strong{font-size:14px;margin-bottom:7px}.trust-item p{font-size:13px;line-height:1.55}.footer{margin-top:48px}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0;min-height:auto;font-size:12.5px}.footer-links{flex-wrap:wrap;gap:16px}.deco{display:none}}
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
            <a className="nav-cta" href={pilot ? "/apply" : "/start-trial"}>{pilot ? "Apply for pilot" : "Start Indie trial"}</a>
          </nav>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <nav className="mobile-menu-panel" aria-label="Mobile navigation">
              <a href="/">Home</a>
              <a href="/demo">Demo</a>
              <a href="/pricing">Pricing</a>
              <a href="/help">Help</a>
              <a href="/app/login">Pilot sign in</a>
              <a className="mobile-primary" href={pilot ? "/apply" : "/start-trial"}>{pilot ? "Apply for founding pilot" : "Start Indie trial"}</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero wrap">
        <div className="eyebrow">{pilot ? "Founding studio pricing" : "Studio pricing"}</div>
        <h1>{pilot ? "Prove the value first. Pay only after PlayDirective earns its place." : "Decision analytics for every stage of your studio."}</h1>
        <p>{pilot ? "Every founding studio starts with the same guided 30-day pilot. Connect one live Roblox experience, review evidence-backed priorities and see whether PlayDirective produces decisions your team genuinely wants to act on." : "Choose the monthly plan that fits your studio. Start with a 14-day Indie trial, then manage your subscription from your workspace."}</p>

        {pilot ? <div className="pilot-cta">
          <div>
            <div className="kicker">{pilotCatalog.duration_days}-day founding studio pilot · free</div>
            <h2>One live experience. One useful decision before you pay.</h2>
            <p>Invite-only and guided during validation. No card required. The pilot does not auto-convert to a paid subscription. Paid service begins only after an authorized owner explicitly confirms Stripe Checkout. Pilot access includes {pilotCatalog.max_experiences} experiences, {pilotCatalog.max_team_members} seats and {pilotCatalog.decision_credits} Decision credits.</p>
          </div>
          <a className="btn btn-primary" href="/apply">Apply for founding pilot →</a>
        </div> : <div className="pilot-cta">
          <div>
            <div className="kicker">{trialCatalog.duration_days}-day standard trial</div>
            <h2>Start with Indie. Upgrade when your studio is ready.</h2>
            <p>Payment method required. After the trial, Indie is ${trialPlan.monthly_price_usd}/month unless canceled before it ends. Prior Founding Pilot participants are not eligible for another trial.</p>
          </div>
          <a className="btn btn-primary" href="/start-trial">Start 14-day Indie trial →</a>
        </div>}
      </section>

      {pilot && <section className="steps-section wrap">
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
      </section>}

      <section className="pricing-section wrap">
        <div className="pricing-intro">
          <div>
            <div className="kicker">{pilot ? "Plans after validation" : "Monthly plans"}</div>
            <h2>Choose the layer your studio needs.</h2>
          </div>
          <div className="pricing-note">USD, billed monthly. Taxes included where applicable; availability and tax treatment vary by customer location. Business customers can provide company and VAT details during account setup.</div>
        </div>

        <div className="plan-grid">
          {planCatalog.map((plan) => {
            const isRecommended = plan.recommended;
            const included = Object.entries(plan.feature_status).filter(([, status]) => status !== "not_included");
            const history = plan.history_days >= 365 ? `${plan.history_days / 365}-year history` : `${plan.history_days}-day history`;
            return <article className={`plan-card${isRecommended ? " featured" : ""}`} key={plan.plan_id}>
              <div className="plan-head"><h3>{plan.display_name}</h3>{isRecommended && <span className="badge">MOST POPULAR</span>}</div>
              <div className="price">${plan.monthly_price_usd}<span>/mo</span></div>
              <p className="plan-subtitle">{plan.max_experiences} {plan.max_experiences === 1 ? "Experience" : "Experiences"} · {plan.max_team_members} {plan.max_team_members === 1 ? "seat" : "seats"} · {history} · {plan.monthly_decision_credits.toLocaleString()} Decisions/month</p>
              <div className="experience">{plan.max_experiences} {plan.max_experiences === 1 ? "active experience" : "active experiences"} · {plan.max_team_members} {plan.max_team_members === 1 ? "seat" : "seats"}</div>
              <div className="features">{included.map(([key, status]) => <div className="feature" key={key}>{featureLabels[key] || display(key)}{status === "coming_soon" ? " — Coming soon" : ""}</div>)}</div>
              <a className={`btn ${isRecommended ? "btn-primary" : "btn-secondary"}`} href={pilot ? "/apply" : "/start-trial"}>{pilot ? "Apply for founding pilot" : "Start with Indie trial"}</a>
            </article>
          })}
        </div>

        <p style={{ marginTop: 24, color: "#8fa2ba", fontSize: 13, lineHeight: 1.7 }}>Decision credits are used only for successful, user-requested Decision Engine or AI decision generation. Viewing existing dashboards and decisions does not use credits.</p>

        {pilot && <div className="trust-panel">
          <div className="trust-grid">
            {trustItems.map(([q,a]) => <div className="trust-item" key={q}><strong>{q}</strong><p>{a}</p></div>)}
          </div>
        </div>}
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
