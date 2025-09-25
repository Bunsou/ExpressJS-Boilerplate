// Path: src/features/auth/middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { AppError } from "../../../shared/utils/errorHandler";
import {
  verifyAccessToken,
  extractTokenFromHeader,
} from "../services/jwt.service";
import type { AuthenticatedRequest } from "../../../shared/types/auth.types";

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) throw new AppError("TOKEN_INVALID");

  const decoded = verifyAccessToken(token);
  req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
  next();
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin")
    throw new AppError("INSUFFICIENT_PERMISSIONS");
  next();
};

const createRateLimiter = (limit: number, message: string) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // Use a more lenient limit in development to avoid interruptions
    limit: process.env.NODE_ENV === "development" ? limit * 10 : limit,
    message: { error: { code: "RATE_LIMIT_EXCEEDED", message } },
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

export const authRateLimit = createRateLimiter(
  10,
  "Too many authentication attempts."
);
export const strictRateLimit = createRateLimiter(5, "Too many requests.");
