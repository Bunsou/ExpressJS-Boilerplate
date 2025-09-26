import { Response } from "express";
import { AuthenticatedRequest } from "../../../shared/types/auth.types";
import { sendSuccessResponse } from "../../../shared/utils/responseHandler";
import { UpdateProfileRequest } from "../dto/user.schemas";
import * as service from "../services/user.service";

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userProfile = await service.getUserProfile(req.user!.id);
  sendSuccessResponse(res, userProfile, "Profile retrieved successfully.");
};

export const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const data = req.body as UpdateProfileRequest;
  const updatedProfile = await service.updateUserProfile(req.user!.id, data);
  sendSuccessResponse(res, updatedProfile, "Profile updated successfully.");
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  const userProfile = await service.getUserProfile(req.params.id);
  sendSuccessResponse(res, userProfile, "User profile retrieved.");
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const users = await service.getAllUsers();
  sendSuccessResponse(res, users, "All users retrieved.");
};
