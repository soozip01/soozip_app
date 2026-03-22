# Project TODO

- [x] 기존 프로젝트 소스 파일 전체 복사 (client, server, drizzle, shared, patches)
- [x] package.json 의존성 병합 (기존 프로젝트 추가 패키지 반영)
- [x] 환경 변수 통합 적용 (카카오/네이버/Supabase/SMTP/Resend 등)
- [x] 의존성 설치 (pnpm install)
- [x] DB 스키마 마이그레이션 (drizzle 스키마 유지)
- [x] 카카오/네이버 소셜 로그인 라우터 및 로직 통합
- [x] Supabase 클라이언트 설정 및 제품/설문 데이터 연동
- [x] 기존 페이지 컴포넌트 전체 이전 (Home, ProductList, Cart, MyPage, Styling 등)
- [x] tRPC 라우터에 기존 API 로직 통합
- [x] 빌드 테스트 성공
- [x] 개발 서버 구동 확인
- [x] 체크포인트 저장 및 배포 안내
- [x] Supabase styling_package_items 테이블 구조 파악 및 데이터 연동
- [x] 서버 API: 패키지 제품 목록 조회 tRPC 프로시저 구현
- [x] 배치솔루션 Step5 최종 시안 + 패키지 제품 구매 UI 구현
- [x] 풀스타일링(온라인) Step6 최종 시안 + 패키지 제품 구매 UI 구현
- [x] 풀스타일링(오프라인) Step6 최종 시안 + 패키지 제품 구매 UI 구현
- [x] 테스트 작성 및 빌드 확인
- [x] BUG: 관리자센터에서 패키지 전송 후 Step5에서 패키지 정보가 보이지 않는 문제 수정
- [x] survey_id 기반으로 패키지 데이터 조회 로직 확인 및 수정
- [x] 패키지 제품 심플 UI 구현 (배치솔루션 Step5, 풀스타일링 Step6)
- [x] 실제 데이터로 동작 확인
- [x] 오늘의집 장바구니 UI/UX 분석 및 참고
- [x] CartContext 구현 (localStorage 기반, 로그인 없이 이용 가능)
- [x] CartPage 재구현 (브랜드별 그룹핑, 선택/전체선택, 수량조절, 삭제, 무료배송 프로그레스바)
- [x] 장바구니 localStorage 기반 구현 (DB 없이 클라이언트 사이드)
- [x] 장바구니 CartContext API 구현 (addItem/removeItem/updateQuantity/clearCart)
- [x] 패키지 제품 → 실제 제품 정보 매핑 및 장바구니 UI 개선
- [x] Step5/Step6에서 패키지 제품 장바구니 담기 연동 (AddToCartModal + 전체 담기)
- [x] 빌드/테스트 및 동작 확인 (9파일 31테스트 통과)
- [x] 제품 옵션 선택 필수 후 장바구니 담기 플로우 구현 (AddToCartModal 수량 선택)
- [x] 장바구니 담기 후 "계속 쇼핑/장바구니 보기" 확인 모달 구현 (AddToCartModal 2단계)
- [x] BottomNav 장바구니 배지 CartContext 연동 (실시간 아이템 수 표시)
- [x] StylingPackageProducts "패키지 전체 담기" 버튼 useCart 직접 연동 수정
- [x] BUG: 제품 장바구니 담기 후 CartPage에 표시되지 않는 문제 수정 (ProductDetail 담기 버튼 CartContext 실제 연동)
- [x] BUG: Step5에서 관리자가 전송한 패키지가 보이지 않는 문제 수정 (TiDB 누락 테이블 생성 - kakao_users, naver_users 등 11개 테이블 추가)
- [x] DB 통합: soozip product 테이블 구조 파악
- [x] DB 통합: soozip 프로젝트에 product 관련 테이블 10개 생성 완료
- [x] DB 통합: soozip product → soozip 데이터 이전 완료 (products, product_images, styling_packages, styling_package_items 등)
- [x] DB 통합: user_id 동기화 구조 설계 (survey_submissions.user_id ↔ users.id 연결 구조 완료)
- [x] DB 통합: soozip_app_v2 서버/클라이언트 코드 단일 Supabase URL로 통합 (client/src/lib/supabase.ts 수정)
- [ ] user_id 동기화: 로그인 → user_id 저장 → 패키지 조회 전체 흐름 분석
- [ ] user_id 동기화: Supabase users 테이블 활성화 (로그인 시 upsert)
- [ ] user_id 동기화: survey_submissions.user_id ↔ Supabase users.id FK 연결
- [ ] user_id 동기화: styling_packages.survey_id 매핑 로직 수정
- [x] BUG: 수집 계정 Step5 패키지 미표시 오류 해결 (배포된 버전 코드 업데이트 필요 - 체크포인트 저장 후 재배포)
- [ ] BUG: 카카오/네이버 소셜 로그인 후 soozip_user localStorage에 저장 안 되는 문제 수정
- [x] Step5 패키지 제품 목록 UI 구현 - URL surveyId 파라미터 직접 사용으로 쿼리 즉시 실행 수정
- [x] BUG: 일반 Supabase(rrtbkrewrgqobyjhkolw) 프로젝트 삭제됨 → supabase.ts URL을 Survey Supabase로 통일
- [x] BUG: VITE_SUPABASE_URL 환경변수를 Survey Supabase URL로 업데이트 (VITE_SURVEY_SUPABASE_URL 우선 사용으로 코드 수정)
- [x] BUG: 배포된 서버에 stylingPackage.getBySubmissionId 라우터 404 → 체크포인트 6fe49ff4 저장 후 재배포 필요
- [ ] BUG: fetchApprovedProducts 에러 방어 코드 강화 (Supabase 연결 실패 시 빈 배열 반환)
- [x] BUG: stylingPackage.getBySubmissionId/getById 라우터에서 삭제된 일반 Supabase(ENV.supabaseUrl) 대신 Survey Supabase(ENV.surveySupabaseUrl) 사용하도록 수정
- [x] BUG: 카카오/네이버 로그인 후 구버전 도메인(soozipmall-xb7s4bud)으로 리다이렉트되는 문제 수정 - VITE_APP_BASE_URL을 soozip01.manus.space로 업데이트 및 빌드
- [x] BUG: /api/auth/callback/kakao 404 에러 - registerSocialOAuthRoutes가 서버 메인에 등록되지 않은 문제 수정
- [x] 배치솔루션 step5, 풀스타일링(온/오프라인) step6 명칭을 '최종안 전달'로 변경
- [x] 모든 타입의 step3 명칭을 '배치 제안'으로 변경
- [x] 풀스타일링(온라인) 사례 이미지를 이미지1만 남기고 플레이스홀더 번호 재조정
- [x] 각 step에서 뒤로가기 시 쿡핑 탭이 아닌 스타일링 탭으로 이동, 이전 step은 읽기전용으로 확인 가능
- [x] 미로그인 마이페이지 '스타일링 서비스 신청' 버튼 클릭 시 https://soozipland-j3tut3mq.manus.space 로 연결
- [x] 메인 헤더: 로그인 시 닉네임 숨기고 프로필만 표시, 프로필을 장바구니 왼쪽으로 이동, 검색창 더 길게
- [x] 마이페이지 탭(프로필/쇼핑/스타일링) 활성 인디케이터 위치 글자에 맞게 정렬 및 디자인 개선 (연한 포인트 컬러 배경 등)
- [x] 스타일링 탭 각 step 내에서 뒤로가기 시 스타일링 탭으로 복귀 (step02 정보입력 등 모든 step)
- [x] BUG: 쇼핑탭 고객센터 뒤로가기 시 홈이 아닌 이전 화면(쇼핑탭)으로 복귀
- [x] BUG: 장바구니 진입 시 404 에러 - 배포 미완료로 인한 구버전 JS 문제 (Publish 필요)
- [x] BUG: 고객센터/장바구니 뒤로가기 시 404 - navigate(-1)이 히스토리 없을 때 실패, 안전한 fallback 로직으로 수정 (useGoBack 훅 생성 및 적용)

