/**
 * 소셜 로그인 완료 처리 페이지
 * URL 파라미터의 user JSON에서 accessToken을 읽어 AuthContext에 저장
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSoozipAuth } from "@/contexts/AuthContext";

export default function SocialComplete() {
  const [, navigate] = useLocation();
  const { login } = useSoozipAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      const errorParam = params.get("error");

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        return;
      }
      if (!userParam) {
        setError("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      const userData = JSON.parse(decodeURIComponent(userParam));
      if (!userData?.id || !userData?.nickname || !userData?.accessToken) {
        setError("사용자 정보가 올바르지 않습니다.");
        return;
      }

      login(
        {
          id: userData.id,
          nickname: userData.nickname,
          email: userData.email ?? null,
          provider: userData.provider as "kakao" | "naver",
          profileImageUrl: userData.profileImageUrl ?? null,
          role: userData.role ?? "user",
        },
        userData.accessToken,
      );

      navigate("/");
    } catch (e) {
      console.error("[SocialComplete] 처리 오류:", e);
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900">로그인 오류</h2>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold"
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
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
        <p className="text-sm text-gray-500">로그인 완료 중...</p>
      </div>
    </div>
  );
}
