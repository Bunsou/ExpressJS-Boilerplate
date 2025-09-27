import { redisClient } from "../../../shared/config/redis";
import { AppError } from "../../../shared/utils/errorHandler";
import { UpdateProfileRequest } from "../dto/user.schemas";
import * as repo from "../repositories/user.repository";

// Helper for invalidating user-related caches
const invalidateUserCaches = async (userId?: string) => {
  const promises = [];
  promises.push(redisClient.del("users:all")); // Always invalidate the list of all users
  // If a specific user ID is provided, invalidate their profile cache too
  if (userId) {
    promises.push(redisClient.del(`user:profile:${userId}`));
  }
  await Promise.all(promises);
};

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

  // Now we call our clean, reusable helper function
  await invalidateUserCaches(userId);

  return sanitizeUser(updatedUser);
};
