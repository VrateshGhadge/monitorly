import { useMemo, useRef, useState } from "react";
import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
import { buildSmoothPath } from "../../utils/path";
import {
  nearestIndex,
  xToTime,
  yToLatency,
  buildMonitorSeries,
  averageSeries,
} from "../../utils/responseTimeGraph";

export interface ResponseTimeMonitor {
  id: string;
  name: string;
  status?: "up" | "down" | string;
  /** Optional pre-computed Y-series (one value per GRAPH_X sample); generated when omitted. */
  series?: number[];
}

interface ResponseTimeGraphProps {
  /** When false (default for the real product), renders a flat line with no fabricated samples. */
  live?: boolean;
  /**
   * Optional list of monitors. With 0 or 1 monitors this renders exactly
   * like the single combined graph. With 2+, the chart defaults to one
   * blended "all monitors" average line (so it never turns into a tangle of
   * overlapping lines) — clicking a monitor in the legend swaps in that
   * monitor's own line instead. Only ever one line on screen at a time.
   */
  monitors?: ResponseTimeMonitor[];
}

const FLAT_Y = 96;
const LINE_COLORS = [
  "#50d890",
  "#5b9dff",
  "#c792ea",
  "#f5a76c",
  "#f2789a",
  "#6ee7d4",
];

/**
 * Top-level component: this only branches on props and holds no hooks of its
 * own, so it's safe for `monitors` to grow from 0/1 to several across
 * re-renders (e.g. while monitors are still loading) without violating the
 * rules of hooks — each branch below is its own component with its own hook
 * state.
 */
export default function ResponseTimeGraph({
  live = false,
  monitors,
}: ResponseTimeGraphProps) {
  if (monitors && monitors.length > 1) {
    return <SelectableResponseTimeGraph live={live} monitors={monitors} />;
  }
  return <SingleLineResponseTimeGraph live={live} />;
}

