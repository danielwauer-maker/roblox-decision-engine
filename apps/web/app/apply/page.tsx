"use client";

import { FormEvent, useState } from "react";

export default function ApplyPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setError("");
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const payload = {
      contact_name: String(form.get("contact_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      studio_name: String(form.get("studio_name") ?? "").trim(),
      experience_url: String(form.get("experience_url") ?? "").trim() || null,
      universe_id: String(form.get("universe_id") ?? "").trim() || null,
      monthly_active_users: String(form.get("monthly_active_users") ?? "").trim() || null,
      message: String(form.get("message") ?? "").trim() || null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      referrer: document.referrer || null,
      landing_page: window.location.href,
    };
    const response = await fetch("/api/enrollment/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.detail ?? "Application could not be submitted.");
      setLoading(false);
      return;
    }
    event.currentTarget.reset();
    setStatus(body.message ?? "Application received. Check your email.");
    setLoading(false);
  }

  const input = { width: "100%", boxSizing: "border-box" as const, border: "1px solid rgba(255,255,255,.14)", background: "#0b1728", color: "#eef7ff", borderRadius: 12, padding: "13px 14px", outline: "none" };

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 22px", display: "flex", justifyContent: "space-between", gap: 16 }}>
          <a href="/" style={{ color: "#eef7ff", textDecoration: "none", fontWeight: 900 }}>PlayDirective</a>
          <a href="/app/login" style={{ color: "#9fb1c7", textDecoration: "none" }}>Pilot sign in</a>
        </div>
      </header>
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "64px 22px 90px" }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>30-day founding studio pilot</div>
          <h1 style={{ margin: "14px 0 0", fontSize: "clamp(42px,8vw,66px)", lineHeight: .98, letterSpacing: "-.05em" }}>Apply for a private PlayDirective workspace.</h1>
          <p style={{ color: "#9fb1c7", fontSize: 18, lineHeight: 1.7 }}>The founding pilot is free during validation. We review each application, then send approved studios a private invite by email. Never send Roblox API credentials in this form.</p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 34, border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: "clamp(20px,5vw,30px)", background: "rgba(255,255,255,.025)", display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Your name<input name="contact_name" required minLength={2} maxLength={160} style={{ ...input, marginTop: 7 }} /></label>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Email<input name="email" required type="email" maxLength={254} style={{ ...input, marginTop: 7 }} /></label>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Studio name<input name="studio_name" required minLength={2} maxLength={160} style={{ ...input, marginTop: 7 }} /></label>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Monthly active users<select name="monthly_active_users" defaultValue="" style={{ ...input, marginTop: 7 }}><option value="">Prefer not to say</option><option value="pre-launch">Pre-launch</option><option value="under-1k">Under 1k</option><option value="1k-10k">1k–10k</option><option value="10k-100k">10k–100k</option><option value="100k+">100k+</option></select></label>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Roblox experience URL (optional)<input name="experience_url" type="url" maxLength={500} style={{ ...input, marginTop: 7 }} /></label>
            <label style={{ color: "#9fb1c7", fontSize: 12 }}>Universe ID (optional)<input name="universe_id" inputMode="numeric" pattern="[0-9]*" maxLength={64} style={{ ...input, marginTop: 7 }} /></label>
          </div>
          <label style={{ color: "#9fb1c7", fontSize: 12 }}>What would make the pilot useful for your team? (optional)<textarea name="message" maxLength={3000} rows={5} style={{ ...input, marginTop: 7, resize: "vertical" }} /></label>
          <div style={{ color: "#718198", fontSize: 12, lineHeight: 1.6 }}>By submitting, you ask us to contact you about the PlayDirective founding pilot and confirm that you have read our <a href="/privacy" style={{ color: "#a5f3fc" }}>Privacy Notice</a> and <a href="/terms" style={{ color: "#a5f3fc" }}>Founding Pilot Terms</a>. Roblox credentials are entered only after approval inside your private workspace.</div>
          {error && <div style={{ color: "#fb7185", fontSize: 13 }}>{error}</div>}
          {status && <div style={{ color: "#86efac", fontSize: 13 }}>{status}</div>}
          <button disabled={loading} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 12, padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>{loading ? "Submitting…" : "Apply for founding pilot"}</button>
        </form>
      </section>
    </main>
  );
}
