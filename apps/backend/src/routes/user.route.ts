import { Hono } from "hono";
import { createPrisma } from "@repo/db";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import {
  signupInput,
  loginInput,
  googleAuthInput,
  deleteAccountInput,
} from "@repo/validation";
import { authMiddleware } from "../middleware/auth";
import { AppVariables } from "../types/hono";
import type { CloudflareBindings } from "../types/cloudflare";
import { verifyGoogleCredential } from "../utils/googleAuth";

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
  const prisma = createPrisma(c.env.DB);

  const existingUser = await prisma.user.findUnique({
    where: { email },
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
            hasPassword: !!user.passwordHash,
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

  const ip =
    c.req.header("CF-Connecting-IP")?.trim() ||
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  const rateLimitKey = result.success
    ? `login:${ip}:${result.data.email}`
    : `login:${ip}:invalid`;

  const rateLimit = await c.env.LOGIN_RATE_LIMITER.limit({
    key: rateLimitKey,
  });

  if (!rateLimit.success) {
    console.warn("LOGIN RATE LIMITED:", ip);

    return c.json(
        {
        success: false,
        message: "Too many login attempts. Please try again later.",
        },
        429,
    );
    }

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
  const prisma = createPrisma(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
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

    const validPassword = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

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
          hasPassword: !!user.passwordHash,
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

userRouter.post("/google", async (c) => {
  try {
    const body = await c.req.json();
    const result = googleAuthInput.safeParse(body);

    const ip =
      c.req.header("CF-Connecting-IP")?.trim() ||
      c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ||
      "unknown";

    const rateLimit = await c.env.LOGIN_RATE_LIMITER.limit({
      key: `google:${ip}`,
    });

    if (!rateLimit.success) {
      console.warn("GOOGLE AUTH RATE LIMITED:", ip);

      return c.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        429,
      );
    }

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

    if (!c.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is not configured");

      return c.json(
        {
          success: false,
          message: "Google sign-in is not configured",
        },
        500,
      );
    }

    const identity = await verifyGoogleCredential(
      result.data.credential,
      c.env.GOOGLE_CLIENT_ID,
    ).catch((err) => {
      console.error("Google credential verification failed:", err);
      return null;
    });

    if (!identity) {
      return c.json(
        {
          success: false,
          message: "Google sign-in failed. Please try again.",
        },
        401,
      );
    }

    const prisma = createPrisma(c.env.DB);

    let user = await prisma.user.findUnique({
      where: { googleId: identity.sub },
    });

    if (!user) {
      const existingUser = await prisma.user.findUnique({
        where: { email: identity.email },
      });

      if (existingUser) {
        return c.json(
          {
            success: false,
            message:
              "An account with this email already exists. Sign in with your email and password.",
          },
          409,
        );
      }

      user = await prisma.user.create({
        data: {
          email: identity.email,
          googleId: identity.sub,
          name: identity.name,
        },
      });
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
          hasPassword: !!user.passwordHash,
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

// All routes below require authentication
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

  const { password, credential } = result.data;
  const userId = c.get("userId");
  const prisma = createPrisma(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (user.passwordHash) {
      if (!password) {
        return c.json(
          {
            success: false,
            message: "Password is required to delete this account.",
          },
          400,
        );
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        return c.json(
          {
            success: false,
            message: "Incorrect password",
          },
          403,
        );
      }
    } else {
      if (!credential) {
        return c.json(
          {
            success: false,
            message: "Google confirmation is required for this account.",
          },
          400,
        );
      }

      if (!c.env.GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID is not configured");

        return c.json(
          {
            success: false,
            message: "Google sign-in is not configured",
          },
          500,
        );
      }

      const identity = await verifyGoogleCredential(
        credential,
        c.env.GOOGLE_CLIENT_ID,
      ).catch((err) => {
        console.error("Google credential verification failed:", err);
        return null;
      });

      if (!identity) {
        return c.json(
          {
            success: false,
            message: "Could not verify your Google account. Please try again.",
          },
          403,
        );
      }

      if (identity.sub !== user.googleId) {
        return c.json(
          {
            success: false,
            message:
              "That's a different Google account to the one linked to this Monitorly account. Please confirm with the correct account.",
          },
          403,
        );
      }

      const now = Math.floor(Date.now() / 1000);

      if (identity.iat === null || now - identity.iat > 300) {
        return c.json(
          {
            success: false,
            message:
              "That Google confirmation was too old. Please confirm with Google again.",
          },
          403,
        );
      }
    }

    await prisma.user.delete({
      where: { id: userId },
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