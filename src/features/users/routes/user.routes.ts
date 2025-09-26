// Path: src/features/users/user.routes.ts
import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { requireAuth } from "../../auth/middlewares/auth.middleware";
import { requireRole } from "../../auth/middlewares/auth.middleware";

const router = Router();

// All routes in this file require the user to be logged in first.
router.use(requireAuth);

// 1. Get My Profile (Any authenticated user can access this)
// We only need `requireAuth` here. No `requireRole` is necessary.
router.get("/me", controller.getMyProfile);

// 2. Get All Users (Only Admins can access this)
// The request must pass `requireAuth` AND `requireRole(['admin'])`.
router.get("/", requireRole(["admin"]), controller.getAllUsers);

export const userRoutes = router;
