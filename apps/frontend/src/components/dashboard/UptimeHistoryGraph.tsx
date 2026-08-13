//components-> dashboard-> UptimeHistoryGraph
import { useMemo, useState } from "react";
import { initialHistory } from "../../data/incidentHistory";
import { downtimeMinutes, buildMonitorHistory } from "../../utils/incidents";
import type { HistoryStatus } from "../../types/dashboard";

export interface UptimeHistoryMonitor {
  id: string;
  name: string;
  status?: "up" | "down" | string;
  /** Optional pre-computed history; when omitted one is generated (see buildMonitorHistory). */
  history?: HistoryStatus[];
}

interface UptimeHistoryGraphProps {
  /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
  live?: boolean;
  /**
   * Optional list of monitors to break the history out by row. With 0 or 1
   * monitors this renders exactly like the single combined graph. With 2+,
   * monitors needing attention are shown first, capped at `maxRows` (default
   * 4) so the panel never grows into an unbounded list — the rest are one
   * click away via `onViewAll`.
   */
  monitors?: UptimeHistoryMonitor[];
  maxRows?: number;
  onViewAll?: () => void;
}

/** Single 30-day incident bar row, shared by both the combined and per-monitor views. */
function IncidentBars({
  history,
  live,
  hoverDay,
  onHoverDay,
  height = 90,
  baseline,
}: {
  history: HistoryStatus[];
  live: boolean;
  hoverDay: number | null;
  onHoverDay: (day: number | null) => void;
  height?: number;
  baseline: number;
}) {
  const slot = 600 / history.length;
  const maxBar = live ? baseline - 8 : 6;

  return (
    <svg
      viewBox={`0 0 600 ${height}`}
      preserveAspectRatio="none"
      onMouseLeave={() => onHoverDay(null)}
    >
      <line
        x1="0"
        y1={baseline}
        x2="600"
        y2={baseline}
        stroke="#20262e"
        strokeWidth="1"
      />
      {history.map((h, i) => {
        const barWidth = slot - 4;
        const x = i * slot + 2;
        const barHeight = live
          ? h === "ok"
            ? 6
            : h === "warn"
              ? maxBar * 0.5
              : maxBar
          : 6;
        const y = baseline - barHeight;
        const active = live && hoverDay === i;
        const fill =
          h === "ok"
            ? "#2a4636"
            : h === "warn"
              ? "var(--yellow)"
              : "var(--red)";
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx="2"
            fill={fill}
            opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
            onMouseEnter={() => live && onHoverDay(i)}
          />
        );
      })}
    </svg>
  );
}

/**
 * Top-level component: this only branches on props and holds no hooks of its
 * own, so it's safe for `monitors` to grow from 0/1 to several across
 * re-renders (e.g. while monitors are still loading) without violating the
 * rules of hooks — each branch below is its own component with its own
 * hook state.
 */
export default function UptimeHistoryGraph({
  live = false,
  monitors,
  maxRows = 2,
  onViewAll,
}: UptimeHistoryGraphProps) {
  if (monitors && monitors.length > 1) {
    return (
      <MultiRowUptimeHistory
        live={live}
        monitors={monitors}
        maxRows={maxRows}
        onViewAll={onViewAll}
      />
    );
  }
  return <SingleRowUptimeHistory live={live} />;
}

