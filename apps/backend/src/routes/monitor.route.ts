import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { verify } from "hono/jwt";
import { AppBindings, AppVariables } from "../types/hono";
import { authMiddleware } from "../middleware/auth";
import { monitorInput } from "@repo/validation";



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

    try{
        const monitor = await prisma.monitor.create({
            data:{
                name: body.name,
                url: body.url,
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
        })
        return c.json({
            success: true,
            message: "Monitors fetched successfully",
            data: monitors,
        }, 200)
    } catch(error){
        return c.json({
            success: false,
            message: "Failed to fetch monitors"
        }, 500)
    }
})







