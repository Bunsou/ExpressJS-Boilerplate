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

/**
 * @openapi
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the post
 *         title:
 *           type: string
 *           description: Title of the post
 *         content:
 *           type: string
 *           description: Content of the post
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created the post
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was last updated
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         title: "My First Trip to Cambodia"
 *         content: "Today I visited the Royal Palace in Phnom Penh. It was amazing!"
 *         user_id: "550e8400-e29b-41d4-a716-446655440001"
 *         created_at: "2025-09-27T10:00:00Z"
 *         updated_at: "2025-09-27T10:00:00Z"
 *
 *     CreatePostRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Title of the post (minimum 3 characters)
 *           example: "My First Trip to Cambodia"
 *         content:
 *           type: string
 *           minLength: 10
 *           description: Content of the post (minimum 10 characters)
 *           example: "Today I visited the Royal Palace in Phnom Penh. It was amazing!"
 *
 *     UpdatePostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Updated title of the post (minimum 3 characters)
 *           example: "Updated: My Trip to Cambodia"
 *         content:
 *           type: string
 *           minLength: 10
 *           description: Updated content of the post (minimum 10 characters)
 *           example: "Updated content about my amazing trip to the Royal Palace."
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *           description: Response data
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error code
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts
 *     description: Retrieve a list of all posts. This endpoint uses caching for better performance.
 *     responses:
 *       200:
 *         description: All posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: "All posts retrieved."
 *               data: [
 *                 {
 *                   id: "550e8400-e29b-41d4-a716-446655440000",
 *                   title: "My First Trip to Cambodia",
 *                   content: "Today I visited the Royal Palace in Phnom Penh. It was amazing!",
 *                   user_id: "550e8400-e29b-41d4-a716-446655440001",
 *                   created_at: "2025-09-27T10:00:00Z",
 *                   updated_at: "2025-09-27T10:00:00Z"
 *                 }
 *               ]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Apply caching middleware ONLY to GET routes
// Pass a function to generate a consistent key for the list of posts
router.get(
  "/",
  cacheMiddleware(() => "posts:all"),
  controller.getAllPosts
);

/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a post by ID
 *     description: Retrieve a specific post by its ID. This endpoint uses caching for better performance.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the post to retrieve
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: "Post retrieved successfully."
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "My First Trip to Cambodia"
 *                 content: "Today I visited the Royal Palace in Phnom Penh. It was amazing!"
 *                 user_id: "550e8400-e29b-41d4-a716-446655440001"
 *                 created_at: "2025-09-27T10:00:00Z"
 *                 updated_at: "2025-09-27T10:00:00Z"
 *       400:
 *         description: Invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "VALIDATION_ERROR"
 *               message: "Invalid UUID format"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "NOT_FOUND"
 *               message: "Post not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Pass a function to generate a key based on the post's ID from the URL params
router.get(
  "/:id",
  validateRequestParams(schemas.postIdParamSchema),
  cacheMiddleware((req) => `post:${req.params.id}`),
  controller.getPost
);

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     description: Create a new post. Authentication is required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *           example:
 *             title: "My First Trip to Cambodia"
 *             content: "Today I visited the Royal Palace in Phnom Penh. It was amazing!"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: "Post created successfully."
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "My First Trip to Cambodia"
 *                 content: "Today I visited the Royal Palace in Phnom Penh. It was amazing!"
 *                 user_id: "550e8400-e29b-41d4-a716-446655440001"
 *                 created_at: "2025-09-27T10:00:00Z"
 *                 updated_at: "2025-09-27T10:00:00Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "VALIDATION_ERROR"
 *               message: "Title must be at least 3 characters long"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "UNAUTHORIZED"
 *               message: "Access token required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Write routes (POST, PATCH, DELETE) do NOT get the caching middleware
router.post(
  "/",
  requireAuth,
  validateRequestBody(schemas.createPostSchema),
  controller.createPost
);

/**
 * @openapi
 * /posts/{id}:
 *   patch:
 *     tags: [Posts]
 *     summary: Update a post
 *     description: Update an existing post. Authentication is required and only the post owner can update their post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the post to update
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *           example:
 *             title: "Updated: My Trip to Cambodia"
 *             content: "Updated content about my amazing trip to the Royal Palace."
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Post'
 *             example:
 *               success: true
 *               message: "Post updated successfully."
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "Updated: My Trip to Cambodia"
 *                 content: "Updated content about my amazing trip to the Royal Palace."
 *                 user_id: "550e8400-e29b-41d4-a716-446655440001"
 *                 created_at: "2025-09-27T10:00:00Z"
 *                 updated_at: "2025-09-27T11:00:00Z"
 *       400:
 *         description: Invalid request data or post ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "INSUFFICIENT_PERMISSIONS"
 *               message: "You can only edit your own posts."
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "NOT_FOUND"
 *               message: "Post not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id",
  requireAuth,
  validateRequestParams(schemas.postIdParamSchema),
  validateRequestBody(schemas.updatePostSchema),
  controller.updatePost
);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     description: Delete an existing post. Authentication is required. Users can only delete their own posts, but admins can delete any post.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the post to delete
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: "null"
 *             example:
 *               success: true
 *               message: "Post deleted successfully."
 *               data: null
 *       400:
 *         description: Invalid post ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "INSUFFICIENT_PERMISSIONS"
 *               message: "You can only delete your own posts."
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "NOT_FOUND"
 *               message: "Post not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  requireAuth,
  validateRequestParams(schemas.postIdParamSchema),
  controller.deletePost
);

export const postRoutes = router;
