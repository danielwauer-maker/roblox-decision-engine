"use client";

import catalog from "../../../../shared/commercial_plans.json";

import { FormEvent, useEffect, useRef, useState } from "react";
import R17PilotTerm from "./R17PilotTerm";

type ProgressStep = { key: string; label: string; status: string; detail: string; next_action?: string | null };
type ProgressPayload = { steps?: ProgressStep[]; next?: ProgressStep | null; summary?: { observation_count?: number; priority_count?: number; feedback_count?: number } };
type BillingPayload = { plan_id?: string; status?: string; last_invoice_status?: string | null; customer_type?: "personal" | "business" | null; company_name?: string | null; billing_country?: string | null; vat_id_last4?: string | null; vat_verification_status?: string | null; current_price_usd?: number; has_stripe_subscription?: boolean; cancel_at_period_end?: boolean; current_period_end?: string | null; billing_grace_ends_at?: string | null; stripe_configured?: boolean; portal_available?: boolean; is_owner?: boolean; trial_checkout_required?: boolean; pending_plan_id?: string | null; pending_plan_effective_at?: string | null; pending_plan_change_type?: string | null; pending_plan_overage?: { experiences: number; seats: number } | null; history_days?: number; credit_usage?: { used: number; allowance: number }; experience_usage?: { used: number; limit: number }; seat_usage?: { used: number; limit: number }; entitlements?: { paid?: boolean; experience_limit?: number }; current_plan?: { monthly_price_usd: number; max_experiences: number; max_team_members: number; history_days: number; monthly_decision_credits: number } };
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

function vatStatusMessage(status?: string | null) {
  switch (status) {
    case "verified": return "Stripe verified this VAT ID. Checkout is available; tax treatment is confirmed on the invoice, not inferred here.";
    case "pending": return "Stripe is validating this VAT ID. Business Checkout is paused until verification completes.";
    case "unverified": return "Stripe could not verify this VAT ID. Check the country and number, then save the corrected details.";
    case "unavailable": return "Stripe could not validate this VAT ID right now. Review or replace it and retry; Checkout remains paused.";
    default: return "Add a valid EU VAT ID. Business Checkout stays paused until Stripe verifies it.";
  }
}

