import { CreateMonitorInput } from "../../../../packages/validation/zodValidations";
import { api } from "../lib/api";

export interface GraphPoint {
  timestamp: string;
  value: number | null;
}

export interface UptimePoint {
  timestamp: string;
  status: "UP" | "DOWN";
}

export interface MonitorGraphs {
  response: {
    hour: GraphPoint[];
    day: GraphPoint[];
    month: GraphPoint[];
  };

  uptime: {
    hour: UptimePoint[];
    day: UptimePoint[];
    month: UptimePoint[];
  };
}

export interface Monitor {
  id: string;
  name: string;
  url: string;

  type: "WEBSITE" | "API";
  method: "GET" | "POST";

  emailAlerts: boolean;
  active: boolean;

  currentStatus: "UP" | "DOWN";

  createdAt: string;
  updatedAt: string;

  avgResponse: number | null;
  uptimePct: number;
  lastChecked: string | null;
  checksCount: number;

  graphs: MonitorGraphs;
}

export interface MonitorHistory {
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTime: number | null;
  checkedAt: string;
}

export interface MonitorStats {
  currentStatus: "UP" | "DOWN";
  lastChecked: string | null;
  averageResponseTime: number | null;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptimePercentage: number;
}

export interface Alert {
  id: string;
  monitorId: string;
  type: "DOWN" | "RECOVERY";
  message: string;
  status: "SENT" | "RESOLVED";
  createdAt: string;

  monitor: {
    id: string;
    name: string;
  };

  user: {
    email: string;
  };
}

interface AlertsResponse {
  success: boolean;
  data: Alert[];
}

interface MonitorResponse {
  success: boolean;
  data: Monitor[];
}

interface SingleMonitorResponse {
  success: boolean;
  data: Monitor;
}

interface HistoryResponse {
  success: boolean;
  data: MonitorHistory[];
}

interface StatsResponse {
  success: boolean;
  data: MonitorStats;
}

export async function getMonitors() {
  const { data } = await api.get<MonitorResponse>("/api/v1/monitor");

  return data.data;
}

export async function getMonitor(id: string) {
  const { data } = await api.get<SingleMonitorResponse>(
    `/api/v1/monitor/${id}`,
  );

  return data.data;
}

export async function createMonitor(payload: {
  name: string;
  url: string;
  type: "WEBSITE" | "API";
  method: "GET" | "POST";
  emailAlerts: boolean;
}) {
  const { data } = await api.post<SingleMonitorResponse>(
    "/api/v1/monitor",
    payload,
  );

  return data.data;
}

// export async function updateMonitor(
//   id: string,
//   payload: {
//     name?: string;
//     url?: string;
//     active?: boolean;
//   }
// ) {
//   const { data } = await api.patch<SingleMonitorResponse>(
//     `/api/v1/monitor/${id}`,
//     payload
//   );

//   return data.data;
// }

export async function updateMonitor(id: string, payload: CreateMonitorInput) {
  const { data } = await api.patch(`/api/v1/monitor/${id}`, payload);

  return data.data;
}

export async function deleteMonitor(id: string) {
  const { data } = await api.delete(`/api/v1/monitor/${id}`);

  return data;
}

export async function getMonitorHistory(id: string) {
  const { data } = await api.get<HistoryResponse>(
    `/api/v1/monitor/${id}/history`,
  );

  return data.data;
}

export async function getMonitorStats(id: string) {
  const { data } = await api.get<StatsResponse>(`/api/v1/monitor/${id}/stats`);

  return data.data;
}

export async function getAlerts() {
  const { data } = await api.get<AlertsResponse>("/api/v1/monitor/alerts");

  return data.data;
}

export async function sendTestEmail() {
  const { data } = await api.get("/api/v1/monitor/test-email");

  return data;
}

// import { api } from "../lib/api";

// export interface GraphPoint {
//   timestamp: string;
//   value: number | null;
// }

// export interface UptimePoint {
//   timestamp: string;
//   status: "UP" | "DOWN";
// }

// export interface MonitorGraphs {
//   response: {
//     hour: GraphPoint[];
//     day: GraphPoint[];
//     month: GraphPoint[];
//   };

//   uptime: {
//     hour: UptimePoint[];
//     day: UptimePoint[];
//     month: UptimePoint[];
//   };
// }

// export interface Monitor {
//   id: string;
//   name: string;
//   url: string;

//   type: "WEBSITE" | "API";
//   method: "GET" | "POST";

//   emailAlerts: boolean;
//   active: boolean;

//   currentStatus: "UP" | "DOWN";

//   createdAt: string;
//   updatedAt: string;

//   graphs: MonitorGraphs;
// }

// export interface MonitorHistory {
//   status: "UP" | "DOWN";
//   statusCode: number | null;
//   responseTime: number | null;
//   checkedAt: string;
// }