function SingleLineResponseTimeGraph({ live }: { live: boolean }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const linePath = useMemo(
    () =>
      live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`,
    [live],
  );
  const fillPath = `${linePath} V135 H0 Z`;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!live) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    setHoverIndex(nearestIndex(GRAPH_X, x));
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h4>Response time</h4>
        <small>LAST 24 HOURS</small>
      </div>
      <div className="graph">
        <svg
          ref={svgRef}
          viewBox="0 0 600 135"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          style={{ cursor: live ? "crosshair" : "default" }}
        >
          <path
            d={linePath}
            fill="none"
            stroke={live ? "#50d890" : "#3a4048"}
            strokeWidth="2"
            strokeDasharray={live ? undefined : "4 4"}
          />
          <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
          <defs>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={live ? "#50d890" : "#3a4048"} />
              <stop
                offset="1"
                stopColor={live ? "#50d890" : "#3a4048"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {live && hoverIndex !== null && (
            <line
              x1={GRAPH_X[hoverIndex]}
              x2={GRAPH_X[hoverIndex]}
              y1={0}
              y2={135}
              stroke="#3a4048"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}
          {live &&
            GRAPH_X.map((gx, i) => {
              const active = i === hoverIndex;
              return (
                <circle
                  key={i}
                  cx={gx}
                  cy={GRAPH_Y[i]}
                  r={active ? 6 : 3}
                  fill={active ? "#50d890" : "#2c333c"}
                  stroke={active ? "#0b0d10" : "none"}
                  strokeWidth={active ? 2 : 0}
                  onPointerEnter={() => setHoverIndex(i)}
                />
              );
            })}
        </svg>
        {live && hoverIndex !== null && (
          <div
            className="graph-tooltip"
            style={{
              left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
              top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
            }}
          >
            {xToTime(GRAPH_X[hoverIndex])} ·{" "}
            <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
          </div>
        )}
        {!live && (
          <div className="graph-waiting">
            <span>Waiting for monitoring data…</span>
          </div>
        )}
      </div>
      <div className="axis">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>NOW</span>
      </div>
    </div>
  );
}

function SelectableResponseTimeGraph({
  live,
  monitors,
}: {
  live: boolean;
  monitors: ResponseTimeMonitor[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const lines = useMemo(
    () =>
      monitors.map((m, i) => ({
        ...m,
        series: m.series ?? buildMonitorSeries(GRAPH_Y, i, live),
        color: LINE_COLORS[i % LINE_COLORS.length],
      })),
    [monitors, live],
  );

  const aggregateSeries = useMemo(
    () => averageSeries(lines.map((l) => l.series)),
    [lines],
  );

  const selected = lines.find((l) => l.id === selectedId) ?? null;
  const activeSeries = selected ? selected.series : aggregateSeries;
  const activeColor = selected ? selected.color : "#50d890";
  const activeLabel = selected ? selected.name : "All monitors (avg)";
  const activePath = useMemo(
    () =>
      live
        ? buildSmoothPath(GRAPH_X, activeSeries)
        : `M0,${FLAT_Y} L600,${FLAT_Y}`,
    [live, activeSeries],
  );
  const fillPath = `${activePath} V135 H0 Z`;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!live) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    setHoverIndex(nearestIndex(GRAPH_X, x));
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h4>Response time</h4>
        <small>LAST 24 HOURS</small>
      </div>

      <div className="rt-legend">
        <span
          className={`rt-legend-item${selectedId === null ? " is-active" : ""}`}
          onClick={() => setSelectedId(null)}
        >
          <i className="rt-legend-dot" style={{ background: "#50d890" }} />
          All monitors (avg)
        </span>
        {lines.map((line) => (
          <span
            key={line.id}
            className={`rt-legend-item${selectedId === line.id ? " is-active" : ""}`}
            onClick={() =>
              setSelectedId(selectedId === line.id ? null : line.id)
            }
          >
            <i className="rt-legend-dot" style={{ background: line.color }} />
            {line.name}
          </span>
        ))}
      </div>

      <div className="graph">
        <svg
          ref={svgRef}
          viewBox="0 0 600 135"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          style={{ cursor: live ? "crosshair" : "default" }}
        >
          <path
            d={activePath}
            fill="none"
            stroke={live ? activeColor : "#3a4048"}
            strokeWidth="2"
            strokeDasharray={live ? undefined : "4 4"}
          />
          <path d={fillPath} fill="url(#rt-fade)" opacity={live ? 0.2 : 0.08} />
          <defs>
            <linearGradient id="rt-fade" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={live ? activeColor : "#3a4048"} />
              <stop
                offset="1"
                stopColor={live ? activeColor : "#3a4048"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {live && hoverIndex !== null && (
            <>
              <line
                x1={GRAPH_X[hoverIndex]}
                x2={GRAPH_X[hoverIndex]}
                y1={0}
                y2={135}
                stroke="#3a4048"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={GRAPH_X[hoverIndex]}
                cy={activeSeries[hoverIndex]}
                r={6}
                fill={activeColor}
                stroke="#0b0d10"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
        {live && hoverIndex !== null && (
          <div
            className="graph-tooltip"
            style={{
              left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
              top: `${(activeSeries[hoverIndex] / 135) * 100}%`,
            }}
          >
            <b style={{ color: activeColor }}>{activeLabel}</b> ·{" "}
            {xToTime(GRAPH_X[hoverIndex])} ·{" "}
            <b>{yToLatency(activeSeries[hoverIndex])}ms</b>
          </div>
        )}
        {!live && (
          <div className="graph-waiting">
            <span>Waiting for monitoring data…</span>
          </div>
        )}
      </div>
      <div className="axis">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>NOW</span>
      </div>
    </div>
  );
}

// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency } from "../../utils/responseTimeGraph";

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
// }

// const FLAT_Y = 96;

// export default function ResponseTimeGraph({ live = false }: ResponseTimeGraphProps) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// //src->components->dashboard->ResponseTimeGraph
// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency, buildMonitorSeries, averageSeries } from "../../utils/responseTimeGraph";

// export interface ResponseTimeMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed Y-series (one value per GRAPH_X sample); generated when omitted. */
//   series?: number[];
// }

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
//   /**
//    * Optional list of monitors. With 0 or 1 monitors this renders exactly
//    * like the single combined graph. With 2+, the chart defaults to one
//    * blended "all monitors" average line (so it never turns into a tangle of
//    * overlapping lines) — clicking a monitor in the legend swaps in that
//    * monitor's own line instead. Only ever one line on screen at a time.
//    */
//   monitors?: ResponseTimeMonitor[];
// }

// const FLAT_Y = 96;
// const LINE_COLORS = ["#50d890", "#5b9dff", "#c792ea", "#f5a76c", "#f2789a", "#6ee7d4"];

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own hook
//  * state.
//  */
// export default function ResponseTimeGraph({ live = false, monitors }: ResponseTimeGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <SelectableResponseTimeGraph live={live} monitors={monitors} />;
//   }
//   return <SingleLineResponseTimeGraph live={live} />;
// }

// function SingleLineResponseTimeGraph({ live }: { live: boolean }) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// function SelectableResponseTimeGraph({ live, monitors }: { live: boolean; monitors: ResponseTimeMonitor[] }) {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const lines = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         series: m.series ?? buildMonitorSeries(GRAPH_Y, i, live, FLAT_Y),
//         color: LINE_COLORS[i % LINE_COLORS.length],
//       })),
//     [monitors, live]
//   );

//   const aggregateSeries = useMemo(() => averageSeries(lines.map((l) => l.series)), [lines]);

//   const selected = lines.find((l) => l.id === selectedId) ?? null;
//   const activeSeries = selected ? selected.series : aggregateSeries;
//   const activeColor = selected ? selected.color : "#50d890";
//   const activeLabel = selected ? selected.name : "All monitors (avg)";
//   const activePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, activeSeries) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live, activeSeries]
//   );
//   const fillPath = `${activePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>

//       <div className="rt-legend">
//         <span
//           className={`rt-legend-item${selectedId === null ? " is-active" : ""}`}
//           onClick={() => setSelectedId(null)}
//         >
//           <i className="rt-legend-dot" style={{ background: "#50d890" }} />
//           All monitors (avg)
//         </span>
//         {lines.map((line) => (
//           <span
//             key={line.id}
//             className={`rt-legend-item${selectedId === line.id ? " is-active" : ""}`}
//             onClick={() => setSelectedId(selectedId === line.id ? null : line.id)}
//           >
//             <i className="rt-legend-dot" style={{ background: line.color }} />
//             {line.name}
//           </span>
//         ))}
//       </div>

//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={activePath}
//             fill="none"
//             stroke={live ? activeColor : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#rt-fade)" opacity={live ? 0.2 : 0.08} />
//           <defs>
//             <linearGradient id="rt-fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? activeColor : "#3a4048"} />
//               <stop offset="1" stopColor={live ? activeColor : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <>
//               <line
//                 x1={GRAPH_X[hoverIndex]}
//                 x2={GRAPH_X[hoverIndex]}
//                 y1={0}
//                 y2={135}
//                 stroke="#3a4048"
//                 strokeWidth="1"
//                 strokeDasharray="3 3"
//               />
//               <circle
//                 cx={GRAPH_X[hoverIndex]}
//                 cy={activeSeries[hoverIndex]}
//                 r={6}
//                 fill={activeColor}
//                 stroke="#0b0d10"
//                 strokeWidth={2}
//               />
//             </>
//           )}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(activeSeries[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             <b style={{ color: activeColor }}>{activeLabel}</b> · {xToTime(GRAPH_X[hoverIndex])} ·{" "}
//             <b>{yToLatency(activeSeries[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// ------------------------------------------------
// src/components/dashboard/ResponseTimeGraph.tsx
// import { useMemo, useRef, useState } from "react";

// // ---------- Types ----------
// export interface ResponseTimeDataPoint {
//   timestamp: string; // ISO string
//   value: number | null;
// }

// export interface ResponseTimeMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down";
//   graphs: {
//     response: {
//       hour: ResponseTimeDataPoint[];
//       day: ResponseTimeDataPoint[];
//       month: ResponseTimeDataPoint[];
//     };
//   };
// }

// export type ResponseRange = "hour" | "day" | "month";

// interface ResponseTimeGraphProps {
//   range?: ResponseRange;
//   monitors?: ResponseTimeMonitor[];
// }

// const RANGE_LABELS: Record<ResponseRange, string> = {
//   hour: "LAST HOUR",
//   day: "LAST 24 HOURS",
//   month: "LAST 30 DAYS",
// };

// // ---------- Helpers ----------
// function parseTimestamp(ts: string): number {
//   return new Date(ts).getTime();
// }

// function toValidPoints(points: ResponseTimeDataPoint[]): { timestamp: number; value: number }[] {
//   return points
//     .filter((p) => p.value !== null)
//     .map((p) => ({ timestamp: parseTimestamp(p.timestamp), value: p.value as number }));
// }

// function buildPathFromPoints(
//   points: ResponseTimeDataPoint[],
//   width: number,
//   height: number,
//   minTimestamp: number,
//   maxTimestamp: number,
//   minValue: number,
//   maxValue: number
// ): string {
//   const valid = toValidPoints(points);
//   if (valid.length === 0) return `M0,${height} L${width},${height}`;

//   const timeRange = maxTimestamp - minTimestamp || 1;
//   const valueRange = maxValue - minValue || 1;

//   const mapped = valid.map((p) => ({
//     x: ((p.timestamp - minTimestamp) / timeRange) * width,
//     y: height - ((p.value - minValue) / valueRange) * height,
//   }));

//   if (mapped.length === 1) {
//     return `M${mapped[0].x},${mapped[0].y} L${mapped[0].x},${mapped[0].y}`;
//   }

//   let d = `M${mapped[0].x},${mapped[0].y}`;
//   for (let i = 1; i < mapped.length; i++) {
//     const prev = mapped[i - 1];
//     const curr = mapped[i];
//     const cp1x = prev.x + (curr.x - prev.x) * 0.4;
//     const cp1y = prev.y;
//     const cp2x = curr.x - (curr.x - prev.x) * 0.4;
//     const cp2y = curr.y;
//     d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
//   }
//   return d;
// }

// function computeGlobalBounds(monitors: ResponseTimeMonitor[], range: ResponseRange) {
//   let minTime = Infinity;
//   let maxTime = -Infinity;
//   let minVal = Infinity;
//   let maxVal = -Infinity;

//   for (const m of monitors) {
//     const data = m.graphs.response[range];
//     for (const p of data) {
//       if (p.value === null) continue;
//       const ts = parseTimestamp(p.timestamp);
//       if (ts < minTime) minTime = ts;
//       if (ts > maxTime) maxTime = ts;
//       if (p.value < minVal) minVal = p.value;
//       if (p.value > maxVal) maxVal = p.value;
//     }
//   }

//   if (!isFinite(minTime)) minTime = Date.now() - 24 * 3600 * 1000;
//   if (!isFinite(maxTime)) maxTime = Date.now();
//   if (!isFinite(minVal)) minVal = 0;
//   if (!isFinite(maxVal)) maxVal = 100;

//   const pad = (maxVal - minVal) * 0.1 || 10;
//   minVal = Math.max(0, minVal - pad);
//   maxVal = maxVal + pad;

//   return { minTime, maxTime, minVal, maxVal };
// }

// function formatTime(ts: number): string {
//   return new Date(ts).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });
// }

// function formatTooltipTime(ts: number, range: ResponseRange): string {
//   if (range === "month") {
//     return new Date(ts).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   }
//   return formatTime(ts);
// }

// function getAxisLabels(range: ResponseRange, minTime: number, maxTime: number): string[] {
//   if (!isFinite(minTime) || !isFinite(maxTime) || minTime === maxTime) {
//     return ["", "", "", "", ""];
//   }
//   const step = (maxTime - minTime) / 4;
//   const labels: string[] = [];
//   for (let i = 0; i < 4; i++) {
//     const ts = minTime + i * step;
//     if (range === "month") {
//       labels.push(new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
//     } else if (range === "hour") {
//       labels.push(new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
//     } else {
//       // day: show time
//       labels.push(new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
//     }
//   }
//   labels.push("Now");
//   return labels;
// }

// function computeAverageData(monitors: ResponseTimeMonitor[], range: ResponseRange): ResponseTimeDataPoint[] {
//   if (monitors.length === 0) return [];
//   const ref = monitors[0].graphs.response[range];
//   if (ref.length === 0) return [];

//   return ref.map((_, idx) => {
//     let sum = 0;
//     let count = 0;
//     for (const m of monitors) {
//       const p = m.graphs.response[range][idx];
//       if (p && p.value !== null) {
//         sum += p.value;
//         count++;
//       }
//     }
//     return {
//       timestamp: ref[idx].timestamp,
//       value: count > 0 ? sum / count : null,
//     };
//   });
// }

// // ---------- Main Component ----------
// export default function ResponseTimeGraph({ range = "day", monitors }: ResponseTimeGraphProps) {
//   const label = RANGE_LABELS[range];

//   if (!monitors || monitors.length === 0) {
//     return <WaitingGraph label={label} />;
//   }

//   if (monitors.length === 1) {
//     return <SingleMonitorGraph range={range} label={label} monitor={monitors[0]} />;
//   }

//   return <SelectableMonitorGraph range={range} label={label} monitors={monitors} />;
// }

// // ---------- Sub-components ----------

// function WaitingGraph({ label }: { label: string }) {
//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>{label}</small>
//       </div>
//       <div className="graph">
//         <svg viewBox="0 0 600 135" preserveAspectRatio="none" style={{ cursor: "default" }}>
//           <path
//             d="M0,96 L600,96"
//             fill="none"
//             stroke="#3a4048"
//             strokeWidth="2"
//             strokeDasharray="4 4"
//           />
//           <path d="M0,96 L600,96 V135 H0 Z" fill="url(#fade-wait)" opacity={0.08} />
//           <defs>
//             <linearGradient id="fade-wait" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor="#3a4048" />
//               <stop offset="1" stopColor="#3a4048" stopOpacity="0" />
//             </linearGradient>
//           </defs>
//         </svg>
//         <div className="graph-waiting">
//           <span>Waiting for monitoring data…</span>
//         </div>
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// function SingleMonitorGraph({
//   range,
//   label,
//   monitor,
// }: {
//   range: ResponseRange;
//   label: string;
//   monitor: ResponseTimeMonitor;
// }) {
//   const data = monitor.graphs.response[range];
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const bounds = useMemo(() => computeGlobalBounds([monitor], range), [monitor, range]);

//   const path = useMemo(() => {
//     if (data.length === 0) {
//       return `M0,96 L600,96`;
//     }
//     return buildPathFromPoints(
//       data,
//       600,
//       135,
//       bounds.minTime,
//       bounds.maxTime,
//       bounds.minVal,
//       bounds.maxVal
//     );
//   }, [data, bounds]);

//   const fillPath = useMemo(() => `${path} V135 H0 Z`, [path]);

//   const axisLabels = useMemo(
//     () => getAxisLabels(range, bounds.minTime, bounds.maxTime),
//     [range, bounds]
//   );

//   const hasData = data.some((p) => p.value !== null);

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!hasData) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     const time = bounds.minTime + (x / 600) * (bounds.maxTime - bounds.minTime);
//     let nearest = 0;
//     let minDist = Infinity;
//     for (let i = 0; i < data.length; i++) {
//       const p = data[i];
//       if (p.value === null) continue;
//       const ts = parseTimestamp(p.timestamp);
//       const dist = Math.abs(ts - time);
//       if (dist < minDist) {
//         minDist = dist;
//         nearest = i;
//       }
//     }
//     setHoverIndex(nearest);
//   };

//   const hoverPoint = hoverIndex !== null ? data[hoverIndex] : null;
//   const hoverValue = hoverPoint?.value ?? null;
//   const hoverTimestamp = hoverPoint ? parseTimestamp(hoverPoint.timestamp) : 0;
//   const hoverX = hoverPoint
//     ? ((hoverTimestamp - bounds.minTime) / (bounds.maxTime - bounds.minTime)) * 600
//     : 0;
//   const hoverY = (hoverPoint && hoverValue !== null)
//     ? 135 - ((hoverValue - bounds.minVal) / (bounds.maxVal - bounds.minVal)) * 135
//     : 0;

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>{label}</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: hasData ? "crosshair" : "default" }}
//         >
//           <path
//             d={path}
//             fill="none"
//             stroke={hasData ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={hasData ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade-single)" opacity={hasData ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade-single" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={hasData ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={hasData ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>

