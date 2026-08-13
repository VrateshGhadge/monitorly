import { format } from "date-fns";

interface MonitorLike {
  id: string;
  latency: number | null;
}

export type ResponseRange = "hour" | "day" | "month";

export interface ResponsePoint {
  label: string;
  ms: number;
}

const RANGE_CONFIG: Record<
  ResponseRange,
  {
    points: number;
    stepMs: number;
    format: (date: Date) => string;
    panelLabel: string;
  }
> = {
  hour: {
    points: 12,
    stepMs: 5 * 60 * 1000,
    format: (d) => format(d, "h:mmaaa"),
    panelLabel: "LAST HOUR",
  },

  day: {
    points: 24,
    stepMs: 60 * 60 * 1000,
    format: (d) => format(d, "h:mmaaa"),
    panelLabel: "LAST 24 HOURS",
  },

  month: {
    points: 30,
    stepMs: 24 * 60 * 60 * 1000,
    format: (d) => format(d, "MMM d"),
    panelLabel: "LAST 30 DAYS",
  },
};

function seededRandom(seed: string) {
  let h = 0;

  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }

  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);

    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildMonitorSeries(
  monitor: MonitorLike,
  range: ResponseRange,
): ResponsePoint[] {
  const rand = seededRandom(`${monitor.id}-${range}`);

  const base = monitor.latency ?? 140;

  const config = RANGE_CONFIG[range];
  const now = Date.now();

  return Array.from({ length: config.points }, (_, i) => {
    const timestamp = now - (config.points - 1 - i) * config.stepMs;

    return {
      label: config.format(new Date(timestamp)),
      ms: Math.max(8, Math.round(base + (rand() - 0.5) * base * 0.4)),
    };
  });
}

export function buildAverageSeries(
  monitors: MonitorLike[],
  range: ResponseRange,
): ResponsePoint[] {
  if (monitors.length === 0) return [];

  const monitorSeries = monitors.map((m) => buildMonitorSeries(m, range));

  return monitorSeries[0].map((point, index) => ({
    label: point.label,
    ms: Math.round(
      monitorSeries.reduce((sum, series) => sum + series[index].ms, 0) /
        monitorSeries.length,
    ),
  }));
}

export function buildAxisLabels(
  series: ResponsePoint[],
  range: ResponseRange,
): string[] {
  if (series.length === 0) return [];

  const indices = [0, 0.25, 0.5, 0.75, 1].map((v) =>
    Math.round(v * (series.length - 1)),
  );

  const labels = [...new Set(indices)].map((i) => series[i].label);

  labels[labels.length - 1] = range === "month" ? "Today" : "Now";

  return labels;
}

export function getRangeLabel(range: ResponseRange) {
  return RANGE_CONFIG[range].panelLabel;
}
