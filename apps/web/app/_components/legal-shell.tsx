import type { ReactNode } from "react";

export function LegalShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="legal-shell">
      <style>{`
        :root{color-scheme:dark}
        html{scroll-behavior:smooth}
        body{margin:0;background:#06101e}
        .legal-shell{--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(0,202,255,.09),transparent 24%),linear-gradient(180deg,#06101e,#071220 58%,#06101e);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative;overflow:hidden}
        .legal-shell *{box-sizing:border-box}.legal-shell a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 40px));margin:0 auto;position:relative}
        .header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.84);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.08)}
        .header-inner{height:78px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:24px;font-size:14px;color:#b9c9da}.nav a:hover{color:#fff}.nav-cta{padding:11px 16px;border:1px solid rgba(89,230,255,.34);border-radius:12px;background:rgba(24,211,246,.08);color:#efffff!important}
        .hero{padding:62px 0 34px}.eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:var(--cyan)}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end}.hero h1{font-size:clamp(48px,6vw,72px);line-height:.98;letter-spacing:-.055em;margin:15px 0 18px}.hero p{max-width:760px;color:#9fb1c7;font-size:17px;line-height:1.7;margin:0}.updated{font-size:12px;color:#748aa2;border:1px solid rgba(132,173,205,.14);background:rgba(8,24,41,.52);border-radius:999px;padding:9px 12px;white-space:nowrap}
        .body{display:grid;grid-template-columns:250px minmax(0,1fr);gap:44px;padding:16px 0 78px}.side{position:sticky;top:106px;align-self:start;border:1px solid rgba(91,169,217,.14);background:rgba(8,24,41,.52);border-radius:20px;padding:18px}.side-title{font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:#6f88a2;margin-bottom:11px}.side a{display:block;padding:8px 0;color:#9bb0c6;font-size:13px;border-bottom:1px solid rgba(255,255,255,.045)}.side a:last-child{border-bottom:0}.side a:hover{color:#dff7ff}
        .content{min-width:0}.highlights{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}.highlight{border:1px solid rgba(89,230,255,.16);background:linear-gradient(145deg,rgba(10,29,49,.72),rgba(7,19,33,.8));border-radius:18px;padding:17px}.highlight b{display:block;color:var(--cyan);font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7px}.highlight span{display:block;color:#a9bbcd;font-size:13px;line-height:1.55}
        .legal-section{scroll-margin-top:110px;border-top:1px solid rgba(132,173,205,.13);padding:25px 0 27px}.legal-section:first-of-type{border-top:1px solid rgba(132,173,205,.13)}.legal-section h2{margin:0 0 10px;font-size:21px;letter-spacing:-.02em}.legal-section p,.legal-section .legal-copy{margin:0;color:#9fb1c7;font-size:14px;line-height:1.78}.notice{border:1px solid rgba(251,113,133,.3);background:rgba(251,113,133,.055);color:#fecdd3;border-radius:18px;padding:17px 18px;line-height:1.65;margin-bottom:22px}
        .footer{border-top:1px solid rgba(132,173,205,.12);background:rgba(4,12,23,.42)}.footer-inner{min-height:102px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#758aa1;font-size:12px}.footer-links{display:flex;gap:20px}.footer a:hover{color:#dfefff}
        .deco{position:absolute;pointer-events:none;opacity:.055;filter:drop-shadow(0 12px 24px rgba(0,191,255,.1));z-index:0}.deco-1{width:72px;left:3%;top:25%}.deco-2{width:100px;right:3%;top:67%}.legal-shell>header,.legal-shell>.hero,.legal-shell>.body,.legal-shell>footer{position:relative;z-index:1}
        @media(max-width:920px){.body{grid-template-columns:1fr}.side{position:relative;top:auto;display:none}.highlights{grid-template-columns:1fr 1fr}.hero-grid{grid-template-columns:1fr}.updated{justify-self:start}.deco{opacity:.035}}
        @media(max-width:560px){.wrap{width:calc(100% - 24px)}.header-inner{height:68px}.brand-logo{width:168px}.nav>a:not(.nav-cta){display:none}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding:42px 0 24px}.hero h1{font-size:44px}.hero p{font-size:16px}.highlights{grid-template-columns:1fr}.body{gap:20px;padding-bottom:54px}.legal-section{padding:22px 0}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0}.footer-links{flex-wrap:wrap}.deco{display:none}}
      `}</style>

      <img className="deco deco-1" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />
      <img className="deco deco-2" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/help">Help</a><a href="/demo">Demo</a><a href="/pricing">Pricing</a><a className="nav-cta" href="/app/login">Pilot sign in</a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <div className="eyebrow">{eyebrow}</div>
        <div className="hero-grid">
          <div><h1>{title}</h1><p>{intro}</p></div>
          <div className="updated">{updated}</div>
        </div>
      </section>

      {children}

      <footer className="footer">
        <div className="wrap footer-inner"><span>PlayDirective · Early Access</span><div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a></div></div>
      </footer>
    </main>
  );
}

export function LegalBody({ toc, highlights, children }: { toc: { id: string; label: string }[]; highlights?: { label: string; text: string }[]; children: ReactNode }) {
  return <section className="body wrap"><aside className="side"><div className="side-title">On this page</div>{toc.map((item)=><a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</aside><div className="content">{highlights && <div className="highlights">{highlights.map((item)=><div className="highlight" key={item.label}><b>{item.label}</b><span>{item.text}</span></div>)}</div>}{children}</div></section>;
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className="legal-section"><h2>{title}</h2><div className="legal-copy">{children}</div></section>;
}