## JWT 통합 인증 시스템

- [x] TiDB 스키마: 통합 users 테이블 추가 (provider, providerId, email, passwordHash, nickname 등)
- [x] TiDB 스키마: refresh_tokens 테이블 추가
- [x] DB 마이그레이션 실행 (pnpm db:push)
- [x] 서버: JWT 발급 헬퍼 (accessToken 15분, refreshToken 30일)
- [x] 서버: auth.emailLogin 뮤테이션 - 이메일 로그인 → 통합 users 테이블 조회 → 토큰 발급
- [x] 서버: auth.emailSignup 뮤테이션 - 이메일 회원가입 → 통합 users 테이블 저장 → Supabase users 동기화
- [x] 서버: auth.refreshToken 뮤테이션 - refreshToken 쿠키 검증 → 새 accessToken 발급
- [x] 서버: auth.logoutUnified 뮤테이션 - refreshToken 쿠키 삭제 + DB 무효화
- [x] 서버: 소셜 OAuth 콜백 수정 - 통합 users 테이블에 upsert
- [x] 서버: Supabase users 테이블 동기화 (회원가입/소셜 로그인 시)
- [x] 클라이언트: AuthContext 리팩토링 - accessToken localStorage 관리 + 자동 refresh
- [x] 클라이언트: trpc 클라이언트에 Authorization 헤더 자동 첨부
- [x] 클라이언트: 로그인/회원가입 페이지 새 API 연동
- [x] 테스트 작성 (JWT 발급/검증/만료 감지 - 8개 테스트)

