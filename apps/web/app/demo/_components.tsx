import type { ReactNode } from "react";

const nav = [
  ["Overview", "/demo"],
  ["Connect", "/demo/connect"],
  ["Priorities", "/demo/priorities"],
  ["AI Analyst", "/demo/analyst"],
  ["Investigation", "/demo/investigation"],
  ["Experiment", "/demo/experiment"],
  ["Weekly Brief", "/demo/report"],
  ["Pilot", "/demo/pilot"],
] as const;

export const palette = {
  bg: "#06101e",
  panel: "#0b192b",
  panel2: "#081523",
  border: "rgba(113,166,204,.16)",
  text: "#f4f8fd",
  muted: "#93a9c2",
  faint: "#678099",
  cyan: "#59e6ff",
  green: "#7ae7b5",
  amber: "#f7c948",
  red: "#ff7896",
};

export function DemoShell({ children, eyebrow = "Validation demo · simulated data" }: { children: ReactNode; eyebrow?: string }) {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% -10%,rgba(0,202,255,.09),transparent 24%),linear-gradient(180deg,#06101e,#071220 58%,#06101e)", color: palette.text, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid ${palette.border}`, background: "rgba(6,16,30,.86)", backdropFilter: "blur(18px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px clamp(16px,4vw,24px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <a href="/" aria-label="PlayDirective home" style={{ display: "inline-flex", alignItems: "center" }}><img src="/brand/playdirective/logo.png" alt="PlayDirective" style={{ width: 190, height: "auto", display: "block" }} /></a>
          <nav style={{ display: "flex", gap: 7, overflowX: "auto", maxWidth: "100%", paddingBottom: 2, scrollbarWidth: "none" }}>
            {nav.map(([label, href]) => <a key={href} href={href} style={{ color: palette.muted, textDecoration: "none", fontSize: 13, whiteSpace: "nowrap", padding: "8px 11px", borderRadius: 11, border: `1px solid ${palette.border}`, background: "rgba(255,255,255,.012)" }}>{label}</a>)}
          </nav>
        </div>
      </header>
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "42px clamp(16px,4vw,24px) 86px" }}>
        <div style={{ color: palette.cyan, fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>{eyebrow}</div>
        {children}
      </section>
    </main>
  );
}

export function PageTitle({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 26, flexWrap: "wrap" }}><div><h1 style={{ margin: 0, fontSize: "clamp(38px,5.4vw,58px)", lineHeight: .98, letterSpacing: "-.05em" }}>{title}</h1><p style={{ margin: "16px 0 0", maxWidth: 780, color: palette.muted, fontSize: 16, lineHeight: 1.7 }}>{copy}</p></div>{action}</div>;
}

export function Card({ children, style }: { children: ReactNode; style?: Record<string, string | number> }) {
  return <div style={{ border: `1px solid ${palette.border}`, background: "linear-gradient(145deg,rgba(11,25,43,.96),rgba(7,18,32,.98))", borderRadius: 22, padding: 21, boxShadow: "inset 0 1px 0 rgba(255,255,255,.025),0 18px 55px rgba(0,0,0,.07)", ...style }}>{children}</div>;
}

export function Metric({ label, value, delta, tone = "neutral" }: { label: string; value: string; delta?: string; tone?: "neutral" | "good" | "bad" | "warn" }) {
  const color = tone === "good" ? palette.green : tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.cyan;
  return <Card style={{ minHeight: 122 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".13em", fontWeight: 700 }}>{label}</div><div style={{ marginTop: 10, fontSize: 32, fontWeight: 900, letterSpacing: "-.035em" }}>{value}</div>{delta && <div style={{ marginTop: 9, color, fontSize: 12, fontWeight: 800 }}>{delta}</div>}</Card>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "warn" }) {
  const color = tone === "good" ? palette.green : tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.cyan;
  return <span style={{ display: "inline-block", border: `1px solid ${color}40`, background: `${color}12`, color, borderRadius: 999, padding: "6px 10px", fontSize: 11, fontWeight: 900 }}>{children}</span>;
}

export function Button({ children, href, primary = false }: { children: ReactNode; href: string; primary?: boolean }) {
  return <a href={href} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", minHeight: 44, padding: "0 16px", borderRadius: 12, fontSize: 14, fontWeight: 850, background: primary ? "linear-gradient(135deg,#7af0ff,#31d4ed)" : "rgba(255,255,255,.015)", color: primary ? palette.bg : palette.text, border: primary ? "none" : `1px solid ${palette.border}`, boxShadow: primary ? "0 10px 28px rgba(46,216,239,.12)" : "none" }}>{children}</a>;
}

export function PriorityCard({ rank, title, impact, evidence, recommendation, tone, href = "/demo/investigation" }: { rank: number; title: string; impact: string; evidence: string; recommendation: string; tone: "bad" | "warn" | "good"; href?: string }) {
  const color = tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.green;
  return <Card style={{ padding: 0, overflow: "hidden" }}><div style={{ height: 4, background: color }} /><div style={{ padding: 21 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700 }}>Priority #{rank}</div><Pill tone={tone}>{impact}</Pill></div><h2 style={{ margin: "14px 0 8px", fontSize: 22 }}>{title}</h2><p style={{ margin: 0, color: palette.muted, lineHeight: 1.65 }}>{evidence}</p><div style={{ marginTop: 18, borderTop: `1px solid ${palette.border}`, paddingTop: 16 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Recommended action</div><p style={{ margin: "8px 0 14px", lineHeight: 1.55 }}>{recommendation}</p><Button href={href}>View evidence →</Button></div></div></Card>;
}
