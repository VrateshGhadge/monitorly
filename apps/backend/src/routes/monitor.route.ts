import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { AppBindings, AppVariables } from "../types/hono";
import { authMiddleware } from "../middleware/auth";
import { monitorInput, updateMonitorInput } from "@repo/validation";


const monitorSelect = {
    id: true,
    name: true,
    url: true,
    active: true,
    createdAt: true,
    updatedAt: true,
} as const;



export const monitorRouter = new Hono<{
    Bindings: AppBindings;
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


// GET /monitors

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


// GET /monitors/:id

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

// PATCH /monitors/:id 

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

// DELETE /monitors/:id

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


// GET /api/v1/monitor/:id/history

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

// GET /api/v1/monitor/:id/stats
// Verify monitor ownership
// Get latest check
// Get average response time
// Get total count
// Get successful count
// Get failed count
// Calculate uptime
// Return JSON

//add promice.all to fetch all stats in parallel 

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

