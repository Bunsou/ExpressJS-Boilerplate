import { z, ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler";

export enum ValidationSource {
  BODY = "body",
  QUERY = "query",
  HEADERS = "headers",
  PARAMS = "params",
}

export const validateRequest = (
  schema: ZodSchema,
  source: ValidationSource = ValidationSource.BODY
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the specified part of the request
      const validatedData = schema.parse(req[source]);

      // Replace the original data with validated/transformed data
      Object.assign(req[source], validatedData);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");

        throw new AppError("VALIDATION_ERROR", message);
      }
      next(error);
    }
  };
};

// Convenience functions for common validations
export const validateRequestBody = (schema: ZodSchema) =>
  validateRequest(schema, ValidationSource.BODY);

export const validateRequestQuery = (schema: ZodSchema) =>
  validateRequest(schema, ValidationSource.QUERY);

export const validateRequestParams = (schema: ZodSchema) =>
  validateRequest(schema, ValidationSource.PARAMS);

export const validateRequestHeaders = (schema: ZodSchema) =>
  validateRequest(schema, ValidationSource.HEADERS);
