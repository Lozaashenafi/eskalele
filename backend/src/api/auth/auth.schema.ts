import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only alphabets and spaces"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain one uppercase letter")
    .regex(/[a-z]/, "Password must contain one lowercase letter")
    .regex(/[0-9]/, "Password must contain one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain one special character"),
  role: z.enum(["author", "reader"], {
    // Correct way to pass custom messages to enums in Zod
    message: "Role must be author or reader",
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
