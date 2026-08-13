export type MonitorStatus = "up" | "down";

export interface Monitor {
  id: string;
  name: string;
  type: string;
  uptimePct: number;
  latency: number | null;
  status: MonitorStatus;
}

export type HistoryStatus = "ok" | "warn" | "down";

export type AlertStatus = "sent" | "resolved";

export interface AlertEvent {
  id: string;
  monitor: string;
  detail: string;
  time: string;
  status: AlertStatus;
}

export interface SidebarItem<Key extends string = string> {
  key: Key;
  label: string;
}

export interface NotificationPreferences {
  email: boolean;
}
