"use client";

import { useState } from "react";

type SeededStudio = {
  organization_id: number;
  name: string;
  slug: string;
  data_mode: string;
  universe_id: string;
  experience_name: string;
  observations: number;
};

export default function SimulationSeeder() {
  const [status, setStatus] = useState("");
  const [studios, setStudios] = useState<SeededStudio[]>([]);

  async function seed() {
    if (!window.confirm("Create or refresh the two explicitly SIMULATED pilot studios?")) return;
    setStatus("Generating 90-day simulation…");
    const response = await fetch("/api/admin/simulation", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload.detail ?? "Simulation could not be created.");
      return;
    }
    setStudios(payload.studios ?? []);
    setStatus("Simulation ready. Refresh the operator console below to inspect decisions and data flow.");
  }

  return (
    <section style={{ marginTop: 24, border: "1px solid rgba(251,191,36,.2)", background: "rgba(251,191,36,.04)", borderRadius: 18, padding: 18 }}>
      <div style={{ color: "#fcd34d", fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Acceptance Environment · Simulated Data</div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: 17 }}>NovaQuest + Tycoon Forge</strong>
          <div style={{ marginTop: 4, color: "#8ca0b7", fontSize: 12, lineHeight: 1.5 }}>Creates two isolated 90-day studio histories with known retention and monetization signals. No Roblox credentials are used.</div>
        </div>
        <button onClick={() => void seed()} style={{ border: "1px solid rgba(252,211,77,.3)", background: "rgba(252,211,77,.1)", color: "#fde68a", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700 }}>Seed / refresh simulations</button>
      </div>
      {status && <div style={{ marginTop: 12, color: "#cbd5e1", fontSize: 12 }}>{status}</div>}
      {studios.length > 0 && (
        <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
          {studios.map((studio) => (
            <div key={studio.organization_id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 10px", borderRadius: 9, background: "rgba(255,255,255,.025)", fontSize: 11 }}>
              <span><strong>{studio.name}</strong> · {studio.experience_name} · Universe {studio.universe_id}</span>
              <span style={{ color: "#fcd34d" }}>{studio.data_mode} · {studio.observations} rows</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
