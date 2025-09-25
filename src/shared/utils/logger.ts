import { createLogger, transports, format } from "winston";
import path from "path";
import { config } from "../config/config";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// Store file in a file directory (so we can see the log)
let dir = config.logDirectory ?? "logs";

if (!dir) dir = path.resolve("logs");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logLevel = config.nodeEnv === "development" ? "debug" : "warn";

const consoleFormat = format.printf(
  ({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message} `;
    if (Object.keys(metadata).length > 0) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  }
);

// Store the log everyday for 14 days, then delete those who are 14 days +
const dailyRotateFile = new DailyRotateFile({
  level: logLevel,
  filename: `${dir}/%DATE%-results.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  handleExceptions: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
});

const Logger = createLogger({
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        consoleFormat
      ),
    }),
    dailyRotateFile,
  ],
  exceptionHandlers: [dailyRotateFile],
  exitOnError: false,
});

export { Logger };

// requestLogger: Logs incoming HTTP requests
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.info(`HTTP Request: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    body: req.body,
  });
  next();
};

// errorLogger: Logs errors that are passed to the global error handler.
// This should be placed before your final error response handler.
export const errorLogger: ErrorRequestHandler = (err, req, res, next) => {
  Logger.error(`Error caught: ${err.message}`, {
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });
  next(err); // Pass the error to the next middleware (usually the error response handler)
};
