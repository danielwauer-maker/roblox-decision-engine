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
  bg: "#07101f",
  panel: "#0c1728",
  panel2: "#0a1423",
  border: "rgba(255,255,255,.09)",
  text: "#eef7ff",
  muted: "#93a4bb",
  faint: "#5f7189",
  cyan: "#67e8f9",
  green: "#86efac",
  amber: "#fbbf24",
  red: "#fb7185",
};

export function DemoShell({ children, eyebrow = "Validation demo · simulated data" }: { children: ReactNode; eyebrow?: string }) {
  return (
    <main style={{ minHeight: "100vh", background: palette.bg, color: palette.text, fontFamily: "Arial, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid ${palette.border}`, background: "rgba(7,16,31,.94)", backdropFilter: "blur(14px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px clamp(16px,4vw,24px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <a href="/" style={{ textDecoration: "none", color: palette.text, fontWeight: 800, letterSpacing: "-.02em" }}>Roblox Decision Engine</a>
          <nav style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "100%", paddingBottom: 2 }}>
            {nav.map(([label, href]) => <a key={href} href={href} style={{ color: palette.muted, textDecoration: "none", fontSize: 13, whiteSpace: "nowrap", padding: "8px 10px", borderRadius: 10, border: `1px solid ${palette.border}` }}>{label}</a>)}
          </nav>
        </div>
      </header>
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "34px clamp(16px,4vw,24px) 80px" }}>
        <div style={{ color: palette.cyan, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>{eyebrow}</div>
        {children}
      </section>
    </main>
  );
}

export function PageTitle({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 18, flexWrap: "wrap" }}><div><h1 style={{ margin: 0, fontSize: "clamp(34px,7vw,52px)", lineHeight: 1, letterSpacing: "-.045em" }}>{title}</h1><p style={{ margin: "14px 0 0", maxWidth: 760, color: palette.muted, fontSize: 16, lineHeight: 1.65 }}>{copy}</p></div>{action}</div>;
}

export function Card({ children, style }: { children: ReactNode; style?: Record<string, string | number> }) {
  return <div style={{ border: `1px solid ${palette.border}`, background: palette.panel, borderRadius: 20, padding: 20, ...style }}>{children}</div>;
}

export function Metric({ label, value, delta, tone = "neutral" }: { label: string; value: string; delta?: string; tone?: "neutral" | "good" | "bad" | "warn" }) {
  const color = tone === "good" ? palette.green : tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.cyan;
  return <Card><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</div><div style={{ marginTop: 9, fontSize: 30, fontWeight: 800 }}>{value}</div>{delta && <div style={{ marginTop: 8, color, fontSize: 12, fontWeight: 700 }}>{delta}</div>}</Card>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "warn" }) {
  const color = tone === "good" ? palette.green : tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.cyan;
  return <span style={{ display: "inline-block", border: `1px solid ${color}33`, background: `${color}10`, color, borderRadius: 999, padding: "6px 9px", fontSize: 11, fontWeight: 800 }}>{children}</span>;
}

export function Button({ children, href, primary = false }: { children: ReactNode; href: string; primary?: boolean }) {
  return <a href={href} style={{ display: "inline-block", textDecoration: "none", padding: "11px 14px", borderRadius: 11, fontSize: 14, fontWeight: 800, background: primary ? palette.cyan : "transparent", color: primary ? palette.bg : palette.text, border: primary ? "none" : `1px solid ${palette.border}` }}>{children}</a>;
}

export function PriorityCard({ rank, title, impact, evidence, recommendation, tone, href = "/demo/investigation" }: { rank: number; title: string; impact: string; evidence: string; recommendation: string; tone: "bad" | "warn" | "good"; href?: string }) {
  const color = tone === "bad" ? palette.red : tone === "warn" ? palette.amber : palette.green;
  return <Card style={{ padding: 0, overflow: "hidden" }}><div style={{ height: 4, background: color }} /><div style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Priority #{rank}</div><Pill tone={tone}>{impact}</Pill></div><h2 style={{ margin: "14px 0 8px", fontSize: 22 }}>{title}</h2><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>{evidence}</p><div style={{ marginTop: 18, borderTop: `1px solid ${palette.border}`, paddingTop: 16 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Recommended action</div><p style={{ margin: "8px 0 14px", lineHeight: 1.55 }}>{recommendation}</p><Button href={href}>View evidence →</Button></div></div></Card>;
}
