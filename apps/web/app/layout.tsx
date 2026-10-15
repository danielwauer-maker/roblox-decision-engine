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
            opacity:.46;
            filter:drop-shadow(0 10px 24px rgba(0,191,255,.14));
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
              url('/brand/playdirective/deco-cloud.png');
            background-repeat:
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat,
              no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;
            background-position:
              7% 3%, 34% 6%, 73% 8%, 92% 12%, 18% 17%, 56% 21%,
              11% 27%, 82% 29%, 43% 34%, 91% 39%, 24% 47%, 66% 52%,
              9% 72%, 48% 78%, 88% 83%, 21% 90%, 63% 95%, 94% 98%,
              88% 4%, 46% 10%, 14% 14%, 64% 18%, 31% 23%, 93% 26%,
              8% 31%, 53% 37%, 79% 43%, 27% 49%, 70% 56%, 15% 70%,
              85% 75%, 38% 81%, 94% 86%, 12% 91%, 57% 96%, 78% 99%,
              12% 5%, 59% 12%, 84% 17%, 28% 22%, 74% 27%, 48% 32%,
              9% 41%, 89% 46%, 36% 73%, 67% 77%, 18% 82%, 53% 86%,
              82% 89%, 30% 92%, 70% 95%, 11% 97%, 45% 99%, 91% 100%;
            background-size:
              34px auto, 72px auto, 42px auto, 58px auto, 88px auto, 38px auto,
              64px auto, 46px auto, 78px auto, 32px auto, 54px auto, 40px auto,
              94px auto, 36px auto, 70px auto, 48px auto, 84px auto, 30px auto,
              42px auto, 86px auto, 34px auto, 62px auto, 96px auto, 38px auto,
              58px auto, 44px auto, 74px auto, 36px auto, 88px auto, 40px auto,
              66px auto, 32px auto, 92px auto, 48px auto, 76px auto, 38px auto,
              124px auto, 168px auto, 116px auto, 154px auto, 132px auto, 178px auto,
              110px auto, 146px auto, 184px auto, 126px auto, 160px auto, 118px auto,
              172px auto, 136px auto, 188px auto, 122px auto, 152px auto, 112px auto;
          }

          @media (max-width:920px) {
            .site-shell::before {
              opacity:.36;
              background-size:
                26px auto, 54px auto, 32px auto, 44px auto, 66px auto, 30px auto,
                48px auto, 36px auto, 58px auto, 26px auto, 42px auto, 30px auto,
                70px auto, 28px auto, 52px auto, 36px auto, 62px auto, 24px auto,
                32px auto, 64px auto, 26px auto, 46px auto, 72px auto, 28px auto,
                44px auto, 34px auto, 56px auto, 28px auto, 66px auto, 30px auto,
                50px auto, 24px auto, 68px auto, 36px auto, 58px auto, 28px auto,
                94px auto, 126px auto, 88px auto, 116px auto, 100px auto, 132px auto,
                84px auto, 110px auto, 136px auto, 96px auto, 120px auto, 90px auto,
                128px auto, 102px auto, 140px auto, 92px auto, 114px auto, 86px auto;
            }
          }

          @media (max-width:560px) {
            main:not(.site-shell) header a[href="/"]:first-child {
              width:168px;
              height:42px;
            }

            .site-shell::before {
              opacity:.25;
              filter:drop-shadow(0 8px 18px rgba(0,191,255,.10));
            }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
