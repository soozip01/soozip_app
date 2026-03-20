/**
 * OAuth 콜백 페이지
 * 카카오/네이버 OAuth 인증 후 리다이렉트되는 페이지
 *
 * 지원 경로:
 *   /auth/callback/kakao  (카카오 - 쿼리파라미터 없는 URI 필요)
 *   /auth/callback/naver  (네이버 - 쿼리파라미터 없는 URI 필요)
 *   /auth/callback?provider=kakao|naver  (레거시 호환)
 *
 * [모바일 대응]
 * - window.location.search 대신 URL 전체를 파싱하여 code/state 추출
 * - hash(#) 방식으로 파라미터가 전달되는 경우도 처리
 * - redirectUri를 window.location.origin 대신 현재 URL에서 안전하게 추출
 * - 에러 발생 시 상세 정보 표시 및 재시도 안내
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

/**
 * 현재 URL에서 query parameter를 안전하게 추출
 * - window.location.search 파싱
 * - hash(#) 뒤에 query string이 있는 경우도 처리
 */
function getUrlParams(): URLSearchParams {
  // 1. 일반적인 search params
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("code")) return searchParams;

  // 2. hash 방식 (#?code=... 또는 #code=...)
  const hash = window.location.hash;
  if (hash) {
    // #?code=xxx 형태
    const hashWithQuery = hash.startsWith("#?") ? hash.slice(2) : hash.slice(1);
    const hashParams = new URLSearchParams(hashWithQuery);
    if (hashParams.get("code")) return hashParams;
  }

  // 3. 전체 URL에서 추출 시도 (인앱 브라우저 대비)
  try {
    const fullUrl = window.location.href;
    const urlObj = new URL(fullUrl);
    if (urlObj.searchParams.get("code")) return urlObj.searchParams;
  } catch {
    // URL 파싱 실패 시 무시
  }

  return searchParams;
}

/**
 * 현재 URL에서 앱 origin을 안전하게 추출
 * - window.location.origin이 null/invalid인 경우 대비
 */
function getSafeOrigin(): string {
  // 환경변수에 베이스 URL이 설정되어 있으면 사용
  const envBaseUrl = import.meta.env.VITE_APP_BASE_URL;
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, "");

  const origin = window.location.origin;
  if (origin && origin !== "null" && !origin.startsWith("file:")) {
    return origin;
  }

  // href에서 origin 추출
  try {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const { login } = useSoozipAuth();

  const socialAuthMutation = trpc.auth.socialLogin.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        // 신규 회원 → 약관 동의 화면으로 (tempToken 전달)
        navigate(`/auth/social-consent?provider=${data.provider}&tempToken=${(data as any).tempToken}`);
      } else {
        // 기존 회원 → AuthContext에 사용자 정보 저장 후 홈으로
        login(
          {
            id: data.userId ?? 0,
            nickname: (data as any).nickname ?? "",
            email: (data as any).email ?? null,
            provider: data.provider as "kakao" | "naver",
            profileImageUrl: (data as any).profileImageUrl ?? null,
          },
          (data as any).accessToken ?? "",
        );
        navigate("/");
      }
    },
    onError: (err) => {
      setError("로그인 처리 중 오류가 발생했습니다.");
      setErrorDetail(err.message);
    },
  });

  useEffect(() => {
    // URL 파라미터 추출 (모바일 대응 강화)
    const params = getUrlParams();
    const code = params.get("code");
    const state = params.get("state");

    // provider 결정: window.location.pathname 직접 파싱
    let provider: "kakao" | "naver" | null = null;
    const pathname = window.location.pathname;

    if (pathname.includes("/kakao")) {
      provider = "kakao";
    } else if (pathname.includes("/naver")) {
      provider = "naver";
    } else {
      // 레거시 쿼리파라미터 폴백
      const qProvider = params.get("provider");
      if (qProvider === "kakao" || qProvider === "naver") {
        provider = qProvider;
      }
    }

    // 디버깅용 로그 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log("[OAuthCallback] pathname:", pathname);
      console.log("[OAuthCallback] provider:", provider);
      console.log("[OAuthCallback] code:", code ? `${code.substring(0, 10)}...` : "null");
      console.log("[OAuthCallback] state:", state);
      console.log("[OAuthCallback] full URL:", window.location.href);
      console.log("[OAuthCallback] userAgent:", navigator.userAgent);
    }

    if (!code) {
      // code가 없는 경우 - 카카오/네이버에서 오류 파라미터 확인
      const errorParam = params.get("error");
      const errorDesc = params.get("error_description");
      if (errorParam) {
        setError(`소셜 로그인이 취소되었거나 오류가 발생했습니다.`);
        setErrorDetail(`${errorParam}: ${errorDesc || ""}`);
      } else {
        setError("인증 정보가 올바르지 않습니다.");
        setErrorDetail(`code 파라미터가 없습니다. URL: ${window.location.href.substring(0, 100)}`);
      }
      return;
    }

    if (!provider) {
      setError("인증 정보가 올바르지 않습니다.");
      setErrorDetail(`provider를 확인할 수 없습니다. 경로: ${pathname}`);
      return;
    }

    // 백엔드로 전달할 redirectUri: 현재 URL에서 안전하게 추출
    const origin = getSafeOrigin();
    const redirectUri = `${origin}/auth/callback/${provider}`;

    socialAuthMutation.mutate({ code, provider, redirectUri, state: state ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900">로그인 오류</h2>
          <p className="text-sm text-gray-600">{error}</p>
          {errorDetail && (
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-left break-all">
              {errorDetail}
            </p>
          )}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold"
            >
              다시 시도하기
            </button>
            <p className="text-xs text-gray-400">
              문제가 계속되면 이메일로 로그인해 주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin"
        />
        <p className="text-sm text-gray-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}