export default function R16Panel() {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [billing, setBilling] = useState<BillingPayload | null>(null);
  const [preferences, setPreferences] = useState<PreferencePayload>({ lifecycle_email_enabled: true });
  const [billingMessage, setBillingMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showBillingProfile, setShowBillingProfile] = useState(false);
  const [milestoneBusy, setMilestoneBusy] = useState<string | null>(null);
  const trialCheckoutStarted = useRef(false);

  async function load() {
    const [progressResponse, billingResponse, preferenceResponse] = await Promise.all([
      fetch("/api/pilot/progress", { cache: "no-store" }),
      fetch("/api/pilot/billing/status", { cache: "no-store" }),
      fetch("/api/pilot/preferences", { cache: "no-store" }),
    ]);
    if (progressResponse.ok) setProgress(await progressResponse.json());
    if (billingResponse.ok) {
      const payload: BillingPayload = await billingResponse.json();
      setBilling(payload);
      if (payload.trial_checkout_required && payload.customer_type && (payload.customer_type === "personal" || payload.vat_verification_status === "verified") && !trialCheckoutStarted.current) {
        trialCheckoutStarted.current = true;
        void checkout("indie", true);
      }
    }
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

  async function checkout(planId: "indie" | "growth" | "studio", trial = false) {
    setBusy(true);
    setBillingMessage("");
    const response = await fetch("/api/pilot/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId, trial }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.checkout_url) {
      setBillingMessage(payload.detail ?? "Stripe Checkout is not configured yet.");
      setBusy(false);
      return;
    }
    window.location.href = payload.checkout_url;
  }

  async function saveBillingProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setBillingMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/pilot/billing/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_type: String(form.get("customer_type")),
        company_name: String(form.get("company_name") || "").trim() || null,
        billing_country: String(form.get("billing_country") || "").toUpperCase(),
        vat_id: String(form.get("vat_id") || "").trim() || null,
        confirm_type_change: form.get("confirm_type_change") === "on",
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setBillingMessage(payload.detail ?? "Billing profile could not be saved.");
      setBusy(false);
      return;
    }
    setBilling((current) => current ? { ...current, ...payload } : current);
    setShowBillingProfile(false);
    setBillingMessage(payload.tax_id_verification_status === "pending" ? "VAT ID saved. Checkout is paused while Stripe verifies it." : "Billing profile saved.");
    await load();
    setBusy(false);
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

  async function postBillingAction(path: string, body?: object) {
    setBusy(true);
    setBillingMessage("");
    const response = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) setBillingMessage(payload.detail ?? "Billing change could not be completed.");
    else {
      setBillingMessage(payload.status === "awaiting_billing_confirmation" ? "Upgrade submitted. Your current access stays in place until Stripe confirms payment." : "Billing updated.");
      await load();
    }
    setBusy(false);
  }

  async function changePlan(planId: "indie" | "growth" | "studio") {
    await postBillingAction("/api/pilot/billing/plan-change", { plan_id: planId, request_key: crypto.randomUUID() });
  }

  const planPrices = Object.fromEntries(catalog.plans.map(plan => [plan.plan_id, plan.monthly_price_usd])) as Record<string, number>;
  const canStartCheckout = billing?.customer_type === "personal" || (billing?.customer_type === "business" && billing.vat_verification_status === "verified");

  return (
    <>
      <R17PilotTerm />
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
          <h2 style={{ margin: "8px 0 5px" }}>{billing?.plan_id === "pilot" || !billing?.plan_id ? "Founding pilot" : billing?.status === "trial_signup_pending" ? "Indie trial setup" : billing?.plan_id === "expired" ? "Inactive" : `${billing.plan_id[0].toUpperCase()}${billing.plan_id.slice(1)} plan`}</h2>
          <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6, fontSize: 13 }}>{billing?.plan_id === "pilot" || !billing?.plan_id ? "Founding Pilot access costs $0 and ends after 30 days. It does not auto-convert; choose a paid plan when you are ready." : "Paid access follows your monthly Stripe subscription. Your workspace and data remain available if billing needs attention."}</p>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.08)", background: "rgba(7,16,31,.35)" }}>
            <div style={{ color: "#718198", fontSize: 10, textTransform: "uppercase" }}>Current state</div>
            <strong style={{ display: "block", marginTop: 6 }}>{billing?.status ?? "pilot"}</strong>
            {billing?.current_price_usd ? <div style={{ marginTop: 5, color: "#8095ae", fontSize: 12 }}>${billing.current_price_usd}/month · USD</div> : null}
            {billing?.customer_type && <div style={{ marginTop: 5, color: "#8095ae", fontSize: 12 }}>Account type: {billing.customer_type === "business" ? "Business" : "Individual"}{billing.customer_type === "business" && billing.company_name ? ` · ${billing.company_name}` : ""}</div>}
            {billing?.customer_type === "business" && <div style={{ marginTop: 4, color: "#8095ae", fontSize: 12 }}>VAT ID: {billing.vat_id_last4 ? `•••• ${billing.vat_id_last4}` : "not saved"} · {billing.vat_verification_status ?? "pending"}<div style={{ marginTop: 4 }}>{vatStatusMessage(billing.vat_verification_status)}</div></div>}
            {billing?.current_period_end && <div style={{ marginTop: 5, color: "#8095ae", fontSize: 12 }}>Current period ends {new Date(billing.current_period_end).toLocaleDateString()}</div>}
            {billing?.cancel_at_period_end && <div style={{ marginTop: 5, color: "#fde047", fontSize: 12 }}>Cancellation scheduled for period end.</div>}
            {billing?.status === "past_due" && <div style={{ marginTop: 8, color: "#fbbf24", fontSize: 12 }}>Payment failed. Update your payment method by {billing.billing_grace_ends_at ? new Date(billing.billing_grace_ends_at).toLocaleDateString() : "the end of the 7-day grace period"} to keep paid access.</div>}
            {billing?.last_invoice_status === "payment_action_required" && <div style={{ marginTop: 8, color: "#fde047", fontSize: 12 }}>Your payment needs authentication. Open billing management to complete the required action.</div>}
            {billing?.pending_plan_id && <div style={{ marginTop: 8, color: "#a5f3fc", fontSize: 12 }}>{billing.pending_plan_change_type === "downgrade" ? `Scheduled downgrade to ${billing.pending_plan_id} on ${billing.pending_plan_effective_at ? new Date(billing.pending_plan_effective_at).toLocaleDateString() : "period end"}.` : `Upgrade to ${billing.pending_plan_id} is awaiting Stripe payment confirmation.`}</div>}
            {(billing?.pending_plan_overage?.experiences || billing?.pending_plan_overage?.seats) ? <div style={{ marginTop: 8, color: "#fde047", fontSize: 12 }}>Resolve {billing.pending_plan_overage.experiences} Experience and {billing.pending_plan_overage.seats} seat overages before the downgrade takes effect. PlayDirective will preserve your Experience data and memberships.</div> : null}
            {billing?.status && ["unpaid", "incomplete", "incomplete_expired", "paused", "canceled"].includes(billing.status) && <div style={{ marginTop: 8, color: "#fbbf24", fontSize: 12 }}>Paid access is inactive. Your account and data are preserved; use billing management to resolve or reactivate the subscription.</div>}
          </div>
          {billing?.is_owner && (!billing.customer_type || showBillingProfile) && <form onSubmit={saveBillingProfile} style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <strong style={{ color: "#dbeafe", fontSize: 12 }}>{billing.customer_type ? "Update billing profile" : "Set up billing profile"}</strong>
            <select name="customer_type" defaultValue={billing.customer_type ?? "personal"} style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, padding: 9 }}><option value="personal">Individual</option><option value="business">Business</option></select>
            <input name="company_name" defaultValue={billing.company_name ?? ""} placeholder="Company name (required for business)" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, padding: 9 }} />
            <input name="billing_country" defaultValue={billing.billing_country ?? ""} placeholder="Billing country (ISO code, e.g. DE)" maxLength={2} required style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, padding: 9 }} />
            <input name="vat_id" placeholder="EU VAT ID (business only)" style={{ background: "#0b1728", color: "#eef7ff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9, padding: 9 }} />
            {billing.customer_type && <label style={{ display: "flex", gap: 7, color: "#fde047", fontSize: 11 }}><input name="confirm_type_change" type="checkbox" />Confirm a billing type or VAT ID change</label>}
            <button disabled={busy} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 9, padding: 9, fontWeight: 800 }}>Save billing profile</button>
            {billing.customer_type && <button type="button" onClick={() => setShowBillingProfile(false)} style={{ background: "transparent", color: "#9fb1c7", border: 0 }}>Close</button>}
          </form>}
          {billing?.is_owner && billing.customer_type && !showBillingProfile && <button onClick={() => setShowBillingProfile(true)} style={{ marginTop: 10, background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.22)", borderRadius: 9, padding: "8px 10px", fontWeight: 700 }}>Update billing profile</button>}
          {billing?.is_owner && !billing?.entitlements?.paid && !billing?.has_stripe_subscription && <div style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "repeat(3,1fr)" }}>
            {catalog.plans.map((plan) => <button key={plan.plan_id} disabled={busy || !billing?.stripe_configured || !canStartCheckout} onClick={() => checkout(plan.plan_id as "indie" | "growth" | "studio")} style={{ background: plan.recommended ? "#67e8f9" : "transparent", color: plan.recommended ? "#07101f" : "#eef7ff", border: plan.recommended ? "none" : "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: "10px 8px", fontWeight: 800, fontSize: 12, cursor: billing?.stripe_configured && canStartCheckout ? "pointer" : "not-allowed", opacity: billing?.stripe_configured && canStartCheckout ? 1 : .55 }}>${plan.monthly_price_usd} {plan.display_name}</button>)}
          </div>}
          {billing?.customer_type === "business" && billing.vat_verification_status !== "verified" && <div style={{ marginTop: 8, color: "#fde047", fontSize: 11 }}>{vatStatusMessage(billing.vat_verification_status)}</div>}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8, color: "#9fb1c7", fontSize: 11 }}>
            <div>{billing?.experience_usage?.used ?? 0} / {billing?.experience_usage?.limit ?? 0} Experiences</div>
            <div>{billing?.seat_usage?.used ?? 0} / {billing?.seat_usage?.limit ?? 0} seats</div>
            <div>{billing?.credit_usage?.used ?? 0} / {billing?.credit_usage?.allowance ?? 0} Decisions</div>
            <div>{billing?.history_days ?? 0} days history</div>
          </div>
          {billing?.is_owner && billing?.entitlements?.paid && !billing.pending_plan_id && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {catalog.plans.filter(plan => planPrices[plan.plan_id] > (billing.current_price_usd ?? 0)).map(plan => <button key={plan.plan_id} disabled={busy || !billing.stripe_configured} onClick={() => void changePlan(plan.plan_id as "indie" | "growth" | "studio")} style={{ background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Upgrade to {plan.display_name}</button>)}
            {catalog.plans.filter(plan => planPrices[plan.plan_id] < (billing.current_price_usd ?? 0)).map(plan => <button key={plan.plan_id} disabled={busy || !billing.stripe_configured} onClick={() => void changePlan(plan.plan_id as "indie" | "growth" | "studio")} style={{ background: "transparent", color: "#eef7ff", border: "1px solid rgba(255,255,255,.15)", borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Schedule {plan.display_name}</button>)}
            {!billing.cancel_at_period_end && <button disabled={busy || !billing.stripe_configured} onClick={() => void postBillingAction("/api/pilot/billing/cancel", { request_key: crypto.randomUUID() })} style={{ background: "transparent", color: "#fda4af", border: "1px solid rgba(253,164,175,.3)", borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Cancel at period end</button>}
          </div>}
          {billing?.is_owner && billing.pending_plan_change_type === "downgrade" && <button disabled={busy} onClick={() => void postBillingAction("/api/pilot/billing/plan-change/cancel")} style={{ marginTop: 10, background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.22)", borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Cancel scheduled downgrade</button>}
          {billing?.is_owner && billing.cancel_at_period_end && <button disabled={busy || !billing.stripe_configured} onClick={() => void postBillingAction("/api/pilot/billing/reactivate", { request_key: crypto.randomUUID() })} style={{ marginTop: 10, background: "transparent", color: "#86efac", border: "1px solid rgba(134,239,172,.3)", borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Reactivate subscription</button>}
          {billing?.status && ["incomplete_expired", "canceled"].includes(billing.status) && billing?.is_owner && <button disabled={busy || !billing.stripe_configured} onClick={() => void checkout("indie")} style={{ marginTop: 10, background: "#67e8f9", color: "#07101f", border: 0, borderRadius: 9, padding: "9px 11px", fontWeight: 800 }}>Reactivate with Indie</button>}
          {billing?.is_owner && billing?.portal_available && <button disabled={busy} onClick={portal} style={{ width: "100%", marginTop: 10, background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.22)", borderRadius: 10, padding: "10px 12px", fontWeight: 800 }}>Manage payment, invoices and cancellation</button>}
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
    </>
  );
}
