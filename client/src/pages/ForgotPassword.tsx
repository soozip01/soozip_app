/**
 * SOOZIP 비밀번호 찾기 페이지
 * 3단계 흐름: 이메일 입력 → 인증 코드 확인 → 새 비밀번호 설정
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Step = "email" | "code" | "password";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("email");

  // 이메일 단계
  const [email, setEmail] = useState("");

  // 코드 단계
  const [code, setCode] = useState("");
  const [codeTimer, setCodeTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 새 비밀번호 단계
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setCodeTimer(600);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCodeTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 1단계: 비밀번호 재설정 코드 발송
  const sendResetMutation = trpc.auth.sendPasswordReset.useMutation({
    onSuccess: () => {
      setStep("code");
      startTimer();
      toast.success("인증 코드가 발송되었습니다. 이메일을 확인해주세요. (10분 유효)");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 2단계: 인증 코드 검증 후 비밀번호 입력 단계로 이동
  const verifyCodeMutation = trpc.auth.verifyEmailCode.useMutation({
    onSuccess: () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep("password");
      toast.success("인증이 확인되었습니다. 새 비밀번호를 입력해주세요.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 3단계: 비밀번호 재설정
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    sendResetMutation.mutate({ email });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("6자리 인증 코드를 입력해주세요.");
      return;
    }
    verifyCodeMutation.mutate({ email, code });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    resetPasswordMutation.mutate({ email, code, newPassword });
  };

  const handleResendCode = () => {
    sendResetMutation.mutate({ email });
  };

  // 단계 인디케이터
  const steps = [
    { key: "email", label: "이메일 입력" },
    { key: "code", label: "코드 확인" },
    { key: "password", label: "비밀번호 변경" },
  ];
  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3">
        <button
          onClick={() => {
            if (step === "email") navigate("/login");
            else if (step === "code") setStep("email");
            else setStep("code");
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">비밀번호 찾기</h1>
      </header>

      {/* 단계 인디케이터 */}
      <div className="flex items-center justify-center gap-2 px-6 py-3">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
              idx < currentStepIndex
                ? "bg-gray-900 text-white"
                : idx === currentStepIndex
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              {idx < currentStepIndex ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            <span className={`text-xs ${idx === currentStepIndex ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-6 h-px ${idx < currentStepIndex ? "bg-gray-900" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col flex-1 px-6 pt-4 pb-10">

        {/* ─── 1단계: 이메일 입력 ─── */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="flex flex-col flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 입력해주세요</h2>
              <p className="text-sm text-gray-500">가입 시 사용한 이메일로 인증 코드를 발송해드립니다.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="mt-auto pt-6">
              <button
                type="submit"
                disabled={sendResetMutation.isPending || !email.trim()}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {sendResetMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    발송 중...
                  </span>
                ) : "인증 코드 발송"}
              </button>
            </div>
          </form>
        )}

        {/* ─── 2단계: 인증 코드 확인 ─── */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="flex flex-col flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">인증 코드를 입력해주세요</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{email}</span>으로 발송된 6자리 코드를 입력해주세요.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">인증 코드</label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6자리 코드 입력"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400 tracking-widest"
                />
                {codeTimer > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500 font-medium">
                    {formatTimer(codeTimer)}
                  </span>
                )}
              </div>
              {codeTimer === 0 && (
                <p className="text-xs text-red-500 mt-1">인증 코드가 만료되었습니다.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={sendResetMutation.isPending}
              className="text-sm text-gray-500 underline underline-offset-2 text-left mb-4"
            >
              {sendResetMutation.isPending ? "재발송 중..." : "코드를 받지 못하셨나요? 재발송"}
            </button>

            <div className="mt-auto pt-6">
              <button
                type="submit"
                disabled={verifyCodeMutation.isPending || code.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {verifyCodeMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    확인 중...
                  </span>
                ) : "확인"}
              </button>
            </div>
          </form>
        )}

        {/* ─── 3단계: 새 비밀번호 설정 ─── */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} className="flex flex-col flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">새 비밀번호를 설정해주세요</h2>
              <p className="text-sm text-gray-500">기존 비밀번호와 다른 새로운 비밀번호를 입력해주세요.</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (8자 이상)"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="새 비밀번호 확인"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
              />
              {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
              {newPasswordConfirm && newPassword === newPasswordConfirm && newPassword.length >= 8 && (
                <p className="text-xs text-green-600 mt-1">✓ 비밀번호가 일치합니다.</p>
              )}
            </div>

            <div className="mt-auto pt-6">
              <button
                type="submit"
                disabled={
                  resetPasswordMutation.isPending ||
                  newPassword.length < 8 ||
                  newPassword !== newPasswordConfirm
                }
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {resetPasswordMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    변경 중...
                  </span>
                ) : "비밀번호 변경 완료"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
