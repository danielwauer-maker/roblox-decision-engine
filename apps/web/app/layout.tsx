import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://playdirective.com"),
  title: {
    default: "PlayDirective",
    template: "%s · PlayDirective",
  },
  description: "Decision intelligence for Roblox studios. Know what changed. Know what to do next.",
  openGraph: {
    title: "PlayDirective",
    description: "Turn Roblox analytics into evidence-backed priorities and your next best move.",
    type: "website",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07101f" }}>
        <style>{`
          main:not(.site-shell) header a[href="/"]:first-child:not(:has(img)) {
            display:block;width:190px;height:48px;flex:0 0 auto;overflow:hidden;text-indent:-9999px;
            background:url('/brand/playdirective/logo.png') left center / contain no-repeat;
          }

          .global-mobile-menu{display:none}

          /* Final desktop micro-polish for the PlayDirective landing page. */
          @media (min-width:921px) {
            .site-shell .hero-image {
              width:119%;
              max-width:845px;
              transform:translateX(1.5%);
            }

            .site-shell .trust-strip {
              padding:27px 0;
              border-top-color:rgba(142,186,220,.17);
              border-bottom-color:rgba(142,186,220,.17);
              background:linear-gradient(90deg,rgba(10,29,49,.15),rgba(13,39,63,.28),rgba(10,29,49,.15));
            }
            .site-shell .trust-chip {
              padding:10px 24px;
            }
            .site-shell .trust-chip b {
              font-size:12.5px;
              margin-bottom:9px;
            }
            .site-shell .trust-chip span {
              color:#91a8c2;
            }

            .site-shell .workflow-image,
            .site-shell .security-image {
              transform:scale(1.055);
              transform-origin:center;
            }

            .site-shell .pilot-panel {
              grid-template-columns:1.14fr .86fr;
            }
            .site-shell .pilot-art img {
              width:min(116%,410px);
              transform:translateX(-3%);
              filter:drop-shadow(0 28px 56px rgba(0,193,255,.20));
            }

            .site-shell .footer {
              margin-top:74px;
              border-top:1px solid rgba(132,173,205,.14);
              background:linear-gradient(180deg,rgba(8,22,38,.28),rgba(5,14,26,.58));
            }
            .site-shell .footer-inner {
              min-height:104px;
              padding-top:24px;
              padding-bottom:24px;
            }
          }

          /* Mobile / tablet polish for the landing page. These overrides intentionally
             sit at the app root so the desktop page can stay frozen. */
          @media (max-width:920px) {
            .site-shell .header-inner{height:64px!important;padding-right:52px}
            .site-shell .brand-logo{width:174px!important}
            .site-shell .nav{display:none!important}

            .site-shell + .global-mobile-menu{display:block;position:fixed;right:14px;top:12px;z-index:120;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eef7ff}
            .global-mobile-menu summary{list-style:none;width:40px;height:40px;border:1px solid rgba(89,230,255,.28);border-radius:11px;background:rgba(8,24,40,.94);box-shadow:0 10px 30px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.04);display:grid;place-items:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
            .global-mobile-menu summary::-webkit-details-marker{display:none}
            .global-mobile-menu summary span,.global-mobile-menu summary:before,.global-mobile-menu summary:after{content:"";display:block;width:18px;height:1.5px;border-radius:999px;background:#bfefff;transition:transform .18s ease,opacity .18s ease}
            .global-mobile-menu summary span{position:absolute}
            .global-mobile-menu summary:before{transform:translateY(-6px)}
            .global-mobile-menu summary:after{transform:translateY(6px)}
            .global-mobile-menu[open] summary span{opacity:0}
            .global-mobile-menu[open] summary:before{transform:rotate(45deg)}
            .global-mobile-menu[open] summary:after{transform:rotate(-45deg)}
            .global-mobile-menu .mobile-menu-panel{position:absolute;right:0;top:48px;width:min(300px,calc(100vw - 28px));padding:10px;border:1px solid rgba(89,230,255,.19);border-radius:16px;background:rgba(7,20,35,.985);box-shadow:0 24px 70px rgba(0,0,0,.42);backdrop-filter:blur(22px)}
            .global-mobile-menu .mobile-menu-panel a{display:flex;align-items:center;justify-content:space-between;min-height:46px;padding:0 13px;border-radius:10px;color:#b9c9da;text-decoration:none;font-size:14px;font-weight:700}
            .global-mobile-menu .mobile-menu-panel a:hover{background:rgba(103,232,249,.06);color:#fff}
            .global-mobile-menu .mobile-menu-panel a:after{content:"→";color:#67e8f9;font-weight:800}
            .global-mobile-menu .mobile-menu-panel a.mobile-menu-cta{margin-top:6px;background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f;justify-content:center}
            .global-mobile-menu .mobile-menu-panel a.mobile-menu-cta:after{margin-left:8px;color:#05121f}

            .site-shell .hero{padding:42px 0 30px!important}
            .site-shell .hero-grid{gap:6px!important}
            .site-shell .hero h1{font-size:clamp(44px,10.5vw,61px)!important;line-height:.99!important;margin:15px 0 18px!important;max-width:620px!important}
            .site-shell .hero-copy{font-size:16.5px!important;line-height:1.52!important;margin-bottom:22px!important;max-width:560px!important}
            .site-shell .hero-art{min-height:390px!important;margin-top:0!important}
            .site-shell .hero-image{width:108%!important;max-width:650px!important}

            .site-shell .trust-strip{margin-bottom:42px!important;padding:0!important;background:rgba(10,29,49,.12)!important}
            .site-shell .trust-chip{padding:17px 16px!important}
            .site-shell .trust-chip b{font-size:11px!important;margin-bottom:6px!important}
            .site-shell .trust-chip span{font-size:12px!important;line-height:1.4!important}

            .site-shell .section{padding:52px 0!important}
            .site-shell .section-head{margin-bottom:28px!important}
            .site-shell .section-title{font-size:clamp(38px,8vw,50px)!important;line-height:1.02!important;margin:10px 0 12px!important}
            .site-shell .section-copy{font-size:16px!important;line-height:1.55!important}

            .site-shell .queue-grid{gap:22px!important}
            .site-shell .queue-stack{gap:10px!important}
            .site-shell .queue-card{padding:16px!important;border-radius:15px!important}

            .site-shell .workflow-grid,.site-shell .security-cards{gap:16px!important}
            .site-shell .workflow-card{min-height:350px!important;padding:18px!important;border-radius:20px!important}
            .site-shell .workflow-image-wrap{height:205px!important;flex-basis:205px!important}
            .site-shell .workflow-meta{grid-template-columns:38px 1fr!important;gap:10px!important}
            .site-shell .workflow-meta h3{font-size:23px!important}
            .site-shell .workflow-meta p{font-size:14px!important}

            .site-shell .security-cards{margin-top:26px!important}
            .site-shell .security-card{min-height:370px!important;padding:18px!important;border-radius:20px!important}
            .site-shell .security-image-wrap{height:205px!important}
            .site-shell .security-card h3{font-size:21px!important}
            .site-shell .security-card p{font-size:14px!important;line-height:1.55!important}

            .site-shell .pilot-panel{padding:30px 24px!important;border-radius:22px!important;gap:12px!important}
            .site-shell .pilot-art{order:0!important;min-height:185px!important;margin-top:4px!important}
            .site-shell .pilot-art img{width:min(78vw,280px)!important}
            .site-shell .pilot-panel h2{font-size:clamp(36px,8vw,48px)!important;margin:10px 0 14px!important}
            .site-shell .pilot-panel p{font-size:15px!important;line-height:1.55!important;margin-bottom:20px!important}

            .site-shell .faq-list{margin-top:24px!important}
            .site-shell .faq-item summary{padding:19px 2px!important;font-size:16px!important;line-height:1.35!important}
            .site-shell .faq-item p{font-size:14px!important;line-height:1.6!important;padding-bottom:19px!important}

            .site-shell .footer{margin-top:42px!important;padding:24px 0 28px!important}

            .site-shell .decoration{display:none!important}
            .site-shell .decoration:nth-child(6n){display:block!important;opacity:.05!important}
            .site-shell .decoration-cloud:nth-child(6n){opacity:.035!important}
          }

          @media(max-width:560px){
            main:not(.site-shell) header a[href="/"]:first-child:not(:has(img)){width:168px;height:42px}

            .site-shell .wrap{width:calc(100% - 32px)!important}
            .site-shell .header-inner{height:60px!important;padding-right:50px}
            .site-shell .brand-logo{width:150px!important}
            .site-shell + .global-mobile-menu{right:10px;top:10px}
            .global-mobile-menu summary{width:38px;height:38px;border-radius:10px}
            .global-mobile-menu .mobile-menu-panel{top:45px;width:min(290px,calc(100vw - 20px))}

            .site-shell .hero{padding:34px 0 22px!important}
            .site-shell .eyebrow,.site-shell .kicker{font-size:10.5px!important;letter-spacing:.18em!important;line-height:1.45!important}
            .site-shell .hero h1{font-size:42px!important;line-height:.98!important;letter-spacing:-.05em!important;margin:13px 0 16px!important}
            .site-shell .hero-copy{font-size:15px!important;line-height:1.5!important;margin-bottom:18px!important}
            .site-shell .cta-row{gap:9px!important}
            .site-shell .btn{min-height:48px!important;border-radius:11px!important;font-size:13px!important;padding:0 16px!important}
            .site-shell .hero-art{min-height:285px!important;margin-top:0!important}
            .site-shell .hero-image{width:112%!important;max-width:460px!important}

            .site-shell .trust-strip{grid-template-columns:1fr 1fr!important;margin-bottom:34px!important}
            .site-shell .trust-chip{padding:15px 10px!important;border-right:1px solid rgba(142,186,220,.11)!important;border-bottom:1px solid rgba(142,186,220,.11)!important}
            .site-shell .trust-chip:nth-child(2n){border-right:0!important}
            .site-shell .trust-chip:nth-child(n+3){border-bottom:0!important}
            .site-shell .trust-chip b{font-size:9.5px!important;letter-spacing:.14em!important}
            .site-shell .trust-chip span{font-size:11px!important}

            .site-shell .section{padding:42px 0!important}
            .site-shell .section-head{margin-bottom:22px!important}
            .site-shell .section-title{font-size:36px!important;line-height:1.03!important}
            .site-shell .section-copy{font-size:14.5px!important}

            .site-shell .queue-card{grid-template-columns:42px 1fr!important;gap:12px!important;padding:14px!important}
            .site-shell .rank{width:38px!important;height:38px!important;font-size:16px!important;border-radius:10px!important}
            .site-shell .queue-card h3{font-size:15px!important;margin-bottom:7px!important}
            .site-shell .pills{gap:5px!important}
            .site-shell .pill{font-size:8px!important;padding:4px 7px!important}
            .site-shell .queue-spark{display:none!important}

            .site-shell .workflow-card{min-height:320px!important;padding:16px!important}
            .site-shell .workflow-image-wrap{height:185px!important;flex-basis:185px!important}
            .site-shell .workflow-meta h3{font-size:21px!important}
            .site-shell .workflow-meta p{font-size:13.5px!important}

            .site-shell .security-card{min-height:340px!important;padding:16px!important}
            .site-shell .security-image-wrap{height:185px!important}
            .site-shell .security-card .label{font-size:10px!important;margin-bottom:7px!important}
            .site-shell .security-card h3{font-size:20px!important;margin-bottom:8px!important}
            .site-shell .security-card p{font-size:13.5px!important}

            .site-shell .pilot-panel{padding:24px 18px!important;border-radius:20px!important}
            .site-shell .pilot-panel h2{font-size:34px!important;line-height:1.02!important}
            .site-shell .pilot-panel p{font-size:14px!important}
            .site-shell .pilot-art{min-height:160px!important}
            .site-shell .pilot-art img{width:min(72vw,240px)!important}

            .site-shell .faq-item summary{font-size:15px!important;padding:17px 2px!important}
            .site-shell .footer-inner{gap:14px!important;font-size:12px!important}
            .site-shell .footer-links{gap:14px!important}
          }
        `}</style>
        {children}
        <details className="global-mobile-menu">
          <summary aria-label="Open navigation menu"><span /></summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            <a href="/#workflow">How it works</a>
            <a href="/#security">Security</a>
            <a href="/pricing">Pricing</a>
            <a href="/demo">Demo</a>
            <a className="mobile-menu-cta" href="/apply">Apply for founding pilot</a>
          </nav>
        </details>
      </body>
    </html>
  );
}
