// Path: src/features/auth/repositories/auth.repository.ts
import { eq, and, lte, sql, gte } from "drizzle-orm";
import { db } from "../../../drizzle";
import {
  usersTable,
  refreshTokensTable,
  emailVerificationsTable,
  NewUser,
  NewRefreshToken,
  User,
} from "../../../drizzle/schema";
import { hashToken } from "../services/jwt.service";

const JWT_REFRESH_EXPIRY = parseInt(
  process.env.JWT_REFRESH_EXPIRY || "1209600"
);

// --- User Repo ---
export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
};

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return user || null;
}

export const findUserById = async (id: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  return user || null;
};

export const markUserEmailAsVerified = async (id: string) =>
  (
    await db
      .update(usersTable)
      .set({ email_verified: true, updated_at: new Date() })
      .where(eq(usersTable.id, id))
      .returning()
  )[0];

export const updateUserLastLogin = async (id: string) =>
  db
    .update(usersTable)
    .set({ last_login: new Date() })
    .where(eq(usersTable.id, id));

export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
): Promise<User | null> {
  const [updatedUser] = await db
    .update(usersTable)
    .set({
      password_hash: newPasswordHash,
      updated_at: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  return updatedUser || null;
}

// --- Refresh Token Repo ---
export const saveRefreshToken = async (userId: string, token: string) => {
  const data: NewRefreshToken = {
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000),
  };
  return await db.insert(refreshTokensTable).values(data);
};

export const findRefreshTokenByHash = async (token_hash: string) =>
  db.query.refreshTokensTable.findFirst({
    where: eq(refreshTokensTable.token_hash, token_hash),
  });

export const deleteRefreshTokenByHash = async (token_hash: string) =>
  db
    .delete(refreshTokensTable)
    .where(eq(refreshTokensTable.token_hash, token_hash));

export const deleteAllUserRefreshTokens = async (user_id: string) =>
  db.delete(refreshTokensTable).where(eq(refreshTokensTable.user_id, user_id));

export const rotateRefreshToken = async (
  oldTokenHash: string,
  newToken: string,
  userId: string
) => {
  await db.transaction(async (tx) => {
    await tx
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.token_hash, oldTokenHash));
    const expires_at = new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000);
    const newData: NewRefreshToken = {
      user_id: userId,
      token_hash: hashToken(newToken),
      expires_at,
    };
    await tx.insert(refreshTokensTable).values(newData);
  });
};

// --- Email Verification Repo ---
export const createEmailVerification = async (
  email: string,
  code: string,
  type: "registration" | "password_reset"
) => {
  await db
    .delete(emailVerificationsTable)
    .where(
      and(
        eq(emailVerificationsTable.email, email),
        eq(emailVerificationsTable.type, type)
      )
    );
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return (
    await db
      .insert(emailVerificationsTable)
      .values({ email, code, expires_at, type })
      .returning()
  )[0];
};

export async function findEmailVerificationByCode(
  email: string,
  code: string,
  type: "registration" | "password_reset"
) {
  const [verification] = await db
    .select()
    .from(emailVerificationsTable)
    .where(
      and(
        eq(emailVerificationsTable.email, email),
        eq(emailVerificationsTable.code, code),
        eq(emailVerificationsTable.type, type),
        eq(emailVerificationsTable.verified, false),
        gte(emailVerificationsTable.expires_at, new Date())
      )
    )
    .limit(1);

  return verification || null;
}

export const markEmailVerificationAsVerified = async (id: string) =>
  db
    .update(emailVerificationsTable)
    .set({ verified: true })
    .where(eq(emailVerificationsTable.id, id));

// --- Cleanup Repo ---
export async function runCleanupOperations() {
  const now = new Date();
  const [tokensResult, verificationsResult] = await Promise.all([
    db
      .delete(refreshTokensTable)
      .where(lte(refreshTokensTable.expires_at, now)),
    db
      .delete(emailVerificationsTable)
      .where(lte(emailVerificationsTable.expires_at, now)),
  ]);
  return {
    deletedTokens: tokensResult.rowCount,
    deletedVerifications: verificationsResult.rowCount,
  };
}
