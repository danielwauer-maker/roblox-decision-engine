const sprints = [
  {
    sprint: "Sprint 1",
    title: "Pilot expiry enforcement",
    status: "DONE",
    result: "SPRINT_1_RUNTIME_ACCEPTANCE=PASS",
    summary: "Expired unpaid pilots are blocked server-side; active/trialing paid access restores product entitlement.",
    validation: "GitHub CI passed · Hetzner runtime acceptance passed",
  },
  {
    sprint: "Sprint 2",
    title: "Automated Roblox data sync",
    status: "DONE",
    result: "PRODUCTION_SYNC=LIVE",
    summary: "Daily tenant-scoped Roblox analytics sync with persisted per-connection health and failure isolation.",
    validation: "CI #365 · 69 backend tests · real production universe synced HEALTHY",
  },
  {
    sprint: "Sprint 3",
    title: "Transactional email production activation",
    status: "DONE",
    result: "SPRINT_3_LIFECYCLE_IDEMPOTENCY=PASS",
    summary: "Resend outbound + Zoho reply routing, application mail, invite, passwordless login and lifecycle delivery activated.",
    validation: "Real Gmail/Zoho delivery · one-time auth links · duplicate lifecycle protection",
  },
  {
    sprint: "Sprint 4",
    title: "Billing hardening",
    status: "DONE",
    result: "SPRINT_4_RUNTIME_ACCEPTANCE=PASS",
    summary: "Duplicate checkout/subscription protection, Stripe idempotency, canonical subscription ownership and stale webhook protection.",
    validation: "CI #369 · 75 backend tests · production in-container acceptance",
  },
  {
    sprint: "Sprint 5",
    title: "past_due grace + pilot fallback",
    status: "DONE",
    result: "SPRINT_5_FINAL_RUNTIME_ACCEPTANCE=PASS",
    summary: "Seven-day payment grace without shortening the founding pilot; payment recovery immediately restores paid access.",
    validation: "Day 6/7/8 boundaries · payment recovery · converted-pilot fallback",
  },
  {
    sprint: "Sprint 6",
    title: "Experience entitlement enforcement",
    status: "DONE",
    result: "SPRINT_6_RUNTIME_ACCEPTANCE=PASS",
    summary: "Indie/Growth/Studio limits remain enforced after plan changes without deleting saved customer configuration.",
    validation: "CI #380 · 87 backend tests · over-limit sync blocked before credential use",
  },
  {
    sprint: "Sprint 7",
    title: "Experience selection & management",
    status: "DONE",
    result: "SPRINT_7_RUNTIME_ACCEPTANCE=PASS",
    summary: "OWNER-managed active experience selection, deterministic experience-scoped workflows and fail-closed downgrade handling.",
    validation: "CI #387/#389 · 88 backend tests · Growth 3/3 · Studio 10 limit · Indie downgrade 0 implicit entitlement · explicit owner resolution",
  },
];

const card: React.CSSProperties = { border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", borderRadius: 16 };

export default function BuildLog() {
  return <div>
    <div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Delivery history</div><h1 style={{ margin: "8px 0 6px", fontSize: 38, letterSpacing: "-.04em" }}>Build log</h1><p style={{ margin: 0, color: "#8298b1", maxWidth: 880 }}>Chronological production record for PlayDirective. This page tracks what was delivered, how it was validated and which acceptance gate closed each sprint.</p></div>

    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Completed</div><div style={metric}>7</div><div style={caption}>production sprints</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Backend tests</div><div style={metric}>88</div><div style={caption}>green in Sprint 7 CI</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Current production</div><div style={{ ...metric, color: "#86efac", fontSize: 23 }}>Healthy</div><div style={caption}>API ready · DB healthy</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Open commercial gate</div><div style={{ ...metric, color: "#fcd34d", fontSize: 23 }}>Stripe</div><div style={caption}>test-mode activation pending</div></div>
    </div>

    <div style={{ marginTop: 18, display: "grid", gap: 11 }}>
      {sprints.map((item, index) => <article key={item.sprint} style={{ ...card, padding: 19, display: "grid", gridTemplateColumns: "100px minmax(220px,.75fr) minmax(320px,1.25fr)", gap: 18, alignItems: "start" }}>
        <div><div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 900 }}>{item.sprint}</div><div style={{ marginTop: 7, display: "inline-block", color: "#86efac", border: "1px solid rgba(134,239,172,.22)", background: "rgba(134,239,172,.05)", borderRadius: 999, padding: "4px 7px", fontSize: 9, fontWeight: 900 }}>{item.status}</div><div style={{ marginTop: 9, color: "#60738c", fontSize: 10 }}>#{String(index + 1).padStart(2, "0")}</div></div>
        <div><h2 style={{ margin: 0, fontSize: 18 }}>{item.title}</h2><div style={{ marginTop: 8, color: "#a7b8ca", fontSize: 12, lineHeight: 1.55 }}>{item.summary}</div></div>
        <div><div style={{ color: "#9fb3c8", fontSize: 11, lineHeight: 1.55 }}>{item.validation}</div><code style={{ display: "block", marginTop: 10, color: "#a5f3fc", background: "rgba(103,232,249,.05)", border: "1px solid rgba(103,232,249,.12)", borderRadius: 8, padding: "8px 9px", fontSize: 10, overflowWrap: "anywhere" }}>{item.result}</code></div>
      </article>)}
    </div>

    <section style={{ ...card, marginTop: 18, padding: 19 }}><div style={eyebrow}>Next validation phases</div><h2 style={{ margin: "8px 0 8px", fontSize: 20 }}>What remains after Sprint 7</h2><p style={{ margin: 0, color: "#9fb3c8", fontSize: 12, lineHeight: 1.65 }}>Real-Life Acceptance Phase 2A/2B with a real Roblox tenant, multi-tenant acceptance, failure/recovery validation, Stripe test-mode commercial activation and final R16 sections A–I.</p></section>
  </div>;
}

const eyebrow: React.CSSProperties = { color: "#60738c", fontSize: 9, fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase" };
const metric: React.CSSProperties = { marginTop: 6, fontSize: 30, fontWeight: 900 };
const caption: React.CSSProperties = { marginTop: 3, color: "#71849c", fontSize: 10 };
