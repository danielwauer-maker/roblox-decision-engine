"use client";

import { FormEvent, useState } from "react";

export default function StartTrialPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/enrollment/standard-trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_name: String(form.get("contact_name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        studio_name: String(form.get("studio_name") || "").trim(),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setError(payload.detail || "We could not start signup for this email.");
    else {
      event.currentTarget.reset();
      setMessage(payload.message || "Check your inbox for a secure signup link.");
    }
    setBusy(false);
  }

  const field = { width: "100%", boxSizing: "border-box" as const, marginTop: 7, padding: 12, background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10 };
  return <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial,sans-serif", padding: 24 }}>
    <section style={{ maxWidth: 620, margin: "7vh auto", padding: 28, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22 }}>
      <a href="/" style={{ color: "#eef7ff", textDecoration: "none", fontWeight: 900 }}>PlayDirective</a>
      <div style={{ marginTop: 30, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>14-day Indie trial</div>
      <h1>Start with a verified email.</h1>
<p style={{ color: "#9fb1c7", lineHeight: 1.7 }}>Add a payment method in Stripe Checkout to begin your trial. You will be charged $24/month after 14 days unless you cancel first. Taxes included where applicable. Business customers can provide company and VAT details during account setup. Previous Founding Pilot participants are not eligible.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <label style={{ color: "#9fb1c7", fontSize: 12 }}>Your name<input name="contact_name" required minLength={2} maxLength={160} style={field} /></label>
        <label style={{ color: "#9fb1c7", fontSize: 12 }}>Work email<input name="email" type="email" required maxLength={254} style={field} /></label>
        <label style={{ color: "#9fb1c7", fontSize: 12 }}>Studio name<input name="studio_name" required minLength={2} maxLength={160} style={field} /></label>
        {error && <p style={{ color: "#fb7185" }}>{error}</p>}
        {message && <p style={{ color: "#86efac" }}>{message}</p>}
        <button disabled={busy} style={{ padding: 13, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 10, fontWeight: 800 }}>{busy ? "Sending link…" : "Email me a secure signup link"}</button>
      </form>
      <p style={{ color: "#718198", fontSize: 12, marginTop: 18 }}>Already have an account? <a href="/app/login" style={{ color: "#a5f3fc" }}>Sign in</a></p>
    </section>
  </main>;
}
