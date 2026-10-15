const decorations = [
  { x: 6, y: 2, size: 32, kind: "cube" },
  { x: 84, y: 3, size: 118, kind: "cloud" },
  { x: 73, y: 6, size: 44, kind: "cube2" },
  { x: 14, y: 8, size: 62, kind: "cube" },
  { x: 93, y: 11, size: 38, kind: "cube2" },
  { x: 4, y: 14, size: 142, kind: "cloud" },
  { x: 88, y: 17, size: 54, kind: "cube" },
  { x: 22, y: 19, size: 36, kind: "cube2" },
  { x: 96, y: 22, size: 124, kind: "cloud" },
  { x: 8, y: 25, size: 72, kind: "cube" },
  { x: 82, y: 28, size: 42, kind: "cube2" },
  { x: 2, y: 31, size: 112, kind: "cloud" },
  { x: 95, y: 34, size: 48, kind: "cube" },
  { x: 12, y: 38, size: 34, kind: "cube2" },
  { x: 89, y: 41, size: 154, kind: "cloud" },
  { x: 5, y: 44, size: 58, kind: "cube" },
  { x: 93, y: 47, size: 40, kind: "cube2" },
  { x: 18, y: 51, size: 132, kind: "cloud" },
  { x: 96, y: 54, size: 66, kind: "cube" },
  { x: 7, y: 57, size: 38, kind: "cube2" },
  { x: 86, y: 60, size: 110, kind: "cloud" },
  { x: 1, y: 63, size: 48, kind: "cube" },
  { x: 94, y: 66, size: 34, kind: "cube2" },
  { x: 11, y: 69, size: 148, kind: "cloud" },
  { x: 91, y: 72, size: 56, kind: "cube" },
  { x: 3, y: 75, size: 42, kind: "cube2" },
  { x: 82, y: 78, size: 126, kind: "cloud" },
  { x: 97, y: 81, size: 62, kind: "cube" },
  { x: 15, y: 84, size: 36, kind: "cube2" },
  { x: 89, y: 87, size: 144, kind: "cloud" },
  { x: 6, y: 90, size: 52, kind: "cube" },
  { x: 96, y: 93, size: 38, kind: "cube2" },
  { x: 23, y: 96, size: 116, kind: "cloud" },
  { x: 2, y: 98, size: 46, kind: "cube" },
  { x: 74, y: 9, size: 34, kind: "cube2" },
  { x: 29, y: 13, size: 40, kind: "cube" },
  { x: 71, y: 23, size: 32, kind: "cube2" },
  { x: 35, y: 29, size: 46, kind: "cube" },
  { x: 66, y: 36, size: 36, kind: "cube2" },
  { x: 27, y: 42, size: 42, kind: "cube" },
  { x: 69, y: 49, size: 32, kind: "cube2" },
  { x: 32, y: 58, size: 44, kind: "cube" },
  { x: 73, y: 64, size: 36, kind: "cube2" },
  { x: 25, y: 73, size: 40, kind: "cube" },
  { x: 68, y: 83, size: 32, kind: "cube2" },
  { x: 38, y: 91, size: 44, kind: "cube" },
  { x: 58, y: 15, size: 30, kind: "cube2" },
  { x: 43, y: 33, size: 34, kind: "cube" },
  { x: 55, y: 56, size: 30, kind: "cube2" },
  { x: 47, y: 77, size: 38, kind: "cube" },
];

const decisionQueue = [
  ["1", "Fix mobile onboarding friction", "HIGH IMPACT", "RETENTION", "red", "↗"],
  ["2", "Protect paid acquisition", "PROTECT SPEND", "MONETIZATION", "yellow", "▥"],
  ["3", "Move starter offer", "OPPORTUNITY", "CONVERSION", "green", "▥"],
  ["4", "Test new game loop", "EXPERIMENT", "ENGAGEMENT", "blue", "⌁"],
];

