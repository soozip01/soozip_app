/* SOOZIP Design: Japandi Minimalism - My Page (탭 구조) */
import {
  ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn,
  Settings, ShoppingCart, ChevronLeft, ChevronRight as ChevronRightIcon,
  PenLine, Share2
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "#d31400";

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  naver: "네이버",
  email: "이메일",
};

const PROVIDER_COLOR: Record<string, string> = {
  kakao: "#FEE500",
  naver: "#03C75A",
  email: "#888888",
};

const MENU_ITEMS = [
  { icon: ShoppingBag, label: "주문/배송 조회", action: "coming_soon" },
  { icon: Heart, label: "찜 목록", action: "coming_soon" },
  { icon: Bell, label: "알림 설정", action: "coming_soon" },
  { icon: HelpCircle, label: "고객센터", action: "inquiry" },
];

/* ─── 스타일링 진행 현황 STEP 데이터 ─── */
const STYLING_STEPS = [
  {
    id: 1,
    title: "신청 완료",
    actionLabel: "신청 내역 확인하기",
    status: "done",
  },
  {
    id: 2,
    title: "기존 가구 정보 입력하기",
    actionLabel: "정보를 등록해주세요",
    status: "active",
  },
  {
    id: 3,
    title: "실측 패키지 수령",
    actionLabel: "수령 확인하기",
    status: "pending",
  },
  {
    id: 4,
    title: "배치안 확인하기",
    actionLabel: "배치안을 확인해주세요",
    status: "pending",
  },
  {
    id: 5,
    title: "피드백 전달하기",
    actionLabel: "피드백을 남겨주세요",
    status: "pending",
  },
  {
    id: 6,
    title: "최종안 전달 완료",
    actionLabel: "최종안 확인하기",
    status: "pending",
  },
];

/* 예시 신청 정보 (추후 DB 연동) */
const MOCK_ORDER = {
  serviceType: "풀 스타일링(온라인)",
  priceType: "무료 타입",
};

