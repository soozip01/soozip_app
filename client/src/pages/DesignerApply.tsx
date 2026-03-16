import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.55 0.22 32)";
const STYLING_TYPES = ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"] as const;
const CAREER_OPTIONS = ["1년 미만", "1~3년", "3~5년", "5~10년", "10년 이상"];

export default function DesignerApply() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    phone: "",
    bio: "",
    specialties: [] as string[],
    career: "",
    portfolioDescription: "",
    applyReason: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const applyDesigner = trpc.designer.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message: string }) => toast.error(err.message),
  });

  const toggleSpecialty = (type: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(type)
        ? f.specialties.filter(s => s !== type)
        : [...f.specialties, type],
    }));
  };

  const handleSubmit = () => {
    if (!form.nickname || !form.email || form.specialties.length === 0) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }
    if (!form.agreeTerms || !form.agreePrivacy) {
      toast.error("이용약관과 개인정보처리방침에 동의해주세요");
      return;
    }
    const applyReason = [
      form.career ? `경력: ${form.career}` : "",
      form.portfolioDescription ? `포트폴리오: ${form.portfolioDescription}` : "",
    ].filter(Boolean).join("\n") || "입점 신청";
    applyDesigner.mutate({
      nickname: form.nickname,
      email: form.email,
      bio: form.bio || undefined,
      specialties: form.specialties,
      applyReason,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "oklch(0.95 0.05 32)" }}
        >
          <CheckCircle2 size={40} style={{ color: TERRACOTTA }} />
        </div>
        <h2 className="font-bold text-xl mb-2">입점 신청이 완료되었습니다!</h2>
        <p className="text-sm text-muted-foreground mb-2">
          수집 운영팀에서 신청 내용을 검토 후<br />
          이메일로 결과를 안내드립니다.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          보통 3~5 영업일 내에 결과를 안내드립니다
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: TERRACOTTA }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/designers")} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">디자이너 입점 신청</h1>
          <div className="w-8" />
        </div>
        {/* 진행 바 */}
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{ background: s <= step ? TERRACOTTA : "#e5e5e5" }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{step} / 3 단계</p>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* STEP 1: 기본 정보 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">기본 정보를 입력해주세요</h2>
              <p className="text-xs text-muted-foreground">수집 운영팀이 검토 시 사용됩니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                닉네임 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <input
                type="text"
                placeholder="활동할 닉네임을 입력해주세요"
                value={form.nickname}
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                이메일 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <input
                type="email"
                placeholder="연락받을 이메일 주소"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">연락처 (선택)</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">한 줄 소개 (선택)</label>
              <input
                type="text"
                placeholder="고객에게 보여질 한 줄 소개를 입력해주세요"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                maxLength={100}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/100</p>
            </div>
          </div>
        )}

        {/* STEP 2: 전문 분야 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">전문 분야를 선택해주세요</h2>
              <p className="text-xs text-muted-foreground">중복 선택 가능합니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                스타일링 타입 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <div className="space-y-2">
                {STYLING_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleSpecialty(type)}
                    className="w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-sm text-left transition-colors"
                    style={
                      form.specialties.includes(type)
                        ? { borderColor: TERRACOTTA, background: "oklch(0.97 0.02 32)" }
                        : { borderColor: "#e5e5e5" }
                    }
                  >
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                      style={
                        form.specialties.includes(type)
                          ? { borderColor: TERRACOTTA, background: TERRACOTTA }
                          : { borderColor: "#ccc" }
                      }
                    >
                      {form.specialties.includes(type) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">경력</label>
              <div className="grid grid-cols-3 gap-2">
                {CAREER_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, career: c }))}
                    className="py-2.5 rounded-xl text-sm border transition-colors"
                    style={
                      form.career === c
                        ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                        : { borderColor: "#e5e5e5", color: "#555" }
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 포트폴리오 및 약관 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">포트폴리오 및 약관 동의</h2>
              <p className="text-xs text-muted-foreground">승인 후 마이페이지에서 직접 등록하실 수 있습니다</p>
            </div>

            {/* 포트폴리오 안내 */}
            <div className="bg-[#f8f8f8] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">포트폴리오 등록</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                입점 승인 후 마이페이지 → 디자이너 프로필에서<br />
                포트폴리오 사진을 직접 등록하실 수 있습니다.
              </p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">포트폴리오 소개 (선택)</label>
                <textarea
                  placeholder="보유한 포트폴리오에 대해 간략히 설명해주세요"
                  value={form.portfolioDescription}
                  onChange={e => setForm(f => ({ ...f, portfolioDescription: e.target.value }))}
                  rows={4}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none bg-white"
                />
              </div>
            </div>

            {/* 수집 디자이너 규칙 안내 */}
            <div
              className="rounded-xl px-4 py-3 border"
              style={{ background: "oklch(0.97 0.02 32)", borderColor: "oklch(0.85 0.08 32)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: TERRACOTTA }}>수집 디자이너 규칙</p>
              <ul className="text-xs text-foreground/70 space-y-1">
                <li>• 모든 스타일링 서비스는 <strong>무료</strong>로 제공됩니다</li>
                <li>• 수집이 정한 스타일링 타입 내에서 서비스를 제공합니다</li>
                <li>• 고객과의 직거래 또는 별도 금전 수수는 금지됩니다</li>
                <li>• 수집의 브랜드 가이드라인을 준수해야 합니다</li>
              </ul>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3">
              {[
                { key: "agreeTerms", label: "이용약관에 동의합니다 (필수)" },
                { key: "agreePrivacy", label: "개인정보처리방침에 동의합니다 (필수)" },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key as keyof typeof f] }))}
                  className="w-full flex items-center gap-3 text-sm text-left"
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                    style={
                      form[item.key as keyof typeof form]
                        ? { borderColor: TERRACOTTA, background: TERRACOTTA }
                        : { borderColor: "#ccc" }
                    }
                  >
                    {form[item.key as keyof typeof form] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-background border-t border-border">
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && (!form.nickname || !form.email)) {
                toast.error("닉네임과 이메일을 입력해주세요");
                return;
              }
              if (step === 2 && form.specialties.length === 0) {
                toast.error("스타일링 타입을 하나 이상 선택해주세요");
                return;
              }
              setStep(s => s + 1);
            }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: TERRACOTTA }}
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={applyDesigner.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60"
            style={{ background: TERRACOTTA }}
          >
            {applyDesigner.isPending ? "신청 중..." : "입점 신청하기"}
          </button>
        )}
      </div>
    </div>
  );
}
