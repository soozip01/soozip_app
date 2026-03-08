/**
 * SOOZIP 소셜 회원가입 - 닉네임 설정 페이지
 * 카카오/네이버 약관 동의 후 닉네임을 설정하는 화면
 * 참조: 3번째 첨부 이미지 (추가 정보 입력 화면)
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

export default function SocialProfile() {
  const [, navigate] = useLocation();
  const { login } = useSoozipAuth();

  // URL 쿼리 파라미터에서 데이터 읽기
  const params = new URLSearchParams(window.location.search);
  const provider = (params.get("provider") as "kakao" | "naver") || "kakao";
  const tempToken = params.get("tempToken") || "";
  const termsAgreed = params.get("termsAgreed") === "true";
  const privacyAgreed = params.get("privacyAgreed") === "true";
  const marketingAgreed = params.get("marketingAgreed") === "true";
  const ageAgreed = params.get("ageAgreed") === "true";

  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const checkNicknameQuery = trpc.auth.checkNickname.useQuery(
    { nickname },
    { enabled: false }
  );

  const signupMutation = trpc.auth.socialSignup.useMutation({
    onSuccess: (data) => {
      // 회원가입 완료 후 AuthContext에 사용자 정보 저장
      login({
        id: data.userId,
        nickname,
        email: data.email ?? null,
        provider,
        profileImageUrl: data.profileImageUrl ?? null,
      });
      toast.success("회원가입이 완료되었습니다! 환영합니다 🎉");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCheckNickname = async () => {
    if (nickname.length < 2) {
      toast.error("별명은 2자 이상 입력해주세요.");
      return;
    }
    setNicknameStatus("checking");
    const result = await checkNicknameQuery.refetch();
    if (result.data?.available) {
      setNicknameStatus("available");
    } else {
      setNicknameStatus("taken");
    }
  };

  const handleComplete = () => {
    if (!tempToken) {
      toast.error("인증 세션이 만료되었습니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }
    if (nicknameStatus !== "available") {
      toast.error("별명 중복 확인을 먼저 해주세요.");
      return;
    }
    signupMutation.mutate({
      tempToken,
      nickname,
      termsAgreed,
      privacyAgreed,
      marketingAgreed,
      ageAgreed,
    });
  };

  const providerName = provider === "kakao" ? "카카오" : "네이버";
  const providerColor = provider === "kakao" ? "#FEE500" : "#03C75A";
  const providerTextColor = provider === "kakao" ? "#000000" : "#FFFFFF";

  if (!tempToken) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-lg mx-auto px-6">
        <p className="text-gray-500 text-sm">인증 세션이 만료되었습니다.</p>
        <button onClick={() => navigate("/login")} className="mt-4 text-sm font-bold text-gray-900 underline">
          다시 로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate(-1 as any)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">추가 정보 입력</h1>
      </header>

      <div className="flex flex-col flex-1 px-6 pt-6 pb-10">
        {/* 소셜 계정 표시 */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-1.5">연결된 계정</p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: `${providerColor}20` }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: providerColor, color: providerTextColor }}
            >
              {provider === "kakao" ? "K" : "N"}
            </div>
            <span className="text-sm font-medium text-gray-700">{providerName} 계정 연동됨</span>
          </div>
        </div>

        {/* 닉네임 설정 */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">별명</label>
          <p className="text-xs text-gray-400 mb-3">다른 유저와 겹치지 않도록 별명을 입력해주세요. (2~20자)</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameStatus("idle");
              }}
              placeholder="별명 입력"
              maxLength={20}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={nickname.length < 2 || nicknameStatus === "checking"}
              className="px-4 py-3 rounded-xl border border-gray-800 text-sm font-semibold text-gray-800 whitespace-nowrap disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              {nicknameStatus === "checking" ? (
                <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
              ) : "사용하기"}
            </button>
          </div>

          {/* 상태 메시지 */}
          {nicknameStatus === "available" && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              사용 가능한 별명입니다.
            </p>
          )}
          {nicknameStatus === "taken" && (
            <p className="text-xs text-red-500 mt-2">이미 사용 중인 별명입니다. 다른 별명을 입력해주세요.</p>
          )}
          {nicknameStatus === "idle" && nickname.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">별명은 언제든 수정할 수 있습니다.</p>
          )}
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 leading-relaxed">
          별명은 SOOZIP 서비스 내에서 사용되는 이름입니다. 나중에 마이페이지에서 변경할 수 있습니다.
        </p>

        {/* 완료 버튼 */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleComplete}
            disabled={nicknameStatus !== "available" || signupMutation.isPending}
            className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {signupMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                가입 완료 중...
              </span>
            ) : "회원가입 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
