import type { AlertEvent } from "../types/dashboard";

export const initialAlerts: AlertEvent[] = [
  {
    id: "a1",
    monitor: "payments.acme.dev",
    detail: "HTTPS check failed · email sent to team@acme.dev",
    time: "2 min ago",
    status: "sent",
  },
  // {
  //   id: "a2",
  //   monitor: "auth.acme.dev",
  //   detail: "Recovered after 4 min · resolution email sent",
  //   time: "3 hr ago",
  //   status: "resolved",
  // },
  // {
  //   id: "a3",
  //   monitor: "db-primary",
  //   detail: "TCP check failed · email sent to team@acme.dev",
  //   time: "Yesterday",
  //   status: "sent",
  // },
  // {
  //   id: "a4",
  //   monitor: "cdn.acme.dev",
  //   detail: "Recovered after 2 min · resolution email sent",
  //   time: "2 days ago",
  //   status: "resolved",
  // },
];
