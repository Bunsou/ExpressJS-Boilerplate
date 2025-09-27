// Path: src/shared/middleware/cache.middleware.ts
import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis";
import { Logger } from "../utils/logger";

const CACHE_EXPIRATION_SECONDS = 300; // 5 minutes

// The keyGenerator function will create a unique key from the request
type KeyGenerator = (req: Request) => string;

export const cacheMiddleware = (keyGenerator?: KeyGenerator) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // If no key generator is provided, default to using the original URL
    const cacheKey = keyGenerator ? keyGenerator(req) : req.originalUrl;

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        Logger.info(`Cache HIT for key: ${cacheKey}`);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("X-Cache", "HIT");
        return res.send(JSON.parse(cachedData));
      }

      Logger.info(`Cache MISS for key: ${cacheKey}`);
      res.setHeader("X-Cache", "MISS");

      const originalSend = res.send.bind(res);
      res.send = (body: any) => {
        redisClient.set(cacheKey, JSON.stringify(body), {
          EX: CACHE_EXPIRATION_SECONDS,
        });
        return originalSend(body);
      };

      next();
    } catch (error) {
      Logger.error("Redis error in cache middleware:", error);
      next();
    }
  };
};
