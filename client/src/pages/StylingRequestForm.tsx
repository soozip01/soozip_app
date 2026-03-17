/**
 * 스타일링 신청서 폼
 * - 로그인 사용자: userId + 닉네임 자동 입력, Supabase survey_submissions에 직접 저장
 * - 비로그인 사용자: 로그인 유도
 * - 제출 후 마이페이지 스타일링 탭에서 STEP 진행 현황 자동 연동
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, CheckCircle2, LogIn, Lock } from "lucide-react";
import { toast } from "sonner";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "oklch(0.55 0.22 32)";

const STYLING_TYPES = [
  { value: "배치솔루션(가구 재배치 위주)", label: "배치솔루션", desc: "기존 가구 재배치 중심의 공간 최적화" },
  { value: "풀 스타일링(온라인)", label: "풀 스타일링 (온라인)", desc: "온라인으로 진행하는 전체 스타일링" },
  { value: "풀 스타일링(오프라인)", label: "풀 스타일링 (오프라인)", desc: "방문 상담부터 가구 세팅까지 전체 진행" },
] as const;

const HOUSING_TYPES = ["아파트", "오피스텔", "빌라/연립", "단독주택", "기타"];
const ROOM_SIZES = ["10평 미만", "10~15평", "15~20평", "20~25평", "25~30평", "30평 이상"];
const BUDGETS = ["100만원 미만", "100~200만원", "200~300만원", "300~500만원", "500만원 이상", "미정"];
const ACTIVITIES = ["요리", "독서", "재택근무", "운동", "홈파티", "반려동물", "육아", "취미활동"];

export default function StylingRequestForm() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const [step, setStep] = useState(1); // 1: 스타일링 타입, 2: 공간정보, 3: 라이프스타일, 4: 완료
  const [form, setForm] = useState({
    stylingType: "" as string,
    housingType: "",
    roomSize: "",
    budget: "",
    moveInDate: "",
    deadline: "",
    referenceNote: "",
    activities: [] as string[],
    existingFurniture: [] as string[],
    buyFurniture: [] as string[],
  });

  // 로그인 사용자 닉네임 자동 입력
  const userName = user?.nickname ?? "";
  const userId = user ? String(user.id) : "";

  const submitSurvey = trpc.survey.submit.useMutation({
    onSuccess: () => setStep(4),
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!isLoggedIn || !userId) {
      toast.error("로그인 후 신청서를 제출할 수 있습니다.");
      return;
    }
    if (!form.stylingType) {
      toast.error("스타일링 타입을 선택해주세요");
      return;
    }
    submitSurvey.mutate({
      userId,
      name: userName,
      stylingType: form.stylingType,
      housingType: form.housingType || undefined,
      roomSize: form.roomSize || undefined,
      budget: form.budget || undefined,
      moveInDate: form.moveInDate || undefined,
      deadline: form.deadline || undefined,
      referenceNote: form.referenceNote || undefined,
      activities: form.activities.length > 0 ? form.activities : undefined,
      existingFurniture: form.existingFurniture.length > 0 ? form.existingFurniture : undefined,
      buyFurniture: form.buyFurniture.length > 0 ? form.buyFurniture : undefined,
    });
  };

  const toggleActivity = (item: string) => {
    setForm(f => ({
      ...f,
      activities: f.activities.includes(item)
        ? f.activities.filter(a => a !== item)
        : [...f.activities, item],
    }));
  };

  const TOTAL_STEPS = 3;

  // 비로그인 사용자 안내
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "oklch(0.95 0.05 32)" }}
        >
          <Lock size={36} style={{ color: TERRACOTTA }} />
        </div>
        <h2 className="font-bold text-xl mb-2">로그인이 필요합니다</h2>
        <p className="text-sm text-muted-foreground mb-8">
          신청서 제출 후 마이페이지에서<br />스타일링 진행 현황을 확인할 수 있어요
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          style={{ background: TERRACOTTA }}
        >
          <LogIn size={18} />
          로그인 / 회원가입
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full py-3 rounded-2xl text-sm mt-2"
          style={{ color: TERRACOTTA }}
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 제출 완료 화면
  if (step === 4) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: "oklch(0.95 0.05 32)" }}
        >
          <CheckCircle2 size={40} style={{ color: TERRACOTTA }} />
        </div>
        <h2 className="font-bold text-xl mb-2">신청서가 등록되었습니다!</h2>
        <p className="text-sm text-muted-foreground mb-2">
          수집의 디자이너들이 신청서를 확인하고<br />직접 연락드릴 예정입니다.
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          보통 1~2 영업일 내에 연락드립니다
        </p>
        <p className="text-xs font-medium mb-8" style={{ color: TERRACOTTA }}>
          마이페이지 &gt; 스타일링 탭에서 진행 현황을 확인하세요
        </p>
        <button
          onClick={() => navigate("/my")}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: TERRACOTTA }}
        >
          마이페이지에서 확인하기
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-2xl text-sm mt-2"
          style={{ color: TERRACOTTA }}
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
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/styling")} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">스타일링 신청서 작성</h1>
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
          <p className="text-xs text-muted-foreground mt-1.5">{step} / {TOTAL_STEPS} 단계</p>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* STEP 1: 스타일링 타입 선택 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">희망하는 스타일링 타입을 선택해주세요</h2>
              <p className="text-xs text-muted-foreground">선택한 타입에 따라 진행 단계가 달라집니다</p>
            </div>

            {/* 신청인 성함 = 닉네임 고정 표시 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">신청인 성함</label>
                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="text-[11px] underline"
                  style={{ color: TERRACOTTA }}
                >
                  닉네임 변경하기
                </button>
              </div>
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl border"
                style={{ background: "oklch(0.97 0.02 32)", borderColor: "oklch(0.90 0.05 32)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm"
                  style={{ background: TERRACOTTA }}
                >
                  {userName.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900">{userName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">닉네임이 신청서 성함으로 자동 사용됩니다</p>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0"
                  style={{ background: "oklch(0.88 0.08 32)", color: TERRACOTTA }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  수정 불가
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                닉네임을 변경하려면 우측 상단의 '닉네임 변경하기'를 눌러주세요
              </p>
            </div>

            <div className="space-y-3">
              {STYLING_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setForm(f => ({ ...f, stylingType: type.value }))}
                  className="w-full flex items-start gap-3 border rounded-2xl px-4 py-4 text-left transition-all"
                  style={
                    form.stylingType === type.value
                      ? { borderColor: TERRACOTTA, background: "oklch(0.97 0.02 32)", borderWidth: "2px" }
                      : { borderColor: "#e5e5e5", borderWidth: "1.5px" }
                  }
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                    style={
                      form.stylingType === type.value
                        ? { borderColor: TERRACOTTA, background: TERRACOTTA }
                        : { borderColor: "#ccc" }
                    }
                  >
                    {form.stylingType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 공간 정보 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">공간 정보를 알려주세요</h2>
              <p className="text-xs text-muted-foreground">더 정확한 스타일링을 위해 필요합니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">주거 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {HOUSING_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setForm(f => ({ ...f, housingType: type }))}
                    className="py-2.5 rounded-xl text-sm border transition-colors"
                    style={
                      form.housingType === type
                        ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                        : { borderColor: "#e5e5e5", color: "#555" }
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">평수</label>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setForm(f => ({ ...f, roomSize: size }))}
                    className="py-2.5 rounded-xl text-sm border transition-colors"
                    style={
                      form.roomSize === size
                        ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                        : { borderColor: "#e5e5e5", color: "#555" }
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">가구 구매 예산 (선택)</label>
              <div className="grid grid-cols-2 gap-2">
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    onClick={() => setForm(f => ({ ...f, budget: b }))}
                    className="py-2.5 rounded-xl text-sm border transition-colors"
                    style={
                      form.budget === b
                        ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                        : { borderColor: "#e5e5e5", color: "#555" }
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">입주 예정일 (선택)</label>
              <input
                type="text"
                placeholder="예: 4월 중순, 5월 첫째 주 등"
                value={form.moveInDate}
                onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[oklch(0.55_0.22_32)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">완료 희망 시기 (선택)</label>
              <input
                type="text"
                placeholder="예: 6월 말까지, 빠를수록 좋음 등"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[oklch(0.55_0.22_32)]"
              />
            </div>
          </div>
        )}

        {/* STEP 3: 라이프스타일 & 요청사항 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">라이프스타일을 알려주세요</h2>
              <p className="text-xs text-muted-foreground">취향에 맞는 스타일링을 제안해 드립니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">주요 활동 (복수 선택 가능)</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className="px-3 py-1.5 rounded-full text-sm border transition-colors"
                    style={
                      form.activities.includes(activity)
                        ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                        : { borderColor: "#e5e5e5", color: "#555" }
                    }
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">참고 사항 (선택)</label>
              <textarea
                placeholder="원하는 스타일, 현재 가구 상황, 특별 요청사항 등을 자유롭게 작성해주세요"
                value={form.referenceNote}
                onChange={e => setForm(f => ({ ...f, referenceNote: e.target.value }))}
                rows={5}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[oklch(0.55_0.22_32)]"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.referenceNote.length}/500</p>
            </div>

            {/* 신청 내용 요약 */}
            <div className="bg-[#f8f8f8] rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">신청 내용 확인</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">신청자</span>
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">스타일링 타입</span>
                <span className="font-medium text-right max-w-[60%]">{form.stylingType}</span>
              </div>
              {form.housingType && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">주거 유형</span>
                  <span className="font-medium">{form.housingType}</span>
                </div>
              )}
              {form.roomSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">평수</span>
                  <span className="font-medium">{form.roomSize}</span>
                </div>
              )}
              {form.budget && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">예산</span>
                  <span className="font-medium">{form.budget}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-background border-t border-border">
        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !form.stylingType) {
                toast.error("스타일링 타입을 선택해주세요");
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
            disabled={submitSurvey.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60"
            style={{ background: TERRACOTTA }}
          >
            {submitSurvey.isPending ? "신청 중..." : "신청서 제출하기"}
          </button>
        )}
      </div>
    </div>
  );
}
