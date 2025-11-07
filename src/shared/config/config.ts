import "dotenv/config";

export const config = {
  databaseUrl: process.env.DATABASE_URL || "",

  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  logDirectory: process.env.LOG_DIRECTORY || "./logs",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "900", // 15 minutes
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "1209600", // 14 days

  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || "12",

  gmailHost: process.env.GMAIL_HOST || "",
  gmailUser: process.env.GMAIL_USER || "",
  gmailPass: process.env.GMAIL_PASS || "",

  fromEmail: process.env.FROM_EMAIL || "",
  supportEmail: process.env.SUPPORT_EMAIL || "",

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Cookie configuration
  cookieAccessName: process.env.COOKIE_ACCESS_NAME || "accessToken",
  cookieRefreshName: process.env.COOKIE_REFRESH_NAME || "refreshToken",
  cookieSecure: process.env.NODE_ENV === "production", // HTTPS only in production
  cookieSameSite:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
  cookieDomain: process.env.COOKIE_DOMAIN, // undefined = same domain only
};
