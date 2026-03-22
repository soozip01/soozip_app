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
 * 통합 수집 회원 테이블
 * 카카오/네이버/이메일 로그인 사용자를 단일 테이블로 관리합니다.
 * - provider: kakao | naver | email
 * - providerId: 소셜은 소셜 고유 ID, 이메일은 email 값
 */
export const soozipUsers = mysqlTable("soozip_users", {
  id: int("id").autoincrement().primaryKey(),
  // 로그인 제공자 및 고유 식별자
  provider: mysqlEnum("provider", ["kakao", "naver", "email"]).notNull(),
  providerId: varchar("providerId", { length: 128 }).notNull(), // 소셜 ID 또는 이메일
  // 기본 정보
  email: varchar("email", { length: 320 }),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  profileImageUrl: text("profileImageUrl"),
  // 이메일 로그인 전용
  passwordHash: varchar("passwordHash", { length: 256 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  // 약관 동의
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  // 역할
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // 타임스탬프
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type SoozipUser = typeof soozipUsers.$inferSelect;
export type InsertSoozipUser = typeof soozipUsers.$inferInsert;

/**
 * Refresh Token 테이블
 * JWT Refresh Token을 DB에 저장하여 무효화(로그아웃/탈취 방지)를 지원합니다.
 */
export const refreshTokens = mysqlTable("refresh_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // soozipUsers.id 참조
  tokenHash: varchar("tokenHash", { length: 256 }).notNull().unique(), // SHA-256 해시
  expiresAt: timestamp("expiresAt").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;

/**
 * 카카오 회원 테이블 (레거시 - 하위 호환 유지)
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
 * 네이버 회원 테이블 (레거시 - 하위 호환 유지)
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
 * 이메일 회원 테이블 (레거시 - 하위 호환 유지)
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

/**
 * 스타일링 진행 상태 테이블
 * 사용자의 스타일링 서비스 진행 단계를 추적합니다.
 * 닉네임 기반으로 연결 (소셜/이메일 로그인 통합)
 */
export const stylingProgress = mysqlTable("styling_progress", {
  id: int("id").autoincrement().primaryKey(),
  // 사용자 식별 (닉네임 기반 - 소셜/이메일 통합)
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  // Supabase Auth userId (카카오/네이버/이메일 로그인 연동)
  userId: varchar("userId", { length: 128 }),
  // 신청 유형
  stylingType: mysqlEnum("stylingType", ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"]).notNull(),
  // 현재 진행 단계 (1부터 시작, 하위 호환 유지)
  currentStep: int("currentStep").default(1).notNull(),
  // 전체 단계 수 (배치솔루션:5, 풀온라인:6, 풀오프라인:7)
  totalSteps: int("totalSteps").notNull(),
  // STEP별 개별 완료 여부 (관리자가 각 단계를 독립적으로 완료 처리)
  // 배치솔루션: step1~step5 사용, 풀온라인: step1~step6, 풀오프라인: step1~step7
  step1: mysqlEnum("step1", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step2: mysqlEnum("step2", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step3: mysqlEnum("step3", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step4: mysqlEnum("step4", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step5: mysqlEnum("step5", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step6: mysqlEnum("step6", ["pending", "in_progress", "done"]).default("pending").notNull(),
  step7: mysqlEnum("step7", ["pending", "in_progress", "done"]).default("pending").notNull(),
  // 서비스 상태
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  // 신청 예약 ID (stylingBookings 연결)
  bookingId: int("bookingId"),
  // 메모 (관리자 내부 메모)
  adminNote: text("adminNote"),
  // 신청일
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StylingProgress = typeof stylingProgress.$inferSelect;
export type InsertStylingProgress = typeof stylingProgress.$inferInsert;

/**
 * 가구 정보 입력 테이블
 * STEP 02에서 사용자가 입력하는 기존 가구 정보
 */
export const furnitureInfo = mysqlTable("furniture_info", {
  id: int("id").autoincrement().primaryKey(),
  // 연결된 스타일링 진행 ID
  progressId: int("progressId").notNull(),
  // 사용자 닉네임
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  // 입력 방식: link(제품 링크) 또는 photo(사진+사이즈)
  inputType: mysqlEnum("inputType", ["link", "photo"]).notNull(),
  // 제품 링크 방식
  productLink: text("productLink"),
  productOption: varchar("productOption", { length: 200 }),
  // 사진+사이즈 방식
  photoUrl: text("photoUrl"),
  productName: varchar("productName", { length: 100 }),
  width: varchar("width", { length: 20 }),   // 가로 (mm)
  depth: varchar("depth", { length: 20 }),   // 깊이 (mm)
  height: varchar("height", { length: 20 }), // 높이 (mm)
  notes: varchar("notes", { length: 300 }),  // 특이사항
  // 정렬 순서
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FurnitureInfo = typeof furnitureInfo.$inferSelect;
export type InsertFurnitureInfo = typeof furnitureInfo.$inferInsert;

/**
 * 찜(위시리스트) 테이블
 * 로그인 사용자가 상품을 찜해두는 기능
 */
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),           // soozipUsers.id 참조
  productId: int("productId").notNull(),     // Supabase products.id (정수형)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

/**
 * 상품 리뷰 테이블
 * 구매 확정 후 작성 가능한 리뷰 (별점 + 텍스트 + 이미지)
 */
export const productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),           // soozipUsers.id 참조
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  productId: int("productId").notNull(),     // Supabase products.id
  orderItemId: int("orderItemId"),           // order_items.id 참조 (구매 확인용)
  rating: int("rating").notNull(),           // 1~5
  content: text("content").notNull(),
  imageUrls: text("imageUrls"),              // JSON 배열 문자열
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

/**
 * 상품 문의 테이블
 * 상품 구매 전/후 판매자에게 문의하는 기능
 */
export const productInquiries = mysqlTable("product_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),           // soozipUsers.id 참조
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  productId: int("productId").notNull(),     // Supabase products.id
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  isSecret: boolean("isSecret").default(false).notNull(),  // 비밀글 여부
  answer: text("answer"),                    // 판매자/관리자 답변
  answeredAt: timestamp("answeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductInquiry = typeof productInquiries.$inferSelect;
export type InsertProductInquiry = typeof productInquiries.$inferInsert;

/**
 * 주문 테이블
 * 상품 구매 시 생성되는 주문 정보
 * 입금대기 → 결제완료 → 배송준비 → 배송중 → 배송완료 → 구매확정
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 30 }).notNull().unique(), // 주문번호 (예: ORD-20260322-001)
  userId: int("userId").notNull(),           // soozipUsers.id 참조
  // 주문 상태
  status: mysqlEnum("status", [
    "pending_payment",  // 입금대기
    "paid",             // 결제완료
    "preparing",        // 배송준비
    "shipping",         // 배송중
    "delivered",        // 배송완료
    "confirmed",        // 구매확정
    "cancelled",        // 취소
  ]).default("paid").notNull(),
  // 금액
  totalAmount: int("totalAmount").notNull(),         // 총 상품금액
  shippingFee: int("shippingFee").default(0).notNull(),
  discountAmount: int("discountAmount").default(0).notNull(),
  finalAmount: int("finalAmount").notNull(),         // 실결제금액
  // 배송지
  recipientName: varchar("recipientName", { length: 50 }).notNull(),
  recipientPhone: varchar("recipientPhone", { length: 20 }).notNull(),
  postalCode: varchar("postalCode", { length: 10 }).notNull(),
  address: varchar("address", { length: 200 }).notNull(),
  addressDetail: varchar("addressDetail", { length: 100 }),
  deliveryMemo: varchar("deliveryMemo", { length: 100 }),
  // 배송 추적
  trackingNumber: varchar("trackingNumber", { length: 50 }),
  courierName: varchar("courierName", { length: 30 }),
  // 결제 정보 (PG 연동 후 채워짐)
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentKey: varchar("paymentKey", { length: 100 }),
  paidAt: timestamp("paidAt"),
  // 주문서 추가 필드
  couponDiscount: int("couponDiscount").default(0).notNull(),
  pointUsed: int("pointUsed").default(0).notNull(),
  ordererName: varchar("ordererName", { length: 50 }),
  ordererPhone: varchar("ordererPhone", { length: 20 }),
  ordererEmail: varchar("ordererEmail", { length: 320 }),
  // 타임스탬프
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * 주문 상품 테이블
 * 하나의 주문에 포함된 개별 상품 항목
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),         // orders.id 참조
  productId: varchar("productId", { length: 100 }).notNull(),  // Supabase products.id (string)
  productName: varchar("productName", { length: 200 }).notNull(),
  brandName: varchar("brandName", { length: 100 }),
  imageUrl: text("imageUrl"),
  optionLabel: varchar("optionLabel", { length: 200 }),  // 선택된 옵션 표시
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),     // 주문 시점 단가
  totalPrice: int("totalPrice").notNull(),   // 수량 * 단가
  // 개별 상품 상태 (교환/반품 처리용)
  itemStatus: mysqlEnum("itemStatus", [
    "normal",           // 정상
    "return_requested", // 반품 신청
    "exchange_requested", // 교환 신청
    "returned",         // 반품 완료
    "exchanged",        // 교환 완료
  ]).default("normal").notNull(),
  reviewWritten: boolean("reviewWritten").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * 교환/반품 신청 테이블
 * 배송 완료 후 교환 또는 반품을 신청하는 기능
 */
export const returnRequests = mysqlTable("return_requests", {
  id: int("id").autoincrement().primaryKey(),
  orderItemId: int("orderItemId").notNull(),  // order_items.id 참조
  orderId: int("orderId").notNull(),           // orders.id 참조
  userId: int("userId").notNull(),             // soozipUsers.id 참조
  type: mysqlEnum("type", ["return", "exchange"]).notNull(),  // 반품 or 교환
  reason: mysqlEnum("reason", [
    "change_of_mind",   // 단순 변심
    "defective",        // 상품 불량/파손
    "wrong_item",       // 오배송
    "size_issue",       // 사이즈 불만족
    "other",            // 기타
  ]).notNull(),
  reasonDetail: text("reasonDetail"),          // 상세 사유
  status: mysqlEnum("status", [
    "requested",        // 신청
    "approved",         // 승인
    "rejected",         // 거절
    "completed",        // 완료
  ]).default("requested").notNull(),
  adminNote: text("adminNote"),                // 관리자 메모
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReturnRequest = typeof returnRequests.$inferSelect;
export type InsertReturnRequest = typeof returnRequests.$inferInsert;

/**
 * 배송지 테이블
 * 사용자가 저장한 배송지 목록
 */
export const shippingAddresses = mysqlTable("shipping_addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 50 }),          // 배송지 별칭 (집, 회사 등)
  recipientName: varchar("recipientName", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  address: text("address").notNull(),               // 도로명 주소
  addressDetail: text("addressDetail"),             // 상세 주소
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = typeof shippingAddresses.$inferInsert;

/**
 * 쿠폰 정의 테이블
 * 관리자가 생성하는 쿠폰 종류
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  discountType: mysqlEnum("discountType", ["fixed", "percent"]).notNull(), // 정액 or 정률
  discountValue: int("discountValue").notNull(),    // 할인 금액 or 퍼센트
  minOrderAmount: int("minOrderAmount").default(0).notNull(), // 최소 주문 금액
  maxDiscountAmount: int("maxDiscountAmount"),       // 최대 할인 금액 (정률 쿠폰)
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * 사용자 쿠폰 발급 테이블
 * 특정 사용자에게 발급된 쿠폰
 */
export const userCoupons = mysqlTable("user_coupons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  couponId: int("couponId").notNull(),
  isUsed: boolean("isUsed").default(false).notNull(),
  usedAt: timestamp("usedAt"),
  usedOrderId: int("usedOrderId"),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});
export type UserCoupon = typeof userCoupons.$inferSelect;
export type InsertUserCoupon = typeof userCoupons.$inferInsert;

/**
 * 포인트 내역 테이블
 * 적립/사용 내역을 기록하고 잔액은 SUM으로 계산
 */
export const pointLedger = mysqlTable("point_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),                  // 양수: 적립, 음수: 사용
  type: mysqlEnum("type", ["earn", "use", "expire", "refund"]).notNull(),
  description: varchar("description", { length: 200 }),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PointLedger = typeof pointLedger.$inferSelect;
export type InsertPointLedger = typeof pointLedger.$inferInsert;
