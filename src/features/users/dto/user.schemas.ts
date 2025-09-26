import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
  avatar_url: z.string().url("Must be a valid URL").optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
