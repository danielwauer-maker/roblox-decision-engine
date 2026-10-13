import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

const steps = [
  ["1", "Apply for the founding pilot", "Tell us who you are and which Roblox experience you want to evaluate. Never submit API credentials in the application."],
  ["2", "Receive your private invite", "Approved founding-pilot studios receive a private single-use invite by email for their isolated workspace."],
  ["3", "Connect one Roblox experience", "Inside the invited workspace, an owner adds a read-only Open Cloud key scoped to analytics."],
  ["4", "Sync and review the first priority", "PlayDirective reads available analytics, ranks supported decisions and shows the evidence behind them."],
  ["5", "Experiment and review", "Turn evidence into a bounded experiment and close the loop with a tenant-scoped Weekly Brief."],
] as const;

const principles = [
  ["Invite-only", "Real studio access starts in a private workspace. The public demo never accepts real credentials."],
  ["Read-only", "PlayDirective only needs Roblox analytics permissions for the connected experience."],
  ["Evidence first", "Every priority is grounded in tenant-scoped observations before analyst prose or experiment guidance is shown."],
  ["Private", "Studio sessions, credentials, observations and decisions stay isolated to that studio tenant."],
] as const;

export default function PilotPage() {
  return (
    <DemoShell eyebrow="Founding studio pilot · how it works">
      <PageTitle
        title="From application to first useful decision."
        copy="The public demo shows the workflow with simulated data. Real Roblox connections happen only after a studio applies, is approved and redeems its private PlayDirective invitation."
        action={<Pill tone="good">30-day guided pilot</Pill>}
      />

      <div style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.25fr) minmax(300px,.75fr)" }}>
        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Your pilot journey</div>
          <h2 style={{ margin: "10px 0 18px" }}>Five steps to first value</h2>
          {steps.map(([id, title, copy]) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", gap: 12, alignItems: "start", padding: "15px 0", borderTop: `1px solid ${palette.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", color: palette.bg, background: palette.cyan, fontWeight: 900, fontSize: 12 }}>{id}</div>
              <div><div style={{ fontWeight: 800 }}>{title}</div><div style={{ marginTop: 5, color: palette.muted, lineHeight: 1.55, fontSize: 14 }}>{copy}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button href="/apply" primary>Apply for the founding pilot</Button>
            <Button href="/demo/priorities">See the decision workflow</Button>
          </div>
        </Card>

        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>What stays private</div>
          <h3 style={{ margin: "12px 0" }}>Real credentials never belong in the demo.</h3>
          {principles.map(([title, copy]) => (
            <div key={title} style={{ padding: "13px 0", borderBottom: `1px solid ${palette.border}` }}>
              <div style={{ color: palette.text, fontWeight: 800 }}>{title}</div>
              <div style={{ marginTop: 5, color: palette.muted, lineHeight: 1.55, fontSize: 14 }}>{copy}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>What happens after approval</div>
        <h2 style={{ margin: "10px 0 16px" }}>A private workspace with a clear next action.</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))" }}>
          <Card><Pill tone="neutral">Step 1</Pill><h3 style={{ margin: "12px 0 7px" }}>Connect</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>The studio owner securely stores a read-only Roblox Open Cloud key and universe ID inside the invited workspace.</p></Card>
          <Card><Pill tone="good">Step 2</Pill><h3 style={{ margin: "12px 0 7px" }}>Sync</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>PlayDirective syncs the available analytics or explains clearly when the experience has not produced enough data yet.</p></Card>
          <Card><Pill tone="good">Step 3</Pill><h3 style={{ margin: "12px 0 7px" }}>Decide</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>The private decision queue, evidence, analyst and experiment workflow are generated from that studio&apos;s own observations.</p></Card>
          <Card><Pill tone="neutral">Ongoing</Pill><h3 style={{ margin: "12px 0 7px" }}>Review</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>Weekly Briefs close the loop by summarizing what changed, what remains important and what the studio should review next.</p></Card>
        </div>
      </div>
    </DemoShell>
  );
}
