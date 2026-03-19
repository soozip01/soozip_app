/* SOOZIP Design: Japandi Minimalism - Inquiry Page */
import { useState } from "react";
import { ArrowLeft, MessageCircle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useGoBack } from "@/hooks/useGoBack";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const INQUIRY_TYPES = ["상품 문의", "배송 문의", "교환/반품", "입점 문의", "공구 문의", "기타"];

export default function InquiryPage() {
  const [, navigate] = useLocation();
  const goBack = useGoBack("/mypage?tab=shopping");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: "",
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.message) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    setSubmitted(true);
    toast.success("문의가 접수되었습니다!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <CheckCircle size={64} className="text-primary mx-auto" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-foreground">문의 접수 완료!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            문의가 접수되었습니다.<br />
            영업일 기준 1-2일 내에 답변드리겠습니다.
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
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">1:1 문의하기</span>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle size={24} className="text-primary" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-foreground text-sm">고객센터</p>
            <p className="text-xs text-muted-foreground">010-7520-8351 · 평일 10:00-17:00</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">문의 유형 *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            >
              <option value="">문의 유형을 선택해주세요</option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
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
            <label className="text-xs font-medium text-foreground mb-1.5 block">연락처</label>
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
            <label className="text-xs font-medium text-foreground mb-1.5 block">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">문의 내용 *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="문의 내용을 자세히 입력해주세요"
              rows={5}
              className="w-full bg-secondary rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
          >
            문의 접수하기
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
