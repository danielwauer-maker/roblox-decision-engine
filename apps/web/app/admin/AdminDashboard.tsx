"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Decision = {
  title?: string;
  summary?: string;
  priority_score?: number;
  confidence?: number;
  impact?: number;
};

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
  connection: null | {
    configured: boolean;
    universe_id: string;
    experience_name: string | null;
    updated_at: string;
  };
  data: {
    observation_count: number;
    latest_observation_at: string | null;
    latest_ingestion_at: string | null;
  };
  decisions: { count: number; items: Decision[] };
  feedback_count: number;
};

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
  studios: Studio[];
  data_transfer: Array<{ metric: string; observations: number; latest_observation_at: string | null }>;
  recent_invites: Array<{
    id: number;
    organization_name: string;
    email: string;
    role: string;
    status: string;
    expires_at: string;
    created_at: string;
  }>;
  recent_feedback: Array<{
    id: number;
    organization_name: string;
    category: string;
    message: string;
    usefulness_score: number | null;
    created_at: string;
  }>;
};

const shell: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,.09)",
  background: "rgba(255,255,255,.025)",
  borderRadius: 18,
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function stateLabel(state: string) {
  const labels: Record<string, string> = {
    active: "Active",
    disabled: "Disabled",
    invited: "Invite pending",
    awaiting_invite: "Needs invite",
    needs_connection: "Needs Roblox",
    needs_sync: "Needs sync",
  };
  return labels[state] ?? state;
}

