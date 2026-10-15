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
          main:not(.site-shell) header a[href="/"]:first-child {
            display:block;width:190px;height:48px;flex:0 0 auto;overflow:hidden;text-indent:-9999px;
            background:url('/brand/playdirective/logo.png') left center / contain no-repeat;
          }

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

          @media(max-width:560px){main:not(.site-shell) header a[href="/"]:first-child{width:168px;height:42px}}
        `}</style>
        {children}
      </body>
    </html>
  );
}
