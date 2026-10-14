type BuildItem = {
  sprint: string;
  title: string;
  status: string;
  summary: string;
  validation: string;
  result: string;
};

const productReleases: BuildItem[] = [
  { sprint: "R0", title: "Product foundation", status: "DONE", summary: "Initial product thesis, repository baseline and core product direction for the Roblox Decision Engine.", validation: "Repository delivery history marks R0 complete.", result: "PRODUCT_FOUNDATION=DONE" },
  { sprint: "R1", title: "Validation experience", status: "DONE", summary: "Public validation experience established to explain and test the product workflow before full SaaS delivery.", validation: "Repository delivery history marks R1 complete.", result: "VALIDATION_EXPERIENCE=DONE" },
  { sprint: "R2", title: "SaaS foundation", status: "DONE", summary: "FastAPI, Next.js, PostgreSQL, Docker and CI formed the repeatable application foundation.", validation: "PR #2 closed the R2 exit gate with one-command local stack and CI baseline.", result: "SAAS_FOUNDATION=DONE" },
  { sprint: "R3", title: "Roblox data connection", status: "DONE", summary: "Read-only Roblox Analytics Query API adapter, typed metric contracts, polling and normalized observations.", validation: "PR #3/#4 plus live-data setup documentation.", result: "ROBLOX_DATA_CONNECTION=DONE" },
  { sprint: "R4", title: "Decision Engine v1", status: "DONE", summary: "Deterministic decision logic introduced to turn normalized KPI evidence into ranked priorities.", validation: "Repository delivery history marks R4 complete.", result: "DECISION_ENGINE_V1=DONE" },
  { sprint: "R5", title: "AI Product Analyst", status: "DONE", summary: "Grounded AI explanation layer added above deterministic evidence rather than replacing metric authority.", validation: "Repository delivery history marks R5 complete.", result: "AI_PRODUCT_ANALYST=DONE" },
  { sprint: "R6", title: "Experiment Copilot", status: "DONE", summary: "Supported priorities can be translated into bounded experiments with KPI and guardrail guidance.", validation: "Repository delivery history marks R6 complete.", result: "EXPERIMENT_COPILOT=DONE" },
  { sprint: "R7", title: "Pilot readiness", status: "DONE", summary: "Product workflow prepared for controlled studio pilot usage and evidence review.", validation: "Repository delivery history marks R7 complete.", result: "PILOT_READINESS=DONE" },
  { sprint: "R8", title: "Commercial readiness", status: "DONE", summary: "Commercial positioning and paid-plan readiness added around the validated product workflow.", validation: "Repository delivery history marks R8 complete.", result: "COMMERCIAL_READINESS=DONE" },
  { sprint: "R9", title: "Security & privacy", status: "DONE", summary: "Security, secret-boundary, privacy and least-privilege controls formalized for pilot operation.", validation: "Repository delivery history marks R9 complete.", result: "SECURITY_PRIVACY=DONE" },
  { sprint: "R10", title: "Reliability", status: "DONE", summary: "Retries, bounded external calls, health/readiness checks, observability and deterministic fallbacks hardened.", validation: "R10 reliability gate documented with 39 backend tests.", result: "RELIABILITY_GATE=PASS" },
  { sprint: "R11", title: "Go-Live", status: "DONE", summary: "First formal go-live release and release evidence for the portfolio-era product.", validation: "Dedicated docs/R11_GO_LIVE.md release evidence.", result: "R11_GO_LIVE=DONE" },
  { sprint: "R12", title: "Portfolio closure", status: "DONE", summary: "Portfolio case study closed with final evidence, limitations and delivery boundary.", validation: "Dedicated docs/R12_PORTFOLIO_CLOSURE.md evidence.", result: "PORTFOLIO_CLOSURE=DONE" },
  { sprint: "R13", title: "Multi-tenant pilot SaaS", status: "DELIVERED", summary: "Organizations, users, sessions, encrypted Roblox connections and tenant-scoped product workflows introduced.", validation: "Cross-tenant isolation coverage; R13 tenant gate documented at 42 backend tests.", result: "MULTI_TENANT_PILOT=DELIVERED" },
  { sprint: "R14", title: "Operator / Admin Console", status: "DELIVERED", summary: "Private operator console added for customer state, onboarding, invites, analytics visibility and support controls.", validation: "Admin credential-exposure, disable and session-revoke tests documented; console now runs in production.", result: "OPERATOR_CONSOLE=DELIVERED" },
  { sprint: "R15", title: "No standalone documented release", status: "N/A", summary: "The repository contains no separate R15 release artifact or formal R15 delivery record. The documented sequence continues with R16.", validation: "Kept visible so the project history does not silently imply a missing implementation.", result: "R15=NO_STANDALONE_RECORD" },
  { sprint: "R16", title: "Real Pilot Go-Live", status: "PRODUCTION DEPLOYED", summary: "Hetzner production runtime, founding-pilot acquisition/auth, private workspace, lifecycle notifications and billing plumbing combined into the real pilot release.", validation: "Production deployment is live; final real-life acceptance and Stripe test activation remain separate gates.", result: "R16=PRODUCTION_DEPLOYED" },
  { sprint: "R17", title: "Final Commercial Go-Live", status: "DELIVERED", summary: "Acquisition attribution, 30-day pilot lifecycle, lead pipeline, lifecycle automation, plan enforcement and production operations added.", validation: "Dedicated docs/R17_FINAL_COMMERCIAL_GO_LIVE.md implementation record dated 13 Oct 2026.", result: "R17_COMMERCIAL_OPERATIONS=DELIVERED" },
];

