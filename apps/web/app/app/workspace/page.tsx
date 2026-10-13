"use client";

import { FormEvent, useEffect, useState } from "react";
import WorkspacePhase2A from "./WorkspaceClient";

type Me = { user: { email: string; role: string }; organization: { name: string; slug: string } };
type Connection = { id: number; universe_id: string; experience_name?: string | null; configured: boolean };
type Decision = { title?: string; recommendation?: string; priority_score?: number };
type SyncMetric = { metric?: string; received?: number; inserted?: number };
type SyncPayload = { metrics?: SyncMetric[]; days?: number; detail?: string };

type SyncDiagnostic = {
  title: string;
  summary: string;
  tone: "info" | "good" | "warn" | "bad";
  items: string[];
};

export default function PilotWorkspacePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [universeId, setUniverseId] = useState("");
  const [experienceName, setExperienceName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [status, setStatus] = useState("Loading workspace…");
  const [busy, setBusy] = useState(false);
  const [syncDiagnostic, setSyncDiagnostic] = useState<SyncDiagnostic | null>(null);

  async function load(markReady = true) {
    const identity = await fetch("/api/pilot/me", { cache: "no-store" });
    if (identity.status === 401) {
      window.location.href = "/app/login";
      return;
    }
    if (!identity.ok) {
      setStatus("Workspace could not be loaded.");
      return;
    }
    setMe(await identity.json());
    const connectionResponse = await fetch("/api/pilot/connection", { cache: "no-store" });
    if (connectionResponse.ok) {
      const payload = await connectionResponse.json();
      setConnections(payload.items ?? []);
    }
    const decisionResponse = await fetch("/api/pilot/decisions", { cache: "no-store" });
    if (decisionResponse.ok) {
      const payload = await decisionResponse.json();
      setDecisions(payload.items ?? []);
    }
    if (markReady) setStatus("Ready");
  }

  useEffect(() => { void load(); }, []);

  async function connect(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSyncDiagnostic(null);
    setStatus("Saving encrypted Roblox connection…");
    const response = await fetch("/api/pilot/connection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universe_id: universeId.trim(), experience_name: experienceName.trim() || null, api_key: apiKey.trim() }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setStatus(payload.detail ?? "Connection could not be saved.");
      setSyncDiagnostic({
        title: "Connection needs attention",
        summary: "PlayDirective could not save the Roblox connection.",
        tone: "bad",
        items: [
          "Verify that the Universe ID contains digits only.",
          "Use a valid read-only Roblox Open Cloud API key.",
          "Make sure this workspace has OWNER access.",
        ],
      });
      setBusy(false);
      return;
    }
    setApiKey("");
    await load(false);
    setStatus("Connection saved securely. You can sync Roblox analytics now.");
    setSyncDiagnostic({
      title: "Connection saved",
      summary: "The Roblox credential was stored encrypted and is ready for analytics sync.",
      tone: "good",
      items: [
        "Run Sync last 30 days to request Roblox analytics.",
        "If Roblox returns no datapoints, PlayDirective will explain the likely reasons instead of inventing recommendations.",
      ],
    });
    setBusy(false);
  }

  async function sync() {
    setBusy(true);
    setSyncDiagnostic(null);
    setStatus("Syncing the last 30 days of Roblox analytics…");
    const response = await fetch("/api/pilot/sync?days=30", { method: "POST" });
    const payload: SyncPayload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload.detail ?? "Analytics sync failed.");
      setSyncDiagnostic({
        title: "Sync needs attention",
        summary: payload.detail ?? "Roblox did not return a successful analytics response.",
        tone: "bad",
        items: [
          "Verify that the API key still has analytics read access to this Universe.",
          "Confirm that the Universe ID belongs to the connected experience.",
          "If the key was regenerated in Roblox, save the new key here before retrying.",
        ],
      });
      setBusy(false);
      return;
    }

    const received = (payload.metrics ?? []).reduce((sum, item) => sum + (item.received ?? 0), 0);
    const inserted = (payload.metrics ?? []).reduce((sum, item) => sum + (item.inserted ?? 0), 0);
    await load(false);
    if (received === 0) {
      setStatus("Sync successful · no Roblox analytics are available for this experience yet.");
      setSyncDiagnostic({
        title: "Connection valid · no datapoints yet",
        summary: "Roblox accepted the analytics request, but returned no metric datapoints for the selected period.",
        tone: "warn",
        items: [
          "The experience may not have enough live player activity yet.",
          "Roblox Studio playtests may not produce the same analytics as real live sessions.",
          "Roblox analytics can take time to aggregate before they become queryable.",
          "Retention metrics need additional player history across multiple days.",
          "Try again later after real players have joined the published experience.",
        ],
      });
    } else if (inserted === 0) {
      setStatus(`Sync successful · ${received} observations received · no new rows to import.`);
      setSyncDiagnostic({
        title: "Analytics are available",
        summary: "Roblox returned data, but PlayDirective already had those observations stored.",
        tone: "info",
        items: [
          "The connection is working.",
          "No duplicate observations were imported.",
          "New priorities will appear when fresh data crosses a supported decision threshold.",
        ],
      });
    } else {
      setStatus(`Sync successful · ${received} observations received · ${inserted} new rows imported.`);
      setSyncDiagnostic({
        title: "Fresh analytics imported",
        summary: "PlayDirective received Roblox analytics and added new observations to this private workspace.",
        tone: "good",
        items: [
          "The decision engine has been refreshed from the new observations.",
          "Open Priorities and Evidence below to review any supported findings.",
          "If no priority appears, the current data did not cross a supported decision threshold.",
        ],
      });
    }
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/pilot/logout", { method: "POST" });
    window.location.href = "/app/login";
  }

  const isOwner = me?.user.role === "OWNER";
  const diagnosticPalette = syncDiagnostic?.tone === "good"
    ? { border: "rgba(134,239,172,.22)", bg: "rgba(134,239,172,.05)", title: "#86efac" }
    : syncDiagnostic?.tone === "warn"
      ? { border: "rgba(250,204,21,.22)", bg: "rgba(250,204,21,.045)", title: "#fde047" }
      : syncDiagnostic?.tone === "bad"
        ? { border: "rgba(251,113,133,.22)", bg: "rgba(251,113,133,.05)", title: "#fda4af" }
        : { border: "rgba(103,232,249,.2)", bg: "rgba(103,232,249,.04)", title: "#67e8f9" };

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 22px", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div><strong>PlayDirective</strong><div style={{ color: "#718198", fontSize: 12, marginTop: 4 }}>{me ? `${me.organization.name} · ${me.user.email}` : "Pilot workspace"}</div></div>
          <button onClick={logout} style={{ background: "transparent", color: "#9fb1c7", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: "9px 12px" }}>Sign out</button>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "42px 22px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>30-day founding studio pilot</div>
            <h1 style={{ margin: "10px 0 0", fontSize: "clamp(34px,7vw,54px)", letterSpacing: "-.05em" }}>Your private studio workspace.</h1>
            <p style={{ margin: "12px 0 0", color: "#8095ae", fontSize: 14 }}>Decision intelligence for Roblox studios · Know what changed. Know what to do next.</p>
          </div>
          <div style={{ color: "#9fb1c7", fontSize: 13, maxWidth: 460, textAlign: "right" }}>{status}</div>
        </div>

        <div style={{ marginTop: 30, display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          <article style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: 22, background: "rgba(255,255,255,.025)" }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>Roblox connection</div>
            {connections.length > 0 ? <div style={{ marginTop: 14 }}>{connections.map((item) => <div key={item.id}><strong>{item.experience_name || `Universe ${item.universe_id}`}</strong><div style={{ color: "#9fb1c7", fontSize: 13, marginTop: 5 }}>Universe {item.universe_id} · private to this studio</div></div>)}</div> : <p style={{ color: "#9fb1c7", lineHeight: 1.6 }}>No experience connected yet.</p>}
            {connections.length > 0 && <button disabled={busy} onClick={sync} style={{ marginTop: 18, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 11, padding: "11px 14px", fontWeight: 800 }}>{busy ? "Syncing…" : "Sync last 30 days"}</button>}
          </article>

          <article style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: 22, background: "rgba(255,255,255,.025)" }}>
            <div style={{ color: "#718198", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>Today's decision queue</div>
            {decisions.length ? decisions.slice(0, 3).map((item, index) => <div key={index} style={{ marginTop: 14, paddingTop: 14, borderTop: index ? "1px solid rgba(255,255,255,.08)" : "none" }}><strong>#{index + 1} {item.title ?? item.recommendation ?? "Priority"}</strong>{typeof item.priority_score === "number" && <div style={{ color: "#67e8f9", fontSize: 12, marginTop: 5 }}>Priority score {item.priority_score.toFixed(2)}</div>}</div>) : <p style={{ color: "#9fb1c7", lineHeight: 1.6 }}>Connect and sync an experience to generate private priorities.</p>}
          </article>
        </div>

        {syncDiagnostic && (
          <section style={{ marginTop: 18, border: `1px solid ${diagnosticPalette.border}`, borderRadius: 20, padding: 20, background: diagnosticPalette.bg }}>
            <div style={{ color: diagnosticPalette.title, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Sync diagnostic</div>
            <h2 style={{ margin: "8px 0 6px", fontSize: 21 }}>{syncDiagnostic.title}</h2>
            <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.65 }}>{syncDiagnostic.summary}</p>
            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              {syncDiagnostic.items.map((item) => <div key={item} style={{ color: "#c9d7e7", fontSize: 13, lineHeight: 1.55 }}>✓ {item}</div>)}
            </div>
          </section>
        )}

        {isOwner && <section style={{ marginTop: 18, border: "1px solid rgba(103,232,249,.22)", borderRadius: 22, padding: 22, background: "rgba(103,232,249,.045)" }}>
          <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Owner setup</div>
          <h2 style={{ margin: "9px 0 0" }}>Connect a Roblox experience</h2>
          <p style={{ color: "#9fb1c7", lineHeight: 1.65 }}>Use a read-only Open Cloud key scoped to analytics for this experience. The key is encrypted before storage and is never returned by the API.</p>
          <form onSubmit={connect} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 18 }}>
            <input required value={universeId} onChange={(event) => setUniverseId(event.target.value)} placeholder="Universe ID" inputMode="numeric" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "12px 13px" }} />
            <input value={experienceName} onChange={(event) => setExperienceName(event.target.value)} placeholder="Experience name" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "12px 13px" }} />
            <input required type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Read-only Roblox API key" autoComplete="off" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "12px 13px" }} />
            <button disabled={busy} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 11, padding: "12px 14px", fontWeight: 800 }}>Save connection</button>
          </form>
        </section>}

        <WorkspacePhase2A />
      </section>
    </main>
  );
}
