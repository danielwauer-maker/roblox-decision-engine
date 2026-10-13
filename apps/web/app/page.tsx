const decisionQueue = [
  ["1", "Fix mobile onboarding friction", "Mobile D1 retention fell while desktop remained stable.", "88.0", "HIGH IMPACT", "retention"],
  ["2", "Protect paid acquisition", "Traffic is growing faster than retained users.", "83.0", "PROTECT SPEND", "monetization"],
  ["3", "Move starter offer", "Returning players monetize materially better.", "74.0", "OPPORTUNITY", "conversion"],
];

const workflow = [
  ["01", "Connect", "Read aggregated Roblox analytics with least-privilege access.", "connect"],
  ["02", "Prioritize", "Rank the three product decisions with the highest likely impact.", "prioritize"],
  ["03", "Prove", "Show the segment, baseline and funnel evidence behind every recommendation.", "prove"],
  ["04", "Experiment", "Turn a supported finding into a test plan with KPIs and guardrails.", "experiment"],
];

const security = [
  ["Read-only analytics", "PlayDirective only needs analytics access. It does not require permission to edit or publish your Roblox experience.", "eye"],
  ["Encrypted credentials", "Your Roblox Open Cloud key is encrypted before storage and is never returned to browser JavaScript or the operator dashboard.", "lock"],
  ["Studio-isolated workspace", "Each studio has its own private tenant, session and analytics path so one customer's data never becomes another studio's evidence.", "isolate"],
  ["Self-hosted production", "The PlayDirective web app, API and PostgreSQL database run on the production Hetzner server in Germany; specialist services are used only for Roblox, AI, email and billing.", "server"],
];

const pilotJourney = [
  ["Day 1", "Activate & connect", "Open your private workspace and connect one live Roblox experience."],
  ["Week 1", "Reach first value", "Review the first evidence-backed priorities and investigate what deserves attention."],
  ["Week 2", "Design an experiment", "Use Experiment Copilot to turn a supported finding into a bounded test."],
  ["Day 30", "Choose deliberately", "Continue only if PlayDirective earned its place. The free pilot never auto-converts to paid."],
];

