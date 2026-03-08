/**
 * SOOZIP 소셜 회원가입 약관 동의 페이지
 * 카카오/네이버 OAuth 신규 사용자 - 약관 동의 화면
 * 참조: 네이버 회원가입 동의 화면
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface SocialConsentProps {
  provider: "kakao" | "naver";
  tempToken: string;
  onComplete: (agreed: {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
    ageAgreed: boolean;
  }) => void;
}

export function SocialConsentForm({ provider, tempToken, onComplete }: SocialConsentProps) {
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeAge(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  useEffect(() => {
    setAgreeAll(agreeAge && agreeTerms && agreePrivacy && agreeMarketing);
  }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

  const handleNext = () => {
    if (!agreeAge) { toast.error("만 14세 이상 동의가 필요합니다."); return; }
    if (!agreeTerms) { toast.error("이용약관 동의가 필요합니다."); return; }
    if (!agreePrivacy) { toast.error("개인정보 처리방침 동의가 필요합니다."); return; }
    onComplete({
      termsAgreed: agreeTerms,
      privacyAgreed: agreePrivacy,
      marketingAgreed: agreeMarketing,
      ageAgreed: agreeAge,
    });
  };

  const providerName = provider === "kakao" ? "카카오" : "네이버";
  const providerColor = provider === "kakao" ? "#FEE500" : "#03C75A";
  const providerTextColor = provider === "kakao" ? "#000000" : "#FFFFFF";

  return (
    <div className="flex flex-col flex-1 px-6 pt-4 pb-10">
      {/* 소셜 로그인 제공자 표시 */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: `${providerColor}20` }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: providerColor, color: providerTextColor }}
        >
          {provider === "kakao" ? "K" : "N"}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{providerName} 계정으로 회원가입</p>
          <p className="text-xs text-gray-500">SOOZIP 서비스 이용을 위해 약관 동의가 필요합니다.</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 전체 동의 */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50">
          <input
            type="checkbox"
            checked={agreeAll}
            onChange={(e) => handleAgreeAll(e.target.checked)}
            className="w-5 h-5 rounded accent-gray-900"
          />
          <span className="text-sm font-bold text-gray-900">약관 전체동의 (선택항목 포함)</span>
        </label>

        <div className="h-px bg-gray-100 my-1" />

        {/* 만 14세 */}
        <label className="flex items-center gap-3 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={agreeAge}
            onChange={(e) => setAgreeAge(e.target.checked)}
            className="w-4 h-4 rounded accent-gray-900"
          />
          <span className="text-sm text-gray-700">
            만 14세 이상입니다.
            <span className="text-red-500 ml-1 text-xs">(필수)</span>
          </span>
        </label>

        {/* 이용약관 */}
        <label className="flex items-center justify-between cursor-pointer px-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span className="text-sm text-gray-700">
              이용약관 동의
              <span className="text-red-500 ml-1 text-xs">(필수)</span>
            </span>
          </div>
          <button type="button" className="text-xs text-gray-400 underline" onClick={() => toast.info("이용약관 페이지 준비 중입니다.")}>
            보기
          </button>
        </label>

        {/* 개인정보 처리방침 */}
        <label className="flex items-center justify-between cursor-pointer px-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span className="text-sm text-gray-700">
              개인정보 처리방침 동의
              <span className="text-red-500 ml-1 text-xs">(필수)</span>
            </span>
          </div>
          <button type="button" className="text-xs text-gray-400 underline" onClick={() => toast.info("개인정보 처리방침 페이지 준비 중입니다.")}>
            보기
          </button>
        </label>

        {/* 마케팅 수신 */}
        <label className="flex items-start gap-3 cursor-pointer px-1">
          <input
            type="checkbox"
            checked={agreeMarketing}
            onChange={(e) => setAgreeMarketing(e.target.checked)}
            className="w-4 h-4 rounded accent-gray-900 mt-0.5"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            이벤트·구매·특가 알림 및 마케팅 정보 수신
            <span className="text-gray-400 ml-1 text-xs">(선택)</span>
          </span>
        </label>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
          style={{ background: providerColor, color: providerTextColor }}
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
}

/**
 * 소셜 회원가입 동의 페이지 (라우트용)
 * URL 파라미터에서 tempToken과 provider를 읽어옴
 */
export default function SocialConsent() {
  const [, navigate] = useLocation();

  // URL 쿼리 파라미터에서 데이터 읽기
  const params = new URLSearchParams(window.location.search);
  const provider = (params.get("provider") as "kakao" | "naver") || "kakao";
  const tempToken = params.get("tempToken") || "";

  if (!tempToken) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-lg mx-auto px-6">
        <p className="text-gray-500 text-sm">잘못된 접근입니다.</p>
        <button onClick={() => navigate("/login")} className="mt-4 text-sm font-bold text-gray-900 underline">
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  const handleConsentComplete = (agreed: {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
    ageAgreed: boolean;
  }) => {
    // 약관 동의 완료 → 닉네임 설정 페이지로 이동
    const query = new URLSearchParams({
      provider,
      tempToken,
      ...Object.fromEntries(Object.entries(agreed).map(([k, v]) => [k, String(v)])),
    });
    navigate(`/auth/social-profile?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3">
        <button onClick={() => navigate("/login")} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">약관 동의</h1>
      </header>

      <SocialConsentForm
        provider={provider}
        tempToken={tempToken}
        onComplete={handleConsentComplete}
      />
    </div>
  );
}
