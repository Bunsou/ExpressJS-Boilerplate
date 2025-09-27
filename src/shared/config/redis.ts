import { createClient } from "redis";
import { config } from "./config";
import { Logger } from "../utils/logger";

// Create the Redis client
export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on("error", (err) => Logger.error("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    Logger.info("✅ Connected to Redis successfully!");
  } catch (error) {
    Logger.error("❌ Failed to connect to Redis:", error);
    // Exit the process if Redis connection fails on startup
    process.exit(1);
  }
};

// Connect to Redis as soon as the application starts
connectRedis();