const productionSprints: BuildItem[] = [
  { sprint: "Sprint 1", title: "Pilot expiry enforcement", status: "DONE", result: "SPRINT_1_RUNTIME_ACCEPTANCE=PASS", summary: "Expired unpaid pilots are blocked server-side; active/trialing paid access restores product entitlement.", validation: "GitHub CI passed · Hetzner runtime acceptance passed" },
  { sprint: "Sprint 2", title: "Automated Roblox data sync", status: "DONE", result: "PRODUCTION_SYNC=LIVE", summary: "Daily tenant-scoped Roblox analytics sync with persisted per-connection health and failure isolation.", validation: "CI #365 · 69 backend tests · real production universe synced HEALTHY" },
  { sprint: "Sprint 3", title: "Transactional email production activation", status: "DONE", result: "SPRINT_3_LIFECYCLE_IDEMPOTENCY=PASS", summary: "Resend outbound + Zoho reply routing, application mail, invite, passwordless login and lifecycle delivery activated.", validation: "Real Gmail/Zoho delivery · one-time auth links · duplicate lifecycle protection" },
  { sprint: "Sprint 4", title: "Billing hardening", status: "DONE", result: "SPRINT_4_RUNTIME_ACCEPTANCE=PASS", summary: "Duplicate checkout/subscription protection, Stripe idempotency, canonical subscription ownership and stale webhook protection.", validation: "CI #369 · 75 backend tests · production in-container acceptance" },
  { sprint: "Sprint 5", title: "past_due grace + pilot fallback", status: "DONE", result: "SPRINT_5_FINAL_RUNTIME_ACCEPTANCE=PASS", summary: "Seven-day payment grace without shortening the founding pilot; payment recovery immediately restores paid access.", validation: "Day 6/7/8 boundaries · payment recovery · converted-pilot fallback" },
  { sprint: "Sprint 6", title: "Experience entitlement enforcement", status: "DONE", result: "SPRINT_6_RUNTIME_ACCEPTANCE=PASS", summary: "Indie/Growth/Studio limits remain enforced after plan changes without deleting saved customer configuration.", validation: "CI #380 · 87 backend tests · over-limit sync blocked before credential use" },
  { sprint: "Sprint 7", title: "Experience selection & management", status: "DONE", result: "SPRINT_7_RUNTIME_ACCEPTANCE=PASS", summary: "OWNER-managed active experience selection, deterministic experience-scoped workflows and fail-closed downgrade handling.", validation: "CI #387/#389 · 88 backend tests · Growth 3/3 · Studio limit · Indie downgrade fail-closed · explicit owner resolution" },
];

