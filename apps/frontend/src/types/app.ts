// export type MonitorStatus = "up" | "down" | "paused";

export type MonitorStatus = "up" | "down";

export type MonitorType = "WEBSITE" | "API";

export type HttpMethod = "GET" | "POST";

export interface AppMonitor {
  id: string;
  slug: string;

  name: string;
  url: string;

  type: MonitorType;
  method: HttpMethod;

  status: MonitorStatus;

  uptimePct: number;
  latency: number | null;
  lastChecked: string;

  emailAlerts: boolean;

  graphs: {
    response: {
      hour: {
        timestamp: string;
        value: number | null;
      }[];

      day: {
        timestamp: string;
        value: number | null;
      }[];

      month: {
        timestamp: string;
        value: number | null;
      }[];
    };

    uptime: {
      hour: {
        timestamp: string;
        status: "UP" | "DOWN";
      }[];

      day: {
        timestamp: string;
        status: "UP" | "DOWN";
      }[];

      month: {
        timestamp: string;
        status: "UP" | "DOWN";
      }[];
    };
  };
}

export type AlertSeverity = "critical" | "warning" | "resolved";
export type AlertStatus = "sent" | "resolved";

export interface AppAlert {
  id: string;
  monitor: string;
  severity: AlertSeverity;
  status: AlertStatus;
  email: string;
  time: string;
  message: string;
}

export interface ActivityItem {
  id: string;
  kind: "alert" | "created" | "deleted" | "updated";
  text: string;
  time: string;
}

// export interface AppMonitor {
//   id: string;
//   slug: string;

//   name: string;
//   url: string;

//   type: MonitorType;
//   method: HttpMethod;

//   status: MonitorStatus;

//   uptimePct: number;
//   latency: number | null;
//   lastChecked: string;

//   emailAlerts: boolean;
// }

// // export interface AppMonitor {
// //   id: string;
// //   name: string;
// //   url: string;

// //   type: MonitorType;
// //   method: HttpMethod;

// //   status: MonitorStatus;

// //   uptimePct: number;
// //   latency: number | null;
// //   lastChecked: string;

// //   emailAlerts: boolean;
// // }

// export type AlertSeverity = "critical" | "warning" | "resolved";
// export type AlertStatus = "sent" | "resolved";

// export interface AppAlert {
//   id: string;
//   monitor: string;
//   severity: AlertSeverity;
//   status: AlertStatus;
//   email: string;
//   time: string;
//   message: string;
// }

// export interface ActivityItem {
//   id: string;
//   // kind: "alert" | "created" | "paused" | "resumed";
//   kind: "alert" | "created" | "deleted";
//   text: string;
//   time: string;
// }
