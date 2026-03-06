/* SOOZIP Design: Monochrome + Terracotta Orange - Login Page
 * Clean, minimal login form with terracotta accent
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.58 0.16 38)";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    // 실제 인증 연동 예정 (현재 UI 구현)
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("로그인되었습니다.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="px-4 py-4 flex items-center">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors mr-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-4 pb-10">
        {/* 로고 */}
        <div className="mb-10">
          <div
            className="inline-block text-white px-4 py-2 rounded font-black text-xl tracking-widest mb-3"
            style={{ background: "oklch(0.08 0 0)" }}
          >
            SOOZIP
          </div>
          <h1 className="text-2xl font-black text-foreground leading-tight">
            로그인
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            스타일링 쇼핑몰 SOOZIP에 오신 것을 환영합니다
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground"
              autoComplete="email"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 비밀번호 찾기 */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => toast.info("비밀번호 찾기 기능이 준비 중입니다.")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ background: TERRACOTTA }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                로그인 중...
              </span>
            ) : "로그인"}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button
            onClick={() => toast.info("카카오 로그인 기능이 준비 중입니다.")}
            className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
            style={{ background: "#FEE500", color: "#191919" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.61 1.57 4.91 3.95 6.28L5 21l4.28-2.82c.89.18 1.8.27 2.72.27 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
          <button
            onClick={() => toast.info("네이버 로그인 기능이 준비 중입니다.")}
            className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
            style={{ background: "#03C75A", color: "white" }}
          >
            <span className="font-black text-base leading-none">N</span>
            네이버로 로그인
          </button>
          <button
            onClick={() => toast.info("Google 로그인 기능이 준비 중입니다.")}
            className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2.5 border border-border transition-colors hover:bg-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        </div>

        {/* 회원가입 링크 */}
        <div className="mt-8 text-center">
          <span className="text-sm text-muted-foreground">아직 회원이 아니신가요? </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-bold transition-colors"
            style={{ color: TERRACOTTA }}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
