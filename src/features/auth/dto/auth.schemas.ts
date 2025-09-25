// Path: src/features/auth/schemas/auth.schemas.ts
import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/utils/errorHandler";

// --- Reusable Schemas ---
const passwordSchema = z
  .string()
  .min(8, "Password must be 8+ characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter")
  .regex(/[0-9]/, "Password needs a number");
const emailSchema = z.string().email().toLowerCase().trim();
const codeSchema = z.string().length(6).regex(/^\d+$/);

// --- Request Schemas ---
export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(2),
});
export const verifyEmailRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});
export const resendVerificationEmailSchema = z.object({ email: emailSchema });
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export const forgotPasswordRequestSchema = z.object({ email: emailSchema });
export const verifyResetCodeRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  newPassword: passwordSchema,
});
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// --- Type Exports ---
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationEmailRequest = z.infer<
  typeof resendVerificationEmailSchema
>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type VerifyResetCodeRequest = z.infer<
  typeof verifyResetCodeRequestSchema
>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

// --- Response Schemas & Types ---
const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  role: z.enum(["student", "admin"]),
});
const tokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;
export type AuthResponse = {
  user: UserProfile;
  tokens: z.infer<typeof tokenSchema>;
};
export type TokenRefreshResponse = { tokens: z.infer<typeof tokenSchema> };
