import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { signupInput, loginInput } from "@repo/validation";
    
export const userRouter = new Hono<{
    Bindings: CloudflareBindings;
}>();


userRouter.post('/signup', async(c)=> {
    const body = await c.req.json();
    const result = signupInput.safeParse(body);

    if (!result.success) {
    return c.json({ 
        success: false, 
        message: "Invalid input",
        errors: result.error.issues
    }, 400);
    }
    
    const { name, email, password } = result.data;
    const prisma = createPrisma(c.env.DATABASE_URL);
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            }
        })
        
        if(!user){
            return c.json({ 
                success: false,
                message: "User creation failed" 
            }, 400);
        }

        const expTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); 
        const token = await sign({ id: user.id, email: user.email, exp: expTime }, c.env.JWT_SECRET, "HS256");

        return c.json({ 
            success: true,
            message: "User created successfully",
            data: {
                token
            },
        }, 201);
    } catch(error){
        console.error(error);
        return c.json({
            success: false,
            message: "User already exists"
        }, 409)
    }
})

userRouter.post('/login', async (c)=>{
    const body = await c.req.json();
    const result = loginInput.safeParse(body);

    if (!result.success) {
    return c.json({ 
        success: false, 
        message: "Invalid input",
        errors: result.error.issues
    }, 400);
    }
    
    const { email, password } = result.data;
    
    const prisma = createPrisma(c.env.DATABASE_URL);
    
    try {
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(!user || !user.passwordHash){
            return c.json({ success: false, message: "Invalid email or password" }, 401);
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return c.json({ success: false, message: "Invalid email or password" }, 401);
        }

        const expTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 1 day in seconds

        const token = await sign({ id: user.id, email: user.email, exp: expTime }, c.env.JWT_SECRET, "HS256");
        return c.json({ 
            success: true,
            message: "Login successful",
            data: {
                token
            },
        }, 200);

    } catch(error){
        console.error(error);

        return c.json({ 
            success: false,
            message: "Internal server error"
        }, 500);
    }
})
