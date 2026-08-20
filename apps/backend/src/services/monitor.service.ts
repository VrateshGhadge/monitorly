import { createPrisma, MonitorStatus, AlertType, type Monitor } from "@repo/db";
import {
  sendMonitorDownEmail,
  sendMonitorRecoveryEmail,
} from "./notification.service";
import type { CloudflareBindings } from "../types/cloudflare";
import { isSafeMonitorUrl } from "../utils/url";

export async function checkAllMonitors(env: CloudflareBindings) {
  const prisma = createPrisma(env.DATABASE_URL);

  const monitors = await prisma.monitor.findMany({
    where: {
      active: true,
    },
    include: {
      user: true,
    },
  });

  for (const monitor of monitors) {
    const result = await checkMonitor(monitor);

    const oldStatus = monitor.currentStatus;
    const newStatus = result.status;

    // Get the Durable Object stub for this user (once per monitor)
    const id = env.MONITOR_EVENTS.idFromName(monitor.userId);
    const stub = env.MONITOR_EVENTS.get(id);

    // Handle status change
    if (oldStatus !== newStatus) {
      // Update monitor status in DB
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { currentStatus: newStatus },
      });

      try {
        let alertType: AlertType;
        let message: string;
        let alertStatus: "SENT" | "RESOLVED";

        if (
          oldStatus === MonitorStatus.UP &&
          newStatus === MonitorStatus.DOWN
        ) {
          alertType = AlertType.DOWN;
          message = `${monitor.name} is down`;
          alertStatus = "SENT";

          await sendMonitorDownEmail(
            env,
            monitor.user.email,
            monitor.name,
            monitor.url,
          );
        } else if (
          oldStatus === MonitorStatus.DOWN &&
          newStatus === MonitorStatus.UP
        ) {
          alertType = AlertType.RECOVERY;
          message = `${monitor.name} recovered`;
          alertStatus = "RESOLVED";

          await sendMonitorRecoveryEmail(
            env,
            monitor.user.email,
            monitor.name,
            monitor.url,
          );
        } else {
          // Should never happen, but just in case
          continue;
        }

        // Persist alert in DB
        const alert = await prisma.alert.create({
          data: {
            userId: monitor.userId,
            monitorId: monitor.id,
            type: alertType,
            message,
            status: alertStatus,
          },
        });

        // Broadcast alert via SSE
        await stub.broadcastAlertUpdate({
          id: alert.id,
          monitor: monitor.name,
          type: alertType,
          message,
          status: alertStatus,
          email: monitor.user.email,
          createdAt: alert.createdAt.toISOString(),
        });
      } catch (err) {
        console.error("Failed to process alert:", err);
      }
    }

    // Always save the monitor check
    await prisma.monitorCheck.create({
      data: {
        monitorId: monitor.id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
      },
    });

    // Broadcast monitor update
    await stub.broadcastMonitorUpdate({
      monitorId: monitor.id,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      checkedAt: new Date().toISOString(),
    });
  }
}

type MonitorToCheck = Pick<Monitor, "name" | "url">;

export async function checkMonitor(monitor: MonitorToCheck) {
  if (!isSafeMonitorUrl(monitor.url)) {
    return {
      status: MonitorStatus.DOWN,
      responseTime: null,
      statusCode: null,
    };
  }
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(monitor.url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const redirectStatuses = new Set([301, 302, 303, 307, 308]);

    if (redirectStatuses.has(response.status)) {
      const location = response.headers.get("Location");

      if (!location) {
        return {
          status: MonitorStatus.DOWN,
          responseTime: Date.now() - start,
          statusCode: response.status,
        };
      }

      try {
        const redirectUrl = new URL(location, monitor.url);

        if (!isSafeMonitorUrl(redirectUrl.toString())) {
          console.warn(
            `Blocked unsafe redirect for ${monitor.name}: ${redirectUrl.hostname}`,
          );

          return {
            status: MonitorStatus.DOWN,
            responseTime: Date.now() - start,
            statusCode: response.status,
          };
        }
      } catch {
        return {
          status: MonitorStatus.DOWN,
          responseTime: Date.now() - start,
          statusCode: response.status,
        };
      }
    }

    const status =
      response.status >= 200 && response.status < 400
        ? MonitorStatus.UP
        : MonitorStatus.DOWN;
    const responseTime = Date.now() - start;

    return {
      status,
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log(`${monitor.name} timed out after 10 seconds`);
    } else {
      console.error(`Error checking ${monitor.name}:`, error);
    }

    return {
      status: MonitorStatus.DOWN,
      responseTime: null,
      statusCode: null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