// export interface MonitorStats {
//   currentStatus: "UP" | "DOWN";
//   lastChecked: string | null;
//   averageResponseTime: number | null;
//   totalChecks: number;
//   successfulChecks: number;
//   failedChecks: number;
//   uptimePercentage: number;
// }

// interface MonitorResponse {
//   success: boolean;
//   data: Monitor[];
// }

// interface SingleMonitorResponse {
//   success: boolean;
//   data: Monitor;
// }

// interface HistoryResponse {
//   success: boolean;
//   data: MonitorHistory[];
// }

// interface StatsResponse {
//   success: boolean;
//   data: MonitorStats;
// }

// export async function getMonitors() {
//   const { data } = await api.get<MonitorResponse>(
//     "/api/v1/monitor"
//   );

//   return data.data;
// }

// export async function getMonitor(id: string) {
//   const { data } = await api.get<SingleMonitorResponse>(
//     `/api/v1/monitor/${id}`
//   );

//   return data.data;
// }

// export async function createMonitor(payload: {
//   name: string;
//   url: string;
//   type: "WEBSITE" | "API";
//   method: "GET" | "POST";
//   emailAlerts: boolean;
// }) {
//   const { data } = await api.post<SingleMonitorResponse>(
//     "/api/v1/monitor",
//     payload
//   );

//   return data.data;
// }

// export async function updateMonitor(
//   id: string,
//   payload: {
//     name?: string;
//     url?: string;
//     active?: boolean;
//   }
// ) {
//   const { data } = await api.patch<SingleMonitorResponse>(
//     `/api/v1/monitor/${id}`,
//     payload
//   );

//   return data.data;
// }

// export async function deleteMonitor(id: string) {
//   const { data } = await api.delete(
//     `/api/v1/monitor/${id}`
//   );

//   return data;
// }

// export async function getMonitorHistory(id: string) {
//   const { data } = await api.get<HistoryResponse>(
//     `/api/v1/monitor/${id}/history`
//   );

//   return data.data;
// }

// export async function getMonitorStats(id: string) {
//   const { data } = await api.get<StatsResponse>(
//     `/api/v1/monitor/${id}/stats`
//   );

//   return data.data;
// }

// import { api } from "../lib/api";

// export interface Monitor {
//   id: string;
//   name: string;
//   url: string;

//   type: "WEBSITE" | "API";
//   method: "GET" | "POST";

//   emailAlerts: boolean;
//   active: boolean;

//   currentStatus: "UP" | "DOWN";

//   createdAt: string;
//   updatedAt: string;
// }

// export interface MonitorHistory {
//   status: "UP" | "DOWN";
//   statusCode: number | null;
//   responseTime: number | null;
//   checkedAt: string;
// }

// export interface MonitorStats {
//   currentStatus: "UP" | "DOWN";
//   lastChecked: string | null;
//   averageResponseTime: number | null;
//   totalChecks: number;
//   successfulChecks: number;
//   failedChecks: number;
//   uptimePercentage: number;
// }

// interface MonitorResponse {
//   success: boolean;
//   data: Monitor[];
// }

// interface SingleMonitorResponse {
//   success: boolean;
//   data: Monitor;
// }

// interface HistoryResponse {
//   success: boolean;
//   data: MonitorHistory[];
// }

// interface StatsResponse {
//   success: boolean;
//   data: MonitorStats;
// }

// export async function getMonitors() {
//   const { data } = await api.get<MonitorResponse>(
//     "/api/v1/monitor"
//   );

//   return data.data;
// }

// export async function getMonitor(id: string) {
//   const { data } = await api.get<SingleMonitorResponse>(
//     `/api/v1/monitor/${id}`
//   );

//   return data.data;
// }

// export async function createMonitor(payload: {
//   name: string;
//   url: string;
//   type: "WEBSITE" | "API";
//   method: "GET" | "POST";
//   emailAlerts: boolean;
// }) {
//   const { data } = await api.post<SingleMonitorResponse>(
//     "/api/v1/monitor",
//     payload
//   );

//   return data.data;
// }

// export async function updateMonitor(
//   id: string,
//   payload: {
//     name?: string;
//     url?: string;
//     active?: boolean;
//   }
// ) {
//   const { data } = await api.patch<SingleMonitorResponse>(
//     `/api/v1/monitor/${id}`,
//     payload
//   );

//   return data.data;
// }

// export async function deleteMonitor(id: string) {
//   const { data } = await api.delete(
//     `/api/v1/monitor/${id}`
//   );

//   return data;
// }

// export async function getMonitorHistory(id: string) {
//   const { data } = await api.get<HistoryResponse>(
//     `/api/v1/monitor/${id}/history`
//   );

//   return data.data;
// }

// export async function getMonitorStats(id: string) {
//   const { data } = await api.get<StatsResponse>(
//     `/api/v1/monitor/${id}/stats`
//   );

//   return data.data;
// }
