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

export default function PilotApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | "lifecycle" | null>(null);

  async function load() {
    const [a, n] = await Promise.all([
      fetch("/api/admin/applications", { cache: "no-store" }),
      fetch("/api/admin/lifecycle/notifications", { cache: "no-store" }),
    ]);
    if (a.ok) setApplications((await a.json()).items ?? []);
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
    if (!response.ok) {
      setMessage(payload.detail ?? "Application approval failed.");
    } else {
      setMessage(`Approved ${payload.organization?.name ?? "studio"}. Workspace invitation queued/sent.`);
      await load();
    }
    setBusy(null);
  }

  async function runLifecycle() {
    setBusy("lifecycle");
    setMessage("");
    const response = await fetch("/api/admin/lifecycle/run", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.detail ?? "Lifecycle run failed.");
    } else {
      setMessage(`Lifecycle run completed for ${payload.period ?? "current period"}.`);
      await load();
    }
    setBusy(null);
  }

  const pending = applications.filter((item) => item.status === "PENDING");

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "26px clamp(18px,4vw,42px) 8px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>R16 · enrollment & lifecycle</div>
          <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Pilot applications</h2>
          <p style={{ color: "#8fa2ba", margin: "8px 0 0" }}>{pending.length} pending · {applications.length} total</p>
        </div>
        <button disabled={busy !== null} onClick={runLifecycle} style={{ background: "transparent", border: "1px solid rgba(103,232,249,.28)", color: "#a5f3fc", borderRadius: 10, padding: "10px 13px", fontWeight: 800, cursor: "pointer" }}>{busy === "lifecycle" ? "Running…" : "Run lifecycle notifications"}</button>
      </div>

      {message && <div style={{ marginTop: 14, color: "#fde047", fontSize: 13 }}>{message}</div>}

      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {pending.map((item) => (
          <article key={item.id} style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 17, background: "rgba(255,255,255,.025)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <strong>{item.studio_name}</strong>
                <div style={{ color: "#9fb1c7", marginTop: 5, fontSize: 13 }}>{item.contact_name} · {item.email}</div>
                <div style={{ color: "#718198", marginTop: 5, fontSize: 12 }}>MAU: {item.monthly_active_users || "not provided"}{item.universe_id ? ` · Universe ${item.universe_id}` : ""}</div>
              </div>
              <button disabled={busy !== null} onClick={() => approve(item.id)} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 10, padding: "10px 13px", fontWeight: 900, cursor: "pointer" }}>{busy === item.id ? "Approving…" : "Approve & email invite"}</button>
            </div>
            {item.experience_url && <div style={{ marginTop: 10, color: "#8fa2ba", fontSize: 12, wordBreak: "break-all" }}>{item.experience_url}</div>}
            {item.message && <p style={{ margin: "10px 0 0", color: "#c7d5e5", lineHeight: 1.55, fontSize: 13 }}>{item.message}</p>}
          </article>
        ))}
        {!pending.length && <div style={{ color: "#718198", fontSize: 13 }}>No pending pilot applications.</div>}
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
