// Path: src/shared/utils/logger.ts
import winston from "winston";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const { combine, timestamp, printf, colorize, align, json } = winston.format;

// --- Winston Logger Configuration ---

const consoleFormat = printf(
  ({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message} `;
    if (Object.keys(metadata).length > 0) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  }
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(
      colorize(),
      align(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      consoleFormat
    ),
  }),
];

if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "info",
      format: combine(timestamp(), json()),
    })
  );
}

export const logger = winston.createLogger({ transports });

// --- Express Middleware ---

/**
 * Logs incoming HTTP requests.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(`HTTP Request: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    body: req.body,
  });
  next();
};

/**
 * Logs errors that are passed to the global error handler.
 * This should be placed before your final error response handler.
 */
export const errorLogger: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`Error caught: ${err.message}`, {
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  next(err); // Pass the error to the next middleware
};
