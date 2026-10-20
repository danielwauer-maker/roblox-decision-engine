"use client";

import { FormEvent, useState } from "react";

export default function ApplyPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setStatus("");
    setError("");
    try {
      const form = new FormData(formElement);
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
        return;
      }

      formElement.reset();
      setStatus(body.message ?? "Application received. Check your email.");
    } catch {
      setError("Application could not be submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="apply-shell">
      <style>{`
        :root{color-scheme:dark}
        html{scroll-behavior:smooth}
        body{margin:0;background:#06101e}
        .apply-shell{--cyan:#59e6ff;--muted:#93a9c2;--white:#f4f8fd;min-height:100vh;background:radial-gradient(circle at 50% -8%,rgba(0,202,255,.115),transparent 25%),radial-gradient(circle at 91% 55%,rgba(37,99,235,.045),transparent 28%),linear-gradient(180deg,#06101e,#071220 58%,#06101e);color:var(--white);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;position:relative;overflow:hidden}
        .apply-shell *{box-sizing:border-box}.apply-shell a{color:inherit;text-decoration:none}.wrap{width:min(1060px,calc(100% - 40px));margin:0 auto;position:relative}
        .header{position:sticky;top:0;z-index:30;background:rgba(6,16,30,.82);backdrop-filter:blur(18px);border-bottom:1px solid rgba(125,211,252,.08)}
        .header-inner{height:78px;display:flex;align-items:center;justify-content:space-between}.brand-logo{width:230px;height:auto;display:block}.nav{display:flex;align-items:center;gap:24px;font-size:14px;color:#b9c9da}.nav a:hover{color:white}.nav-cta{padding:11px 16px;border:1px solid rgba(89,230,255,.34);border-radius:12px;background:rgba(24,211,246,.08);color:#efffff!important}
        .hero{padding:66px 0 30px;display:grid;grid-template-columns:1.15fr .85fr;gap:52px;align-items:end}.eyebrow{font-size:12px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:var(--cyan)}.hero h1{font-size:clamp(48px,5.5vw,72px);line-height:.98;letter-spacing:-.055em;margin:16px 0 20px;max-width:760px}.hero-copy{font-size:18px;line-height:1.65;color:#9fb1c7;max-width:720px;margin:0}.hero-note{border:1px solid rgba(89,230,255,.18);background:linear-gradient(145deg,rgba(12,30,50,.82),rgba(7,18,32,.92));border-radius:22px;padding:23px}.hero-note strong{display:block;font-size:15px;margin-bottom:12px}.hero-note ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}.hero-note li{font-size:13px;line-height:1.55;color:#91a6bf;display:flex;gap:9px}.hero-note li:before{content:"✓";color:#70ebcf;font-weight:900}
        .form-wrap{padding:28px 0 30px}.form-card{border:1px solid rgba(91,169,217,.19);background:radial-gradient(circle at 92% 0%,rgba(0,198,255,.075),transparent 31%),linear-gradient(145deg,rgba(10,27,47,.96),rgba(6,17,31,.985));border-radius:28px;padding:32px;box-shadow:0 28px 85px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.03)}.form-top{display:flex;align-items:flex-end;justify-content:space-between;gap:26px;margin-bottom:25px;padding-bottom:22px;border-bottom:1px solid rgba(132,173,205,.13)}.form-top h2{font-size:27px;letter-spacing:-.025em;margin:0 0 6px}.form-top p{color:#879bb3;margin:0;font-size:13px;line-height:1.6}.form-badge{font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:900;color:#a5f3fc;border:1px solid rgba(103,232,249,.26);background:rgba(103,232,249,.055);border-radius:999px;padding:7px 10px;white-space:nowrap}
        .field-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 16px}.field{display:grid;gap:8px}.field.full{grid-column:1/-1}.field label{font-size:12px;font-weight:700;color:#a8b9cc}.optional{font-weight:500;color:#6f849b}.control{width:100%;border:1px solid rgba(126,162,194,.2);background:#0a1829;color:#eef7ff;border-radius:13px;padding:13px 14px;outline:none;font:inherit;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}.control:hover{border-color:rgba(126,190,225,.32)}.control:focus{border-color:rgba(89,230,255,.55);box-shadow:0 0 0 3px rgba(89,230,255,.08);background:#0b1b2e}.control::placeholder{color:#5f738a}.control option{background:#0a1829;color:#eef7ff}.textarea{min-height:128px;resize:vertical;line-height:1.55}
        .form-footer{display:grid;gap:16px;margin-top:22px}.consent{font-size:12px;line-height:1.65;color:#718198}.consent a{color:#a5f3fc;text-decoration:underline;text-underline-offset:3px}.alert{border-radius:12px;padding:12px 14px;font-size:13px;border:1px solid}.alert.error{color:#fda4af;background:rgba(244,63,94,.065);border-color:rgba(244,63,94,.22)}.alert.success{color:#9af0bd;background:rgba(34,197,94,.055);border-color:rgba(34,197,94,.18)}.submit{border:0;border-radius:13px;min-height:52px;padding:0 20px;background:linear-gradient(135deg,#7af0ff,#31d4ed);color:#05121f;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 12px 34px rgba(46,216,239,.14);transition:.2s ease}.submit:hover:not(:disabled){transform:translateY(-2px)}.submit:disabled{opacity:.65;cursor:wait}
        .trust-strip{margin:24px auto 72px;padding:26px 0;border-top:1px solid rgba(132,173,205,.14);border-bottom:1px solid rgba(132,173,205,.14);display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.trust-item b{display:block;color:var(--cyan);font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7px}.trust-item span{display:block;color:#8398b1;font-size:12px;line-height:1.55}
        .footer{border-top:1px solid rgba(132,173,205,.12);background:rgba(4,12,23,.42)}.footer-inner{min-height:102px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#758aa1;font-size:12px}.footer-links{display:flex;gap:20px}.footer a:hover{color:#dfefff}
        .deco{position:absolute;pointer-events:none;opacity:.1;filter:drop-shadow(0 12px 24px rgba(0,191,255,.12));z-index:0}.deco-1{width:78px;left:4%;top:24%}.deco-2{width:124px;right:3%;top:51%}.deco-3{width:52px;left:10%;top:78%}.apply-shell>header,.apply-shell>section,.apply-shell>footer{position:relative;z-index:1}
        @media(max-width:920px){.hero{grid-template-columns:1fr;gap:24px;padding-top:50px}.field-grid{grid-template-columns:1fr 1fr}.hero-note{max-width:620px}.deco{opacity:.05}}
        @media(max-width:560px){.wrap{width:calc(100% - 24px)}.header-inner{height:68px}.brand-logo{width:168px}.nav>a:not(.nav-cta){display:none}.nav-cta{font-size:12px;padding:10px 12px}.hero{padding:40px 0 20px}.hero h1{font-size:44px}.hero-copy{font-size:16px}.hero-note{padding:19px}.form-card{padding:21px 17px;border-radius:22px}.form-top{align-items:flex-start;flex-direction:column;margin-bottom:20px}.form-top h2{font-size:24px}.field-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.trust-strip{grid-template-columns:1fr;gap:18px;margin-bottom:54px}.footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;padding:26px 0}.footer-links{flex-wrap:wrap}.deco{display:none}}
      `}</style>

      <img className="deco deco-1" src="/brand/playdirective/deco-cubes.png" alt="" aria-hidden="true" />
      <img className="deco deco-2" src="/brand/playdirective/deco-cloud.png" alt="" aria-hidden="true" />
      <img className="deco deco-3" src="/brand/playdirective/deco-cubes2.png" alt="" aria-hidden="true" />

      <header className="header">
        <div className="wrap header-inner">
          <a href="/" aria-label="PlayDirective home"><img className="brand-logo" src="/brand/playdirective/logo.png" alt="PlayDirective" /></a>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/demo">Demo</a>
            <a href="/pricing">Pricing</a>
            <a className="nav-cta" href="/app/login">Pilot sign in</a>
          </nav>
        </div>
      </header>

      <section className="hero wrap">
        <div>
          <div className="eyebrow">30-day founding studio pilot</div>
          <h1>Apply for a private PlayDirective workspace.</h1>
          <p className="hero-copy">The founding pilot is free during validation. We review each application, then send approved studios a private invite by email.</p>
        </div>
        <aside className="hero-note" aria-label="Pilot application notes">
          <strong>What happens next</strong>
          <ul>
            <li>We review the studio and experience fit.</li>
            <li>Approved teams receive a private invite by email.</li>
            <li>Roblox credentials are only entered inside the private workspace.</li>
          </ul>
        </aside>
      </section>

      <section className="form-wrap wrap">
        <form className="form-card" onSubmit={submit}>
          <div className="form-top">
            <div>
              <h2>Tell us about your studio.</h2>
              <p>Required fields help us review the pilot fit. Optional details simply help us prepare a better first workspace.</p>
            </div>
            <div className="form-badge">Free · no card required</div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="contact_name">Your name</label>
              <input id="contact_name" className="control" name="contact_name" required minLength={2} maxLength={160} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="control" name="email" required type="email" maxLength={254} autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="studio_name">Studio name</label>
              <input id="studio_name" className="control" name="studio_name" required minLength={2} maxLength={160} autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="monthly_active_users">Monthly active users</label>
              <select id="monthly_active_users" className="control" name="monthly_active_users" defaultValue="">
                <option value="">Prefer not to say</option>
                <option value="pre-launch">Pre-launch</option>
                <option value="under-1k">Under 1k</option>
                <option value="1k-10k">1k–10k</option>
                <option value="10k-100k">10k–100k</option>
                <option value="100k+">100k+</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="experience_url">Roblox experience URL <span className="optional">(optional)</span></label>
              <input id="experience_url" className="control" name="experience_url" type="url" maxLength={500} placeholder="https://www.roblox.com/games/..." />
            </div>
            <div className="field">
              <label htmlFor="universe_id">Universe ID <span className="optional">(optional)</span></label>
              <input id="universe_id" className="control" name="universe_id" inputMode="numeric" pattern="[0-9]*" maxLength={64} />
            </div>
            <div className="field full">
              <label htmlFor="message">What would make the pilot useful for your team? <span className="optional">(optional)</span></label>
              <textarea id="message" className="control textarea" name="message" maxLength={3000} rows={5} placeholder="For example: improve D1 retention, find monetization friction, or prioritize the next experiment." />
            </div>
          </div>

          <div className="form-footer">
            <div className="consent">By submitting, you ask us to contact you about the PlayDirective founding pilot and confirm that you have read our <a href="/privacy">Privacy Notice</a> and <a href="/terms">Founding Pilot Terms</a>. Never send Roblox API credentials in this form.</div>
            {error && <div className="alert error" role="alert">{error}</div>}
            {status && <div className="alert success" role="status">{status}</div>}
            <button className="submit" disabled={loading}>{loading ? "Submitting…" : "Apply for founding pilot →"}</button>
          </div>
        </form>
      </section>

      <section className="wrap trust-strip" aria-label="Pilot trust information">
        <div className="trust-item"><b>Read-only</b><span>No publishing access is required for the founding workflow.</span></div>
        <div className="trust-item"><b>Private</b><span>Approved studios receive an isolated private workspace.</span></div>
        <div className="trust-item"><b>No auto-conversion</b><span>The free pilot never turns into a paid subscription automatically.</span></div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>PlayDirective · Early Access</span>
          <div className="footer-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/legal">Legal notice</a></div>
        </div>
      </footer>
    </main>
  );
}
