-- ============================================================
-- soozip TiDB → Supabase PostgreSQL 마이그레이션
-- lrozgykdsydvoppqnjdl 프로젝트에 실행
-- 기존 테이블(products, survey_submissions, product_images 등)은 유지
-- ============================================================

-- users (Manus OAuth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- soozip_users (통합 회원)
CREATE TABLE IF NOT EXISTS soozip_users (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(10) NOT NULL CHECK (provider IN ('kakao', 'naver', 'email')),
  "providerId" VARCHAR(128) NOT NULL,
  email VARCHAR(320),
  nickname VARCHAR(50) NOT NULL,
  "profileImageUrl" TEXT,
  "passwordHash" VARCHAR(256),
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "termsAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "privacyAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "marketingAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "ageAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- refresh_tokens (JWT Refresh Token)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "tokenHash" VARCHAR(256) NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- kakao_users (레거시)
CREATE TABLE IF NOT EXISTS kakao_users (
  id SERIAL PRIMARY KEY,
  "kakaoId" VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(320),
  "profileImageUrl" TEXT,
  "termsAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "privacyAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "marketingAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "ageAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- naver_users (레거시)
CREATE TABLE IF NOT EXISTS naver_users (
  id SERIAL PRIMARY KEY,
  "naverId" VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(320),
  "profileImageUrl" TEXT,
  "termsAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "privacyAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "marketingAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "ageAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- email_users (레거시)
CREATE TABLE IF NOT EXISTS email_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(256) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  "termsAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "privacyAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "marketingAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "ageAgreed" BOOLEAN NOT NULL DEFAULT FALSE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- email_verification_codes (이메일 인증 코드)
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  code VARCHAR(10) NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- designers (디자이너)
CREATE TABLE IF NOT EXISTS designers (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  "profileImageUrl" TEXT,
  bio VARCHAR(200),
  specialties TEXT,
  "portfolioUrls" TEXT,
  "completedFurniture" INTEGER NOT NULL DEFAULT 0,
  "completedFullOnline" INTEGER NOT NULL DEFAULT 0,
  "completedFullOffline" INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  "applyReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- designer_reviews (디자이너 리뷰)
CREATE TABLE IF NOT EXISTS designer_reviews (
  id SERIAL PRIMARY KEY,
  "designerId" INTEGER NOT NULL,
  "reviewerNickname" VARCHAR(50) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  "stylingType" VARCHAR(50),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- styling_requests (스타일링 신청서)
CREATE TABLE IF NOT EXISTS styling_requests (
  id SERIAL PRIMARY KEY,
  "requesterNickname" VARCHAR(50) NOT NULL,
  "requesterEmail" VARCHAR(320),
  "stylingType" VARCHAR(30) NOT NULL CHECK ("stylingType" IN ('배치솔루션', '풀스타일링(온라인)', '풀스타일링(오프라인)')),
  "roomSize" VARCHAR(20),
  "roomType" VARCHAR(50),
  budget VARCHAR(50),
  description TEXT,
  "preferredDate" VARCHAR(20),
  status VARCHAR(15) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'completed', 'cancelled')),
  "matchedDesignerId" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- styling_bookings (스타일링 예약)
CREATE TABLE IF NOT EXISTS styling_bookings (
  id SERIAL PRIMARY KEY,
  "bookerNickname" VARCHAR(50) NOT NULL,
  "bookerEmail" VARCHAR(320),
  "stylingType" VARCHAR(30) NOT NULL CHECK ("stylingType" IN ('배치솔루션', '풀스타일링(온라인)', '풀스타일링(오프라인)')),
  "designerId" INTEGER,
  "preferredDate" VARCHAR(20) NOT NULL,
  "preferredTime" VARCHAR(10),
  "roomSize" VARCHAR(20),
  description TEXT,
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- styling_progress (스타일링 진행 상태)
CREATE TABLE IF NOT EXISTS styling_progress (
  id SERIAL PRIMARY KEY,
  "userNickname" VARCHAR(50) NOT NULL,
  "userId" VARCHAR(128),
  "stylingType" VARCHAR(30) NOT NULL CHECK ("stylingType" IN ('배치솔루션', '풀스타일링(온라인)', '풀스타일링(오프라인)')),
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "totalSteps" INTEGER NOT NULL,
  step1 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step1 IN ('pending', 'in_progress', 'done')),
  step2 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step2 IN ('pending', 'in_progress', 'done')),
  step3 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step3 IN ('pending', 'in_progress', 'done')),
  step4 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step4 IN ('pending', 'in_progress', 'done')),
  step5 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step5 IN ('pending', 'in_progress', 'done')),
  step6 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step6 IN ('pending', 'in_progress', 'done')),
  step7 VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (step7 IN ('pending', 'in_progress', 'done')),
  status VARCHAR(15) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  "bookingId" INTEGER,
  "adminNote" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- furniture_info (가구 정보)
CREATE TABLE IF NOT EXISTS furniture_info (
  id SERIAL PRIMARY KEY,
  "progressId" INTEGER NOT NULL,
  "userNickname" VARCHAR(50) NOT NULL,
  "inputType" VARCHAR(10) NOT NULL CHECK ("inputType" IN ('link', 'photo')),
  "productLink" TEXT,
  "productOption" VARCHAR(200),
  "photoUrl" TEXT,
  "productName" VARCHAR(100),
  width VARCHAR(20),
  depth VARCHAR(20),
  height VARCHAR(20),
  notes VARCHAR(300),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- wishlists (찜)
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- product_reviews (상품 리뷰)
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "userNickname" VARCHAR(50) NOT NULL,
  "productId" INTEGER NOT NULL,
  "orderItemId" INTEGER,
  rating INTEGER NOT NULL,
  content TEXT NOT NULL,
  "imageUrls" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- product_inquiries (상품 문의)
CREATE TABLE IF NOT EXISTS product_inquiries (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "userNickname" VARCHAR(50) NOT NULL,
  "productId" INTEGER NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  "isSecret" BOOLEAN NOT NULL DEFAULT FALSE,
  answer TEXT,
  "answeredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- orders (주문)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(30) NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending_payment','paid','preparing','shipping','delivered','confirmed','cancelled')),
  "totalAmount" INTEGER NOT NULL,
  "shippingFee" INTEGER NOT NULL DEFAULT 0,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "finalAmount" INTEGER NOT NULL,
  "recipientName" VARCHAR(50) NOT NULL,
  "recipientPhone" VARCHAR(20) NOT NULL,
  "postalCode" VARCHAR(10) NOT NULL,
  address VARCHAR(200) NOT NULL,
  "addressDetail" VARCHAR(100),
  "deliveryMemo" VARCHAR(100),
  "trackingNumber" VARCHAR(50),
  "courierName" VARCHAR(30),
  "paymentMethod" VARCHAR(30),
  "paymentKey" VARCHAR(100),
  "paidAt" TIMESTAMPTZ,
  "couponDiscount" INTEGER NOT NULL DEFAULT 0,
  "pointUsed" INTEGER NOT NULL DEFAULT 0,
  "ordererName" VARCHAR(50),
  "ordererPhone" VARCHAR(20),
  "ordererEmail" VARCHAR(320),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- order_items (주문 상품)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "productId" VARCHAR(100) NOT NULL,
  "productName" VARCHAR(200) NOT NULL,
  "brandName" VARCHAR(100),
  "imageUrl" TEXT,
  "optionLabel" VARCHAR(200),
  quantity INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "itemStatus" VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK ("itemStatus" IN ('normal','return_requested','exchange_requested','returned','exchanged')),
  "reviewWritten" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- return_requests (교환/반품 신청)
CREATE TABLE IF NOT EXISTS return_requests (
  id SERIAL PRIMARY KEY,
  "orderItemId" INTEGER NOT NULL,
  "orderId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('return', 'exchange')),
  reason VARCHAR(20) NOT NULL CHECK (reason IN ('change_of_mind','defective','wrong_item','size_issue','other')),
  "reasonDetail" TEXT,
  status VARCHAR(15) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','completed')),
  "adminNote" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- shipping_addresses (배송지)
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  label VARCHAR(50),
  "recipientName" VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  "zipCode" VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  "addressDetail" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- coupons (쿠폰)
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  "discountType" VARCHAR(10) NOT NULL CHECK ("discountType" IN ('fixed', 'percent')),
  "discountValue" INTEGER NOT NULL,
  "minOrderAmount" INTEGER NOT NULL DEFAULT 0,
  "maxDiscountAmount" INTEGER,
  "expiresAt" TIMESTAMPTZ,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_coupons (사용자 쿠폰 발급)
CREATE TABLE IF NOT EXISTS user_coupons (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "couponId" INTEGER NOT NULL,
  "isUsed" BOOLEAN NOT NULL DEFAULT FALSE,
  "usedAt" TIMESTAMPTZ,
  "usedOrderId" INTEGER,
  "issuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMPTZ
);

-- point_ledger (포인트 내역)
CREATE TABLE IF NOT EXISTS point_ledger (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'refund')),
  description VARCHAR(200),
  "orderId" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updatedAt 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updatedAt 트리거 적용
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','soozip_users','kakao_users','naver_users','email_users',
    'designers','styling_requests','styling_bookings','styling_progress',
    'furniture_info','product_reviews','product_inquiries','orders',
    'return_requests','shipping_addresses'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$;
