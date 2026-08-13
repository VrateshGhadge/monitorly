import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { AppVariables } from "../types/hono";
import { authMiddleware } from "../middleware/auth";
import { createMonitorInput, updateMonitorInput } from "@repo/validation";
import type { CloudflareBindings } from "../types/cloudflare";
import { sendTestEmail } from "../services/notification.service";
import { checkAllMonitors } from "../services/monitor.service";
import { isSafeMonitorUrl } from "../utils/url";
import {
  calculateAverageResponse,
  calculateUptimePercentage,
  getLastChecked,
  buildResponseGraphs,
  buildUptimeGraphs,
} from "../utils/monitorGraphs";

const monitorSelect = {
  id: true,
  name: true,
  url: true,
  type: true,
  method: true,
  emailAlerts: true,
  active: true,
  currentStatus: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const monitorRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

monitorRouter.use(authMiddleware);

monitorRouter.get("/events", async (c) => {
  const userId = c.get("userId");
  const id = c.env.MONITOR_EVENTS.idFromName(userId);
  const stub = c.env.MONITOR_EVENTS.get(id);
  const response = await stub.fetch("https://monitor-events/connect");
  return response;
});

monitorRouter.post("/", async (c) => {
  const body = await c.req.json();
  const userId = c.get("userId");
  const prisma = createPrisma(c.env.DATABASE_URL);
  const result = createMonitorInput.safeParse(body);
  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Invalid input",
        errors: result.error.issues,
      },
      400,
    );
  }
  const { name, url, type, method, emailAlerts } = result.data;
  if (!isSafeMonitorUrl(url)) {
    return c.json(
      {
        success: false,
        message: "Local and private network URLs are not allowed.",
      },
      400,
    );
  }

  const monitorCount = await prisma.monitor.count({
    where: {
      userId,
    },
  });

  if (monitorCount >= 10) {
    return c.json(
      {
        success: false,
        message: "You can create a maximum of 10 monitors.",
      },
      409,
    );
  }

  try {
    const monitor = await prisma.monitor.create({
      data: {
        name,
        url,
        type,
        method,
        emailAlerts,
        active: true,
        userId,
      },
      select: monitorSelect,
    });

    return c.json(
      {
        success: true,
        message: "Monitor created successfully",
        data: monitor,
      },
      201,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to create monitor",
      },
      500,
    );
  }
});

monitorRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const prisma = createPrisma(c.env.DATABASE_URL);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const monitors = await prisma.monitor.findMany({
      where: {
        userId,
      },
      select: {
        ...monitorSelect,
        checks: {
          where: {
            checkedAt: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: {
            checkedAt: "asc",
          },
          select: {
            status: true,
            responseTime: true,
            statusCode: true,
            checkedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json(
      {
        success: true,
        message: "Monitors fetched successfully",
        data: monitors.map((monitor) => ({
          id: monitor.id,
          name: monitor.name,
          url: monitor.url,
          type: monitor.type,
          method: monitor.method,
          emailAlerts: monitor.emailAlerts,
          active: monitor.active,
          currentStatus: monitor.currentStatus,
          createdAt: monitor.createdAt,
          updatedAt: monitor.updatedAt,
          avgResponse: calculateAverageResponse(monitor.checks),
          uptimePct: calculateUptimePercentage(monitor.checks),
          lastChecked: getLastChecked(monitor.checks),
          checksCount: monitor.checks.length,
          graphs: {
            response: buildResponseGraphs(monitor.checks),
            uptime: buildUptimeGraphs(monitor.checks),
          },
        })),
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch monitors",
      },
      500,
    );
  }
});

monitorRouter.get("/test-email", async (c) => {
  const prisma = createPrisma(c.env.DATABASE_URL);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: c.get("userId"),
      },
      select: {
        email: true,
      },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    const result = await sendTestEmail(c.env, user.email);
    return c.json(
      {
        success: true,
        message: "Test email sent successfully",
        data: result,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to send test email",
      },
      500,
    );
  }
});

monitorRouter.get("/run-check", async (c) => {
  try {
    await checkAllMonitors(c.env);
    return c.json(
      {
        success: true,
        message: "Monitor check completed successfully",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to run monitor check",
      },
      500,
    );
  }
});

monitorRouter.get("/alerts", async (c) => {
  try {
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);

    const alerts = await prisma.alert.findMany({
      where: { userId },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch alerts",
      },
      500,
    );
  }
});

monitorRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const monitorId = c.req.param("id");
  const prisma = createPrisma(c.env.DATABASE_URL);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        userId,
      },
      select: {
        ...monitorSelect,
        checks: {
          where: {
            checkedAt: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: {
            checkedAt: "desc",
          },
          select: {
            id: true,
            status: true,
            statusCode: true,
            responseTime: true,
            errorMessage: true,
            checkedAt: true,
          },
        },
        alerts: {
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            type: true,
            message: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!monitor) {
      return c.json(
        {
          success: false,
          message: "Monitor not found",
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        message: "Monitor fetched successfully",
        data: monitor,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch monitor",
      },
      500,
    );
  }
});

