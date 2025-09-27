import { Router } from "express";
import * as controller from "../controllers/post.controller";
import * as schemas from "../dto/post.schemas";
import { requireAuth } from "../../auth/middlewares/auth.middleware";
import {
  validateRequestBody,
  validateRequestParams,
} from "../../../shared/utils/validator";
import { cacheMiddleware } from "../../../shared/middleware/cache.middleware";

const router = Router();

// Apply caching middleware ONLY to GET routes
// Pass a function to generate a consistent key for the list of posts
router.get(
  "/",
  cacheMiddleware(() => "posts:all"),
  controller.getAllPosts
);

// Pass a function to generate a key based on the post's ID from the URL params
router.get(
  "/:id",
  validateRequestParams(schemas.postIdParamSchema),
  cacheMiddleware((req) => `post:${req.params.id}`),
  controller.getPost
);

// Write routes (POST, PATCH, DELETE) do NOT get the caching middleware
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