//           {hasData && hoverPoint && hoverValue !== null && (
//             <>
//               <line
//                 x1={hoverX}
//                 x2={hoverX}
//                 y1={0}
//                 y2={135}
//                 stroke="#3a4048"
//                 strokeWidth="1"
//                 strokeDasharray="3 3"
//               />
//               <circle cx={hoverX} cy={hoverY} r={6} fill="#50d890" stroke="#0b0d10" strokeWidth={2} />
//             </>
//           )}
//         </svg>

//         {hasData && hoverPoint && hoverValue !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(hoverX / 600) * 100}%`,
//               top: `${(hoverY / 135) * 100}%`,
//             }}
//           >
//             {formatTooltipTime(hoverTimestamp, range)} · <b>{Math.round(hoverValue)}ms</b>
//           </div>
//         )}

//         {!hasData && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         {axisLabels.map((label, i) => (
//           <span key={i}>{label}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// function SelectableMonitorGraph({
//   range,
//   label,
//   monitors,
// }: {
//   range: ResponseRange;
//   label: string;
//   monitors: ResponseTimeMonitor[];
// }) {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const bounds = useMemo(() => computeGlobalBounds(monitors, range), [monitors, range]);
//   const averageData = useMemo(() => computeAverageData(monitors, range), [monitors, range]);

