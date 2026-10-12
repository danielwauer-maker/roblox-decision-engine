import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

const metric = (label: string, value: string, note?: string) => (
  <div style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 12 }}>
    <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
    <div style={{ marginTop: 6, fontWeight: 800 }}>{value}</div>
    {note ? <div style={{ color: palette.muted, marginTop: 4, fontSize: 13 }}>{note}</div> : null}
  </div>
);

export default function ExperimentPage() {
  return (
    <DemoShell>
      <PageTitle
        title="Experiment Copilot"
        copy="Turn a supported finding into a testable plan, protect key guardrails and interpret the result with a deterministic Ship / Iterate / Stop rule."
        action={<Pill tone="good">R6 copilot</Pill>}
      />

      <div style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.35fr) minmax(300px,.65fr)" }}>
        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Supported hypothesis</div>
          <h2 style={{ margin: "12px 0" }}>Shorten mobile onboarding Step 3.</h2>
          <p style={{ color: palette.muted, lineHeight: 1.65, maxWidth: 760 }}>
            If new mobile players complete a shorter Step 3, D1 retention should improve without materially harming monetization or session quality. The evidence supports testing this hypothesis; it does not prove causality.
          </p>

          <div style={{ marginTop: 22, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <Card style={{ background: palette.panel2 }}>
              <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Control</div>
              <div style={{ marginTop: 8, fontWeight: 800 }}>Current Step 3</div>
              <div style={{ color: palette.muted, marginTop: 5 }}>5 required actions</div>
            </Card>
            <Card style={{ background: palette.panel2 }}>
              <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Variant A</div>
              <div style={{ marginTop: 8, fontWeight: 800 }}>Short Step 3</div>
              <div style={{ color: palette.muted, marginTop: 5 }}>3 required actions</div>
            </Card>
          </div>

          <div style={{ marginTop: 22, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))" }}>
            {metric("Audience", "New mobile players")}
            {metric("Primary KPI", "D1 retention", "+10% relative lift")}
            {metric("Minimum sample", "3,000 players")}
            {metric("Runtime", "7–14 days")}
          </div>
        </Card>

        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Guardrails</div>
          {[
            ["ARPDAU", "Max −5%"],
            ["Payer conversion", "Max −5%"],
            ["Crash rate", "Max +2%"],
          ].map(([name, limit]) => (
            <div key={name} style={{ padding: "13px 0", borderBottom: `1px solid ${palette.border}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span>✓ {name}</span><strong>{limit}</strong>
            </div>
          ))}
          <div style={{ marginTop: 20, color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Decision rule</div>
          <p style={{ color: palette.muted, lineHeight: 1.6 }}>
            Stop when a protected guardrail materially deteriorates. Ship only after the sample threshold is reached and the primary KPI clears the target lift. Otherwise iterate.
          </p>
        </Card>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)" }}>
        <Card>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Example observed result</div>
          <h2 style={{ margin: "12px 0 18px" }}>Variant A after 3,420 players</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
            {metric("D1 lift", "+12.4%")}
            {metric("ARPDAU", "+1.2%")}
            {metric("Payer conversion", "+0.4%")}
            {metric("Crash rate", "+0.1%")}
          </div>
        </Card>

        <Card style={{ borderColor: "rgba(74,222,128,.28)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Copilot interpretation</div>
              <h2 style={{ margin: "10px 0 8px" }}>SHIP</h2>
            </div>
            <Pill tone="good">Threshold cleared</Pill>
          </div>
          <p style={{ color: palette.muted, lineHeight: 1.65 }}>
            The experiment cleared the +10% D1 target with the minimum sample reached and no guardrail breach. The result supports shipping the shorter Step 3 to the tested mobile audience, followed by continued monitoring after rollout.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button href="/demo/report" primary>Open weekly brief</Button>
            <Button href="/demo/investigation">Inspect evidence</Button>
          </div>
        </Card>
      </div>
    </DemoShell>
  );
}
