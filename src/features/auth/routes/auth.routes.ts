// Path: src/features/auth/routes/auth.routes.ts
import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import {
  requireAuth,
  requireRole,
  authRateLimit,
  strictRateLimit,
} from "../middlewares/auth.middleware";

import * as schemas from "../dto/auth.schemas";
import { validateRequestBody } from "../../../shared/utils/validator";

const router = Router();

// --- Public Routes ---
router.post(
  "/register",
  authRateLimit,
  validateRequestBody(schemas.registerRequestSchema),
  controller.register
);
router.post(
  "/verify-email",
  authRateLimit,
  validateRequestBody(schemas.verifyEmailRequestSchema),
  controller.verifyEmailAddress
);
router.post(
  "/resend-verification",
  strictRateLimit,
  validateRequestBody(schemas.resendVerificationEmailSchema),
  controller.resendVerificationEmail
);
router.post(
  "/login",
  authRateLimit,
  validateRequestBody(schemas.loginRequestSchema),
  controller.login
);
router.post(
  "/refresh",
  validateRequestBody(schemas.refreshTokenRequestSchema),
  controller.refreshToken
);

// --- Password Reset ---
router.post(
  "/forgot-password",
  strictRateLimit,
  validateRequestBody(schemas.forgotPasswordRequestSchema),
  controller.forgotPassword
);
router.post(
  "/verify-reset-code",
  authRateLimit,
  validateRequestBody(schemas.verifyResetCodeRequestSchema),
  controller.verifyResetCode
);
router.post(
  "/reset-password",
  authRateLimit,
  validateRequestBody(schemas.resetPasswordRequestSchema),
  controller.resetPassword
);

// --- Protected Routes ---
router.use(requireAuth); // All routes below this require authentication
router.post(
  "/logout",
  validateRequestBody(schemas.refreshTokenRequestSchema),
  controller.logout
);
router.post("/logout-all", controller.logoutAll);
router.get("/me", controller.getCurrentUser);
router.get("/admin-only", requireRole(["admin"]), controller.adminOnly);
router.post(
  "/change-password",
  validateRequestBody(schemas.changePasswordRequestSchema),
  controller.changePasswordHandler
);

export const authRoutes = router;