//   const LINE_COLORS = ["#50d890", "#5b9dff", "#c792ea", "#f5a76c", "#f2789a", "#6ee7d4"];
//   const colorMap = useMemo(() => {
//     const map: Record<string, string> = {};
//     monitors.forEach((m, i) => {
//       map[m.id] = LINE_COLORS[i % LINE_COLORS.length];
//     });
//     return map;
//   }, [monitors]);

//   const activeMonitor = selectedId ? monitors.find((m) => m.id === selectedId) : null;
//   const activeData = activeMonitor
//     ? activeMonitor.graphs.response[range]
//     : averageData;
//   const activeColor = activeMonitor ? colorMap[activeMonitor.id] : "#50d890";
//   const activeLabel = activeMonitor ? activeMonitor.name : "All monitors (avg)";

//   const path = useMemo(() => {
//     if (activeData.length === 0) {
//       return `M0,96 L600,96`;
//     }
//     return buildPathFromPoints(
//       activeData,
//       600,
//       135,
//       bounds.minTime,
//       bounds.maxTime,
//       bounds.minVal,
//       bounds.maxVal
//     );
//   }, [activeData, bounds]);

//   const fillPath = useMemo(() => `${path} V135 H0 Z`, [path]);

//   const axisLabels = useMemo(
//     () => getAxisLabels(range, bounds.minTime, bounds.maxTime),
//     [range, bounds]
//   );

