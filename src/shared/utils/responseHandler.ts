// Path: src/shared/utils/responseHandler.ts
import { Response } from "express";
import { AppError } from "./errorHandler";

export const sendSuccessResponse = <T>(
  res: Response,
  data: T | null,
  message: string,
  statusCode = 200
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendErrorResponse = (res: Response, error: AppError) => {
  res.status(error.statusCode).json({
    success: false,
    error: { code: error.code, message: error.message },
  });
};
