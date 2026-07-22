import { z } from "zod";

// export const signupInput = z.object({
//     name: z.string().optional(),
//     email: z.email("Invalid email address"),
//     password: z.string().min(8, "Password must be at least 8 characters long"),
// })

export const signupInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(64),
});

// export const loginInput = z.object({
//     email: z.email("Invalid email address"),
//     password: z.string().min(8, "Password must be atleast 8 charactres long")
// })
export const loginInput = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const monitorInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  url: z.url("Invalid URL").trim(),
  // interval: z.number().int().min(1, "Interval must be at least 1 minute").max(1440, "Interval cannot exceed 1440 minutes (24 hours)"),
  // userId: z.uuid("Invalid user ID"),
});

export const updateMonitorInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  url: z.url("Invalid URL").trim().optional(),
  active: z.boolean().optional(),
});

export type UpdateMonitorInput = z.infer<typeof updateMonitorInput>;
export type SignupInput = z.infer<typeof signupInput>
export type LoginInput = z.infer<typeof loginInput>
export type MonitorInput = z.infer<typeof monitorInput>