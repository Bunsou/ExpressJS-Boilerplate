// Path: src/features/auth/middleware/apiKey.middleware.ts
import { Response, NextFunction } from "express";
import { AppError } from "../../../shared/utils/errorHandler";
import { findActiveApiKeyByKey } from "../repositories/apiKey.repository";
import type { AuthenticatedRequest } from "../../../shared/types/auth.types";
import type { ApiKey } from "../../../drizzle/schema";

export const requireApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const key = req.headers["x-api-key"]?.toString();

  if (!key) {
    throw new AppError("TOKEN_INVALID", "API key is missing.");
  }

  const apiKey = await findActiveApiKeyByKey(key);

  if (!apiKey) {
    throw new AppError("TOKEN_INVALID", "Invalid API key.");
  }

  req.apiKey = apiKey;
  next();
};

export const requirePermission = (
  requiredPermissions: ApiKey["permissions"][0][]
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const apiKey = req.apiKey;

    if (!apiKey) {
      throw new AppError(
        "INSUFFICIENT_PERMISSIONS",
        "API key not found on request. Ensure requireApiKey runs first."
      );
    }

    const hasPermission = requiredPermissions.every((p) =>
      apiKey.permissions.includes(p)
    );

    if (!hasPermission) {
      throw new AppError(
        "INSUFFICIENT_PERMISSIONS",
        "This API key does not have the required permissions."
      );
    }

    next();
  };
};
