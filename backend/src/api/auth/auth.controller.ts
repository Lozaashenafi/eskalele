import type { Request, Response } from "express";
import { db } from "../../utils/db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema } from "./auth.schema";
import { sendResponse } from "../../utils/response";
import crypto from "crypto";
import { z } from "zod"; // Make sure to import z

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    // 1. Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));
    if (existing) {
      return sendResponse(res, 409, "Conflict", null, ["Email already exists"]);
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // 3. Insert User
    const newId = crypto.randomUUID();
    await db.insert(users).values({
      id: newId,
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role as "author" | "reader",
    });

    return sendResponse(res, 201, "User registered successfully", {
      id: newId,
      email: validatedData.email,
    });
  } catch (error: any) {
    // Check if it's a Zod Validation Error
    if (error instanceof z.ZodError) {
      // This extracts ONLY the messages you defined in your schema
      const errorMessages = error.issues.map((err: any) => err.message);

      return sendResponse(res, 400, "Validation Failed", null, errorMessages);
    }

    // Handle other errors (like database errors)
    return sendResponse(res, 500, "Internal Server Error", null, [
      error.message,
    ]);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 1. Find User
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, 401, "Invalid email or password");
    }

    // 2. Generate Token
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
    );

    return sendResponse(res, 200, "Login successful", {
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error: any) {
    return sendResponse(res, 400, "Login Failed", null, [error.message]);
  }
};