## 디버그 기능

- [x] 이메일 인증 코드 화면 표시 (이메일 미연동 디버그용 - 서버 응답에 코드 포함, 화면에 표시)

## user_id 통일 작업

- [x] Supabase survey_submissions의 user_id를 TiDB soozip_users.id 기준으로 업데이트 (기존 데이터 - id=88 수동 업데이트 완료)
- [x] 신규 설문 신청 시 user_id를 TiDB soozip_users.id로 저장하도록 서버 로직 수정 (이미 올바르게 구현됨 확인)

## 이메일 발송 수정

- [x] sendEmailVerification 500 에러 원인 파악 및 수정 (RESEND_API_KEY 환경변수 업데이트)
- [x] 발신 도메인을 soozip.org로 변경 (RESEND_FROM_EMAIL=noreply@soozip.org)

## UX 개선 및 비밀번호 찾기

- [x] 디버그 인증 코드 배너 제거 (EmailSignup.tsx)
- [x] 회원가입 완료 즉시 자동 로그인 처리
- [x] 비밀번호 찾기 기능 구현 (이메일 입력 → 코드 발송 → 새 비밀번호 설정)

## 소셜 계정 비밀번호 찾기 안내

- [x] 서버: auth.checkEmailProvider 엔드포인트 추가 (이메일로 가입 방식 조회)
- [x] ForgotPassword.tsx: 이메일 입력 후 소셜 계정 감지 시 안내 메시지 표시

## PG사 연동 전 쇼핑몰 기본 기능

### DB 스키마
- [x] wishlists 테이블 (찜 - userId, productId, createdAt)
- [x] product_reviews 테이블 (리뷰 - userId, productId, rating, content, images, orderItemId)
- [x] product_inquiries 테이블 (상품문의 - userId, productId, title, content, answer, isSecret)
- [x] orders 테이블 (주문 - userId, status, totalAmount, shippingAddress 등)
- [x] order_items 테이블 (주문 상품 - orderId, productId, quantity, price 등)
- [x] return_requests 테이블 (교환/반품 - orderItemId, type, reason, status)

