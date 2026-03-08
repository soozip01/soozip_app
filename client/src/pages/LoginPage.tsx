/**
 * SOOZIP 로그인 페이지
 * 디자인 참조: 오늘의집 로그인 화면
 * - 카카오 1초 로그인/회원가입
 * - 네이버 1초 로그인/회원가입
 * - 이메일로 로그인 / 이메일로 회원가입
 */
import { useLocation } from "wouter";
import { Home } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/soozip-splash-logo_ddc8f7c4.png";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY ?? "";
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? "";

function getKakaoLoginUrl() {
  // 카카오는 쿼리파라미터 없는 URI만 허용 → /auth/callback/kakao 경로 사용
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/auth/callback/kakao`
  );
  return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${redirectUri}&response_type=code`;
}

function getNaverLoginUrl() {
  const state = Math.random().toString(36).substring(2, 15);
  // 네이버도 동일하게 경로 기반 URI 사용
  const redirectUri = encodeURIComponent(
    `${window.location.origin}/auth/callback/naver`
  );
  return `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
}

export default function LoginPage() {
  const [, navigate] = useLocation();

  const handleKakao = () => {
    window.location.href = getKakaoLoginUrl();
  };

  const handleNaver = () => {
    window.location.href = getNaverLoginUrl();
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
          <img src={LOGO_URL} alt="SOOZIP" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-black tracking-tight text-gray-900">수집</span>
        </div>
      </div>

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
