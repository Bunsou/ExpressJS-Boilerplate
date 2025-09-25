// Path: src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { AppError } from "./shared/utils/errorHandler";
import { sendErrorResponse } from "./shared/utils/responseHandler";
import { requestLogger, errorLogger } from "./shared/utils/logger";
import { authRoutes } from "./features/auth";
import { config } from "./shared/config/config";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// --- API ROUTES ---
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: `API is running in ${config.nodeEnv} mode.`,
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);

// --- GLOBAL ERROR HANDLING ---
// This middleware is used first to log any errors that are passed to next()
app.use(errorLogger);

// This final error handler sends a formatted JSON response to the client
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
});

export default app;