function SingleRowUptimeHistory({ live }: { live: boolean }) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const history = useMemo(
    () => (live ? initialHistory : initialHistory.map(() => "ok" as const)),
    [live],
  );

  const flaggedDays = history.filter((h) => h !== "ok").length;
  const totalDowntime = useMemo(
    () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
    [history],
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <h4>Uptime history</h4>
        <small>30 DAYS</small>
      </div>
      <div className="incident-summary">
        <span>
          {live
            ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered`
            : "100% uptime"}
        </span>
        <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
      </div>
      <div className="incident-graph">
        <IncidentBars
          history={history}
          live={live}
          hoverDay={hoverDay}
          onHoverDay={setHoverDay}
          height={90}
          baseline={82}
        />
        {live &&
          hoverDay !== null &&
          (() => {
            const slot = 600 / history.length;
            const x = hoverDay * slot + slot / 2;
            const h = history[hoverDay];
            const mins = downtimeMinutes(h, hoverDay);
            const label =
              h === "ok"
                ? "No alerts"
                : h === "warn"
                  ? "Degraded performance"
                  : "Downtime alert";
            return (
              <div
                className="graph-tooltip"
                style={{ left: `${(x / 600) * 100}%`, top: "6%" }}
              >
                Day {hoverDay + 1} · <b>{label}</b>
                {mins > 0 && (
                  <span style={{ color: "#9aa2ac" }}> · {mins} min</span>
                )}
              </div>
            );
          })()}
        {!live && (
          <div className="graph-waiting graph-waiting-inset">
            <span>Metrics will appear once monitoring begins.</span>
          </div>
        )}
      </div>
      <div className="axis">
        <span>30d ago</span>
        <span>20d ago</span>
        <span>10d ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function MultiRowUptimeHistory({
  live,
  monitors,
  maxRows,
  onViewAll,
}: {
  live: boolean;
  monitors: UptimeHistoryMonitor[];
  maxRows: number;
  onViewAll?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<{ id: string; day: number } | null>(
    null,
  );

  const allRows = useMemo(
    () =>
      monitors.map((m, i) => ({
        ...m,
        history: m.history ?? buildMonitorHistory(i, m.status, live),
      })),
    [monitors, live],
  );

  // Monitors needing attention float to the top; everything else keeps its original order.
  const sortedRows = useMemo(
    () =>
      [...allRows].sort((a, b) => {
        const aDown = a.status === "down" ? 0 : 1;
        const bDown = b.status === "down" ? 0 : 1;
        if (aDown !== bDown) return aDown - bDown;
        const aFlagged = a.history.filter((h) => h !== "ok").length;
        const bFlagged = b.history.filter((h) => h !== "ok").length;
        return bFlagged - aFlagged;
      }),
    [allRows],
  );

  const rows = sortedRows.slice(0, maxRows);
  const hiddenCount = sortedRows.length - rows.length;
  const anyDown = allRows.some((r) => r.status === "down");

  return (
    <div className="panel">
      <div className="panel-head">
        <h4>Uptime history</h4>
        <small>30 DAYS · {allRows.length} MONITORS</small>
      </div>
      <div className="incident-summary">
        <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
        <span>Hover a monitor to focus it</span>
      </div>

      <div
        className={`uptime-rows${activeId ? " has-hover" : ""}`}
        onMouseLeave={() => setActiveId(null)}
      >
        {rows.map((row) => {
          const isActive = activeId === row.id;
          const dayHover =
            hoverDay && hoverDay.id === row.id ? hoverDay.day : null;
          const flaggedDays = row.history.filter((h) => h !== "ok").length;

          return (
            <div
              key={row.id}
              className={`uptime-row${isActive ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(row.id)}
            >
              <div className="uptime-row-head">
                <span>
                  <i
                    className="status-dot"
                    style={{
                      background:
                        row.status === "down" ? "var(--red)" : "var(--green)",
                      marginRight: 6,
                    }}
                  />
                  <b>{row.name}</b>
                </span>
                <span>
                  {live
                    ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"}`
                    : row.status === "down"
                      ? "Down now"
                      : "100% uptime"}
                </span>
              </div>
              <div className="incident-graph uptime-row-graph">
                <IncidentBars
                  history={row.history}
                  live={live}
                  hoverDay={dayHover}
                  onHoverDay={(day) =>
                    setHoverDay(day === null ? null : { id: row.id, day })
                  }
                  height={40}
                  baseline={34}
                />
                {live &&
                  dayHover !== null &&
                  (() => {
                    const slot = 600 / row.history.length;
                    const x = dayHover * slot + slot / 2;
                    const h = row.history[dayHover];
                    const mins = downtimeMinutes(h, dayHover);
                    const label =
                      h === "ok"
                        ? "No alerts"
                        : h === "warn"
                          ? "Degraded performance"
                          : "Downtime alert";
                    return (
                      <div
                        className="graph-tooltip"
                        style={{ left: `${(x / 600) * 100}%`, top: "0%" }}
                      >
                        Day {dayHover + 1} · <b>{label}</b>
                        {mins > 0 && (
                          <span style={{ color: "#9aa2ac" }}>
                            {" "}
                            · {mins} min
                          </span>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <div className="uptime-rows-viewall" onClick={onViewAll}>
          View all {allRows.length} monitors →
        </div>
      )}

      <div className="axis">
        <span>30d ago</span>
        <span>20d ago</span>
        <span>10d ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes } from "../../utils/incidents";

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;
// }

// export default function UptimeHistoryGraph({ live = false }: UptimeHistoryGraphProps) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <svg viewBox="0 0 600 90" preserveAspectRatio="none" onMouseLeave={() => setHoverDay(null)}>
//           <line x1="0" y1="82" x2="600" y2="82" stroke="#20262e" strokeWidth="1" />
//           {history.map((h, i) => {
//             const slot = 600 / history.length;
//             const barWidth = slot - 4;
//             const x = i * slot + 2;
//             const height = live ? (h === "ok" ? 6 : h === "warn" ? 36 : 74) : 6;
//             const y = 82 - height;
//             const active = live && hoverDay === i;
//             const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//             return (
//               <rect
//                 key={i}
//                 x={x}
//                 y={y}
//                 width={barWidth}
//                 height={height}
//                 rx="2"
//                 fill={fill}
//                 opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//                 onMouseEnter={() => live && setHoverDay(i)}
//               />
//             );
//           })}
//         </svg>
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// // src/components/dashboard/UptimeHistoryGraph.tsx
// import { useMemo, useState } from "react";
// import type { AppMonitor } from "@/types/app";

// // ---------- Types ----------
// export type ResponseRange = "hour" | "day" | "month";

// /** Backend shape for each uptime point */
// interface UptimePoint {
//   timestamp: string; // ISO string
//   status: "UP" | "DOWN";
// }

// /** Internal bar status (used for rendering) */
// type BarStatus = "ok" | "down";

// const RANGE_LABELS: Record<ResponseRange, string> = {
//   hour: "LAST HOUR",
//   day: "LAST 24 HOURS",
//   month: "LAST 30 DAYS",
// };

// interface UptimeHistoryGraphProps {
//   monitors?: AppMonitor[];
//   range?: ResponseRange;
//   maxRows?: number; // max visible rows in multi‑monitor view
//   onViewAll?: () => void;
// }

// // ---------- Helpers ----------
// /** Parse ISO timestamp to ms */
// function parseTimestamp(ts: string): number {
//   return new Date(ts).getTime();
// }

// /** Format timestamp for axis labels based on range */
// function formatAxisLabel(ts: number, range: ResponseRange): string {
//   const d = new Date(ts);
//   if (range === "hour") {
//     return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
//   }
//   if (range === "day") {
//     return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
//   }
//   // month
//   return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
// }

// /** Generate 5 evenly spaced axis labels from minTime to maxTime */
// function getAxisLabels(minTime: number, maxTime: number, range: ResponseRange): string[] {
//   if (!isFinite(minTime) || !isFinite(maxTime) || minTime === maxTime) {
//     return ["", "", "", "", ""];
//   }
//   const step = (maxTime - minTime) / 4;
//   const labels: string[] = [];
//   for (let i = 0; i < 4; i++) {
//     const ts = minTime + i * step;
//     labels.push(formatAxisLabel(ts, range));
//   }
//   labels.push("Now");
//   return labels;
// }

// /** Convert array of UptimePoint to BarStatus[] (simplify to ok/down) */
// function toBarStatuses(points: UptimePoint[]): BarStatus[] {
//   return points.map((p) => (p.status === "UP" ? "ok" : "down"));
// }

// /** Compute total downtime in minutes from a series of UptimePoint */
// function computeTotalDowntime(points: UptimePoint[]): number {
//   let total = 0;
//   for (let i = 0; i < points.length; i++) {
//     if (points[i].status === "DOWN") {
//       // If next point exists, duration = next.timestamp - current.timestamp (ms)
//       if (i + 1 < points.length) {
//         const currentTs = parseTimestamp(points[i].timestamp);
//         const nextTs = parseTimestamp(points[i + 1].timestamp);
//         total += (nextTs - currentTs) / 60000; // minutes
//       } else {
//         // Last point: assume it's still down, estimate 5 minutes (or use a default)
//         total += 5;
//       }
//     }
//   }
//   return Math.round(total);
// }

// // ---------- Sub-components ----------

// /** Single bar chart row – used for both single and multi-row views */
// function IncidentBars({
//   points,
//   hoverIndex,
//   onHoverIndex,
//   height = 90,
//   baseline,
// }: {
//   points: UptimePoint[];
//   hoverIndex: number | null;
//   onHoverIndex: (idx: number | null) => void;
//   height?: number;
//   baseline: number;
// }) {
//   const n = points.length;
//   if (n === 0) return null;

//   const slot = 600 / n;
//   const maxBar = baseline - 8;

//   return (
//     <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" onMouseLeave={() => onHoverIndex(null)}>
//       <line x1="0" y1={baseline} x2="600" y2={baseline} stroke="#20262e" strokeWidth="1" />
//       {points.map((p, i) => {
//         const barWidth = Math.max(slot - 4, 2);
//         const x = i * slot + (slot - barWidth) / 2;
//         const isDown = p.status === "DOWN";
//         const barHeight = isDown ? maxBar : 6;
//         const y = baseline - barHeight;
//         const active = hoverIndex === i;
//         const fill = isDown ? "var(--red)" : "#2a4636";
//         return (
//           <rect
//             key={i}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={barHeight}
//             rx="2"
//             fill={fill}
//             opacity={active ? 1 : isDown ? 0.85 : 0.9}
//             onMouseEnter={() => onHoverIndex(i)}
//           />
//         );
//       })}
//     </svg>
//   );
// }

// // ---------- Main Component ----------
// export default function UptimeHistoryGraph({
//   monitors,
//   range = "day",
//   maxRows = 2,
//   onViewAll,
// }: UptimeHistoryGraphProps) {
//   const label = RANGE_LABELS[range];

//   if (!monitors || monitors.length === 0) {
//     return <WaitingGraph label={label} />;
//   }

//   if (monitors.length === 1) {
//     return <SingleRowUptimeHistory range={range} label={label} monitor={monitors[0]} />;
//   }

//   return (
//     <MultiRowUptimeHistory
//       range={range}
//       label={label}
//       monitors={monitors}
//       maxRows={maxRows}
//       onViewAll={onViewAll}
//     />
//   );
// }

// // ---------- Sub-components ----------

// function WaitingGraph({ label }: { label: string }) {
//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>{label}</small>
//       </div>
//       <div className="incident-graph">
//         <div className="graph-waiting graph-waiting-inset">
//           <span>Metrics will appear once monitoring begins.</span>
//         </div>
//       </div>
//       <div className="axis">
//         <span>Start</span><span> </span><span> </span><span>Now</span>
//       </div>
//     </div>
//   );
// }

// function SingleRowUptimeHistory({
//   range,
//   label,
//   monitor,
// }: {
//   range: ResponseRange;
//   label: string;
//   monitor: AppMonitor;
// }) {
//   const points = monitor.graphs?.uptime?.[range] ?? [];
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);

//   const flaggedDays = points.filter((p) => p.status === "DOWN").length;
//   const totalDowntime = useMemo(() => computeTotalDowntime(points), [points]);

//   // Compute time bounds
//   const minTime = points.length > 0 ? parseTimestamp(points[0].timestamp) : Date.now() - 24 * 3600 * 1000;
//   const maxTime = points.length > 0 ? parseTimestamp(points[points.length - 1].timestamp) : Date.now();
//   const axisLabels = useMemo(() => getAxisLabels(minTime, maxTime, range), [minTime, maxTime, range]);

//   // Tooltip for hover
//   const hoverPoint = hoverIndex !== null ? points[hoverIndex] : null;
//   const hoverTimestamp = hoverPoint ? parseTimestamp(hoverPoint.timestamp) : 0;

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>{label}</small>
//       </div>
//       <div className="incident-summary">
//         <span>{flaggedDays > 0 ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{totalDowntime > 0 ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <IncidentBars
//           points={points}
//           hoverIndex={hoverIndex}
//           onHoverIndex={setHoverIndex}
//           height={90}
//           baseline={82}
//         />
//         {hoverPoint && (
//           <div className="graph-tooltip" style={{ left: `${(hoverIndex! / points.length) * 100}%`, top: "6%" }}>
//             {new Date(hoverTimestamp).toLocaleString("en-US", {
//               month: "short",
//               day: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//             <b>{hoverPoint.status === "DOWN" ? " · Down" : " · Up"}</b>
//             {hoverPoint.status === "DOWN" && totalDowntime > 0 && (
//               <span style={{ color: "#9aa2ac" }}> · {totalDowntime} min</span>
//             )}
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         {axisLabels.map((l, i) => (
//           <span key={i}>{l}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// function MultiRowUptimeHistory({
//   range,
//   label,
//   monitors,
//   maxRows,
//   onViewAll,
// }: {
//   range: ResponseRange;
//   label: string;
//   monitors: AppMonitor[];
//   maxRows: number;
//   onViewAll?: () => void;
// }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverIndex, setHoverIndex] = useState<{ id: string; idx: number } | null>(null);

//   // Build rows from monitors
//   const rows = useMemo(() => {
//     return monitors.map((m) => {
//       const points = m.graphs?.uptime?.[range] ?? [];
//       const flagged = points.filter((p) => p.status === "DOWN").length;
//       return {
//         id: m.id,
//         name: m.name,
//         status: m.status, // "up" or "down"
//         points,
//         flagged,
//       };
//     });
//   }, [monitors, range]);

//   // Sort: down first, then by most flagged
//   const sortedRows = useMemo(
//     () =>
//       [...rows].sort((a, b) => {
//         if (a.status === "down" && b.status !== "down") return -1;
//         if (a.status !== "down" && b.status === "down") return 1;
//         return b.flagged - a.flagged;
//       }),
//     [rows]
//   );

//   const visibleRows = sortedRows.slice(0, maxRows);
//   const hiddenCount = sortedRows.length - visibleRows.length;
//   const anyDown = rows.some((r) => r.status === "down");

//   // Axis labels: use first row's points if any
//   const firstPoints = visibleRows.length > 0 ? visibleRows[0].points : [];
//   const minTime = firstPoints.length > 0 ? parseTimestamp(firstPoints[0].timestamp) : Date.now() - 24 * 3600 * 1000;
//   const maxTime = firstPoints.length > 0 ? parseTimestamp(firstPoints[firstPoints.length - 1].timestamp) : Date.now();
//   const axisLabels = useMemo(() => getAxisLabels(minTime, maxTime, range), [minTime, maxTime, range]);

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>{label} · {rows.length} MONITORS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
//         <span>Hover a monitor to focus it</span>
//       </div>

//       <div className={`uptime-rows${activeId ? " has-hover" : ""}`} onMouseLeave={() => setActiveId(null)}>
//         {visibleRows.map((row) => {
//           const isActive = activeId === row.id;
//           const hoverIdx = hoverIndex?.id === row.id ? hoverIndex.idx : null;

//           return (
//             <div
//               key={row.id}
//               className={`uptime-row${isActive ? " is-active" : ""}`}
//               onMouseEnter={() => setActiveId(row.id)}
//             >
//               <div className="uptime-row-head">
//                 <span>
//                   <i
//                     className="status-dot"
//                     style={{
//                       background: row.status === "down" ? "var(--red)" : "var(--green)",
//                       marginRight: 6,
//                     }}
//                   />
//                   <b>{row.name}</b>
//                 </span>
//                 <span>{row.flagged > 0 ? `${row.flagged} alert${row.flagged === 1 ? "" : "s"}` : row.status === "down" ? "Down now" : "100% uptime"}</span>
//               </div>
//               <div className="incident-graph uptime-row-graph">
//                 <IncidentBars
//                   points={row.points}
//                   hoverIndex={hoverIdx}
//                   onHoverIndex={(idx) => setHoverIndex(idx === null ? null : { id: row.id, idx })}
//                   height={40}
//                   baseline={34}
//                 />
//                 {hoverIdx !== null && row.points[hoverIdx] && (
//                   <div className="graph-tooltip" style={{ left: `${(hoverIdx / row.points.length) * 100}%`, top: "0%" }}>
//                     {new Date(parseTimestamp(row.points[hoverIdx].timestamp)).toLocaleString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                     <b>{row.points[hoverIdx].status === "DOWN" ? " · Down" : " · Up"}</b>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {hiddenCount > 0 && (
//         <div className="uptime-rows-viewall" onClick={onViewAll}>
//           View all {rows.length} monitors →
//         </div>
//       )}

//       <div className="axis">
//         {axisLabels.map((l, i) => (
//           <span key={i}>{l}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// //components-> dashboard-> UptimeHistoryGraph
// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes, buildMonitorHistory } from "../../utils/incidents";
// import type { HistoryStatus } from "../../types/dashboard";
// import { AppMonitor } from "@/types/app";

// export interface UptimeHistoryMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed history; when omitted one is generated (see buildMonitorHistory). */
//   history?: HistoryStatus[];
// }

// // interface UptimeHistoryGraphProps {
// //   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
// //   live?: boolean;
// //   /**
// //    * Optional list of monitors to break the history out by row. With 0 or 1
// //    * monitors this renders exactly like the single combined graph. With 2+,
// //    * monitors needing attention are shown first, capped at `maxRows` (default
// //    * 4) so the panel never grows into an unbounded list — the rest are one
// //    * click away via `onViewAll`.
// //    */
// //   monitors?: UptimeHistoryMonitor[];
// //   maxRows?: number;
// //   onViewAll?: () => void;
// // }

// type ResponseRange = "hour" | "day" | "month";

// interface UptimeHistoryGraphProps {
//   live?: boolean;
//   monitors?: AppMonitor[];
//   range?: ResponseRange;
//   onViewAll?: () => void;
// }

// /** Single 30-day incident bar row, shared by both the combined and per-monitor views. */
// function IncidentBars({
//   history,
//   live,
//   hoverDay,
//   onHoverDay,
//   height = 90,
//   baseline,
// }: {
//   history: HistoryStatus[];
//   live: boolean;
//   hoverDay: number | null;
//   onHoverDay: (day: number | null) => void;
//   height?: number;
//   baseline: number;
// }) {
//   const slot = 600 / history.length;
//   const maxBar = live ? baseline - 8 : 6;

//   return (
//     <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" onMouseLeave={() => onHoverDay(null)}>
//       <line x1="0" y1={baseline} x2="600" y2={baseline} stroke="#20262e" strokeWidth="1" />
//       {history.map((h, i) => {
//         const barWidth = slot - 4;
//         const x = i * slot + 2;
//         const barHeight = live ? (h === "ok" ? 6 : h === "warn" ? maxBar * 0.5 : maxBar) : 6;
//         const y = baseline - barHeight;
//         const active = live && hoverDay === i;
//         const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//         return (
//           <rect
//             key={i}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={barHeight}
//             rx="2"
//             fill={fill}
//             opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//             onMouseEnter={() => live && onHoverDay(i)}
//           />
//         );
//       })}
//     </svg>
//   );
// }

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own
//  * hook state.
//  */
// interface UptimeHistoryGraphProps {
//   live?: boolean;
//   monitors?: AppMonitor[];
//   range?: ResponseRange;
//   maxRows?: number;
//   onViewAll?: () => void;
// } {
//   if (monitors && monitors.length > 1) {
//     return <MultiRowUptimeHistory live={live} monitors={monitors} maxRows={maxRows} onViewAll={onViewAll} />;
//   }
//   return <SingleRowUptimeHistory live={live} />;
// }

// function SingleRowUptimeHistory({ live }: { live: boolean }) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <IncidentBars history={history} live={live} hoverDay={hoverDay} onHoverDay={setHoverDay} height={90} baseline={82} />
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// function MultiRowUptimeHistory({
//   live,
//   monitors,
//   maxRows,
//   onViewAll,
// }: {
//   live: boolean;
//   monitors: UptimeHistoryMonitor[];
//   maxRows: number;
//   onViewAll?: () => void;
// }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverDay, setHoverDay] = useState<{ id: string; day: number } | null>(null);

//   const allRows = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         history: m.history ?? buildMonitorHistory(i, m.status, live),
//       })),
//     [monitors, live]
//   );

//   // Monitors needing attention float to the top; everything else keeps its original order.
//   const sortedRows = useMemo(
//     () =>
//       [...allRows].sort((a, b) => {
//         const aDown = a.status === "down" ? 0 : 1;
//         const bDown = b.status === "down" ? 0 : 1;
//         if (aDown !== bDown) return aDown - bDown;
//         const aFlagged = a.history.filter((h) => h !== "ok").length;
//         const bFlagged = b.history.filter((h) => h !== "ok").length;
//         return bFlagged - aFlagged;
//       }),
//     [allRows]
//   );

//   const rows = sortedRows.slice(0, maxRows);
//   const hiddenCount = sortedRows.length - rows.length;
//   const anyDown = allRows.some((r) => r.status === "down");

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS · {allRows.length} MONITORS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
//         <span>Hover a monitor to focus it</span>
//       </div>

//       <div className={`uptime-rows${activeId ? " has-hover" : ""}`} onMouseLeave={() => setActiveId(null)}>
//         {rows.map((row) => {
//           const isActive = activeId === row.id;
//           const dayHover = hoverDay && hoverDay.id === row.id ? hoverDay.day : null;
//           const flaggedDays = row.history.filter((h) => h !== "ok").length;

//           return (
//             <div
//               key={row.id}
//               className={`uptime-row${isActive ? " is-active" : ""}`}
//               onMouseEnter={() => setActiveId(row.id)}
//             >
//               <div className="uptime-row-head">
//                 <span>
//                   <i
//                     className="status-dot"
//                     style={{
//                       background: row.status === "down" ? "var(--red)" : "var(--green)",
//                       marginRight: 6,
//                     }}
//                   />
//                   <b>{row.name}</b>
//                 </span>
//                 <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"}` : row.status === "down" ? "Down now" : "100% uptime"}</span>
//               </div>
//               <div className="incident-graph uptime-row-graph">
//                 <IncidentBars
//                   history={row.history}
//                   live={live}
//                   hoverDay={dayHover}
//                   onHoverDay={(day) => setHoverDay(day === null ? null : { id: row.id, day })}
//                   height={40}
//                   baseline={34}
//                 />
//                 {live && dayHover !== null && (() => {
//                   const slot = 600 / row.history.length;
//                   const x = dayHover * slot + slot / 2;
//                   const h = row.history[dayHover];
//                   const mins = downtimeMinutes(h, dayHover);
//                   const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//                   return (
//                     <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "0%" }}>
//                       Day {dayHover + 1} · <b>{label}</b>
//                       {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {hiddenCount > 0 && (
//         <div className="uptime-rows-viewall" onClick={onViewAll}>
//           View all {allRows.length} monitors →
//         </div>
//       )}

//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// //components-> dashboard-> UptimeHistoryGraph
// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes, buildMonitorHistory } from "../../utils/incidents";
// import type { HistoryStatus } from "../../types/dashboard";

// export interface UptimeHistoryMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed history; when omitted one is generated (see buildMonitorHistory). */
//   history?: HistoryStatus[];
// }

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;
//   /**
//    * Optional list of monitors to break the history out by row. With 0 or 1
//    * monitors this renders exactly like the single combined graph. With 2+,
//    * monitors needing attention are shown first, capped at `maxRows` (default
//    * 4) so the panel never grows into an unbounded list — the rest are one
//    * click away via `onViewAll`.
//    */
//   monitors?: UptimeHistoryMonitor[];
//   maxRows?: number;
//   onViewAll?: () => void;
// }

// /** Single 30-day incident bar row, shared by both the combined and per-monitor views. */
// function IncidentBars({
//   history,
//   live,
//   hoverDay,
//   onHoverDay,
//   height = 90,
//   baseline,
// }: {
//   history: HistoryStatus[];
//   live: boolean;
//   hoverDay: number | null;
//   onHoverDay: (day: number | null) => void;
//   height?: number;
//   baseline: number;
// }) {
//   const slot = 600 / history.length;
//   const maxBar = live ? baseline - 8 : 6;

//   return (
//     <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" onMouseLeave={() => onHoverDay(null)}>
//       <line x1="0" y1={baseline} x2="600" y2={baseline} stroke="#20262e" strokeWidth="1" />
//       {history.map((h, i) => {
//         const barWidth = slot - 4;
//         const x = i * slot + 2;
//         const barHeight = live ? (h === "ok" ? 6 : h === "warn" ? maxBar * 0.5 : maxBar) : 6;
//         const y = baseline - barHeight;
//         const active = live && hoverDay === i;
//         const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//         return (
//           <rect
//             key={i}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={barHeight}
//             rx="2"
//             fill={fill}
//             opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//             onMouseEnter={() => live && onHoverDay(i)}
//           />
//         );
//       })}
//     </svg>
//   );
// }

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own
//  * hook state.
//  */
// export default function UptimeHistoryGraph({ live = false, monitors, maxRows = 4, onViewAll }: UptimeHistoryGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <MultiRowUptimeHistory live={live} monitors={monitors} maxRows={maxRows} onViewAll={onViewAll} />;
//   }
//   return <SingleRowUptimeHistory live={live} />;
// }

// function SingleRowUptimeHistory({ live }: { live: boolean }) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <IncidentBars history={history} live={live} hoverDay={hoverDay} onHoverDay={setHoverDay} height={90} baseline={82} />
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// function MultiRowUptimeHistory({
//   live,
//   monitors,
//   maxRows,
//   onViewAll,
// }: {
//   live: boolean;
//   monitors: UptimeHistoryMonitor[];
//   maxRows: number;
//   onViewAll?: () => void;
// }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverDay, setHoverDay] = useState<{ id: string; day: number } | null>(null);

//   const allRows = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         history: m.history ?? buildMonitorHistory(i, m.status, live),
//       })),
//     [monitors, live]
//   );

//   // Monitors needing attention float to the top; everything else keeps its original order.
//   const sortedRows = useMemo(
//     () =>
//       [...allRows].sort((a, b) => {
//         const aDown = a.status === "down" ? 0 : 1;
//         const bDown = b.status === "down" ? 0 : 1;
//         if (aDown !== bDown) return aDown - bDown;
//         const aFlagged = a.history.filter((h) => h !== "ok").length;
//         const bFlagged = b.history.filter((h) => h !== "ok").length;
//         return bFlagged - aFlagged;
//       }),
//     [allRows]
//   );

//   const rows = sortedRows.slice(0, maxRows);
//   const hiddenCount = sortedRows.length - rows.length;
//   const anyDown = allRows.some((r) => r.status === "down");

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS · {allRows.length} MONITORS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
//         <span>Hover a monitor to focus it</span>
//       </div>

//       <div className="uptime-rows" onMouseLeave={() => setActiveId(null)}>
//         {rows.map((row) => {
//           const isActive = activeId === row.id;
//           const dayHover = hoverDay && hoverDay.id === row.id ? hoverDay.day : null;
//           const flaggedDays = row.history.filter((h) => h !== "ok").length;

//           return (
//             <div
//               key={row.id}
//               className={`uptime-row${isActive ? " is-active" : ""}`}
//               onMouseEnter={() => setActiveId(row.id)}
//             >
//               <div className="uptime-row-head">
//                 <span>
//                   <i
//                     className="status-dot"
//                     style={{
//                       background: row.status === "down" ? "var(--red)" : "var(--green)",
//                       marginRight: 6,
//                     }}
//                   />
//                   <b>{row.name}</b>
//                 </span>
//                 <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"}` : row.status === "down" ? "Down now" : "100% uptime"}</span>
//               </div>
//               <div className="incident-graph uptime-row-graph">
//                 <IncidentBars
//                   history={row.history}
//                   live={live}
//                   hoverDay={dayHover}
//                   onHoverDay={(day) => setHoverDay(day === null ? null : { id: row.id, day })}
//                   height={40}
//                   baseline={34}
//                 />
//                 {live && dayHover !== null && (() => {
//                   const slot = 600 / row.history.length;
//                   const x = dayHover * slot + slot / 2;
//                   const h = row.history[dayHover];
//                   const mins = downtimeMinutes(h, dayHover);
//                   const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//                   return (
//                     <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "0%" }}>
//                       Day {dayHover + 1} · <b>{label}</b>
//                       {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {hiddenCount > 0 && (
//         <div className="uptime-rows-viewall" onClick={onViewAll}>
//           View all {allRows.length} monitors →
//         </div>
//       )}

//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// //components-> dashboard-> UptimeHistoryGraph
// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes, buildMonitorHistory } from "../../utils/incidents";
// import type { HistoryStatus } from "../../types/dashboard";

// export interface UptimeHistoryMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed history; when omitted one is generated (see buildMonitorHistory). */
//   history?: HistoryStatus[];
// }

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;
//   /**
//    * Optional list of monitors to break the history out by row. With 0 or 1
//    * monitors this renders exactly like the single combined graph. With 2+,
//    * monitors needing attention are shown first, capped at `maxRows` (default
//    * 4) so the panel never grows into an unbounded list — the rest are one
//    * click away via `onViewAll`.
//    */
//   monitors?: UptimeHistoryMonitor[];
//   maxRows?: number;
//   onViewAll?: () => void;
// }

// /** Single 30-day incident bar row, shared by both the combined and per-monitor views. */
// function IncidentBars({
//   history,
//   live,
//   hoverDay,
//   onHoverDay,
//   height = 90,
//   baseline,
// }: {
//   history: HistoryStatus[];
//   live: boolean;
//   hoverDay: number | null;
//   onHoverDay: (day: number | null) => void;
//   height?: number;
//   baseline: number;
// }) {
//   const slot = 600 / history.length;
//   const maxBar = live ? baseline - 8 : 6;

//   return (
//     <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" onMouseLeave={() => onHoverDay(null)}>
//       <line x1="0" y1={baseline} x2="600" y2={baseline} stroke="#20262e" strokeWidth="1" />
//       {history.map((h, i) => {
//         const barWidth = slot - 4;
//         const x = i * slot + 2;
//         const barHeight = live ? (h === "ok" ? 6 : h === "warn" ? maxBar * 0.5 : maxBar) : 6;
//         const y = baseline - barHeight;
//         const active = live && hoverDay === i;
//         const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//         return (
//           <rect
//             key={i}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={barHeight}
//             rx="2"
//             fill={fill}
//             opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//             onMouseEnter={() => live && onHoverDay(i)}
//           />
//         );
//       })}
//     </svg>
//   );
// }

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own
//  * hook state.
//  */
// export default function UptimeHistoryGraph({ live = false, monitors, maxRows = 4, onViewAll }: UptimeHistoryGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <MultiRowUptimeHistory live={live} monitors={monitors} maxRows={maxRows} onViewAll={onViewAll} />;
//   }
//   return <SingleRowUptimeHistory live={live} />;
// }

// function SingleRowUptimeHistory({ live }: { live: boolean }) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <IncidentBars history={history} live={live} hoverDay={hoverDay} onHoverDay={setHoverDay} height={90} baseline={82} />
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// function MultiRowUptimeHistory({
//   live,
//   monitors,
//   maxRows,
//   onViewAll,
// }: {
//   live: boolean;
//   monitors: UptimeHistoryMonitor[];
//   maxRows: number;
//   onViewAll?: () => void;
// }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverDay, setHoverDay] = useState<{ id: string; day: number } | null>(null);

//   const allRows = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         history: m.history ?? buildMonitorHistory(i, m.status, live),
//       })),
//     [monitors, live]
//   );

//   // Monitors needing attention float to the top; everything else keeps its original order.
//   const sortedRows = useMemo(
//     () =>
//       [...allRows].sort((a, b) => {
//         const aDown = a.status === "down" ? 0 : 1;
//         const bDown = b.status === "down" ? 0 : 1;
//         if (aDown !== bDown) return aDown - bDown;
//         const aFlagged = a.history.filter((h) => h !== "ok").length;
//         const bFlagged = b.history.filter((h) => h !== "ok").length;
//         return bFlagged - aFlagged;
//       }),
//     [allRows]
//   );

//   const rows = sortedRows.slice(0, maxRows);
//   const hiddenCount = sortedRows.length - rows.length;
//   const anyDown = allRows.some((r) => r.status === "down");

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS · {allRows.length} MONITORS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
//         <span>Hover a monitor to focus it</span>
//       </div>

//       <div className="uptime-rows" onMouseLeave={() => setActiveId(null)}>
//         {rows.map((row) => {
//           const isActive = activeId === row.id;
//           const dayHover = hoverDay && hoverDay.id === row.id ? hoverDay.day : null;
//           const flaggedDays = row.history.filter((h) => h !== "ok").length;

//           return (
//             <div
//               key={row.id}
//               className={`uptime-row${isActive ? " is-active" : ""}`}
//               onMouseEnter={() => setActiveId(row.id)}
//             >
//               <div className="uptime-row-head">
//                 <span>
//                   <i
//                     className="status-dot"
//                     style={{
//                       background: row.status === "down" ? "var(--red)" : "var(--green)",
//                       marginRight: 6,
//                     }}
//                   />
//                   <b>{row.name}</b>
//                 </span>
//                 <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"}` : row.status === "down" ? "Down now" : "100% uptime"}</span>
//               </div>
//               <div className="incident-graph uptime-row-graph">
//                 <IncidentBars
//                   history={row.history}
//                   live={live}
//                   hoverDay={dayHover}
//                   onHoverDay={(day) => setHoverDay(day === null ? null : { id: row.id, day })}
//                   height={40}
//                   baseline={34}
//                 />
//                 {live && dayHover !== null && (() => {
//                   const slot = 600 / row.history.length;
//                   const x = dayHover * slot + slot / 2;
//                   const h = row.history[dayHover];
//                   const mins = downtimeMinutes(h, dayHover);
//                   const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//                   return (
//                     <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "0%" }}>
//                       Day {dayHover + 1} · <b>{label}</b>
//                       {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {hiddenCount > 0 && (
//         <div className="uptime-rows-viewall" onClick={onViewAll}>
//           View all {allRows.length} monitors →
//         </div>
//       )}

//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes } from "../../utils/incidents";

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;
// }

// export default function UptimeHistoryGraph({ live = false }: UptimeHistoryGraphProps) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <svg viewBox="0 0 600 90" preserveAspectRatio="none" onMouseLeave={() => setHoverDay(null)}>
//           <line x1="0" y1="82" x2="600" y2="82" stroke="#20262e" strokeWidth="1" />
//           {history.map((h, i) => {
//             const slot = 600 / history.length;
//             const barWidth = slot - 4;
//             const x = i * slot + 2;
//             const height = live ? (h === "ok" ? 6 : h === "warn" ? 36 : 74) : 6;
//             const y = 82 - height;
//             const active = live && hoverDay === i;
//             const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//             return (
//               <rect
//                 key={i}
//                 x={x}
//                 y={y}
//                 width={barWidth}
//                 height={height}
//                 rx="2"
//                 fill={fill}
//                 opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//                 onMouseEnter={() => live && setHoverDay(i)}
//               />
//             );
//           })}
//         </svg>
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// //components-> dashboard-> UptimeHistoryGraph
// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes, buildMonitorHistory } from "../../utils/incidents";
// import type { HistoryStatus } from "../../types/dashboard";

// export interface UptimeHistoryMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed history; when omitted one is generated (see buildMonitorHistory). */
//   history?: HistoryStatus[];
// }

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;
//   /**
//    * Optional list of monitors to break the history out by row. With 0 or 1
//    * monitors this renders exactly like the single combined graph. With 2+,
//    * each monitor gets its own row and hovering one row focuses it while the
//    * others dim and blur out of the way.
//    */
//   monitors?: UptimeHistoryMonitor[];
// }

// /** Single 30-day incident bar row, shared by both the combined and per-monitor views. */
// function IncidentBars({
//   history,
//   live,
//   hoverDay,
//   onHoverDay,
//   height = 90,
//   baseline,
// }: {
//   history: HistoryStatus[];
//   live: boolean;
//   hoverDay: number | null;
//   onHoverDay: (day: number | null) => void;
//   height?: number;
//   baseline: number;
// }) {
//   const slot = 600 / history.length;
//   const maxBar = live ? baseline - 8 : 6;

//   return (
//     <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" onMouseLeave={() => onHoverDay(null)}>
//       <line x1="0" y1={baseline} x2="600" y2={baseline} stroke="#20262e" strokeWidth="1" />
//       {history.map((h, i) => {
//         const barWidth = slot - 4;
//         const x = i * slot + 2;
//         const barHeight = live ? (h === "ok" ? 6 : h === "warn" ? maxBar * 0.5 : maxBar) : 6;
//         const y = baseline - barHeight;
//         const active = live && hoverDay === i;
//         const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//         return (
//           <rect
//             key={i}
//             x={x}
//             y={y}
//             width={barWidth}
//             height={barHeight}
//             rx="2"
//             fill={fill}
//             opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//             onMouseEnter={() => live && onHoverDay(i)}
//           />
//         );
//       })}
//     </svg>
//   );
// }

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own
//  * hook state.
//  */
// export default function UptimeHistoryGraph({ live = false, monitors }: UptimeHistoryGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <MultiRowUptimeHistory live={live} monitors={monitors} />;
//   }
//   return <SingleRowUptimeHistory live={live} />;
// }

// function SingleRowUptimeHistory({ live }: { live: boolean }) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <IncidentBars history={history} live={live} hoverDay={hoverDay} onHoverDay={setHoverDay} height={90} baseline={82} />
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// function MultiRowUptimeHistory({ live, monitors }: { live: boolean; monitors: UptimeHistoryMonitor[] }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverDay, setHoverDay] = useState<{ id: string; day: number } | null>(null);

//   const rows = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         history: m.history ?? buildMonitorHistory(i, m.status, live),
//       })),
//     [monitors, live]
//   );

//   const anyDown = rows.some((r) => r.status === "down");

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS · {rows.length} MONITORS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{anyDown ? "Attention needed" : "All monitors healthy"}</span>
//         <span>Hover a monitor to focus it</span>
//       </div>

//       <div className={`uptime-rows${activeId ? " has-hover" : ""}`} onMouseLeave={() => setActiveId(null)}>
//         {rows.map((row) => {
//           const isActive = activeId === row.id;
//           const dayHover = hoverDay && hoverDay.id === row.id ? hoverDay.day : null;
//           const flaggedDays = row.history.filter((h) => h !== "ok").length;

//           return (
//             <div
//               key={row.id}
//               className={`uptime-row${isActive ? " is-active" : ""}`}
//               onMouseEnter={() => setActiveId(row.id)}
//             >
//               <div className="uptime-row-head">
//                 <span>
//                   <i
//                     className="status-dot"
//                     style={{
//                       background: row.status === "down" ? "var(--red)" : "var(--green)",
//                       marginRight: 6,
//                     }}
//                   />
//                   <b>{row.name}</b>
//                 </span>
//                 <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"}` : row.status === "down" ? "Down now" : "100% uptime"}</span>
//               </div>
//               <div className="incident-graph uptime-row-graph">
//                 <IncidentBars
//                   history={row.history}
//                   live={live}
//                   hoverDay={dayHover}
//                   onHoverDay={(day) => setHoverDay(day === null ? null : { id: row.id, day })}
//                   height={40}
//                   baseline={34}
//                 />
//                 {live && dayHover !== null && (() => {
//                   const slot = 600 / row.history.length;
//                   const x = dayHover * slot + slot / 2;
//                   const h = row.history[dayHover];
//                   const mins = downtimeMinutes(h, dayHover);
//                   const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//                   return (
//                     <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "0%" }}>
//                       Day {dayHover + 1} · <b>{label}</b>
//                       {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//                     </div>
//                   );
//                 })()}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }

// import { useMemo, useState } from "react";
// import { initialHistory } from "../../data/incidentHistory";
// import { downtimeMinutes } from "../../utils/incidents";

// interface UptimeHistoryGraphProps {
//   /** When false (default for the real product), renders a flat 100% history with no fabricated incidents. */
//   live?: boolean;

// }

// export default function UptimeHistoryGraph({ live = false }: UptimeHistoryGraphProps) {
//   const [hoverDay, setHoverDay] = useState<number | null>(null);
//   const history = useMemo(() => (live ? initialHistory : initialHistory.map(() => "ok" as const)), [live]);

//   const flaggedDays = history.filter((h) => h !== "ok").length;
//   const totalDowntime = useMemo(
//     () => history.reduce((sum, h, i) => sum + downtimeMinutes(h, i), 0),
//     [history]
//   );

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Uptime history</h4>
//         <small>30 DAYS</small>
//       </div>
//       <div className="incident-summary">
//         <span>{live ? `${flaggedDays} alert${flaggedDays === 1 ? "" : "s"} triggered` : "100% uptime"}</span>
//         <span>{live ? `${totalDowntime} min downtime` : "0 min downtime"}</span>
//       </div>
//       <div className="incident-graph">
//         <svg viewBox="0 0 600 90" preserveAspectRatio="none" onMouseLeave={() => setHoverDay(null)}>
//           <line x1="0" y1="82" x2="600" y2="82" stroke="#20262e" strokeWidth="1" />
//           {history.map((h, i) => {
//             const slot = 600 / history.length;
//             const barWidth = slot - 4;
//             const x = i * slot + 2;
//             const height = live ? (h === "ok" ? 6 : h === "warn" ? 36 : 74) : 6;
//             const y = 82 - height;
//             const active = live && hoverDay === i;
//             const fill = h === "ok" ? "#2a4636" : h === "warn" ? "var(--yellow)" : "var(--red)";
//             return (
//               <rect
//                 key={i}
//                 x={x}
//                 y={y}
//                 width={barWidth}
//                 height={height}
//                 rx="2"
//                 fill={fill}
//                 opacity={active ? 1 : h === "ok" ? 0.9 : 0.75}
//                 onMouseEnter={() => live && setHoverDay(i)}
//               />
//             );
//           })}
//         </svg>
//         {live && hoverDay !== null && (() => {
//           const slot = 600 / history.length;
//           const x = hoverDay * slot + slot / 2;
//           const h = history[hoverDay];
//           const mins = downtimeMinutes(h, hoverDay);
//           const label = h === "ok" ? "No alerts" : h === "warn" ? "Degraded performance" : "Downtime alert";
//           return (
//             <div className="graph-tooltip" style={{ left: `${(x / 600) * 100}%`, top: "6%" }}>
//               Day {hoverDay + 1} · <b>{label}</b>
//               {mins > 0 && <span style={{ color: "#9aa2ac" }}> · {mins} min</span>}
//             </div>
//           );
//         })()}
//         {!live && (
//           <div className="graph-waiting graph-waiting-inset">
//             <span>Metrics will appear once monitoring begins.</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>30d ago</span><span>20d ago</span><span>10d ago</span><span>Today</span>
//       </div>
//     </div>
//   );
// }
