// Path: src/server.ts
import app from "./app";
import { logger } from "./shared/utils/logger";
import { initializeAuthFeature } from "./features/auth";
import { startCronJobs } from "./features/auth/services/cron.service";
import { config } from "./shared/config/config";

const PORT = config.port || 5000;

/**
 * Initializes features and starts the HTTP server.
 */
const startServer = async () => {
  try {
    // Initialize application features before starting the server
    // This validates JWT secrets and other critical configurations
    await initializeAuthFeature();

    // Start listening for incoming requests
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      // After the server is successfully running, start the scheduled jobs
      startCronJobs();
    });
  } catch (error) {
    logger.error("❌ Failed to initialize features and start server:", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
