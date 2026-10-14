"use client";

import { useCallback, useEffect, useState } from "react";

type Overview = {
  generated_at: string;
  summary: {
    studios_total: number;
    studios_active: number;
    studios_disabled: number;
    users_total: number;
    connections_total: number;
    observations_total: number;
    pending_invites: number;
    active_sessions: number;
    feedback_total: number;
  };
  studios: Array<{ id: number; name: string; slug: string; state: string; active: boolean; feedback_count: number; connection: null | { experience_name: string | null; universe_id: string }; data: { observation_count: number; latest_observation_at: string | null } }>;
  recent_invites: Array<{ id: number; organization_name: string; email: string; role: string; status: string; created_at: string }>;
  recent_feedback: Array<{ id: number; organization_name: string; category: string; message: string; usefulness_score: number | null; created_at: string }>;
  data_transfer: Array<{ metric: string; observations: number; latest_observation_at: string | null }>;
};

const card: React.CSSProperties = { border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", borderRadius: 16, padding: 18 };

function date(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) return (window.location.href = "/admin/login");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.detail ?? "Could not load overview.");
    else { setData(payload); setError(""); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  const summary = data?.summary;
  const attention = data?.studios.filter((studio) => studio.state !== "active" || !studio.active) ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Operations</div><h1 style={{ margin: "8px 0 6px", fontSize: 38, letterSpacing: "-.04em" }}>Overview</h1><p style={{ margin: 0, color: "#8298b1" }}>Daily operating picture for customers, access, analytics flow and pilot health.</p></div>
        <button onClick={() => void load()} style={{ border: "1px solid rgba(255,255,255,.12)", background: "#0a1728", color: "#dbeafe", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>{loading ? "Refreshing…" : "Refresh"}</button>
      </div>
      {error && <div style={{ ...card, marginTop: 18, color: "#fda4af" }}>{error}</div>}
      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12 }}>
        {[
          ["Studios", summary?.studios_total ?? "—", `${summary?.studios_active ?? 0} active`],
          ["Users", summary?.users_total ?? "—", `${summary?.active_sessions ?? 0} live sessions`],
          ["Connected", summary?.connections_total ?? "—", "Roblox experiences"],
          ["Observations", summary?.observations_total ?? "—", "analytics rows"],
          ["Pending invites", summary?.pending_invites ?? "—", "needs follow-up"],
          ["Feedback", summary?.feedback_total ?? "—", "customer responses"],
        ].map(([label, value, copy]) => <div key={label} style={card}><div style={{ color: "#6f849d", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>{value}</div><div style={{ marginTop: 4, color: "#71849c", fontSize: 11 }}>{copy}</div></div>)}
      </div>

      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)", gap: 14 }}>
        <section style={card}><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".14em" }}>Needs attention</div><h2 style={{ margin: "8px 0 14px", fontSize: 21 }}>Customer follow-up</h2>{attention.length === 0 ? <p style={{ color: "#86efac", fontSize: 13 }}>No studio currently requires operator intervention.</p> : <div style={{ display: "grid", gap: 9 }}>{attention.slice(0, 8).map((studio) => <div key={studio.id} style={{ background: "rgba(255,255,255,.025)", borderRadius: 10, padding: 11 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><strong style={{ fontSize: 13 }}>{studio.name}</strong><span style={{ color: studio.active ? "#fcd34d" : "#fda4af", fontSize: 11 }}>{studio.state}</span></div><div style={{ marginTop: 4, color: "#71849c", fontSize: 11 }}>{studio.connection?.experience_name ?? "No Roblox experience"} · {studio.data.observation_count} observations</div></div>)}</div>}</section>
        <section style={card}><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".14em" }}>Recent feedback</div><h2 style={{ margin: "8px 0 14px", fontSize: 21 }}>What customers are saying</h2><div style={{ display: "grid", gap: 9 }}>{(data?.recent_feedback ?? []).slice(0, 6).map((item) => <div key={item.id} style={{ background: "rgba(255,255,255,.025)", borderRadius: 10, padding: 11 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><strong style={{ fontSize: 12 }}>{item.organization_name}</strong><span style={{ color: "#71849c", fontSize: 10 }}>{date(item.created_at)}</span></div><div style={{ marginTop: 4, color: "#a9bad0", fontSize: 12 }}>{item.message}</div></div>)}{!data?.recent_feedback.length && <p style={{ color: "#71849c", fontSize: 12 }}>No feedback yet.</p>}</div></section>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)", gap: 14 }}>
        <section style={card}><h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Recent invites</h2>{(data?.recent_invites ?? []).slice(0, 7).map((invite) => <div key={invite.id} style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><div><strong>{invite.organization_name}</strong><div style={{ color: "#71849c", marginTop: 2 }}>{invite.email} · {invite.role}</div></div><span style={{ color: invite.status === "pending" ? "#fcd34d" : "#86efac" }}>{invite.status}</span></div>)}</section>
        <section style={card}><h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Analytics flow</h2>{(data?.data_transfer ?? []).slice(0, 8).map((metric) => <div key={metric.metric} style={{ padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span>{metric.metric}</span><span style={{ color: "#8da3bb" }}>{metric.observations} · {date(metric.latest_observation_at)}</span></div>)}</section>
      </div>
    </div>
  );
}
