"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.detail ?? "Login failed.");
      setLoading(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <main style={{ minHeight: "100vh", background: "#06111f", color: "#eef7ff", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 460, border: "1px solid rgba(255,255,255,.1)", background: "#0a1728", borderRadius: 24, padding: 30, boxShadow: "0 30px 80px rgba(0,0,0,.3)" }}>
        <div style={{ fontWeight: 900, letterSpacing: "-.03em", fontSize: 20 }}>PlayDirective</div>
        <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Private Operator Console</div>
        <h1 style={{ margin: "12px 0 8px", fontSize: 36, letterSpacing: "-.04em" }}>Admin access</h1>
        <p style={{ margin: 0, color: "#8fa2ba", lineHeight: 1.7, fontSize: 14 }}>Private operating dashboard for studio onboarding, pilot health, analytics flow, decisions and support.</p>
        <form onSubmit={submit} style={{ marginTop: 26, display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 7, color: "#9fb1c7", fontSize: 12 }}>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required style={{ border: "1px solid rgba(255,255,255,.14)", background: "#07101f", color: "#eef7ff", borderRadius: 12, padding: "13px 14px" }} />
          </label>
          <label style={{ display: "grid", gap: 7, color: "#9fb1c7", fontSize: 12 }}>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required style={{ border: "1px solid rgba(255,255,255,.14)", background: "#07101f", color: "#eef7ff", borderRadius: 12, padding: "13px 14px" }} />
          </label>
          {error && <div style={{ color: "#fda4af", fontSize: 13 }}>{error}</div>}
          <button disabled={loading} style={{ marginTop: 4, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 12, padding: "13px 16px", fontWeight: 800, cursor: "pointer" }}>{loading ? "Signing in…" : "Open PlayDirective console"}</button>
        </form>
        <p style={{ margin: "18px 0 0", color: "#60738c", fontSize: 11, lineHeight: 1.6 }}>Credentials are verified server-side. The admin API token is never exposed to browser JavaScript.</p>
      </section>
    </main>
  );
}
