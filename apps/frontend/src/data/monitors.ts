import type { Monitor } from "../types/dashboard";

export const initialMonitors: Monitor[] = [
  {
    id: "api",
    name: "api.acme.dev",
    type: "HTTPS",
    uptimePct: 99.99,
    latency: 142,
    status: "up",
  },
  {
    id: "app",
    name: "app.acme.dev",
    type: "HTTPS",
    uptimePct: 100,
    latency: 187,
    status: "up",
  },
  {
    id: "pay",
    name: "payments.acme.dev",
    type: "HTTPS",
    uptimePct: 99.87,
    latency: null,
    status: "down",
  },
  {
    id: "auth",
    name: "auth.acme.dev",
    type: "HTTPS",
    uptimePct: 99.95,
    latency: 96,
    status: "up",
  },
  {
    id: "cdn",
    name: "cdn.acme.dev",
    type: "HTTPS",
    uptimePct: 100,
    latency: 41,
    status: "up",
  },
  {
    id: "db",
    name: "db-primary",
    type: "TCP",
    uptimePct: 99.9,
    latency: 12,
    status: "up",
  },
  // { id: "queue", name: "queue-worker", type: "TCP", uptimePct: 99.98, latency: 8, status: "up" },
  // { id: "status", name: "status.acme.dev", type: "HTTPS", uptimePct: 100, latency: 65, status: "up" },
];
