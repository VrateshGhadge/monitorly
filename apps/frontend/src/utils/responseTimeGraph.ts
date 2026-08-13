import { clamp } from "./number";

/** Converts a graph Y coordinate (0–135 viewBox) into a latency value in ms. */
export function yToLatency(y: number): number {
  return Math.round(40 + ((clamp(y, 20, 118) - 20) / (118 - 20)) * 220);
}

/** Converts a graph X coordinate (0–600 viewBox) into an "HH:00" time label. */
export function xToTime(x: number): string {
  const hours = Math.round((clamp(x, 0, 600) / 600) * 24) % 24;
  return `${String(hours).padStart(2, "0")}:00`;
}

/** Finds the index of the sample whose X position is nearest to the given X coordinate. */
export function nearestIndex(graphX: number[], x: number): number {
  let best = 0;
  let bestDist = Infinity;
  graphX.forEach((gx, i) => {
    const d = Math.abs(gx - x);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export function buildMonitorSeries(
  baseY: number[],
  index: number,
  live: boolean,
  // flatY: number
): number[] {
  // Dashboard should always show graphs when monitors exist.
  // Only show flat line if there are literally no samples.
  if (!live) {
    live = true;
  }

  if (index === 0) {
    return baseY;
  }

  const amplitude = 10 + index * 6;
  const phase = index * 1.7;

  return baseY.map((y, i) =>
    clamp(y + Math.sin(i * 0.9 + phase) * amplitude, 20, 118),
  );
}

/** Elementwise average of several equal-length Y-series — the blended "all monitors" line. */
export function averageSeries(series: number[][]): number[] {
  if (series.length === 0) return [];
  const len = series[0].length;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (const s of series) sum += s[i];
    out.push(sum / series.length);
  }
  return out;
}
