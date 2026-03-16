import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.55 0.22 32)";

const STYLING_TYPES = ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"] as const;
const ROOM_TYPES = ["거실", "침실", "주방/다이닝", "서재", "전체 공간", "기타"];
const ROOM_SIZES = ["10평 미만", "10~15평", "15~20평", "20~25평", "25~30평", "30평 이상"];
const BUDGETS = ["100만원 미만", "100~200만원", "200~300만원", "300~500만원", "500만원 이상", "미정"];

export default function StylingRequestForm() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1); // 1: 기본정보, 2: 공간정보, 3: 요청사항, 4: 완료
  const [form, setForm] = useState({
    requesterNickname: "",
    requesterEmail: "",
    stylingType: "" as typeof STYLING_TYPES[number] | "",
    roomType: "",
    roomSize: "",
    budget: "",
    description: "",
    preferredDate: "",
  });

  const createRequest = trpc.stylingRequest.create.useMutation({
    onSuccess: () => setStep(4),
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.requesterNickname || !form.stylingType) {
      toast.error("필수 항목을 입력해주세요");
      return;
    }
    createRequest.mutate({
      requesterNickname: form.requesterNickname,
      requesterEmail: form.requesterEmail || undefined,
      stylingType: form.stylingType as typeof STYLING_TYPES[number],
      roomType: form.roomType || undefined,
      roomSize: form.roomSize || undefined,
      budget: form.budget || undefined,
      description: form.description || undefined,
      preferredDate: form.preferredDate || undefined,
    });
  };

  const TOTAL_STEPS = 3;

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
        <p className="text-xs text-muted-foreground mb-8">
          보통 1~2 영업일 내에 연락드립니다
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: TERRACOTTA }}
        >
          홈으로 돌아가기
        </button>
        <button
          onClick={() => navigate("/styling")}
          className="w-full py-3 rounded-2xl text-sm mt-2"
          style={{ color: TERRACOTTA }}
        >
          스타일링 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1 as never)} className="p-1">
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
        {/* STEP 1: 기본 정보 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">기본 정보를 입력해주세요</h2>
              <p className="text-xs text-muted-foreground">디자이너가 연락드릴 때 사용됩니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                닉네임 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <input
                type="text"
                placeholder="닉네임을 입력해주세요"
                value={form.requesterNickname}
                onChange={e => setForm(f => ({ ...f, requesterNickname: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[oklch(0.55_0.22_32)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">이메일 (선택)</label>
              <input
                type="email"
                placeholder="연락받을 이메일 주소"
                value={form.requesterEmail}
                onChange={e => setForm(f => ({ ...f, requesterEmail: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[oklch(0.55_0.22_32)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                스타일링 타입 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <div className="space-y-2">
                {STYLING_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setForm(f => ({ ...f, stylingType: type }))}
                    className="w-full flex items-center gap-3 border rounded-xl px-4 py-3 text-sm text-left transition-colors"
                    style={
                      form.stylingType === type
                        ? { borderColor: TERRACOTTA, background: "oklch(0.97 0.02 32)" }
                        : { borderColor: "#e5e5e5" }
                    }
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={
                        form.stylingType === type
                          ? { borderColor: TERRACOTTA, background: TERRACOTTA }
                          : { borderColor: "#ccc" }
                      }
                    >
                      {form.stylingType === type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-medium">{type}</span>
                  </button>
                ))}
              </div>
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
              <label className="text-sm font-medium mb-2 block">공간 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setForm(f => ({ ...f, roomType: type }))}
                    className="py-2.5 rounded-xl text-sm border transition-colors"
                    style={
                      form.roomType === type
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
          </div>
        )}

        {/* STEP 3: 요청사항 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">요청사항을 알려주세요</h2>
              <p className="text-xs text-muted-foreground">원하는 스타일이나 특별 요청사항을 적어주세요</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">희망 일정 (선택)</label>
              <input
                type="text"
                placeholder="예: 4월 중순, 5월 첫째 주 등"
                value={form.preferredDate}
                onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-[oklch(0.55_0.22_32)]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">요청사항 (선택)</label>
              <textarea
                placeholder="원하는 스타일, 현재 가구 상황, 특별 요청사항 등을 자유롭게 작성해주세요"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={6}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[oklch(0.55_0.22_32)]"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{form.description.length}/1000</p>
            </div>

            {/* 신청 내용 요약 */}
            <div className="bg-[#f8f8f8] rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">신청 내용 확인</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">닉네임</span>
                <span className="font-medium">{form.requesterNickname}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">스타일링 타입</span>
                <span className="font-medium">{form.stylingType}</span>
              </div>
              {form.roomType && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">공간 유형</span>
                  <span className="font-medium">{form.roomType}</span>
                </div>
              )}
              {form.roomSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">평수</span>
                  <span className="font-medium">{form.roomSize}</span>
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
              if (step === 1 && (!form.requesterNickname || !form.stylingType)) {
                toast.error("닉네임과 스타일링 타입을 선택해주세요");
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
            disabled={createRequest.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60"
            style={{ background: TERRACOTTA }}
          >
            {createRequest.isPending ? "신청 중..." : "신청서 제출하기"}
          </button>
        )}
      </div>
    </div>
  );
}
