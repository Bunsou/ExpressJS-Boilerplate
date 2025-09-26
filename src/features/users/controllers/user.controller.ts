// Path: src/features/users/user.controller.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../../../shared/types/auth.types";
import { sendSuccessResponse } from "../../../shared/utils/responseHandler";

// Admin-only function
export const getAllUsers = (req: AuthenticatedRequest, res: Response) => {
  const users = [
    { id: "uuid-1", email: "admin@example.com", role: "admin" },
    { id: "uuid-2", email: "student1@example.com", role: "student" },
  ];
  sendSuccessResponse(res, users, "All users retrieved.");
};

// Any authenticated user can access this
export const getMyProfile = (req: AuthenticatedRequest, res: Response) => {
  // In a real app, you would fetch this from the database using req.user.id
  const profile = {
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
    message: "This is your private user profile.",
  };
  sendSuccessResponse(res, profile, "Profile retrieved successfully.");
};
