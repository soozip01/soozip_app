/* SOOZIP Design: Japandi Minimalism - Brand Entry Page
 * Brand application form for vendors wanting to join the platform
 */
import { useState } from "react";
import { ArrowLeft, Building2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const BRAND_CATEGORIES = ["홈/인테리어", "패브릭/침구", "주방/식기", "욕실/위생", "조명/소품", "가구", "식물/가드닝", "기타"];

export default function BrandEntry() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    brandName: "",
    contactName: "",
    phone: "",
    email: "",
    category: "",
    website: "",
    description: "",
    agree: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandName || !form.contactName || !form.phone || !form.email || !form.category) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!form.agree) {
      toast.error("이용약관에 동의해주세요.");
      return;
    }
    setSubmitted(true);
    toast.success("입점 신청이 완료되었습니다!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <CheckCircle size={64} className="text-primary mx-auto" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-foreground">입점 신청 완료!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            입점 신청이 접수되었습니다.<br />
            검토 후 영업일 기준 3-5일 내에 연락드리겠습니다.
          </p>
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">입점 신청</span>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Hero */}
        <div className="bg-secondary rounded-2xl p-6 mb-6 text-center">
          <Building2 size={40} className="text-primary mx-auto mb-3" strokeWidth={1.5} />
          <h1 className="text-lg font-bold text-foreground mb-2">SOOZIP 입점 신청</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            라이프스타일 브랜드를 운영하고 계신가요?<br />
            SOOZIP과 함께 성장해보세요.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { title: "스타일링 촬영", desc: "전문 스타일리스트의 제품 촬영 지원" },
            { title: "공동구매", desc: "대량 판매를 통한 매출 증대" },
            { title: "AI 추천", desc: "AI 기반 맞춤 상품 추천 노출" },
          ].map((benefit, i) => (
            <div key={i} className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-foreground mb-1">{benefit.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">브랜드명 *</label>
            <input
              type="text"
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              placeholder="브랜드명을 입력해주세요"
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">담당자명 *</label>
            <input
              type="text"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              placeholder="담당자 이름"
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
            <label className="text-xs font-medium text-foreground mb-1.5 block">이메일 *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@brand.com"
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">카테고리 *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            >
              <option value="">카테고리 선택</option>
              {BRAND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">웹사이트/SNS (선택)</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://www.yourbrand.com"
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">브랜드 소개 (선택)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="브랜드 소개 및 주요 제품에 대해 간략히 설명해주세요"
              rows={4}
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agree"
              id="agree"
              checked={form.agree}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 accent-primary"
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              입점 신청 관련 개인정보 수집 및 이용에 동의합니다. 수집된 정보는 입점 심사 목적으로만 사용됩니다.
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            입점 신청하기
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