const workflow = [
  ["01", "Connect", "Read aggregated Roblox analytics with least-privilege access.", "/brand/playdirective/workflow-connect.png"],
  ["02", "Prioritize", "Rank the three product decisions with the highest likely impact.", "/brand/playdirective/workflow-prioritize.png"],
  ["03", "Prove", "Show the segment, baseline and funnel evidence behind every recommendation.", "/brand/playdirective/workflow-prove.png"],
  ["04", "Experiment", "Turn a supported finding into a test plan with KPIs and guardrails.", "/brand/playdirective/workflow-experiment.png"],
];

const security = [
  ["READ-ONLY", "Read-only analytics", "PlayDirective only needs analytics access. It does not require permission to edit or publish your Roblox experience.", "/brand/playdirective/trust-readonly.png"],
  ["ENCRYPTED", "Encrypted credentials", "Your Roblox Open Cloud key is encrypted before storage and is never returned to browser JavaScript or the operator dashboard.", "/brand/playdirective/trust-encrypted.png"],
  ["PRIVATE", "Studio-isolated workspace", "Each studio has its own private tenant, session and analytics path so one customer's data never becomes another studio's evidence.", "/brand/playdirective/trust-isolated.png"],
  ["GERMANY", "Self-hosted production", "The PlayDirective web app, API and PostgreSQL database run on the production Hetzner server in Germany.", "/brand/playdirective/trust-germany.png"],
];

const faq = [
  ["What data does PlayDirective access?", "PlayDirective is designed around aggregated Roblox analytics and product signals needed to explain retention, monetization and funnel changes."],
  ["Does PlayDirective require publish access?", "No. The product is designed around read-only analytics access and does not need permission to edit or publish your Roblox experience."],
  ["Is my data secure?", "Credentials are encrypted before storage and each studio is separated into its own tenant and analytics path."],
  ["How does the founding pilot work?", "The 30-Day Founding Pilot costs $0, requires no card and never auto-converts. Connect up to 3 Experiences, review evidence-backed priorities and choose a paid plan after the Pilot."],
  ["When will paid plans be available?", "Founding studios validate the workflow first. Paid plans are introduced only after the pilot has demonstrated repeatable value."],
];

