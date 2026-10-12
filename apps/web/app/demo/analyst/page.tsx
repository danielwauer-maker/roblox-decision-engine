import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

const insights = [
  {
    rank: "01",
    title: "Investigate mobile onboarding friction",
    confidence: "High confidence",
    evidence: "Mobile D1 retention is 8.7% versus 17.9% on desktop.",
    why: "This is the strongest supported signal because the segment divergence is large and directly tied to the first-session experience.",
    action: "Compare the first-session funnel by device and test a shorter mobile onboarding flow.",
  },
  {
    rank: "02",
    title: "Convert traffic growth into monetization",
    confidence: "Medium confidence",
    evidence: "DAU is growing materially faster than daily revenue.",
    why: "Traffic growth without proportional revenue growth suggests a monetization efficiency issue worth investigating before scaling acquisition.",
    action: "Inspect payer conversion and offer timing before increasing acquisition spend further.",
  },
];

export default function AnalystPage() {
  return (
    <DemoShell>
      <PageTitle
        title="AI Product Analyst"
        copy="The analyst layer explains only what the deterministic Decision Engine can support. Root-cause ideas are explicitly labeled as hypotheses, not facts."
        action={<Pill tone="good">Grounded mode</Pill>}
      />

      <Card style={{ marginTop: 28, background: "linear-gradient(135deg, rgba(103,232,249,.08), rgba(255,255,255,.02))" }}>
        <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Executive summary</div>
        <h2 style={{ margin: "12px 0 0", fontSize: "clamp(26px,6vw,38px)", lineHeight: 1.1, letterSpacing: "-.035em" }}>
          Fix mobile onboarding before you scale growth.
        </h2>
        <p style={{ margin: "14px 0 0", maxWidth: 860, color: palette.muted, lineHeight: 1.7 }}>
          The strongest supported issue is a material mobile-versus-desktop retention gap. The current evidence justifies investigation and an onboarding experiment; it does not prove a specific UX defect caused the decline.
        </p>
      </Card>

      <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {insights.map((item) => (
          <Card key={item.rank}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ color: palette.cyan, fontWeight: 800 }}>Priority {item.rank}</div>
              <Pill tone={item.rank === "01" ? "good" : "warn"}>{item.confidence}</Pill>
            </div>
            <h2 style={{ margin: "14px 0 8px", fontSize: 24 }}>{item.title}</h2>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 18 }}>
              <div>
                <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Evidence</div>
                <p style={{ color: palette.muted, lineHeight: 1.65 }}>{item.evidence}</p>
              </div>
              <div>
                <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Why it matters</div>
                <p style={{ color: palette.muted, lineHeight: 1.65 }}>{item.why}</p>
              </div>
              <div>
                <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Next action</div>
                <p style={{ color: palette.text, lineHeight: 1.65 }}>{item.action}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 16, border: "1px solid rgba(251,191,36,.25)", background: "rgba(251,191,36,.04)" }}>
        <div style={{ color: palette.amber, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em" }}>Causality guardrail</div>
        <p style={{ margin: "10px 0 0", color: palette.muted, lineHeight: 1.7 }}>
          Candidate causes such as onboarding friction or offer timing are hypotheses. The analyst may recommend how to validate them, but it must not present them as proven causes unless the underlying decision bundle explicitly permits a causal claim.
        </p>
      </Card>

      <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button href="/demo/investigation" primary>Inspect evidence</Button>
        <Button href="/demo/experiment">Build experiment</Button>
      </div>
    </DemoShell>
  );
}
