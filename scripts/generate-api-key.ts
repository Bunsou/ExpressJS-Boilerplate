// Path: scripts/generate-api-key.ts
import crypto from "crypto";
import "dotenv/config";
import { createApiKey } from "../src/features/auth/repositories/apiKey.repository";
import { apiKeyPermissionEnum } from "../src/drizzle/schema";
import { Logger } from "../src/shared/utils/logger";

const generateApiKey = async () => {
  Logger.info("Generating a new API key...");

  // 1. Extract permissions from command-line arguments
  const args = process.argv.slice(2);
  const permissions = args
    .map((arg) => {
      const [key, value] = arg.split("=");
      if (key === "--p") return value;
      return null;
    })
    .filter(
      (p): p is (typeof apiKeyPermissionEnum.enumValues)[number] =>
        p !== null &&
        (apiKeyPermissionEnum.enumValues as readonly string[]).includes(p)
    );

  if (permissions.length === 0) {
    Logger.error(
      "Error: At least one permission is required. Use --p=<permission>"
    );
    Logger.info(
      `Available permissions: ${apiKeyPermissionEnum.enumValues.join(", ")}`
    );
    process.exit(1);
  }

  // 2. Generate a secure, random API key
  const key = `sk_live_${crypto.randomBytes(24).toString("hex")}`;

  try {
    // 3. Save the new key to the database
    const newKey = await createApiKey({
      key,
      permissions,
    });

    Logger.info("✅ API Key generated successfully!");
    Logger.info("========================================");
    Logger.info(`Key: ${newKey.key}`);
    Logger.info(`Permissions: ${newKey.permissions.join(", ")}`);
    Logger.info("========================================");
    Logger.warn(
      "🔑 Please save this key securely. It will not be shown again."
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    process.exit(0);
  } catch (error) {
    Logger.error("❌ Failed to generate API key:", error);
    process.exit(1);
  }
};

generateApiKey();

/*
HOW TO USE IT

# Generate a key with only 'general' permissions
npm run api-key:create -- --p=general

# Generate a more powerful key with multiple permissions
npm run api-key:create -- --p=general --p=data:read
*/
