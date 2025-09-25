// Path: src/features/auth/routes/auth.routes.ts
import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import {
  requireAuth,
  requireAdmin,
  authRateLimit,
  strictRateLimit,
} from "../middleware/auth.middleware";
import { validateRequest } from "../schemas/auth.schemas";
import * as schemas from "../schemas/auth.schemas";

const router = Router();

// --- Public Routes ---
router.post(
  "/register",
  authRateLimit,
  validateRequest(schemas.registerRequestSchema),
  controller.register
);
router.post(
  "/verify-email",
  authRateLimit,
  validateRequest(schemas.verifyEmailRequestSchema),
  controller.verifyEmailAddress
);
router.post(
  "/resend-verification",
  strictRateLimit,
  validateRequest(schemas.resendVerificationEmailSchema),
  controller.resendVerificationEmail
);
router.post(
  "/login",
  authRateLimit,
  validateRequest(schemas.loginRequestSchema),
  controller.login
);
router.post(
  "/refresh",
  validateRequest(schemas.refreshTokenRequestSchema),
  controller.refreshToken
);

// --- Password Reset ---
router.post(
  "/forgot-password",
  strictRateLimit,
  validateRequest(schemas.forgotPasswordRequestSchema),
  controller.forgotPassword
);
router.post(
  "/verify-reset-code",
  authRateLimit,
  validateRequest(schemas.verifyResetCodeRequestSchema),
  controller.verifyResetCode
);
router.post(
  "/reset-password",
  authRateLimit,
  validateRequest(schemas.resetPasswordRequestSchema),
  controller.resetPassword
);

// --- Protected Routes ---
router.use(requireAuth); // All routes below this require authentication
router.post(
  "/logout",
  validateRequest(schemas.refreshTokenRequestSchema),
  controller.logout
);
router.post("/logout-all", controller.logoutAll);
router.get("/me", controller.getCurrentUser);
router.get("/admin-only", requireAdmin, controller.adminOnly);
router.post(
  "/change-password",
  validateRequest(schemas.changePasswordRequestSchema),
  controller.changePasswordHandler
);

export const authRoutes = router;
