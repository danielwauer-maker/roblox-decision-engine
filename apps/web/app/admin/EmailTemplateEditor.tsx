"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Template = {
  key: string;
  name: string;
  category: string;
  subject: string;
  body_html: string;
  active: boolean;
  customized: boolean;
  updated_at: string | null;
};

type Delivery = {
  id: number;
  recipient: string;
  kind: string;
  status: string;
  provider_message_id: string | null;
  error: string | null;
  created_at: string;
  sent_at: string | null;
};

type Payload = { templates: Template[]; recent_deliveries: Delivery[] };
const card: React.CSSProperties = { border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.025)", borderRadius: 16 };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid rgba(255,255,255,.12)", background: "#07101f", color: "#eef7ff", borderRadius: 9, padding: "10px 11px" };

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function EmailTemplateEditor() {
  const [payload, setPayload] = useState<Payload>({ templates: [], recent_deliveries: [] });
  const [selectedKey, setSelectedKey] = useState("");
  const [draft, setDraft] = useState<Template | null>(null);
  const [status, setStatus] = useState("");
  const [recipient, setRecipient] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/email-templates", { cache: "no-store" });
    if (response.status === 401) { window.location.href = "/admin/login"; return; }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(data.detail ?? "Could not load templates."); return; }
    setPayload(data);
    if (!selectedKey && data.templates?.length) setSelectedKey(data.templates[0].key);
  }, [selectedKey]);

  useEffect(() => { void load(); }, [load]);
  const selected = useMemo(() => payload.templates.find((item) => item.key === selectedKey) ?? null, [payload.templates, selectedKey]);
  useEffect(() => { if (selected) setDraft({ ...selected }); }, [selected]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setStatus("Saving template…");
    const response = await fetch(`/api/admin/email-templates/${encodeURIComponent(draft.key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draft.name, category: draft.category, subject: draft.subject, body_html: draft.body_html, active: draft.active }),
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Template saved. New automatic notifications with this kind will use the override." : data.detail ?? "Save failed.");
    if (response.ok) await load();
  }

  async function sendManual() {
    if (!draft || !recipient) return;
    if (!window.confirm(`Send this message now to ${recipient}?`)) return;
    setStatus("Sending email…");
    const response = await fetch("/api/admin/email-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: recipient, subject: draft.subject.replaceAll("{{default_subject}}", draft.name), body_html: draft.body_html.replaceAll("{{default_body}}", "<p>This is a manual message from PlayDirective.</p>") }),
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? `Email ${data.status?.toLowerCase?.() ?? "processed"}.` : data.detail ?? "Send failed.");
    if (response.ok) await load();
  }

  return <div>
    <div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" }}>Communication</div><h1 style={{ margin: "8px 0 6px", fontSize: 38, letterSpacing: "-.04em" }}>Email templates</h1><p style={{ margin: 0, color: "#8298b1", maxWidth: 820 }}>Manage automatic PlayDirective email overrides and send manual customer messages. If a template is inactive, the proven built-in production copy remains the fallback.</p></div>
    <div style={{ marginTop: 12, color: "#9fb3c8", fontSize: 11 }}>Safe dynamic placeholders: <code>{"{{default_subject}}"}</code>, <code>{"{{default_body}}"}</code>, <code>{"{{recipient}}"}</code>, <code>{"{{organization_id}}"}</code></div>
    {status && <div style={{ marginTop: 14, color: status.toLowerCase().includes("failed") ? "#fda4af" : "#a5f3fc", fontSize: 12 }}>{status}</div>}

    <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "minmax(230px,.45fr) minmax(460px,1.55fr)", gap: 16 }}>
      <aside style={{ ...card, padding: 12, alignSelf: "start" }}>
        <div style={{ color: "#60738c", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".14em", padding: "5px 7px 9px" }}>Templates</div>
        <div style={{ display: "grid", gap: 5 }}>{payload.templates.map((item) => <button key={item.key} onClick={() => setSelectedKey(item.key)} style={{ textAlign: "left", border: selectedKey === item.key ? "1px solid rgba(103,232,249,.35)" : "1px solid transparent", background: selectedKey === item.key ? "rgba(103,232,249,.08)" : "transparent", color: "#e5eef8", borderRadius: 9, padding: 10, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontSize: 12 }}>{item.name}</strong><span style={{ color: item.active ? "#86efac" : "#71849c", fontSize: 9 }}>{item.active ? "ACTIVE" : "FALLBACK"}</span></div><div style={{ marginTop: 4, color: "#71849c", fontSize: 10 }}>{item.category} · {item.key}</div></button>)}</div>
      </aside>

      {draft && <section style={{ ...card, padding: 20 }}><form onSubmit={save} style={{ display: "grid", gap: 12 }}><div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10 }}><label style={label}>Template name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={{ ...input, marginTop: 6 }}/></label><label style={label}>Category<input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} style={{ ...input, marginTop: 6 }}/></label></div><label style={label}>Subject<input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} style={{ ...input, marginTop: 6 }}/></label><label style={label}>HTML body<textarea rows={12} value={draft.body_html} onChange={(e) => setDraft({ ...draft, body_html: e.target.value })} style={{ ...input, marginTop: 6, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}/></label><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}><label style={{ display: "flex", alignItems: "center", gap: 8, color: "#c5d3e2", fontSize: 12 }}><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })}/>Use this template automatically for matching notification kind</label><button style={primary}>Save template</button></div></form>
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.08)" }}><h2 style={{ margin: 0, fontSize: 18 }}>Manual send</h2><p style={{ color: "#71849c", fontSize: 11 }}>Uses the current editor content and records delivery status in the same notification audit trail.</p><div style={{ display: "flex", gap: 9 }}><input type="email" placeholder="customer@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={input}/><button onClick={() => void sendManual()} disabled={!recipient} style={{ ...primary, whiteSpace: "nowrap", opacity: recipient ? 1 : .5 }}>Send now</button></div></div>
        <div style={{ marginTop: 20 }}><h2 style={{ margin: "0 0 9px", fontSize: 18 }}>Body preview</h2><iframe title="Email template preview" srcDoc={`<body style="font-family:Arial;background:#fff;color:#111;padding:20px">${draft.body_html.replaceAll("{{default_body}}", "<p>Dynamic production content appears here.</p>")}</body>`} style={{ width: "100%", height: 230, border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, background: "white" }}/></div>
      </section>}
    </div>

    <section style={{ ...card, marginTop: 16, padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".14em" }}>Delivery audit</div><h2 style={{ margin: "7px 0 0", fontSize: 20 }}>Recent email activity</h2></div><button onClick={() => void load()} style={secondary}>Refresh</button></div><div style={{ marginTop: 12, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}><thead><tr>{["Time","Recipient","Kind","Status","Provider ID / error"].map((head) => <th key={head} style={th}>{head}</th>)}</tr></thead><tbody>{payload.recent_deliveries.map((item) => <tr key={item.id}><td style={td}>{formatDate(item.created_at)}</td><td style={td}>{item.recipient}</td><td style={td}>{item.kind}</td><td style={{ ...td, color: item.status === "SENT" ? "#86efac" : item.status === "FAILED" ? "#fda4af" : "#fcd34d" }}>{item.status}</td><td style={td}>{item.provider_message_id ?? item.error ?? "—"}</td></tr>)}</tbody></table></div></section>
  </div>;
}

const label: React.CSSProperties = { color: "#9fb3c8", fontSize: 11, fontWeight: 700 };
const primary: React.CSSProperties = { border: 0, background: "#67e8f9", color: "#07101f", borderRadius: 9, padding: "9px 12px", fontWeight: 800, cursor: "pointer" };
const secondary: React.CSSProperties = { border: "1px solid rgba(255,255,255,.12)", background: "#0a1728", color: "#dbeafe", borderRadius: 9, padding: "8px 10px", cursor: "pointer" };
const th: React.CSSProperties = { textAlign: "left", color: "#71849c", fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", padding: "8px 7px", borderBottom: "1px solid rgba(255,255,255,.08)" };
const td: React.CSSProperties = { padding: "9px 7px", borderBottom: "1px solid rgba(255,255,255,.05)", color: "#c4d2e2", overflowWrap: "anywhere" };
