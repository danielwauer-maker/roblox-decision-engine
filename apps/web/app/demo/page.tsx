import { Button, Card, DemoShell, Metric, PageTitle, Pill, palette } from "./_components";

export default function DemoOverview() {
  return (
    <DemoShell>
      <PageTitle
        title="PixelForge health"
        copy="A decision-first view of one Roblox experience. This demo uses simulated metrics to validate the product workflow before live customer data is connected."
        action={<Button href="/demo/priorities" primary>Open priorities →</Button>}
      />

      <div style={{ marginTop: 32, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
        <Metric label="Game health" value="72 / 100" delta="+5 pts vs last week" tone="good" />
        <Metric label="D1 retention" value="14.8%" delta="-2.9 pp mobile" tone="bad" />
        <Metric label="D7 retention" value="5.9%" delta="+0.7 pp" tone="good" />
        <Metric label="ARPDAU" value="R$ 2.14" delta="+8.0%" tone="good" />
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))" }}>
        <Card style={{ minHeight: 250 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start" }}>
            <div>
              <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".13em", fontWeight: 700 }}>Highest-impact opportunity</div>
              <h2 style={{ margin: "11px 0 8px", fontSize: 25, letterSpacing: "-.025em" }}>Mobile onboarding</h2>
            </div>
            <Pill tone="bad">High impact</Pill>
          </div>
          <p style={{ color: palette.muted, lineHeight: 1.68, margin: "14px 0 0", maxWidth: 560 }}>Mobile users leave Tutorial Step 3 at 2.4× the desktop rate. The signal appeared after the latest content update.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
            <Button href="/demo/investigation" primary>Investigate →</Button>
            <Button href="/demo/experiment">Draft experiment</Button>
          </div>
        </Card>

        <Card style={{ minHeight: 250 }}>
          <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".13em", fontWeight: 700 }}>Decision queue</div>
          <div style={{ marginTop: 16, display: "grid", gap: 0 }}>
            {[["1","Fix mobile onboarding","High"],["2","Hold paid acquisition","Medium"],["3","Test Session 2 starter offer","Opportunity"]].map(([n,t,s]) => (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${palette.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, display: "grid", placeItems: "center", color: palette.bg, background: palette.cyan, fontWeight: 900, fontSize: 13 }}>{n}</div>
                <div style={{ fontWeight: 650 }}>{t}</div>
                <div style={{ color: palette.muted, fontSize: 12 }}>{s}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18, color: palette.faint, fontSize: 12, lineHeight: 1.6 }}>
        Simulated workspace · no live customer data · read-only validation flow
      </div>
    </DemoShell>
  );
}