### 서버 API
- [x] wishlist.toggle (찜 추가/해제)
- [x] wishlist.list (찜 목록 조회)
- [x] wishlist.check (특정 상품 찜 여부 확인)
- [x] review.list (상품 리뷰 목록)
- [x] review.create (리뷰 작성)
- [x] review.stats (별점 통계)
- [x] inquiry.list (상품문의 목록)
- [x] inquiry.create (문의 작성)
- [x] order.list (주문 목록 조회)
- [x] order.detail (주문 상세)
- [x] order.createDummy (테스트용 더미 주문 생성)
- [x] returnRequest.create (교환/반품 신청)

### 클라이언트 UI
- [x] ProductDetail.tsx: 하트 버튼 실제 찜 API 연동 (로그인 필요)
- [x] WishlistPage.tsx: 마이페이지 찜 목록 페이지 생성
- [x] MyPage.tsx: 찜 목록 메뉴 실제 라우트 연결
- [x] ProductDetail.tsx: 리뷰 탭 추가 (별점 통계 + 리뷰 목록 + 작성 폼)
- [x] ProductDetail.tsx: 상품문의 탭 추가 (문의 목록 + 작성 폼)
- [x] OrderListPage.tsx: 주문/배송 조회 페이지 (입금대기→결제완료→배송준비→배송중→배송완료→리뷰쓰기)
- [x] MyPage.tsx: 주문 현황 카운트 실제 데이터 연동 + 주문/배송 조회 라우트 연결
- [x] ReturnRequestModal: 교환/반품 신청 다이얼로그 (OrderListPage 내 구현)

## 상품 카드 찜 버튼 + 상품 옵션 UI

- [x] 상품 목록 카드에 하트(찜) 버튼 추가 (ProductCard 컴포넌트 신규, Home/ProductList 적용)
- [x] product_options 테이블 구조 파악 및 useProductOptions 훅 추가
- [x] 상품 상세페이지 옵션 선택 UI 구현 (옵션 태그 + 추가상품 체크박스)
- [x] 옵션 선택 후 장바구니 담기 연동 (옵션 메모 + 추가상품 가격 합산)

## product_options Supabase 연동 수정

- [x] useProducts.ts: 별도 createClient 대신 supabase.ts 통합 클라이언트 사용 (올바른 Survey Supabase URL 적용)
- [x] product_options 데이터 실제 조회 및 UI 표시 검증

## 상품 옵션 선택 UX 개선 (오늘의집 스타일)

- [x] 옵션 드롭다운 선택 UI (태그 버튼 → 드롭다운으로 변경)
- [x] 옵션 선택 시 아래에 선택 카드 생성 (옵션 조합명 + 수량 조절 + 가격 + 삭제)
- [x] 여러 옵션 조합 동시 선택 및 개별 수량 조절
- [x] 열 주문금액 = 모든 선택 카드 합산
- [x] 장바구니 담기 시 선택 카드별로 각각 추가

## 하단 바 옵션 선택 바텀 시트

- [x] 하단 고정 바 버튼을 '장바구니' + '구매하기'로 변경 (바로 구매 → 구매하기)
- [x] 두 버튼 모두 클릭 시 옵션 바텀 시트 표시
- [x] 바텀 시트: 드롭다운 옵션 선택 → 선택 카드 생성 → 수량 조절 → 주문금액 합산
- [x] 바텀 시트 내 장바구니/바로구매 버튼 배치
- [x] 상세페이지 본문의 옵션 섹션 제거 (바텀 시트로 통합)

## 옵션 시트 열릴 때 하단 바 숨김

- [x] sheetMode 활성 시 하단 고정 바(장바구니/구매하기) 숨김
- [x] sheetMode 활성 시 BottomNav 숨김

## 바텀 시트 쿠폰 배너

- [x] 주문금액 아래 "받지 않은 쿠폰이 더 있어요 / 쿠폰 받기" 배너 추가
