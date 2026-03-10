# SOOZIP TODO

## 완료된 작업
- [x] Supabase 상품 데이터 연동 (products, product_images, product_detail_page, product_detail_images)
- [x] 상품 목록 페이지 (status=approved 필터링)
- [x] 상품 상세 페이지 UI (이미지 슬라이더, 탭, 수량 선택, 하단 CTA)
- [x] 풀스택 업그레이드 (web-db-user)
- [x] 스플래시(로딩) 화면 구현 - SOOZIP 로고 + 검정 배경
- [x] 로그인/회원가입 페이지 UI (카카오/네이버/이메일 버튼)
- [x] 카카오 OAuth 백엔드 콜백 라우트
- [x] 네이버 OAuth 백엔드 콜백 라우트
- [x] Supabase 회원 테이블 생성 (kakao_users, naver_users, email_users) - drizzle 마이그레이션 완료
- [x] 소셜 회원가입 약관 동의 화면 (카카오/네이버)
- [x] 소셜 회원가입 추가 정보 입력 (닉네임 중복 확인)
- [x] 이메일 회원가입/로그인 구현
- [x] 이메일 회원가입 닉네임 중복 확인
- [x] VITE_KAKAO_REST_API_KEY 환경 변수 설정

## 신규 작업
- [x] 로그인 상태 헤더 반영 (닉네임 표시, 마이페이지 연결)
- [x] 이메일 인증 발송 기능 (이메일 인증 코드 발송/검증 라우터 구현)
- [x] 카카오/네이버 소셜 로그인 실제 작동 설정 안내

## 추가 작업
- [x] 이메일 인증 실제 발송 연동 (Nodemailer SMTP - SMTP_HOST/SMTP_USER/SMTP_PASS 환경 변수 필요)
- [x] 로그인 세션 localStorage 유지 (새로고침 후 복원 - SoozipAuthProvider)
- [x] 소셜 로그인 기존 회원 AuthContext 저장 및 헤더 반영 (OAuthCallback 수정)
- [x] BottomNav 마이 탭 경로 /login → /mypage 수정
- [x] verifyEmailCode orderBy desc 수정 (최신 코드 우선 조회)
- [x] OAuthCallback useRoute → window.location.pathname 직접 파싱으로 수정 (배포 환경 provider 누락 버그 수정)
- [ ] 네이버 로그인 리다이렉트 URI 등록 및 모바일/PC 검증

## 2차 작업 (이메일/소셜 로그인 완성)
- [x] Resend API 설치 및 mailer.ts 교체 (네이버/구글 등 실제 이메일 발송)
- [x] RESEND_API_KEY 환경변수 설정
- [x] 이메일 인증 → 회원가입 전체 흐름 검증
- [x] VITE_NAVER_CLIENT_ID 환경변수 추가 및 LoginPage.tsx 하드코딩 제거
- [x] 소셜 로그인 리다이렉트 URL 세팅 (카카오/네이버 개발자 콘솔 안내 준비)
- [x] 소셜 로그인 백엔드 state 파라미터 검증 수정

## 3차 작업 (소셜 로그인 오류 수정 및 이메일 회원가입 검증)
- [x] 카카오 KOE004 오류 수정 (리다이렉트 URI 불일치)
- [x] 카카오 KOE006 오류 수정 (배포 버전 코드 불일치 - 구버전 redirect_uri 사용 중)
- [ ] 이메일 회원가입 전체 흐름 브라우저 직접 검증
- [x] 네이버 개발 중 상태 해결 (테스터 계정 등록 안내)
- [x] OAuthCallback 소셜 로그인 콜백 처리 로직 검증

## 4차 작업 (모바일 웹 OAuth 로그인 수정)
- [x] 모바일 웹에서 카카오/네이버 OAuth 로그인 "code 또는 provider 누락" 오류 수정
- [x] 모바일 인앱 브라우저(카카오톡, 네이버 앱) 대응 처리
- [x] 모바일 환경 OAuth 콜백 URL 파싱 안정화
- [x] 모바일 시뮬레이션 테스트 검증 (redirectUri 정확성 확인, 인앱 브라우저 감지 로직 검증)

## 5차 작업 (홈 스타일링 페이지 구현)
- [x] 수집 홈 스타일링 메인 페이지 (/styling) 구현
- [x] 홈 스타일링 타입이 궁금해요 / 예약하기 카드 (이모티콘 포함)
- [x] 빠른 상담 설문 버튼 → 기존 스타일링 신청 페이지 연결
- [x] 먼저 상담 받기 버튼 → 카카오 채널 링크 연결
- [x] 수집 스타일링샷 보러가기 → 외부 링크 연결
- [x] 수집 홈 스타일링 타입 페이지 (/styling/types) 구현
- [x] 가구 배치만 / 풀 스타일링(온라인) / 풀 스타일링(오프라인) / 자주 묻는 질문 카드
- [x] 각 타입별 상세 페이지 구현
- [x] 자주 묻는 질문 페이지 구현 (/styling/faq)
- [x] 홈 화면 '홈 스타일링 신청하기' 버튼 → /styling 라우트 연결
- [x] App.tsx 라우트 등록

## 6차 작업 (스타일링 페이지 수정 및 배치솔루션 페이지 구현)
- [x] StylingMain "빠른 상담 설문" 버튼 → https://soozipland-j3tut3mq.manus.space/ 링크 변경
- [x] StylingTypes 글씨 크기 비율 통일 및 추천 대상 텍스트 한 줄 표시
- [x] StylingTypes FAQ 카드 이모티콘 추가 (도형 우측 하단)
- [x] 수집 배치솔루션 페이지 (/styling/types/furniture) 전면 재구현
  - [x] 상단 소개 섹션 (도면 이미지 2장, 설명 텍스트)
  - [x] 펼치기/접기 박스 기능 (5단계 목록, 클릭 시 해당 STEP으로 스크롤)
  - [x] STEP 01~05 각 단계 상세 내용

## 7차 작업 (네이버 OAuth scope 변경)
- [x] 네이버 OAuth scope 수정: 필수(id, email), 선택(nickname, profile_image, gender, birthday, age)
- [x] 이름(name) 항목 제거, 휴대전화번호(mobile) 항목 제거
- [x] 사용자 프로필 처리 코드에서 추가 선택 항목 반영

## 8차 작업 (마이 탭 동작 변경 + 로그인 페이지 로고 교체)
- [x] 하단바 마이 탭 클릭 시 비로그인 상태면 로그인 페이지로 직접 이동
- [x] 로그인 페이지 로고 이미지를 SOOZIP.png로 교체 (크게)

## 9차 작업 (스타일링 페이지 대규모 수정)
- [x] StylingMain: 빠른진행 텍스트 삭제, 카드 세로 길이 증가
- [x] StylingTypes: 두 도형 내부 간격 통일, 세부항목 행간 좁히기
- [x] StylingTypeFurniture: 이미지 22장 교체 및 텍스트/레이아웃 수정
- [x] StylingTypeFurniture: 앵커 이동 시 STEP 제목부터 보이도록 수정
- [x] StylingTypeFurniture: 최하단 상담 버튼 추가

## 10차 작업 (배치솔루션 페이지 추가 수정)
- [x] 소개 텍스트 2줄로 변경: "실제 공간과 가구의 사이즈를 반영하여" / "최적의 배치를 잡아드려요"
- [x] 소개 섹션 이미지 누끼 크게 표시 (배경 없이 크게)
- [x] 포인트 컬러 #E84B1A → #d31400으로 전체 변경
- [x] 앵커 이동 시 STEP 위 여백 추가 (STEP 뱃지 위 약 24px 여백)
