import { Card, DemoShell, PageTitle, Pill, PriorityCard, palette } from "../_components";

export default function PrioritiesPage() {
  return <DemoShell>
    <PageTitle
      title="Today's priorities"
      copy="Three ranked actions, not another wall of charts. Each recommendation links back to evidence before it becomes an experiment."
    />

    <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ color: palette.faint, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>Decision window</div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 850 }}>This week</div>
        <div style={{ marginTop: 5, color: palette.muted, fontSize: 12, lineHeight: 1.5 }}>Focus on the smallest set of actions most likely to improve player value.</div>
      </Card>
      <Card style={{ padding: 16 }}>
        <div style={{ color: palette.faint, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>Evidence state</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}><Pill tone="good">Supported</Pill><strong style={{ fontSize: 14 }}>3 ranked decisions</strong></div>
        <div style={{ marginTop: 7, color: palette.muted, fontSize: 12, lineHeight: 1.5 }}>Each priority is traceable to a measurable signal before action is recommended.</div>
      </Card>
      <Card style={{ padding: 16 }}>
        <div style={{ color: palette.faint, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>Primary objective</div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 850 }}>Recover mobile D1</div>
        <div style={{ marginTop: 5, color: palette.muted, fontSize: 12, lineHeight: 1.5 }}>Do not scale paid acquisition until the onboarding signal recovers.</div>
      </Card>
    </div>

    <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
      <PriorityCard rank={1} title="Fix mobile onboarding" impact="High impact" tone="bad" evidence="Mobile D1 retention is 8.7% versus 17.9% on desktop. Tutorial Step 3 churn increased from 42% to 67%." recommendation="Reduce Step 3 from five required actions to three and test the shorter flow for new mobile players." />
      <PriorityCard rank={2} title="Do not scale acquisition yet" impact="Protect spend" tone="warn" evidence="Paid traffic is up 28%, while new-player D1 retention remains below the recent baseline." recommendation="Hold additional ad spend until onboarding recovers; re-evaluate after the proposed mobile experiment." />
      <PriorityCard rank={3} title="Move the starter offer to Session 2" impact="Opportunity" tone="good" evidence="Returning users currently convert 3.4× better than first-session users." recommendation="Test the starter pack after a player's first successful return instead of during initial onboarding." href="/demo/experiment" />
    </div>

    <div style={{ marginTop: 18, color: palette.faint, fontSize: 11 }}>Simulated recommendation set · evidence-first ranking · no live customer data</div>
  </DemoShell>;
}
