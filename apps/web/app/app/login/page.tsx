"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PilotLoginPage() {
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) setInvite(token);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/pilot/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invite.trim() }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.detail ?? "Invite could not be redeemed.");
      setLoading(false);
      return;
    }
    window.location.href = "/app/workspace";
  }

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 540, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 30 }}>
        <div style={{ fontWeight: 900, letterSpacing: "-.03em", fontSize: 20 }}>PlayDirective</div>
        <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Founding Studio Pilot</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 38, letterSpacing: "-.04em" }}>Open your studio workspace.</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.7 }}>Decision intelligence for Roblox studios. Know what changed. Know what to do next.</p>
        <p style={{ color: "#718198", lineHeight: 1.7, fontSize: 13 }}>Access is invite-only during the 30-day pilot. Open the invitation link issued for your studio or paste the token below.</p>
        <form onSubmit={submit} style={{ marginTop: 24 }}>
          <label htmlFor="invite" style={{ display: "block", fontSize: 12, color: "#9fb1c7", marginBottom: 8 }}>Invitation token</label>
          <input id="invite" value={invite} onChange={(event) => setInvite(event.target.value)} autoComplete="off" required minLength={20} style={{ width: "100%", boxSizing: "border-box", border: "1px solid rgba(255,255,255,.14)", background: "#0b1728", color: "#eef7ff", borderRadius: 12, padding: "13px 14px", outline: "none" }} />
          {error && <p style={{ color: "#fb7185", fontSize: 13 }}>{error}</p>}
          <button disabled={loading} style={{ width: "100%", marginTop: 16, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 12, padding: "13px 16px", fontWeight: 800, cursor: "pointer" }}>{loading ? "Opening workspace…" : "Enter PlayDirective workspace"}</button>
        </form>
        <p style={{ marginTop: 18, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>The invite is exchanged server-side. Your session is stored in a secure HttpOnly cookie and the raw session token is not exposed to browser JavaScript.</p>
      </section>
    </main>
  );
}
