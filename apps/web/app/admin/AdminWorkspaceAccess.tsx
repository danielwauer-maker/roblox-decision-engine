"use client";

import { useEffect, useState } from "react";

type Studio = {
  id: number;
  name: string;
  slug: string;
  state: string;
  active: boolean;
};

type Overview = {
  studios: Studio[];
};

type WorkspaceLink = {
  invite_url: string;
  expires_at: string;
  email: string;
};

export default function AdminWorkspaceAccess() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [links, setLinks] = useState<Record<number, WorkspaceLink>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    if (response.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const payload: Overview = await response.json().catch(() => ({ studios: [] }));
    if (response.ok) setStudios(payload.studios ?? []);
  }

  async function createLink(studio: Studio) {
    setBusy(studio.id);
    setMessage("");
    const response = await fetch("/api/admin/workspace-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization_id: studio.id }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.detail ?? `Could not create a workspace link for ${studio.name}.`);
      setBusy(null);
      return;
    }
    setLinks((current) => ({ ...current, [studio.id]: payload }));
    setMessage(`Fresh one-time workspace link created for ${studio.name}.`);
    setBusy(null);
  }

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "22px clamp(18px, 4vw, 42px) 0", fontFamily: "Arial, sans-serif" }}>
      <div style={{ border: "1px solid rgba(103,232,249,.16)", background: "rgba(103,232,249,.035)", borderRadius: 18, padding: 20 }}>
        <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Admin workspace access</div>
        <h2 style={{ margin: "9px 0 6px", fontSize: 23 }}>Open a studio workspace</h2>
        <p style={{ margin: 0, maxWidth: 900, color: "#8095ae", fontSize: 13, lineHeight: 1.65 }}>
          Existing invite tokens cannot be displayed again because PlayDirective stores only their hashes. Create a fresh one-time OWNER invite here when you need to enter a tester workspace for support or validation.
        </p>
        {message && <div style={{ marginTop: 12, color: "#a5f3fc", fontSize: 12 }}>{message}</div>}

        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {studios.map((studio) => {
            const link = links[studio.id];
            return (
              <article key={studio.id} style={{ border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)", borderRadius: 12, padding: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{studio.name}</strong>
                    <div style={{ marginTop: 3, color: "#60738c", fontSize: 10 }}>{studio.slug} · {studio.state}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!studio.active || busy === studio.id}
                    onClick={() => void createLink(studio)}
                    style={{ border: "1px solid rgba(103,232,249,.22)", background: "transparent", color: studio.active ? "#a5f3fc" : "#52627a", borderRadius: 8, padding: "8px 10px", cursor: studio.active ? "pointer" : "default", fontSize: 11, fontWeight: 700 }}
                  >
                    {busy === studio.id ? "Creating…" : "Create fresh workspace link"}
                  </button>
                </div>

                {link && (
                  <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                    <div style={{ color: "#71849c", fontSize: 10 }}>OWNER: {link.email}</div>
                    <input readOnly value={link.invite_url} style={{ marginTop: 7, width: "100%", boxSizing: "border-box", border: "1px solid rgba(255,255,255,.1)", background: "#07101f", color: "#dbeafe", borderRadius: 8, padding: 9, fontSize: 10 }} />
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => navigator.clipboard.writeText(link.invite_url)} style={{ border: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "#dbeafe", borderRadius: 8, padding: "7px 9px", cursor: "pointer", fontSize: 10 }}>Copy link</button>
                      <a href={link.invite_url} target="_blank" rel="noreferrer" style={{ border: 0, background: "#67e8f9", color: "#07101f", borderRadius: 8, padding: "7px 9px", fontWeight: 800, textDecoration: "none", fontSize: 10 }}>Open workspace login</a>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
