// src/hooks/useAppData.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import * as monitorApi from "../api/monitor";
import type { ActivityItem, AppAlert, AppMonitor } from "../types/app";
import type { CreateMonitorInput } from "@repo/validation";
import { createSlug } from "../utils/slug";

// ---------------------------------------------------------------------------
// Helper: append a new point and remove points older than `maxAge` ms
// ---------------------------------------------------------------------------
function appendAndTrim<T extends { timestamp: string }>(
  points: T[],
  newPoint: T,
  maxAge: number,
  now: number,
): T[] {
  const cutoff = now - maxAge;
  return [...points, newPoint].filter(
    (p) => new Date(p.timestamp).getTime() >= cutoff,
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAppData(isNewAccount: boolean) {
  const [monitors, setMonitors] = useState<AppMonitor[]>([]);
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<AppMonitor | null>(null);

  // -------------------------------------------------------------------------
  // Load monitors and alerts (initial and after CRUD)
  // -------------------------------------------------------------------------
  const loadMonitors = useCallback(async () => {
    try {
      const response = await monitorApi.getMonitors();

      const monitors: AppMonitor[] = response.map((m) => ({
        id: m.id,
        slug: createSlug(m.name),
        name: m.name,
        url: m.url,
        type: m.type,
        method: m.method,
        emailAlerts: m.emailAlerts,
        status: m.currentStatus === "DOWN" ? "down" : "up",
        uptimePct: m.uptimePct,
        latency: m.avgResponse,
        lastChecked: m.lastChecked ?? "",
        graphs: m.graphs,
      }));

      setMonitors((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(monitors)) {
          return prev;
        }
        return monitors;
      });
    } catch (error) {
      console.error("Failed to load monitors", error);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await monitorApi.getAlerts();

      const alerts: AppAlert[] = response.map((alert) => ({
        id: alert.id,
        monitor: alert.monitor.name,
        severity: alert.type === "DOWN" ? "critical" : "resolved",
        status: alert.status === "SENT" ? "sent" : "resolved",
        email: alert.user.email,
        time: alert.createdAt,
        message: alert.message,
      }));

      setAlerts(alerts);
    } catch (error) {
      console.error("Failed to load alerts", error);
    }
  }, []);

  // Initial load (no polling)
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadMonitors(), loadAlerts()]);
      setIsLoading(false);
    };
    init();
  }, [loadMonitors, loadAlerts]);

  // -------------------------------------------------------------------------
  // SSE Connection – handles both monitor.updated and alert.updated events
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const connectSSE = async () => {
      try {
        const token = localStorage.getItem("monitorly.token");
        if (!token) {
          return;
        }

        const response = await fetch(
          "http://localhost:8787/api/v1/monitor/events",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "text/event-stream",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }
        if (!response.body) {
          throw new Error("SSE response has no body");
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            // ----- Check if it's a monitor update or alert update -----
            const isMonitorUpdate = event.includes("event: monitor.updated");
            const isAlertUpdate = event.includes("event: alert.updated");

            if (!isMonitorUpdate && !isAlertUpdate) continue;

            const dataLine = event
              .split("\n")
              .find((line) => line.startsWith("data: "));
            if (!dataLine) continue;

            try {
              const update = JSON.parse(dataLine.slice("data: ".length));

              // ---------- Handle Alert Update ----------
              if (isAlertUpdate) {
                const alert: AppAlert = {
                  id: update.id,
                  monitor: update.monitor,
                  severity: update.type === "DOWN" ? "critical" : "resolved",
                  status: update.status === "SENT" ? "sent" : "resolved",
                  email: update.email ?? "",
                  time: update.createdAt,
                  message: update.message,
                };

                setAlerts((prev) => {
                  const exists = prev.some((item) => item.id === alert.id);
                  if (exists) {
                    return prev.map((item) =>
                      item.id === alert.id ? alert : item,
                    );
                  }
                  return [alert, ...prev];
                });

                continue; // done with this event
              }

              if (isMonitorUpdate) {
                const checkedAt =
                  typeof update.checkedAt === "string"
                    ? update.checkedAt
                    : new Date().toISOString();

                const responseTime =
                  typeof update.responseTime === "number"
                    ? update.responseTime
                    : null;

                const status: "up" | "down" =
                  update.status === "DOWN" ? "down" : "up";

                setMonitors((prev) => {
                  let changed = false;

                  const next = prev.map((monitor) => {
                    if (monitor.id !== update.monitorId) {
                      return monitor;
                    }

                    if (
                      monitor.status === status &&
                      monitor.latency === responseTime &&
                      monitor.lastChecked === checkedAt
                    ) {
                      return monitor;
                    }

                    changed = true;
                    const now = Date.now();

                    const newResponsePoint = {
                      timestamp: checkedAt,
                      value: responseTime,
                    };
                    const newUptimePoint = {
                      timestamp: checkedAt,
                      status:
                        update.status === "DOWN"
                          ? ("DOWN" as const)
                          : ("UP" as const),
                    };

                    return {
                      ...monitor,
                      status,
                      latency: responseTime,
                      lastChecked: checkedAt,
                      graphs: {
                        ...monitor.graphs,
                        response: {
                          ...monitor.graphs.response,
                          hour: appendAndTrim(
                            monitor.graphs.response.hour,
                            newResponsePoint,
                            60 * 60 * 1000,
                            now,
                          ),
                          day: appendAndTrim(
                            monitor.graphs.response.day,
                            newResponsePoint,
                            24 * 60 * 60 * 1000,
                            now,
                          ),
                          month: appendAndTrim(
                            monitor.graphs.response.month,
                            newResponsePoint,
                            30 * 24 * 60 * 60 * 1000,
                            now,
                          ),
                        },
                        uptime: {
                          ...monitor.graphs.uptime,
                          hour: appendAndTrim(
                            monitor.graphs.uptime.hour,
                            newUptimePoint,
                            60 * 60 * 1000,
                            now,
                          ),
                          day: appendAndTrim(
                            monitor.graphs.uptime.day,
                            newUptimePoint,
                            24 * 60 * 60 * 1000,
                            now,
                          ),
                          month: appendAndTrim(
                            monitor.graphs.uptime.month,
                            newUptimePoint,
                            30 * 24 * 60 * 60 * 1000,
                            now,
                          ),
                        },
                      },
                    };
                  });

                  return changed ? next : prev;
                });
              }
            } catch (error) {
              console.error("[SSE] Failed to parse event:", error);
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[SSE] Connection error:", error);
        }
      }
    };

    connectSSE();

    return () => {
      cancelled = true;
      if (reader) {
        reader.cancel().catch(() => {});
        reader = null;
      }
    };
  }, []);

  // Activity logging & CRUD
  const logActivity = (kind: ActivityItem["kind"], text: string) => {
    setActivity((prev) =>
      [
        {
          id: `act-${Date.now()}`,
          kind,
          text,
          time: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 12),
    );
  };

  const deleteMonitor = async (id: string) => {
    await monitorApi.deleteMonitor(id);
    await loadMonitors();
    logActivity("deleted", "Monitor deleted");
  };

  const addMonitor = async (values: CreateMonitorInput) => {
    await monitorApi.createMonitor(values);
    await loadMonitors();
    logActivity("created", `${values.name} monitor created`);
  };

  const updateMonitor = async (id: string, values: CreateMonitorInput) => {
    await monitorApi.updateMonitor(id, values);
    await loadMonitors();
    logActivity("updated", `${values.name} monitor updated`);
  };

  const openCreateModal = () => setCreateModalOpen(true);
  const openEditModal = (monitor: AppMonitor) => {
    setEditingMonitor(monitor);
    setCreateModalOpen(true);
  };
  const closeEditModal = () => setEditingMonitor(null);
  const closeCreateModal = () => {
    setEditingMonitor(null);
    setCreateModalOpen(false);
  };

  // Derived stats (memoized)

  const monitorsUp = monitors.filter((m) => m.status === "up").length;
  const monitorsDown = monitors.filter((m) => m.status === "down").length;
  const monitorsTotal = monitors.length;

  const avgUptime = useMemo(
    () =>
      monitors.length
        ? (
            monitors.reduce((a, m) => a + m.uptimePct, 0) / monitors.length
          ).toFixed(2)
        : "0.00",
    [monitors],
  );

  const avgResponse = useMemo(() => {
    const available = monitors.filter((m) => m.latency !== null);
    if (!available.length) return 0;
    return Math.round(
      available.reduce((a, m) => a + (m.latency ?? 0), 0) / available.length,
    );
  }, [monitors]);

  const alertsSentCount = alerts.filter((a) => a.status === "sent").length;

  return {
    monitors,
    monitorLimit: 10,
    alerts,
    activity,
    isLoading,
    isNewAccount,

    deleteMonitor,
    addMonitor,
    monitorsUp,
    monitorsDown,
    monitorsTotal,
    avgUptime,
    avgResponse,
    alertsSentCount,

    createModalOpen,
    openCreateModal,
    closeCreateModal,
    closeEditModal,
    updateMonitor,
    editingMonitor,
    openEditModal,
  };
}

export type AppData = ReturnType<typeof useAppData>;
