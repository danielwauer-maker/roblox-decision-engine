import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

export default function ConnectPage() {
  return <DemoShell><PageTitle title="Connect your experience" copy="The pilot connection uses least-privilege Roblox analytics access. No game code changes are required for the validation path." />
    <div style={{ marginTop: 28, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.3fr) minmax(280px,.7fr)" }}>
      <Card><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}><div><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Step 1 of 2</div><h2 style={{ margin: "10px 0 6px" }}>Roblox Open Cloud</h2></div><Pill tone="good">Read only</Pill></div><p style={{ color: palette.muted, lineHeight: 1.65, maxWidth: 680 }}>Create an API key scoped only to the target universe and the analytics read permission. The Decision Engine never needs your Roblox password.</p>
        <div style={{ marginTop: 20, display: "grid", gap: 12 }}><label style={{ color: palette.muted, fontSize: 13 }}>Universe ID<div style={{ marginTop: 7, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "13px 14px", color: palette.text, background: palette.panel2 }}>1234567890</div></label><label style={{ color: palette.muted, fontSize: 13 }}>API key<div style={{ marginTop: 7, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "13px 14px", color: palette.faint, background: palette.panel2 }}>••••••••••••••••••••••••</div></label></div>
        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}><Button href="/demo/priorities" primary>Validate connection</Button><Button href="/demo">Use demo data</Button></div>
      </Card>
      <Card><div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Access model</div><h3 style={{ margin: "12px 0" }}>What we read</h3>{["Aggregated retention metrics","Revenue and payer metrics","Funnel and churn signals","Platform / device segments"].map(x=><div key={x} style={{ padding: "10px 0", borderBottom: `1px solid ${palette.border}`, color: palette.muted }}>✓ {x}</div>)}<h3 style={{ margin: "20px 0 8px" }}>What we do not request</h3>{["Roblox password","Write access to the game","Player private messages","Source code access"].map(x=><div key={x} style={{ padding: "7px 0", color: palette.faint }}>— {x}</div>)}</Card>
    </div>
  </DemoShell>;
}
