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

## 11차 작업 (스타일링 타입 + 배치솔루션 대규모 수정)
- [x] StylingTypes: 배치 솔루션/풀 스타일링(온라인)/풀 스타일링(오프라인)/자주 묻는 질문 카드 1번 사진 기준 레이아웃 재구성
- [x] StylingTypeFurniture: 소개 텍스트 수정 (이미지보다 작게, 17px)
- [x] StylingTypeFurniture: STEP 01 패키지 구성품 → step01-package 이미지 하나로 교체
- [x] StylingTypeFurniture: STEP 02 → 3장 이미지로 교체 (product-link, size-info, hard-check)
- [x] StylingTypeFurniture: STEP 03 텍스트 → step03-title-img 이미지로 교체 + 배치안 이미지 2장 업데이트
- [x] StylingTypeFurniture: STEP 04 → step04-feedback 단일 이미지로 교체
- [x] StylingTypeFurniture: STEP 05 → step05-final 단일 이미지로 교체

## 12차 작업 (배치솔루션 이미지 → 코드 구현으로 화질 개선)
- [x] STEP 02 코드 구현: 기존가구 정보 전달 (제품링크 입력 UI, 사이즈+정보 전달 UI, 이런건 확인이 어려워요 UI)
- [x] STEP 03 코드 구현: 최적 배치 안내 텍스트+알림박스 + 배치안 이미지 2장
- [x] STEP 04 코드 구현: 피드백 안내 텍스트+알림박스+곰 캐릭터 이미지
- [x] STEP 05 코드 구현: 최종안 안내 텍스트+3D 배치 이미지+추천 제품
- [x] 기존 이미지 기반 STEP 섹션 제거 (step02-product-link.png, step02-size-info.png, step02-hard-check.png, step03-title-img.png, step04-feedback.png, step05-final.png)

## 13차 작업 (StylingTypes 페이지 UI 수정)
- [x] 배치 솔루션/풀 스타일링/자주 묻는 질문 제목 글씨 크기 18px로 통일, 위치 아래로 이동
- [x] 풀 스타일링(온라인 전용) 카드에 '인기' 뱃지 추가 (빨간 배경, 흰 글씨)
- [x] (온라인 전용), (오프라인 전용) 텍스트 색상 검정, 크기 11px
- [x] 추천 대상 항목들 모두 한 줄로 표시 (글씨 크기 8px), '새로 산 가구들을 배치만 해보고 싶으신 분'만 두 줄
- [x] 4개 카드 위에 '원하시는 타입을 누르면 진행 과정을 볼 수 있어요' 검정 배너 추가 (한 줄)

## 14차 작업 (StylingTypes 카드 제목 세로 위치 통일)
- [x] 4개 카드 제목의 세로 위치를 우측 상단 카드(인기 뱃지 기준) 기준으로 통일 (모든 카드 제목이 같은 높이에 위치)

## 15차 작업 (배치솔루션 아코디언 박스 수정)
- [x] 아코디언 접힌 상태 텍스트 → "배치솔루션, 어떻게 진행되나요?" (따옴표 아이콘 포함)
- [x] 아코디언 펼쳤을 때 1번 항목 → "1. 실측 패키지 발송 및 공간 실측"으로 변경

## 16차 작업 (피그마 기준 세 페이지 제작)
- [x] 피그마 보드 기획 내용 확인
- [x] 첨부 이미지 9장 CDN 업로드
- [x] 배치솔루션 페이지 피그마 기준 최종 수정 (상단 이미지 교체, STEP 01 도면초안만 표시)
- [x] 풀 스타일링(온라인) 페이지 신규 제작 (현아/따냐 사례 이미지, STEP 01~05)
- [x] 풀 스타일링(오프라인) 페이지 신규 제작 (오프라인 공간 이미지, STEP 01~05)
- [x] 라우팅 등록 (App.tsx - 기존 라우트 활용)

