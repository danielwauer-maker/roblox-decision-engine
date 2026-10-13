"use client";

import { useEffect, useState } from "react";

type ProgressStep = { key: string; label: string; status: string; detail: string; next_action?: string | null };
type ProgressPayload = { steps?: ProgressStep[]; next?: ProgressStep | null; summary?: { observation_count?: number; priority_count?: number } };
type BillingPayload = { plan_id?: string; status?: string; cancel_at_period_end?: boolean; current_period_end?: string | null; stripe_configured?: boolean; entitlements?: { paid?: boolean; experience_limit?: number } };

const panel = { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,.025)" } as const;

function statusColor(status: string) {
  if (status === "COMPLETED") return "#86efac";
  if (status === "READY") return "#67e8f9";
  if (status === "WAITING_FOR_DATA") return "#fde047";
  return "#718198";
}

export default function R16Panel() {
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [billing, setBilling] = useState<BillingPayload | null>(null);
  const [billingMessage, setBillingMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [progressResponse, billingResponse] = await Promise.all([
      fetch("/api/pilot/progress", { cache: "no-store" }),
      fetch("/api/pilot/billing/status", { cache: "no-store" }),
    ]);
    if (progressResponse.ok) setProgress(await progressResponse.json());
    if (billingResponse.ok) setBilling(await billingResponse.json());
  }

  useEffect(() => { void load(); }, []);

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
        <p style={{ margin: 0, color: "#9fb1c7", lineHeight: 1.6, fontSize: 13 }}>This progress is calculated from your real workspace state — not from static demo badges.</p>
        <div style={{ marginTop: 16 }}>
          {(progress?.steps ?? []).map((step, index) => (
            <div key={step.key} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 10, padding: "12px 0", borderTop: index ? "1px solid rgba(255,255,255,.07)" : "none" }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, border: `1px solid ${statusColor(step.status)}`, color: statusColor(step.status), display: "grid", placeItems: "center", fontSize: 10, fontWeight: 900 }}>{step.status === "COMPLETED" ? "✓" : index + 1}</div>
              <div><div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><strong>{step.label}</strong><span style={{ color: statusColor(step.status), fontSize: 10, fontWeight: 800 }}>{step.status.replaceAll("_", " ")}</span></div><div style={{ marginTop: 5, color: "#8095ae", fontSize: 12, lineHeight: 1.5 }}>{step.detail}</div>{step.next_action && <div style={{ marginTop: 5, color: "#a5f3fc", fontSize: 11 }}>{step.next_action}</div>}</div>
            </div>
          ))}
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
      </article>
    </section>
  );
}
