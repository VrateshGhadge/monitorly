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
