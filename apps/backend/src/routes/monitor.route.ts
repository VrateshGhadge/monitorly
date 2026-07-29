import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { AppVariables } from "../types/hono";
import { authMiddleware } from "../middleware/auth";
import { monitorInput, updateMonitorInput } from "@repo/validation";
import { CloudflareBindings }  from "../index";
import { sendTestEmail } from "../services/notification.service";
import { checkAllMonitors } from "../services/monitor.service";
import { isSafeMonitorUrl } from "../utils/url";

const monitorSelect = {
    id: true,
    name: true,
    url: true,
    active: true,
    createdAt: true,
    updatedAt: true,
} as const;



export const monitorRouter = new Hono<{
    Bindings: CloudflareBindings;
    Variables: AppVariables;
}>();

monitorRouter.use(authMiddleware);



monitorRouter.post('/', async(c) => {
    const body = await c.req.json();
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);

    const result = monitorInput.safeParse(body);
    if(!result.success){
        return c.json({
            success: false,
            message: "Invalid input",
            errors: result.error.issues,
        }, 400)
    }

    const { name, url } = result.data;
    if (!isSafeMonitorUrl(url)) {
      return c.json({
        success: false,
        message: "Local and private network URLs are not allowed.",
      },400);
    }
    
    try{
        const monitor = await prisma.monitor.create({
            data:{
                name,
                url,
                userId,
            },
        })
        return c.json({ 
            success: true,
            message: "Monitor created successfully",
            data: monitor 
        }, 201
    );
    } catch(error){
        console.error(error);
        
        return c.json({
            success: false,
            message: "Failed to create monitor"
        }, 500)
    }
})


monitorRouter.get('/', async(c)=>{
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);
    
    try{
        const monitors = await prisma.monitor.findMany({
            where: {
                userId,
            },
            select: monitorSelect,
            orderBy:{
                createdAt: "desc"
            }
        })
        return c.json({
            success: true,
            message: "Monitors fetched successfully",
            data: monitors,
        }, 200)
    } catch(error){
        console.error(error);

        return c.json({
            success: false,
            message: "Failed to fetch monitors"
        }, 500)
    }
})


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
        404
      );
    }

    const result = await sendTestEmail(c.env, user.email);

    return c.json({
      success: true,
      message: "Test email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Failed to send test email",
      },
      500
    );
  } finally {
    await prisma.$disconnect();
  }
});


monitorRouter.get("/run-check", async (c) => {
  try {
    await checkAllMonitors(c.env);

    return c.json({
      success: true,
      message: "Monitor check completed successfully",
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Failed to run monitor check",
      },
      500
    );
  }
});


monitorRouter.get('/:id', async(c) =>{
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);
    const monitorId = c.req.param("id");
    try{
        const monitor = await prisma.monitor.findFirst({
            where:{
                userId,
                id: monitorId,
            },
            select: monitorSelect,

        })
        if(!monitor){
            return c.json({
                success: false,
                message: "Monitor not found"
            }, 404)
        }
        return c.json({
            success: true,
            message: "Monitor fetched successfully",
            data: monitor,
        }, 200)
    } catch(error){
        console.error(error);

        return c.json({
            success: false,
            message: "Failed to fetch monitor"
        }, 500)
    }
})

monitorRouter.patch('/:id', async(c) =>{
    const body = await c.req.json();
    const result = updateMonitorInput.safeParse(body);

    if(!result.success){
        return c.json({
            success: false,
            message: "Invalid input",
            errors: result.error.issues,
        }, 400)
    }

    if (result.data.url && !isSafeMonitorUrl(result.data.url)) {
      return c.json({
        success: false,
        message: "Local and private network URLs are not allowed.",
      },400);
    }

    const prisma = createPrisma(c.env.DATABASE_URL);
    const userId = c.get("userId");
    const monitorId = c.req.param("id");

    try{
        const existingMonitor = await prisma.monitor.findFirst({
            where:{
                id: monitorId,
                userId,
            }
        })
        if(!existingMonitor){
            return c.json({
                success: false,
                message: "Monitor not found"
            }, 404)
        }

        const updatedMonitor = await prisma.monitor.update({
            where:{
                id: monitorId,
            },
            data: result.data,
            select: monitorSelect,
        })
        return c.json({
            success: true,
            message: "Monitor updated successfully",
            data: updatedMonitor,
        }, 200)

    }catch(error){
        console.error(error);

        return c.json({
            success: false,
            message: "Failed to update monitor"
        }, 500)
    }

})

