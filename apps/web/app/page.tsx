const decisionQueue = [
  ["1", "Fix mobile onboarding friction", "HIGH IMPACT", "RETENTION", "red", "↗"],
  ["2", "Protect paid acquisition", "PROTECT SPEND", "MONETIZATION", "yellow", "▥"],
  ["3", "Move starter offer", "OPPORTUNITY", "CONVERSION", "green", "▥"],
  ["4", "Test new game loop", "EXPERIMENT", "ENGAGEMENT", "blue", "⌁"],
];

const workflow = [
  ["01", "Connect", "Read aggregated Roblox analytics with least-privilege access.", "/brand/playdirective/workflow-connect.svg"],
  ["02", "Prioritize", "Rank the three product decisions with the highest likely impact.", "/brand/playdirective/workflow-prioritize.svg"],
  ["03", "Prove", "Show the segment, baseline and funnel evidence behind every recommendation.", "/brand/playdirective/workflow-prove.svg"],
  ["04", "Experiment", "Turn a supported finding into a test plan with KPIs and guardrails.", "/brand/playdirective/workflow-experiment.svg"],
];

const security = [
  ["READ-ONLY", "Read-only analytics", "PlayDirective only needs analytics access. It does not require permission to edit or publish your Roblox experience.", "/brand/playdirective/trust-readonly.svg"],
  ["ENCRYPTED", "Encrypted credentials", "Your Roblox Open Cloud key is encrypted before storage and is never returned to browser JavaScript or the operator dashboard.", "/brand/playdirective/trust-encrypted.svg"],
  ["PRIVATE", "Studio-isolated workspace", "Each studio has its own private tenant, session and analytics path so one customer's data never becomes another studio's evidence.", "/brand/playdirective/trust-isolated.svg"],
  ["GERMANY", "Self-hosted production", "The PlayDirective web app, API and PostgreSQL database run on the production Hetzner server in Germany.", "/brand/playdirective/trust-germany.svg"],
];

const faq = [
  ["What data does PlayDirective access?", "PlayDirective is designed around aggregated Roblox analytics and product signals needed to explain retention, monetization and funnel changes."],
  ["Does PlayDirective require publish access?", "No. The product is designed around read-only analytics access and does not need permission to edit or publish your Roblox experience."],
  ["Is my data secure?", "Credentials are encrypted before storage and each studio is separated into its own tenant and analytics path."],
  ["How does the founding pilot work?", "The founding pilot is free for 30 days. Connect one live Roblox experience, review the resulting priorities and decide afterward whether PlayDirective earned its place."],
  ["When will paid plans be available?", "Founding studios validate the workflow first. Paid plans are introduced only after the pilot has demonstrated repeatable value."],
];

