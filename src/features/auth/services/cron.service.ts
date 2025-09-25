// Path: src/features/auth/services/cron.service.ts
import cron from "node-cron";
import { logger } from "../../../shared/utils/logger";
import { runCleanupOperations } from "../repositories/auth.repository";

export const startCronJobs = () => {
  logger.info("Scheduling cron jobs...");

  // Runs at 3:00 AM every day in the server's timezone.
  cron.schedule("0 3 * * *", async () => {
    logger.info("CRON: Starting daily cleanup job...");
    try {
      const { deletedTokens, deletedVerifications } =
        await runCleanupOperations();
      logger.info(
        `CRON: Daily cleanup finished. Deleted ${deletedTokens} tokens and ${deletedVerifications} verifications.`
      );
    } catch (error) {
      logger.error("CRON: Error during daily cleanup job:", error);
    }
  });

  logger.info("✅ Cron jobs scheduled.");
};
