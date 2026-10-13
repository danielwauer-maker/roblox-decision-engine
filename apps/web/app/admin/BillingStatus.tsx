"use client";

import { useEffect, useState } from "react";

type BillingRow = {
  organization_id: number;
  organization_name: string;
  organization_slug: string;
  active: boolean;
  plan_id: string;
  status: string;
  stripe_customer_configured: boolean;
  stripe_subscription_configured: boolean;
  current_period_end?: string | null;
  cancel_at_period_end: boolean;
};

export default function BillingStatus() {
  const [rows, setRows] = useState<BillingRow[]>([]);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/billing/subscriptions", { cache: "no-store" });
      if (response.ok) setRows((await response.json()).items ?? []);
    })();
  }, []);

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "20px clamp(18px,4vw,42px) 8px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Phase 4 · billing operations</div>
      <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>Subscription status</h2>
      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {rows.map((row) => (
          <div key={row.organization_id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) .7fr .7fr auto", gap: 12, alignItems: "center", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,.02)", fontSize: 12 }}>
            <div><strong>{row.organization_name}</strong><div style={{ color: "#718198", marginTop: 3 }}>{row.organization_slug}</div></div>
            <div><span style={{ color: "#718198" }}>Plan</span><div style={{ marginTop: 3, fontWeight: 800 }}>{row.plan_id}</div></div>
            <div><span style={{ color: "#718198" }}>Status</span><div style={{ marginTop: 3, color: row.status === "active" ? "#86efac" : "#c7d5e5", fontWeight: 800 }}>{row.status}</div></div>
            <div style={{ textAlign: "right", color: "#8fa2ba" }}>{row.stripe_subscription_configured ? "Stripe linked" : row.stripe_customer_configured ? "Customer only" : "Pilot only"}{row.cancel_at_period_end ? " · cancels" : ""}</div>
          </div>
        ))}
        {!rows.length && <div style={{ color: "#718198", fontSize: 12 }}>No studio billing records loaded yet.</div>}
      </div>
    </section>
  );
}
