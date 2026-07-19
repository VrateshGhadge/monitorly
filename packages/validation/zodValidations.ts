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

export type SignupInput = z.infer<typeof signupInput>
export type LoginInput = z.infer<typeof loginInput>