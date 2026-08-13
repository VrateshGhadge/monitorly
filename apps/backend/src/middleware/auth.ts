import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { AppVariables } from "../types/hono";
import type { JwtPayload } from "../types/auth";
// import { CloudflareBindings } from "../index";
import { CloudflareBindings } from "../types/cloudflare";

export const authMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
      },
      401,
    );
  }

  const token = authHeader.substring(7);

  try {
    const jwtpayload = (await verify(
      token,
      c.env.JWT_SECRET,
      "HS256",
    )) as JwtPayload;

    c.set("userId", jwtpayload.id);

    await next();
  } catch {
    return c.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      401,
    );
  }
});
