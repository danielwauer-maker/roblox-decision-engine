import { Button, Card, DemoShell, PageTitle, Pill, palette } from "../_components";

export default function ConnectPage() {
  return <DemoShell>
    <PageTitle
      title="Preview the connection flow"
      copy="This page is a simulated preview of the Roblox connection experience. Real credentials are only entered inside a private studio workspace after an invite has been redeemed."
      action={<Button href="/demo/pilot">Pilot checklist</Button>}
    />

    <Card style={{ marginTop: 22, border: "1px solid rgba(251,191,36,.28)", background: "rgba(251,191,36,.05)" }}>
      <div style={{ color: palette.amber, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>Simulated demo · do not enter real credentials</div>
      <p style={{ margin: "10px 0 0", color: palette.muted, lineHeight: 1.65 }}>
        The fields below are a visual mockup only. Nothing on this page connects to Roblox or stores an API key. Real Roblox connections are configured only inside your private invited PlayDirective workspace.
      </p>
    </Card>

    <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "minmax(0,1.3fr) minmax(280px,.7fr)" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Simulated step 1 of 2</div>
            <h2 style={{ margin: "10px 0 6px" }}>Roblox Open Cloud</h2>
          </div>
          <Pill tone="good">Read only</Pill>
        </div>
        <p style={{ color: palette.muted, lineHeight: 1.65, maxWidth: 680 }}>
          In a real pilot, the studio owner creates an API key scoped only to the target universe and analytics read permission. PlayDirective never needs your Roblox password or write access to the game.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          <div style={{ color: palette.muted, fontSize: 13 }}>
            Universe ID · example only
            <div aria-disabled="true" style={{ marginTop: 7, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "13px 14px", color: palette.faint, background: palette.panel2, userSelect: "none" }}>1234567890</div>
          </div>
          <div style={{ color: palette.muted, fontSize: 13 }}>
            API key · masked demo value
            <div aria-disabled="true" style={{ marginTop: 7, border: `1px solid ${palette.border}`, borderRadius: 12, padding: "13px 14px", color: palette.faint, background: palette.panel2, userSelect: "none" }}>••••••••••••••••••••••••</div>
          </div>
        </div>

        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button href="/demo/priorities" primary>Continue with simulated data</Button>
          <Button href="/pricing">How the private pilot works</Button>
        </div>
      </Card>

      <Card>
        <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Access model</div>
        <h3 style={{ margin: "12px 0" }}>What PlayDirective reads</h3>
        {["Aggregated retention metrics","Revenue and payer metrics","Funnel and churn signals","Platform / device segments"].map(x=><div key={x} style={{ padding: "10px 0", borderBottom: `1px solid ${palette.border}`, color: palette.muted }}>✓ {x}</div>)}
        <h3 style={{ margin: "20px 0 8px" }}>What we do not request</h3>
        {["Roblox password","Write access to the game","Player private messages","Source code access"].map(x=><div key={x} style={{ padding: "7px 0", color: palette.faint }}>— {x}</div>)}
      </Card>
    </div>

    <div style={{ marginTop: 20 }}>
      <div style={{ color: palette.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Inside the private workspace</div>
      <h2 style={{ margin: "10px 0 16px" }}>Every real connection state has a next action.</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        <Card><Pill tone="good">Connected</Pill><h3 style={{ margin: "12px 0 7px" }}>Analytics available</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>Continue directly to the private decision queue and review the first evidence-backed priority.</p></Card>
        <Card><Pill tone="warn">No data yet</Pill><h3 style={{ margin: "12px 0 7px" }}>Connection valid</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>PlayDirective explains that the experience has not produced enough analytics yet and offers a later retry instead of showing an empty dashboard.</p></Card>
        <Card><Pill tone="bad">Needs attention</Pill><h3 style={{ margin: "12px 0 7px" }}>Sync failed</h3><p style={{ margin: 0, color: palette.muted, lineHeight: 1.6 }}>The workspace shows the recovery step: verify universe access, read scope and key validity, then retry without losing previous evidence.</p></Card>
      </div>
    </div>
  </DemoShell>;
}
