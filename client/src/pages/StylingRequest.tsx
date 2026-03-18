/* SOOZIP Design: Japandi Minimalism - Home Styling Request Page
 * Professional styling service application form
 */
import { useState } from "react";
import { ArrowLeft, Home, CheckCircle, Camera, Palette, Sofa } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const ROOM_TYPES = ["거실", "침실", "주방/다이닝", "욕실", "서재/홈오피스", "현관", "기타"];
const STYLE_TYPES = ["미니멀/모던", "내추럴/보헤미안", "스칸디나비안", "클래식/앤틱", "인더스트리얼", "기타"];
const BUDGET_RANGES = ["50만원 이하", "50-100만원", "100-200만원", "200-300만원", "300만원 이상"];

const SERVICES = [
  {
    icon: Camera,
    title: "스타일링 촬영",
    desc: "전문 스타일리스트가 직접 방문하여 공간을 연출하고 촬영합니다",
  },
  {
    icon: Palette,
    title: "컬러 컨설팅",
    desc: "공간에 맞는 색상 팔레트와 소품 배치를 제안합니다",
  },
  {
    icon: Sofa,
    title: "가구/소품 큐레이션",
    desc: "SOOZIP 입점 브랜드의 제품으로 맞춤 스타일링을 제안합니다",
  },
];

export default function StylingRequest() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    roomType: "",
    styleType: "",
    budget: "",
    description: "",
    preferredDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.name || !form.phone) {
        toast.error("이름과 연락처를 입력해주세요.");
        return;
      }
    }
    if (step === 2) {
      if (!form.roomType || !form.styleType) {
        toast.error("공간 유형과 스타일을 선택해주세요.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.budget) {
      toast.error("예산 범위를 선택해주세요.");
      return;
    }
    setSubmitted(true);
    toast.success("스타일링 신청이 완료되었습니다!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <CheckCircle size={64} className="text-primary mx-auto" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-foreground">신청 완료!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            홈 스타일링 신청이 접수되었습니다.<br />
            담당 스타일리스트가 영업일 기준 2일 내에<br />
            연락드리겠습니다.
          </p>
          <div className="bg-secondary rounded-2xl p-4 text-left mt-4">
            <p className="text-xs font-semibold text-foreground mb-2">신청 정보</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">이름: {form.name}</p>
              <p className="text-xs text-muted-foreground">연락처: {form.phone}</p>
              <p className="text-xs text-muted-foreground">공간: {form.roomType}</p>
              <p className="text-xs text-muted-foreground">스타일: {form.styleType}</p>
              <p className="text-xs text-muted-foreground">예산: {form.budget}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            홈으로 돌아가기
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep((p) => p - 1) : navigate("/")}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">홈 스타일링 신청</span>
          <span className="ml-auto text-xs text-muted-foreground">{step}/3</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="relative rounded-2xl overflow-hidden h-40">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-1-DpQpCtKnhZ9TEbw6YMnHqr.webp"
                alt="스타일링 서비스"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                <Home size={32} strokeWidth={1.5} className="mb-2" />
                <p className="font-bold text-lg">홈 스타일링 서비스</p>
                <p className="text-xs opacity-90">전문 스타일리스트가 직접 방문합니다</p>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 bg-secondary rounded-xl p-4">
                  <Icon size={20} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">기본 정보 입력</p>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="이름을 입력해주세요"
                  className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">연락처 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">주소 (선택)</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="서울시 강남구..."
                  className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              다음 단계
            </button>
          </div>
        )}

        {/* Step 2: Space & Style */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">공간 유형 선택 *</p>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_TYPES.map((room) => (
                  <button
                    key={room}
                    onClick={() => setForm((p) => ({ ...p, roomType: room }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                      form.roomType === room
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">원하는 스타일 *</p>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_TYPES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setForm((p) => ({ ...p, styleType: style }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                      form.styleType === style
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">추가 요청사항 (선택)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="원하는 분위기나 특별한 요청사항을 알려주세요"
                rows={3}
                className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              다음 단계
            </button>
          </div>
        )}

        {/* Step 3: Budget & Date */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">예산 범위 *</p>
              <div className="space-y-2">
                {BUDGET_RANGES.map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, budget }))}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left ${
                      form.budget === budget
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">희망 방문일 (선택)</label>
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>

            {/* Summary */}
            <div className="bg-secondary rounded-2xl p-4">
              <p className="text-xs font-semibold text-foreground mb-3">신청 요약</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">이름</span>
                  <span className="text-xs font-medium text-foreground">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">공간</span>
                  <span className="text-xs font-medium text-foreground">{form.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">스타일</span>
                  <span className="text-xs font-medium text-foreground">{form.styleType}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              스타일링 신청하기
            </button>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
