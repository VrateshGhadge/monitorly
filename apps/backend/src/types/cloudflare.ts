import type { MonitorEvents } from "../durable-objects/MonitorEvents";

export type CloudflareBindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  MONITOR_EVENTS: DurableObjectNamespace<MonitorEvents>;
  LOGIN_RATE_LIMITER: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
};
};
