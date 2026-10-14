"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Studio = {
  id: number;
  slug: string;
  name: string;
  active: boolean;
  state: string;
  created_at: string;
  users: number;
  active_sessions: number;
  invites: { total: number; pending: number; redeemed: number; expired: number };
  connection: null | { configured: boolean; universe_id: string; experience_name: string | null; updated_at: string };
  data: { observation_count: number; latest_observation_at: string | null; latest_ingestion_at: string | null };
  feedback_count: number;
};

type Overview = { generated_at: string; studios: Studio[] };
const card: React.CSSProperties = { border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", borderRadius: 16 };

export default function StudioOperations() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) { window.location.href = "/admin/login"; return; }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.detail ?? "Could not load studios.");
    else { setOverview(payload); setError(""); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function onboard(event: FormEvent) {
    event.preventDefault(); setAction("Creating studio…"); setInviteUrl("");
    const response = await fetch("/api/admin/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug, email }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setAction(payload.detail ?? "Onboarding failed."); return; }
    setInviteUrl(payload.invite_url); setAction("Studio created and OWNER invitation generated."); setName(""); setSlug(""); setEmail(""); await load();
  }

  async function toggle(studio: Studio) {
    const active = !studio.active;
    if (!window.confirm(active ? `Reactivate ${studio.name}?` : `Disable ${studio.name} and block access?`)) return;
    const response = await fetch("/api/admin/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organization_id: studio.id, active }) });
    const payload = await response.json().catch(() => ({}));
    setAction(response.ok ? (active ? "Studio reactivated." : "Studio disabled.") : payload.detail ?? "Action failed.");
    if (response.ok) await load();
  }

  async function revoke(studio: Studio) {
    if (!window.confirm(`Sign all users of ${studio.name} out immediately?`)) return;
    const response = await fetch("/api/admin/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organization_id: studio.id }) });
    const payload = await response.json().catch(() => ({}));
    setAction(response.ok ? `${payload.revoked_sessions ?? 0} session(s) revoked.` : payload.detail ?? "Action failed.");
    if (response.ok) await load();
  }

  return <div>
    <div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Customers</div><h1 style={{ margin: "8px 0 6px", fontSize: 38, letterSpacing: "-.04em" }}>Studios & customers</h1><p style={{ margin: 0, color: "#8298b1" }}>Onboard studios, review customer health, revoke access and follow Roblox data readiness.</p></div>
    {action && <div style={{ marginTop: 16, color: "#a5f3fc", fontSize: 12 }}>{action}</div>}{error && <div style={{ marginTop: 16, color: "#fda4af", fontSize: 12 }}>{error}</div>}
    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "minmax(280px,.7fr) minmax(420px,1.3fr)", gap: 16 }}>
      <section style={{ ...card, padding: 20, alignSelf: "start" }}><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".14em" }}>Onboarding</div><h2 style={{ margin: "8px 0 6px", fontSize: 21 }}>Create studio + OWNER invite</h2><p style={{ margin: 0, color: "#7d91a9", fontSize: 12, lineHeight: 1.6 }}>Use this for manually approved founding studios. The generated invitation is single-use.</p><form onSubmit={onboard} style={{ marginTop: 16, display: "grid", gap: 9 }}><input required minLength={2} placeholder="Studio name" value={name} onChange={(e) => setName(e.target.value)} style={input}/><input required minLength={2} placeholder="studio-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} style={input}/><input required type="email" placeholder="Owner email" value={email} onChange={(e) => setEmail(e.target.value)} style={input}/><button style={primary}>Create founding studio</button></form>{inviteUrl && <div style={{ marginTop: 13, padding: 11, border: "1px solid rgba(103,232,249,.15)", borderRadius: 10 }}><div style={{ color: "#a5f3fc", fontSize: 10, fontWeight: 800 }}>ONE-TIME INVITE</div><input readOnly value={inviteUrl} style={{ ...input, width: "100%", boxSizing: "border-box", marginTop: 7, fontSize: 10 }}/><button type="button" onClick={() => navigator.clipboard.writeText(inviteUrl)} style={{ ...secondary, marginTop: 7 }}>Copy link</button></div>}</section>
      <section><div style={{ display: "grid", gap: 11 }}>{(overview?.studios ?? []).map((studio) => <article key={studio.id} style={{ ...card, padding: 17 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><strong style={{ fontSize: 17 }}>{studio.name}</strong><span style={{ color: studio.active ? "#86efac" : "#fda4af", fontSize: 10 }}>{studio.active ? "ACTIVE" : "DISABLED"}</span></div><div style={{ marginTop: 4, color: "#71849c", fontSize: 11 }}>{studio.slug} · org #{studio.id}</div></div><div style={{ display: "flex", gap: 7 }}><button onClick={() => void revoke(studio)} style={secondary}>Revoke sessions</button><button onClick={() => void toggle(studio)} style={studio.active ? danger : primary}>{studio.active ? "Disable" : "Reactivate"}</button></div></div><div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>{[["State",studio.state],["Users",studio.users],["Sessions",studio.active_sessions],["Invites",`${studio.invites.pending} pending`],["Experience",studio.connection?.experience_name ?? "Not connected"],["Observations",studio.data.observation_count],["Feedback",studio.feedback_count]].map(([label,value]) => <div key={label} style={{ padding: 9, background: "rgba(255,255,255,.025)", borderRadius: 9 }}><div style={{ color: "#60738c", fontSize: 9, textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 4, fontSize: 12, overflowWrap: "anywhere" }}>{value}</div></div>)}</div></article>)}</div></section>
    </div>
  </div>;
}

const input: React.CSSProperties = { border: "1px solid rgba(255,255,255,.12)", background: "#07101f", color: "#eef7ff", borderRadius: 9, padding: "10px 11px" };
const primary: React.CSSProperties = { border: 0, background: "#67e8f9", color: "#07101f", borderRadius: 9, padding: "9px 11px", fontWeight: 800, cursor: "pointer" };
const secondary: React.CSSProperties = { border: "1px solid rgba(255,255,255,.12)", background: "#0a1728", color: "#dbeafe", borderRadius: 9, padding: "8px 10px", cursor: "pointer", fontSize: 11 };
const danger: React.CSSProperties = { ...secondary, border: "1px solid rgba(251,113,133,.2)", color: "#fda4af", background: "rgba(251,113,133,.05)" };
