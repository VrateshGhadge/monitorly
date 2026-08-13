import { useMemo, useState } from "react";
import { initialMonitors } from "../data/monitors";
import { initialAlerts } from "../data/alerts";
import type { SectionKey } from "../data/navigation";
import type { NotificationPreferences } from "../types/dashboard";

export function useDashboardState() {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [monitors, setMonitors] = useState(initialMonitors);
  const [alerts] = useState(initialAlerts);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
  });

  const toggleMonitor = (id: string) =>
    setMonitors((prev) =>
      prev.map((m) =>
        m.id === id
          ? m.status === "up"
            ? { ...m, status: "down", latency: null }
            : {
                ...m,
                status: "up",
                latency: Math.round(20 + Math.random() * 180),
              }
          : m,
      ),
    );

  const toggleNotification = (key: keyof NotificationPreferences) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const monitorsUp = monitors.filter((m) => m.status === "up").length;
  const monitorsTotal = monitors.length;
  const avgUptime = useMemo(
    () =>
      (monitors.reduce((a, m) => a + m.uptimePct, 0) / monitors.length).toFixed(
        2,
      ),
    [monitors],
  );
  const avgResponse = useMemo(() => {
    const up = monitors.filter((m) => m.status === "up" && m.latency !== null);
    if (!up.length) return 0;
    return Math.round(up.reduce((a, m) => a + (m.latency || 0), 0) / up.length);
  }, [monitors]);
  const activeAlerts = monitors.filter((m) => m.status === "down").length;

  return {
    activeSection,
    setActiveSection,
    monitors,
    toggleMonitor,
    alerts,
    notifications,
    toggleNotification,
    monitorsUp,
    monitorsTotal,
    avgUptime,
    avgResponse,
    activeAlerts,
  };
}
