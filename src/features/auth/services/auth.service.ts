// Path: src/features/auth/services/auth.service.ts
import bcrypt from "bcryptjs";
import { logger } from "../../../shared/utils/logger";
import { AppError } from "../../../shared/utils/errorHandler";
import * as jwt from "./jwt.service";
import * as email from "./email.service";
import * as repo from "../repositories/auth.repository";
import type * as schemas from "../schemas/auth.schemas";
import { config } from "../../../shared/config/config";

const BCRYPT_SALT_ROUNDS = parseInt(config.bcryptSaltRounds || "12");

// --- Registration ---
export async function registerUser(data: schemas.RegisterRequest) {
  if (await repo.findUserByEmail(data.email))
    throw new AppError("EMAIL_ALREADY_EXISTS");
  const password_hash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
  const newUser = await repo.createUser({ ...data, password_hash });
  await email.sendVerificationEmail(newUser.email, newUser.full_name);
  return {
    message: "Registration successful. Please check your email.",
    userId: newUser.id,
  };
}

export async function verifyEmail(data: schemas.VerifyEmailRequest) {
  const verification = await repo.findEmailVerificationByCode(
    data.email,
    data.code,
    "registration"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");
  const user = await repo.findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");

  await repo.markEmailVerificationAsVerified(verification.id);
  const updatedUser = await repo.markUserEmailAsVerified(user.id);

  email
    .sendWelcomeEmail(user.email, user.full_name)
    .catch((e) => logger.error("Failed to send welcome email", e));
  const { password_hash, ...userProfile } = updatedUser;
  return { message: "Email verified successfully.", user: userProfile };
}

export async function resendVerificationCode(
  data: schemas.ResendVerificationEmailRequest
) {
  const user = await repo.findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");
  if (user.email_verified) throw new AppError("EMAIL_ALREADY_VERIFIED");
  await email.sendVerificationEmail(user.email, user.full_name);
  return { message: "A new verification code has been sent." };
}

// --- Login/Logout ---
export async function loginUser(
  data: schemas.LoginRequest
): Promise<schemas.AuthResponse> {
  const user = await repo.findUserByEmail(data.email);
  if (!user || !(await bcrypt.compare(data.password, user.password_hash)))
    throw new AppError("INVALID_CREDENTIALS");
  if (!user.email_verified) throw new AppError("EMAIL_NOT_VERIFIED");

  const tokens = jwt.generateTokenPair(user.id, user.email, user.role);
  await repo.saveRefreshToken(user.id, tokens.refreshToken);
  await repo.updateUserLastLogin(user.id);

  const { password_hash, ...userProfile } = user;
  return { user: userProfile, tokens };
}

export async function refreshAccessToken(
  data: schemas.RefreshTokenRequest
): Promise<schemas.TokenRefreshResponse> {
  const decoded = jwt.verifyRefreshToken(data.refreshToken);
  const user = await repo.findUserById(decoded.userId);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const existingToken = await repo.findRefreshTokenByHash(
    jwt.hashToken(data.refreshToken)
  );
  if (!existingToken) {
    logger.warn(
      `Potential refresh token reuse for user: ${user.id}. Invalidating all sessions.`
    );
    await repo.deleteAllUserRefreshTokens(user.id);
    throw new AppError("TOKEN_INVALID", "Invalid token. Please log in again.");
  }

  const newTokens = jwt.generateTokenPair(user.id, user.email, user.role);
  await repo.rotateRefreshToken(
    existingToken.token_hash,
    newTokens.refreshToken,
    user.id
  );

  return { tokens: newTokens };
}

export async function logoutUser(data: schemas.RefreshTokenRequest) {
  const decoded = jwt.verifyRefreshToken(data.refreshToken);
  const tokenHash = jwt.hashToken(data.refreshToken);

  await repo.deleteRefreshTokenByHash(tokenHash);
  return { message: "Logged out successfully." };
}

export async function logoutFromAllDevices(userId: string) {
  await repo.deleteAllUserRefreshTokens(userId);
  return { message: "Logged out from all devices." };
}

// --- Password Reset ---
export async function forgotPassword(data: schemas.ForgotPasswordRequest) {
  const user = await repo.findUserByEmail(data.email);
  if (user) await email.sendPasswordResetEmail(user.email, user.full_name);
  return {
    message: "If an account exists, a password reset code has been sent.",
  };
}

export async function verifyPasswordResetCode(
  data: schemas.VerifyResetCodeRequest
) {
  const verification = await repo.findEmailVerificationByCode(
    data.email,
    data.code,
    "password_reset"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");
  return { valid: true, message: "Code is valid." };
}

export async function resetPassword(data: schemas.ResetPasswordRequest) {
  const verification = await repo.findEmailVerificationByCode(
    data.email,
    data.code,
    "password_reset"
  );
  if (!verification) throw new AppError("VERIFICATION_CODE_INVALID");
  const user = await repo.findUserByEmail(data.email);
  if (!user) throw new AppError("USER_NOT_FOUND");

  const newPasswordHash = await bcrypt.hash(
    data.newPassword,
    BCRYPT_SALT_ROUNDS
  );
  await repo.updateUserPassword(user.id, newPasswordHash);
  await repo.markEmailVerificationAsVerified(verification.id);
  await repo.deleteAllUserRefreshTokens(user.id);

  return { message: "Password has been reset successfully." };
}

export async function changePassword(
  userId: string,
  data: schemas.ChangePasswordRequest
): Promise<{ message: string }> {
  try {
    const user = await repo.findUserById(userId);
    if (!user) {
      throw new AppError("USER_NOT_FOUND");
    }

    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new AppError("INVALID_CREDENTIALS", "Incorrect current password.");
    }

    const newPasswordHash = await bcrypt.hash(
      data.newPassword,
      BCRYPT_SALT_ROUNDS
    );

    await repo.updateUserPassword(userId, newPasswordHash);

    await repo.deleteAllUserRefreshTokens(userId);

    logger.info(`Password changed successfully for user: ${user.email}`, {
      userId,
    });

    return {
      message:
        "Password changed successfully. You may need to log in again on other devices.",
    };
  } catch (error) {
    logger.error("Failed to change password:", { error, userId });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("INTERNAL_SERVER_ERROR", "Could not change password.");
  }
}
