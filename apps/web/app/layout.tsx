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

          .site-shell {
            position:relative;
          }

          .site-shell > * {
            position:relative;
            z-index:1;
          }

          .site-shell .deco,
          .site-shell .section-deco {
            display:none !important;
          }

          .site-shell .section:nth-of-type(5)::after,
          .site-shell .section:nth-of-type(6)::before {
            content:none !important;
          }

          .site-shell::before {
            content:"";
            position:absolute;
            inset:0;
            z-index:0;
            pointer-events:none;
            opacity:.56;
            filter:drop-shadow(0 10px 24px rgba(0,191,255,.16));
            background-image:
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cubes2.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png'),
              url('/brand/playdirective/deco-cloud.png');
            background-repeat:
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;
            background-position:
              6% 3%,
              91% 7%,
              4% 13%,
              94% 18%,
              8% 24%,
              88% 30%,
              3% 35%,
              95% 41%,
              10% 47%,
              90% 52%,
              5% 58%,
              94% 63%,
              12% 69%,
              87% 74%,
              4% 79%,
              96% 84%,
              9% 89%,
              90% 93%,
              3% 96%,
              95% 98%,
              94% 4%,
              8% 9%,
              89% 15%,
              3% 20%,
              96% 27%,
              11% 32%,
              91% 38%,
              6% 43%,
              95% 49%,
              13% 55%,
              88% 60%,
              4% 66%,
              94% 71%,
              9% 76%,
              90% 81%,
              3% 86%,
              96% 90%,
              12% 94%,
              87% 97%,
              5% 99%,
              12% 5%,
              86% 11%,
              5% 17%,
              93% 22%,
              14% 28%,
              84% 34%,
              7% 39%,
              95% 45%,
              16% 50%,
              82% 56%,
              4% 61%,
              94% 67%,
              13% 72%,
              85% 77%,
              6% 82%,
              96% 87%,
              15% 91%,
              83% 95%,
              5% 97%,
              94% 99%;
            background-size:
              52px auto,
              66px auto,
              44px auto,
              58px auto,
              72px auto,
              48px auto,
              62px auto,
              50px auto,
              70px auto,
              46px auto,
              56px auto,
              68px auto,
              48px auto,
              64px auto,
              44px auto,
              58px auto,
              70px auto,
              46px auto,
              54px auto,
              62px auto,
              44px auto,
              58px auto,
              72px auto,
              48px auto,
              60px auto,
              46px auto,
              66px auto,
              54px auto,
              42px auto,
              70px auto,
              50px auto,
              62px auto,
              46px auto,
              68px auto,
              54px auto,
              44px auto,
              64px auto,
              48px auto,
              58px auto,
              42px auto,
              82px auto,
              96px auto,
              74px auto,
              88px auto,
              102px auto,
              78px auto,
              92px auto,
              72px auto,
              98px auto,
              84px auto,
              76px auto,
              94px auto,
              80px auto,
              104px auto,
              72px auto,
              90px auto,
              86px auto,
              100px auto,
              74px auto,
              88px auto;
          }

          @media (max-width:920px) {
            .site-shell::before {
              opacity:.42;
            }
          }

          @media (max-width:560px) {
            main:not(.site-shell) header a[href="/"]:first-child {
              width:168px;
              height:42px;
            }

            .site-shell::before {
              opacity:.34;
              filter:drop-shadow(0 8px 18px rgba(0,191,255,.12));
            }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
