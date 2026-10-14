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
            display:block;
            width:190px;
            height:48px;
            flex:0 0 auto;
            overflow:hidden;
            text-indent:-9999px;
            background-image:url('/brand/playdirective/logo.png');
            background-repeat:no-repeat;
            background-position:left center;
            background-size:contain;
          }

          .site-shell .section:nth-of-type(5)::after {
            content:"";
            position:absolute;
            width:118px;
            height:92px;
            right:-26px;
            top:10%;
            background:url('/brand/playdirective/deco-cloud.png') center/contain no-repeat;
            opacity:.48;
            pointer-events:none;
            filter:drop-shadow(0 14px 28px rgba(0,191,255,.14));
            z-index:0;
          }

          .site-shell .section:nth-of-type(6)::before {
            content:"";
            position:absolute;
            width:92px;
            height:92px;
            right:-18px;
            top:18%;
            background:url('/brand/playdirective/deco-cubes.png') center/contain no-repeat;
            opacity:.46;
            pointer-events:none;
            filter:drop-shadow(0 14px 28px rgba(0,191,255,.14));
            z-index:0;
          }

          @media (max-width:560px) {
            main:not(.site-shell) header a[href="/"]:first-child {
              width:168px;
              height:42px;
            }

            .site-shell .section-deco {
              display:block !important;
              opacity:.34 !important;
              width:58px !important;
              z-index:0 !important;
            }
            .site-shell .section-deco.cubes-left {
              left:auto !important;
              right:-14px !important;
              top:7% !important;
            }
            .site-shell .section-deco.cubes-right {
              right:-14px !important;
              top:8% !important;
            }
            .site-shell .section-deco.cloud-right {
              right:-12px !important;
              bottom:4% !important;
              width:68px !important;
            }
            .site-shell .section:nth-of-type(5)::after {
              width:72px;
              height:62px;
              right:-10px;
              top:3%;
              opacity:.34;
            }
            .site-shell .section:nth-of-type(6)::before {
              width:62px;
              height:62px;
              right:-12px;
              top:9%;
              opacity:.34;
            }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
