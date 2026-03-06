/* SOOZIP Design: Japandi Minimalism - My Page */
import { ArrowLeft, User, ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const MENU_ITEMS = [
  { icon: ShoppingBag, label: "주문/배송 조회", action: "coming_soon" },
  { icon: Heart, label: "찜 목록", action: "coming_soon" },
  { icon: Bell, label: "알림 설정", action: "coming_soon" },
  { icon: HelpCircle, label: "고객센터", action: "inquiry" },
];

export default function MyPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">마이페이지</span>
        </div>
      </header>

      <main>
        {/* Profile section */}
        <div className="px-4 py-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <User size={32} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">로그인이 필요합니다</p>
              <p className="text-sm text-muted-foreground mt-0.5">로그인하고 더 많은 혜택을 받아보세요</p>
            </div>
          </div>
          <button
            onClick={() => toast.info("로그인 기능이 준비 중입니다.")}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
          >
            <LogIn size={18} />
            로그인 / 회원가입
          </button>
        </div>

        {/* Order summary */}
        <div className="px-4 py-5 border-b border-border">
          <p className="text-xs font-semibold text-foreground mb-4">주문 현황</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {["결제완료", "배송준비", "배송중", "배송완료"].map((status) => (
              <div key={status} className="py-3 bg-secondary rounded-xl">
                <p className="text-lg font-bold text-foreground">0</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="px-4 py-4">
          {MENU_ITEMS.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={() => {
                if (action === "coming_soon") toast.info(`${label} 기능이 준비 중입니다.`);
                else if (action === "inquiry") navigate("/inquiry");
              }}
              className="w-full flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors rounded-lg px-2"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">{label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Customer service */}
        <div className="mx-4 my-4 bg-secondary rounded-2xl p-5">
          <p className="heading-text text-foreground mb-1">고객센터</p>
          <p className="text-xs text-muted-foreground mb-3">통화가 어려운 경우 1:1 문의를 이용해주세요</p>
          <p className="text-xl font-bold text-foreground">010-7520-8351</p>
          <p className="caption-text text-muted-foreground mt-1">평일 10:00-17:00</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
