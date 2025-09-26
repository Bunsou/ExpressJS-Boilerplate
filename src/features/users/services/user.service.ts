import { AppError } from "../../../shared/utils/errorHandler";
import { UpdateProfileRequest } from "../dto/user.schemas";
import * as repo from "../repositories/user.repository";

// Helper to remove password from user object
const sanitizeUser = (user: any) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

export const getUserProfile = async (userId: string) => {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AppError("USER_NOT_FOUND");
  }
  return sanitizeUser(user);
};

export const getAllUsers = async () => {
  const users = await repo.listAllUsers();
  return users.map(sanitizeUser);
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileRequest
) => {
  const updatedUser = await repo.updateUserProfile(userId, data);
  return sanitizeUser(updatedUser);
};