const faq = [
  ["Who is the pilot for?", "Teams with a live Roblox experience and enough real player activity to produce useful analytics. Pre-launch studios can apply, but value is strongest once live data exists."],
  ["Do you need write or publish access?", "No. PlayDirective is designed around read-only Roblox analytics access."],
  ["Do I need a credit card?", "No. The 30-day founding pilot is free and does not automatically become a paid subscription."],
  ["Can I revoke access?", "Yes. Your studio controls the Roblox Open Cloud credential and can revoke it in Roblox at any time."],
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function HeroWorld() {
  return (
    <div className="hero-world" aria-label="Illustration of game analytics turning into ranked product decisions">
      <svg viewBox="0 0 760 610" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="islandTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#62d96f" />
            <stop offset="1" stopColor="#2f8f4d" />
          </linearGradient>
          <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#24344e" />
            <stop offset="1" stopColor="#111a2d" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#102740" />
            <stop offset="1" stopColor="#081424" />
          </linearGradient>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g opacity=".55" filter="url(#glow)">
          <circle cx="345" cy="360" r="170" fill="#19d9ff" opacity=".07" />
          <circle cx="510" cy="180" r="120" fill="#5ee7ff" opacity=".08" />
        </g>

        <g className="float-block" opacity=".72">
          <rect x="90" y="138" width="25" height="25" rx="5" fill="#1fc8ff" />
          <rect x="645" y="420" width="21" height="21" rx="4" fill="#1fc8ff" />
          <rect x="617" y="120" width="18" height="18" rx="4" fill="#5790ff" />
          <rect x="156" y="493" width="16" height="16" rx="4" fill="#4ce4ff" />
        </g>

        <g transform="translate(155 250)">
          <polygon points="0,85 120,20 265,80 145,150" fill="url(#islandTop)" />
          <polygon points="0,85 145,150 145,245 0,175" fill="#182842" />
          <polygon points="145,150 265,80 265,174 145,245" fill="url(#rock)" />
          <rect x="31" y="116" width="25" height="25" fill="#22d3ee" opacity=".65" />
          <rect x="203" y="123" width="17" height="17" fill="#22d3ee" opacity=".55" />
          <rect x="84" y="149" width="13" height="13" fill="#38bdf8" opacity=".55" />
        </g>

        <g transform="translate(415 155)">
          <polygon points="0,70 102,14 220,64 116,124" fill="url(#islandTop)" />
          <polygon points="0,70 116,124 116,202 0,147" fill="#182842" />
          <polygon points="116,124 220,64 220,142 116,202" fill="url(#rock)" />
          <rect x="29" y="101" width="18" height="18" fill="#22d3ee" opacity=".62" />
          <rect x="168" y="99" width="14" height="14" fill="#22d3ee" opacity=".62" />
        </g>

        <g stroke="#4be7ff" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#glow)">
          <path d="M250 390 C330 345 360 310 440 270 C488 246 500 225 530 205" opacity=".7" />
        </g>
        <g fill="#07101f" stroke="#67e8f9" strokeWidth="5">
          <circle cx="254" cy="388" r="14" />
          <circle cx="382" cy="304" r="14" />
          <circle cx="530" cy="205" r="15" />
        </g>

        <g className="avatar" transform="translate(229 342)">
          <rect x="14" y="0" width="28" height="28" rx="4" fill="#f4bd5e" />
          <rect x="9" y="27" width="38" height="42" rx="4" fill="#1976f3" />
          <rect x="8" y="67" width="15" height="35" rx="3" fill="#111827" />
          <rect x="33" y="67" width="15" height="35" rx="3" fill="#111827" />
        </g>
        <g className="avatar" transform="translate(360 260) scale(.88)">
          <rect x="14" y="0" width="28" height="28" rx="4" fill="#f4bd5e" />
          <rect x="9" y="27" width="38" height="42" rx="4" fill="#185fda" />
          <rect x="8" y="67" width="15" height="35" rx="3" fill="#111827" />
          <rect x="33" y="67" width="15" height="35" rx="3" fill="#111827" />
        </g>
        <g className="avatar" transform="translate(515 144) scale(.82)">
          <rect x="14" y="0" width="28" height="28" rx="4" fill="#f4bd5e" />
          <rect x="9" y="27" width="38" height="42" rx="4" fill="#183d9a" />
          <rect x="8" y="67" width="15" height="35" rx="3" fill="#111827" />
          <rect x="33" y="67" width="15" height="35" rx="3" fill="#111827" />
        </g>

        <g className="hero-card" transform="translate(48 62)">
          <rect width="225" height="78" rx="18" fill="url(#panel)" stroke="#28506e" />
          <circle cx="26" cy="25" r="7" fill="#67e8f9" />
          <text x="46" y="30" fill="#ecfeff" fontSize="18" fontWeight="700">Retention</text>
          <text x="46" y="56" fill="#8fb1c9" fontSize="15">-51%</text>
          <path d="M145 47 C160 20 178 62 207 30" stroke="#67e8f9" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <g className="hero-card" transform="translate(76 154)">
          <rect width="236" height="78" rx="18" fill="url(#panel)" stroke="#28506e" />
          <circle cx="26" cy="25" r="7" fill="#6ee7b7" />
          <text x="46" y="30" fill="#ecfeff" fontSize="18" fontWeight="700">Purchases</text>
          <text x="46" y="56" fill="#8fb1c9" fontSize="15">+34%</text>
          <path d="M150 53 L168 43 L186 46 L215 20" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        <g className="hero-card top-priority" transform="translate(430 30)">
          <rect width="282" height="132" rx="22" fill="url(#panel)" stroke="#67e8f9" strokeWidth="2" />
          <text x="22" y="31" fill="#67e8f9" fontSize="17" fontWeight="800">#1</text>
          <text x="22" y="64" fill="#f8fbff" fontSize="22" fontWeight="800">Fix mobile</text>
          <text x="22" y="89" fill="#f8fbff" fontSize="22" fontWeight="800">onboarding friction</text>
          <rect x="20" y="101" width="111" height="23" rx="11" fill="#571b32" stroke="#fb7185" />
          <text x="34" y="117" fill="#ff9bad" fontSize="11" fontWeight="800">HIGH IMPACT</text>
          <path d="M181 87 C199 58 214 103 247 60" stroke="#fb7185" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        <g className="hero-card" transform="translate(370 315)">
          <rect width="240" height="96" rx="18" fill="url(#panel)" stroke="#28506e" />
          <text x="18" y="29" fill="#67e8f9" fontSize="16" fontWeight="800">#2</text>
          <text x="18" y="56" fill="#f8fbff" fontSize="18" fontWeight="800">Protect paid acquisition</text>
          <rect x="18" y="67" width="105" height="20" rx="10" fill="#553e0a" stroke="#fbbf24" />
          <text x="28" y="81" fill="#fbd55d" fontSize="10" fontWeight="800">PROTECT SPEND</text>
          <rect x="176" y="54" width="9" height="24" rx="3" fill="#fbbf24" />
          <rect x="191" y="41" width="9" height="37" rx="3" fill="#fbbf24" />
          <rect x="206" y="28" width="9" height="50" rx="3" fill="#fbbf24" />
        </g>
      </svg>
      <div className="world-glow" />
    </div>
  );
}

function WorkflowVisual({ type }: { type: string }) {
  if (type === "connect") {
    return <div className="mini-visual connect"><div className="source cube"/><div className="source game">◈</div><div className="source chart">▥</div><div className="hub"><span>▥</span><b>⌑</b></div><i/><i/><i/></div>;
  }
  if (type === "prioritize") {
    return <div className="mini-visual prioritize"><div className="rank r1"><b>#1</b><span>↗</span></div><div className="rank r2"><b>#2</b><span>↗</span></div><div className="rank r3"><b>#3</b><span>↘</span></div><div className="voxel-person"/></div>;
  }
  if (type === "prove") {
    return <div className="mini-visual prove"><div className="metric left">▥</div><div className="metric middle">✓</div><div className="metric right">▥</div><div className="stream one"/><div className="stream two"/></div>;
  }
  return <div className="mini-visual experiment"><div className="voxel-person"/><div className="fork"/><div className="ab a">A</div><div className="ab b">B</div><div className="metric-result good">▥</div><div className="metric-result alt">▥</div></div>;
}

function TrustVisual({ type }: { type: string }) {
  if (type === "eye") return <div className="trust-visual"><div className="screen-chart"><span/><span/><span/><span/></div><div className="shield">◉</div></div>;
  if (type === "lock") return <div className="trust-visual"><div className="lock-body">●</div><div className="credential">⌁ •••••</div></div>;
  if (type === "isolate") return <div className="trust-visual isolate"><div/><div/><div/></div>;
  return <div className="trust-visual server"><span/><span/><span/><b>DE</b></div>;
}

export default function Home() {
  return (
    <main className="page-shell">
      <style>{`
        :root{color-scheme:dark}.page-shell{min-height:100vh;background:#07101f;color:#eef7ff;font-family:Arial,sans-serif;overflow:hidden}.page-shell *{box-sizing:border-box}.page-shell a{transition:transform .18s ease,border-color .18s ease,background .18s ease}.page-shell a:hover{transform:translateY(-1px)}
        .site-header{border-bottom:1px solid rgba(255,255,255,.08);background:rgba(7,16,31,.93);backdrop-filter:blur(18px);position:relative;z-index:20}.header-inner{max-width:1180px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:12px}.brand-name{font-weight:900;letter-spacing:-.035em;font-size:23px}.brand-sub{color:#718198;font-size:10px;margin-top:3px}.brand-mark{width:26px;height:26px;position:relative;display:block;transform:rotate(30deg)}.brand-mark span{position:absolute;width:12px;height:12px;border:2px solid #3fe7ff;background:#0b2137}.brand-mark span:nth-child(1){left:7px;top:0}.brand-mark span:nth-child(2){left:0;top:12px}.brand-mark span:nth-child(3){left:14px;top:12px}.nav{display:flex;gap:7px;align-items:center}.nav a{color:#9fb1c7;text-decoration:none;padding:10px 12px;font-size:13px}.nav .nav-cta{border:1px solid rgba(103,232,249,.34);color:#a5f3fc;border-radius:11px;font-weight:800;padding:10px 14px}
        .wrap{max-width:1180px;margin:0 auto;padding-left:24px;padding-right:24px}.hero{padding-top:78px;padding-bottom:56px}.hero-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(440px,1.1fr);gap:52px;align-items:center}.eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;font-weight:900}.hero h1{font-size:clamp(52px,6.5vw,78px);line-height:.94;letter-spacing:-.06em;margin:18px 0 0;max-width:670px}.hero-copy{color:#9fb1c7;font-size:20px;line-height:1.56;max-width:650px;margin:26px 0 0}.cta-row{display:flex;gap:11px;flex-wrap:wrap;margin-top:32px}.btn-primary,.btn-secondary{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:13px;font-size:15px;font-weight:900;padding:14px 19px}.btn-primary{background:#67e8f9;color:#07101f;box-shadow:0 12px 34px rgba(103,232,249,.14)}.btn-secondary{border:1px solid rgba(255,255,255,.15);color:#eef7ff;background:rgba(255,255,255,.018)}
        .hero-art-wrap{position:relative;min-height:540px;display:flex;align-items:center}.hero-world{position:relative;width:100%;filter:drop-shadow(0 40px 60px rgba(0,0,0,.34))}.hero-world svg{width:100%;height:auto;display:block}.hero-world:after{content:"";position:absolute;inset:17% 8% 4%;border-radius:50%;background:radial-gradient(circle,rgba(35,212,255,.13),transparent 66%);filter:blur(22px);z-index:-1}.world-glow{position:absolute;left:20%;right:12%;bottom:4%;height:2px;background:linear-gradient(90deg,transparent,#35d7ff,transparent);box-shadow:0 0 28px #35d7ff;opacity:.55}.hero-card{filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))}.top-priority{filter:drop-shadow(0 0 20px rgba(103,232,249,.22))}.avatar{filter:drop-shadow(0 8px 10px rgba(0,0,0,.45))}
        .trust-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:15px 0;margin-bottom:70px}.trust-chip{display:flex;align-items:center;gap:10px;padding:8px 10px}.trust-chip b{color:#67e8f9;font-size:9px;letter-spacing:.13em}.trust-chip span{color:#8095ae;font-size:11px}
        .decision-section{padding-bottom:78px}.section-kicker{color:#67e8f9;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.section-title{margin:12px 0 0;font-size:clamp(34px,5vw,48px);line-height:1.02;letter-spacing:-.045em}.decision-grid{display:grid;grid-template-columns:.82fr 1.18fr;gap:44px;align-items:start;margin-top:27px}.decision-copy{color:#8fa2ba;line-height:1.65;font-size:16px;max-width:440px}.queue{display:grid;gap:11px}.queue-card{display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:14px;align-items:center;border:1px solid rgba(255,255,255,.09);background:linear-gradient(145deg,rgba(255,255,255,.028),rgba(8,19,35,.48));border-radius:18px;padding:17px 18px;box-shadow:0 18px 50px rgba(0,0,0,.12)}.queue-card:first-child{border-color:rgba(103,232,249,.22);background:linear-gradient(145deg,rgba(103,232,249,.07),rgba(8,19,35,.52))}.rank-badge{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;font-weight:900;color:#07101f}.rank-badge.r1{background:#fb7185}.rank-badge.r2{background:#fbbf24}.rank-badge.r3{background:#6ee7b7}.queue-title{font-weight:850;font-size:16px}.queue-copy{margin-top:5px;color:#8095ae;font-size:12px;line-height:1.48}.queue-score{text-align:right}.queue-score strong{display:block;color:#67e8f9;font-size:17px}.queue-score span{display:block;color:#60738c;font-size:8px;text-transform:uppercase;margin-top:3px}.tag{display:inline-block;margin-top:7px;border:1px solid currentColor;border-radius:999px;padding:3px 7px;font-size:8px;font-weight:900;letter-spacing:.04em}.tag.red{color:#fb7185}.tag.yellow{color:#fbbf24}.tag.green{color:#6ee7b7}
        .workflow-section{padding:40px 0 84px}.workflow-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:30px}.workflow-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:23px;padding:19px;background:linear-gradient(145deg,rgba(255,255,255,.03),rgba(8,19,35,.52));min-height:260px}.workflow-card:after{content:"";position:absolute;width:160px;height:160px;right:-60px;top:-70px;border-radius:50%;background:radial-gradient(circle,rgba(29,211,255,.1),transparent 65%)}.workflow-meta{display:flex;gap:16px;align-items:flex-start;margin-top:8px}.workflow-id{color:#67e8f9;font-size:11px;font-weight:900;padding-top:4px}.workflow-card h3{font-size:22px;margin:0}.workflow-card p{color:#8fa2ba;line-height:1.58;font-size:13px;margin:7px 0 0}.mini-visual{height:142px;position:relative;margin-bottom:17px;border-radius:18px;background:radial-gradient(circle at 50% 120%,rgba(41,214,255,.12),transparent 54%)}.source,.hub,.metric,.rank,.ab,.metric-result{position:absolute;border:1px solid rgba(103,232,249,.38);background:linear-gradient(145deg,#14304e,#081423);box-shadow:0 0 18px rgba(32,214,255,.12)}.connect .source{width:46px;height:46px;border-radius:11px;display:grid;place-items:center;color:#84efff;font-weight:900}.connect .cube{left:18px;top:18px;background:linear-gradient(145deg,#2f75ff,#0bc7ff)}.connect .game{left:88px;top:4px}.connect .chart{right:18px;top:21px}.connect .hub{left:50%;top:56px;transform:translateX(-50%);width:74px;height:62px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:9px;color:#67e8f9}.connect i{position:absolute;height:3px;background:#44e5ff;transform-origin:left center;box-shadow:0 0 8px #44e5ff}.connect i:nth-of-type(1){left:58px;top:60px;width:75px;transform:rotate(20deg)}.connect i:nth-of-type(2){left:124px;top:48px;width:43px;transform:rotate(72deg)}.connect i:nth-of-type(3){right:60px;top:65px;width:72px;transform:rotate(160deg)}
        .prioritize .rank{left:50%;transform:translateX(-50%);width:75%;height:34px;border-radius:10px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;color:#eafcff}.prioritize .r1{top:12px;border-color:#67e8f9;box-shadow:0 0 18px rgba(103,232,249,.18)}.prioritize .r2{top:53px;opacity:.86}.prioritize .r3{top:94px;opacity:.67}.prioritize .r1 span,.prioritize .r2 span{color:#6ee7b7}.prioritize .r3 span{color:#fb7185}.voxel-person{position:absolute;width:24px;height:40px;background:#1d66db;border-radius:4px;bottom:5px;left:26px;box-shadow:0 -12px 0 -2px #f4bd5e,0 11px 0 -7px #121c2d}.prove .metric{width:72px;height:62px;border-radius:12px;display:grid;place-items:center;color:#7ceaff;font-size:22px;font-weight:900}.prove .left{left:9%;top:25px}.prove .middle{left:50%;top:9px;transform:translateX(-50%);width:90px;height:76px;color:#6ee7b7}.prove .right{right:9%;top:25px;color:#f0a6ff;border-color:rgba(215,130,255,.4)}.stream{position:absolute;height:4px;border-radius:4px;bottom:30px}.stream.one{left:22%;width:32%;background:#45e4ff;transform:rotate(-6deg);box-shadow:0 0 9px #45e4ff}.stream.two{right:22%;width:32%;background:#b360ff;transform:rotate(6deg);box-shadow:0 0 9px #b360ff}.experiment .fork{position:absolute;left:45px;top:75px;width:115px;height:5px;background:#43e5ff;box-shadow:0 0 9px #43e5ff}.experiment .fork:before,.experiment .fork:after{content:"";position:absolute;right:-3px;width:80px;height:4px;background:#43e5ff;transform-origin:left center}.experiment .fork:before{transform:rotate(-32deg)}.experiment .fork:after{transform:rotate(32deg)}.experiment .ab{width:38px;height:38px;border-radius:8px;display:grid;place-items:center;color:white;font-weight:900}.experiment .a{left:168px;top:20px;background:#1a7cff}.experiment .b{left:168px;bottom:12px;background:#8b4be6;border-color:#a77cff}.metric-result{width:62px;height:43px;border-radius:10px;right:13px;display:grid;place-items:center}.metric-result.good{top:13px;color:#6ee7b7}.metric-result.alt{bottom:13px;color:#d6a6ff}
        .security-section{padding:18px 0 76px}.security-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:38px;align-items:start}.security-intro p{color:#8fa2ba;line-height:1.7;max-width:520px}.security-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.security-card{border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:18px;background:linear-gradient(145deg,rgba(255,255,255,.025),rgba(8,19,35,.5));min-height:245px}.security-card h3{font-size:17px;margin:14px 0 0}.security-card p{margin:7px 0 0;color:#8095ae;line-height:1.58;font-size:12px}.trust-visual{height:105px;position:relative;border-radius:15px;background:radial-gradient(circle at 50% 90%,rgba(32,214,255,.12),transparent 58%)}.screen-chart{position:absolute;left:12px;top:17px;width:105px;height:64px;border:1px solid rgba(103,232,249,.4);border-radius:10px;background:#10253d;display:flex;align-items:flex-end;gap:7px;padding:13px}.screen-chart span{width:12px;background:#3edcff;border-radius:3px}.screen-chart span:nth-child(1){height:21px}.screen-chart span:nth-child(2){height:36px}.screen-chart span:nth-child(3){height:29px}.screen-chart span:nth-child(4){height:47px}.shield{position:absolute;right:18px;top:20px;width:58px;height:66px;border:2px solid #67e8f9;border-radius:19px 19px 27px 27px;display:grid;place-items:center;color:#67e8f9;font-size:25px;background:#0e233a;box-shadow:0 0 20px rgba(103,232,249,.13)}.lock-body{position:absolute;left:30px;top:30px;width:62px;height:55px;background:#10253d;border:2px solid #67e8f9;border-radius:11px;display:grid;place-items:center;color:#67e8f9}.lock-body:before{content:"";position:absolute;width:34px;height:26px;left:12px;top:-28px;border:5px solid #67e8f9;border-bottom:0;border-radius:17px 17px 0 0}.credential{position:absolute;left:100px;right:8px;top:41px;border:1px solid rgba(103,232,249,.36);background:#0d2035;border-radius:9px;padding:9px 10px;color:#9bf4ff;font-size:12px}.isolate{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px}.isolate div{border:1px solid rgba(103,232,249,.38);border-radius:11px;background:linear-gradient(180deg,rgba(35,211,255,.11),rgba(10,25,43,.85));position:relative}.isolate div:after{content:"";position:absolute;width:20px;height:20px;border-radius:50%;left:50%;top:24px;transform:translateX(-50%);background:#3edcff;box-shadow:0 25px 0 -4px #315d84}.server{display:flex;align-items:flex-end;justify-content:center;gap:5px;padding-bottom:13px}.server span{width:54px;height:18px;background:#102942;border:1px solid rgba(103,232,249,.4);border-radius:6px;position:absolute;left:50%;transform:translateX(-50%)}.server span:nth-child(1){bottom:14px}.server span:nth-child(2){bottom:38px}.server span:nth-child(3){bottom:62px}.server b{position:absolute;right:25px;top:22px;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#1b2738;color:#ffd45a;border:1px solid #fb7185;font-size:10px}
        .journey-section{padding:26px 0 78px}.journey-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:23px}.journey-card{border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:18px;background:rgba(255,255,255,.022)}.journey-card b{color:#67e8f9;font-size:11px}.journey-card h3{margin:9px 0 7px}.journey-card p{margin:0;color:#8fa2ba;font-size:12px;line-height:1.6}
        .faq-section{padding:18px 0 80px}.faq-grid{display:grid;gap:11px;margin-top:22px}.faq-card{border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:18px 20px;background:rgba(255,255,255,.022)}.faq-card h3{margin:0;font-size:17px}.faq-card p{margin:8px 0 0;color:#8fa2ba;line-height:1.6;font-size:13px}
        .final-cta{margin:20px auto 76px;max-width:1180px;padding:0 24px}.final-panel{position:relative;overflow:hidden;border:1px solid rgba(103,232,249,.28);border-radius:30px;background:linear-gradient(145deg,rgba(103,232,249,.08),rgba(14,35,56,.6));padding:42px}.final-panel:after{content:"";position:absolute;width:310px;height:310px;right:-80px;bottom:-130px;border-radius:50%;background:radial-gradient(circle,rgba(67,226,255,.16),transparent 68%)}.final-panel h2{font-size:clamp(35px,5vw,50px);line-height:1;letter-spacing:-.045em;max-width:700px;margin:12px 0 0}.final-panel p{max-width:730px;color:#9fb1c7;font-size:17px;line-height:1.65}.footer{border-top:1px solid rgba(255,255,255,.07);padding:27px 24px 34px}.footer-inner{max-width:1180px;margin:0 auto;display:flex;justify-content:space-between;gap:20px;align-items:center;flex-wrap:wrap}.footer-links{display:flex;gap:18px;flex-wrap:wrap}.footer a,.footer span{color:#718198;text-decoration:none;font-size:12px}
        @media(max-width:900px){.hero-grid,.decision-grid,.security-grid{grid-template-columns:1fr}.hero-art-wrap{min-height:0}.hero-world{max-width:760px;margin:0 auto}.trust-strip{grid-template-columns:repeat(2,1fr)}.journey-grid{grid-template-columns:repeat(2,1fr)}.hero{padding-top:62px}.decision-grid{gap:24px}.security-grid{gap:25px}}
        @media(max-width:640px){.header-inner{padding:20px 20px;align-items:flex-start}.brand-sub{font-size:9px}.nav{width:100%;justify-content:space-between}.nav a{padding:8px 6px;font-size:12px}.nav .nav-cta{padding:9px 11px}.wrap{padding-left:20px;padding-right:20px}.hero{padding-top:56px;padding-bottom:36px}.hero-grid{gap:28px}.hero h1{font-size:clamp(48px,15vw,66px)}.hero-copy{font-size:18px;line-height:1.6}.cta-row{display:grid;grid-template-columns:1fr}.btn-primary,.btn-secondary{width:100%;min-height:52px}.hero-art-wrap{margin-left:-8px;margin-right:-8px}.hero-world{transform:scale(1.04)}.trust-strip{grid-template-columns:1fr;margin-bottom:58px}.trust-chip{padding:9px 0}.decision-section{padding-bottom:66px}.decision-grid{margin-top:22px}.queue-card{grid-template-columns:40px minmax(0,1fr);padding:16px}.queue-score{grid-column:2;text-align:left;display:flex;gap:8px;align-items:center}.queue-score strong{font-size:14px}.workflow-section{padding-top:30px}.workflow-grid,.security-cards,.journey-grid{grid-template-columns:1fr}.workflow-card{min-height:245px}.security-section{padding-bottom:66px}.journey-section{padding-top:10px}.final-panel{padding:31px 24px}.final-panel p{font-size:16px}.footer-inner{align-items:flex-start;flex-direction:column}.section-title{font-size:36px}}
      `}</style>

      <header className="site-header">
        <div className="header-inner">
          <div className="brand"><BrandMark/><div><div className="brand-name">PlayDirective</div><div className="brand-sub">Decision intelligence for game studios</div></div></div>
          <nav className="nav"><a href="#security">Security</a><a href="/pricing">Pricing</a><a className="nav-cta" href="/demo">See PlayDirective in action</a></nav>
        </div>
      </header>

      <section className="hero wrap">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Decision intelligence for Roblox studios</div>
            <h1>Know what changed. Know what to do next.</h1>
            <p className="hero-copy">PlayDirective turns retention, monetization and funnel signals into evidence-backed priorities and concrete experiments — without forcing your team to live inside another analytics dashboard.</p>
            <div className="cta-row"><a className="btn-primary" href="/demo/priorities">See PlayDirective in action</a><a className="btn-secondary" href="/apply">Apply for founding pilot</a></div>
          </div>
          <div className="hero-art-wrap"><HeroWorld/></div>
        </div>
      </section>

      <section className="wrap">
        <div className="trust-strip">
          <div className="trust-chip"><b>READ-ONLY</b><span>Least-privilege Roblox analytics access</span></div>
          <div className="trust-chip"><b>ENCRYPTED</b><span>Studio credentials encrypted before storage</span></div>
          <div className="trust-chip"><b>PRIVATE</b><span>Tenant-isolated data and decisions</span></div>
          <div className="trust-chip"><b>GERMANY</b><span>Production runtime hosted on Hetzner in Germany</span></div>
        </div>
      </section>

      <section className="decision-section wrap">
        <div className="section-kicker">Instant clarity</div>
        <h2 className="section-title">Your studio’s decision queue.</h2>
        <div className="decision-grid">
          <div><p className="decision-copy">From raw signals to ranked opportunities. PlayDirective surfaces what deserves attention first, then keeps the evidence close to every recommendation.</p></div>
          <div className="queue">
            {decisionQueue.map(([rank,title,copy,score,tag],index)=><article key={rank} className="queue-card"><div className={`rank-badge r${rank}`}>{rank}</div><div><div className="queue-title">{title}</div><div className="queue-copy">{copy}</div><span className={`tag ${index===0?"red":index===1?"yellow":"green"}`}>{tag}</span></div><div className="queue-score"><strong>{score}</strong><span>priority</span></div></article>)}
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow-section wrap">
        <div className="section-kicker">Decision workflow</div>
        <h2 className="section-title">Roblox shows what happened. PlayDirective helps decide what happens next.</h2>
        <div className="workflow-grid">
          {workflow.map(([id,title,copy,type])=><article key={id} className="workflow-card"><WorkflowVisual type={type}/><div className="workflow-meta"><div className="workflow-id">{id}</div><div><h3>{title}</h3><p>{copy}</p></div></div></article>)}
        </div>
      </section>

      <section id="security" className="security-section wrap">
        <div className="security-grid">
          <div className="security-intro"><div className="section-kicker">Built for studio trust</div><h2 className="section-title">Your game stays yours. PlayDirective reads signals, not control.</h2><p>Studios should not have to hand over publishing access just to get better product decisions. The pilot is designed around read-only analytics access and private tenant boundaries.</p></div>
          <div className="security-cards">{security.map(([title,copy,type])=><article key={title} className="security-card"><TrustVisual type={type}/><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="journey-section wrap">
        <div className="section-kicker">30-day customer journey</div>
        <h2 className="section-title">A pilot with a finish line, not an endless free account.</h2>
        <div className="journey-grid">{pilotJourney.map(([when,title,copy])=><article key={when} className="journey-card"><b>{when}</b><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="faq-section wrap">
        <div className="section-kicker">FAQ</div>
        <h2 className="section-title">Everything you need to know.</h2>
        <div className="faq-grid">{faq.map(([q,a])=><article key={q} className="faq-card"><h3>{q}</h3><p>{a}</p></article>)}</div>
      </section>

      <section className="final-cta">
        <div className="final-panel"><div className="section-kicker">30-day founding studio pilot</div><h2>Prove PlayDirective is useful before you pay for it.</h2><p>The founding pilot is free. Connect one Roblox experience, let PlayDirective surface the highest-priority decisions, and only consider a paid plan after your team has seen something genuinely useful. No card is required and there is no automatic paid conversion.</p><div className="cta-row"><a className="btn-primary" href="/apply">Apply for founding pilot</a><a className="btn-secondary" href="/demo/workspace">Preview pilot workspace</a></div></div>
      </section>

      <footer className="footer"><div className="footer-inner"><span>PlayDirective · Early Access</span><div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a><a href="/admin">Admin</a></div></div></footer>
    </main>
  );
}
