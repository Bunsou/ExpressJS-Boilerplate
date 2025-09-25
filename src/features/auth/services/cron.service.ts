// Path: src/features/auth/services/cron.service.ts
import cron from "node-cron";
import { Logger } from "../../../shared/utils/logger";
import { runCleanupOperations } from "../repositories/auth.repository";

export const startCronJobs = () => {
  Logger.info("Scheduling cron jobs...");

  // Runs at 3:00 AM every day in the server's timezone.
  cron.schedule("0 3 * * *", async () => {
    Logger.info("CRON: Starting daily cleanup job...");
    try {
      const { deletedTokens, deletedVerifications } =
        await runCleanupOperations();
      Logger.info(
        `CRON: Daily cleanup finished. Deleted ${deletedTokens} tokens and ${deletedVerifications} verifications.`
      );
    } catch (error) {
      Logger.error("CRON: Error during daily cleanup job:", error);
    }
  });

  Logger.info("✅ Cron jobs scheduled.");
};