/* ─── 스타일링 진행 현황 슬라이더 ─── */
function StylingProgressSlider({ nickname }: { nickname: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);
  const mouseStartX = useRef(0);

  const currentStep = STYLING_STEPS[currentIdx];
  const activeStepIdx = STYLING_STEPS.findIndex((s) => s.status === "active");

  const goNext = () => { if (currentIdx < STYLING_STEPS.length - 1) setCurrentIdx((p) => p + 1); };
  const goPrev = () => { if (currentIdx > 0) setCurrentIdx((p) => p - 1); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) goNext(); else goPrev(); }
  };
  const handleMouseDown = (e: React.MouseEvent) => { mouseStartX.current = e.clientX; isDragging.current = true; };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 40) { if (diff > 0) goNext(); else goPrev(); }
  };

  const isActionable = currentStep.status === "active";

  return (
    <div className="px-4 pt-4 pb-4 border-b border-border">
      {/* 상단: 점 인디케이터 + 서비스 타입 */}
      <div className="flex items-center justify-between mb-3 px-1">
        {/* 좌측: 점 인디케이터만 (클릭으로 이동 가능) */}
        <div className="flex items-center gap-2">
          {STYLING_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentIdx(idx)}
              className="rounded-full transition-all duration-200"
              style={{
                width: idx === activeStepIdx ? "12px" : "10px",
                height: idx === activeStepIdx ? "12px" : "10px",
                background:
                  idx === activeStepIdx
                    ? TERRACOTTA
                    : idx < activeStepIdx
                    ? "oklch(0.65 0 0)"
                    : "oklch(0.82 0 0)",
              }}
            />
          ))}
        </div>

        {/* 우측: 서비스 타입 / 요금 타입만 표시 */}
        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
          {MOCK_ORDER.serviceType} / {MOCK_ORDER.priceType}
        </p>
      </div>

      {/* 슬라이더 카드 */}
      <div
        className="bg-secondary rounded-2xl overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 카드 상단: STEP 뱃지 + 자세히 보기 */}
        <div className="flex items-center justify-between px-5 pt-7 pb-5">
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-md text-white"
            style={{ background: TERRACOTTA }}
          >
            STEP {String(currentIdx + 1).padStart(2, "0")}
          </span>
          <button
            onClick={() => toast.info("자세히 보기 기능이 준비 중입니다.")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            자세히 보기
          </button>
        </div>

        {/* 카드 본문: 단계 제목 */}
        <div className="px-5 pb-7">
          <h3 className="text-2xl font-bold text-foreground mb-6 leading-snug">
            {currentStep.title}
          </h3>

          {/* 액션 버튼 */}
          <button
            onClick={() => {
              if (isActionable) toast.info("해당 기능이 준비 중입니다.");
              else toast.info("아직 진행되지 않은 단계입니다.");
            }}
            className="w-full py-4 rounded-2xl text-sm font-medium transition-colors"
            style={{
              background: isActionable ? "oklch(0.55 0 0)" : "oklch(0.82 0 0)",
              color: isActionable ? "white" : "oklch(0.55 0 0)",
              cursor: isActionable ? "pointer" : "default",
            }}
          >
            {currentStep.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 프로필 탭 ─── */
function ProfileTab({ user }: {
  user: { nickname: string; email?: string | null; provider: string; profileImageUrl?: string | null } | null
}) {
  const [, navigate] = useLocation();

  if (!user) {
    return (
      <div className="px-5 py-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-3xl text-muted-foreground">👤</span>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">로그인이 필요합니다</p>
          <p className="text-sm text-muted-foreground mt-1">로그인하고 프로필을 확인해 보세요</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="mt-2 px-8 py-3 rounded-xl font-medium text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: TERRACOTTA }}
        >
          <span className="flex items-center gap-2"><LogIn size={16} />로그인 / 회원가입</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">{user.nickname}</h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-foreground shrink-0"
                style={{ background: PROVIDER_COLOR[user.provider] ?? "#888" }}
              >
                {PROVIDER_LABEL[user.provider] ?? user.provider}
              </span>
            </div>
            {user.email && (
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            )}
          </div>
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.nickname}
              className="w-16 h-16 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{ background: TERRACOTTA }}
            >
              {user.nickname.slice(0, 1)}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 flex gap-2">
        <button
          onClick={() => toast.info("프로필 편집 기능이 준비 중입니다.")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
        >
          <PenLine size={15} />
          프로필 편집
        </button>
        <button
          onClick={() => toast.info("공유 기능이 준비 중입니다.")}
          className="w-11 h-11 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="mt-5 border-t border-border" />
      <div className="px-5 py-6 text-center">
        <p className="text-sm text-muted-foreground">아직 활동 내역이 없습니다.</p>
      </div>
    </div>
  );
}

/* ─── 쇼핑 탭 ─── */
function ShoppingTab({
  user,
  isLoggedIn,
}: {
  user: { nickname: string; email?: string | null; provider: string; profileImageUrl?: string | null } | null;
  isLoggedIn: boolean;
}) {
  const [, navigate] = useLocation();

  return (
    <>
      {isLoggedIn && user ? (
        <StylingProgressSlider nickname={user.nickname} />
      ) : (
        <div className="px-4 py-6 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">🏠</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">로그인 후 이용해 주세요</p>
              <p className="text-xs text-muted-foreground mt-0.5">스타일링 진행 현황을 확인할 수 있어요</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: TERRACOTTA }}
          >
            <LogIn size={16} />
            로그인 / 회원가입
          </button>
        </div>
      )}

      {/* 주문 현황 */}
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

      {/* 메뉴 항목 */}
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

      {/* 고객센터 */}
      <div className="mx-4 my-4 bg-secondary rounded-2xl p-5">
        <p className="heading-text text-foreground mb-1">고객센터</p>
        <p className="text-xs text-muted-foreground mb-3">통화가 어려운 경우 1:1 문의를 이용해주세요</p>
        <p className="text-xl font-bold text-foreground">010-7520-8351</p>
        <p className="caption-text text-muted-foreground mt-1">평일 10:00-17:00</p>
      </div>
    </>
  );
}

/* ─── 메인 마이페이지 ─── */
export default function MyPage() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "shopping">("shopping");

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "profile" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              프로필
            </button>
            <button
              onClick={() => setActiveTab("shopping")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "shopping" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              쇼핑
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/cart")}
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              aria-label="장바구니"
            >
              <ShoppingCart size={20} />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              aria-label="환경설정"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        {/* 탭 인디케이터 */}
        <div className="relative h-0.5 bg-transparent">
          <div
            className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300"
            style={{
              background: TERRACOTTA,
              width: "40px",
              left: activeTab === "profile" ? "16px" : "76px",
            }}
          />
        </div>
      </header>

      <main>
        {activeTab === "profile" ? (
          <ProfileTab user={isLoggedIn ? user : null} />
        ) : (
          <ShoppingTab user={user} isLoggedIn={isLoggedIn} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
