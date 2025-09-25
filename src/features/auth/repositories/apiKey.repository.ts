import { eq, and } from "drizzle-orm";
import { db } from "../../../drizzle";
import { apiKeysTable, NewApiKey } from "../../../drizzle/schema";

export const findActiveApiKeyByKey = async (key: string) => {
  const [apiKey] = await db
    .select()
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.key, key), eq(apiKeysTable.status, true)))
    .limit(1);

  return apiKey || null;
};

export const createApiKey = async (data: NewApiKey) => {
  const [newKey] = await db.insert(apiKeysTable).values(data).returning();
  return newKey;
};
