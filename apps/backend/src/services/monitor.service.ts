
import { createPrisma, MonitorStatus } from "@repo/db";


export async function checkAllMonitors( env: CloudflareBindings ) {
    console.log("checkAllMonitors() called");
    const prisma = createPrisma(env.DATABASE_URL);

    const monitors = await prisma.monitor.findMany({
        where: {
        active: true,
        },
    });

    console.log(`Found ${monitors.length} active monitors`);

    for (const monitor of monitors) {
    console.log(`- ${monitor.name}: ${monitor.url}`);
    
    const result = await checkMonitor(monitor);
    await prisma.monitorCheck.create({
        data:{
            monitorId: monitor.id,
            status: result.status,
            responseTime: result.responseTime,
            statusCode: result.statusCode
        }
    })
    
    }
}

export async function checkMonitor(monitor: any) {
  console.log(`Checking ${monitor.name}`);

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

    status = response.status >= 500 ? "DOWN" : "UP";
    responseTime = Date.now() - start;

    console.log(`HTTP Status: ${response.status}`);
    console.log(`Monitor: ${status}`);
    console.log(`Response Time: ${responseTime} ms`);

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