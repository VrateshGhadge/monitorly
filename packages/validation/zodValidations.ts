import { z } from "zod";

export const signupInput = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(64),
});

export const loginInput = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const httpUrlSchema = z
  .url("Invalid URL")
  .trim()
  .refine((url) => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  }, {
    message: "Only HTTP and HTTPS URLs are allowed",
  });

export const monitorInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  url: httpUrlSchema,
});

export const updateMonitorInput = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  url: httpUrlSchema.optional(),

  active: z.boolean().optional(),
});



export type UpdateMonitorInput = z.infer<typeof updateMonitorInput>;
export type SignupInput = z.infer<typeof signupInput>
export type LoginInput = z.infer<typeof loginInput>
export type MonitorInput = z.infer<typeof monitorInput>














// export const monitorInput = z.object({
//   name: z.string().trim().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
//   // url should only accept HTTP or HTTPS URLs 
//   url: z.url("Invalid URL").refine((url) => {
//     return url.startsWith("http://") || url.startsWith("https://");
//   }, "URL must start with http:// or https://"),
// });

// export const updateMonitorInput = z.object({
//   name: z.string().trim().min(1).max(100).optional(),
//   url: z.url("Invalid URL").refine((url) => {
//     return url.startsWith("http://") || url.startsWith("https://");
//   }, "URL must start with http:// or https://").optional(),
//   active: z.boolean().optional(),
// });