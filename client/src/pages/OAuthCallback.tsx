/**
 * OAuth 콜백 페이지
 * 카카오/네이버 OAuth 인증 후 리다이렉트되는 페이지
 *
 * 지원 경로:
 *   /auth/callback/kakao  (카카오 - 쿼리파라미터 없는 URI 필요)
 *   /auth/callback/naver  (네이버 - 쿼리파라미터 없는 URI 필요)
 *   /auth/callback?provider=kakao|naver  (레거시 호환)
 */
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { login } = useSoozipAuth();

  // 경로 기반 매칭 (/auth/callback/kakao 또는 /auth/callback/naver)
  const [matchKakao] = useRoute("/auth/callback/kakao");
  const [matchNaver] = useRoute("/auth/callback/naver");

  const socialAuthMutation = trpc.auth.socialLogin.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        // 신규 회원 → 약관 동의 화면으로 (tempToken 전달)
        navigate(`/auth/social-consent?provider=${data.provider}&tempToken=${(data as any).tempToken}`);
      } else {
        // 기존 회원 → AuthContext에 사용자 정보 저장 후 홈으로
        login({
          id: data.userId ?? 0,
          nickname: (data as any).nickname ?? "",
          email: (data as any).email ?? null,
          provider: data.provider as "kakao" | "naver",
          profileImageUrl: (data as any).profileImageUrl ?? null,
        });
        navigate("/");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    // provider 결정: 경로 기반 우선, 없으면 쿼리파라미터 폴백
    let provider: "kakao" | "naver" | null = null;
    if (matchKakao) {
      provider = "kakao";
    } else if (matchNaver) {
      provider = "naver";
    } else {
      const qProvider = params.get("provider");
      if (qProvider === "kakao" || qProvider === "naver") {
        provider = qProvider;
      }
    }

    if (!code || !provider) {
      setError("인증 정보가 올바르지 않습니다. (code 또는 provider 누락)");
      return;
    }

    // 백엔드로 전달할 redirectUri: 실제 카카오/네이버 개발자 콘솔에 등록된 URI와 동일해야 함
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    socialAuthMutation.mutate({ code, provider, redirectUri, state: state ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKakao, matchNaver]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900">로그인 오류</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold"
          >
            다시 시도하기
          </button>
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
