"use client";

import { FormEvent, useEffect, useState } from "react";

export default function PilotLoginPage() {
  const [invite, setInvite] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRedeeming, setAutoRedeeming] = useState(false);
  const [commercialMode, setCommercialMode] = useState<"pilot" | "standard" | null>(null);

  useEffect(() => {
    void fetch("/api/commercial/mode", { cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error("mode unavailable"); return response.json(); })
      .then(payload => setCommercialMode(payload.commercial_mode === "standard" ? "standard" : "pilot"))
      .catch(() => setCommercialMode(null));
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("token");
    const loginToken = params.get("login_token");
    const standardSignupToken = params.get("standard_signup_token");
    if (inviteToken) setInvite(inviteToken);
    if (standardSignupToken) {
      setAutoRedeeming(true);
      void redeemStandardSignup(standardSignupToken);
    } else if (loginToken) {
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

  async function redeemStandardSignup(token: string) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/enrollment/standard-trial/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.detail ?? "Signup link could not be redeemed.");
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
    if (!response.ok) setError(payload.detail ?? "Sign-in link could not be requested.");
    else setMessage(payload.message ?? "If that email has pilot access, a sign-in link has been sent.");
    setLoading(false);
  }

  return (
    <main className="login-shell">
      <style>{`
        *{box-sizing:border-box}.login-shell{min-height:100vh;background:radial-gradient(circle at 50% 35%,rgba(24,103,132,.13),transparent 34%),#07101f;color:#eef7ff;font-family:Arial,sans-serif;display:grid;place-items:center;padding:28px}.login-wrap{width:100%;max-width:590px}.back{display:inline-flex;margin-bottom:18px;color:#7ddff1;text-decoration:none;font-size:12px}.login-card{border:1px solid rgba(103,232,249,.16);background:linear-gradient(145deg,rgba(13,28,48,.94),rgba(10,20,35,.96));border-radius:26px;padding:34px;box-shadow:0 28px 90px rgba(0,0,0,.28)}.logo{width:205px;height:auto;display:block;margin-bottom:26px}.eyebrow{color:#67e8f9;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.login-card h1{margin:10px 0 0;font-size:clamp(34px,7vw,46px);line-height:1.02;letter-spacing:-.045em}.intro{color:#9fb1c7;line-height:1.65;font-size:15px;margin:14px 0 0}.trust{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:22px}.trust div{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);border-radius:12px;padding:10px;color:#9fb1c7;font-size:10px;text-align:center}.form{margin-top:24px}.label{display:block;font-size:11px;color:#9fb1c7;margin-bottom:8px}.input{width:100%;border:1px solid rgba(255,255,255,.14);background:#0b1728;color:#eef7ff;border-radius:12px;padding:13px 14px;outline:none}.input:focus{border-color:rgba(103,232,249,.55);box-shadow:0 0 0 3px rgba(103,232,249,.07)}.primary,.secondary{width:100%;margin-top:12px;border-radius:12px;padding:13px 16px;font-weight:800;cursor:pointer}.primary{background:#67e8f9;color:#07101f;border:0}.secondary{background:transparent;color:#eef7ff;border:1px solid rgba(255,255,255,.14)}.divider{margin:24px 0;border-top:1px solid rgba(255,255,255,.08)}.invite-label{color:#718198;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px}.notice{margin-top:18px;border-radius:11px;padding:10px 12px;font-size:12px;line-height:1.5}.error{background:rgba(251,113,133,.06);border:1px solid rgba(251,113,133,.2);color:#fda4af}.success{background:rgba(134,239,172,.05);border:1px solid rgba(134,239,172,.18);color:#86efac}.security{margin-top:20px;color:#718198;font-size:11px;line-height:1.6}.apply{margin-top:18px}.apply a{color:#67e8f9;text-decoration:none;font-size:12px;font-weight:700}@media(max-width:620px){.login-shell{padding:16px}.login-card{padding:24px;border-radius:20px}.logo{width:180px}.trust{grid-template-columns:1fr}}
      `}</style>
      <div className="login-wrap">
        <a className="back" href="/">← Back to PlayDirective</a>
        <section className="login-card">
          <img className="logo" src="/brand/playdirective/logo.png" alt="PlayDirective" />
          <div className="eyebrow">{commercialMode === "standard" ? "PlayDirective account" : "Founding Studio Pilot"}</div>
          <h1>{autoRedeeming ? "Signing you in…" : "Open your studio workspace."}</h1>
          <p className="intro">Decision intelligence for Roblox studios. Know what changed. Know what to do next.</p>

          <div className="trust"><div>Private workspace</div><div>Secure magic link</div><div>No password required</div></div>

          {!autoRedeeming && <>
            <form className="form" onSubmit={requestLogin}>
              <label className="label" htmlFor="email">Pilot email address</label>
              <input className="input" id="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" type="email" required />
              <button className="primary" disabled={loading}>{loading ? "Sending…" : "Email me a sign-in link"}</button>
            </form>

            {invite && <div className="divider" />}
            {invite && <form onSubmit={submitInvite}>
              <div className="invite-label">First-time invitation</div>
              <label className="label" htmlFor="invite">Invitation token</label>
              <input className="input" id="invite" value={invite} onChange={(event) => setInvite(event.target.value)} autoComplete="off" required minLength={20} />
              <button className="secondary" disabled={loading}>{loading ? "Opening workspace…" : "Redeem invitation"}</button>
            </form>}
          </>}

          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice success">{message}</div>}
          <p className="security">Sign-in and invitation links are single-use. The resulting workspace session is stored in a secure HttpOnly cookie; raw session tokens are not exposed to browser JavaScript.</p>
          {commercialMode && <div className="apply"><a href={commercialMode === "standard" ? "/start-trial" : "/apply"}>{commercialMode === "standard" ? "Start a 14-day Indie trial →" : "Founding Pilot application →"}</a></div>}
        </section>
      </div>
    </main>
  );
}
