import { DemoShell, PageTitle, PriorityCard } from "../_components";

export default function PrioritiesPage() {
  return <DemoShell><PageTitle title="Today's priorities" copy="Three ranked actions, not another wall of charts. Each recommendation links back to evidence before it becomes an experiment." />
    <div style={{ marginTop: 28, display: "grid", gap: 16 }}>
      <PriorityCard rank={1} title="Fix mobile onboarding" impact="High impact" tone="bad" evidence="Mobile D1 retention is 8.7% versus 17.9% on desktop. Tutorial Step 3 churn increased from 42% to 67%." recommendation="Reduce Step 3 from five required actions to three and test the shorter flow for new mobile players." />
      <PriorityCard rank={2} title="Do not scale acquisition yet" impact="Protect spend" tone="warn" evidence="Paid traffic is up 28%, while new-player D1 retention remains below the recent baseline." recommendation="Hold additional ad spend until onboarding recovers; re-evaluate after the proposed mobile experiment." />
      <PriorityCard rank={3} title="Move the starter offer to Session 2" impact="Opportunity" tone="good" evidence="Returning users currently convert 3.4× better than first-session users." recommendation="Test the starter pack after a player's first successful return instead of during initial onboarding." href="/demo/experiment" />
    </div>
  </DemoShell>;
}