monitorRouter.patch("/:id", async (c) => {
  const body = await c.req.json();
  const result = updateMonitorInput.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Invalid input",
        errors: result.error.issues,
      },
      400,
    );
  }

  if (result.data.url && !isSafeMonitorUrl(result.data.url)) {
    return c.json(
      {
        success: false,
        message: "Local and private network URLs are not allowed.",
      },
      400,
    );
  }

  const prisma = createPrisma(c.env.DATABASE_URL);
  const userId = c.get("userId");
  const monitorId = c.req.param("id");

  try {
    const existingMonitor = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    });

    if (!existingMonitor) {
      return c.json(
        {
          success: false,
          message: "Monitor not found",
        },
        404,
      );
    }

    if (result.data.url) {
      const duplicate = await prisma.monitor.findFirst({
        where: {
          userId,
          url: result.data.url,
          NOT: { id: monitorId },
        },
        select: { id: true },
      });

      if (duplicate) {
        return c.json(
          {
            success: false,
            message: "A monitor with this URL already exists.",
          },
          409,
        );
      }
    }

    const updatedMonitor = await prisma.monitor.update({
      where: { id: monitorId },
      data: { ...result.data },
      select: monitorSelect,
    });

    return c.json(
      {
        success: true,
        message: "Monitor updated successfully",
        data: updatedMonitor,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return c.json(
        {
          success: false,
          message: "A monitor with this URL already exists.",
        },
        409,
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to update monitor",
      },
      500,
    );
  }
});

monitorRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const monitorId = c.req.param("id");
  const prisma = createPrisma(c.env.DATABASE_URL);

  try {
    const existingMonitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        userId,
      },
      select: monitorSelect,
    });

    if (!existingMonitor) {
      return c.json(
        {
          success: false,
          message: "Monitor not found",
        },
        404,
      );
    }

    await prisma.monitor.delete({
      where: {
        id: monitorId,
      },
    });

    return c.json(
      {
        success: true,
        message: "Monitor deleted successfully",
        data: existingMonitor,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to delete monitor",
      },
      500,
    );
  }
});

monitorRouter.get("/:id/history", async (c) => {
  const userId = c.get("userId");
  const monitorId = c.req.param("id");
  const prisma = createPrisma(c.env.DATABASE_URL);

  try {
    const existingMonitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        userId,
      },
    });

    if (!existingMonitor) {
      return c.json(
        {
          success: false,
          message: "Monitor not found",
        },
        404,
      );
    }

    const history = await prisma.monitorCheck.findMany({
      where: {
        monitorId: existingMonitor.id,
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: 30,
      select: {
        status: true,
        statusCode: true,
        responseTime: true,
        errorMessage: true,
        checkedAt: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "History fetched successfully",
        data: history,
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch history",
      },
      500,
    );
  }
});

monitorRouter.get("/:id/stats", async (c) => {
  const userId = c.get("userId");
  const monitorId = c.req.param("id");
  const prisma = createPrisma(c.env.DATABASE_URL);

  try {
    const existingMonitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        userId,
      },
    });

    if (!existingMonitor) {
      return c.json(
        {
          success: false,
          message: "Monitor not found",
        },
        404,
      );
    }

    const [latestCheck, stats, totalChecks, successfulChecks, failedChecks] =
      await Promise.all([
        prisma.monitorCheck.findFirst({
          where: {
            monitorId: existingMonitor.id,
          },
          orderBy: {
            checkedAt: "desc",
          },
          select: {
            status: true,
            statusCode: true,
            responseTime: true,
            errorMessage: true,
            checkedAt: true,
          },
        }),
        prisma.monitorCheck.aggregate({
          where: {
            monitorId: existingMonitor.id,
          },
          _avg: {
            responseTime: true,
          },
        }),
        prisma.monitorCheck.count({
          where: {
            monitorId: existingMonitor.id,
          },
        }),
        prisma.monitorCheck.count({
          where: {
            monitorId: existingMonitor.id,
            status: "UP",
          },
        }),
        prisma.monitorCheck.count({
          where: {
            monitorId: existingMonitor.id,
            status: "DOWN",
          },
        }),
      ]);

    const uptimePercentage =
      totalChecks > 0
        ? Number(((successfulChecks / totalChecks) * 100).toFixed(2))
        : 0;

    return c.json(
      {
        success: true,
        message: "Stats fetched successfully",
        data: {
          currentStatus: latestCheck?.status ?? existingMonitor.currentStatus,
          statusCode: latestCheck?.statusCode ?? null,
          errorMessage: latestCheck?.errorMessage ?? null,
          lastChecked: latestCheck?.checkedAt ?? null,
          averageResponseTime:
            stats._avg.responseTime !== null
              ? Math.round(stats._avg.responseTime)
              : null,
          totalChecks,
          successfulChecks,
          failedChecks,
          uptimePercentage,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch stats",
      },
      500,
    );
  }
});