export default function Home() {
  return (
    <main className="site-shell">
      <div className="decoration-field" aria-hidden="true">
        {decorations.map(({ x, y, size, kind }, index) => (
          <img
            className={`decoration decoration-${kind}`}
            key={`${kind}-${index}`}
            src={`/brand/playdirective/${kind === "cube" ? "deco-cubes" : kind === "cube2" ? "deco-cubes2" : "deco-cloud"}.png`}
            alt=""
            style={{ left: `${x}%`, top: `${y}%`, width: size }}
          />
        ))}
      </div>
      <style>{`
        :root{color-scheme:dark}html{scroll-behavior:smooth}body{margin:0;background:#06101e}.site-shell{--bg:#06101e;--panel:#0a192b;--panel2:#0d2035;--line:#163854;--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 52% -7%,rgba(0,202,255,.13),transparent 27%),radial-gradient(circle at 95% 35%,rgba(26,128,255,.055),transparent 30%),linear-gradient(180deg,#06101e 0%,#071220 50%,#06101e 100%);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}.site-shell *{box-sizing:border-box}.site-shell a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 40px));margin:0 auto;position:relative}.header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.78);backdrop-filter:blur(20px);border-bottom:1px solid rgba(125,211,252,.08)}.header-inner{height:78px;display:flex;align-items:center;justify-content:space-between}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:28px;font-size:14px;color:#b9c9da}.nav a{transition:.2s ease}.nav a:hover{color:white}.nav-cta{padding:11px 17px;border:1px solid rgba(89,230,255,.35);border-radius:12px;color:#eaffff!important;background:rgba(24,211,246,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}.hero{padding:78px 0 68px;min-height:760px;display:flex;align-items:center}.hero-grid{display:grid;grid-template-columns:.93fr 1.07fr;gap:38px;align-items:center}.eyebrow,.kicker{font-size:13px;letter-spacing:.23em;text-transform:uppercase;font-weight:800;color:var(--cyan)}.hero h1{font-size:clamp(54px,6vw,82px);line-height:.96;letter-spacing:-.055em;margin:20px 0 26px;max-width:720px}.hero-copy{font-size:20px;line-height:1.55;color:#9fb1c7;max-width:650px;margin:0 0 30px}.cta-row{display:flex;gap:13px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:54px;padding:0 24px;border-radius:13px;font-size:15px;font-weight:800;transition:.2s ease}.btn:hover{transform:translateY(-2px)}.btn-primary{background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f!important;box-shadow:0 12px 36px rgba(46,216,239,.17)}.btn-secondary{border:1px solid rgba(147,169,194,.35);background:rgba(7,16,31,.45)}.hero-art{position:relative;min-height:580px;display:flex;align-items:center;justify-content:center}.hero-art:before{content:"";position:absolute;width:82%;height:68%;border-radius:50%;background:radial-gradient(circle,rgba(0,198,255,.12),rgba(0,198,255,.02) 45%,transparent 72%);filter:blur(10px)}.hero-image{width:114%;max-width:810px;filter:drop-shadow(0 35px 80px rgba(0,191,255,.13));position:relative;z-index:2}.deco{position:absolute;pointer-events:none;opacity:.78;filter:drop-shadow(0 12px 28px rgba(0,191,255,.15));z-index:3}.deco-a{width:92px;top:3%;right:-2%}.deco-b{width:108px;left:-5%;bottom:2%}.deco-c{width:72px;right:7%;bottom:1%}.section-deco{position:absolute;pointer-events:none;opacity:.42;filter:drop-shadow(0 14px 34px rgba(0,191,255,.13));z-index:0}.section-deco.cubes-left{width:82px;left:-72px;top:18%}.section-deco.cubes-right{width:96px;right:-78px;top:12%}.section-deco.cloud-right{width:110px;right:-70px;bottom:2%}.section>*:not(.section-deco){position:relative;z-index:1}.trust-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid rgba(142,186,220,.12);border-bottom:1px solid rgba(142,186,220,.12);padding:22px 0;margin-bottom:92px}.trust-chip{padding:8px 22px;border-right:1px solid rgba(142,186,220,.11)}.trust-chip:last-child{border:0}.trust-chip b{display:block;color:var(--cyan);font-size:12px;letter-spacing:.2em;margin-bottom:8px}.trust-chip span{color:#869cb5;font-size:13px;line-height:1.45}.section{padding:82px 0;position:relative}.section-head{max-width:860px;margin-bottom:42px}.section-title{font-size:clamp(42px,5vw,65px);line-height:1.01;letter-spacing:-.047em;margin:14px 0 15px}.section-copy{font-size:18px;line-height:1.6;color:#91a6bf;max-width:740px}.queue-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:54px;align-items:start}.queue-stack{display:grid;gap:13px}.queue-card{display:grid;grid-template-columns:58px 1fr 90px;gap:15px;align-items:center;background:linear-gradient(135deg,rgba(14,34,56,.94),rgba(7,19,33,.96));border:1px solid rgba(87,156,203,.23);border-radius:17px;padding:18px 20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 18px 60px rgba(0,0,0,.08);transition:.2s ease}.queue-card:hover{transform:translateY(-2px);border-color:rgba(89,230,255,.31);box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 22px 70px rgba(0,184,255,.07)}.rank{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;font-weight:900;font-size:20px;color:#06101e}.rank.red{background:#ff6c9b;box-shadow:0 0 24px rgba(255,108,155,.18)}.rank.yellow{background:#ffd44a;box-shadow:0 0 24px rgba(255,212,74,.15)}.rank.green{background:#65efc5;box-shadow:0 0 24px rgba(101,239,197,.15)}.rank.blue{background:#c7daee;box-shadow:0 0 24px rgba(139,199,255,.11)}.queue-card h3{font-size:18px;margin:0 0 9px}.pills{display:flex;gap:8px;flex-wrap:wrap}.pill{font-size:10px;font-weight:900;letter-spacing:.05em;border-radius:999px;padding:5px 10px;border:1px solid rgba(148,163,184,.23);color:#b7c6d8}.pill.red{border-color:rgba(255,108,155,.6);color:#ff8bad;background:rgba(255,56,115,.10)}.pill.yellow{border-color:rgba(255,212,74,.55);color:#ffd75c;background:rgba(255,204,0,.08)}.pill.green{border-color:rgba(101,239,197,.55);color:#6df0cb;background:rgba(34,197,94,.07)}.pill.blue{border-color:rgba(93,177,255,.45);color:#8bc7ff;background:rgba(30,110,200,.08)}.queue-spark{font-size:36px;font-weight:900;text-align:right}.queue-spark.red{color:#ff6c9b}.queue-spark.yellow{color:#ffd43b}.queue-spark.green{color:#65efc5}.queue-spark.blue{color:#c7daee}.workflow-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}.workflow-card{position:relative;min-height:430px;border-radius:26px;background:radial-gradient(circle at 90% 0%,rgba(0,192,255,.11),transparent 35%),linear-gradient(145deg,rgba(12,30,50,.96),rgba(6,17,31,.98));border:1px solid rgba(91,169,217,.18);padding:24px;overflow:hidden;transition:.22s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.workflow-card:hover{transform:translateY(-3px);border-color:rgba(89,230,255,.32);box-shadow:0 24px 70px rgba(0,188,255,.075),inset 0 1px 0 rgba(255,255,255,.035)}.workflow-image-wrap{height:275px;display:flex;align-items:center;justify-content:center}.workflow-image{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 22px 46px rgba(0,200,255,.12))}.workflow-meta{display:grid;grid-template-columns:46px 1fr;gap:14px;align-items:start}.workflow-id{color:var(--cyan);font-size:14px;font-weight:900;padding-top:5px}.workflow-meta h3{font-size:27px;margin:0 0 8px}.workflow-meta p{font-size:15px;color:#90a5be;line-height:1.55;margin:0}.security-intro{max-width:970px}.security-intro .section-title{max-width:980px}.security-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin-top:38px}.security-card{background:linear-gradient(145deg,rgba(10,27,47,.97),rgba(6,17,31,.98));border:1px solid rgba(91,169,217,.19);border-radius:24px;padding:24px;min-height:510px;position:relative;overflow:hidden;transition:.22s ease}.security-card:hover{transform:translateY(-3px);border-color:rgba(89,230,255,.30);box-shadow:0 24px 70px rgba(0,188,255,.07)}.security-card:after{content:"";position:absolute;inset:auto -20% -35% 20%;height:170px;background:radial-gradient(circle,rgba(0,194,255,.08),transparent 65%)}.security-image-wrap{height:300px;display:flex;align-items:center;justify-content:center}.security-image{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 24px 46px rgba(0,191,255,.13))}.security-card .label{font-size:12px;letter-spacing:.18em;font-weight:900;color:var(--cyan);margin-bottom:10px}.security-card h3{font-size:23px;margin:0 0 10px}.security-card p{font-size:15px;line-height:1.6;color:#91a6bf;margin:0;position:relative;z-index:1}.pilot-panel{position:relative;overflow:hidden;background:radial-gradient(circle at 86% 30%,rgba(0,199,255,.13),transparent 28%),linear-gradient(145deg,#0b2137,#071524);border:1px solid rgba(89,230,255,.21);border-radius:30px;padding:54px;display:grid;grid-template-columns:1.2fr .8fr;gap:30px;align-items:center;box-shadow:0 26px 80px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.03)}.pilot-panel h2{font-size:clamp(38px,4vw,58px);line-height:1.02;letter-spacing:-.045em;margin:14px 0 17px}.pilot-panel p{color:#9eb0c4;line-height:1.6;font-size:17px;margin:0 0 26px}.pilot-art{display:flex;justify-content:center;position:relative;min-height:250px}.pilot-art:before{content:"";position:absolute;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle,rgba(0,195,255,.16),transparent 68%);filter:blur(5px)}.pilot-art img{width:min(100%,350px);object-fit:contain;filter:drop-shadow(0 24px 50px rgba(0,193,255,.16));position:relative;z-index:1}.faq-list{max-width:900px;margin-top:32px}.faq-item{border-top:1px solid rgba(132,173,205,.17);padding:0}.faq-item:last-child{border-bottom:1px solid rgba(132,173,205,.17)}.faq-item summary{list-style:none;cursor:pointer;padding:22px 2px;font-size:17px;font-weight:750;display:flex;justify-content:space-between;gap:20px}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary:after{content:"+";color:#8fb6d4;font-size:24px;font-weight:400}.faq-item[open] summary:after{content:"−"}.faq-item p{margin:0;padding:0 2px 22px;color:#91a6bf;line-height:1.65;max-width:760px}.footer{margin-top:80px;border-top:1px solid rgba(132,173,205,.13);padding:30px 0 38px;color:#7e94ad}.footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:13px}.footer-links{display:flex;gap:20px;flex-wrap:wrap}.footer-links a:hover{color:white}
        .site-shell{position:relative;isolation:isolate;overflow:hidden}
        .decoration-field{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
        .decoration{position:absolute;height:auto;transform:translate(-50%,-50%);object-fit:contain;opacity:.11;filter:drop-shadow(0 12px 28px rgba(0,191,255,.13));}
        .decoration-cloud{opacity:.075;filter:blur(.2px) drop-shadow(0 12px 30px rgba(0,191,255,.12))}
        .decoration:nth-child(4n){opacity:.075}.decoration:nth-child(5n){opacity:.16}
        .site-shell>header,.site-shell>section,.site-shell>.wrap,.site-shell>footer{position:relative;z-index:1}
        .hero{padding:62px 0 48px;min-height:700px}
        .hero h1{line-height:.98;margin:17px 0 21px}
        .hero-copy{max-width:590px;line-height:1.52;margin-bottom:26px}
        .hero-art{min-height:560px}
        .trust-strip{margin-bottom:68px;padding:20px 0}
        .section{padding:72px 0}
        .section-head{margin-bottom:34px}
        .section-title{line-height:1.035;margin:12px 0 14px}
        .queue-grid{grid-template-columns:.82fr 1.18fr;gap:48px}
        .queue-stack{gap:15px}
        .queue-card{grid-template-columns:62px 1fr 90px;gap:16px;padding:21px 22px}
        .rank{width:52px;height:52px;font-size:22px}
        .queue-card h3{font-size:19px;margin-bottom:10px}
        #workflow .section-head{max-width:1040px}
        #workflow .section-title{max-width:1000px;font-size:clamp(42px,4.65vw,60px)}
        .workflow-grid{align-items:stretch;gap:22px}
        .workflow-card{display:flex;flex-direction:column;min-height:410px;padding:25px}
        .workflow-image-wrap{height:250px;flex:0 0 250px}
        .workflow-meta{margin-top:auto}
        #security .security-intro{max-width:1020px}
        #security .security-intro .section-title{max-width:1000px;font-size:clamp(42px,4.65vw,60px)}
        .security-cards{margin-top:32px;gap:22px}
        .security-card{min-height:454px;padding:23px}
        .security-image-wrap{height:254px}
        .pilot-panel{padding:58px;gap:34px;background:radial-gradient(circle at 84% 38%,rgba(0,199,255,.17),transparent 31%),linear-gradient(145deg,#0b2137,#071524);box-shadow:0 30px 90px rgba(0,0,0,.14),0 0 50px rgba(0,191,255,.035),inset 0 1px 0 rgba(255,255,255,.04)}
        .pilot-panel h2{line-height:1.04;max-width:720px}
        .pilot-panel p{max-width:700px;margin-bottom:24px}
        .pilot-art{min-height:275px}
        .pilot-art img{width:min(108%,380px)}
        .faq-list{max-width:980px;margin-top:38px}
        .faq-item{border-color:rgba(132,173,205,.23)}
        .faq-item summary{padding:24px 2px;font-size:18px;letter-spacing:-.01em}
        .faq-item p{padding-bottom:24px;max-width:820px}
        .footer{margin-top:64px}
        @media(max-width:1200px){.queue-grid{gap:34px}.workflow-card{padding:22px}.workflow-image-wrap{height:230px;flex-basis:230px}.security-card{min-height:430px}.security-image-wrap{height:232px}}
        @media(max-width:920px){.hero{padding:48px 0 42px;min-height:auto}.hero-art{min-height:430px}.trust-strip{margin-bottom:54px}.section{padding:58px 0}.queue-grid{grid-template-columns:1fr;gap:24px}.queue-card{padding:18px 20px}.workflow-card{min-height:400px}.security-card{min-height:430px}.pilot-panel{padding:38px 28px}.pilot-art{min-height:230px}.pilot-art img{width:320px}.decoration{opacity:.06}.decoration-cloud{opacity:.045}}
        @media(max-width:560px){.hero{padding-top:38px}.hero-art{min-height:330px}.section{padding:48px 0}.queue-card{grid-template-columns:46px 1fr 42px;padding:15px 14px}.rank{width:40px;height:40px;font-size:17px}.queue-card h3{font-size:16px}.workflow-card{min-height:355px;padding:18px}.workflow-image-wrap{height:215px;flex-basis:215px}.security-card{min-height:410px;padding:18px}.security-image-wrap{height:230px}.pilot-panel{padding:30px 19px}.pilot-panel h2{font-size:39px}.pilot-art{min-height:190px}.pilot-art img{width:250px}.faq-item summary{padding:20px 2px;font-size:16px}.decoration-field{opacity:.65}.decoration{opacity:.045}.decoration-cloud{opacity:.03}}@media(max-width:920px){.wrap{width:min(100% - 28px,760px)}.header-inner{height:68px}.brand-logo{width:186px}.nav>a:not(.nav-cta){display:none}.hero{padding:48px 0 45px;min-height:auto}.hero-grid{grid-template-columns:1fr;gap:16px}.hero h1{font-size:clamp(46px,12vw,67px);max-width:650px}.hero-copy{font-size:17px}.hero-art{min-height:430px}.hero-image{width:110%;max-width:690px}.deco-a{width:72px;right:-2%}.deco-b{width:82px;left:-2%}.deco-c{width:60px}.section-deco{opacity:.3}.section-deco.cubes-left{left:-26px}.section-deco.cubes-right{right:-28px}.section-deco.cloud-right{right:-22px}.trust-strip{grid-template-columns:1fr 1fr;margin-bottom:70px}.trust-chip:nth-child(2){border-right:0}.trust-chip:nth-child(-n+2){border-bottom:1px solid rgba(142,186,220,.11)}.queue-grid{grid-template-columns:1fr;gap:25px}.workflow-grid,.security-cards{grid-template-columns:1fr}.pilot-panel{grid-template-columns:1fr;padding:38px 28px}.pilot-art{order:-1;min-height:230px}.pilot-art img{width:300px}.section{padding:64px 0}.workflow-card{min-height:400px}.security-card{min-height:470px}}@media(max-width:560px){.wrap{width:calc(100% - 24px)}.brand-logo{width:168px}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding-top:38px}.hero h1{font-size:46px;line-height:.98}.hero-copy{font-size:16px}.cta-row{display:grid}.btn{width:100%}.hero-art{min-height:330px;margin-top:8px}.hero-image{width:120%}.deco-a{width:54px;right:1%;top:5%}.deco-b{width:66px;left:1%;bottom:3%}.deco-c{width:46px;right:8%}.section-deco{display:none}.trust-strip{grid-template-columns:1fr;padding:0}.trust-chip{border-right:0!important;border-bottom:1px solid rgba(142,186,220,.11)!important;padding:18px 2px}.trust-chip:last-child{border-bottom:0!important}.section-title{font-size:40px}.queue-card{grid-template-columns:46px 1fr 42px;padding:15px 14px}.rank{width:40px;height:40px;font-size:17px}.queue-card h3{font-size:16px}.queue-spark{font-size:26px}.workflow-card{padding:18px;min-height:355px}.workflow-image-wrap{height:215px}.workflow-meta h3{font-size:24px}.security-card{padding:18px;min-height:410px}.security-image-wrap{height:230px}.pilot-panel{padding:30px 19px}.pilot-panel h2{font-size:39px}.pilot-art{min-height:190px}.pilot-art img{width:250px}.footer-inner{align-items:flex-start;flex-direction:column}}
      `}</style>

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
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
            <img className="hero-image" src="/brand/playdirective/hero.png" alt="PlayDirective turns Roblox analytics into ranked decisions" />


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
          <div className="pilot-art"><img src="/brand/playdirective/workflow-experiment.png" alt="" aria-hidden="true" /></div>
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
