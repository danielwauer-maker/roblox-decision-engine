import { Button, Card, DemoShell, Metric, PageTitle, Pill, palette } from "./_components";

export default function DemoOverview() {
  return <DemoShell><PageTitle title="PixelForge health" copy="A decision-first view of one Roblox experience. This demo uses simulated metrics to validate the product workflow before live customer data is connected." action={<Button href="/demo/priorities" primary>Open priorities</Button>} />
    <div style={{ marginTop: 28, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
      <Metric label="Game health" value="72 / 100" delta="+5 pts vs last week" tone="good" />
      <Metric label="D1 retention" value="14.8%" delta="-2.9 pp mobile" tone="bad" />
      <Metric label="D7 retention" value="5.9%" delta="+0.7 pp" tone="good" />
      <Metric label="ARPDAU" value="R$ 2.14" delta="+8.0%" tone="good" />
    </div>
    <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
      <Card><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Highest-impact opportunity</div><h2 style={{ margin: "10px 0 8px" }}>Mobile onboarding</h2></div><Pill tone="bad">High impact</Pill></div><p style={{ color: palette.muted, lineHeight: 1.65 }}>Mobile users leave Tutorial Step 3 at 2.4× the desktop rate. The signal appeared after the latest content update.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}><Button href="/demo/investigation" primary>Investigate</Button><Button href="/demo/experiment">Draft experiment</Button></div></Card>
      <Card><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Decision queue</div><div style={{ marginTop: 14, display: "grid", gap: 12 }}>{[["1","Fix mobile onboarding","High"],["2","Hold paid acquisition","Medium"],["3","Test Session 2 starter offer","Opportunity"]].map(([n,t,s])=><div key={n} style={{ display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 10, alignItems: "center", paddingBottom: 12, borderBottom: `1px solid ${palette.border}` }}><div style={{ color: palette.cyan, fontWeight: 800 }}>{n}</div><div>{t}</div><div style={{ color: palette.muted, fontSize: 12 }}>{s}</div></div>)}</div></Card>
    </div>
  </DemoShell>;
}
