// Path: src/features/auth/services/jwt.service.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../../shared/utils/errorHandler";

// --- Config Variables ---
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_ACCESS_EXPIRY = parseInt(process.env.JWT_ACCESS_EXPIRY || "900");
const JWT_REFRESH_EXPIRY = parseInt(
  process.env.JWT_REFRESH_EXPIRY || "1209600"
);

// --- Types ---
export interface JWTPayload {
  userId: string;
  email: string;
  role: "student" | "admin";
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export type DecodedToken = jwt.JwtPayload & JWTPayload;

// --- Core Functions ---
export const generateTokenPair = (
  userId: string,
  email: string,
  role: "student" | "admin"
): TokenPair => {
  const payload: JWTPayload = { userId, email, role };
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
  return { accessToken, refreshToken, expiresIn: JWT_ACCESS_EXPIRY };
};

const verifyToken = (token: string, secret: string): DecodedToken => {
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      throw new AppError("TOKEN_EXPIRED");
    throw new AppError("TOKEN_INVALID");
  }
};
export const verifyAccessToken = (token: string) =>
  verifyToken(token, JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token: string) =>
  verifyToken(token, JWT_REFRESH_SECRET);

// --- Utility Functions ---
export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
export const extractTokenFromHeader = (authHeader?: string) =>
  authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

/**
 * Validates essential JWT environment variables on application startup.
 */
export const validateJWTConfig = () => {
  if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
    throw new Error("JWT_ACCESS_SECRET is missing or too short.");
  }
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new Error("JWT_REFRESH_SECRET is missing or too short.");
  }
  if (JWT_ACCESS_SECRET === JWT_REFRESH_SECRET) {
    throw new Error("JWT access and refresh secrets must be different.");
  }
};
