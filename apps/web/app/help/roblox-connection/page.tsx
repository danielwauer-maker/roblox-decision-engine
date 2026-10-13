export default function RobloxConnectionHelpPage() {
  const steps = [
    ["1", "Open Roblox Creator Dashboard", "Sign in to the Roblox account that owns or manages the experience you want to connect."],
    ["2", "Create an Open Cloud API key", "Create a dedicated key for PlayDirective rather than reusing a broad existing credential."],
    ["3", "Select the correct experience", "Scope the key to the Roblox experience / Universe you want PlayDirective to analyse."],
    ["4", "Grant analytics read access only", "Use the minimum permissions needed for analytics. PlayDirective does not need permission to edit or publish your game."],
    ["5", "Copy the Universe ID and API key", "Keep the key private. Do not send it by email, support chat or the public pilot application form."],
    ["6", "Paste it into your private workspace", "Open PlayDirective → Owner setup → Connect a Roblox experience, then run Sync last 30 days."],
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "72px 22px 90px" }}>
        <a href="/app/workspace" style={{ color: "#67e8f9", textDecoration: "none" }}>← Back to workspace</a>
        <div style={{ marginTop: 30, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Connection guide</div>
        <h1 style={{ margin: "12px 0 0", fontSize: "clamp(40px,8vw,60px)", letterSpacing: "-.05em" }}>Connect Roblox safely.</h1>
        <p style={{ maxWidth: 760, color: "#9fb1c7", fontSize: 17, lineHeight: 1.7 }}>PlayDirective is designed around a dedicated, least-privilege Roblox Open Cloud key. Your studio keeps control of the credential and can revoke it from Roblox at any time.</p>
        <div style={{ marginTop: 30, display: "grid", gap: 12 }}>{steps.map(([id,title,copy]) => <article key={id} style={{ display: "grid", gridTemplateColumns: "42px minmax(0,1fr)", gap: 14, border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 18, background: "rgba(255,255,255,.025)" }}><div style={{ color: "#67e8f9", fontWeight: 900 }}>{id}</div><div><strong>{title}</strong><p style={{ margin: "6px 0 0", color: "#8fa2ba", lineHeight: 1.6, fontSize: 13 }}>{copy}</p></div></article>)}</div>
        <div style={{ marginTop: 24, border: "1px solid rgba(134,239,172,.2)", background: "rgba(134,239,172,.04)", borderRadius: 16, padding: 18, color: "#c7d5e5", lineHeight: 1.65 }}>PlayDirective encrypts the API key before database storage. The key is not returned to browser JavaScript or displayed in the operator console, and it is not sent to the AI analyst.</div>
      </section>
    </main>
  );
}
