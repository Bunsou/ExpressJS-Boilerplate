import { Router } from "express";
import * as controller from "../controllers/post.controller";
import * as schemas from "../dto/post.schemas";
import { requireAuth } from "../../auth/middlewares/auth.middleware";
import {
  validateRequestBody,
  validateRequestParams,
} from "../../../shared/utils/validator";

const router = Router();

router.get("/", controller.getAllPosts);
router.get(
  "/:id",
  validateRequestParams(schemas.postIdParamSchema),
  controller.getPost
);

router.post(
  "/",
  requireAuth,
  validateRequestBody(schemas.createPostSchema),
  controller.createPost
);

router.patch(
  "/:id",
  requireAuth,
  validateRequestParams(schemas.postIdParamSchema),
  validateRequestBody(schemas.updatePostSchema),
  controller.updatePost
);

router.delete(
  "/:id",
  requireAuth,
  validateRequestParams(schemas.postIdParamSchema),
  controller.deletePost
);

export const postRoutes = router;
