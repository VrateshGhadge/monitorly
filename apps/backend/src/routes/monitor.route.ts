import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { verify } from "hono/jwt";
import { AppBindings, AppVariables } from "../types/hono";
import { authMiddleware } from "../middleware/auth";


//some type of validation

export const monitorRouter = new Hono<{
    Bindings: AppBindings;
    Variables: AppVariables;
}>();

monitorRouter.use(authMiddleware);

