import type { MonitorEvents } from "../durable-objects/MonitorEvents";

export type CloudflareBindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  MONITOR_EVENTS: DurableObjectNamespace<MonitorEvents>;
  LOGIN_RATE_LIMITER: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
};
};