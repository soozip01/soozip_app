/**
 * OAuth 콜백 페이지
 * 카카오/네이버 OAuth 인증 후 리다이렉트되는 페이지
 * URL 파라미터에서 code와 provider를 읽어 백엔드로 전달
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function OAuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const socialAuthMutation = trpc.auth.socialLogin.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        // 신규 회원 → 약관 동의 화면으로
        // 신규 회원 → 약관 동의 화면으로 (tempToken 전달)
        navigate(`/auth/social-consent?provider=${data.provider}&tempToken=${data.tempToken}`);
      } else {
        // 기존 회원 → 홈으로
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
    const provider = params.get("provider") as "kakao" | "naver" | null;
    const state = params.get("state");

    if (!code || !provider) {
      setError("인증 정보가 올바르지 않습니다.");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback?provider=${provider}`;
    socialAuthMutation.mutate({ code, provider, redirectUri, state: state ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