//   const hasData = activeData.some((p) => p.value !== null);

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!hasData) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     const time = bounds.minTime + (x / 600) * (bounds.maxTime - bounds.minTime);
//     let nearest = 0;
//     let minDist = Infinity;
//     for (let i = 0; i < activeData.length; i++) {
//       const p = activeData[i];
//       if (p.value === null) continue;
//       const ts = parseTimestamp(p.timestamp);
//       const dist = Math.abs(ts - time);
//       if (dist < minDist) {
//         minDist = dist;
//         nearest = i;
//       }
//     }
//     setHoverIndex(nearest);
//   };

//   const hoverPoint = hoverIndex !== null ? activeData[hoverIndex] : null;
//   const hoverValue = hoverPoint?.value ?? null;
//   const hoverTimestamp = hoverPoint ? parseTimestamp(hoverPoint.timestamp) : 0;
//   const hoverX = hoverPoint
//     ? ((hoverTimestamp - bounds.minTime) / (bounds.maxTime - bounds.minTime)) * 600
//     : 0;
//   const hoverY = (hoverPoint && hoverValue !== null)
//     ? 135 - ((hoverValue - bounds.minVal) / (bounds.maxVal - bounds.minVal)) * 135
//     : 0;

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>{label}</small>
//       </div>

//       <div className="rt-legend">
//         <span
//           className={`rt-legend-item${selectedId === null ? " is-active" : ""}`}
//           onClick={() => setSelectedId(null)}
//         >
//           <i className="rt-legend-dot" style={{ background: "#50d890" }} />
//           All monitors (avg)
//         </span>
//         {monitors.map((m) => (
//           <span
//             key={m.id}
//             className={`rt-legend-item${selectedId === m.id ? " is-active" : ""}`}
//             onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
//           >
//             <i className="rt-legend-dot" style={{ background: colorMap[m.id] }} />
//             {m.name}
//           </span>
//         ))}
//       </div>

