
import { createPrisma, MonitorStatus, type Monitor } from "@repo/db";
import {
  sendMonitorDownEmail,
  sendMonitorRecoveryEmail,
} from "./notification.service";

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


    // Status changed?
    if (oldStatus !== newStatus) {
      // Update database first
      await prisma.monitor.update({
        where: {
          id: monitor.id,
        },
        data: {
          currentStatus: newStatus,
        },
      });

      // Then send notification
      try {
        // UP -> DOWN
        if (
          oldStatus === MonitorStatus.UP &&
          newStatus === MonitorStatus.DOWN
        ) {

          await sendMonitorDownEmail(
            env,
            monitor.user.email,
            monitor.name,
            monitor.url
          );
        }

        // DOWN -> UP
        else if (
          oldStatus === MonitorStatus.DOWN &&
          newStatus === MonitorStatus.UP
        ) {

          await sendMonitorRecoveryEmail(
            env,
            monitor.user.email,
            monitor.name,
            monitor.url
          );
        }
      } catch (err) {
        console.error("Failed to send notification:", err);
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
  }
}

type MonitorToCheck = Pick<Monitor, "name" | "url">;

export async function checkMonitor(monitor: MonitorToCheck) {

  const start = Date.now();

  // Create an AbortController to cancel the request if it takes too long
  const controller = new AbortController();

  // Abort the request after 10 seconds
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  let status: MonitorStatus;
  let responseTime: number | null;

  try {
    const response = await fetch(monitor.url, {
      signal: controller.signal,
    });

    status = response.status >= 500 ? MonitorStatus.DOWN : MonitorStatus.UP;
    responseTime = Date.now() - start;

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
