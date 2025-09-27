import { AppError } from "../../../shared/utils/errorHandler";
import { CreatePostRequest, UpdatePostRequest } from "../dto/post.schemas";
import * as repo from "../repositories/post.repository";
import { redisClient } from "../../../shared/config/redis";

// Helper for invalidating post-related caches
const invalidatePostCaches = async (postId?: string) => {
  const promises = [];
  promises.push(redisClient.del("posts:all")); // Key for the list
  if (postId) {
    promises.push(redisClient.del(`post:${postId}`)); // Key for a single post
  }
  await Promise.all(promises);
};

export const createNewPost = async (
  userId: string,
  data: CreatePostRequest
) => {
  const newPost = await repo.createPost({ ...data, user_id: userId });
  await invalidatePostCaches(); // Invalidate cache on create
  return newPost;
};

export const getPostById = async (postId: string) => {
  const post = await repo.findPostById(postId);
  if (!post) {
    throw new AppError("NOT_FOUND", "Post not found.", 404);
  }
  return post;
};

export const getAllPosts = () => {
  return repo.listAllPosts();
};

export const updateUserPost = async (
  postId: string,
  userId: string,
  data: UpdatePostRequest
) => {
  const post = await getPostById(postId);
  if (post.user_id !== userId) {
    throw new AppError(
      "INSUFFICIENT_PERMISSIONS",
      "You can only edit your own posts."
    );
  }
  const updatedPost = await repo.updatePost(postId, data);
  await invalidatePostCaches(postId); // Invalidate cache on update
  return updatedPost;
};

export const deleteUserPost = async (
  postId: string,
  userId: string,
  userRole: "student" | "admin"
) => {
  const post = await getPostById(postId);
  if (post.user_id !== userId && userRole !== "admin") {
    throw new AppError(
      "INSUFFICIENT_PERMISSIONS",
      "You can only delete your own posts."
    );
  }
  await repo.deletePost(postId);
  await invalidatePostCaches(postId); // Invalidate cache on delete
};
