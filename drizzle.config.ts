import { defineConfig } from "drizzle-kit";
import { config } from "./src/shared/config/config";

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.databaseUrl,
  },
  verbose: true,
  strict: true,
});
