import { beforeAll, afterAll, afterEach } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import * as schema from "../drizzle/schema";
import { Logger } from "../shared/utils/logger";

// Load environment variables from .env.test for the test suite
config({ path: resolve(__dirname, "../../.env.test") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.test");
}

const pool = new Pool({ connectionString });
export const testDb = drizzle(pool, { schema });

// Run migrations once before all tests
beforeAll(async () => {
  Logger.info("🚀 Migrating test database...");
  await migrate(testDb, { migrationsFolder: "./src/drizzle/migrations" });
  Logger.info("✅ Test database migrated.");
});

// Clean up the database after each test file
afterEach(async () => {
  const tableSchemas = Object.values(schema);
  for (const table of tableSchemas) {
    // A bit of a hack to check if it's a drizzle table
    if (table && typeof table === "object" && "getSQL" in table) {
      await testDb.delete(table);
    }
  }
});

// Disconnect from the database after all tests have run
afterAll(async () => {
  await pool.end();
  Logger.info("Disconnected from test database.");
});
