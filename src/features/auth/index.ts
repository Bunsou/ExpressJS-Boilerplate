import { Logger } from "../../shared/utils/logger";
import { validateJWTConfig } from "./services/jwt.service";

export async function initializeAuthFeature(): Promise<void> {
  try {
    validateJWTConfig();
    Logger.info("✅ Authentication feature initialized successfully.");
  } catch (error) {
    Logger.error("❌ Failed to initialize authentication feature:", error);
    throw error;
  }
}

// ROUTES
export { authRoutes } from "./routes/auth.routes";

// MIDDLEWARE
export { requireAuth, requireRole } from "./middlewares/auth.middleware";

// SERVICES
export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutFromAllDevices,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  changePassword,
} from "./services/auth.service";
export { startCronJobs } from "./services/cron.service";

// REPOSITORY (Exported for potential use in other features)
export { findUserById, findUserByEmail } from "./repositories/auth.repository";

// SCHEMAS & TYPES (For validation and type-safety across the app)
export {
  registerRequestSchema,
  loginRequestSchema,
  refreshTokenRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  changePasswordRequestSchema,
  type RegisterRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
} from "./dto/auth.schemas";
