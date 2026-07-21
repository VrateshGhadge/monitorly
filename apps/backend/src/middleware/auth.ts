
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { AppBindings, AppVariables} from "../types/hono";
import type { JwtPayload } from "../types/auth";

export const authMiddleware = createMiddleware<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>(async (c, next) => {
  // Get Authorization header
  const authHeader = c.req.header("Authorization");

  // Check if header exists and follows "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
      },
      401
    );
  }

  // Extract token
  const token = authHeader.substring(7);

  try {
    // Verify JWT
    const jwtpayload = await verify(token, c.env.JWT_SECRET, "HS256") as JwtPayload;

    // Save userId so downstream handlers can access it
    c.set("userId", jwtpayload.id);

    // Continue to next middleware/route
    await next();
  } catch {
    return c.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      401
    );
  }
});





// import { verify } from "hono/jwt";
// import { createMiddleware } from 'hono/factory'
// import { AppBindings, AppVariables } from "../types/hono";


// export const authMiddleware = createMiddleware<{
//     Bindings: AppBindings;
//     Variables: AppVariables;
// }>(async (c, next) => {
//     const authHeader = c.req.header('Authorization') || '';
//     // extract token
//     const token = authHeader.split(' ')[1];
//     try{
//         //reject immediately if token is missing
//         if(!token){
//             c.status(403);
//             return c.json({ message : "You are not logged in"})
//         }

//         //verify and pass forward
//         const user = await verify(token, c.env.JWT_SECRET, "HS256");
//         if (user){
//             c.set("userId", user.id as string)
//             await next()
//         }
//     } catch(e){
//         c.status(403);
//         return c.json({ message : "You are not logged in"})
//     }
// })
