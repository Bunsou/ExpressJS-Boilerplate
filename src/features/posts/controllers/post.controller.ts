import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../shared/types/auth.types";
import { sendSuccessResponse } from "../../../shared/utils/responseHandler";
import { CreatePostRequest, UpdatePostRequest } from "../dto/post.schemas";
import * as service from "../services/post.service";

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as CreatePostRequest;
  const newPost = await service.createNewPost(req.user!.id, data);
  sendSuccessResponse(res, newPost, "Post created successfully.", 201);
};

export const getPost = async (req: Request, res: Response) => {
  const post = await service.getPostById(req.params.id);
  sendSuccessResponse(res, post, "Post retrieved successfully.");
};

export const getAllPosts = async (req: Request, res: Response) => {
  const posts = await service.getAllPosts();
  sendSuccessResponse(res, posts, "All posts retrieved.");
};

export const updatePost = async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as UpdatePostRequest;
  const updatedPost = await service.updateUserPost(
    req.params.id,
    req.user!.id,
    data
  );
  sendSuccessResponse(res, updatedPost, "Post updated successfully.");
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  await service.deleteUserPost(req.params.id, req.user!.id, req.user!.role);
  sendSuccessResponse(res, null, "Post deleted successfully.");
};
