/**
 * SOOZIP 로그인 페이지
 * 디자인 참조: 오늘의집 로그인 화면
 * - 카카오 1초 로그인/회원가입
 * - 네이버 1초 로그인/회원가입
 * - 이메일로 로그인 / 이메일로 회원가입
 *
 * [모바일 대응]
 * - redirectUri를 window.location.origin 대신 VITE_APP_BASE_URL 환경변수 또는
 *   현재 origin을 사용하되, 인앱 브라우저 감지 시 외부 브라우저로 유도
 * - 카카오톡 인앱 브라우저: UserAgent에 'KAKAOTALK' 포함
 * - 네이버 앱 인앱 브라우저: UserAgent에 'NAVER' 포함
 * - 서버사이드 OAuth 콜백에서 에러 발생 시 ?error=... 파라미터로 전달
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/SOOZIP_52085536.png";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY ?? "";
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? "";

/**
 * 앱 베이스 URL 결정
 * - VITE_APP_BASE_URL 환경변수가 있으면 그것을 사용 (배포 환경에서 안정적)
 * - 없으면 window.location.origin 사용 (개발 환경)
 * - 인앱 브라우저에서 origin이 null/about:blank인 경우 대비
 */
function getAppBaseUrl(): string {
  // 환경변수에 베이스 URL이 설정되어 있으면 사용
  const envBaseUrl = import.meta.env.VITE_APP_BASE_URL;
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");

  // window.location.origin이 유효한지 확인
  const origin = window.location.origin;
  if (origin && origin !== "null" && !origin.startsWith("file:")) {
    return origin;
  }

  // 폴백: href에서 origin 추출
  try {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

/**
 * 인앱 브라우저 감지
 */
function detectInAppBrowser(): { isKakao: boolean; isNaver: boolean; isInApp: boolean } {
  const ua = navigator.userAgent;
  const isKakao = /KAKAOTALK/i.test(ua);
  const isNaver = /NAVER/i.test(ua) && !/NaverBot/i.test(ua);
  const isInApp = isKakao || isNaver || /Instagram|FBAN|FBAV|Line|Twitter/i.test(ua);
  return { isKakao, isNaver, isInApp };
}

function getKakaoLoginUrl(): string {
  const baseUrl = getAppBaseUrl();
  const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/callback/kakao`);
  const ua = navigator.userAgent;
  // 카카오톡 인앱 브라우저에서는 prompt=none으로 자동 로그인 시도
  const isKakaoInApp = /KAKAOTALK/i.test(ua);
  const promptParam = isKakaoInApp ? "&prompt=none" : "";
  return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${redirectUri}&response_type=code${promptParam}`;
}

function getNaverLoginUrl(): string {
  const state = Math.random().toString(36).substring(2, 15);
  const baseUrl = getAppBaseUrl();
  const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/callback/naver`);
  // 필수: id(이용자 식별자), email(이메일 주소)
  // 선택: nickname(별명), profile_image(프로필사진), gender(성별), birthday(생일), age(연령대)
  const scope = encodeURIComponent("id email nickname profile_image gender birthday age");
  return `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${state}&scope=${scope}`;
}

/**
 * 인앱 브라우저에서 외부 브라우저로 열기 위한 URL 생성
 * Android: intent:// 스킴 사용
 * iOS: 직접 Safari로 열기 불가 → 사용자에게 안내
 */
function openInExternalBrowser(url: string): void {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    // Android: intent 스킴으로 Chrome 강제 실행
    const intentUrl = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
    // 폴백: 일반 URL로 시도
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  } else if (isIOS) {
    // iOS: 직접 외부 브라우저 강제 불가 → 그냥 이동 (Safari가 처리)
    window.location.href = url;
  } else {
    window.location.href = url;
  }
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // URL에서 에러 파라미터 처리 (서버사이드 OAuth 콜백에서 전달)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setLoginError(decodeURIComponent(error));
      // URL에서 에러 파라미터 제거
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  const handleKakao = () => {
    const { isKakao } = detectInAppBrowser();
    const url = getKakaoLoginUrl();

    if (isKakao) {
      // 카카오톡 인앱 브라우저에서는 prompt=none으로 자동 로그인 (이미 URL에 포함됨)
      // 자동 로그인이 실패하면 일반 로그인 화면이 표시됨
      window.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  const handleNaver = () => {
    const { isNaver } = detectInAppBrowser();
    const url = getNaverLoginUrl();

    if (isNaver) {
      // 네이버 앱 인앱 브라우저에서는 외부 브라우저로 유도
      openInExternalBrowser(url);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => navigate("/")}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="홈"
        >
          <Home size={20} />
        </button>
      </header>

      {/* 로고 */}
      <div className="flex flex-col items-center pt-10 pb-12">
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="SOOZIP" className="w-14 h-14 object-contain rounded-xl" />
          <span className="text-2xl font-black tracking-tight text-gray-900">수집</span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {loginError && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-600 text-center">{loginError}</p>
        </div>
      )}

      {/* 로그인 버튼 영역 */}
      <div className="px-6 space-y-3">
        {/* 카카오 */}
        <button
          onClick={handleKakao}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#FEE500", color: "#000000" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.56 5.19 3.9 6.66L4.8 21l4.2-2.1c.96.24 1.98.36 3 .36 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
          </svg>
          카카오 1초 로그인/회원가입
        </button>

        {/* 네이버 */}
        <button
          onClick={handleNaver}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#03C75A", color: "#FFFFFF" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 3v18h-3.5l-5-8.5V21H4V3h3.5l5 8.5V3H16z" />
          </svg>
          네이버 1초 로그인/회원가입
        </button>

        {/* 이메일 로그인 / 회원가입 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => navigate("/auth/email-login")}
            className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이메일로 로그인
          </button>
          <button
            onClick={() => navigate("/auth/email-signup")}
            className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이메일로 회원가입
          </button>
        </div>
      </div>

      {/* Apple 아이콘 (준비 중) */}
      <div className="flex justify-center mt-10">
        <button
          className="p-2 text-gray-300 cursor-default"
          title="Apple 로그인 준비 중"
          disabled
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </button>
      </div>

      {/* 이용약관 */}
      <div className="px-6 mt-auto pb-10 pt-6">
        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          로그인 시{" "}
          <span className="underline cursor-pointer">이용약관</span>
          {" "}및{" "}
          <span className="underline cursor-pointer">개인정보 처리방침</span>
          에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
