// Path: src/features/auth/middleware/auth.middleware.ts
import { Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { AppError } from "../../../shared/utils/errorHandler";
import {
  verifyAccessToken,
  extractTokenFromHeader,
} from "../services/jwt.service";
import type { AuthenticatedRequest } from "../../../shared/types/auth.types";
import { config } from "../../../shared/config/config";
import { UserRole } from "../../../drizzle/schema";

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) throw new AppError("TOKEN_INVALID");

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError(
          "TOKEN_INVALID",
          "Authentication is required to check roles."
        );
      }

      if (!requiredRoles.includes(user.role)) {
        throw new AppError(
          "INSUFFICIENT_PERMISSIONS",
          "You do not have the necessary permissions to access this resource."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const createRateLimiter = (limit: number, message: string) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // Use a more lenient limit in development to avoid interruptions
    limit: config.nodeEnv === "development" ? limit * 10 : limit,
    message: { error: { code: "RATE_LIMIT_EXCEEDED", message } },
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

export const authRateLimit = createRateLimiter(
  10,
  "Too many authentication attempts."
);
export const strictRateLimit = createRateLimiter(5, "Too many requests.");
