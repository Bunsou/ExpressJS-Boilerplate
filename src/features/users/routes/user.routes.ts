// Path: src/features/users/routes/user.routes.ts
import { Router } from "express";
import * as controller from "../controllers/user.controller";
import * as schemas from "../dto/user.schemas";
import {
  requireAuth,
  requireRole,
} from "../../auth/middlewares/auth.middleware";
import {
  validateRequestBody,
  validateRequestParams,
} from "../../../shared/middleware/validator";
import { cacheMiddleware } from "../../../shared/middleware/cache.middleware";
import { AuthenticatedRequest } from "../../../shared/types/auth.types";

const router = Router();

router.use(requireAuth);

// Cache the user's own profile using their authenticated ID
router.get(
  "/me",
  cacheMiddleware(
    (req) => `user:profile:${(req as AuthenticatedRequest).user!.id}`
  ),
  controller.getMyProfile
);

router.patch(
  "/me",
  validateRequestBody(schemas.updateProfileSchema),
  controller.updateMyProfile
);

// Cache the list of all users (for admins)
router.get(
  "/",
  requireRole(["admin"]),
  cacheMiddleware(() => "users:all"),
  controller.getAllUsers
);

// Cache another user's public profile using the ID from the URL
router.get(
  "/:id",
  validateRequestParams(schemas.userIdParamSchema),
  cacheMiddleware((req) => `user:profile:${req.params.id}`),
  controller.getUserById
);

export const userRoutes = router;
