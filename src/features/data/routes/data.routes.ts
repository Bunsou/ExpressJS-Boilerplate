import { Router } from "express";
import * as controller from "../controllers/data.controller";
import {
  requireApiKey,
  requirePermission,
} from "../../auth/middlewares/apiKey.middleware";

const router = Router();

// Protect all routes in this file with API Key authentication
router.use(requireApiKey);

// Route for general data, requires 'general' permission
router.get("/public", requirePermission(["general"]), controller.getPublicData);

// Route for sensitive data, requires 'data:read' permission
router.get(
  "/sensitive",
  requirePermission(["data:read"]),
  controller.getSensitiveData
);

export const dataRoutes = router;
