import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://roblox-decision-engine.vercel.app"),
  title: {
    default: "Roblox Decision Engine",
    template: "%s · Roblox Decision Engine",
  },
  description: "AI Product & Growth Analyst for Roblox studios that turns analytics into evidence-backed priorities and experiments.",
  openGraph: {
    title: "Roblox Decision Engine",
    description: "Know what to fix next. Evidence-backed product decisions for Roblox studios.",
    type: "website",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07101f" }}>
        {children}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,.08)", background: "#07101f", color: "#718198", fontFamily: "Arial, sans-serif" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "22px clamp(20px,5vw,24px)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            <span>Roblox Decision Engine · Early Access</span>
            <nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="/privacy" style={{ color: "#9fb1c7", textDecoration: "none" }}>Privacy</a>
              <a href="/terms" style={{ color: "#9fb1c7", textDecoration: "none" }}>Terms</a>
              <a href="/portfolio" style={{ color: "#9fb1c7", textDecoration: "none" }}>Build log</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
