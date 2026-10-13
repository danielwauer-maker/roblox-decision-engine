"use client";

import { useEffect, useState } from "react";

type Pilot = {
  organization_id: number;
  organization_name: string;
  active: boolean;
  pilot?: { status: string; current_day: number; days_remaining: number; ends_at: string } | null;
  plan_id: string;
  billing_status: string;
  pipeline_status?: string | null;
};

export default function R17PilotOps() {
  const [items, setItems] = useState<Pilot[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | "lifecycle" | null>(null);

  async function load() {
    const response = await fetch("/api/admin/r17/pilots", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).items ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function extend(id: number) {
    setBusy(id);
    const response = await fetch(`/api/admin/r17/pilots/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 7 }),
    });
    setMessage(response.ok ? "Pilot extended by 7 days." : "Pilot extension failed.");
    await load();
    setBusy(null);
  }

  async function runLifecycle() {
    setBusy("lifecycle");
    const response = await fetch("/api/admin/r17/lifecycle/run", { method: "POST" });
    setMessage(response.ok ? "R17 pilot lifecycle completed." : "R17 pilot lifecycle failed.");
    await load();
    setBusy(null);
  }

  return (
    <section style={{ maxWidth: 1440, margin: "0 auto", padding: "18px clamp(18px,4vw,42px) 8px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>R17 · commercial operations</div>
          <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>30-day pilot control</h2>
        </div>
        <button disabled={busy !== null} onClick={runLifecycle} style={{ background: "transparent", border: "1px solid rgba(103,232,249,.28)", color: "#a5f3fc", borderRadius: 10, padding: "10px 13px", fontWeight: 800 }}>{busy === "lifecycle" ? "Running…" : "Run R17 lifecycle"}</button>
      </div>
      {message && <div style={{ marginTop: 12, color: "#fde047", fontSize: 12 }}>{message}</div>}
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {items.map((item) => <article key={item.organization_id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 14, border: "1px solid rgba(255,255,255,.09)", borderRadius: 16, padding: 16, background: "rgba(255,255,255,.02)" }}>
          <div>
            <strong>{item.organization_name}</strong>
            <div style={{ marginTop: 5, color: "#8fa2ba", fontSize: 12 }}>{item.pipeline_status || "—"} · {item.plan_id} / {item.billing_status}</div>
            <div style={{ marginTop: 5, color: item.pilot?.status === "EXPIRED" ? "#fbbf24" : "#67e8f9", fontSize: 12 }}>{item.pilot ? `${item.pilot.status} · Day ${item.pilot.current_day}/30 · ${item.pilot.days_remaining} days remaining` : "Pilot not activated yet"}</div>
          </div>
          {item.pilot && item.pilot.status !== "CONVERTED" && <button disabled={busy !== null} onClick={() => extend(item.organization_id)} style={{ background: "transparent", color: "#a5f3fc", border: "1px solid rgba(103,232,249,.2)", borderRadius: 9, padding: "8px 10px", fontWeight: 800, fontSize: 11 }}>{busy === item.organization_id ? "Extending…" : "+7 days"}</button>}
        </article>)}
        {!items.length && <div style={{ color: "#718198", fontSize: 12 }}>No pilot organizations yet.</div>}
      </div>
    </section>
  );
}
