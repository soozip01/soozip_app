import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 카카오 회원 테이블
 * 카카오 OAuth로 가입한 사용자 정보를 저장합니다.
 */
export const kakaoUsers = mysqlTable("kakao_users", {
  id: int("id").autoincrement().primaryKey(),
  kakaoId: varchar("kakaoId", { length: 64 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  profileImageUrl: text("profileImageUrl"),
  // 약관 동의 여부
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type KakaoUser = typeof kakaoUsers.$inferSelect;
export type InsertKakaoUser = typeof kakaoUsers.$inferInsert;

/**
 * 네이버 회원 테이블
 * 네이버 OAuth로 가입한 사용자 정보를 저장합니다.
 */
export const naverUsers = mysqlTable("naver_users", {
  id: int("id").autoincrement().primaryKey(),
  naverId: varchar("naverId", { length: 64 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  profileImageUrl: text("profileImageUrl"),
  // 약관 동의 여부
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type NaverUser = typeof naverUsers.$inferSelect;
export type InsertNaverUser = typeof naverUsers.$inferInsert;

/**
 * 이메일 회원 테이블
 * 이메일/비밀번호로 가입한 사용자 정보를 저장합니다.
 */
export const emailUsers = mysqlTable("email_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  // 약관 동의 여부
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type EmailUser = typeof emailUsers.$inferSelect;
export type InsertEmailUser = typeof emailUsers.$inferInsert;
