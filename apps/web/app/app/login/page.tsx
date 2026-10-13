"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PilotLoginPage() {
  const [invite, setInvite] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRedeeming, setAutoRedeeming] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("token");
    const loginToken = params.get("login_token");
    if (inviteToken) setInvite(inviteToken);
    if (loginToken) {
      setAutoRedeeming(true);
      void redeemLogin(loginToken);
    }
  }, []);

  async function redeemLogin(token: string) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/enrollment/login/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.detail ?? "Sign-in link could not be redeemed.");
      setLoading(false);
      setAutoRedeeming(false);
      return;
    }
    window.location.href = "/app/workspace";
  }

  async function submitInvite(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
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

  async function requestLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/enrollment/login/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.detail ?? "Sign-in link could not be requested.");
    } else {
      setMessage(payload.message ?? "If that email has pilot access, a sign-in link has been sent.");
    }
    setLoading(false);
  }

  const input = { width: "100%", boxSizing: "border-box" as const, border: "1px solid rgba(255,255,255,.14)", background: "#0b1728", color: "#eef7ff", borderRadius: 12, padding: "13px 14px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 560, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", borderRadius: 24, padding: 30 }}>
        <div style={{ fontWeight: 900, letterSpacing: "-.03em", fontSize: 20 }}>PlayDirective</div>
        <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Founding Studio Pilot</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 38, letterSpacing: "-.04em" }}>{autoRedeeming ? "Signing you in…" : "Open your studio workspace."}</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.7 }}>Decision intelligence for Roblox studios. Know what changed. Know what to do next.</p>

        {!autoRedeeming && <>
          <form onSubmit={requestLogin} style={{ marginTop: 24 }}>
            <label htmlFor="email" style={{ display: "block", fontSize: 12, color: "#9fb1c7", marginBottom: 8 }}>Pilot email address</label>
            <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" required style={input} />
            <button disabled={loading} style={{ width: "100%", marginTop: 12, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 12, padding: "13px 16px", fontWeight: 800, cursor: "pointer" }}>{loading ? "Sending…" : "Email me a sign-in link"}</button>
          </form>

          {invite && <div style={{ margin: "24px 0", borderTop: "1px solid rgba(255,255,255,.08)" }} />}
          {invite && <form onSubmit={submitInvite}>
            <div style={{ color: "#718198", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>First-time invitation</div>
            <label htmlFor="invite" style={{ display: "block", fontSize: 12, color: "#9fb1c7", marginBottom: 8 }}>Invitation token</label>
            <input id="invite" value={invite} onChange={(event) => setInvite(event.target.value)} autoComplete="off" required minLength={20} style={input} />
            <button disabled={loading} style={{ width: "100%", marginTop: 12, background: "transparent", color: "#eef7ff", border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, padding: "13px 16px", fontWeight: 800, cursor: "pointer" }}>{loading ? "Opening workspace…" : "Redeem invitation"}</button>
          </form>}
        </>}

        {error && <p style={{ color: "#fb7185", fontSize: 13 }}>{error}</p>}
        {message && <p style={{ color: "#86efac", fontSize: 13 }}>{message}</p>}
        <p style={{ marginTop: 20, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>Sign-in and invitation links are single-use. The resulting workspace session is stored in a secure HttpOnly cookie; raw session tokens are not exposed to browser JavaScript.</p>
        <div style={{ marginTop: 18 }}><a href="/apply" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 13 }}>Not a pilot studio yet? Apply here →</a></div>
      </section>
    </main>
  );
}
