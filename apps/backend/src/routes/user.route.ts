import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { signupInput, loginInput, deleteAccountInput } from "@repo/validation";
import { authMiddleware } from "../middleware/auth";
import { AppVariables } from "../types/hono";
export const userRouter = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const result = signupInput.safeParse(body);

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

  const { name, email, password } = result.data;
  const prisma = createPrisma(c.env.DATABASE_URL);

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return c.json(
      {
        success: false,
        message: "Email already exists",
      },
      409,
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      c.env.JWT_SECRET,
    );

    return c.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      },
      201,
    );
  } catch (err) {
    console.error(err);

    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
});

userRouter.post("/login", async (c) => {
  const body = await c.req.json();

  const result = loginInput.safeParse(body);

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

  const { email, password } = result.data;

  const prisma = createPrisma(c.env.DATABASE_URL);

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        401,
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return c.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        401,
      );
    }

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      c.env.JWT_SECRET,
    );

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error(err);

    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500,
    );
  }
});
userRouter.use(authMiddleware);

userRouter.delete("/", async (c) => {
  const body = await c.req.json();

  const result = deleteAccountInput.safeParse(body);

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

  const { password } = result.data;

  const userId = c.get("userId");

  const prisma = createPrisma(c.env.DATABASE_URL);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return c.json(
        {
          success: false,
          message: "Incorrect password",
        },
        401,
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return c.json(
      {
        success: true,
        message: "Account deleted successfully.",
      },
      200,
    );
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Failed to delete account.",
      },
      500,
    );
  }
});
