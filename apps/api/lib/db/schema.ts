import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  email: text().notNull().unique(),
  plan: text({ enum: ["free", "plus", "pro"] })
    .notNull()
    .default("free"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const passwordsTable = sqliteTable(
  "passwords",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    hashedPassword: text("hashed_password").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId] }),
  }),
);

export const oauthAccountsTable = sqliteTable(
  "oauth_accounts",
  {
    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.providerId, table.providerUserId] }),
  }),
);

export const passkeysTable = sqliteTable("passkeys", {
  id: text("id").primaryKey(), // Credential ID (WebAuthn에서 생성된 ID)
  publicKey: text("public_key").notNull(), // 공개키
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  counter: integer("counter").notNull().default(0), // 리플레이 공격 방지용 카운터
  deviceType: text("device_type"), // 예: "single_device" or "multi_device"
  backedUp: integer("backed_up", { mode: "boolean" }).notNull().default(false), // false -> 단일 디바이스 키 (USB) true -> iCloud같은 멀티 디바이스 키
  transports: text("transports"), // JSON 문자열로 저장 (예: "['internal', 'hybrid']")
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
