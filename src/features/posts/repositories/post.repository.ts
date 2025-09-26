import { eq } from "drizzle-orm";
import { db } from "../../../drizzle";
import { NewPost, postsTable } from "../../../drizzle/schema";
import { UpdatePostRequest } from "../dto/post.schemas";

export const createPost = async (data: NewPost) => {
  const [post] = await db.insert(postsTable).values(data).returning();
  return post;
};

export const findPostById = async (id: string) => {
  return db.query.postsTable.findFirst({
    where: eq(postsTable.id, id),
    with: {
      author: { columns: { id: true, full_name: true, avatar_url: true } },
    },
  });
};

export const listAllPosts = async () => {
  return db.query.postsTable.findMany({
    with: {
      author: { columns: { id: true, full_name: true, avatar_url: true } },
    },
    orderBy: (posts, { desc }) => [desc(posts.created_at)],
  });
};

export const updatePost = async (id: string, data: UpdatePostRequest) => {
  const [post] = await db
    .update(postsTable)
    .set({ ...data, updated_at: new Date() })
    .where(eq(postsTable.id, id))
    .returning();
  return post;
};

export const deletePost = async (id: string) => {
  const [post] = await db
    .delete(postsTable)
    .where(eq(postsTable.id, id))
    .returning();
  return post;
};
