// Path: src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const verificationTypeEnum = pgEnum("verification_type", [
  "registration",
  "password_reset",
]);
export const apiKeyPermissionEnum = pgEnum("api_key_permission", [
  "general",
  "data:read",
  "data:write",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  password_hash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("student").notNull(),
  email_verified: boolean("email_verified").default(false).notNull(),
  last_login: timestamp("last_login"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  bio: text("bio"),
  avatar_url: varchar("avatar_url", { length: 255 }),
});

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" }) // Foreign key
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  token_hash: text("token_hash").unique().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const emailVerificationsTable = pgTable("email_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: verificationTypeEnum("type").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeysTable = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").unique().notNull(), // The API key itself
  version: integer("version").notNull().default(1),
  permissions: apiKeyPermissionEnum("permissions").array().notNull(),
  status: boolean("status").notNull().default(true), // active or disabled
  last_used_at: timestamp("last_used_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// This tells Drizzle how users and posts are related
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
}));
export const postsRelations = relations(postsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [postsTable.user_id],
    references: [usersTable.id],
  }),
}));

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type RefreshToken = typeof refreshTokensTable.$inferSelect;
export type NewRefreshToken = typeof refreshTokensTable.$inferInsert;
export type EmailVerification = typeof emailVerificationsTable.$inferSelect;
export type NewEmailVerification = typeof emailVerificationsTable.$inferInsert;
export type ApiKey = typeof apiKeysTable.$inferSelect;
export type NewApiKey = typeof apiKeysTable.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;
