"use client";

import { FormEvent, useEffect, useState } from "react";

type ProgressStep = { key: string; label: string; status: string; detail: string; next_action?: string | null };
type ProgressPayload = { steps?: ProgressStep[]; next?: ProgressStep | null; summary?: { observation_count?: number; priority_count?: number; feedback_count?: number } };
type BillingPayload = { plan_id?: string; status?: string; cancel_at_period_end?: boolean; current_period_end?: string | null; stripe_configured?: boolean; entitlements?: { paid?: boolean; experience_limit?: number } };
type PreferencePayload = { lifecycle_email_enabled?: boolean };

const panel = { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,.025)" } as const;

function statusColor(status: string) {
  if (status === "COMPLETED") return "#86efac";
  if (status === "READY") return "#67e8f9";
  if (status === "WAITING_FOR_DATA") return "#fde047";
  return "#718198";
}

function milestoneFor(stepKey: string) {
  if (stepKey === "priority") return "priority_reviewed";
  if (stepKey === "experiment") return "experiment_reviewed";
  if (stepKey === "weekly") return "weekly_reviewed";
  return null;
}

export default function R16Panel() {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [billing, setBilling] = useState<BillingPayload | null>(null);
  const [preferences, setPreferences] = useState<PreferencePayload>({ lifecycle_email_enabled: true });
  const [billingMessage, setBillingMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [milestoneBusy, setMilestoneBusy] = useState<string | null>(null);

  async function load() {
    const [progressResponse, billingResponse, preferenceResponse] = await Promise.all([
      fetch("/api/pilot/progress", { cache: "no-store" }),
      fetch("/api/pilot/billing/status", { cache: "no-store" }),
      fetch("/api/pilot/preferences", { cache: "no-store" }),
    ]);
    if (progressResponse.ok) setProgress(await progressResponse.json());
    if (billingResponse.ok) setBilling(await billingResponse.json());
    if (preferenceResponse.ok) setPreferences(await preferenceResponse.json());
  }

  useEffect(() => { void load(); }, []);

  async function completeMilestone(stepKey: string) {
    const milestone = milestoneFor(stepKey);
    if (!milestone) return;
    setMilestoneBusy(stepKey);
    const response = await fetch(`/api/pilot/progress/milestones/${milestone}`, { method: "POST" });
    if (response.ok) await load();
    setMilestoneBusy(null);
  }

  async function updateLifecyclePreference(enabled: boolean) {
    setPreferences({ lifecycle_email_enabled: enabled });
    const response = await fetch("/api/pilot/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifecycle_email_enabled: enabled }),
    });
    if (!response.ok) setPreferences({ lifecycle_email_enabled: !enabled });
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/pilot/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: String(form.get("category") || "other"),
        message: String(form.get("message") || "").trim(),
        usefulness_score: Number(form.get("usefulness_score") || 0) || null,
      }),
    });
    if (response.ok) {
      event.currentTarget.reset();
      setFeedbackMessage("Thanks — your feedback was recorded for this studio.");
      await load();
    } else {
      setFeedbackMessage("Feedback could not be saved yet.");
    }
  }

  async function checkout(planId: "indie" | "growth" | "studio") {
    setBusy(true);
    setBillingMessage("");
    const response = await fetch("/api/pilot/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.checkout_url) {
      setBillingMessage(payload.detail ?? "Stripe Checkout is not configured yet.");
      setBusy(false);
      return;
    }
    window.location.href = payload.checkout_url;
  }

  async function portal() {
    setBusy(true);
    setBillingMessage("");
    const response = await fetch("/api/pilot/billing/portal", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.portal_url) {
      setBillingMessage(payload.detail ?? "Customer Portal is not available yet.");
      setBusy(false);
      return;
    }
    window.location.href = payload.portal_url;
  }

  return (
    <section style={{ marginTop: 24, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
      <article style={panel}>
        <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Pilot progress</div>
        <h2 style={{ margin: "8px 0 5px" }}>Your path to first value.</h2>
        <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6, fontSize: 13 }}>Progress comes from real tenant data plus the moments you confirm you have reviewed.</p>
        <div style={{ marginTop: 16 }}>
          {(progress?.steps ?? []).map((step, index) => {
            const milestone = milestoneFor(step.key);
            return (
              <div key={step.key} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 10, padding: "12px 0", borderTop: index ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, border: `1px solid ${statusColor(step.status)}`, color: statusColor(step.status), display: "grid", placeItems: "center", fontSize: 10, fontWeight: 900 }}>{step.status === "COMPLETED" ? "✓" : index + 1}</div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><strong>{step.label}</strong><span style={{ color: statusColor(step.status), fontSize: 10, fontWeight: 800 }}>{step.status.replaceAll("_", " ")}</span></div>
                  <div style={{ marginTop: 5, color: "#8095ae", fontSize: 12, lineHeight: 1.5 }}>{step.detail}</div>
                  {step.next_action && <div style={{ marginTop: 5, color: "#a5f3fc", fontSize: 11 }}>{step.next_action}</div>}
                  {milestone && step.status === "READY" && <button disabled={milestoneBusy !== null} onClick={() => completeMilestone(step.key)} style={{ marginTop: 8, background: "transparent", border: "1px solid rgba(103,232,249,.24)", color: "#a5f3fc", borderRadius: 8, padding: "7px 9px", fontSize: 11, fontWeight: 800 }}>{milestoneBusy === step.key ? "Saving…" : "Mark reviewed"}</button>}
                </div>
              </div>
            );
          })}
          {!progress && <div style={{ color: "#718198", fontSize: 13 }}>Loading progress…</div>}
        </div>
      </article>

      <article style={panel}>
        <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Plan & billing</div>
        <h2 style={{ margin: "8px 0 5px" }}>{billing?.plan_id === "pilot" || !billing?.plan_id ? "Founding pilot" : `${billing.plan_id[0].toUpperCase()}${billing.plan_id.slice(1)} plan`}</h2>
        <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6, fontSize: 13 }}>Pilot access stays free. Paid plans only begin after explicit checkout confirmation.</p>
        <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.08)", background: "rgba(7,16,31,.35)" }}>
          <div style={{ color: "#718198", fontSize: 10, textTransform: "uppercase" }}>Current state</div>
          <strong style={{ display: "block", marginTop: 6 }}>{billing?.status ?? "pilot"}</strong>
          {billing?.current_period_end && <div style={{ marginTop: 5, color: "#8095ae", fontSize: 12 }}>Current period ends {new Date(billing.current_period_end).toLocaleDateString()}</div>}
          {billing?.cancel_at_period_end && <div style={{ marginTop: 5, color: "#fde047", fontSize: 12 }}>Cancellation scheduled for period end.</div>}
        </div>
        <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "repeat(3,1fr)" }}>
          {(["indie", "growth", "studio"] as const).map((plan) => <button key={plan} disabled={busy || !billing?.stripe_configured} onClick={() => checkout(plan)} style={{ background: plan === "indie" ? "#67e8f9" : "transparent", color: plan === "indie" ? "#07101f" : "#eef7ff", border: plan === "indie" ? "none" : "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: "10px 8px", fontWeight: 800, fontSize: 12, cursor: billing?.stripe_configured ? "pointer" : "not-allowed", opacity: billing?.stripe_configured ? 1 : .55 }}>{plan === "indie" ? "$19 Indie" : plan === "growth" ? "$49 Growth" : "$99 Studio"}</button>)}
        </div>
        {billing?.entitlements?.paid && <button disabled={busy} onClick={portal} style={{ width: "100%", marginTop: 10, background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.22)", borderRadius: 10, padding: "10px 12px", fontWeight: 800 }}>Manage subscription</button>}
        {!billing?.stripe_configured && <p style={{ color: "#718198", fontSize: 11, lineHeight: 1.5 }}>Stripe test mode is prepared but not active until server-side test keys and Price IDs are configured.</p>}
        {billingMessage && <p style={{ color: "#fde047", fontSize: 12 }}>{billingMessage}</p>}

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", color: "#c7d5e5", fontSize: 12 }}>
            <input type="checkbox" checked={preferences.lifecycle_email_enabled !== false} onChange={(event) => void updateLifecyclePreference(event.target.checked)} />
            Email me Weekly Brief and experiment-ready updates
          </label>
          <div style={{ marginTop: 6, color: "#718198", fontSize: 10, lineHeight: 1.5 }}>Essential sign-in, invitation and connection-attention emails remain transactional.</div>
        </div>
      </article>

      <article style={panel}>
        <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Pilot feedback</div>
        <h2 style={{ margin: "8px 0 5px" }}>Was this useful?</h2>
        <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6, fontSize: 13 }}>Your feedback is stored only with this studio and helps us improve the founding pilot.</p>
        <form onSubmit={submitFeedback} style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <select name="category" defaultValue="priority" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10 }}><option value="priority">Priorities & evidence</option><option value="analyst">AI Analyst</option><option value="experiment">Experiment</option><option value="weekly_brief">Weekly Brief</option><option value="onboarding">Onboarding</option><option value="other">Other</option></select>
          <select name="usefulness_score" defaultValue="5" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10 }}><option value="5">5 — very useful</option><option value="4">4 — useful</option><option value="3">3 — mixed</option><option value="2">2 — not very useful</option><option value="1">1 — not useful</option></select>
          <textarea name="message" required minLength={3} maxLength={2000} rows={4} placeholder="What helped, what was confusing, or what should PlayDirective do next?" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10, resize: "vertical" }} />
          <button style={{ background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.24)", borderRadius: 10, padding: "10px 12px", fontWeight: 800 }}>Send feedback</button>
          {feedbackMessage && <div style={{ color: feedbackMessage.startsWith("Thanks") ? "#86efac" : "#fde047", fontSize: 11 }}>{feedbackMessage}</div>}
        </form>
      </article>
    </section>
  );
}
