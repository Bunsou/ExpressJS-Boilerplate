import { Response } from "express";
import { config } from "../config/config";

/**
 * Cookie configuration for authentication tokens
 */
const COOKIE_CONFIG = {
  httpOnly: true, // Prevents client-side JavaScript access (XSS protection)
  secure: config.cookieSecure, // HTTPS only in production
  sameSite: config.cookieSameSite as "strict" | "lax" | "none",
  domain: config.cookieDomain, // undefined = same domain only
};

/**
 * Sets authentication cookies (access and refresh tokens) in the response
 * @param res - Express Response object
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // Access token cookie - available on all routes
  res.cookie(config.cookieAccessName, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: parseInt(config.jwtAccessExpiry) * 1000, // Convert seconds to milliseconds
    path: "/",
  });

  // Refresh token cookie - available on all routes (needed for logout)
  res.cookie(config.cookieRefreshName, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: parseInt(config.jwtRefreshExpiry) * 1000, // Convert seconds to milliseconds
    path: "/", // Available on all routes (needed for logout endpoint)
  });
};

/**
 * Clears authentication cookies from the response
 * @param res - Express Response object
 */
export const clearAuthCookies = (res: Response): void => {
  // Clear access token cookie
  res.clearCookie(config.cookieAccessName, {
    ...COOKIE_CONFIG,
    path: "/",
  });

  // Clear refresh token cookie (must match the path it was set with)
  res.clearCookie(config.cookieRefreshName, {
    ...COOKIE_CONFIG,
    path: "/",
  });
};
