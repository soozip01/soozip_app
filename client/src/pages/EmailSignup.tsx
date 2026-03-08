/**
 * SOOZIP 이메일 회원가입 페이지
 * 디자인 참조: 오늘의집 이메일 회원가입 화면 (4번째 첨부 이미지)
 * - 이름, 이메일 인증, 비밀번호, 별명
 * - 약관 동의 (전체 동의, 만 14세, 이용약관, 개인정보, 마케팅)
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function EmailSignup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "nickname">("form");

  // 폼 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // 약관 동의
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // 전체 동의 토글
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeAge(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  // 개별 동의 변경 시 전체 동의 상태 업데이트
  useEffect(() => {
    setAgreeAll(agreeAge && agreeTerms && agreePrivacy && agreeMarketing);
  }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

  // 닉네임 중복 확인
  const checkNicknameQuery = trpc.auth.checkNickname.useQuery(
    { nickname },
    { enabled: false }
  );

  const handleCheckNickname = async () => {
    if (nickname.length < 2) {
      toast.error("닉네임은 2자 이상 입력해주세요.");
      return;
    }
    setNicknameStatus("checking");
    const result = await checkNicknameQuery.refetch();
    if (result.data?.available) {
      setNicknameStatus("available");
      toast.success("사용 가능한 별명입니다.");
    } else {
      setNicknameStatus("taken");
      toast.error("이미 사용 중인 별명입니다.");
    }
  };

  // 이메일 회원가입
  const signupMutation = trpc.auth.emailSignup.useMutation({
    onSuccess: () => {
      toast.success("회원가입이 완료되었습니다!");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("이름을 입력해주세요."); return; }
    if (!email.trim()) { toast.error("이메일을 입력해주세요."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("올바른 이메일 형식을 입력해주세요."); return; }
    if (password.length < 8) { toast.error("비밀번호는 8자 이상이어야 합니다."); return; }
    if (password !== passwordConfirm) { toast.error("비밀번호가 일치하지 않습니다."); return; }
    if (!agreeAge) { toast.error("만 14세 이상 동의가 필요합니다."); return; }
    if (!agreeTerms) { toast.error("이용약관 동의가 필요합니다."); return; }
    if (!agreePrivacy) { toast.error("개인정보 처리방침 동의가 필요합니다."); return; }
    setStep("nickname");
  };

  const handleSignup = () => {
    if (nicknameStatus !== "available") {
      toast.error("별명 중복 확인을 먼저 해주세요.");
      return;
    }
    signupMutation.mutate({
      email,
      password,
      nickname,
      termsAgreed: agreeTerms,
      privacyAgreed: agreePrivacy,
      marketingAgreed: agreeMarketing,
      ageAgreed: agreeAge,
    });
  };

  if (step === "nickname") {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-3">
          <button onClick={() => setStep("form")} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">추가 정보 입력</h1>
        </header>

        <div className="flex flex-col flex-1 px-6 pt-6 pb-10">
          {/* 이메일 표시 */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-1">이메일</p>
            <p className="text-sm font-medium text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">{email}</p>
          </div>

          {/* 닉네임 */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">별명</label>
            <p className="text-xs text-gray-400 mb-2">다른 유저와 겹치지 않도록 별명을 입력해주세요. (2~20자)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setNicknameStatus("idle"); }}
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
                {nicknameStatus === "checking" ? "확인 중..." : "사용하기"}
              </button>
            </div>
            {nicknameStatus === "available" && (
              <p className="text-xs text-green-600 mt-1.5">✓ 사용 가능한 별명입니다.</p>
            )}
            {nicknameStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1.5">이미 사용 중인 별명입니다.</p>
            )}
            {nicknameStatus === "idle" && nickname.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">별명은 언제든 수정할 수 있습니다.</p>
            )}
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={handleSignup}
              disabled={nicknameStatus !== "available" || signupMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {signupMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  가입 중...
                </span>
              ) : "회원가입 완료"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3">
        <button onClick={() => navigate("/login")} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">이메일로 회원가입</h1>
      </header>

      <form onSubmit={handleFormNext} className="flex flex-col flex-1 px-6 pt-4 pb-10 space-y-4">
        {/* 이름 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">이메일</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
              autoComplete="email"
            />
            <button
              type="button"
              onClick={() => toast.info("이메일 인증 기능 준비 중입니다.")}
              className="px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 whitespace-nowrap hover:bg-gray-50 transition-colors"
            >
              이메일 인증하기
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (8자 이상)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
            autoComplete="new-password"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">비밀번호 확인</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
            autoComplete="new-password"
          />
        </div>

        {/* 별명 (도움말) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">별명 (닉네임)</label>
          <input
            type="text"
            value={name}
            readOnly
            placeholder="다음 단계에서 설정합니다"
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* 약관 동의 */}
        <div className="pt-2 space-y-3">
          {/* 전체 동의 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeAll}
              onChange={(e) => handleAgreeAll(e.target.checked)}
              className="w-4 h-4 rounded accent-gray-900"
            />
            <span className="text-sm font-semibold text-gray-900">약관 전체동의 (선택항목에 대한 동의 포함)</span>
          </label>

          <div className="h-px bg-gray-100" />

          {/* 만 14세 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={agreeAge} onChange={(e) => setAgreeAge(e.target.checked)} className="w-4 h-4 rounded accent-gray-900" />
            <span className="text-sm text-gray-700">만 14세 이상입니다. <span className="text-gray-400">(필수)</span></span>
          </label>

          {/* 이용약관 */}
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 rounded accent-gray-900" />
              <span className="text-sm text-gray-700">이용약관 <span className="text-gray-400">(필수)</span></span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </label>

          {/* 개인정보 마케팅 */}
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="w-4 h-4 rounded accent-gray-900" />
              <span className="text-sm text-gray-700">개인정보 마케팅 활용 동의 <span className="text-gray-400">(선택)</span></span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </label>

          {/* 마케팅 수신 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} className="w-4 h-4 rounded accent-gray-900 mt-0.5" />
            <span className="text-sm text-gray-700 leading-relaxed">이벤트, 구매, 특가 알림 메일, 앱푸시 및 SMS 등 수신 <span className="text-gray-400">(선택)</span></span>
          </label>
        </div>

        {/* 회원가입 버튼 */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90"
          >
            회원가입 완료
          </button>
        </div>
      </form>
    </div>
  );
}
