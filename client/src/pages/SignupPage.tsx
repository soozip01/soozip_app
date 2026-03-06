/* SOOZIP Design: Monochrome + Terracotta Orange - Signup Page
 * Step-based signup: 기본정보 → 약관동의
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.58 0.16 38)";

const TERMS = [
  { id: "all", label: "전체 동의", required: false, isAll: true },
  { id: "service", label: "[필수] 서비스 이용약관 동의", required: true },
  { id: "privacy", label: "[필수] 개인정보 수집 및 이용 동의", required: true },
  { id: "age", label: "[필수] 만 14세 이상 확인", required: true },
  { id: "marketing", label: "[선택] 마케팅 정보 수신 동의", required: false },
];

export default function SignupPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1); // 1: 기본정보, 2: 약관동의
  const [loading, setLoading] = useState(false);

  // 기본정보
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);

  // 약관
  const [agreed, setAgreed] = useState<Record<string, boolean>>({
    all: false, service: false, privacy: false, age: false, marketing: false,
  });

  const toggleAll = () => {
    const newVal = !agreed.all;
    setAgreed({ all: newVal, service: newVal, privacy: newVal, age: newVal, marketing: newVal });
  };

  const toggleTerm = (id: string) => {
    const next = { ...agreed, [id]: !agreed[id] };
    const allChecked = TERMS.filter(t => !t.isAll).every(t => next[t.id]);
    next.all = allChecked;
    setAgreed(next);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("이름을 입력해주세요."); return; }
    if (!email.trim()) { toast.error("이메일을 입력해주세요."); return; }
    if (!password.trim() || password.length < 8) { toast.error("비밀번호는 8자 이상 입력해주세요."); return; }
    if (password !== passwordConfirm) { toast.error("비밀번호가 일치하지 않습니다."); return; }
    setStep(2);
  };

  const handleSignup = async () => {
    if (!agreed.service || !agreed.privacy || !agreed.age) {
      toast.error("필수 약관에 동의해주세요.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("회원가입이 완료되었습니다! 로그인해주세요.");
    navigate("/login");
  };

  const pwMatch = passwordConfirm.length > 0 && password === passwordConfirm;
  const pwMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="px-4 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => step === 1 ? navigate("/login") : setStep(1)}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-foreground">회원가입</span>
        {/* 스텝 인디케이터 */}
        <div className="ml-auto flex items-center gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all"
              style={{
                width: s === step ? "20px" : "6px",
                height: "6px",
                background: s <= step ? TERRACOTTA : "oklch(0.85 0 0)",
              }}
            />
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-10">
        {/* STEP 1: 기본정보 */}
        {step === 1 && (
          <>
            <div className="mb-7">
              <h1 className="text-xl font-black text-foreground">기본 정보 입력</h1>
              <p className="text-sm text-muted-foreground mt-1">SOOZIP 회원이 되어보세요</p>
            </div>

            <form onSubmit={handleStep1} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground"
                  autoComplete="email"
                />
              </div>

              {/* 휴대폰 번호 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  휴대폰 번호 <span className="text-muted-foreground font-normal">(선택)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8자 이상 입력하세요"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground pr-12"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {showPw
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">비밀번호 확인</label>
                <div className="relative">
                  <input
                    type={showPwC ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`w-full px-4 py-3 rounded-lg border bg-background text-sm outline-none transition-colors placeholder:text-muted-foreground pr-12 ${
                      pwMismatch ? "border-destructive" : pwMatch ? "border-green-500" : "border-border focus:border-foreground"
                    }`}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPwC(!showPwC)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {showPwC
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
                {pwMismatch && <p className="text-xs text-destructive mt-1">비밀번호가 일치하지 않습니다.</p>}
                {pwMatch && <p className="text-xs text-green-600 mt-1">비밀번호가 일치합니다.</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90 mt-2"
                style={{ background: TERRACOTTA }}
              >
                다음
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-muted-foreground">이미 회원이신가요? </span>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-bold transition-colors"
                style={{ color: TERRACOTTA }}
              >
                로그인
              </button>
            </div>
          </>
        )}

        {/* STEP 2: 약관 동의 */}
        {step === 2 && (
          <>
            <div className="mb-7">
              <h1 className="text-xl font-black text-foreground">약관 동의</h1>
              <p className="text-sm text-muted-foreground mt-1">서비스 이용을 위한 약관에 동의해주세요</p>
            </div>

            <div className="space-y-0 border border-border rounded-xl overflow-hidden">
              {TERMS.map((term, idx) => (
                <div key={term.id}>
                  {idx > 0 && <div className="h-px bg-border" />}
                  <button
                    onClick={() => term.isAll ? toggleAll() : toggleTerm(term.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary ${
                      term.isAll ? "bg-secondary" : ""
                    }`}
                  >
                    {/* 체크박스 */}
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                      style={
                        agreed[term.id]
                          ? { background: TERRACOTTA, borderColor: TERRACOTTA }
                          : { borderColor: "oklch(0.8 0 0)" }
                      }
                    >
                      {agreed[term.id] && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${term.isAll ? "font-bold text-foreground" : "text-foreground"}`}>
                      {term.label}
                    </span>
                    {!term.isAll && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="ml-auto text-muted-foreground">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <button
                onClick={handleSignup}
                disabled={loading || !agreed.service || !agreed.privacy || !agreed.age}
                className="w-full py-3.5 rounded-lg font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: TERRACOTTA }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    처리 중...
                  </span>
                ) : "회원가입 완료"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