const card: React.CSSProperties = { border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", borderRadius: 16 };

function statusColor(status: string) {
  if (status === "DONE" || status === "DELIVERED" || status === "PRODUCTION DEPLOYED") return "#86efac";
  if (status === "N/A") return "#94a3b8";
  return "#fcd34d";
}

function Timeline({ items }: { items: BuildItem[] }) {
  return <div style={{ marginTop: 14, display: "grid", gap: 11 }}>
    {items.map((item, index) => <article key={item.sprint} style={{ ...card, padding: 19, display: "grid", gridTemplateColumns: "110px minmax(220px,.8fr) minmax(280px,1.2fr)", gap: 18, alignItems: "start" }}>
      <div>
        <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 900 }}>{item.sprint}</div>
        <div style={{ marginTop: 7, display: "inline-block", color: statusColor(item.status), border: `1px solid ${statusColor(item.status)}33`, background: `${statusColor(item.status)}0d`, borderRadius: 999, padding: "4px 7px", fontSize: 9, fontWeight: 900 }}>{item.status}</div>
        <div style={{ marginTop: 9, color: "#60738c", fontSize: 10 }}>#{String(index + 1).padStart(2, "0")}</div>
      </div>
      <div><h2 style={{ margin: 0, fontSize: 18 }}>{item.title}</h2><div style={{ marginTop: 8, color: "#a7b8ca", fontSize: 12, lineHeight: 1.55 }}>{item.summary}</div></div>
      <div><div style={{ color: "#9fb3c8", fontSize: 11, lineHeight: 1.55 }}>{item.validation}</div><code style={{ display: "block", marginTop: 10, color: "#a5f3fc", background: "rgba(103,232,249,.05)", border: "1px solid rgba(103,232,249,.12)", borderRadius: 8, padding: "8px 9px", fontSize: 10, overflowWrap: "anywhere" }}>{item.result}</code></div>
    </article>)}
  </div>;
}

export default function BuildLog() {
  return <div>
    <div>
      <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Delivery history</div>
      <h1 style={{ margin: "8px 0 6px", fontSize: 38, letterSpacing: "-.04em" }}>Build log</h1>
      <p style={{ margin: 0, color: "#8298b1", maxWidth: 880, lineHeight: 1.6 }}>Complete project history for PlayDirective: the original R0–R17 product/readiness releases plus the later production-hardening Sprint 1–7 series.</p>
    </div>

    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Product releases</div><div style={metric}>18</div><div style={caption}>R0–R17 entries, including documented R15 gap</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Production hardening</div><div style={metric}>7</div><div style={caption}>all completed runtime-accepted sprints</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Current production</div><div style={{ ...metric, color: "#86efac", fontSize: 23 }}>Healthy</div><div style={caption}>API ready · DB healthy</div></div>
      <div style={{ ...card, padding: 17 }}><div style={eyebrow}>Open commercial gate</div><div style={{ ...metric, color: "#fcd34d", fontSize: 23 }}>Stripe</div><div style={caption}>test-mode activation pending</div></div>
    </div>

    <section style={{ marginTop: 26 }}>
      <div style={eyebrow}>Phase A · Product build</div>
      <h2 style={{ margin: "7px 0 0", fontSize: 24 }}>R0–R17 delivery history</h2>
      <p style={{ margin: "7px 0 0", color: "#71849c", fontSize: 12, lineHeight: 1.6 }}>The original product, portfolio and real-pilot evolution. R15 is shown explicitly because no standalone R15 artifact exists in the repository history.</p>
      <Timeline items={productReleases} />
    </section>

    <section style={{ marginTop: 30 }}>
      <div style={eyebrow}>Phase B · Production hardening</div>
      <h2 style={{ margin: "7px 0 0", fontSize: 24 }}>Sprint 1–7</h2>
      <p style={{ margin: "7px 0 0", color: "#71849c", fontSize: 12, lineHeight: 1.6 }}>Post-go-live hardening focused on access policy, automation, email, billing safety and multi-experience entitlement behavior.</p>
      <Timeline items={productionSprints} />
    </section>

    <section style={{ ...card, marginTop: 22, padding: 19 }}>
      <div style={eyebrow}>Current open gates</div>
      <h2 style={{ margin: "8px 0 8px", fontSize: 20 }}>What is not yet commercially closed</h2>
      <p style={{ margin: 0, color: "#9fb3c8", fontSize: 12, lineHeight: 1.65 }}>Stripe test-mode activation and the remaining real-life customer acceptance phases stay open. The Build Log distinguishes these gates from engineering work that is already deployed and validated.</p>
    </section>
  </div>;
}

const eyebrow: React.CSSProperties = { color: "#60738c", fontSize: 9, fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase" };
const metric: React.CSSProperties = { marginTop: 6, fontSize: 30, fontWeight: 900 };
const caption: React.CSSProperties = { marginTop: 3, color: "#71849c", fontSize: 10, lineHeight: 1.45 };
