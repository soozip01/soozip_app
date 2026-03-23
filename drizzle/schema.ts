import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 통합 수집 회원 테이블
 * 카카오/네이버/이메일 로그인 사용자를 단일 테이블로 관리합니다.
 */
export const soozipUsers = pgTable("soozip_users", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 10 }).notNull(),
  providerId: varchar("providerId", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  profileImageUrl: text("profileImageUrl"),
  passwordHash: varchar("passwordHash", { length: 256 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  role: varchar("role", { length: 10 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type SoozipUser = typeof soozipUsers.$inferSelect;
export type InsertSoozipUser = typeof soozipUsers.$inferInsert;

/**
 * Refresh Token 테이블
 */
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;

/**
 * 카카오 회원 테이블 (레거시)
 */
export const kakaoUsers = pgTable("kakao_users", {
  id: serial("id").primaryKey(),
  kakaoId: varchar("kakaoId", { length: 64 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  profileImageUrl: text("profileImageUrl"),
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type KakaoUser = typeof kakaoUsers.$inferSelect;
export type InsertKakaoUser = typeof kakaoUsers.$inferInsert;

/**
 * 네이버 회원 테이블 (레거시)
 */
export const naverUsers = pgTable("naver_users", {
  id: serial("id").primaryKey(),
  naverId: varchar("naverId", { length: 64 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  profileImageUrl: text("profileImageUrl"),
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type NaverUser = typeof naverUsers.$inferSelect;
export type InsertNaverUser = typeof naverUsers.$inferInsert;

/**
 * 이메일 회원 테이블 (레거시)
 */
export const emailUsers = pgTable("email_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  termsAgreed: boolean("termsAgreed").default(false).notNull(),
  privacyAgreed: boolean("privacyAgreed").default(false).notNull(),
  marketingAgreed: boolean("marketingAgreed").default(false).notNull(),
  ageAgreed: boolean("ageAgreed").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type EmailUser = typeof emailUsers.$inferSelect;
export type InsertEmailUser = typeof emailUsers.$inferInsert;

/**
 * 이메일 인증 코드 테이블
 */
export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: serial("id").primaryKey(),
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
 */
export const designers = pgTable("designers", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  profileImageUrl: text("profileImageUrl"),
  bio: varchar("bio", { length: 200 }),
  specialties: text("specialties"),
  portfolioUrls: text("portfolioUrls"),
  completedFurniture: integer("completedFurniture").default(0).notNull(),
  completedFullOnline: integer("completedFullOnline").default(0).notNull(),
  completedFullOffline: integer("completedFullOffline").default(0).notNull(),
  status: varchar("status", { length: 10 }).default("pending").notNull(),
  applyReason: text("applyReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Designer = typeof designers.$inferSelect;
export type InsertDesigner = typeof designers.$inferInsert;

/**
 * 디자이너 리뷰 테이블
 */
export const designerReviews = pgTable("designer_reviews", {
  id: serial("id").primaryKey(),
  designerId: integer("designerId").notNull(),
  reviewerNickname: varchar("reviewerNickname", { length: 50 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  stylingType: varchar("stylingType", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DesignerReview = typeof designerReviews.$inferSelect;
export type InsertDesignerReview = typeof designerReviews.$inferInsert;

/**
 * 홈 스타일링 신청서 테이블
 */
export const stylingRequests = pgTable("styling_requests", {
  id: serial("id").primaryKey(),
  requesterNickname: varchar("requesterNickname", { length: 50 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  stylingType: varchar("stylingType", { length: 30 }).notNull(),
  roomSize: varchar("roomSize", { length: 20 }),
  roomType: varchar("roomType", { length: 50 }),
  budget: varchar("budget", { length: 50 }),
  description: text("description"),
  preferredDate: varchar("preferredDate", { length: 20 }),
  status: varchar("status", { length: 15 }).default("waiting").notNull(),
  matchedDesignerId: integer("matchedDesignerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StylingRequest = typeof stylingRequests.$inferSelect;
export type InsertStylingRequest = typeof stylingRequests.$inferInsert;

/**
 * 홈 스타일링 예약 테이블
 */
export const stylingBookings = pgTable("styling_bookings", {
  id: serial("id").primaryKey(),
  bookerNickname: varchar("bookerNickname", { length: 50 }).notNull(),
  bookerEmail: varchar("bookerEmail", { length: 320 }),
  stylingType: varchar("stylingType", { length: 30 }).notNull(),
  designerId: integer("designerId"),
  preferredDate: varchar("preferredDate", { length: 20 }).notNull(),
  preferredTime: varchar("preferredTime", { length: 10 }),
  roomSize: varchar("roomSize", { length: 20 }),
  description: text("description"),
  status: varchar("status", { length: 15 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StylingBooking = typeof stylingBookings.$inferSelect;
export type InsertStylingBooking = typeof stylingBookings.$inferInsert;

/**
 * 스타일링 진행 상태 테이블
 */
export const stylingProgress = pgTable("styling_progress", {
  id: serial("id").primaryKey(),
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  userId: varchar("userId", { length: 128 }),
  stylingType: varchar("stylingType", { length: 30 }).notNull(),
  currentStep: integer("currentStep").default(1).notNull(),
  totalSteps: integer("totalSteps").notNull(),
  step1: varchar("step1", { length: 15 }).default("pending").notNull(),
  step2: varchar("step2", { length: 15 }).default("pending").notNull(),
  step3: varchar("step3", { length: 15 }).default("pending").notNull(),
  step4: varchar("step4", { length: 15 }).default("pending").notNull(),
  step5: varchar("step5", { length: 15 }).default("pending").notNull(),
  step6: varchar("step6", { length: 15 }).default("pending").notNull(),
  step7: varchar("step7", { length: 15 }).default("pending").notNull(),
  status: varchar("status", { length: 15 }).default("active").notNull(),
  bookingId: integer("bookingId"),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StylingProgress = typeof stylingProgress.$inferSelect;
export type InsertStylingProgress = typeof stylingProgress.$inferInsert;

/**
 * 가구 정보 입력 테이블
 */
export const furnitureInfo = pgTable("furniture_info", {
  id: serial("id").primaryKey(),
  progressId: integer("progressId").notNull(),
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  inputType: varchar("inputType", { length: 10 }).notNull(),
  productLink: text("productLink"),
  productOption: varchar("productOption", { length: 200 }),
  photoUrl: text("photoUrl"),
  productName: varchar("productName", { length: 100 }),
  width: varchar("width", { length: 20 }),
  depth: varchar("depth", { length: 20 }),
  height: varchar("height", { length: 20 }),
  notes: varchar("notes", { length: 300 }),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FurnitureInfo = typeof furnitureInfo.$inferSelect;
export type InsertFurnitureInfo = typeof furnitureInfo.$inferInsert;

/**
 * 찜(위시리스트) 테이블
 */
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

/**
 * 상품 리뷰 테이블
 */
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  productId: integer("productId").notNull(),
  orderItemId: integer("orderItemId"),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  imageUrls: text("imageUrls"),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

/**
 * 상품 문의 테이블
 */
export const productInquiries = pgTable("product_inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  userNickname: varchar("userNickname", { length: 50 }).notNull(),
  productId: integer("productId").notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  isSecret: boolean("isSecret").default(false).notNull(),
  answer: text("answer"),
  answeredAt: timestamp("answeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductInquiry = typeof productInquiries.$inferSelect;
export type InsertProductInquiry = typeof productInquiries.$inferInsert;

/**
 * 주문 테이블
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 30 }).notNull().unique(),
  userId: integer("userId").notNull(),
  status: varchar("status", { length: 20 }).default("paid").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  shippingFee: integer("shippingFee").default(0).notNull(),
  discountAmount: integer("discountAmount").default(0).notNull(),
  finalAmount: integer("finalAmount").notNull(),
  recipientName: varchar("recipientName", { length: 50 }).notNull(),
  recipientPhone: varchar("recipientPhone", { length: 20 }).notNull(),
  postalCode: varchar("postalCode", { length: 10 }).notNull(),
  address: varchar("address", { length: 200 }).notNull(),
  addressDetail: varchar("addressDetail", { length: 100 }),
  deliveryMemo: varchar("deliveryMemo", { length: 100 }),
  trackingNumber: varchar("trackingNumber", { length: 50 }),
  courierName: varchar("courierName", { length: 30 }),
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentKey: varchar("paymentKey", { length: 100 }),
  paidAt: timestamp("paidAt"),
  couponDiscount: integer("couponDiscount").default(0).notNull(),
  pointUsed: integer("pointUsed").default(0).notNull(),
  ordererName: varchar("ordererName", { length: 50 }),
  ordererPhone: varchar("ordererPhone", { length: 20 }),
  ordererEmail: varchar("ordererEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * 주문 상품 테이블
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: varchar("productId", { length: 100 }).notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  brandName: varchar("brandName", { length: 100 }),
  imageUrl: text("imageUrl"),
  optionLabel: varchar("optionLabel", { length: 200 }),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unitPrice").notNull(),
  totalPrice: integer("totalPrice").notNull(),
  itemStatus: varchar("itemStatus", { length: 20 }).default("normal").notNull(),
  reviewWritten: boolean("reviewWritten").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * 교환/반품 신청 테이블
 */
export const returnRequests = pgTable("return_requests", {
  id: serial("id").primaryKey(),
  orderItemId: integer("orderItemId").notNull(),
  orderId: integer("orderId").notNull(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  reason: varchar("reason", { length: 20 }).notNull(),
  reasonDetail: text("reasonDetail"),
  status: varchar("status", { length: 15 }).default("requested").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ReturnRequest = typeof returnRequests.$inferSelect;
export type InsertReturnRequest = typeof returnRequests.$inferInsert;

/**
 * 배송지 테이블
 */
export const shippingAddresses = pgTable("shipping_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  label: varchar("label", { length: 50 }),
  recipientName: varchar("recipientName", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  address: text("address").notNull(),
  addressDetail: text("addressDetail"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = typeof shippingAddresses.$inferInsert;

/**
 * 쿠폰 정의 테이블
 */
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  discountType: varchar("discountType", { length: 10 }).notNull(),
  discountValue: integer("discountValue").notNull(),
  minOrderAmount: integer("minOrderAmount").default(0).notNull(),
  maxDiscountAmount: integer("maxDiscountAmount"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * 사용자 쿠폰 발급 테이블
 */
export const userCoupons = pgTable("user_coupons", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  couponId: integer("couponId").notNull(),
  isUsed: boolean("isUsed").default(false).notNull(),
  usedAt: timestamp("usedAt"),
  usedOrderId: integer("usedOrderId"),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type UserCoupon = typeof userCoupons.$inferSelect;
export type InsertUserCoupon = typeof userCoupons.$inferInsert;

/**
 * 포인트 내역 테이블
 */
export const pointLedger = pgTable("point_ledger", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  description: varchar("description", { length: 200 }),
  orderId: integer("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointLedger = typeof pointLedger.$inferSelect;
export type InsertPointLedger = typeof pointLedger.$inferInsert;
