import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler";
import { sendErrorResponse } from "../utils/responseHandler";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`🚨 Error Handler triggered:`, err.message);
  console.log(`Error type:`, err.constructor.name);

  if (err instanceof AppError) {
    sendErrorResponse(res, err);
  } else {
    // Handle unexpected, non-custom errors
    const unexpectedError = new AppError(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred on the server.",
      500
    );
    sendErrorResponse(res, unexpectedError);
  }
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`🔍 404 Handler: ${req.method} ${req.originalUrl}`);
  const notFoundError = new AppError(
    "NOT_FOUND",
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(notFoundError);
};
