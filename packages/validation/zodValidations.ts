import { z } from "zod";

export const emailInput = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
});

export const signupInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(64),
});

export const loginInput = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordInput = emailInput;

export const signInInput = loginInput.extend({
  remember: z.boolean(),
});

export const deleteAccountInput = z.object({
  password: z.string().min(1, "Password is required"),
});

const httpUrlSchema = z
  .url("Invalid URL")
  .trim()
  .refine(
    (url) => {
      const protocol = new URL(url).protocol;
      return protocol === "http:" || protocol === "https:";
    },
    {
      message: "Only HTTP and HTTPS URLs are allowed",
    },
  );

export const monitorInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  url: httpUrlSchema,
});

export const createMonitorInput = monitorInput.extend({
  type: z.enum(["WEBSITE", "API"]),
  method: z.enum(["GET", "POST"]),
  emailAlerts: z.boolean(),
});

export const updateMonitorInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  url: httpUrlSchema.optional(),
  type: z.enum(["WEBSITE", "API"]),
  method: z.enum(["GET", "POST"]).optional(),
  emailAlerts: z.boolean().optional(),
  active: z.boolean().optional(),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountInput>;
export type EmailInput = z.infer<typeof emailInput>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;
export type SignupInput = z.infer<typeof signupInput>;
export type LoginInput = z.infer<typeof loginInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type MonitorInput = z.infer<typeof monitorInput>;
export type CreateMonitorInput = z.infer<typeof createMonitorInput>;
export type UpdateMonitorInput = z.infer<typeof updateMonitorInput>;
