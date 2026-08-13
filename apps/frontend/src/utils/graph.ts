// <-- ONLY converts backend data to SVG coordinates

import { buildSmoothPath } from "./path";

export interface GraphPoint {
  timestamp: string;
  value: number | null;
}

export interface SvgPoint {
  x: number;
  y: number;
  value: number | null;
  timestamp: string;
}

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 135;
const GRAPH_PADDING = 12;

export function buildSvgPoints(
  data: GraphPoint[],
  width = GRAPH_WIDTH,
  height = GRAPH_HEIGHT,
): SvgPoint[] {
  if (data.length === 0) return [];

  const values = data
    .map((p) => p.value)
    .filter((v): v is number => v !== null);

  if (values.length === 0) {
    return data.map((point, index) => ({
      x: (index / Math.max(data.length - 1, 1)) * width,
      y: height - GRAPH_PADDING,
      value: point.value,
      timestamp: point.timestamp,
    }));
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range = Math.max(max - min, 1);

  return data.map((point, index) => ({
    x: (index / Math.max(data.length - 1, 1)) * width,

    y:
      point.value === null
        ? height - GRAPH_PADDING
        : GRAPH_PADDING +
          (1 - (point.value - min) / range) * (height - GRAPH_PADDING * 2),

    value: point.value,
    timestamp: point.timestamp,
  }));
}

export function buildGraphPath(data: GraphPoint[]) {
  const points = buildSvgPoints(data);

  if (points.length === 0) {
    return "";
  }

  return buildSmoothPath(
    points.map((p) => p.x),
    points.map((p) => p.y),
  );
}

export function buildFillPath(data: GraphPoint[], height = GRAPH_HEIGHT) {
  const path = buildGraphPath(data);

  if (!path) return "";

  return `${path} V${height} H0 Z`;
}

export function nearestPointIndex(points: SvgPoint[], mouseX: number) {
  if (points.length === 0) return null;

  let nearest = 0;
  let distance = Infinity;

  points.forEach((point, index) => {
    const d = Math.abs(point.x - mouseX);

    if (d < distance) {
      distance = d;
      nearest = index;
    }
  });

  return nearest;
}

export function formatLatency(value: number | null) {
  return value === null ? "--" : `${value} ms`;
}

export function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
