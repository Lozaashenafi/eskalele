import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: "author" | "reader";
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  // 1. Check if header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, "Unauthorized", null, ["No token provided"]);
  }

  // 2. Extract token and check if it actually exists
  const parts = authHeader.split(" ");
  const token = parts[1];

  if (!token) {
    return sendResponse(res, 401, "Unauthorized", null, [
      "Token is missing from header",
    ]);
  }

  try {
    // 3. Verify the token (token is now guaranteed to be a string here)
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      sub: string;
      role: "author" | "reader";
    };

    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 401, "Unauthorized", null, [
      "Invalid or expired token",
    ]);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendResponse(res, 403, "Forbidden", null, ["Access denied"]);
    }
    next();
  };
};
