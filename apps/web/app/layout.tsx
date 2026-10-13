import type { Metadata } from "next";
import type { ReactNode } from "react";

import MarketingAttribution from "./MarketingAttribution";

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
        <MarketingAttribution />
        {children}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.08)", background: "#07101f", color: "#718198", fontFamily: "Arial, sans-serif" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px clamp(20px,5vw,24px)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            <span>PlayDirective · Early Access</span>
            <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="/privacy" style={{ color: "#9fb1c7", textDecoration: "none" }}>Privacy</a>
              <a href="/terms" style={{ color: "#9fb1c7", textDecoration: "none" }}>Terms</a>
              <a href="/legal" style={{ color: "#9fb1c7", textDecoration: "none" }}>Legal notice</a>
              <a href="/admin/login" style={{ color: "#9fb1c7", textDecoration: "none" }}>Admin</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
