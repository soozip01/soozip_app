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

/**
 * 이메일 인증 코드 테이블
 * 회원가입 시 이메일 인증에 사용되는 6자리 코드를 임시 저장합니다.
 */
export const emailVerificationCodes = mysqlTable("email_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

/**
 * 디자이너 테이블
 * 수집 플랫폼에 입점 승인된 홈 스타일링 전문 디자이너 정보
 */
export const designers = mysqlTable("designers", {
  id: int("id").autoincrement().primaryKey(),
  // 로그인 계정 연결 (이메일 로그인 기준, 소셜은 nickname으로 매핑)
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  profileImageUrl: text("profileImageUrl"),
  bio: varchar("bio", { length: 200 }), // 한 줄 소개
  // 전문 스타일링 타입 (복수 선택 가능 - JSON 배열 문자열)
  specialties: text("specialties"), // e.g. '["배치솔루션","풀스타일링(온라인)"]'
  portfolioUrls: text("portfolioUrls"), // JSON 배열 - 포트폴리오 이미지 URL 목록
  // 완료 건수
  completedFurniture: int("completedFurniture").default(0).notNull(),
  completedFullOnline: int("completedFullOnline").default(0).notNull(),
  completedFullOffline: int("completedFullOffline").default(0).notNull(),
  // 입점 상태
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  // 신청 관련
  applyReason: text("applyReason"), // 입점 신청 사유
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Designer = typeof designers.$inferSelect;
export type InsertDesigner = typeof designers.$inferInsert;

/**
 * 디자이너 리뷰 테이블
 * 소비자가 스타일링 완료 후 디자이너에게 남기는 리뷰
 */
export const designerReviews = mysqlTable("designer_reviews", {
  id: int("id").autoincrement().primaryKey(),
  designerId: int("designerId").notNull(),
  reviewerNickname: varchar("reviewerNickname", { length: 50 }).notNull(),
  rating: int("rating").notNull(), // 1~5
  comment: text("comment"),
  stylingType: varchar("stylingType", { length: 50 }), // 어떤 타입으로 진행했는지
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DesignerReview = typeof designerReviews.$inferSelect;
export type InsertDesignerReview = typeof designerReviews.$inferInsert;

/**
 * 홈 스타일링 신청서 테이블 (숨고 방식)
 * 소비자가 신청서를 작성하면 디자이너들이 확인하고 채팅을 걸 수 있음
 */
export const stylingRequests = mysqlTable("styling_requests", {
  id: int("id").autoincrement().primaryKey(),
  // 신청자 정보
  requesterNickname: varchar("requesterNickname", { length: 50 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  // 신청 내용
  stylingType: mysqlEnum("stylingType", ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]).notNull(),
  roomSize: varchar("roomSize", { length: 20 }), // 평수
  roomType: varchar("roomType", { length: 50 }), // 방 타입 (거실, 침실 등)
  budget: varchar("budget", { length: 50 }), // 예산 (무료 서비스이지만 가구 구매 예산)
  description: text("description"), // 요청사항
  preferredDate: varchar("preferredDate", { length: 20 }), // 희망 일정 (텍스트)
  // 상태
  status: mysqlEnum("status", ["waiting", "matched", "completed", "cancelled"]).default("waiting").notNull(),
  matchedDesignerId: int("matchedDesignerId"), // 매칭된 디자이너 ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StylingRequest = typeof stylingRequests.$inferSelect;
export type InsertStylingRequest = typeof stylingRequests.$inferInsert;

/**
 * 홈 스타일링 예약 테이블 (캘린더 방식)
 * 소비자가 날짜를 선택하고 설문 완료 후 최종 예약
 */
export const stylingBookings = mysqlTable("styling_bookings", {
  id: int("id").autoincrement().primaryKey(),
  // 예약자 정보
  bookerNickname: varchar("bookerNickname", { length: 50 }).notNull(),
  bookerEmail: varchar("bookerEmail", { length: 320 }),
  // 예약 내용
  stylingType: mysqlEnum("stylingType", ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]).notNull(),
  designerId: int("designerId"), // 특정 디자이너 지정 시 (크몽 방식)
  preferredDate: varchar("preferredDate", { length: 20 }).notNull(), // YYYY-MM-DD
  preferredTime: varchar("preferredTime", { length: 10 }), // HH:MM
  roomSize: varchar("roomSize", { length: 20 }),
  description: text("description"),
  // 설문 완료 여부 (설문 후 최종 확정)
  surveyCompleted: boolean("surveyCompleted").default(false).notNull(),
  // 상태
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StylingBooking = typeof stylingBookings.$inferSelect;
export type InsertStylingBooking = typeof stylingBookings.$inferInsert;