//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: hasData ? "crosshair" : "default" }}
//         >
//           <path
//             d={path}
//             fill="none"
//             stroke={hasData ? activeColor : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={hasData ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#rt-fade)" opacity={hasData ? 0.2 : 0.08} />
//           <defs>
//             <linearGradient id="rt-fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={hasData ? activeColor : "#3a4048"} />
//               <stop offset="1" stopColor={hasData ? activeColor : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>

//           {hasData && hoverPoint && hoverValue !== null && (
//             <>
//               <line
//                 x1={hoverX}
//                 x2={hoverX}
//                 y1={0}
//                 y2={135}
//                 stroke="#3a4048"
//                 strokeWidth="1"
//                 strokeDasharray="3 3"
//               />
//               <circle cx={hoverX} cy={hoverY} r={6} fill={activeColor} stroke="#0b0d10" strokeWidth={2} />
//             </>
//           )}
//         </svg>

//         {hasData && hoverPoint && hoverValue !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(hoverX / 600) * 100}%`,
//               top: `${(hoverY / 135) * 100}%`,
//             }}
//           >
//             <b style={{ color: activeColor }}>{activeLabel}</b> · {formatTooltipTime(hoverTimestamp, range)} ·{" "}
//             <b>{Math.round(hoverValue)}ms</b>
//           </div>
//         )}

//         {!hasData && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         {axisLabels.map((label, i) => (
//           <span key={i}>{label}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// ------------------------------------------------------------------

// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency, buildMonitorSeries, averageSeries } from "../../utils/responseTimeGraph";

// export interface ResponseTimeMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed Y-series (one value per GRAPH_X sample); generated when omitted. */
//   series?: number[];
// }

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
//   /**
//    * Optional list of monitors. With 0 or 1 monitors this renders exactly
//    * like the single combined graph. With 2+, the chart defaults to one
//    * blended "all monitors" average line (so it never turns into a tangle of
//    * overlapping lines) — clicking a monitor in the legend swaps in that
//    * monitor's own line instead. Only ever one line on screen at a time.
//    */
//   monitors?: ResponseTimeMonitor[];
// }

// const FLAT_Y = 96;
// const LINE_COLORS = ["#50d890", "#5b9dff", "#c792ea", "#f5a76c", "#f2789a", "#6ee7d4"];

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own hook
//  * state.
//  */
// export default function ResponseTimeGraph({ live = false, monitors }: ResponseTimeGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <SelectableResponseTimeGraph live={live} monitors={monitors} />;
//   }
//   return <SingleLineResponseTimeGraph live={live} />;
// }

