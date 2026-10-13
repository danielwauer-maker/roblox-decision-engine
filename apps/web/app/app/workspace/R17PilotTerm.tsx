"use client";

import { useEffect, useState } from "react";

type PilotTerm = {
  status: string;
  started_at: string;
  ends_at: string;
  current_day: number;
  days_remaining: number;
  converted_at?: string | null;
};

export default function R17PilotTerm() {
  const [pilot, setPilot] = useState<PilotTerm | null>(null);

  useEffect(() => {
    void fetch("/api/pilot/r17", { cache: "no-store" })
      .then(async (response) => response.ok ? setPilot(await response.json()) : null);
  }, []);

  if (!pilot) return null;
  const expired = pilot.status === "EXPIRED";
  const converted = pilot.status === "CONVERTED";

  return (
    <section style={{ marginTop: 18, border: `1px solid ${expired ? "rgba(251,191,36,.28)" : "rgba(103,232,249,.22)"}`, borderRadius: 20, padding: 18, background: expired ? "rgba(251,191,36,.035)" : "rgba(103,232,249,.035)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: expired ? "#fbbf24" : "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>30-day founding studio pilot</div>
          <div style={{ marginTop: 7, fontSize: 22, fontWeight: 900 }}>{converted ? "Converted to paid" : expired ? "Pilot complete" : `Day ${pilot.current_day} of 30`}</div>
          <div style={{ marginTop: 5, color: "#9fb1c7", fontSize: 13 }}>{expired ? "Choose a paid plan only if PlayDirective has earned its place in your workflow." : `${pilot.days_remaining} day${pilot.days_remaining === 1 ? "" : "s"} remaining · ends ${new Date(pilot.ends_at).toLocaleDateString()}`}</div>
        </div>
        {!converted && <a href="/pricing" style={{ color: "#a5f3fc", border: "1px solid rgba(103,232,249,.22)", borderRadius: 10, padding: "10px 12px", textDecoration: "none", fontSize: 12, fontWeight: 800 }}>Review plans</a>}
      </div>
    </section>
  );
}
