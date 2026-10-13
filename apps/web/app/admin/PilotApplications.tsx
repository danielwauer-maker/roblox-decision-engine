"use client";

import { useEffect, useState } from "react";

type Application = {
  id: number;
  contact_name: string;
  email: string;
  studio_name: string;
  experience_url?: string | null;
  universe_id?: string | null;
  monthly_active_users?: string | null;
  message?: string | null;
  status: string;
  organization_id?: number | null;
  pipeline_status?: string | null;
  internal_note?: string | null;
  attribution?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    referrer?: string | null;
    landing_page?: string | null;
  };
  created_at: string;
};

type Notification = {
  id: number;
  recipient: string;
  kind: string;
  status: string;
  error?: string | null;
  created_at: string;
};

const pipelineOptions = ["APPLIED", "REVIEWING", "APPROVED", "ACTIVATED", "CONNECTED", "FIRST_VALUE", "PILOT_ACTIVE", "CONVERSION", "PAID", "REJECTED", "PAUSED", "EXPIRED", "CHURNED"];

export default function PilotApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | "lifecycle" | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  async function load() {
    const [a, n] = await Promise.all([
      fetch("/api/admin/applications", { cache: "no-store" }),
      fetch("/api/admin/lifecycle/notifications", { cache: "no-store" }),
    ]);
    if (a.ok) {
      const items = (await a.json()).items ?? [];
      setApplications(items);
      setNotes(Object.fromEntries(items.map((item: Application) => [item.id, item.internal_note ?? ""])));
    }
    if (n.ok) setNotifications((await n.json()).items ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function approve(id: number) {
    setBusy(id);
    setMessage("");
    const response = await fetch(`/api/admin/applications/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(payload.detail ?? "Application approval failed.");
    else {
      setMessage(`Approved ${payload.organization?.name ?? "studio"}. Workspace invitation queued/sent.`);
      await load();
    }
    setBusy(null);
  }

  async function updateReview(id: number, pipelineStatus: string) {
    setBusy(id);
    const response = await fetch(`/api/admin/applications/${id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_status: pipelineStatus, internal_note: notes[id] ?? null }),
    });
    setMessage(response.ok ? `Application ${id} updated to ${pipelineStatus}.` : "Application review update failed.");
    await load();
    setBusy(null);
  }

  async function runLifecycle() {
    setBusy("lifecycle");
    setMessage("");
    const response = await fetch("/api/admin/lifecycle/run", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(payload.detail ?? "Lifecycle run failed.");
    else {
      setMessage(`Lifecycle run completed for ${payload.period ?? "current period"}.`);
      await load();
    }
    setBusy(null);
  }

  const pending = applications.filter((item) => !["REJECTED", "PAID", "CHURNED"].includes(item.pipeline_status ?? item.status));

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "26px clamp(18px,4vw,42px) 8px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>R17 · lead pipeline & lifecycle</div>
          <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Pilot applications</h2>
          <p style={{ color: "#8fa2ba", margin: "8px 0 0" }}>{pending.length} active leads · {applications.length} total</p>
        </div>
        <button disabled={busy !== null} onClick={runLifecycle} style={{ background: "transparent", border: "1px solid rgba(103,232,249,.28)", color: "#a5f3fc", borderRadius: 10, padding: "10px 13px", fontWeight: 800, cursor: "pointer" }}>{busy === "lifecycle" ? "Running…" : "Run product lifecycle"}</button>
      </div>

      {message && <div style={{ marginTop: 14, color: "#fde047", fontSize: 13 }}>{message}</div>}

      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {applications.map((item) => (
          <article key={item.id} style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 17, background: "rgba(255,255,255,.025)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <strong>{item.studio_name}</strong>
                <div style={{ color: "#9fb1c7", marginTop: 5, fontSize: 13 }}>{item.contact_name} · {item.email}</div>
                <div style={{ color: "#718198", marginTop: 5, fontSize: 12 }}>MAU: {item.monthly_active_users || "not provided"}{item.universe_id ? ` · Universe ${item.universe_id}` : ""}</div>
                <div style={{ color: "#67e8f9", marginTop: 5, fontSize: 11 }}>Source: {item.attribution?.utm_source || "direct / unknown"}{item.attribution?.utm_campaign ? ` · ${item.attribution.utm_campaign}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {item.status === "PENDING" && <button disabled={busy !== null} onClick={() => approve(item.id)} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 10, padding: "10px 13px", fontWeight: 900, cursor: "pointer" }}>{busy === item.id ? "Working…" : "Approve & email invite"}</button>}
                <select value={item.pipeline_status ?? item.status} onChange={(event) => void updateReview(item.id, event.target.value)} disabled={busy !== null} style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, padding: "9px 10px" }}>{pipelineOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>
              </div>
            </div>
            {item.experience_url && <div style={{ marginTop: 10, color: "#8fa2ba", fontSize: 12, wordBreak: "break-all" }}>{item.experience_url}</div>}
            {item.message && <p style={{ margin: "10px 0 0", color: "#c7d5e5", lineHeight: 1.55, fontSize: 13 }}>{item.message}</p>}
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8 }}>
              <textarea value={notes[item.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Internal note — qualification, support needs, conversion context…" rows={2} style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: 9, resize: "vertical" }} />
              <button disabled={busy !== null} onClick={() => void updateReview(item.id, item.pipeline_status ?? "REVIEWING")} style={{ background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.2)", borderRadius: 9, padding: "8px 10px", fontWeight: 800 }}>Save note</button>
            </div>
          </article>
        ))}
        {!applications.length && <div style={{ color: "#718198", fontSize: 13 }}>No pilot applications.</div>}
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={{ color: "#718198", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em" }}>Recent email/lifecycle delivery</div>
        <div style={{ marginTop: 10, display: "grid", gap: 7 }}>
          {notifications.slice(0, 12).map((item) => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 8, fontSize: 12 }}><div><strong>{item.kind}</strong><div style={{ color: "#718198", marginTop: 3 }}>{item.recipient}{item.error ? ` · ${item.error}` : ""}</div></div><span style={{ color: item.status === "SENT" ? "#86efac" : item.status === "FAILED" ? "#fb7185" : "#fde047", fontWeight: 800 }}>{item.status}</span></div>)}
          {!notifications.length && <div style={{ color: "#718198", fontSize: 12 }}>No notification events recorded yet.</div>}
        </div>
      </div>
    </section>
  );
}
