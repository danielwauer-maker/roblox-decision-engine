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
            opacity:.50;
            filter:drop-shadow(0 10px 24px rgba(0,191,255,.15));
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
              8% 3%,
              31% 6%,
              72% 8%,
              91% 12%,
              19% 16%,
              54% 20%,
              83% 24%,
              10% 29%,
              39% 33%,
              68% 37%,
              93% 42%,
              24% 47%,
              58% 51%,
              81% 56%,
              7% 61%,
              43% 66%,
              74% 71%,
              17% 77%,
              89% 84%,
              52% 93%,
              88% 4%,
              47% 10%,
              15% 14%,
              64% 18%,
              35% 23%,
              92% 27%,
              6% 34%,
              51% 39%,
              77% 44%,
              27% 49%,
              61% 54%,
              12% 58%,
              86% 63%,
              33% 69%,
              69% 74%,
              94% 79%,
              21% 85%,
              57% 88%,
              79% 95%,
              9% 98%,
              13% 7%,
              59% 12%,
              84% 17%,
              29% 21%,
              74% 26%,
              48% 31%,
              9% 38%,
              88% 43%,
              37% 48%,
              66% 53%,
              18% 57%,
              53% 62%,
              82% 68%,
              30% 73%,
              71% 78%,
              11% 83%,
              45% 87%,
              91% 91%,
              63% 96%,
              26% 99%;
            background-size:
              52px auto,
              64px auto,
              46px auto,
              58px auto,
              72px auto,
              48px auto,
              62px auto,
              50px auto,
              68px auto,
              46px auto,
              56px auto,
              70px auto,
              48px auto,
              64px auto,
              44px auto,
              58px auto,
              72px auto,
              46px auto,
              54px auto,
              62px auto,
              44px auto,
              58px auto,
              70px auto,
              48px auto,
              60px auto,
              46px auto,
              66px auto,
              54px auto,
              42px auto,
              72px auto,
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
              86px auto,
              98px auto,
              76px auto,
              90px auto,
              104px auto,
              80px auto,
              94px auto,
              74px auto,
              100px auto,
              86px auto,
              78px auto,
              96px auto,
              82px auto,
              106px auto,
              74px auto,
              92px auto,
              88px auto,
              102px auto,
              76px auto,
              90px auto;
          }

          @media (max-width:920px) {
            .site-shell::before {
              opacity:.40;
            }
          }

          @media (max-width:560px) {
            main:not(.site-shell) header a[href="/"]:first-child {
              width:168px;
              height:42px;
            }

            .site-shell::before {
              opacity:.30;
              filter:drop-shadow(0 8px 18px rgba(0,191,255,.11));
            }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
