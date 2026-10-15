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

function EmptyWorkflow({ connectionId }: { connectionId: number | null }) {
  const cards = connectionId
    ? [
        ["1", "Collect enough signal", "PlayDirective waits until the selected experience has enough recent analytics to support a recommendation."],
        ["2", "Compare against evidence", "Retention, monetization and funnel changes are checked against baselines and relevant segments."],
        ["3", "Unlock the decision queue", "As soon as a threshold is supported, the first priority appears here with evidence and a next action."],
      ]
    : [
        ["1", "Choose an experience", "Select an active, entitled Roblox experience from the workspace switcher."],
        ["2", "Sync recent analytics", "Run a 30-day sync so PlayDirective can evaluate current signals and baselines."],
        ["3", "Return to the workflow", "Supported priorities will appear here automatically once enough evidence exists."],
      ];

  return (
    <div style={{ marginTop: 18, border: "1px solid rgba(103,232,249,.16)", borderRadius: 22, background: "linear-gradient(135deg,rgba(103,232,249,.055),rgba(255,255,255,.018))", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(260px,.7fr)", gap: 22, alignItems: "start" }}>
        <div>
          <div style={{ color: cyan, fontSize: 10, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase" }}>Evidence gate</div>
          <h3 style={{ margin: "8px 0 0", fontSize: 26, letterSpacing: "-.025em" }}>{connectionId ? "No supported priority yet." : "Select an experience to begin."}</h3>
          <p style={{ margin: "10px 0 0", color: muted, lineHeight: 1.7, maxWidth: 720 }}>
            {connectionId
              ? "PlayDirective deliberately stays quiet when the evidence is not strong enough. This protects your team from acting on weak or noisy signals."
              : "The decision workflow is always scoped to one entitled experience. Choose one first, then sync analytics to build the evidence layer."}
          </p>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 18 }}>
            <a href="#experiences" style={{ textDecoration: "none", background: cyan, color: "#07101f", borderRadius: 9, padding: "9px 12px", fontSize: 12, fontWeight: 900 }}>{connectionId ? "Sync more analytics" : "Open experiences"}</a>
            <a href="/help/roblox-connection" style={{ textDecoration: "none", color: "#b8edf5", border: "1px solid rgba(103,232,249,.24)", borderRadius: 9, padding: "9px 12px", fontSize: 12, fontWeight: 800 }}>Connection guide</a>
          </div>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 16, background: "rgba(7,16,31,.38)" }}>
          <div style={{ color: faint, fontSize: 10, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>Current state</div>
          <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900 }}>{connectionId ? "Waiting for evidence" : "No experience selected"}</div>
          <div style={{ marginTop: 7, color: muted, fontSize: 12, lineHeight: 1.55 }}>{connectionId ? "No recommendation is generated until a decision threshold is supported." : "The workflow needs an active, entitled experience before it can load decisions."}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 20 }}>
        {cards.map(([id,title,copy]) => (
          <div key={id} style={{ border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: 15, background: "rgba(255,255,255,.018)" }}>
            <div style={{ width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: 999, border: "1px solid rgba(103,232,249,.25)", color: cyan, fontSize: 10, fontWeight: 900 }}>{id}</div>
            <strong style={{ display: "block", marginTop: 10 }}>{title}</strong>
            <div style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.55 }}>{copy}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:760px){.workspace-empty-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

export default function WorkspacePhase2A({ connectionId }: { connectionId: number | null }) {
  const [view, setView] = useState<View>("priorities");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [analyst, setAnalyst] = useState<Analyst | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [weekly, setWeekly] = useState<Weekly | null>(null);
  const [status, setStatus] = useState("Choose an active experience.");

  useEffect(() => {
    setDecisions([]);
    setAnalyst(null);
    setExperiment(null);
    setWeekly(null);
    if (!connectionId) {
      setStatus("Choose an active, entitled experience.");
      return;
    }
    void (async () => {
      setStatus("Loading selected experience…");
      const q = `?connection_id=${connectionId}`;
      const decisionResponse = await fetch(`/api/pilot/decisions${q}`, { cache: "no-store" });
      if (!decisionResponse.ok) {
        const p = await decisionResponse.json().catch(() => ({}));
        setStatus(p.detail ?? "Selected experience is not available.");
        return;
      }
      const decisionPayload = await decisionResponse.json();
      const items = decisionPayload.items ?? [];
      setDecisions(items);
      if (!items.length) {
        setStatus("Waiting for a supported decision threshold.");
        return;
      }
      const [a,e,w] = await Promise.all([
        fetch(`/api/pilot/analyst${q}`, { cache: "no-store" }),
        fetch(`/api/pilot/experiment${q}`, { cache: "no-store" }),
        fetch(`/api/pilot/weekly-brief${q}`, { cache: "no-store" }),
      ]);
      if (a.ok) setAnalyst(await a.json());
      if (e.ok) setExperiment(await e.json());
      if (w.ok) setWeekly(await w.json());
      setStatus("Decision workflow ready.");
    })();
  }, [connectionId]);

  const tabs: Array<[View,string]> = [["priorities","Priorities"],["evidence","Evidence"],["analyst","AI Analyst"],["experiment","Experiment"],["weekly","Weekly Brief"]];
  const empty = decisions.length === 0;

  return <section>
    <div style={{ display:"flex",justifyContent:"space-between",gap:14,flexWrap:"wrap",alignItems:"center" }}>
      <div style={{ color: faint, fontSize: 11 }}>Selected experience workflow</div>
      <div style={{ color: empty ? "#fbbf24" : "#86efac", fontSize: 11, border: `1px solid ${empty ? "rgba(251,191,36,.2)" : "rgba(134,239,172,.2)"}`, borderRadius: 999, padding: "7px 10px" }}>{status}</div>
    </div>

    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:14}}>
      {tabs.map(([id,label]) => <button key={id} disabled={empty && id !== "priorities"} onClick={()=>setView(id)} style={{background:view===id?"rgba(103,232,249,.1)":"transparent",color:view===id?"#a5f3fc":muted,border:`1px solid ${view===id?"rgba(103,232,249,.3)":"rgba(255,255,255,.1)"}`,borderRadius:9,padding:"8px 11px",cursor:empty && id !== "priorities"?"not-allowed":"pointer",opacity:empty && id !== "priorities"?.45:1}}>{label}</button>)}
    </div>

    {view==="priorities" && <div style={{display:"grid",gap:12,marginTop:18}}>{decisions.length?decisions.map((d,i)=><article key={d.key??i} style={panel}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><div><div style={{color:faint,fontSize:10,textTransform:"uppercase"}}>Priority #{i+1}</div><h3 style={{margin:"8px 0"}}>{d.title}</h3></div><strong style={{color:cyan}}>{typeof d.priority_score==="number"?`${d.priority_score}/100`:""}</strong></div><p style={{color:muted,lineHeight:1.6}}>{d.recommendation}</p></article>):<EmptyWorkflow connectionId={connectionId} />}</div>}

    {view==="evidence" && <div style={{display:"grid",gap:12,marginTop:18}}>{decisions.map((d,i)=><article key={d.key??i} style={panel}><div style={{color:cyan,fontSize:11,fontWeight:800}}>PRIORITY {i+1} EVIDENCE</div><h3>{d.title}</h3><div style={{display:"grid",gap:10,gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))"}}>{(d.evidence??[]).map((e,j)=><div key={j} style={{border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:14}}><div style={{color:faint,fontSize:10}}>{e.metric}</div><strong style={{display:"block",marginTop:7}}>{metricValue(e.current,e.unit)} vs {metricValue(e.baseline,e.unit)}</strong><div style={{color:muted,fontSize:12,marginTop:6}}>{e.segment||e.note}</div></div>)}</div>{(d.root_causes??[]).map((r,j)=><p key={j} style={{color:muted}}><strong style={{color:"#eef7ff"}}>{r.label}</strong> — {r.support}</p>)}<p style={{color:"#fbbf24",fontSize:12}}>{d.guardrail}</p></article>)}</div>}

    {view==="analyst" && <div style={{marginTop:18}}>{analyst?.brief?<><article style={{...panel,background:"linear-gradient(135deg,rgba(103,232,249,.08),rgba(255,255,255,.02))"}}><div style={{color:faint,fontSize:10,textTransform:"uppercase"}}>Grounded analyst · {analyst.generation?.mode??"deterministic"}</div><h3 style={{fontSize:25}}>{analyst.brief.executive_summary}</h3><p style={{color:muted}}>{analyst.brief.data_quality_note}</p></article>{analyst.brief.priorities?.map((p,i)=><article key={p.key??i} style={{...panel,marginTop:12}}><div style={{color:cyan,fontSize:11}}>Priority {i+1} · {p.confidence} confidence</div><h3>{p.headline}</h3><p style={{color:muted}}>{p.summary}</p><p><strong>Why it matters:</strong> <span style={{color:muted}}>{p.why_it_matters}</span></p><p><strong>Next action:</strong> {p.next_action}</p><p style={{color:"#fbbf24",fontSize:12}}>{p.guardrail}</p></article>)}</>:<article style={panel}><h3>Analyst not available yet</h3></article>}</div>}

    {view==="experiment" && <div style={{marginTop:18}}>{experiment?.plan?<article style={panel}><div style={{color:cyan,fontSize:11}}>EXPERIMENT COPILOT</div><h3 style={{fontSize:25}}>{experiment.plan.title}</h3><p style={{color:muted,lineHeight:1.65}}>{experiment.plan.hypothesis}</p><p><strong>Audience:</strong> {experiment.plan.audience}</p><p><strong>Primary KPI:</strong> {experiment.plan.primary_kpi}</p><p><strong>Control:</strong> <span style={{color:muted}}>{experiment.plan.control}</span></p><p><strong>Variant:</strong> <span style={{color:muted}}>{experiment.plan.variant}</span></p>{experiment.plan.guardrails?.map((g,i)=><p key={i} style={{color:muted}}><strong style={{color:"#eef7ff"}}>{g.metric}</strong> · max −{g.max_deterioration_pct}% · {g.rationale}</p>)}</article>:<article style={panel}><h3>No experiment plan yet</h3></article>}</div>}

    {view==="weekly" && <div style={{marginTop:18}}>{weekly?<><article style={{...panel,background:"linear-gradient(135deg,rgba(103,232,249,.07),rgba(255,255,255,.02))"}}><div style={{color:cyan,fontSize:11}}>WEEKLY BRIEF · SELECTED EXPERIENCE</div><h3 style={{fontSize:25}}>{weekly.analyst?.executive_summary??"Weekly decision review"}</h3><p style={{color:muted}}>{weekly.analyst?.data_quality_note}</p></article><article style={{...panel,marginTop:12}}>{weekly.priorities?.slice(0,3).map((p,i)=><div key={p.key??i} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}><strong>#{i+1} {p.title}</strong><div style={{color:muted,marginTop:5}}>{p.recommendation}</div></div>)}</article></>:<article style={panel}><h3>Weekly Brief not available yet</h3></article>}</div>}
  </section>;
}
