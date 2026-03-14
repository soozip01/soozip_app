/* SOOZIP Design: Japandi Minimalism - My Page (탭 구조) */
import {
  ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn,
  Settings, ShoppingCart, ChevronLeft, CheckCircle2, Clock, Circle,
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
    detail: "담당 스타일리스트가 배정될 예정입니다. 잠시만 기다려 주세요.",
    icon: "✅",
    status: "done",
  },
  {
    id: 2,
    title: "실측 패키지 발송",
    detail: "패키지를 수령하신 후 공간을 실측하고 도면 초안을 온라인으로 전송해 주세요.",
    icon: "📦",
    status: "active",
  },
  {
    id: 3,
    title: "가구 정보 전달",
    detail: "보유하신 가구의 제품 링크, 사이즈 정보를 전달해 주시면 최적의 배치를 계획합니다.",
    icon: "🛋️",
    status: "pending",
  },
  {
    id: 4,
    title: "배치안 제안",
    detail: "3D 도면을 기반으로 2가지 배치안을 제안드립니다. 마음에 드시는 안을 선택해 주세요.",
    icon: "📐",
    status: "pending",
  },
  {
    id: 5,
    title: "피드백 반영",
    detail: "선택하신 배치안에 대한 피드백을 주시면 최종안에 반영하겠습니다.",
    icon: "💬",
    status: "pending",
  },
  {
    id: 6,
    title: "최종안 전달",
    detail: "최종 배치안과 함께 추천 제품 링크를 전달드립니다. 스타일링을 즐겨보세요!",
    icon: "🎉",
    status: "pending",
  },
];

/* ─── 스타일링 진행 현황 슬라이더 ─── */
function StylingProgressSlider() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);
  const mouseStartX = useRef(0);

  const currentStep = STYLING_STEPS[currentIdx];
  const activeStepIdx = STYLING_STEPS.findIndex((s) => s.status === "active");
  const activeStepNum = activeStepIdx >= 0 ? activeStepIdx + 1 : 1;

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

  const getStatusIcon = (status: string) => {
    if (status === "done") return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === "active") return <Clock size={16} style={{ color: TERRACOTTA }} />;
    return <Circle size={16} className="text-muted-foreground" />;
  };

  return (
    <div className="px-4 py-5 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-foreground">스타일링 진행 현황</p>
        <span className="text-xs text-muted-foreground">
          <span className="font-bold" style={{ color: TERRACOTTA }}>{activeStepNum}단계</span>
          {" "}진행 중 / 전체 {STYLING_STEPS.length}단계
        </span>
      </div>

      <div
        className="relative bg-secondary rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: TERRACOTTA }}>
              STEP {currentIdx + 1}
            </span>
            <span className="text-xs text-muted-foreground">/ {STYLING_STEPS.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon(currentStep.status)}
            <span className="text-[11px] text-muted-foreground">
              {currentStep.status === "done" ? "완료" : currentStep.status === "active" ? "진행 중" : "대기"}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="text-3xl mb-2">{currentStep.icon}</div>
          <p className="font-bold text-foreground text-base mb-1">{currentStep.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentStep.detail}</p>
        </div>

        <div className="flex items-center justify-between px-3 pb-4">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center disabled:opacity-30 transition-opacity shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {STYLING_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentIdx(idx)}
                className="rounded-full transition-all"
                style={{
                  width: idx === currentIdx ? "20px" : "6px",
                  height: "6px",
                  background: idx === currentIdx ? TERRACOTTA : "oklch(0.75 0 0)",
                }}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            disabled={currentIdx === STYLING_STEPS.length - 1}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center disabled:opacity-30 transition-opacity shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-1">
        {STYLING_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className="flex-1 h-1 rounded-full transition-all"
            style={{
              background:
                step.status === "done" ? "#22c55e"
                : step.status === "active" ? TERRACOTTA
                : idx === currentIdx ? "oklch(0.75 0 0)"
                : "oklch(0.88 0 0)",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">신청 완료</span>
        <span className="text-[10px] text-muted-foreground">최종안 전달</span>
      </div>
    </div>
  );
}

/* ─── 프로필 탭 ─── */
function ProfileTab({ user }: { user: { nickname: string; email?: string | null; provider: string; profileImageUrl?: string | null } | null }) {
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
      {/* 프로필 상단 영역 */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-start justify-between">
          {/* 닉네임 + 소셜 뱃지 */}
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

          {/* 아바타 */}
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

      {/* 액션 버튼 */}
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

      {/* 구분선 */}
      <div className="mt-5 border-t border-border" />

      {/* 활동 내역 (준비 중) */}
      <div className="px-5 py-6 text-center">
        <p className="text-sm text-muted-foreground">아직 활동 내역이 없습니다.</p>
      </div>
    </div>
  );
}

/* ─── 쇼핑 탭 ─── */
function ShoppingTab({ user, isLoggedIn }: { user: { nickname: string; email?: string | null; provider: string; profileImageUrl?: string | null } | null; isLoggedIn: boolean }) {
  const [, navigate] = useLocation();

  return (
    <>
      {isLoggedIn && user ? (
        /* 로그인 상태: 스타일링 진행 현황 슬라이더 */
        <StylingProgressSlider />
      ) : (
        /* 비로그인 상태: 로그인 유도 */
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
          {/* 탭 전환 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === "profile"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              프로필
            </button>
            <button
              onClick={() => setActiveTab("shopping")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                activeTab === "shopping"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              쇼핑
            </button>
          </div>

          {/* 우측 아이콘 */}
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

        {/* 탭 하단 인디케이터 */}
        <div className="flex px-4 -mt-px">
          <div className="flex gap-1">
            <div
              className="h-0.5 rounded-full transition-all duration-300"
              style={{
                width: activeTab === "profile" ? "36px" : "0px",
                background: activeTab === "profile" ? TERRACOTTA : "transparent",
                marginLeft: "12px",
              }}
            />
          </div>
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