export default function Home() {
  return (
    <main className="site-shell">
      <style>{`
        :root{color-scheme:dark}html{scroll-behavior:smooth}body{margin:0;background:#06101e}.site-shell{--bg:#06101e;--panel:#0a192b;--panel2:#0d2035;--line:#163854;--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -5%,rgba(0,202,255,.11),transparent 28%),linear-gradient(180deg,#06101e 0%,#071220 50%,#06101e 100%);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}.site-shell *{box-sizing:border-box}.site-shell a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 40px));margin:0 auto;position:relative}.header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.84);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.09)}.header-inner{height:78px;display:flex;align-items:center;justify-content:space-between}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:28px;font-size:14px;color:#b9c9da}.nav a:hover{color:white}.nav-cta{padding:11px 17px;border:1px solid rgba(89,230,255,.35);border-radius:12px;color:#eaffff!important;background:rgba(24,211,246,.08)}.hero{padding:82px 0 70px;min-height:760px;display:flex;align-items:center}.hero-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:38px;align-items:center}.eyebrow,.kicker{font-size:13px;letter-spacing:.23em;text-transform:uppercase;font-weight:800;color:var(--cyan)}.hero h1{font-size:clamp(54px,6vw,82px);line-height:.96;letter-spacing:-.055em;margin:20px 0 26px;max-width:720px}.hero-copy{font-size:20px;line-height:1.55;color:#9fb1c7;max-width:650px;margin:0 0 30px}.cta-row{display:flex;gap:13px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 24px;border-radius:13px;font-size:15px;font-weight:800;transition:.2s ease}.btn:hover{transform:translateY(-2px)}.btn-primary{background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f!important;box-shadow:0 12px 36px rgba(46,216,239,.17)}.btn-secondary{border:1px solid rgba(147,169,194,.35);background:rgba(7,16,31,.45)}.hero-art{position:relative;min-height:580px;display:flex;align-items:center;justify-content:center}.hero-image{width:112%;max-width:800px;filter:drop-shadow(0 35px 80px rgba(0,191,255,.11));position:relative;z-index:2}.deco{position:absolute;pointer-events:none;opacity:.76;filter:drop-shadow(0 12px 28px rgba(0,191,255,.15))}.deco-a{width:100px;top:2%;right:-3%}.deco-b{width:112px;left:-7%;bottom:0}.deco-c{width:78px;right:4%;bottom:-1%}.trust-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid rgba(142,186,220,.12);border-bottom:1px solid rgba(142,186,220,.12);padding:22px 0;margin-bottom:105px}.trust-chip{padding:8px 22px;border-right:1px solid rgba(142,186,220,.11)}.trust-chip:last-child{border:0}.trust-chip b{display:block;color:var(--cyan);font-size:12px;letter-spacing:.2em;margin-bottom:8px}.trust-chip span{color:#869cb5;font-size:13px;line-height:1.45}.section{padding:86px 0}.section-head{max-width:860px;margin-bottom:42px}.section-title{font-size:clamp(42px,5vw,65px);line-height:1.01;letter-spacing:-.047em;margin:14px 0 15px}.section-copy{font-size:18px;line-height:1.6;color:#91a6bf;max-width:740px}.queue-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:54px;align-items:start}.queue-stack{display:grid;gap:13px}.queue-card{display:grid;grid-template-columns:58px 1fr 90px;gap:15px;align-items:center;background:linear-gradient(135deg,rgba(14,34,56,.94),rgba(7,19,33,.96));border:1px solid rgba(87,156,203,.23);border-radius:17px;padding:18px 20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.rank{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;font-weight:900;font-size:20px;color:#06101e}.rank.red{background:#ff6c9b}.rank.yellow{background:#ffd44a}.rank.green{background:#65efc5}.rank.blue{background:#c7daee}.queue-card h3{font-size:18px;margin:0 0 9px}.pills{display:flex;gap:8px;flex-wrap:wrap}.pill{font-size:10px;font-weight:900;letter-spacing:.05em;border-radius:999px;padding:5px 10px;border:1px solid rgba(148,163,184,.23);color:#b7c6d8}.pill.red{border-color:rgba(255,108,155,.6);color:#ff8bad;background:rgba(255,56,115,.10)}.pill.yellow{border-color:rgba(255,212,74,.55);color:#ffd75c;background:rgba(255,204,0,.08)}.pill.green{border-color:rgba(101,239,197,.55);color:#6df0cb;background:rgba(34,197,94,.07)}.pill.blue{border-color:rgba(93,177,255,.45);color:#8bc7ff;background:rgba(30,110,200,.08)}.queue-spark{font-size:36px;font-weight:900;text-align:right}.queue-spark.red{color:#ff6c9b}.queue-spark.yellow{color:#ffd43b}.queue-spark.green{color:#65efc5}.queue-spark.blue{color:#c7daee}.workflow-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}.workflow-card{position:relative;min-height:430px;border-radius:26px;background:radial-gradient(circle at 90% 0%,rgba(0,192,255,.11),transparent 35%),linear-gradient(145deg,rgba(12,30,50,.96),rgba(6,17,31,.98));border:1px solid rgba(91,169,217,.18);padding:24px;overflow:hidden}.workflow-image-wrap{height:275px;display:flex;align-items:center;justify-content:center}.workflow-image{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 22px 46px rgba(0,200,255,.12))}.workflow-meta{display:grid;grid-template-columns:46px 1fr;gap:14px;align-items:start}.workflow-id{color:var(--cyan);font-size:14px;font-weight:900;padding-top:5px}.workflow-meta h3{font-size:27px;margin:0 0 8px}.workflow-meta p{font-size:15px;color:#90a5be;line-height:1.55;margin:0}.security-intro{max-width:970px}.security-intro .section-title{max-width:980px}.security-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-top:38px}.security-card{background:linear-gradient(145deg,rgba(10,27,47,.97),rgba(6,17,31,.98));border:1px solid rgba(91,169,217,.19);border-radius:24px;padding:24px;min-height:510px;position:relative;overflow:hidden}.security-card:after{content:"";position:absolute;inset:auto -20% -35% 20%;height:170px;background:radial-gradient(circle,rgba(0,194,255,.08),transparent 65%)}.security-image-wrap{height:300px;display:flex;align-items:center;justify-content:center}.security-image{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 24px 46px rgba(0,191,255,.13))}.security-card .label{font-size:12px;letter-spacing:.18em;font-weight:900;color:var(--cyan);margin-bottom:10px}.security-card h3{font-size:23px;margin:0 0 10px}.security-card p{font-size:15px;line-height:1.6;color:#91a6bf;margin:0;position:relative;z-index:1}.pilot-panel{position:relative;overflow:hidden;background:radial-gradient(circle at 86% 30%,rgba(0,199,255,.13),transparent 28%),linear-gradient(145deg,#0b2137,#071524);border:1px solid rgba(89,230,255,.21);border-radius:30px;padding:54px;display:grid;grid-template-columns:1.2fr .8fr;gap:30px;align-items:center}.pilot-panel h2{font-size:clamp(38px,4vw,58px);line-height:1.02;letter-spacing:-.045em;margin:14px 0 17px}.pilot-panel p{color:#9eb0c4;line-height:1.6;font-size:17px;margin:0 0 26px}.pilot-art{display:flex;justify-content:center;position:relative;min-height:250px}.pilot-art img{width:min(100%,340px);object-fit:contain;filter:drop-shadow(0 24px 50px rgba(0,193,255,.16))}.faq-list{max-width:900px;margin-top:32px}.faq-item{border-top:1px solid rgba(132,173,205,.17);padding:0}.faq-item:last-child{border-bottom:1px solid rgba(132,173,205,.17)}.faq-item summary{list-style:none;cursor:pointer;padding:22px 2px;font-size:17px;font-weight:750;display:flex;justify-content:space-between;gap:20px}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary:after{content:"+";color:#8fb6d4;font-size:24px;font-weight:400}.faq-item[open] summary:after{content:"−"}.faq-item p{margin:0;padding:0 2px 22px;color:#91a6bf;line-height:1.65;max-width:760px}.footer{margin-top:80px;border-top:1px solid rgba(132,173,205,.13);padding:30px 0 38px;color:#7e94ad}.footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:13px}.footer-links{display:flex;gap:20px;flex-wrap:wrap}.footer-links a:hover{color:white}@media(max-width:920px){.wrap{width:min(100% - 28px,760px)}.header-inner{height:68px}.brand-logo{width:186px}.nav>a:not(.nav-cta){display:none}.hero{padding:48px 0 45px;min-height:auto}.hero-grid{grid-template-columns:1fr;gap:16px}.hero h1{font-size:clamp(46px,12vw,67px);max-width:650px}.hero-copy{font-size:17px}.hero-art{min-height:430px}.hero-image{width:108%;max-width:690px}.deco-a{width:75px;right:-2%}.deco-b{width:85px;left:-4%}.trust-strip{grid-template-columns:1fr 1fr;margin-bottom:70px}.trust-chip:nth-child(2){border-right:0}.trust-chip:nth-child(-n+2){border-bottom:1px solid rgba(142,186,220,.11)}.queue-grid{grid-template-columns:1fr;gap:25px}.workflow-grid,.security-cards{grid-template-columns:1fr}.pilot-panel{grid-template-columns:1fr;padding:38px 28px}.pilot-art{order:-1;min-height:180px}.pilot-art img{width:250px}.section{padding:64px 0}.workflow-card{min-height:400px}.security-card{min-height:470px}}@media(max-width:560px){.wrap{width:calc(100% - 24px)}.brand-logo{width:170px}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding-top:40px}.hero h1{font-size:47px;line-height:.98}.hero-copy{font-size:16px}.cta-row{display:grid}.btn{width:100%}.hero-art{min-height:340px;margin-top:10px}.hero-image{width:118%}.trust-strip{grid-template-columns:1fr;padding:0}.trust-chip{border-right:0!important;border-bottom:1px solid rgba(142,186,220,.11)!important;padding:18px 2px}.trust-chip:last-child{border-bottom:0!important}.section-title{font-size:40px}.queue-card{grid-template-columns:46px 1fr 42px;padding:15px 14px}.rank{width:40px;height:40px;font-size:17px}.queue-card h3{font-size:16px}.queue-spark{font-size:26px}.workflow-card{padding:18px;min-height:355px}.workflow-image-wrap{height:215px}.workflow-meta h3{font-size:24px}.security-card{padding:18px;min-height:410px}.security-image-wrap{height:230px}.pilot-panel{padding:30px 19px}.pilot-panel h2{font-size:39px}.footer-inner{align-items:flex-start;flex-direction:column}}
      `}</style>

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.svg" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="#workflow">How it works</a>
            <a href="#security">Security</a>
            <a href="/pricing">Pricing</a>
            <a className="nav-cta" href="/demo">See PlayDirective in action</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">Decision intelligence for Roblox studios</div>
            <h1>Know what changed. Know what to do next.</h1>
            <p className="hero-copy">Turn retention, monetization and funnel signals into evidence-backed priorities and concrete experiments.</p>
            <div className="cta-row">
              <a className="btn btn-primary" href="/demo">See PlayDirective in action →</a>
              <a className="btn btn-secondary" href="/apply">Apply for founding pilot</a>
            </div>
          </div>
          <div className="hero-art">
            <img className="hero-image" src="/brand/playdirective/hero.svg" alt="PlayDirective turns Roblox analytics into ranked decisions" />
            <img className="deco deco-a" src="/brand/playdirective/deco-cubes.svg" alt="" aria-hidden="true" />
            <img className="deco deco-b" src="/brand/playdirective/deco-cloud.svg" alt="" aria-hidden="true" />
            <img className="deco deco-c" src="/brand/playdirective/deco-cubes2.svg" alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="trust-strip">
          <div className="trust-chip"><b>READ-ONLY</b><span>Least-privilege Roblox analytics access</span></div>
          <div className="trust-chip"><b>ENCRYPTED</b><span>Credentials encrypted before storage</span></div>
          <div className="trust-chip"><b>PRIVATE</b><span>Tenant-isolated data and decisions</span></div>
          <div className="trust-chip"><b>GERMANY</b><span>Production runtime hosted on Hetzner in Germany</span></div>
        </div>
      </div>

      <section className="section wrap">
        <div className="queue-grid">
          <div className="section-head">
            <div className="kicker">Instant clarity</div>
            <h2 className="section-title">Your studio’s decision queue.</h2>
            <p className="section-copy">From raw signals to ranked opportunities. See what deserves attention first without digging through another dashboard.</p>
          </div>
          <div className="queue-stack">
            {decisionQueue.map(([rank,title,tag,category,tone,spark]) => (
              <article className="queue-card" key={rank}>
                <div className={`rank ${tone}`}>{rank}</div>
                <div><h3>{title}</h3><div className="pills"><span className={`pill ${tone}`}>{tag}</span><span className="pill">{category}</span></div></div>
                <div className={`queue-spark ${tone}`}>{spark}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="section wrap">
        <div className="section-head">
          <div className="kicker">Decision workflow</div>
          <h2 className="section-title">Roblox shows what happened. PlayDirective helps decide what happens next.</h2>
        </div>
        <div className="workflow-grid">
          {workflow.map(([id,title,copy,image]) => (
            <article className="workflow-card" key={id}>
              <div className="workflow-image-wrap"><img className="workflow-image" src={image} alt="" aria-hidden="true" /></div>
              <div className="workflow-meta"><div className="workflow-id">{id}</div><div><h3>{title}</h3><p>{copy}</p></div></div>
            </article>
          ))}
        </div>
      </section>

      <section id="security" className="section wrap">
        <div className="security-intro">
          <div className="kicker">Built for studio trust</div>
          <h2 className="section-title">Your game stays yours. PlayDirective reads signals, not control.</h2>
          <p className="section-copy">Studios should not have to hand over publishing access just to get better product decisions. The pilot is built around read-only analytics access and private tenant boundaries.</p>
        </div>
        <div className="security-cards">
          {security.map(([label,title,copy,image]) => (
            <article className="security-card" key={title}>
              <div className="security-image-wrap"><img className="security-image" src={image} alt="" aria-hidden="true" /></div>
              <div className="label">{label}</div><h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="pilot-panel">
          <div>
            <div className="kicker">30-day founding studio pilot</div>
            <h2>Prove PlayDirective is useful before you pay for it.</h2>
            <p>Connect one Roblox experience, let PlayDirective surface the highest-priority decisions, and only consider a paid plan after your team has seen genuine value. No card and no automatic paid conversion.</p>
            <div className="cta-row"><a className="btn btn-primary" href="/apply">Apply for founding pilot →</a><a className="btn btn-secondary" href="/demo/workspace">Preview pilot workspace</a></div>
          </div>
          <div className="pilot-art"><img src="/brand/playdirective/deco-cloud.svg" alt="" aria-hidden="true" /></div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head"><div className="kicker">Frequently asked questions</div><h2 className="section-title">Everything you need to know.</h2></div>
        <div className="faq-list">{faq.map(([q,a]) => <details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><span>PlayDirective · Early Access</span><div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a><a href="/admin">Admin</a></div></div></footer>
    </main>
  );
}
