/**
 * SOOZIP 이메일 로그인 페이지
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

export default function EmailLogin() {
  const [, navigate] = useLocation();
  const { login } = useSoozipAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.auth.emailLogin.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.nickname}님, 환영합니다!`);
      login(
        {
          id: data.userId,
          nickname: data.nickname,
          email: data.email ?? email,
          provider: "email",
          profileImageUrl: data.profileImageUrl ?? null,
        },
        data.accessToken,
      );
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate("/login")}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 mx-auto pr-8">이메일로 로그인</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-6 pt-6 pb-10 space-y-4">
        {/* 이메일 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400"
            autoComplete="email"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">비밀번호</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400 pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 비밀번호 찾기 링크 */}
        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              로그인 중...
            </span>
          ) : "로그인"}
        </button>

        {/* 회원가입 링크 */}
        <div className="text-center pt-2">
          <span className="text-sm text-gray-500">아직 회원이 아니신가요? </span>
          <button
            type="button"
            onClick={() => navigate("/auth/email-signup")}
            className="text-sm font-bold text-gray-900 underline"
          >
            이메일로 회원가입
          </button>
        </div>
      </form>
    </div>
  );
}
