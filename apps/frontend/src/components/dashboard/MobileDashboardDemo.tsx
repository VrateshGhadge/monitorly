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
      tone: down > 0 ? "text-danger" : "",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((t) => (
        <div className="rounded-[8px] border border-line bg-[#11151a] px-3 py-2.5 [&>span]:mb-1.5 [&>span]:block [&>span]:text-[9.5px] [&>span]:text-[#818994] [&>strong]:text-[18px] [&>strong]:tracking-[-0.5px]" key={t.label}>
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
    <div className="mt-2 rounded-[8px] border border-line bg-[#11151a] p-3 [&_svg]:block [&_svg]:h-16 [&_svg]:w-full">
      <div className="mb-2 flex items-center justify-between [&_span]:text-[11px] [&_span]:font-semibold [&_small]:font-code [&_small]:text-[9px] [&_small]:leading-[normal] [&_small]:text-[#737c87]">
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
      <div className="mt-1.5 flex justify-between font-code text-[8.5px] leading-[normal] text-[#68717d]">
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
    <div className="flex items-center gap-[9px] border-t border-[#222830] py-[9px] text-[10.5px] first:border-t-0 [&>strong]:font-code [&>strong]:text-[10.5px] [&>strong]:leading-[normal]">
      <i
        className="m-0 inline-block size-[7px] shrink-0 rounded-full bg-brand"
        style={{ background: ok ? "var(--green)" : "var(--red)" }}
      />
      <div className="min-w-0 flex-1 [&>b]:block [&>b]:overflow-hidden [&>b]:text-[11px] [&>b]:text-ellipsis [&>b]:whitespace-nowrap [&>span]:text-[9px] [&>span]:text-[#85909a]">
        <b>{monitor.name}</b>
        <span>{monitor.type}</span>
      </div>
      <span className="font-code text-[9.5px] leading-[normal] text-[#85909a]">{monitor.uptimePct}%</span>
      <strong style={{ color: ok ? undefined : "var(--red)" }}>
        {ok ? `${monitor.latency}ms` : "DOWN"}
      </strong>
    </div>
  );
}

export default function MobileDashboardDemo() {
  const { monitors, monitorsTotal } = useDashboardState();

  return (
    <div className="hidden [@media(max-width:599px)]:mx-auto [@media(max-width:599px)]:mt-[42px] [@media(max-width:599px)]:block [@media(max-width:599px)]:max-w-[440px] [@media(max-width:599px)]:overflow-hidden [@media(max-width:599px)]:rounded-[14px] [@media(max-width:599px)]:border [@media(max-width:599px)]:border-[#2b3038] [@media(max-width:599px)]:bg-[#0e1115] [@media(max-width:599px)]:px-4 [@media(max-width:599px)]:pt-[18px] [@media(max-width:599px)]:pb-4 [@media(max-width:599px)]:text-left [@media(max-width:599px)]:shadow-[0_20px_50px_rgba(0,0,0,0.32)]" aria-label="Monitorly dashboard preview (mobile)">
      <div className="mb-3.5 flex items-center justify-between gap-2.5 [&>h3]:m-0 [&>h3]:text-[15px] [&>h3]:tracking-[-0.4px] [&_span]:mt-0.5 [&_span]:block [&_span]:text-[10.5px] [&_span]:text-muted">
        <div>
          <h3>Good morning, Helena</h3>
          <span>All systems are being watched</span>
        </div>
        <span className="shrink-0 rounded-[4px] border border-[#254d3a] px-[7px] py-[5px] font-code text-[10px] leading-[normal] text-brand">● LIVE</span>
      </div>

      <MobileSummary monitors={monitors} />

      <MobileSparkline monitors={monitors} />

      <div className="mt-2 rounded-[8px] border border-line bg-[#11151a] p-3">
        <div className="mb-1 flex items-center justify-between [&>h4]:m-0 [&>h4]:text-[11px] [&>h4]:font-semibold [&>small]:font-code [&>small]:text-[9px] [&>small]:leading-[normal] [&>small]:text-[#737c87]">
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
