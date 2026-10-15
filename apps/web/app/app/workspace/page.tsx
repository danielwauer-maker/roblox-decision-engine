"use client";

import { FormEvent, useEffect, useState } from "react";
import R16Panel from "./R16Panel";
import R17PilotTerm from "./R17PilotTerm";
import WorkspacePhase2A from "./WorkspaceClient";

type Me = { user: { email: string; role: string }; organization: { name: string; slug: string } };
type Connection = { id: number; universe_id: string; experience_name?: string | null; configured: boolean; active: boolean; entitled: boolean; over_limit: boolean; sync_status: string; last_success_at?: string | null };
type ConnectionPayload = { items?: Connection[]; experience_limit?: number; active_count?: number; selection_required?: boolean };
type Decision = { title?: string; recommendation?: string; priority_score?: number };
type SyncMetric = { metric?: string; received?: number; inserted?: number };
type SyncPayload = { metrics?: SyncMetric[]; detail?: string };
type AppView = "overview" | "experiences" | "workflow" | "pilot";

const muted = "#93a4bb";
const faint = "#66778f";
const cyan = "#67e8f9";

export default function PilotWorkspacePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [experienceLimit, setExperienceLimit] = useState(0);
  const [selectionRequired, setSelectionRequired] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [universeId, setUniverseId] = useState("");
  const [experienceName, setExperienceName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [status, setStatus] = useState("Loading workspace…");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<AppView>("overview");

  async function load(markReady = true) {
    const identity = await fetch("/api/pilot/me", { cache: "no-store" });
    if (identity.status === 401) { window.location.href = "/app/login"; return; }
    if (!identity.ok) { setStatus("Workspace could not be loaded."); return; }
    setMe(await identity.json());

    const cr = await fetch("/api/pilot/connection", { cache: "no-store" });
    if (cr.ok) {
      const payload: ConnectionPayload = await cr.json();
      const items = payload.items ?? [];
      setConnections(items);
      setExperienceLimit(payload.experience_limit ?? 0);
      setSelectionRequired(Boolean(payload.selection_required));
      const entitled = items.filter((item) => item.entitled);
      setSelectedId((current) => entitled.some((item) => item.id === current) ? current : (entitled[0]?.id ?? null));
    }
    if (markReady) setStatus("Workspace ready");
  }

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!selectedId) { setDecisions([]); return; }
    void (async () => {
      const response = await fetch(`/api/pilot/decisions?connection_id=${selectedId}`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        setDecisions(payload.items ?? []);
      } else setDecisions([]);
    })();
  }, [selectedId]);

  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("Saving encrypted Roblox connection…");
    const response = await fetch("/api/pilot/connection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universe_id: universeId.trim(), experience_name: experienceName.trim() || null, api_key: apiKey.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(payload.detail ?? "Connection could not be saved."); setBusy(false); return; }
    setApiKey(""); setUniverseId(""); setExperienceName("");
    await load(false);
    setStatus(payload.active ? "Experience saved and activated." : "Experience saved. Activate it when a plan slot is available.");
    setBusy(false);
  }

  async function toggleConnection(connection: Connection) {
    setBusy(true);
    const response = await fetch("/api/pilot/connection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connection_id: connection.id, active: !connection.active }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(payload.detail ?? "Experience selection could not be changed."); setBusy(false); return; }
    await load(false);
    setStatus(connection.active ? "Experience deactivated. Stored data and credential were preserved." : "Experience activated for PlayDirective.");
    setBusy(false);
  }

  async function sync() {
    if (!selectedId) { setStatus("Choose an entitled experience first."); return; }
    setBusy(true);
    setStatus("Syncing selected experience…");
    const response = await fetch(`/api/pilot/sync?days=30&connection_id=${selectedId}`, { method: "POST" });
    const payload: SyncPayload = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(payload.detail ?? "Analytics sync failed."); setBusy(false); return; }
    const received = (payload.metrics ?? []).reduce((sum, item) => sum + (item.received ?? 0), 0);
    const inserted = (payload.metrics ?? []).reduce((sum, item) => sum + (item.inserted ?? 0), 0);
    await load(false);
    setStatus(`Sync successful · ${received} observations received · ${inserted} new rows imported.`);
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/pilot/logout", { method: "POST" });
    window.location.href = "/app/login";
  }

  const isOwner = me?.user.role === "OWNER";
  const selected = connections.find((item) => item.id === selectedId) ?? null;
  const activeCount = connections.filter((item) => item.active).length;
  const topDecision = decisions[0];

  const nav: Array<[AppView, string, string]> = [
    ["overview", "Overview", "Command center"],
    ["experiences", "Experiences", "Connections & sync"],
    ["workflow", "Decision workflow", "Priority to action"],
    ["pilot", "Pilot & billing", "Progress & account"],
  ];

  return (
    <main className="workspace-shell">
      <style>{`
        *{box-sizing:border-box}.workspace-shell{min-height:100vh;background:#07101f;color:#eef7ff;font-family:Arial,sans-serif}.app-grid{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;border-right:1px solid rgba(255,255,255,.08);padding:24px 18px;background:rgba(6,14,27,.97);display:flex;flex-direction:column;z-index:20}.brand{display:flex;align-items:center;text-decoration:none;margin:0 7px 24px}.brand img{width:188px;height:auto}.studio-card{border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:13px;background:rgba(255,255,255,.025);margin-bottom:18px}.studio-name{font-size:13px;font-weight:800}.studio-email{font-size:11px;color:${faint};margin-top:5px;overflow:hidden;text-overflow:ellipsis}.nav-label{margin:14px 10px 7px;color:${faint};font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.side-nav{display:grid;gap:4px}.nav-btn{width:100%;text-align:left;color:${muted};background:transparent;padding:10px 11px;border-radius:10px;font-size:13px;font-weight:700;border:1px solid transparent;cursor:pointer}.nav-btn:hover,.nav-btn.active{color:#eef7ff;background:rgba(103,232,249,.07);border-color:rgba(103,232,249,.12)}.nav-caption{display:block;color:${faint};font-size:9px;font-weight:500;margin-top:3px}.sidebar-bottom{margin-top:auto;display:grid;gap:9px}.help-link,.signout{width:100%;text-align:left;background:transparent;color:${muted};border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:9px 11px;text-decoration:none;font-size:12px;cursor:pointer}.main-column{min-width:0}.topbar{position:sticky;top:0;z-index:15;height:68px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(7,16,31,.9);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,3vw,42px);gap:20px}.topbar-title{font-size:13px;font-weight:800}.topbar-sub{font-size:11px;color:${faint};margin-top:3px}.experience-switch select{background:#0b1728;color:#eef7ff;border:1px solid rgba(255,255,255,.11);border-radius:10px;padding:9px 34px 9px 11px;max-width:270px}.content{max-width:1280px;margin:0 auto;padding:38px clamp(20px,3.5vw,48px) 90px}.hero{display:flex;justify-content:space-between;gap:28px;align-items:flex-end}.eyebrow{color:${cyan};font-size:10px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.hero h1{margin:8px 0 0;font-size:clamp(34px,5vw,54px);line-height:1;letter-spacing:-.045em}.hero p{margin:12px 0 0;color:${muted};font-size:14px;line-height:1.55}.status-pill{max-width:460px;border:1px solid rgba(103,232,249,.16);background:rgba(103,232,249,.045);color:#b8edf5;border-radius:999px;padding:9px 13px;font-size:11px}.overview-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:26px}.card{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(12,23,40,.82);box-shadow:0 18px 60px rgba(0,0,0,.12)}.metric-card{padding:17px}.metric-label{color:${faint};font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.metric-value{font-size:22px;font-weight:900;margin-top:9px;letter-spacing:-.02em}.metric-note{color:${muted};font-size:11px;line-height:1.45;margin-top:6px}.section{margin-top:28px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:14px}.section-head h2{margin:6px 0 0;font-size:24px;letter-spacing:-.025em}.section-head p{margin:0;color:${muted};font-size:12px;max-width:540px;line-height:1.55}.primary-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:14px}.panel{padding:20px}.panel h3{margin:8px 0 6px;font-size:19px}.queue-item{padding:12px 0;border-top:1px solid rgba(255,255,255,.07)}.queue-item:first-of-type{border-top:0}.queue-title{font-weight:800;font-size:14px}.queue-copy{color:${muted};font-size:12px;line-height:1.5;margin-top:5px}.connections{display:grid;gap:9px;margin-top:15px}.connection-row{border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:14px;display:flex;justify-content:space-between;gap:14px;align-items:center}.connection-row.selected{border-color:rgba(103,232,249,.34);background:rgba(103,232,249,.035)}.connection-meta{color:${faint};font-size:11px;margin-top:5px;line-height:1.5}.actions{display:flex;gap:7px;flex-wrap:wrap}.btn{border-radius:9px;padding:8px 10px;font-weight:800;font-size:11px;cursor:pointer}.btn-primary{background:${cyan};color:#07101f;border:0}.btn-secondary{background:transparent;color:#b7edf5;border:1px solid rgba(103,232,249,.25)}.btn-danger{background:transparent;color:#fda4af;border:1px solid rgba(255,255,255,.12)}.owner-panel{padding:20px;border-color:rgba(103,232,249,.18);background:linear-gradient(135deg,rgba(103,232,249,.05),rgba(12,23,40,.82))}.connect-form{display:grid;grid-template-columns:1fr 1fr 1.2fr auto;gap:10px;margin-top:16px}.connect-form input{background:#0b1728;color:#eef7ff;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:11px 12px;min-width:0}.warning{border:1px solid rgba(251,191,36,.3);background:rgba(251,191,36,.07);color:#fde68a;border-radius:11px;padding:10px 12px;font-size:11px;line-height:1.45}.empty{padding:28px;color:${muted};font-size:13px;line-height:1.55}.view-title{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:18px}.view-title h2{font-size:30px;letter-spacing:-.03em;margin:7px 0 0}.view-title p{margin:0;color:${muted};font-size:13px;line-height:1.55;max-width:560px}.mobile-brand{display:none}
        @media(max-width:1020px){.app-grid{grid-template-columns:210px minmax(0,1fr)}.sidebar{padding:20px 14px}.brand img{width:168px}.overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.connect-form{grid-template-columns:1fr 1fr}.connect-form button{grid-column:1/-1}.primary-grid{grid-template-columns:1fr}}
        @media(max-width:760px){.app-grid{display:block}.sidebar{display:none}.topbar{height:auto;min-height:64px;padding:12px 16px}.mobile-brand{display:block}.mobile-brand img{width:150px}.topbar-title,.topbar-sub{display:none}.experience-switch{margin-left:auto}.experience-switch select{max-width:180px}.content{padding:26px 16px 70px}.hero,.view-title{display:block}.status-pill{margin-top:16px;border-radius:12px}.overview-grid{grid-template-columns:1fr 1fr}.section-head{display:block}.section-head p,.view-title p{margin-top:7px}.connection-row{align-items:flex-start;display:block}.actions{margin-top:11px}.connect-form{grid-template-columns:1fr}.connect-form button{grid-column:auto}}
        @media(max-width:480px){.overview-grid{grid-template-columns:1fr}.experience-switch select{max-width:150px}.hero h1{font-size:34px}}
      `}</style>

      <div className="app-grid">
        <aside className="sidebar">
          <a className="brand" href="/"><img src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <div className="studio-card">
            <div className="studio-name">{me?.organization.name ?? "Pilot workspace"}</div>
            <div className="studio-email">{me?.user.email ?? "Loading studio…"}</div>
          </div>

          <div className="nav-label">Workspace</div>
          <nav className="side-nav">
            {nav.map(([id, label, caption]) => (
              <button key={id} className={`nav-btn ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
                {label}<span className="nav-caption">{caption}</span>
              </button>
            ))}
          </nav>

          <div className="nav-label">Account</div>
          <nav className="side-nav">
            <a className="help-link" href="/help">Help center</a>
            <a className="help-link" href="/pricing">Plans</a>
          </nav>

          <div className="sidebar-bottom">
            <a className="help-link" href="/help/roblox-connection">Connection guide</a>
            <button className="signout" onClick={logout}>Sign out</button>
          </div>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <a className="mobile-brand" href="/"><img src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
            <div>
              <div className="topbar-title">{me?.organization.name ?? "Studio workspace"}</div>
              <div className="topbar-sub">Private · tenant isolated · {me?.user.role?.toLowerCase() ?? "member"}</div>
            </div>
            <div className="experience-switch">
              <select value={selectedId ?? ""} onChange={(event) => setSelectedId(event.target.value ? Number(event.target.value) : null)} aria-label="Selected experience">
                <option value="">Choose experience</option>
                {connections.filter((item) => item.entitled).map((item) => <option key={item.id} value={item.id}>{item.experience_name || `Universe ${item.universe_id}`}</option>)}
              </select>
            </div>
          </header>

          <section className="content">
            {view === "overview" && <>
              <div className="hero">
                <div>
                  <div className="eyebrow">30-day founding studio pilot</div>
                  <h1>Your studio command center.</h1>
                  <p>One experience at a time. Evidence first. Clear next actions.</p>
                </div>
                <div className="status-pill">{status}</div>
              </div>

              <div className="overview-grid">
                <article className="card metric-card"><div className="metric-label">Selected experience</div><div className="metric-value">{selected?.experience_name || (selected ? `Universe ${selected.universe_id}` : "None")}</div><div className="metric-note">{selected ? `Sync ${selected.sync_status}` : "Choose an entitled experience"}</div></article>
                <article className="card metric-card"><div className="metric-label">Decision queue</div><div className="metric-value">{decisions.length}</div><div className="metric-note">{topDecision?.title || "No supported priority yet"}</div></article>
                <article className="card metric-card"><div className="metric-label">Active experiences</div><div className="metric-value">{activeCount} / {experienceLimit || "—"}</div><div className="metric-note">Plan-scoped active connections</div></article>
                <article className="card metric-card"><div className="metric-label">Access model</div><div className="metric-value">Read-only</div><div className="metric-note">Roblox analytics · private workspace</div></article>
              </div>

              <section className="section">
                <div className="section-head"><div><div className="eyebrow">Today</div><h2>What deserves attention now.</h2></div><p>Overview stays intentionally compact. Use the sidebar when you need to manage connections or open the full decision workflow.</p></div>
                <div className="primary-grid">
                  <article className="card panel">
                    <div className="metric-label">Top supported decisions</div>
                    {decisions.length ? decisions.slice(0, 3).map((decision, index) => <div className="queue-item" key={index}><div className="queue-title">#{index + 1} {decision.title ?? decision.recommendation ?? "Priority"}</div><div className="queue-copy">{decision.recommendation || "Evidence-backed priority for the selected experience."}</div>{typeof decision.priority_score === "number" && <div className="metric-note">Priority score {decision.priority_score.toFixed(2)}</div>}</div>) : <div className="empty">No supported priority for the selected experience yet. PlayDirective waits for enough evidence rather than inventing a recommendation.</div>}
                    <button className="btn btn-secondary" onClick={() => setView("workflow")}>Open decision workflow →</button>
                  </article>
                  <article className="card panel">
                    <div className="metric-label">Selected experience</div>
                    <h3>{selected?.experience_name || (selected ? `Universe ${selected.universe_id}` : "No experience selected")}</h3>
                    <div className="queue-copy">{selected ? `Universe ${selected.universe_id} · ${selected.active ? "Active" : "Inactive"} · Sync ${selected.sync_status}` : "Choose or connect a Roblox experience before using the workflow."}</div>
                    <div className="actions" style={{ marginTop: 16 }}>
                      {selected && <button className="btn btn-primary" disabled={busy || selectionRequired} onClick={sync}>{busy ? "Working…" : "Sync last 30 days"}</button>}
                      <button className="btn btn-secondary" onClick={() => setView("experiences")}>Manage experiences</button>
                    </div>
                  </article>
                </div>
              </section>

              <section className="section">
                <div className="section-head"><div><div className="eyebrow">Pilot status</div><h2>Stay oriented without leaving Overview.</h2></div><p>The detailed progress, plan and feedback tools live under Pilot & billing.</p></div>
                <R17PilotTerm />
              </section>
            </>}

            {view === "experiences" && <>
              <div className="view-title"><div><div className="eyebrow">Experiences</div><h2>Manage Roblox connections.</h2></div><p>Only active, entitled experiences are used for analytics and decision views. Stored credentials remain encrypted when inactive.</p></div>
              {selectionRequired && <div className="warning">Plan changed: deactivate experiences until you are within the current limit. No over-limit credential will be used meanwhile.</div>}
              <article className="card panel">
                <div className="section-head"><div><div className="metric-label">Connected experiences</div><h2 style={{ marginTop: 7 }}>{activeCount} active of {experienceLimit || 0} allowed</h2></div><p>Select an entitled experience to scope the rest of the product.</p></div>
                <div className="connections">
                  {connections.length ? connections.map((connection) => <div key={connection.id} className={`connection-row ${connection.id === selectedId ? "selected" : ""}`}><div><strong>{connection.experience_name || `Universe ${connection.universe_id}`}</strong><div className="connection-meta">Universe {connection.universe_id} · {connection.active ? "Active" : "Stored / inactive"} · {connection.entitled ? "Entitled" : connection.over_limit ? "Over plan limit" : "Not entitled"} · Sync {connection.sync_status}</div></div><div className="actions">{connection.entitled && <button className={`btn ${connection.id === selectedId ? "btn-primary" : "btn-secondary"}`} onClick={() => setSelectedId(connection.id)}>{connection.id === selectedId ? "Selected" : "Open"}</button>}{isOwner && <button className="btn btn-danger" disabled={busy} onClick={() => toggleConnection(connection)}>{connection.active ? "Deactivate" : "Activate"}</button>}</div></div>) : <div className="empty">No experience connected yet.</div>}
                </div>
                {selected && <div className="actions" style={{ marginTop: 16 }}><button className="btn btn-primary" disabled={busy || selectionRequired} onClick={sync}>{busy ? "Working…" : `Sync ${selected.experience_name || selected.universe_id}`}</button><span className="metric-note">All decision views are scoped to this experience.</span></div>}
              </article>

              {isOwner && <article className="card owner-panel section">
                <div className="eyebrow">Owner setup</div><h2 style={{ margin: "8px 0 0" }}>Connect another Roblox experience.</h2><p className="queue-copy">A new connection activates automatically only when a plan slot is free. Credentials remain server-side and encrypted.</p>
                <form className="connect-form" onSubmit={connect}><input required value={universeId} onChange={(event) => setUniverseId(event.target.value)} placeholder="Universe ID" inputMode="numeric" /><input value={experienceName} onChange={(event) => setExperienceName(event.target.value)} placeholder="Experience name" /><input required type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Read-only Roblox API key" autoComplete="off" /><button className="btn btn-primary" disabled={busy}>Save connection</button></form>
              </article>}
            </>}

            {view === "workflow" && <>
              <div className="view-title"><div><div className="eyebrow">Decision workflow</div><h2>From priority to action.</h2></div><p>Priorities, evidence, analyst interpretation, experiments and Weekly Brief stay scoped to the selected experience above.</p></div>
              <WorkspacePhase2A connectionId={selectedId} />
            </>}

            {view === "pilot" && <>
              <div className="view-title"><div><div className="eyebrow">Pilot & account</div><h2>Progress, plan and feedback.</h2></div><p>Track the founding pilot, review plan state, control lifecycle updates and tell us what is useful.</p></div>
              <R16Panel />
            </>}
          </section>
        </div>
      </div>
    </main>
  );
}
