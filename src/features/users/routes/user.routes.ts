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
} from "../../../shared/utils/validator";

const router = Router();

router.use(requireAuth); // All user routes require authentication

router.get("/me", controller.getMyProfile);
router.patch(
  "/me",
  validateRequestBody(schemas.updateProfileSchema),
  controller.updateMyProfile
);

router.get(
  "/",
  requireRole(["admin"]), // Only admins can get all users
  controller.getAllUsers
);

router.get(
  "/:id",
  validateRequestParams(schemas.userIdParamSchema),
  controller.getUserById
);

export const userRoutes = router;
