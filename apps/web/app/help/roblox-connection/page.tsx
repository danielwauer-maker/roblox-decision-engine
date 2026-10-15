export default function RobloxConnectionHelpPage() {
  const steps = [
    ["1", "Open Roblox Creator Dashboard", "Sign in to the Roblox account that owns or manages the experience you want to connect."],
    ["2", "Create an Open Cloud API key", "Create a dedicated key for PlayDirective rather than reusing a broad existing credential."],
    ["3", "Select the correct experience", "Scope the key to the Roblox experience / Universe you want PlayDirective to analyse."],
    ["4", "Grant analytics read access only", "Use the minimum permissions needed for analytics. PlayDirective does not need permission to edit or publish your game."],
    ["5", "Copy the Universe ID and API key", "Keep the key private. Do not send it by email, support chat or the public pilot application form."],
    ["6", "Paste it into your private workspace", "Open PlayDirective → Owner setup → Connect a Roblox experience, then run Sync last 30 days."],
  ];

  return (
    <main className="guide-shell">
      <style>{`
        :root{color-scheme:dark}
        body{margin:0;background:#06101e}
        .guide-shell{--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(0,202,255,.11),transparent 24%),linear-gradient(180deg,#06101e,#071220 58%,#06101e);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative;overflow:hidden}
        .guide-shell *{box-sizing:border-box}.guide-shell a{color:inherit;text-decoration:none}.wrap{width:min(1040px,calc(100% - 40px));margin:0 auto;position:relative}
        .header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.82);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.08)}
        .header-inner{height:78px;display:flex;align-items:center;justify-content:space-between;gap:22px}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:24px;font-size:14px;color:#b9c9da}.nav a:hover{color:white}.nav-cta{padding:11px 16px;border:1px solid rgba(89,230,255,.34);border-radius:12px;background:rgba(24,211,246,.08);color:#efffff!important}
        .hero{padding:58px 0 26px}.back-link{display:inline-flex;align-items:center;gap:8px;color:#8fdff1!important;font-size:13px;margin-bottom:28px}.eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:var(--cyan)}.hero h1{font-size:clamp(48px,5.5vw,70px);line-height:.98;letter-spacing:-.055em;margin:16px 0 18px;max-width:780px}.hero-copy{font-size:18px;line-height:1.67;color:#9fb1c7;max-width:760px;margin:0}
        .guide-section{padding:24px 0 28px}.guide-grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:24px;align-items:start}.steps{display:grid;gap:14px}.step{display:grid;grid-template-columns:56px minmax(0,1fr);gap:16px;align-items:start;border:1px solid rgba(91,169,217,.17);background:linear-gradient(145deg,rgba(10,27,47,.95),rgba(6,17,31,.98));border-radius:20px;padding:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.02)}.step-num{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(89,230,255,.08);border:1px solid rgba(89,230,255,.22);color:var(--cyan);font-weight:900}.step h2{font-size:18px;margin:2px 0 7px;letter-spacing:-.01em}.step p{margin:0;color:#8fa2ba;line-height:1.62;font-size:13px}
        .side-card{position:sticky;top:102px;border:1px solid rgba(89,230,255,.2);background:radial-gradient(circle at 88% 8%,rgba(0,198,255,.08),transparent 34%),linear-gradient(145deg,rgba(11,33,55,.96),rgba(7,21,36,.98));border-radius:22px;padding:22px}.side-card .kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);font-weight:900}.side-card h3{font-size:21px;margin:9px 0 10px}.side-card p{margin:0;color:#8fa2ba;font-size:13px;line-height:1.62}.side-list{display:grid;gap:12px;margin-top:18px}.side-item{padding-top:12px;border-top:1px solid rgba(132,173,205,.13)}.side-item b{display:block;font-size:13px;margin-bottom:5px}.side-item span{display:block;color:#7f95ad;font-size:12px;line-height:1.55}
        .security{margin:18px 0 58px;border:1px solid rgba(134,239,172,.2);background:linear-gradient(145deg,rgba(16,49,47,.28),rgba(8,27,31,.68));border-radius:22px;padding:22px 24px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start}.security-icon{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(134,239,172,.07);border:1px solid rgba(134,239,172,.18);font-size:19px}.security strong{display:block;margin-bottom:6px}.security p{margin:0;color:#a7bacb;line-height:1.65;font-size:13px}
        .footer{margin-top:52px;border-top:1px solid rgba(132,173,205,.12);background:rgba(4,12,23,.42)}.footer-inner{min-height:102px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#758aa1;font-size:12px}.footer-links{display:flex;gap:20px}.footer a:hover{color:#dfefff}
        .deco{position:absolute;pointer-events:none;opacity:.08;filter:drop-shadow(0 12px 24px rgba(0,191,255,.12));z-index:0}.deco-1{width:70px;left:4%;top:29%}.deco-2{width:104px;right:3%;top:62%}.guide-shell>header,.guide-shell>section,.guide-shell>footer{position:relative;z-index:1}
        @media(max-width:920px){.nav>a:not(.nav-cta){display:none}.guide-grid{grid-template-columns:1fr}.side-card{position:static}.hero{padding-top:46px}.deco{opacity:.045}}
        @media(max-width:560px){.wrap{width:calc(100% - 24px)}.header-inner{height:68px}.brand-logo{width:168px}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding:36px 0 20px}.hero h1{font-size:44px}.hero-copy{font-size:16px}.step{grid-template-columns:46px 1fr;padding:17px}.step-num{width:38px;height:38px}.security{grid-template-columns:1fr;padding:19px}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0}.footer-links{flex-wrap:wrap}.deco{display:none}}
      `}</style>

      <img className="deco deco-1" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />
      <img className="deco deco-2" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/help">Help center</a>
            <a href="/demo">Demo</a>
            <a href="/pricing">Pricing</a>
            <a className="nav-cta" href="/app/login">Pilot sign in</a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <a className="back-link" href="/help">← Back to Help Center</a>
        <div className="eyebrow">Connection guide</div>
        <h1>Connect Roblox safely.</h1>
        <p className="hero-copy">PlayDirective is designed around a dedicated, least-privilege Roblox Open Cloud key. Your studio keeps control of the credential and can revoke it from Roblox at any time.</p>
      </section>

      <section className="guide-section wrap">
        <div className="guide-grid">
          <div className="steps">
            {steps.map(([id,title,copy]) => (
              <article className="step" key={id}>
                <div className="step-num">{id}</div>
                <div><h2>{title}</h2><p>{copy}</p></div>
              </article>
            ))}
          </div>

          <aside className="side-card">
            <div className="kicker">Safe by design</div>
            <h3>Least privilege from the start.</h3>
            <p>The connection flow is designed so the studio keeps control of the key and PlayDirective only receives the analytics access it needs.</p>
            <div className="side-list">
              <div className="side-item"><b>Read-only</b><span>No publish or edit access is required.</span></div>
              <div className="side-item"><b>Revocable</b><span>You can revoke the Roblox key at any time.</span></div>
              <div className="side-item"><b>Private</b><span>Real credentials are entered only inside the private workspace.</span></div>
            </div>
          </aside>
        </div>

        <div className="security">
          <div className="security-icon">✓</div>
          <div><strong>Credential protection</strong><p>PlayDirective encrypts the API key before database storage. The key is not returned to browser JavaScript or displayed in the operator console, and it is not sent to the AI analyst.</p></div>
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
