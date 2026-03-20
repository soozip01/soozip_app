/**
 * 프로필 편집 페이지
 * - 프로필 이미지 변경 (원형, 카메라 아이콘 오버레이)
 * - 닉네임 수정 (중복 확인 포함)
 * - 이메일 표시 (수정 불가)
 * - 오늘의집 스타일 레이아웃
 */
import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "oklch(0.55 0.22 32)";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  naver: "네이버",
  email: "이메일",
};

export default function ProfileEdit() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn, login, accessToken } = useSoozipAuth();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "available" | "taken" | "same">("idle");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImageUrl ?? null);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [profileImageMime, setProfileImageMime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: (data) => {
      // AuthContext 업데이트
      if (user && accessToken) {
        login(
          {
            ...user,
            nickname: data.nickname ?? user.nickname,
            profileImageUrl: data.profileImageUrl ?? user.profileImageUrl,
          },
          accessToken,
        );
      }
      toast.success("프로필이 저장되었습니다.");
      navigate("/my");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSaving(false);
    },
  });

  // 닉네임 중복 확인 (debounce)
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameStatus("idle");

    if (nicknameCheckTimer.current) clearTimeout(nicknameCheckTimer.current);

    if (!value || value.length < 2) return;

    if (value === user?.nickname) {
      setNicknameStatus("same");
      return;
    }

    setNicknameStatus("checking");
    nicknameCheckTimer.current = setTimeout(async () => {
      try {
        // trpc query를 직접 호출하는 대신 fetch로 간단히 처리
        const res = await fetch(`/api/trpc/auth.checkNickname?input=${encodeURIComponent(JSON.stringify({ json: { nickname: value } }))}`);
        const json = await res.json() as { result?: { data?: { json?: { available?: boolean } } } };
        const available = json?.result?.data?.json?.available;
        setNicknameStatus(available ? "available" : "taken");
      } catch {
        setNicknameStatus("idle");
      }
    }, 500);
  };

  // 이미지 파일 선택
  const handleImageChange = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("5MB 이하의 이미지만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImagePreview(result);
      // base64 data URL에서 실제 base64 부분만 추출
      const base64 = result.split(",")[1];
      setProfileImageBase64(base64);
      setProfileImageMime(file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  // 저장
  const handleSave = () => {
    if (!user || !isLoggedIn) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const nicknameChanged = nickname !== user.nickname && nickname.length >= 2;
    const imageChanged = !!profileImageBase64;

    if (!nicknameChanged && !imageChanged) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }

    if (nicknameChanged && nicknameStatus === "taken") {
      toast.error("이미 사용 중인 닉네임입니다.");
      return;
    }

    if (nicknameChanged && nickname.length < 2) {
      toast.error("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    setIsSaving(true);
    updateProfile.mutate({
      userId: Number(user.id),
      provider: user.provider,
      nickname: nicknameChanged ? nickname : undefined,
      profileImageBase64: imageChanged ? profileImageBase64! : undefined,
      profileImageMime: imageChanged ? profileImageMime! : undefined,
    });
  };

  // 비로그인 처리
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <p className="text-muted-foreground mb-4">로그인이 필요합니다.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl text-white font-medium"
          style={{ background: TERRACOTTA }}
        >
          로그인하기
        </button>
      </div>
    );
  }

  const isNicknameValid = nickname.length >= 2 && nickname.length <= 20;
  const canSave = !isSaving && (
    (nickname !== user.nickname && isNicknameValid && nicknameStatus !== "taken") ||
    !!profileImageBase64
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/my")} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">프로필 편집</h1>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-sm font-bold transition-opacity"
            style={{ color: canSave ? TERRACOTTA : "#ccc" }}
          >
            저장
          </button>
        </div>
      </header>

      <div className="px-5 pt-8 pb-24">
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: "2px solid oklch(0.90 0.05 32)" }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{ background: TERRACOTTA }}
              >
                {user.nickname.slice(0, 1)}
              </div>
            )}
            {/* 카메라 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white"
              style={{ background: "#222" }}
            >
              <Camera size={14} className="text-white" />
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-sm font-medium"
            style={{ color: TERRACOTTA }}
          >
            사진 변경
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageChange(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* 닉네임 */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 block mb-2">닉네임</label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              maxLength={20}
              placeholder="닉네임을 입력해주세요 (2~20자)"
              className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-colors"
              style={{
                borderColor: nicknameStatus === "taken" ? "#ef4444"
                  : nicknameStatus === "available" ? "#22c55e"
                  : "oklch(0.88 0 0)",
                background: "oklch(0.98 0 0)",
              }}
            />
            {/* 상태 아이콘 */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {nicknameStatus === "checking" && (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              )}
              {nicknameStatus === "available" && (
                <CheckCircle2 size={16} className="text-green-500" />
              )}
              {nicknameStatus === "taken" && (
                <AlertCircle size={16} className="text-red-500" />
              )}
              {nicknameStatus === "same" && (
                <CheckCircle2 size={16} className="text-gray-400" />
              )}
            </div>
          </div>
          {/* 상태 메시지 */}
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs"
              style={{
                color: nicknameStatus === "taken" ? "#ef4444"
                  : nicknameStatus === "available" ? "#22c55e"
                  : nicknameStatus === "same" ? "#9ca3af"
                  : "#9ca3af"
              }}
            >
              {nicknameStatus === "taken" && "이미 사용 중인 닉네임입니다."}
              {nicknameStatus === "available" && "사용 가능한 닉네임입니다."}
              {nicknameStatus === "same" && "현재 사용 중인 닉네임입니다."}
              {nicknameStatus === "idle" && "2~20자, 한글/영문/숫자 사용 가능"}
              {nicknameStatus === "checking" && "확인 중..."}
            </p>
            <p className="text-xs text-gray-400">{nickname.length}/20</p>
          </div>
        </div>

        {/* 이메일 (수정 불가) */}
        {user.email && (
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">이메일</label>
            <div
              className="px-4 py-3.5 rounded-xl border text-sm text-gray-500"
              style={{ background: "oklch(0.96 0 0)", borderColor: "oklch(0.90 0 0)" }}
            >
              {user.email}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">이메일은 변경할 수 없습니다.</p>
          </div>
        )}

        {/* 로그인 방식 */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-gray-700 block mb-2">로그인 방식</label>
          <div
            className="px-4 py-3.5 rounded-xl border text-sm text-gray-500 flex items-center gap-2"
            style={{ background: "oklch(0.96 0 0)", borderColor: "oklch(0.90 0 0)" }}
          >
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
              style={{
                background: user.provider === "kakao" ? "#FEE500"
                  : user.provider === "naver" ? "#03C75A"
                  : "#555",
                color: user.provider === "kakao" ? "#3C1E1E" : "white",
              }}
            >
              {PROVIDER_LABEL[user.provider] ?? user.provider}
            </span>
            <span>{PROVIDER_LABEL[user.provider] ?? user.provider} 계정으로 로그인 중</span>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-4 rounded-2xl text-white font-bold text-[15px] transition-opacity"
          style={{
            background: canSave ? TERRACOTTA : "oklch(0.80 0 0)",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              저장 중...
            </span>
          ) : "저장하기"}
        </button>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          닉네임은 신청서 성함으로 사용됩니다.<br />
          변경 시 이전에 제출한 신청서에는 영향을 주지 않습니다.
        </p>
      </div>
    </div>
  );
}