// function SingleLineResponseTimeGraph({ live }: { live: boolean }) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// function SelectableResponseTimeGraph({ live, monitors }: { live: boolean; monitors: ResponseTimeMonitor[] }) {
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const lines = useMemo(
//     () =>
//       monitors.map((m, i) => ({
//         ...m,
//         series: m.series ?? buildMonitorSeries(GRAPH_Y, i, live, FLAT_Y),
//         color: LINE_COLORS[i % LINE_COLORS.length],
//       })),
//     [monitors, live]
//   );

//   const aggregateSeries = useMemo(() => averageSeries(lines.map((l) => l.series)), [lines]);

//   const selected = lines.find((l) => l.id === selectedId) ?? null;
//   const activeSeries = selected ? selected.series : aggregateSeries;
//   const activeColor = selected ? selected.color : "#50d890";
//   const activeLabel = selected ? selected.name : "All monitors (avg)";
//   const activePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, activeSeries) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live, activeSeries]
//   );
//   const fillPath = `${activePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>

//       <div className="rt-legend">
//         <span
//           className={`rt-legend-item${selectedId === null ? " is-active" : ""}`}
//           onClick={() => setSelectedId(null)}
//         >
//           <i className="rt-legend-dot" style={{ background: "#50d890" }} />
//           All monitors (avg)
//         </span>
//         {lines.map((line) => (
//           <span
//             key={line.id}
//             className={`rt-legend-item${selectedId === line.id ? " is-active" : ""}`}
//             onClick={() => setSelectedId(selectedId === line.id ? null : line.id)}
//           >
//             <i className="rt-legend-dot" style={{ background: line.color }} />
//             {line.name}
//           </span>
//         ))}
//       </div>

//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={activePath}
//             fill="none"
//             stroke={live ? activeColor : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#rt-fade)" opacity={live ? 0.2 : 0.08} />
//           <defs>
//             <linearGradient id="rt-fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? activeColor : "#3a4048"} />
//               <stop offset="1" stopColor={live ? activeColor : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <>
//               <line
//                 x1={GRAPH_X[hoverIndex]}
//                 x2={GRAPH_X[hoverIndex]}
//                 y1={0}
//                 y2={135}
//                 stroke="#3a4048"
//                 strokeWidth="1"
//                 strokeDasharray="3 3"
//               />
//               <circle
//                 cx={GRAPH_X[hoverIndex]}
//                 cy={activeSeries[hoverIndex]}
//                 r={6}
//                 fill={activeColor}
//                 stroke="#0b0d10"
//                 strokeWidth={2}
//               />
//             </>
//           )}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(activeSeries[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             <b style={{ color: activeColor }}>{activeLabel}</b> · {xToTime(GRAPH_X[hoverIndex])} ·{" "}
//             <b>{yToLatency(activeSeries[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency } from "../../utils/responseTimeGraph";

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
// }

// const FLAT_Y = 96;

// export default function ResponseTimeGraph({ live = false }: ResponseTimeGraphProps) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency, buildMonitorSeries } from "../../utils/responseTimeGraph";

// export interface ResponseTimeMonitor {
//   id: string;
//   name: string;
//   status?: "up" | "down" | string;
//   /** Optional pre-computed Y-series (one value per GRAPH_X sample); generated when omitted. */
//   series?: number[];
// }

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
//   /**
//    * Optional list of monitors to overlay as separate lines. With 0 or 1
//    * monitors this renders exactly like the single combined graph. With 2+,
//    * each monitor gets its own colored line and hovering one (via the legend
//    * or by moving the cursor near it) focuses it while the others dim and
//    * blur out of the way.
//    */
//   monitors?: ResponseTimeMonitor[];
// }

// const FLAT_Y = 96;
// const LINE_COLORS = ["#50d890", "#5b9dff", "#c792ea", "#f5a76c", "#f2789a", "#6ee7d4"];

// /**
//  * Top-level component: this only branches on props and holds no hooks of its
//  * own, so it's safe for `monitors` to grow from 0/1 to several across
//  * re-renders (e.g. while monitors are still loading) without violating the
//  * rules of hooks — each branch below is its own component with its own hook
//  * state.
//  */
// export default function ResponseTimeGraph({ live = false, monitors }: ResponseTimeGraphProps) {
//   if (monitors && monitors.length > 1) {
//     return <MultiLineResponseTimeGraph live={live} monitors={monitors} />;
//   }
//   return <SingleLineResponseTimeGraph live={live} />;
// }

// function SingleLineResponseTimeGraph({ live }: { live: boolean }) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// function MultiLineResponseTimeGraph({ live, monitors }: { live: boolean; monitors: ResponseTimeMonitor[] }) {
//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const lines = useMemo(
//     () =>
//       monitors.map((m, i) => {
//         const series = m.series ?? buildMonitorSeries(GRAPH_Y, i, live, FLAT_Y);
//         return {
//           ...m,
//           series,
//           color: LINE_COLORS[i % LINE_COLORS.length],
//           path: live ? buildSmoothPath(GRAPH_X, series) : `M0,${FLAT_Y} L600,${FLAT_Y}`,
//         };
//       }),
//     [monitors, live]
//   );

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     const y = ((e.clientY - rect.top) / rect.height) * 135;
//     const idx = nearestIndex(GRAPH_X, x);
//     setHoverIndex(idx);

//     // Focus whichever line's sample is closest to the cursor's Y position.
//     let nearestId = lines[0]?.id ?? null;
//     let bestDist = Infinity;
//     lines.forEach((line) => {
//       const d = Math.abs(line.series[idx] - y);
//       if (d < bestDist) {
//         bestDist = d;
//         nearestId = line.id;
//       }
//     });
//     setActiveId(nearestId);
//   };

//   const clearHover = () => {
//     setActiveId(null);
//     setHoverIndex(null);
//   };

//   const activeLine = lines.find((l) => l.id === activeId) ?? null;

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>

//       <div className={`rt-legend${activeId ? " has-hover" : ""}`} onMouseLeave={() => setActiveId(null)}>
//         {lines.map((line) => (
//           <span
//             key={line.id}
//             className={`rt-legend-item${activeId === line.id ? " is-active" : ""}`}
//             onMouseEnter={() => setActiveId(line.id)}
//           >
//             <i className="rt-legend-dot" style={{ background: line.color }} />
//             {line.name}
//           </span>
//         ))}
//       </div>

//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={clearHover}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {lines.map((line) => {
//             const isActive = activeId === line.id;
//             const dimmed = activeId !== null && !isActive;
//             return (
//               <path
//                 key={line.id}
//                 className={`rt-line${dimmed ? " rt-line-dimmed" : ""}`}
//                 d={line.path}
//                 fill="none"
//                 stroke={line.color}
//                 strokeWidth={isActive ? 3 : 2}
//                 strokeDasharray={live ? undefined : "4 4"}
//                 opacity={live ? 1 : 0.55}
//               />
//             );
//           })}
//           {live &&
//             activeLine &&
//             hoverIndex !== null && (
//               <circle
//                 cx={GRAPH_X[hoverIndex]}
//                 cy={activeLine.series[hoverIndex]}
//                 r={6}
//                 fill={activeLine.color}
//                 stroke="#0b0d10"
//                 strokeWidth={2}
//               />
//             )}
//         </svg>
//         {live && activeLine && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(activeLine.series[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             <b style={{ color: activeLine.color }}>{activeLine.name}</b> · {xToTime(GRAPH_X[hoverIndex])} ·{" "}
//             <b>{yToLatency(activeLine.series[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }

// import { useMemo, useRef, useState } from "react";
// import { GRAPH_X, GRAPH_Y } from "../../data/responseTimeGraph";
// import { buildSmoothPath } from "../../utils/path";
// import { nearestIndex, xToTime, yToLatency } from "../../utils/responseTimeGraph";

// interface ResponseTimeGraphProps {
//   /** When false (default for the real product), renders a flat line with no fabricated samples. */
//   live?: boolean;
// }

// const FLAT_Y = 96;

// export default function ResponseTimeGraph({ live = false }: ResponseTimeGraphProps) {
//   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   const linePath = useMemo(
//     () => (live ? buildSmoothPath(GRAPH_X, GRAPH_Y) : `M0,${FLAT_Y} L600,${FLAT_Y}`),
//     [live]
//   );
//   const fillPath = `${linePath} V135 H0 Z`;

//   const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
//     if (!live) return;
//     const rect = svgRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const x = ((e.clientX - rect.left) / rect.width) * 600;
//     setHoverIndex(nearestIndex(GRAPH_X, x));
//   };

//   return (
//     <div className="panel">
//       <div className="panel-head">
//         <h4>Response time</h4>
//         <small>LAST 24 HOURS</small>
//       </div>
//       <div className="graph">
//         <svg
//           ref={svgRef}
//           viewBox="0 0 600 135"
//           preserveAspectRatio="none"
//           onPointerMove={handlePointerMove}
//           onPointerLeave={() => setHoverIndex(null)}
//           style={{ cursor: live ? "crosshair" : "default" }}
//         >
//           <path
//             d={linePath}
//             fill="none"
//             stroke={live ? "#50d890" : "#3a4048"}
//             strokeWidth="2"
//             strokeDasharray={live ? undefined : "4 4"}
//           />
//           <path d={fillPath} fill="url(#fade)" opacity={live ? 0.22 : 0.08} />
//           <defs>
//             <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
//               <stop stopColor={live ? "#50d890" : "#3a4048"} />
//               <stop offset="1" stopColor={live ? "#50d890" : "#3a4048"} stopOpacity="0" />
//             </linearGradient>
//           </defs>
//           {live && hoverIndex !== null && (
//             <line
//               x1={GRAPH_X[hoverIndex]}
//               x2={GRAPH_X[hoverIndex]}
//               y1={0}
//               y2={135}
//               stroke="#3a4048"
//               strokeWidth="1"
//               strokeDasharray="3 3"
//             />
//           )}
//           {live &&
//             GRAPH_X.map((gx, i) => {
//               const active = i === hoverIndex;
//               return (
//                 <circle
//                   key={i}
//                   cx={gx}
//                   cy={GRAPH_Y[i]}
//                   r={active ? 6 : 3}
//                   fill={active ? "#50d890" : "#2c333c"}
//                   stroke={active ? "#0b0d10" : "none"}
//                   strokeWidth={active ? 2 : 0}
//                   onPointerEnter={() => setHoverIndex(i)}
//                 />
//               );
//             })}
//         </svg>
//         {live && hoverIndex !== null && (
//           <div
//             className="graph-tooltip"
//             style={{
//               left: `${(GRAPH_X[hoverIndex] / 600) * 100}%`,
//               top: `${(GRAPH_Y[hoverIndex] / 135) * 100}%`,
//             }}
//           >
//             {xToTime(GRAPH_X[hoverIndex])} · <b>{yToLatency(GRAPH_Y[hoverIndex])}ms</b>
//           </div>
//         )}
//         {!live && (
//           <div className="graph-waiting">
//             <span>Waiting for monitoring data…</span>
//           </div>
//         )}
//       </div>
//       <div className="axis">
//         <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
//       </div>
//     </div>
//   );
// }
