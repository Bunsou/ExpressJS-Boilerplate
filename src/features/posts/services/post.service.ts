import { AppError } from "../../../shared/utils/errorHandler";
import { CreatePostRequest, UpdatePostRequest } from "../dto/post.schemas";
import * as repo from "../repositories/post.repository";

export const createNewPost = (userId: string, data: CreatePostRequest) => {
  return repo.createPost({ ...data, user_id: userId });
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
  return repo.updatePost(postId, data);
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
  return repo.deletePost(postId);
};
