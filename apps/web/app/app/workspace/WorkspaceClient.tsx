"use client";

import { useEffect, useState } from "react";

type Decision = { key?: string; title?: string; recommendation?: string; priority_score?: number; evidence?: Array<{ metric?: string; current?: number; baseline?: number; unit?: string; note?: string | null; segment?: string | null }>; root_causes?: Array<{ label?: string; support?: string; confidence?: number }>; guardrail?: string };
type Analyst = { generation?: { mode?: string }; brief?: { executive_summary?: string; data_quality_note?: string; priorities?: Array<{ key?: string; headline?: string; summary?: string; why_it_matters?: string; next_action?: string; confidence?: string; guardrail?: string }> } };
type Experiment = { plan?: { title?: string; hypothesis?: string; audience?: string; control?: string; variant?: string; primary_kpi?: string; target_lift_pct?: number; minimum_sample_size?: number; runtime_days_min?: number; runtime_days_max?: number; guardrails?: Array<{ metric?: string; max_deterioration_pct?: number; rationale?: string }>; causality_note?: string } };
type Weekly = { priorities?: Decision[]; analyst?: Analyst["brief"] };
type View = "priorities" | "evidence" | "analyst" | "experiment" | "weekly";

const panel = { border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 20, background: "rgba(255,255,255,.025)" } as const;
const muted = "#9fb1c7";
const faint = "#718198";
const cyan = "#67e8f9";

function metricValue(value?: number, unit?: string) {
  if (typeof value !== "number") return "—";
  if (unit === "ratio") return `${(value * 100).toFixed(1)}%`;
  if (unit === "robux") return `R$ ${value.toLocaleString()}`;
  return value.toLocaleString();
}

