import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

const checklist = [
  ["1", "Connect experience", "Use a read-only Roblox analytics key and universe ID.", "done"],
  ["2", "Validate data", "Confirm the sync returns observations or a clear empty-data state.", "done"],
  ["3", "Review priorities", "Open the top evidence-backed decision and inspect the supporting signal.", "done"],
  ["4", "Build experiment", "Generate a KPI, guardrail and decision rule from the supported finding.", "done"],
  ["5", "Weekly review", "Use the brief to review changes, experiment status and next focus.", "ready"],
] as const;

const states = [
  ["Disconnected", "No credentials", "Connect a least-privilege analytics key before analysis starts.", "warn"],
  ["Connected · no data", "Valid connection", "Explain that analytics are not available yet and offer retry/demo paths.", "neutral"],
  ["Ready", "Observations available", "Surface priorities, evidence and experiments without extra setup.", "good"],
  ["Degraded", "Sync needs attention", "Keep previous evidence visible and give a precise recovery action.", "bad"],
] as const;

export default function PilotPage() {
  return (
    <DemoShell eyebrow="Pilot readiness · end-to-end validation">
      <PageTitle
        title="Pilot workspace"
        copy="Everything a first Roblox studio needs to go from connection to a defensible product decision without analyst support."
        action={<Pill tone="good">Pilot-ready flow</Pill>}
      />

      <div style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.2fr) minmax(300px,.8fr)" }}>
        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Pilot checklist</div>
          <h2 style={{ margin: "10px 0 18px" }}>First-value path</h2>
          {checklist.map(([id, title, copy, status]) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto", gap: 12, alignItems: "start", padding: "15px 0", borderTop: `1px solid ${palette.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", color: palette.bg, background: status === "done" ? palette.green : palette.cyan, fontWeight: 900, fontSize: 12 }}>{id}</div>
              <div><div style={{ fontWeight: 800 }}>{title}</div><div style={{ marginTop: 5, color: palette.muted, lineHeight: 1.55, fontSize: 14 }}>{copy}</div></div>
              <Pill tone={status === "done" ? "good" : "neutral"}>{status === "done" ? "Ready" : "Next"}</Pill>
            </div>
          ))}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button href="/demo/connect" primary>Start pilot onboarding</Button>
            <Button href="/demo/priorities">Open first decision</Button>
          </div>
        </Card>

        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Pilot success criteria</div>
          <h3 style={{ margin: "12px 0" }}>What must work without us</h3>
          {["Studio can connect with read-only access", "Empty and error states explain the next action", "Top priority links to evidence, not a black-box score", "Experiment proposal contains KPI + guardrails", "Weekly brief closes the loop"].map((item) => <div key={item} style={{ padding: "11px 0", borderBottom: `1px solid ${palette.border}`, color: palette.muted }}>✓ {item}</div>)}
          <div style={{ marginTop: 20, color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Pilot feedback loop</div>
          <p style={{ color: palette.muted, lineHeight: 1.6 }}>After each decision, capture usefulness from 1–5 plus one short note. Feedback is categorized by onboarding, priority, analyst, experiment or weekly brief so pilot learning maps directly to product work.</p>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Connection-state UX</div>
        <h2 style={{ margin: "10px 0 16px" }}>No dead ends.</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))" }}>
          {states.map(([title, signal, copy, tone]) => (
            <Card key={title}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><strong>{title}</strong><Pill tone={tone}>{signal}</Pill></div>
              <p style={{ color: palette.muted, lineHeight: 1.6, marginBottom: 0 }}>{copy}</p>
            </Card>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