## 17차 작업 (마이페이지 UI 개편 + 스타일링 진행 현황)
- [x] 마이페이지 헤더: 우측 최상단에 환경설정(⚙️) + 장바구니(🛒) 아이콘 추가
- [x] 마이페이지: 기존 로그아웃 버튼 제거
- [x] 설정 페이지 신규 제작 (/settings): 공지사항, 개인정보처리방침, 알림설정, 내 정보 수정, 비밀번호 변경, 로그아웃
- [x] 마이페이지 본문: 스타일링 진행 현황 STEP 슬라이더 구현 (좌우 슬라이딩)
- [x] 슬라이더 좌측 상단: 전체 STEP 중 현재 진행 단계 표시
- [x] App.tsx: /settings 라우트 등록

## 27차 작업 (홈 스타일링 예약 시스템)
- [ ] DB 스키마: designers, styling_requests, styling_bookings, designer_reviews 테이블 추가
- [ ] 서버 라우터: 디자이너 조회/입점신청, 예약 생성, 신청서 작성 API
- [ ] 디자이너 목록 페이지 (크몽 방식 - 직접 선택)
- [ ] 디자이너 프로필 상세 페이지
- [ ] 홈 스타일링 신청서 페이지 (숨고 방식 - 디자이너 제안 받기)
- [ ] 대기자 목록 페이지 (디자이너 전용 - 신청서 확인 및 채팅 신청)
- [ ] 예약 캘린더 페이지 + 설문 연동 최종 완료 흐름
- [ ] 디자이너 입점 신청 페이지
- [ ] StylingMain 예약하기 버튼 연결

## 28차 작업 (STEP 01 공간 실측 페이지 구현)
- [x] survey_submissions 테이블에 step1_m~step7_m 컬럼 추가 (관리자 파일 업로드용)
- [x] survey.mySubmission 쿼리에 step1_m~step7_m 컬럼 포함
- [x] survey.uploadStepFile 프로시저 추가 (S3 업로드 후 Supabase step1~step7 컬럼에 URL 배열 저장)
- [x] survey.deleteStepFile 프로시저 추가 (특정 URL 배열에서 제거)
- [x] StylingStep1.tsx 페이지 구현 (/styling/step1)
  - [x] 관리자 도면 초안(step1_m) 다운로드 버튼
  - [x] 다중 파일 업로드 (드래그앤드롭 + 파일 선택, + 버튼)
  - [x] 업로드 상태 표시 (업로드 중/완료/오류)
  - [x] 기존 업로드 파일 표시 및 삭제 기능
  - [x] 실측 팁 안내 섹션
- [x] App.tsx에 /styling/step1 라우트 등록
- [x] MyPage.tsx STEP 01 카드 actionRoute → /styling/step1 연결

## 29차 작업 (신청서 성함 고정 + 프로필 편집 페이지)
- [x] StylingRequestForm: 로그인 사용자의 성함 필드를 닉네임으로 자동 입력 및 수정 불가 처리
- [x] 프로필 편집 페이지 구현 (/profile/edit) - 오늘의집 스타일
  - [x] 프로필 이미지 업로드/변경 (S3 저장)
  - [x] 닉네임 수정 (중복 확인 포함)
  - [x] 이메일 표시 (수정 불가)
  - [x] 저장 버튼
- [x] 마이페이지 프로필 탭에서 프로필 편집 버튼 → /profile/edit 연결
- [x] App.tsx /profile/edit 라우트 등록
- [x] 닉네임 변경 tRPC 프로시저 추가 (DB 업데이트)

## 30차 작업 (soozipland 외부 링크 → 내부 신청서 페이지 전환)
- [x] StylingMain.tsx: handleSurvey → /styling/request 내부 이동
- [x] StylingTypeFurniture.tsx: 하단 버튼 → /styling/request 내부 이동
- [x] StylingTypeFullOnline.tsx: 하단 버튼 → /styling/request 내부 이동
- [x] StylingTypeFullOffline.tsx: 하단 버튼 → /styling/request 내부 이동
- [x] StylingTypeOnline.tsx: 하단 버튼 → /styling/request 내부 이동
- [x] StylingTypeOffline.tsx: 하단 버튼 → /styling/request 내부 이동
- [x] BookingCalendar.tsx: 예약 후 설문 URL → /styling/request 내부 이동
- [x] BookingComplete.tsx: iframe 설문 모달 제거, 내부 신청서 이동 버튼으로 교체
- [x] Home.tsx: showStylingModal iframe 모달 제거
- [x] StylingRequestEmbed.tsx: iframe 제거 후 /styling/request 리다이렉트