function stateColor(state: string) {
  if (state === "active") return "#86efac";
  if (state === "disabled") return "#fda4af";
  if (state === "needs_sync" || state === "needs_connection") return "#fcd34d";
  return "#93c5fd";
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [studioName, setStudioName] = useState("");
  const [studioSlug, setStudioSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.detail ?? "Could not load operator data.");
      setLoading(false);
      return;
    }
    setOverview(payload);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onboard(event: FormEvent) {
    event.preventDefault();
    setAction("Creating studio…");
    setInviteUrl("");
    const response = await fetch("/api/admin/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: studioName, slug: studioSlug, email: ownerEmail }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setAction(payload.detail ?? "Onboarding failed.");
      return;
    }
    setInviteUrl(payload.invite_url);
    setAction("Studio created. Send the one-time invite link below.");
    setStudioName("");
    setStudioSlug("");
    setOwnerEmail("");
    await load();
  }

  async function setStudioActive(studio: Studio, active: boolean) {
    if (!window.confirm(active ? `Reactivate ${studio.name}?` : `Disable ${studio.name} and block pilot access?`)) return;
    setAction(active ? "Reactivating studio…" : "Disabling studio…");
    const response = await fetch("/api/admin/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: studio.id, active }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setAction(payload.detail ?? "Action failed.");
      return;
    }
    setAction(active ? "Studio reactivated." : "Studio disabled.");
    await load();
  }

  async function revokeSessions(studio: Studio) {
    if (!window.confirm(`Sign all users of ${studio.name} out immediately?`)) return;
    setAction("Revoking sessions…");
    const response = await fetch("/api/admin/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: studio.id }),
    });
    const payload = await response.json().catch(() => ({}));
    setAction(response.ok ? `${payload.revoked_sessions ?? 0} session(s) revoked.` : payload.detail ?? "Action failed.");
    if (response.ok) await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const summary = overview?.summary;

  return (
    <main style={{ minHeight: "100vh", background: "#06111f", color: "#edf6ff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "28px clamp(18px, 4vw, 42px) 70px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".17em", textTransform: "uppercase" }}>Roblox Decision Engine · Private</div>
            <h1 style={{ margin: "9px 0 4px", fontSize: "clamp(32px, 6vw, 48px)", letterSpacing: "-.045em" }}>Operator Console</h1>
            <p style={{ margin: 0, color: "#8095ae", fontSize: 14 }}>Studios, onboarding, analytics flow, decisions, pilot health and customer support.</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={() => void load()} style={{ border: "1px solid rgba(255,255,255,.12)", background: "#0a1728", color: "#dbeafe", borderRadius: 10, padding: "10px 13px", cursor: "pointer" }}>Refresh</button>
            <button onClick={() => void logout()} style={{ border: "1px solid rgba(251,113,133,.22)", background: "rgba(251,113,133,.06)", color: "#fda4af", borderRadius: 10, padding: "10px 13px", cursor: "pointer" }}>Sign out</button>
          </div>
        </header>

        {error && <div style={{ ...shell, marginTop: 22, padding: 16, color: "#fda4af" }}>{error}</div>}
        {action && <div style={{ marginTop: 14, color: "#a5f3fc", fontSize: 13 }}>{action}</div>}

        <section style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {[
            ["Studios", summary?.studios_total ?? "—", `${summary?.studios_active ?? 0} fully active`],
            ["Users", summary?.users_total ?? "—", `${summary?.active_sessions ?? 0} live sessions`],
            ["Connected", summary?.connections_total ?? "—", "Roblox experiences"],
            ["Observations", summary?.observations_total ?? "—", "tenant-scoped rows"],
            ["Pending invites", summary?.pending_invites ?? "—", "awaiting redemption"],
            ["Feedback", summary?.feedback_total ?? "—", "pilot responses"],
          ].map(([label, value, caption]) => (
            <article key={label} style={{ ...shell, padding: 18 }}>
              <div style={{ color: "#71849c", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</div>
              <div style={{ marginTop: 7, fontSize: 29, fontWeight: 800 }}>{value}</div>
              <div style={{ marginTop: 5, color: "#71849c", fontSize: 11 }}>{caption}</div>
            </article>
          ))}
        </section>

        <section style={{ marginTop: 28, display: "grid", gridTemplateColumns: "minmax(280px, .8fr) minmax(320px, 1.2fr)", gap: 16 }}>
          <article style={{ ...shell, padding: 20 }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Founding Studio Onboarding</div>
            <h2 style={{ margin: "9px 0 6px", fontSize: 23 }}>Create studio + owner invite</h2>
            <p style={{ margin: 0, color: "#7f94ad", fontSize: 13, lineHeight: 1.6 }}>Creates the tenant first, then issues a single-use OWNER invitation. The raw invite token is shown only in the generated link.</p>
            <form onSubmit={onboard} style={{ marginTop: 18, display: "grid", gap: 10 }}>
              <input placeholder="Studio name" value={studioName} onChange={(event) => setStudioName(event.target.value)} required minLength={2} style={{ border: "1px solid rgba(255,255,255,.12)", background: "#07101f", color: "#eef7ff", borderRadius: 10, padding: "11px 12px" }} />
              <input placeholder="studio-slug" value={studioSlug} onChange={(event) => setStudioSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required minLength={2} style={{ border: "1px solid rgba(255,255,255,.12)", background: "#07101f", color: "#eef7ff", borderRadius: 10, padding: "11px 12px" }} />
              <input type="email" placeholder="Owner email" value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} required style={{ border: "1px solid rgba(255,255,255,.12)", background: "#07101f", color: "#eef7ff", borderRadius: 10, padding: "11px 12px" }} />
              <button style={{ marginTop: 3, border: 0, background: "#67e8f9", color: "#07101f", borderRadius: 10, padding: "11px 12px", fontWeight: 800, cursor: "pointer" }}>Create founding studio</button>
            </form>
            {inviteUrl && (
              <div style={{ marginTop: 15, padding: 13, borderRadius: 12, background: "rgba(103,232,249,.06)", border: "1px solid rgba(103,232,249,.15)" }}>
                <div style={{ color: "#a5f3fc", fontSize: 11, fontWeight: 800 }}>ONE-TIME INVITE LINK</div>
                <input readOnly value={inviteUrl} style={{ marginTop: 8, width: "100%", boxSizing: "border-box", border: "1px solid rgba(255,255,255,.1)", background: "#07101f", color: "#dbeafe", borderRadius: 8, padding: 9, fontSize: 11 }} />
                <button onClick={() => navigator.clipboard.writeText(inviteUrl)} type="button" style={{ marginTop: 8, border: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "#dbeafe", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>Copy link</button>
              </div>
            )}
          </article>

          <article style={{ ...shell, padding: 20 }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Go-Live Control</div>
            <h2 style={{ margin: "9px 0 14px", fontSize: 23 }}>Pilot operating signals</h2>
            <div style={{ display: "grid", gap: 9 }}>
              {[
                ["Tenant isolation", "Enabled", "Every studio uses organization-scoped data paths."],
                ["Credential exposure", "Protected", "Roblox API keys are never returned to this dashboard."],
                ["Invite access", "Invite-only", "Studios enter through single-use invitation tokens."],
                ["Studio kill switch", "Available", "Disable a tenant or revoke all active sessions immediately."],
                ["Decision visibility", "Current", "Top decision priorities are calculated from each studio's stored observations."],
              ].map(([label, value, copy]) => (
                <div key={label} style={{ padding: "11px 12px", background: "rgba(255,255,255,.025)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><strong>{label}</strong><span style={{ color: "#86efac" }}>{value}</span></div>
                  <div style={{ color: "#71849c", fontSize: 11, marginTop: 4 }}>{copy}</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={{ marginTop: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end" }}>
            <div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Customers</div><h2 style={{ margin: "8px 0 0", fontSize: 27 }}>Studio operations</h2></div>
            <div style={{ color: "#60738c", fontSize: 11 }}>{loading ? "Loading…" : overview ? `Updated ${formatDate(overview.generated_at)}` : ""}</div>
          </div>
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {overview?.studios.length === 0 && <div style={{ ...shell, padding: 22, color: "#8095ae" }}>No studios yet. Create the first founding studio above.</div>}
            {overview?.studios.map((studio) => (
              <article key={studio.id} style={{ ...shell, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 18 }}>{studio.name}</strong>
                      <span style={{ padding: "4px 7px", borderRadius: 999, fontSize: 10, color: stateColor(studio.state), background: "rgba(255,255,255,.04)" }}>{stateLabel(studio.state)}</span>
                    </div>
                    <div style={{ marginTop: 5, color: "#60738c", fontSize: 11 }}>{studio.slug} · created {formatDate(studio.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <button onClick={() => void revokeSessions(studio)} disabled={studio.active_sessions === 0} style={{ border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: studio.active_sessions ? "#dbeafe" : "#52627a", borderRadius: 8, padding: "7px 9px", cursor: studio.active_sessions ? "pointer" : "default", fontSize: 11 }}>Revoke sessions</button>
                    <button onClick={() => void setStudioActive(studio, !studio.active)} style={{ border: `1px solid ${studio.active ? "rgba(251,113,133,.22)" : "rgba(134,239,172,.22)"}`, background: "transparent", color: studio.active ? "#fda4af" : "#86efac", borderRadius: 8, padding: "7px 9px", cursor: "pointer", fontSize: 11 }}>{studio.active ? "Disable studio" : "Reactivate"}</button>
                  </div>
                </div>

                <div style={{ marginTop: 15, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 8 }}>
                  {[
                    ["Users", studio.users],
                    ["Live sessions", studio.active_sessions],
                    ["Pending invites", studio.invites.pending],
                    ["Observations", studio.data.observation_count],
                    ["Decisions", studio.decisions.count],
                    ["Feedback", studio.feedback_count],
                  ].map(([label, value]) => <div key={label} style={{ background: "rgba(255,255,255,.022)", borderRadius: 9, padding: 10 }}><div style={{ color: "#60738c", fontSize: 9, textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 4, fontSize: 17, fontWeight: 700 }}>{value}</div></div>)}
                </div>

                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                  <div style={{ padding: 12, background: "rgba(255,255,255,.018)", borderRadius: 10 }}>
                    <div style={{ color: "#71849c", fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em" }}>Roblox & data</div>
                    <div style={{ marginTop: 7, fontSize: 12 }}>{studio.connection ? `${studio.connection.experience_name ?? "Experience"} · Universe ${studio.connection.universe_id}` : "No Roblox connection yet"}</div>
                    <div style={{ marginTop: 5, color: "#60738c", fontSize: 11 }}>Latest observation: {formatDate(studio.data.latest_observation_at)}<br />Latest ingestion: {formatDate(studio.data.latest_ingestion_at)}</div>
                  </div>
                  <div style={{ padding: 12, background: "rgba(255,255,255,.018)", borderRadius: 10 }}>
                    <div style={{ color: "#71849c", fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em" }}>Current decisions</div>
                    {studio.decisions.items.length ? studio.decisions.items.map((item, index) => <div key={`${studio.id}-${index}`} style={{ marginTop: 7, fontSize: 11, color: "#c9d7e7" }}><strong>{index + 1}. {item.title ?? "Priority"}</strong>{typeof item.priority_score === "number" ? ` · score ${item.priority_score.toFixed(1)}` : ""}</div>) : <div style={{ marginTop: 7, color: "#60738c", fontSize: 11 }}>No supported decision priority yet.</div>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          <article style={{ ...shell, padding: 18 }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Data transfer</div>
            <h2 style={{ margin: "8px 0 13px", fontSize: 20 }}>Metrics received</h2>
            <div style={{ display: "grid", gap: 7 }}>
              {overview?.data_transfer.length ? overview.data_transfer.map((item) => <div key={item.metric} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "9px 10px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}><div><div style={{ fontSize: 11 }}>{item.metric}</div><div style={{ color: "#60738c", fontSize: 10 }}>{formatDate(item.latest_observation_at)}</div></div><strong style={{ fontSize: 12 }}>{item.observations}</strong></div>) : <div style={{ color: "#60738c", fontSize: 12 }}>No tenant analytics received yet.</div>}
            </div>
          </article>

          <article style={{ ...shell, padding: 18 }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Invitations</div>
            <h2 style={{ margin: "8px 0 13px", fontSize: 20 }}>Recent access activity</h2>
            <div style={{ display: "grid", gap: 7 }}>
              {overview?.recent_invites.length ? overview.recent_invites.slice(0, 10).map((invite) => <div key={invite.id} style={{ padding: "9px 10px", background: "rgba(255,255,255,.02)", borderRadius: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11 }}><strong>{invite.organization_name}</strong><span style={{ color: invite.status === "redeemed" ? "#86efac" : invite.status === "expired" ? "#fda4af" : "#93c5fd" }}>{invite.status}</span></div><div style={{ marginTop: 3, color: "#60738c", fontSize: 10 }}>{invite.email} · {invite.role} · {formatDate(invite.created_at)}</div></div>) : <div style={{ color: "#60738c", fontSize: 12 }}>No invitations yet.</div>}
            </div>
          </article>

          <article style={{ ...shell, padding: 18 }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Customer feedback</div>
            <h2 style={{ margin: "8px 0 13px", fontSize: 20 }}>Latest pilot signals</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {overview?.recent_feedback.length ? overview.recent_feedback.slice(0, 10).map((item) => <div key={item.id} style={{ padding: 10, background: "rgba(255,255,255,.02)", borderRadius: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11 }}><strong>{item.organization_name}</strong><span style={{ color: "#a5f3fc" }}>{item.usefulness_score ? `${item.usefulness_score}/5` : item.category}</span></div><div style={{ marginTop: 5, color: "#9fb1c7", fontSize: 11, lineHeight: 1.5 }}>{item.message}</div><div style={{ marginTop: 4, color: "#52627a", fontSize: 9 }}>{formatDate(item.created_at)}</div></div>) : <div style={{ color: "#60738c", fontSize: 12 }}>No pilot feedback yet.</div>}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
