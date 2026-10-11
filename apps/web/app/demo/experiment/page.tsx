import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

export default function ExperimentPage() {
  return <DemoShell><PageTitle title="Experiment Copilot" copy="Turn a supported finding into a structured experiment proposal with a primary KPI and guardrails." action={<Pill tone="warn">Draft</Pill>} />
    <div style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,.65fr)" }}>
      <Card><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Hypothesis</div><h2 style={{ margin: "12px 0" }}>Reducing mobile onboarding friction will improve D1 retention.</h2><p style={{ color: palette.muted, lineHeight: 1.65 }}>New mobile players show the strongest churn at Tutorial Step 3. Test a shorter version without changing desktop.</p>
        <div style={{ marginTop: 22, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <Card style={{ background: palette.panel2 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Control</div><div style={{ marginTop: 8, fontWeight: 800 }}>Current Step 3</div><div style={{ color: palette.muted, marginTop: 5 }}>5 required actions</div></Card>
          <Card style={{ background: palette.panel2 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Variant A</div><div style={{ marginTop: 8, fontWeight: 800 }}>Short Step 3</div><div style={{ color: palette.muted, marginTop: 5 }}>3 required actions</div></Card>
        </div>
        <div style={{ marginTop: 22, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>{[["Audience","New mobile users"],["Primary KPI","D1 retention"],["Secondary","Tutorial completion"],["Runtime","7–14 days"]].map(([a,b])=><div key={a} style={{ borderTop: `1px solid ${palette.border}`, paddingTop: 12 }}><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>{a}</div><div style={{ marginTop: 6, fontWeight: 800 }}>{b}</div></div>)}</div>
        <div style={{ marginTop: 22 }}><Button href="/demo/report" primary>Save experiment proposal</Button></div>
      </Card>
      <Card><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Guardrails</div>{["ARPDAU","Payer conversion","Average session length","Crash / error rate"].map(x=><div key={x} style={{ padding: "12px 0", borderBottom: `1px solid ${palette.border}` }}>✓ {x}</div>)}<div style={{ marginTop: 20, color: palette.faint, fontSize: 11, textTransform: "uppercase" }}>Decision rule</div><p style={{ color: palette.muted, lineHeight: 1.6 }}>Do not ship the variant if retention improves but a monetization guardrail materially deteriorates.</p></Card>
    </div>
  </DemoShell>;
}
