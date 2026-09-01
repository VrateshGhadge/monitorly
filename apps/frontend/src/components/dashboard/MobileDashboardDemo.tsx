import { useDashboardState } from "../../hooks/useDashboardState";
import type { Monitor } from "../../types/dashboard";

/**
 * Compact phone-style mockup of the Monitorly dashboard, shown in the hero
 * on viewports below 600px in place of the full desktop demo. The desktop
 * demo is a two-pane app (sidebar + dashboard) that degrades into cramped
 * columns when squeezed to phone width — this version is purpose-built for
 * that space: single column, no sidebar, no tables, just the numbers and
 * monitor rows that communicate "monitoring is happening."
 */

interface MobileSummaryProps {
  monitors: Monitor[];
}

function MobileSummary({ monitors }: MobileSummaryProps) {
  const up = monitors.filter((m) => m.status === "up").length;
  const down = monitors.length - up;
  const avgUptime = (
    monitors.reduce((a, m) => a + m.uptimePct, 0) / monitors.length
  ).toFixed(1);
  const avgLatency = (() => {
    const live = monitors.filter((m) => m.status === "up" && m.latency !== null);
    if (!live.length) return "—";
    return `${Math.round(
      live.reduce((a, m) => a + (m.latency ?? 0), 0) / live.length,
    )}ms`;
  })();

  const tiles = [
    { label: "Monitors up", value: `${up}/${monitors.length}`, tone: "" },
    { label: "Uptime · 30d", value: `${avgUptime}%`, tone: "" },
    { label: "Avg response", value: avgLatency, tone: "" },
    {
      label: "Alerts",
      value: String(down).padStart(2, "0"),
      tone: down > 0 ? "bad" : "",
    },
  ];

  return (
    <div className="m-summary">
      {tiles.map((t) => (
        <div className="m-summary-tile" key={t.label}>
          <span>{t.label}</span>
          <strong className={t.tone}>{t.value}</strong>
        </div>
      ))}
    </div>
  );
}

function MobileSparkline({ monitors }: { monitors: Monitor[] }) {
  const up = monitors.filter((m) => m.status === "up").length;
  const degraded = up < monitors.length;
  const color = degraded ? "#f2789a" : "#50d890";

  // Deterministic little wave so the sparkline is stable across renders.
  const points = Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(i / 3.2) * 0.35 + Math.cos(i / 5.5) * 0.2;
    const base = degraded ? 55 : 62;
    return (base + wave * 24).toFixed(1);
  });
  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 600},${y}`)
    .join(" ");

  return (
    <div className="m-spark">
      <div className="m-spark-head">
        <span>Response time</span>
        <small>LAST 24 HOURS</small>
      </div>
      <svg viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={`${path} V90 H0 Z`}
          fill={color}
          opacity="0.16"
        />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
      </svg>
      <div className="m-spark-axis">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>NOW</span>
      </div>
    </div>
  );
}

function MobileMonitorRow({ monitor }: { monitor: Monitor }) {
  const ok = monitor.status === "up";
  return (
    <div className="m-monitor">
      <i
        className="status-dot"
        style={{ background: ok ? "var(--green)" : "var(--red)" }}
      />
      <div className="m-monitor-name">
        <b>{monitor.name}</b>
        <span>{monitor.type}</span>
      </div>
      <span className="m-monitor-up">{monitor.uptimePct}%</span>
      <strong style={{ color: ok ? undefined : "var(--red)" }}>
        {ok ? `${monitor.latency}ms` : "DOWN"}
      </strong>
    </div>
  );
}

export default function MobileDashboardDemo() {
  const { monitors, monitorsTotal } = useDashboardState();

  return (
    <div className="m-demo" aria-label="Monitorly dashboard preview (mobile)">
      <div className="m-demo-head">
        <div>
          <h3>Good morning, Helena</h3>
          <span>All systems are being watched</span>
        </div>
        <span className="live">● LIVE</span>
      </div>

      <MobileSummary monitors={monitors} />

      <MobileSparkline monitors={monitors} />

      <div className="m-monitors">
        <div className="m-monitors-head">
          <h4>Monitors</h4>
          <small>
            {monitorsTotal} TOTAL · {monitorsUpLabel(monitors)} UP
          </small>
        </div>
        {monitors.slice(0, 4).map((m) => (
          <MobileMonitorRow key={m.id} monitor={m} />
        ))}
      </div>
    </div>
  );
}

function monitorsUpLabel(monitors: Monitor[]): string {
  return String(monitors.filter((m) => m.status === "up").length).padStart(
    2,
    "0",
  );
}