monitorRouter.delete('/:id', async(c) =>{
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);
    const monitorId = c.req.param("id");
    try{
        const existingMonitor = await prisma.monitor.findFirst({
            where:{
                id: monitorId,
                userId,
            }
        })
        if(!existingMonitor){
            return c.json({
                success: false,
                message: "Monitor not found"
            }, 404)
        }

        await prisma.monitor.delete({
            where:{
                id: monitorId,
            }
        })
        return c.json({
            success: true,
            message: "Monitor deleted successfully",
        }, 200)
    } catch(error){
        console.error(error);
        
        return c.json({
            success: false,
            message: "Failed to delete monitor"
        }, 500)
    }
})


monitorRouter.get('/:id/history', async(c) =>{
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);
    const monitorId = c.req.param("id");

    try{
        const existingMonitor = await prisma.monitor.findFirst({
            where:{
                id: monitorId,
                userId,
            }
        })
        if(!existingMonitor){
            return c.json({
                success: false,
                message: "Monitor not found"
            }, 404)
        }
        //limit history to last 50 checks
        const history = await prisma.monitorCheck.findMany({
            where:{
                monitorId: existingMonitor.id,
            },
            orderBy:{
                checkedAt: "desc",
            },
            take: 50,
            select:{
                status: true,
                statusCode: true,
                responseTime: true,
                checkedAt: true,
            }
        })
        
        return c.json({
            success: true,
            message: "History fetched successfully",
            data: history,
        }, 200)
    } catch(error){
        console.error(error);

        return c.json({
            success: false,
            message: "Failed to fetch history"
        }, 500)
    }
})

monitorRouter.get('/:id/stats', async(c)=>{
    const userId = c.get("userId");
    const prisma = createPrisma(c.env.DATABASE_URL);
    const monitorId = c.req.param("id");

    try{
        const existingMonitor = await prisma.monitor.findFirst({
            where:{
                id: monitorId,
                userId,
            }
        })
        if(!existingMonitor){
            return c.json({
                success: false,
                message: "Monitor not found"
            }, 404)
        }
    
        const [latestCheck, stats, totalChecks, successfulChecks, failedChecks] = await Promise.all([
            prisma.monitorCheck.findFirst({
                where:{
                    monitorId: existingMonitor.id,
                },
                orderBy:{
                    checkedAt: "desc",
                },
                select:{
                    status: true,
                    statusCode: true,
                    responseTime: true,
                    checkedAt: true,
                }
            }),
            prisma.monitorCheck.aggregate({
                where:{
                    monitorId: existingMonitor.id,
                },
                _avg:{
                    responseTime: true,
                },
            }),
            prisma.monitorCheck.count({
                where:{
                    monitorId: existingMonitor.id,
                }
            }),
            prisma.monitorCheck.count({
                where:{
                    monitorId: existingMonitor.id,
                    status: "UP",
                }
            }),
            prisma.monitorCheck.count({
                where:{
                    monitorId: existingMonitor.id,
                    status: "DOWN",
                }
            })
        ])


        const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

        const currentStatus = latestCheck?.status || "UNKNOWN";
        const lastChecked = latestCheck?.checkedAt || null;
        const averageResponseTime = stats._avg.responseTime ?? null;
        
        return c.json({
            success: true,
            message: "Stats fetched successfully",
            data:{
                currentStatus,
                lastChecked,
                averageResponseTime,
                totalChecks,
                successfulChecks,
                failedChecks,
                uptimePercentage,            
            }
        }, 200)
        }catch(error){
        console.error(error);
        return c.json({
            success: false,
            message: "Failed to fetch stats"
        }, 500)
    }
})

