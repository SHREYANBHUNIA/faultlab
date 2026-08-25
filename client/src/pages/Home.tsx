/**
 * FaultLab / Signal Room style note:
 * This operational surface uses restrained carbon panels, precision mono data, and amber only
 * for live experimental state. Keep action paths calm, reversible, and visibly instrumented.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Box,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  CloudCog,
  Command,
  Copy,
  Cpu,
  Database,
  FileClock,
  Filter,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  ListFilter,
  MapPinned,
  MoreHorizontal,
  Network,
  Pause,
  Play,
  Plus,
  RadioTower,
  RotateCcw,
  Save,
  ServerCrash,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Square,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type RunStatus = "running" | "paused" | "stopped";

type Experiment = {
  name: string;
  target: string;
  failure: string;
  latency: number;
  duration: number;
  probability: number;
};

const initialExperiment: Experiment = {
  name: "Payment path latency probe",
  target: "payments-api",
  failure: "Network latency",
  latency: 500,
  duration: 60,
  probability: 30,
};

const navItems = [
  { label: "Lab overview", icon: Gauge },
  { label: "Experiments", icon: FlaskConical, count: "03" },
  { label: "Service map", icon: Network },
  { label: "Run history", icon: FileClock },
  { label: "Settings", icon: Settings2 },
];

const topologyNodes = [
  { id: "edge", name: "edge-gateway", meta: "3 pods · us-east-1", status: "healthy", x: "7%", y: "44%" },
  { id: "payments", name: "payments-api", meta: "4 pods · us-east-1", status: "fault", x: "38%", y: "20%" },
  { id: "orders", name: "orders-worker", meta: "2 pods · us-east-1", status: "healthy", x: "39%", y: "69%" },
  { id: "ledger", name: "ledger-db", meta: "primary · 1 replica", status: "healthy", x: "72%", y: "19%" },
  { id: "nats", name: "nats-stream", meta: "3 nodes · us-east-1", status: "healthy", x: "72%", y: "69%" },
];

const services = [
  { name: "edge-gateway", detail: "3 pods · stable", rtt: "42 ms", state: "healthy" },
  { name: "payments-api", detail: "4 pods · injected", rtt: "587 ms", state: "warn" },
  { name: "orders-worker", detail: "2 pods · stable", rtt: "71 ms", state: "healthy" },
  { name: "ledger-db", detail: "primary · stable", rtt: "8 ms", state: "healthy" },
];

function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function StatusPill({ status }: { status: RunStatus }) {
  const copy = status === "running" ? "experiment running" : status === "paused" ? "experiment paused" : "run stopped";
  return (
    <div className="status-line">
      <span className="status-orb" style={{ opacity: status === "stopped" ? 0.42 : 1 }} />
      {copy}
    </div>
  );
}

function Metric({ label, value, unit, trend, kind = "positive", live = false }: { label: string; value: string; unit?: string; trend: string; kind?: "positive" | "alert" | "neutral"; live?: boolean }) {
  return (
    <div className={`metric ${live ? "live" : ""}`}>
      <div className="data-label">{label}</div>
      <div className="metric-value">{value}{unit && <span className="metric-unit">{unit}</span>}</div>
      <div className={`metric-trend ${kind === "neutral" ? "" : kind}`}>
        {kind === "positive" && <Activity />}
        {kind === "alert" && <AlertTriangle />}
        {trend}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Lab overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus>("running");
  const [selectedNode, setSelectedNode] = useState("payments");
  const [experiment, setExperiment] = useState<Experiment>(initialExperiment);
  const [draft, setDraft] = useState<Experiment>(initialExperiment);
  const [elapsed, setElapsed] = useState(23);
  const [historyFilter, setHistoryFilter] = useState<"all" | "completed" | "aborted">("all");
  const [guardrails, setGuardrails] = useState({ approval: true, rollback: true, quietWindow: false });

  useEffect(() => {
    if (runStatus !== "running") return;
    const timer = window.setInterval(() => {
      setElapsed((current) => (current >= experiment.duration ? experiment.duration : current + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [experiment.duration, runStatus]);

  useEffect(() => {
    if (elapsed === experiment.duration && runStatus === "running") {
      setRunStatus("stopped");
      toast.success("Experiment completed", { description: `${experiment.name} completed after ${experiment.duration} seconds.` });
    }
  }, [elapsed, experiment.duration, experiment.name, runStatus]);

  const progress = Math.min(Math.round((elapsed / experiment.duration) * 100), 100);
  const selected = useMemo(() => topologyNodes.find((node) => node.id === selectedNode) ?? topologyNodes[1], [selectedNode]);

  function activateNav(label: string) {
    setActiveNav(label);
  }

  function openNewExperiment() {
    setDraft({ ...experiment, name: "" });
    setModalOpen(true);
  }

  function launchExperiment() {
    const nextExperiment = { ...draft, name: draft.name.trim() || "Untitled fault probe" };
    setExperiment(nextExperiment);
    setElapsed(0);
    setRunStatus("running");
    setSelectedNode(nextExperiment.target === "payments-api" ? "payments" : "edge");
    setModalOpen(false);
    toast.success("Fault injection armed", { description: `${nextExperiment.failure} will target ${nextExperiment.target} for ${nextExperiment.duration} seconds.` });
  }

  function togglePause() {
    if (runStatus === "stopped") {
      setElapsed(0);
      setRunStatus("running");
      toast.success("Experiment resumed from start");
      return;
    }
    const next = runStatus === "running" ? "paused" : "running";
    setRunStatus(next);
    toast.info(next === "paused" ? "Fault injection paused" : "Fault injection resumed");
  }

  function abortExperiment() {
    setRunStatus("stopped");
    toast.warning("Experiment aborted", { description: "Fault injection has been removed and the target service is returning to baseline." });
  }

  function runPreset(nextExperiment: Experiment) {
    setExperiment(nextExperiment);
    setElapsed(0);
    setRunStatus("running");
    setSelectedNode(nextExperiment.target === "payments-api" ? "payments" : nextExperiment.target === "orders-worker" ? "orders" : "edge");
    setActiveNav("Lab overview");
    toast.success("Experiment started", { description: `${nextExperiment.failure} is now targeting ${nextExperiment.target}.` });
  }

  return (
    <div className="lab-app">
      <aside className="instrument-sidebar" aria-label="FaultLab navigation">
        <div className="brand-lockup">
          <img className="brand-mark" src="/manus-storage/faultlab-logo-mark_4f214c03.png" alt="FaultLab signal mark" />
          <div>
            <div className="brand-name">FaultLab</div>
            <div className="brand-sub">chaos engineering lab</div>
          </div>
        </div>

        <nav className="nav-block">
          <div className="nav-overline">Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => activateNav(item.label)}>
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {item.count && <span className="nav-count">{item.count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="environment-card">
          <div className="environment-card-top">
            <span className="env-name">Production sandbox</span>
            <span className="live-badge"><span className="live-dot" />connected</span>
          </div>
          <div className="env-meta"><span>k8s · v1.30.4</span><span>12 services</span></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div className="crumbs"><span>workspaces</span><ChevronRight size={12} /><span>reliability-core</span><ChevronRight size={12} /><strong>{activeNav.toLowerCase()}</strong><span className="header-lab-code">LAB / 04</span></div>
          <div className="header-actions">
            <button className="icon-button" aria-label="View notifications" onClick={() => toast.info("No unresolved operator notices")}><Bell size={16} /></button>
            <button className="ghost-button" onClick={() => toast.info("Command palette", { description: "Use this surface to jump between lab actions." })}><Command /> Command</button>
            <button className="primary-button" onClick={openNewExperiment}><Plus /> New experiment</button>
          </div>
        </header>

        {activeNav === "Lab overview" && <section className="dashboard">
          <div className="hero-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> chaos control plane</div>
              <h1 className="hero-title">Inject a fault. Measure the<br />path. Restore with proof.</h1>
              <p className="hero-copy">Current window: add 500 ms to the payment dependency path for 60 seconds, with a 30% sampled blast radius.</p>
            </div>
            <div className="time-window"><CalendarClock /> live window · last 30 minutes</div>
          </div>

          <section className="metric-strip" aria-label="Operational metrics">
            <Metric label="services observed" value="12" trend="all reporting" />
            <Metric label="active experiments" value={runStatus === "stopped" ? "00" : "01"} trend={runStatus === "stopped" ? "no fault injected" : "controlled blast radius"} kind={runStatus === "stopped" ? "neutral" : "alert"} live={runStatus !== "stopped"} />
            <Metric label="error budget" value="99.87" unit="%" trend="within policy" />
            <Metric label="p95 gateway" value={runStatus === "running" ? "587" : "86"} unit="ms" trend={runStatus === "running" ? "+501 ms from baseline" : "baseline restored"} kind={runStatus === "running" ? "alert" : "positive"} live={runStatus === "running"} />
          </section>

          <div className="main-grid">
            <div className="left-stack">
              <section className="panel" aria-labelledby="topology-title">
                <div className="panel-head">
                  <div>
                    <div className="panel-title" id="topology-title"><Network /> Service topology</div>
                    <div className="panel-subtitle">select a node to inspect live service state</div>
                  </div>
                  <button className="panel-action" onClick={() => toast.info("Topology is current to 3 seconds")}>refresh 3s</button>
                </div>
                <div className="fault-route-strip"><span><i />edge-gateway</span><b className={runStatus === "running" ? "active" : ""} /><span className={runStatus === "running" ? "route-live" : ""}><i />payments-api</span><b className={runStatus === "running" ? "active" : ""} /><span><i />ledger-db</span></div>
                <div className="topology-stage">
                  <svg className="topology-svg" viewBox="0 0 760 300" preserveAspectRatio="none" aria-hidden="true">
                    <path className="topology-link" d="M104 144 C 208 144, 236 80, 324 78" />
                    <path className="topology-link" d="M104 156 C 212 160, 240 229, 325 225" />
                    <path className="topology-link active" d="M423 78 C 506 76, 539 77, 604 77" />
                    <path className="topology-link" d="M423 226 C 499 220, 543 218, 605 213" />
                    <path className="topology-link" d="M378 103 C 414 138, 420 170, 380 202" />
                    <path className="topology-link" d="M650 104 C 659 144, 659 165, 650 194" />
                  </svg>
                  <span className={`pulse-packet ${runStatus !== "running" ? "static" : ""}`} style={{ left: "38%", top: "25%" }} />
                  {topologyNodes.map((node) => (
                    <button key={node.id} className={`signal-node ${selectedNode === node.id ? "selected" : ""}`} style={{ left: node.x, top: node.y }} onClick={() => setSelectedNode(node.id)}>
                      <span className="node-name">{node.name}</span>
                      <span className="node-meta">{node.meta}</span>
                      <span className={`node-state ${node.status === "fault" && runStatus !== "stopped" ? "alert" : ""}`}><i className="node-state-dot" />{node.status === "fault" && runStatus !== "stopped" ? "fault injected" : "healthy"}</span>
                    </button>
                  ))}
                  <div className="topology-key"><span className="key-item"><i className="key-mark" /> healthy</span><span className="key-item"><i className="key-mark fault" /> fault path</span></div>
                </div>
              </section>

              <section className="panel telemetry-panel" aria-labelledby="telemetry-title">
                <div className="panel-head">
                  <div>
                    <div className="panel-title" id="telemetry-title"><LineChart /> Edge-to-payment latency</div>
                    <div className="panel-subtitle"><span className="legend-dot" />p95 latency · last 30 minutes</div>
                  </div>
                  <button className="panel-action" onClick={() => toast.info("Metric source: Prometheus", { description: "1 minute rollups · 15 second collection." })}>source: prom</button>
                </div>
                <div className="chart-wrap">
                  <div className="chart-annotation">T+{String(Math.max(elapsed - 11, 0)).padStart(2, "0")}s · injector armed</div>
                  <svg className="chart-svg" viewBox="0 0 700 150" preserveAspectRatio="none" role="img" aria-label="Latency increasing as the current fault is injected">
                    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ffb020" stopOpacity="0.34" /><stop offset="100%" stopColor="#ffb020" stopOpacity="0" /></linearGradient></defs>
                    <line className="chart-grid" x1="0" y1="25" x2="700" y2="25" /><line className="chart-grid" x1="0" y1="75" x2="700" y2="75" /><line className="chart-grid" x1="0" y1="125" x2="700" y2="125" />
                    <path className="chart-fill" d="M0,112 C40,108 70,115 108,104 S170,108 205,101 S250,96 281,103 S323,93 353,101 S397,89 426,95 S466,78 493,86 S525,66 555,72 S590,59 615,63 S653,36 700,28 L700,150 L0,150 Z" />
                    <path className="chart-line" d="M0,112 C40,108 70,115 108,104 S170,108 205,101 S250,96 281,103 S323,93 353,101 S397,89 426,95 S466,78 493,86 S525,66 555,72 S590,59 615,63 S653,36 700,28" />
                    <circle className="chart-point" cx="700" cy="28" r="4.5" />
                  </svg>
                </div>
                <div className="chart-axis"><span>−30m</span><span>−20m</span><span>−10m</span><span>now</span></div>
              </section>
            </div>

            <div className="right-stack">
              <section className="panel run-panel" aria-labelledby="run-title">
                <div className="panel-head">
                  <div className="panel-title" id="run-title"><FlaskConical /> Current experiment</div>
                  <button className="panel-action" onClick={openNewExperiment}>replace</button>
                </div>
                <div className="run-content">
                  <StatusPill status={runStatus} />
                  <h2 className="run-name">{experiment.name}</h2>
                  <div className="run-spec"><span className="spec-chip">{experiment.target}</span><span className="spec-chip">{experiment.failure.toLowerCase()}</span><span className="spec-chip">{experiment.latency} ms</span></div>
                  <div className="run-progress-area">
                    <div className="progress-head"><span>{runStatus === "stopped" ? "final state" : "fault window"}</span><b>{formatDuration(Math.max(experiment.duration - elapsed, 0))}</b></div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                  </div>
                  <div className="run-actions">
                    <button className="run-button" onClick={togglePause}>{runStatus === "running" ? <Pause /> : <Play />}{runStatus === "running" ? "Pause" : runStatus === "paused" ? "Resume" : "Re-run"}</button>
                    <button className="ghost-button danger" onClick={abortExperiment}><Square /> Abort</button>
                  </div>
                </div>
              </section>

              <section className="panel" aria-labelledby="services-title">
                <div className="panel-head">
                  <div>
                    <div className="panel-title" id="services-title"><RadioTower /> Service posture</div>
                    <div className="panel-subtitle">health check · 10 second interval</div>
                  </div>
                  <button className="panel-action" onClick={() => toast.info("Filter control ready for service status drill-down")}>all 12</button>
                </div>
                <div className="service-list">
                  {services.map((service) => (
                    <div className="service-row" key={service.name}>
                      <div><div className="service-name"><span className={`service-dot ${service.state}`} />{service.name}</div><div className="service-meta">{service.detail}</div></div>
                      <div className={`service-rtt ${service.state === "warn" && runStatus === "running" ? "alert" : ""}`}>{service.state === "warn" && runStatus !== "running" ? "86 ms" : service.rtt}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel inspector-panel" aria-labelledby="inspect-title">
                <div className="panel-head">
                  <div>
                    <div className="panel-title" id="inspect-title"><ListFilter /> Node inspector</div>
                    <div className="panel-subtitle">selected from topology map</div>
                  </div>
                  <button className="panel-action" onClick={() => toast.info("Node details pinned")}>pin</button>
                </div>
                <div className="inspector-body">
                  <div className="inspector-service"><div className="service-avatar"><Box /></div><div><div className="inspector-service-name">{selected.name}</div><div className="inspector-service-meta">{selected.meta}</div></div></div>
                  <div className="inspector-grid">
                    <div className="inspect-cell"><div className="mini-label">status</div><div className={`inspect-value ${selected.status === "fault" && runStatus !== "stopped" ? "alert" : ""}`}>{selected.status === "fault" && runStatus !== "stopped" ? "injected" : "healthy"}</div></div>
                    <div className="inspect-cell"><div className="mini-label">availability</div><div className="inspect-value">99.98%</div></div>
                    <div className="inspect-cell"><div className="mini-label">request rate</div><div className="inspect-value">1,842/min</div></div>
                    <div className="inspect-cell"><div className="mini-label">error rate</div><div className={`inspect-value ${selected.status === "fault" && runStatus === "running" ? "alert" : ""}`}>{selected.status === "fault" && runStatus === "running" ? "2.7%" : "0.03%"}</div></div>
                  </div>
                </div>
              </section>

              <section className="panel activity-panel" aria-labelledby="activity-title">
                <div className="panel-head">
                  <div>
                    <div className="panel-title" id="activity-title"><Activity /> Lab activity</div>
                    <div className="panel-subtitle">latest control-plane events</div>
                  </div>
                </div>
                <div className="activity-list">
                  <div className="activity-entry"><div className="activity-node active"><Zap /></div><div className="activity-copy"><strong>Latency injector</strong> applied to `payments-api` at 30% probability</div><span className="activity-time">now</span></div>
                  <div className="activity-entry"><div className="activity-node"><ShieldCheck /></div><div className="activity-copy">Guardrail verified: payment-path error budget is within policy</div><span className="activity-time">1m</span></div>
                  <div className="activity-entry"><div className="activity-node"><GitBranch /></div><div className="activity-copy">Pre-fault baseline retained for an automatic rollback comparison</div><span className="activity-time">4m</span></div>
                </div>
              </section>
            </div>
          </div>
        </section>}

        {activeNav === "Experiments" && <section className="dashboard workspace-view">
          <div className="workspace-hero">
            <div><div className="eyebrow"><span className="eyebrow-line" /> experiment registry</div><h1 className="view-title">Compose failure with<br />a known blast radius.</h1><p className="view-copy">Each protocol binds a target, failure mode, duration, and probability before an operator arms the run.</p></div>
            <div className="workspace-hero-actions"><div className="time-window"><FlaskConical /> 03 protocols in lab</div><button className="primary-button" onClick={openNewExperiment}><Plus /> New experiment</button></div>
          </div>
          <div className="workspace-split experiments-layout">
            <section className="panel registry-panel">
              <div className="panel-head"><div><div className="panel-title"><ListFilter /> Experiment registry</div><div className="panel-subtitle">active, scheduled, and draft protocols</div></div><button className="panel-action" onClick={() => toast.info("Registry synced with the control plane")}>sync now</button></div>
              <div className="registry-head"><span>protocol</span><span>target</span><span>fault</span><span>guardrail</span><span /></div>
              <div className="registry-list">
                <article className="registry-row running"><div><span className="registry-status live-dot" /><strong>{experiment.name}</strong><small>started 12:43 · live result stream</small></div><div><code>{experiment.target}</code></div><div><span className="fault-tag">{experiment.failure}</span><small>{experiment.latency} ms · {experiment.probability}%</small></div><div><span className="guardrail-tag"><ShieldCheck /> error budget</span></div><button className="row-action" onClick={() => activateNav("Lab overview")}><ArrowUpRight /></button></article>
                <article className="registry-row"><div><span className="registry-status scheduled" /><strong>Orders worker termination drill</strong><small>scheduled · tomorrow 09:00</small></div><div><code>orders-worker</code></div><div><span className="fault-tag neutral">Process termination</span><small>30 s · 10%</small></div><div><span className="guardrail-tag"><ShieldCheck /> approval</span></div><button className="row-action" onClick={() => runPreset({ name: "Orders worker termination drill", target: "orders-worker", failure: "Process termination", latency: 30, duration: 30, probability: 10 })}><Play /></button></article>
                <article className="registry-row"><div><span className="registry-status draft" /><strong>Gateway packet-loss canary</strong><small>draft · last edited 4m ago</small></div><div><code>edge-gateway</code></div><div><span className="fault-tag neutral">Packet loss</span><small>3% · 120 s</small></div><div><span className="guardrail-tag"><ShieldCheck /> rollback</span></div><button className="row-action" onClick={() => { setDraft({ name: "Gateway packet-loss canary", target: "edge-gateway", failure: "Packet loss", latency: 3, duration: 120, probability: 30 }); setModalOpen(true); }}><SlidersHorizontal /></button></article>
              </div>
            </section>
            <aside className="right-stack">
              <section className="panel recipe-panel"><div className="panel-head"><div><div className="panel-title"><Sparkles /> Fault recipes</div><div className="panel-subtitle">reversible starting points</div></div></div><div className="recipe-list"><button className="recipe-row" onClick={() => { setDraft({ name: "Dependency blackout", target: "payments-api", failure: "Dependency unavailable", latency: 100, duration: 45, probability: 50 }); setModalOpen(true); }}><ServerCrash /><span><strong>Dependency blackout</strong><small>45 sec · half traffic</small></span><ChevronRight /></button><button className="recipe-row" onClick={() => { setDraft({ name: "Database pressure probe", target: "payments-api", failure: "CPU pressure", latency: 75, duration: 90, probability: 20 }); setModalOpen(true); }}><Cpu /><span><strong>CPU pressure probe</strong><small>90 sec · 75% pressure</small></span><ChevronRight /></button><button className="recipe-row" onClick={() => { setDraft({ name: "NATS partition drill", target: "nats-stream", failure: "Network partition", latency: 0, duration: 60, probability: 100 }); setModalOpen(true); }}><Network /><span><strong>NATS partition drill</strong><small>60 sec · full isolate</small></span><ChevronRight /></button></div></section>
              <section className="panel protocol-panel"><div className="panel-head"><div><div className="panel-title"><ShieldCheck /> Arming policy</div><div className="panel-subtitle">production sandbox</div></div></div><div className="policy-check"><Check /> error budget must remain above 99.5%</div><div className="policy-check"><Check /> automatic rollback on abort</div><div className="policy-check"><Check /> change window is open</div></section>
            </aside>
          </div>
        </section>}

        {activeNav === "Service map" && <section className="dashboard workspace-view">
          <div className="workspace-hero"><div><div className="eyebrow"><span className="eyebrow-line" /> runtime dependency surface</div><h1 className="view-title">Trace every dependency<br />before it becomes a fault.</h1><p className="view-copy">Inspect service posture, latency edges, and injected failure paths across the production sandbox.</p></div><div className="workspace-hero-actions"><div className="time-window"><CircleDot /> topology current · 3s</div><button className="ghost-button" onClick={() => toast.info("Topology refresh requested")}><RotateCcw /> Refresh map</button></div></div>
          <div className="map-workspace-grid">
            <section className="panel full-map-panel"><div className="panel-head"><div><div className="panel-title"><MapPinned /> Live service map</div><div className="panel-subtitle">12 services · 18 dependency edges · 1 active fault path</div></div><button className="panel-action" onClick={() => toast.info("Fault path isolated: edge-gateway → payments-api → ledger-db")}>isolate fault path</button></div><div className="fault-route-strip map-route-strip"><span><i />edge-gateway</span><b className={runStatus === "running" ? "active" : ""} /><span className={runStatus === "running" ? "route-live" : ""}><i />payments-api</span><b className={runStatus === "running" ? "active" : ""} /><span><i />ledger-db</span></div><div className="topology-stage map-stage"><svg className="topology-svg" viewBox="0 0 760 300" preserveAspectRatio="none" aria-hidden="true"><path className="topology-link" d="M104 144 C 208 144, 236 80, 324 78" /><path className="topology-link" d="M104 156 C 212 160, 240 229, 325 225" /><path className="topology-link active" d="M423 78 C 506 76, 539 77, 604 77" /><path className="topology-link" d="M423 226 C 499 220, 543 218, 605 213" /><path className="topology-link" d="M378 103 C 414 138, 420 170, 380 202" /><path className="topology-link" d="M650 104 C 659 144, 659 165, 650 194" /></svg><span className={`pulse-packet ${runStatus !== "running" ? "static" : ""}`} style={{ left: "38%", top: "25%" }} />{topologyNodes.map((node) => <button key={node.id} className={`signal-node ${selectedNode === node.id ? "selected" : ""}`} style={{ left: node.x, top: node.y }} onClick={() => setSelectedNode(node.id)}><span className="node-name">{node.name}</span><span className="node-meta">{node.meta}</span><span className={`node-state ${node.status === "fault" && runStatus !== "stopped" ? "alert" : ""}`}><i className="node-state-dot" />{node.status === "fault" && runStatus !== "stopped" ? "fault injected" : "healthy"}</span></button>)}<div className="topology-key"><span className="key-item"><i className="key-mark" /> healthy</span><span className="key-item"><i className="key-mark fault" /> fault path</span></div></div></section>
            <aside className="right-stack"><section className="panel map-inspector"><div className="panel-head"><div><div className="panel-title"><Box /> Selected service</div><div className="panel-subtitle">inspect node-level posture</div></div><button className="panel-action" onClick={() => toast.info(`${selected.name} detail pinned`)}>pin</button></div><div className="map-inspector-content"><div className="inspector-service"><div className="service-avatar"><Box /></div><div><div className="inspector-service-name">{selected.name}</div><div className="inspector-service-meta">{selected.meta}</div></div></div><div className="map-stat"><span>upstream dependencies</span><strong>02</strong></div><div className="map-stat"><span>downstream consumers</span><strong>05</strong></div><div className="map-stat alert"><span>current p95</span><strong>{selected.id === "payments" && runStatus === "running" ? "587 ms" : "48 ms"}</strong></div><button className="ghost-button full-width" onClick={() => { setDraft({ ...experiment, target: selected.name }); setModalOpen(true); }}><FlaskConical /> Target in experiment</button></div></section><section className="panel edge-panel"><div className="panel-head"><div><div className="panel-title"><GitBranch /> Critical edges</div><div className="panel-subtitle">highest latency gradients</div></div></div><div className="edge-list"><div><span>edge → payments</span><b className="alert-text">587 ms</b></div><div><span>payments → ledger</span><b>8 ms</b></div><div><span>orders → NATS</span><b>71 ms</b></div></div></section></aside>
          </div>
        </section>}

        {activeNav === "Run history" && <section className="dashboard workspace-view">
          <div className="workspace-hero"><div><div className="eyebrow"><span className="eyebrow-line" /> experiment evidence log</div><h1 className="view-title">Every fault leaves a<br />replayable decision trail.</h1><p className="view-copy">Review the experiment window, response, and rollback posture for every completed or aborted run.</p></div><div className="workspace-hero-actions"><div className="time-window"><Clock3 /> 27 runs · 30 days</div><button className="ghost-button" onClick={() => toast.info("History export prepared", { description: "A CSV export will be available with the connected controller." })}><Save /> Export log</button></div></div>
          <section className="panel history-panel"><div className="panel-head"><div><div className="panel-title"><FileClock /> Run history</div><div className="panel-subtitle">immutable snapshots · 30 day retention</div></div><div className="history-filters"><Filter size={13} />{(["all", "completed", "aborted"] as const).map((filter) => <button key={filter} className={`scope-filter ${historyFilter === filter ? "active" : ""}`} onClick={() => setHistoryFilter(filter)}>{filter}</button>)}</div></div><div className="history-table-head"><span>run</span><span>fault protocol</span><span>window</span><span>result</span><span>owner</span><span /></div><div className="history-list">{(historyFilter === "all" || historyFilter === "completed") && <article className="history-row"><div><span className="history-id">RUN-0481</span><small>today · 10:12</small></div><div><strong>Ledger connection pressure</strong><small>payments-api · CPU pressure</small></div><div><code>04:00</code><small>20% sampled</small></div><div><span className="result-badge completed"><Check /> completed</span><small>baseline restored</small></div><div className="owner-mark">AM</div><button className="row-action" onClick={() => toast.info("Run RUN-0481 evidence is ready for review")}><ArrowUpRight /></button></article>}{(historyFilter === "all" || historyFilter === "aborted") && <article className="history-row"><div><span className="history-id">RUN-0479</span><small>yesterday · 16:44</small></div><div><strong>Payment path latency probe</strong><small>payments-api · Network latency</small></div><div><code>00:23</code><small>30% sampled</small></div><div><span className="result-badge aborted"><Square /> aborted</span><small>guardrail triggered</small></div><div className="owner-mark">SL</div><button className="row-action" onClick={() => { setDraft(initialExperiment); setModalOpen(true); }}><Copy /></button></article>}{(historyFilter === "all" || historyFilter === "completed") && <article className="history-row"><div><span className="history-id">RUN-0472</span><small>22 aug · 09:00</small></div><div><strong>Orders worker recycle</strong><small>orders-worker · Process termination</small></div><div><code>01:00</code><small>10% sampled</small></div><div><span className="result-badge completed"><Check /> completed</span><small>no SLO breach</small></div><div className="owner-mark">KT</div><button className="row-action" onClick={() => toast.info("Run RUN-0472 evidence is ready for review")}><ArrowUpRight /></button></article>}</div></section>
          <div className="history-summary-grid"><section className="panel summary-panel"><div className="data-label">median recovery</div><strong>18<span> sec</span></strong><p>from injector removal to baseline p95</p></section><section className="panel summary-panel"><div className="data-label">aborted by guardrail</div><strong>03<span> / 27</span></strong><p>automatic stop before a policy breach</p></section><section className="panel summary-panel"><div className="data-label">evidence coverage</div><strong>100<span>%</span></strong><p>runs retained with a control-plane snapshot</p></section></div>
        </section>}

        {activeNav === "Settings" && <section className="dashboard workspace-view">
          <div className="workspace-hero"><div><div className="eyebrow"><span className="eyebrow-line" /> laboratory controls</div><h1 className="view-title">Set the guardrails<br />before the chaos.</h1><p className="view-copy">Safety posture is evaluated by the controller before every fault injection reaches the environment.</p></div><div className="workspace-hero-actions"><div className="time-window"><ShieldCheck /> policy enforced</div><button className="primary-button" onClick={() => toast.success("Lab settings saved", { description: "The next experiment will use the updated safety policy." })}><Save /> Save changes</button></div></div>
          <div className="settings-grid"><section className="panel settings-panel"><div className="panel-head"><div><div className="panel-title"><ShieldCheck /> Safety guardrails</div><div className="panel-subtitle">required checks before fault injection</div></div></div><div className="setting-rows"><label className="setting-row"><span><strong>Require operator approval</strong><small>Ask a second engineer to arm a production-sandbox experiment.</small></span><input type="checkbox" checked={guardrails.approval} onChange={(event) => setGuardrails({ ...guardrails, approval: event.target.checked })} /><i className="toggle-track" /></label><label className="setting-row"><span><strong>Automatic rollback</strong><small>Remove the injected fault immediately when an operator aborts the run.</small></span><input type="checkbox" checked={guardrails.rollback} onChange={(event) => setGuardrails({ ...guardrails, rollback: event.target.checked })} /><i className="toggle-track" /></label><label className="setting-row"><span><strong>Quiet-window enforcement</strong><small>Block new experiments outside the approved reliability change window.</small></span><input type="checkbox" checked={guardrails.quietWindow} onChange={(event) => setGuardrails({ ...guardrails, quietWindow: event.target.checked })} /><i className="toggle-track" /></label></div></section><section className="panel settings-panel"><div className="panel-head"><div><div className="panel-title"><CloudCog /> Control plane</div><div className="panel-subtitle">environment and connector posture</div></div></div><div className="settings-fields"><label><span className="form-label">target environment</span><select className="form-control" defaultValue="Production sandbox"><option>Production sandbox</option><option>Staging</option><option>Development cluster</option></select></label><label><span className="form-label">rollback timeout</span><select className="form-control" defaultValue="30 seconds"><option>30 seconds</option><option>60 seconds</option><option>120 seconds</option></select></label><label><span className="form-label">controller endpoint</span><div className="readonly-control"><Terminal /> controller.faultlab.local:4222</div></label></div></section><section className="panel integrations-panel"><div className="panel-head"><div><div className="panel-title"><Layers3 /> Connected systems</div><div className="panel-subtitle">runtime control plane dependencies</div></div><button className="panel-action" onClick={() => toast.info("All connectors are reporting normally")}>recheck</button></div><div className="integration-row"><span className="integration-icon"><Database /></span><span><strong>PostgreSQL</strong><small>experiment audit storage</small></span><b className="connection-state"><i /> online</b></div><div className="integration-row"><span className="integration-icon"><RadioTower /></span><span><strong>NATS</strong><small>controller event stream</small></span><b className="connection-state"><i /> online</b></div><div className="integration-row"><span className="integration-icon"><LineChart /></span><span><strong>Prometheus</strong><small>blast-radius telemetry</small></span><b className="connection-state"><i /> online</b></div></section></div>
        </section>}
      </main>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setModalOpen(false); }}>
          <div className="experiment-modal" role="dialog" aria-modal="true" aria-labelledby="experiment-modal-title">
            <div className="modal-head">
              <div><div className="eyebrow"><span className="eyebrow-line" /> controlled fault protocol</div><h2 className="modal-title" id="experiment-modal-title">Compose an experiment</h2><p className="modal-copy">FaultLab keeps the blast radius explicit before a run begins.</p></div>
              <button className="modal-close" aria-label="Close experiment editor" onClick={() => setModalOpen(false)}><X /></button>
            </div>
            <form className="experiment-form" onSubmit={(event) => { event.preventDefault(); launchExperiment(); }}>
              <div className="form-grid">
                <label className="form-field full"><span className="form-label">experiment name</span><input className="form-control" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Payment path latency probe" /></label>
                <label className="form-field"><span className="form-label">target service</span><select className="form-control" value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })}><option value="payments-api">payments-api</option><option value="edge-gateway">edge-gateway</option><option value="orders-worker">orders-worker</option><option value="nats-stream">nats-stream</option></select></label>
                <label className="form-field"><span className="form-label">failure mode</span><select className="form-control" value={draft.failure} onChange={(event) => setDraft({ ...draft, failure: event.target.value })}><option>Network latency</option><option>Packet loss</option><option>Process termination</option><option>CPU pressure</option><option>Memory pressure</option><option>Dependency unavailable</option><option>Network partition</option></select></label>
                <label className="form-field"><span className="form-label">latency / pressure</span><input className="form-control" type="number" min="1" max="30000" value={draft.latency} onChange={(event) => setDraft({ ...draft, latency: Number(event.target.value) })} /></label>
                <label className="form-field"><span className="form-label">duration (seconds)</span><input className="form-control" type="number" min="5" max="3600" value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: Number(event.target.value) })} /></label>
                <label className="form-field full"><span className="form-label">injection probability</span><span className="range-row"><input type="range" min="5" max="100" step="5" value={draft.probability} onChange={(event) => setDraft({ ...draft, probability: Number(event.target.value) })} /><strong className="range-value">{draft.probability}%</strong></span></label>
              </div>
              <div className="modal-summary"><Sparkles /> <span><b>{draft.failure}</b> will target <b>{draft.target}</b> at <b>{draft.latency} ms</b> for <b>{draft.duration} seconds</b>, sampled at <b>{draft.probability}%</b> probability.</span></div>
              <div className="modal-actions"><button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button"><Play /> Arm and run experiment</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
