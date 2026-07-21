import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { signupInput, loginInput } from "@repo/validation";
import { AppBindings } from "../types/hono";

export const userRouter = new Hono<{
    Bindings: AppBindings;
}>();


userRouter.post('/signup', async(c)=> {
    // grab request body and validate it against the schema
    const body = await c.req.json();
    const result = signupInput.safeParse(body);

    if (!result.success) {
    return c.json({ error: "Invalid input" }, 400);
    }
    
    const { name, email, password } = result.data;
    // init prisma using db url from env bindings
    const prisma = createPrisma(c.env.DATABASE_URL);
    
    try {
        // hash the password before saving to db
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // save new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            }
        })
        // console.log("User created:", user);
        
        // safety check, though prisma usually throws on failure
        if(!user){
            return c.json({ error: "Invalid credentials" }, 400);
        }

        const expTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 1 day in seconds
        // generate token so the user can stay logged in
        const token = await sign({ id: user.id, email: user.email, exp: expTime }, c.env.JWT_SECRET, "HS256");

        return c.json({ token }, 201);
    } catch(error){
        // if prisma throws here, it's usually a unique constraint error (email taken)
        return c.json({ error: "User already exists"}, 409)
    }
})

userRouter.post('/login', async (c)=>{
    // get user input and validate
    const body = await c.req.json();
    const result = loginInput.safeParse(body);

    if (!result.success) {
    return c.json({ error: "Invalid input" }, 400);
    }
    
    const { email, password } = result.data;
    
    const prisma = createPrisma(c.env.DATABASE_URL);
    
    try {
        // look up the user by their email
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(!user || !user.passwordHash){
            return c.json({ error: "Invalid email or password" }, 401);
        }
        
        // compare provided password with the hashed one in db
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if(!isPasswordValid){
            return c.json({ error: "Invalid email or password" }, 401);
        }

        const expTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 1 day in seconds

        // password matches, create and return jwt
        const token = await sign({ id: user.id, email: user.email, exp: expTime }, c.env.JWT_SECRET, "HS256");
        return c.json({ token }, 200);

    } catch(error){
        return c.json({ error: "Invalid credentials" }, 400)
    }
})
