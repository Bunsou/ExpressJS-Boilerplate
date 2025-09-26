import { eq } from "drizzle-orm";
import { db } from "../../../drizzle";
import { usersTable } from "../../../drizzle/schema";
import { UpdateProfileRequest } from "../dto/user.schemas";

export const findUserById = async (id: string) => {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
  });
};

export const listAllUsers = async () => {
  return db.query.usersTable.findMany();
};

export const updateUserProfile = async (
  id: string,
  data: UpdateProfileRequest
) => {
  const [updatedUser] = await db
    .update(usersTable)
    .set({ ...data, updated_at: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  return updatedUser;
};
