import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.55 0.22 32)";
const STYLING_TYPES = ["배치솔루션", "풀스타일링(온라인)", "풀스타일링(오프라인)"] as const;
const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function BookingCalendar() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const designerId = params.get("designerId") ? parseInt(params.get("designerId")!) : undefined;
  const designerName = params.get("designerName") ? decodeURIComponent(params.get("designerName")!) : undefined;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"calendar" | "info" | "confirm">("calendar");
  const [form, setForm] = useState({
    bookerNickname: "",
    bookerEmail: "",
    stylingType: "" as typeof STYLING_TYPES[number] | "",
    roomSize: "",
    description: "",
  });

  const createBooking = trpc.stylingBooking.create.useMutation({
    onSuccess: (data) => {
      // 예약 생성 후 설문으로 이동
      const surveyUrl = `https://soozipland-j3tut3mq.manus.space/survey?bookingId=${data.bookingId}&nickname=${encodeURIComponent(form.bookerNickname)}&type=${encodeURIComponent(form.stylingType)}`;
      navigate(`/booking/complete?surveyUrl=${encodeURIComponent(surveyUrl)}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewYear, viewMonth, firstDay, daysInMonth]);

  const isPastDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayStart;
  };

  const formatDate = (day: number) => {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!form.bookerNickname || !form.stylingType || !selectedDate) {
      toast.error("필수 항목을 입력해주세요");
      return;
    }
    createBooking.mutate({
      bookerNickname: form.bookerNickname,
      bookerEmail: form.bookerEmail || undefined,
      stylingType: form.stylingType as typeof STYLING_TYPES[number],
      designerId,
      preferredDate: selectedDate,
      preferredTime: selectedTime || undefined,
      roomSize: form.roomSize || undefined,
      description: form.description || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step === "calendar" ? navigate(-1 as never) : setStep(s => s === "info" ? "calendar" : "info")}
            className="p-1"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">
            {step === "calendar" ? "날짜 선택" : step === "info" ? "예약 정보 입력" : "예약 확인"}
          </h1>
          <div className="w-8" />
        </div>
        {/* 진행 바 */}
        <div className="px-4 pb-3 flex gap-1">
          {["calendar", "info", "confirm"].map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                background: ["calendar", "info", "confirm"].indexOf(step) >= i ? TERRACOTTA : "#e5e5e5"
              }}
            />
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* 디자이너 선택 시 표시 */}
        {designerName && (
          <div
            className="rounded-xl px-4 py-2.5 mb-4 text-sm font-medium flex items-center gap-2"
            style={{ background: "oklch(0.97 0.02 32)", color: TERRACOTTA }}
          >
            <Calendar size={14} />
            {designerName} 디자이너와 예약
          </div>
        )}

        {/* STEP 1: 캘린더 */}
        {step === "calendar" && (
          <div>
            {/* 월 이동 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
                  else setViewMonth(m => m - 1);
                }}
                className="p-2 rounded-full hover:bg-[#f0f0f0]"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-bold text-base">{viewYear}년 {MONTH_NAMES[viewMonth]}</span>
              <button
                onClick={() => {
                  if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
                  else setViewMonth(m => m + 1);
                }}
                className="p-2 rounded-full hover:bg-[#f0f0f0]"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium py-1"
                  style={{ color: i === 0 ? "#e53e3e" : i === 6 ? "#3182ce" : "#666" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = formatDate(day);
                const isPast = isPastDate(day);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === formatDate(today.getDate()) &&
                  viewYear === today.getFullYear() && viewMonth === today.getMonth();
                const dayOfWeek = (firstDay + day - 1) % 7;

                return (
                  <button
                    key={day}
                    disabled={isPast}
                    onClick={() => setSelectedDate(dateStr)}
                    className="aspect-square flex items-center justify-center rounded-full text-sm transition-colors mx-auto w-9 h-9"
                    style={
                      isSelected
                        ? { background: TERRACOTTA, color: "white", fontWeight: 700 }
                        : isPast
                        ? { color: "#ccc", cursor: "not-allowed" }
                        : isToday
                        ? { border: `1.5px solid ${TERRACOTTA}`, color: TERRACOTTA, fontWeight: 600 }
                        : { color: dayOfWeek === 0 ? "#e53e3e" : dayOfWeek === 6 ? "#3182ce" : "inherit" }
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* 시간 선택 */}
            {selectedDate && (
              <div className="mt-5">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  희망 시간 선택 (선택사항)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(t => t === time ? null : time)}
                      className="py-2 rounded-xl text-xs border transition-colors"
                      style={
                        selectedTime === time
                          ? { borderColor: TERRACOTTA, color: TERRACOTTA, background: "oklch(0.97 0.02 32)", fontWeight: 600 }
                          : { borderColor: "#e5e5e5", color: "#555" }
                      }
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 예약 정보 입력 */}
        {step === "info" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-base mb-1">예약 정보를 입력해주세요</h2>
              <p className="text-xs text-muted-foreground">디자이너가 연락드릴 때 사용됩니다</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                닉네임 <span style={{ color: TERRACOTTA }}>*</span>
              </label>
              <input
                type="text"
                placeholder="닉네임을 입력해주세요"
                value={form.bookerNickname}
                onChange={e => setForm(f => ({ ...f, bookerNickname: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">이메일 (선택)</label>
              <input
                type="email"
                placeholder="연락받을 이메일 주소"
                value={form.bookerEmail}
                onChange={e => setForm(f => ({ ...f, bookerEmail: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none"
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

            <div>
              <label className="text-sm font-medium mb-1.5 block">요청사항 (선택)</label>
              <textarea
                placeholder="원하는 스타일, 현재 가구 상황, 특별 요청사항 등을 자유롭게 작성해주세요"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: 예약 확인 */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-base mb-1">예약 내용을 확인해주세요</h2>
              <p className="text-xs text-muted-foreground">확인 후 설문을 작성하면 예약이 완료됩니다</p>
            </div>

            <div className="bg-[#f8f8f8] rounded-2xl p-4 space-y-3">
              {designerName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">담당 디자이너</span>
                  <span className="font-medium">{designerName}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">희망 날짜</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              {selectedTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">희망 시간</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">스타일링 타입</span>
                <span className="font-medium">{form.stylingType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">닉네임</span>
                <span className="font-medium">{form.bookerNickname}</span>
              </div>
              {form.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">요청사항</span>
                  <p className="text-foreground/80 text-xs bg-white rounded-lg p-2">{form.description}</p>
                </div>
              )}
            </div>

            <div className="bg-[#fff8f5] rounded-xl px-4 py-3 border" style={{ borderColor: "oklch(0.85 0.08 32)" }}>
              <p className="text-xs" style={{ color: TERRACOTTA }}>
                <strong>다음 단계:</strong> 예약 후 설문을 작성해주세요.<br />
                설문 작성이 완료되면 최종 예약이 확정됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-background border-t border-border">
        {step === "calendar" && (
          <button
            onClick={() => {
              if (!selectedDate) { toast.error("날짜를 선택해주세요"); return; }
              setStep("info");
            }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: selectedDate ? TERRACOTTA : "#ccc" }}
          >
            다음
          </button>
        )}
        {step === "info" && (
          <button
            onClick={() => {
              if (!form.bookerNickname || !form.stylingType) {
                toast.error("닉네임과 스타일링 타입을 선택해주세요");
                return;
              }
              setStep("confirm");
            }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: TERRACOTTA }}
          >
            다음
          </button>
        )}
        {step === "confirm" && (
          <button
            onClick={handleSubmit}
            disabled={createBooking.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: TERRACOTTA }}
          >
            <CheckCircle2 size={18} />
            {createBooking.isPending ? "예약 중..." : "예약 후 설문 작성하기"}
          </button>
        )}
      </div>
    </div>
  );
}