export default function WorkspacePhase2A() {
  const [view, setView] = useState<View>("priorities");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [analyst, setAnalyst] = useState<Analyst | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [weekly, setWeekly] = useState<Weekly | null>(null);
  const [status, setStatus] = useState("Loading live tenant views…");

  useEffect(() => {
    void (async () => {
      const decisionResponse = await fetch("/api/pilot/decisions", { cache: "no-store" });
      if (!decisionResponse.ok) { setStatus("Connect and sync an experience to unlock the decision workflow."); return; }
      const decisionPayload = await decisionResponse.json();
      const items = decisionPayload.items ?? [];
      setDecisions(items);
      if (!items.length) { setStatus("No supported priority yet. More Roblox analytics may be needed."); return; }
      const [a, e, w] = await Promise.all([
        fetch("/api/pilot/analyst", { cache: "no-store" }),
        fetch("/api/pilot/experiment", { cache: "no-store" }),
        fetch("/api/pilot/weekly-brief", { cache: "no-store" }),
      ]);
      if (a.ok) setAnalyst(await a.json());
      if (e.ok) setExperiment(await e.json());
      if (w.ok) setWeekly(await w.json());
      setStatus("Live tenant decision workflow ready.");
    })();
  }, []);

  const tabs: Array<[View,string]> = [["priorities","Priorities"],["evidence","Evidence"],["analyst","AI Analyst"],["experiment","Experiment"],["weekly","Weekly Brief"]];

  return <section style={{ marginTop: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <div><div style={{ color: cyan, fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>Phase 2A · live customer workflow</div><h2 style={{ margin: "8px 0 0" }}>From priority to action.</h2></div>
      <div style={{ color: faint, fontSize: 12 }}>{status}</div>
    </div>
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 18 }}>{tabs.map(([id,label]) => <button key={id} onClick={() => setView(id)} style={{ background: view === id ? "rgba(103,232,249,.1)" : "transparent", color: view === id ? "#a5f3fc" : muted, border: `1px solid ${view === id ? "rgba(103,232,249,.3)" : "rgba(255,255,255,.1)"}`, borderRadius: 9, padding: "8px 11px", cursor: "pointer" }}>{label}</button>)}</div>

    {view === "priorities" && <div style={{ display: "grid", gap: 12, marginTop: 18 }}>{decisions.length ? decisions.map((d,i) => <article key={d.key ?? i} style={panel}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div style={{ color: faint, fontSize: 10, textTransform: "uppercase" }}>Priority #{i+1}</div><h3 style={{ margin: "8px 0" }}>{d.title}</h3></div><strong style={{ color: cyan }}>{typeof d.priority_score === "number" ? `${d.priority_score}/100` : ""}</strong></div><p style={{ color: muted, lineHeight: 1.6 }}>{d.recommendation}</p></article>) : <article style={panel}><h3>No priorities yet</h3><p style={{ color: muted }}>PlayDirective will not invent a recommendation when the connected experience has insufficient analytics.</p></article>}</div>}

    {view === "evidence" && <div style={{ display: "grid", gap: 12, marginTop: 18 }}>{decisions.length ? decisions.map((d,i) => <article key={d.key ?? i} style={panel}><div style={{ color: cyan, fontSize: 11, fontWeight: 800 }}>PRIORITY {i+1} EVIDENCE</div><h3>{d.title}</h3><div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>{(d.evidence ?? []).map((e,j) => <div key={j} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 14 }}><div style={{ color: faint, fontSize: 10 }}>{e.metric}</div><strong style={{ display: "block", marginTop: 7 }}>{metricValue(e.current,e.unit)} vs {metricValue(e.baseline,e.unit)}</strong><div style={{ color: muted, fontSize: 12, marginTop: 6 }}>{e.segment || e.note}</div></div>)}</div>{(d.root_causes ?? []).length > 0 && <div style={{ marginTop: 14 }}><div style={{ color: faint, fontSize: 10, textTransform: "uppercase" }}>Hypotheses</div>{d.root_causes?.map((r,j) => <p key={j} style={{ color: muted }}><strong style={{ color: "#eef7ff" }}>{r.label}</strong> — {r.support}</p>)}</div>}<p style={{ color: "#fbbf24", fontSize: 12 }}>{d.guardrail}</p></article>) : <article style={panel}><h3>No evidence bundle yet</h3></article>}</div>}

    {view === "analyst" && <div style={{ marginTop: 18 }}>{analyst?.brief ? <><article style={{ ...panel, background: "linear-gradient(135deg,rgba(103,232,249,.08),rgba(255,255,255,.02))" }}><div style={{ color: faint, fontSize: 10, textTransform: "uppercase" }}>Grounded analyst · {analyst.generation?.mode ?? "deterministic"}</div><h3 style={{ fontSize: 25 }}>{analyst.brief.executive_summary}</h3><p style={{ color: muted }}>{analyst.brief.data_quality_note}</p></article>{analyst.brief.priorities?.map((p,i) => <article key={p.key ?? i} style={{ ...panel, marginTop: 12 }}><div style={{ color: cyan, fontSize: 11 }}>Priority {i+1} · {p.confidence} confidence</div><h3>{p.headline}</h3><p style={{ color: muted }}>{p.summary}</p><p><strong>Why it matters:</strong> <span style={{ color: muted }}>{p.why_it_matters}</span></p><p><strong>Next action:</strong> {p.next_action}</p><p style={{ color: "#fbbf24", fontSize: 12 }}>{p.guardrail}</p></article>)}</> : <article style={panel}><h3>Analyst not available yet</h3><p style={{ color: muted }}>A grounded analyst brief appears after a supported tenant priority exists.</p></article>}</div>}

    {view === "experiment" && <div style={{ marginTop: 18 }}>{experiment?.plan ? <article style={panel}><div style={{ color: cyan, fontSize: 11 }}>EXPERIMENT COPILOT</div><h3 style={{ fontSize: 25 }}>{experiment.plan.title}</h3><p style={{ color: muted, lineHeight: 1.65 }}>{experiment.plan.hypothesis}</p><div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>{[["Audience",experiment.plan.audience],["Primary KPI",experiment.plan.primary_kpi],["Target",typeof experiment.plan.target_lift_pct === "number" ? `+${experiment.plan.target_lift_pct}%` : "—"],["Sample",experiment.plan.minimum_sample_size?.toLocaleString()],["Runtime",experiment.plan.runtime_days_min && experiment.plan.runtime_days_max ? `${experiment.plan.runtime_days_min}–${experiment.plan.runtime_days_max} days` : "—"]].map(([l,v]) => <div key={l} style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 12 }}><div style={{ color: faint, fontSize: 10 }}>{l}</div><strong>{v}</strong></div>)}</div><p><strong>Control:</strong> <span style={{ color: muted }}>{experiment.plan.control}</span></p><p><strong>Variant:</strong> <span style={{ color: muted }}>{experiment.plan.variant}</span></p>{experiment.plan.guardrails?.map((g,i) => <p key={i} style={{ color: muted }}><strong style={{ color: "#eef7ff" }}>{g.metric}</strong> · max −{g.max_deterioration_pct}% · {g.rationale}</p>)}<p style={{ color: "#fbbf24", fontSize: 12 }}>{experiment.plan.causality_note}</p></article> : <article style={panel}><h3>No experiment plan yet</h3></article>}</div>}

    {view === "weekly" && <div style={{ marginTop: 18 }}>{weekly ? <><article style={{ ...panel, background: "linear-gradient(135deg,rgba(103,232,249,.07),rgba(255,255,255,.02))" }}><div style={{ color: cyan, fontSize: 11 }}>WEEKLY BRIEF · LIVE TENANT DATA</div><h3 style={{ fontSize: 25 }}>{weekly.analyst?.executive_summary ?? "Weekly decision review"}</h3><p style={{ color: muted }}>{weekly.analyst?.data_quality_note}</p></article><article style={{ ...panel, marginTop: 12 }}>{weekly.priorities?.slice(0,3).map((p,i) => <div key={p.key ?? i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}><strong>#{i+1} {p.title}</strong><div style={{ color: muted, marginTop: 5 }}>{p.recommendation}</div></div>)}</article></> : <article style={panel}><h3>Weekly Brief not available yet</h3><p style={{ color: muted }}>It becomes available once the studio has supported priorities.</p></article>}</div>}
  </section>;
}
