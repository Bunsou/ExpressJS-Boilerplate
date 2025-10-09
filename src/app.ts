// Path: src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { AppError } from "./shared/utils/errorHandler";
import { sendErrorResponse } from "./shared/utils/responseHandler";
import { requestLogger, errorLogger } from "./shared/utils/logger";
import { authRoutes } from "./features/auth";
import { config } from "./shared/config/config";
import { userRoutes } from "./features/users";
import { postRoutes } from "./features/posts";
import { swaggerRoutes } from "./shared/utils/swagger";
import {
  errorHandler,
  notFoundHandler,
} from "./shared/middleware/errorHandler";

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

app.use("/docs", swaggerRoutes);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// --- GLOBAL ERROR HANDLING ---
// This middleware is used first to log any errors that are passed to next()
app.use(errorLogger);

// Then we handle 404 errors for unmatched routes
app.use(notFoundHandler);

// Finally, we handle all other errors
app.use(errorHandler);

export default app;
