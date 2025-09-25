// Path: src/features/auth/controllers/auth.controller.ts
import { Request, Response } from "express";
import { Logger } from "../../../shared/utils/logger";
import { sendSuccessResponse } from "../../../shared/utils/responseHandler";
import { AppError } from "../../../shared/utils/errorHandler";
import * as authService from "../services/auth.service";
import { findUserById } from "../repositories/auth.repository";
import type { AuthenticatedRequest } from "../../../shared/types/auth.types";
import type * as schemas from "../schemas/auth.schemas";

export const register = async (req: Request, res: Response) => {
  const result = await authService.registerUser(
    req.body as schemas.RegisterRequest
  );
  sendSuccessResponse(res, { userId: result.userId }, result.message, 201);
};

export const verifyEmailAddress = async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(
    req.body as schemas.VerifyEmailRequest
  );
  sendSuccessResponse(res, { user: result.user }, result.message);
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const result = await authService.resendVerificationCode(
    req.body as schemas.ResendVerificationEmailRequest
  );
  sendSuccessResponse(res, null, result.message);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body as schemas.LoginRequest);
  sendSuccessResponse(res, result, "Login successful");
};

export const refreshToken = async (req: Request, res: Response) => {
  const result = await authService.refreshAccessToken(
    req.body as schemas.RefreshTokenRequest
  );
  sendSuccessResponse(res, result, "Tokens refreshed successfully");
};

export const logout = async (req: Request, res: Response) => {
  const result = await authService.logoutUser(
    req.body as schemas.RefreshTokenRequest
  );
  sendSuccessResponse(res, null, result.message);
};

export const logoutAll = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new AppError("TOKEN_INVALID");
  const result = await authService.logoutFromAllDevices(req.user.id);
  sendSuccessResponse(res, null, result.message);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(
    req.body as schemas.ForgotPasswordRequest
  );
  sendSuccessResponse(res, null, result.message);
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const result = await authService.verifyPasswordResetCode(
    req.body as schemas.VerifyResetCodeRequest
  );
  sendSuccessResponse(res, result, result.message);
};

export const resetPassword = async (req: Request, res: Response) => {
  const result = await authService.resetPassword(
    req.body as schemas.ResetPasswordRequest
  );
  sendSuccessResponse(res, null, result.message);
};

// --- Protected ---
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) throw new AppError("TOKEN_INVALID");
  // The JWT payload is often enough, but if you need fresh data, fetch it here.
  const user = await findUserById(req.user.id);
  if (!user) throw new AppError("USER_NOT_FOUND");
  const { password_hash, ...userProfile } = user; // Exclude password hash
  sendSuccessResponse(res, { user: userProfile }, "User profile retrieved");
};

export const adminOnly = async (req: AuthenticatedRequest, res: Response) => {
  sendSuccessResponse(
    res,
    { message: `Welcome Admin, ${req.user?.email}` },
    "Admin access granted"
  );
};

export const changePasswordHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    throw new AppError("TOKEN_INVALID", "Authentication required.");
  }

  const requestData: schemas.ChangePasswordRequest = req.body;
  const userId = req.user.id;

  const result = await authService.changePassword(userId, requestData);

  sendSuccessResponse(res, null, result.message);
};
