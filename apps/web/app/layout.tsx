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
          @media(max-width:560px){main:not(.site-shell) header a[href="/"]:first-child{width:168px;height:42px}}
        `}</style>
        {children}
      </body>
    </html>
  );
}
