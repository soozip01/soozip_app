/* SOOZIP Design: Japandi Minimalism - My Page */
import {
  User, ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn,
  Settings, ShoppingCart, ChevronLeft, CheckCircle2, Clock, Circle
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
    desc: "스타일링 신청이 완료되었습니다.",
    detail: "담당 스타일리스트가 배정될 예정입니다. 잠시만 기다려 주세요.",
    icon: "✅",
    status: "done",
  },
  {
    id: 2,
    title: "실측 패키지 발송",
    desc: "실측 패키지가 발송되었습니다.",
    detail: "패키지를 수령하신 후 공간을 실측하고 도면 초안을 온라인으로 전송해 주세요.",
    icon: "📦",
    status: "active",
  },
  {
    id: 3,
    title: "가구 정보 전달",
    desc: "기존 가구 정보를 전달해 주세요.",
    detail: "보유하신 가구의 제품 링크, 사이즈 정보를 전달해 주시면 최적의 배치를 계획합니다.",
    icon: "🛋️",
    status: "pending",
  },
  {
    id: 4,
    title: "배치안 제안",
    desc: "최적의 배치안을 제안드립니다.",
    detail: "3D 도면을 기반으로 2가지 배치안을 제안드립니다. 마음에 드시는 안을 선택해 주세요.",
    icon: "📐",
    status: "pending",
  },
  {
    id: 5,
    title: "피드백 반영",
    desc: "피드백을 반영하여 수정합니다.",
    detail: "선택하신 배치안에 대한 피드백을 주시면 최종안에 반영하겠습니다.",
    icon: "💬",
    status: "pending",
  },
  {
    id: 6,
    title: "최종안 전달",
    desc: "최종 배치안이 완성되었습니다!",
    detail: "최종 배치안과 함께 추천 제품 링크를 전달드립니다. 스타일링을 즐겨보세요!",
    icon: "🎉",
    status: "pending",
  },
];

/* ─── 스타일링 진행 현황 슬라이더 ─── */
function StylingProgressSlider() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const mouseStartX = useRef(0);

  const currentStep = STYLING_STEPS[currentIdx];
  const activeStepIdx = STYLING_STEPS.findIndex((s) => s.status === "active");
  const activeStepNum = activeStepIdx >= 0 ? activeStepIdx + 1 : 1;

  const goNext = () => {
    if (currentIdx < STYLING_STEPS.length - 1) setCurrentIdx((p) => p + 1);
  };
  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((p) => p - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = mouseStartX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "done") return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === "active") return <Clock size={16} style={{ color: TERRACOTTA }} />;
    return <Circle size={16} className="text-muted-foreground" />;
  };

  return (
    <div className="px-4 py-5 border-b border-border">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-foreground">스타일링 진행 현황</p>
        <span className="text-xs text-muted-foreground">
          <span className="font-bold" style={{ color: TERRACOTTA }}>{activeStepNum}단계</span>
          {" "}진행 중 / 전체 {STYLING_STEPS.length}단계
        </span>
      </div>

      {/* 슬라이더 카드 */}
      <div
        className="relative bg-secondary rounded-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 상단: 현재 단계 표시 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: TERRACOTTA }}
            >
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

        {/* 카드 본문 */}
        <div className="px-4 pb-4">
          <div className="text-3xl mb-2">{currentStep.icon}</div>
          <p className="font-bold text-foreground text-base mb-1">{currentStep.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{currentStep.detail}</p>
        </div>

        {/* 좌우 화살표 */}
        <div className="flex items-center justify-between px-3 pb-4">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="w-8 h-8 rounded-full bg-background flex items-center justify-center disabled:opacity-30 transition-opacity shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>

          {/* 인디케이터 점 */}
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

      {/* 전체 단계 미니 진행바 */}
      <div className="mt-3 flex gap-1">
        {STYLING_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className="flex-1 h-1 rounded-full transition-all"
            style={{
              background:
                step.status === "done"
                  ? "#22c55e"
                  : step.status === "active"
                  ? TERRACOTTA
                  : idx === currentIdx
                  ? "oklch(0.75 0 0)"
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

/* ─── 메인 마이페이지 ─── */
export default function MyPage() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm">마이페이지</span>
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
      </header>

      <main>
        {isLoggedIn && user ? (
          /* ── 로그인 상태 ── */
          <>
            {/* 프로필 섹션 */}
            <div className="px-4 py-6 border-b border-border">
              <div className="flex items-center gap-4">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-base truncate">{user.nickname}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground shrink-0"
                      style={{ background: PROVIDER_COLOR[user.provider] ?? "#888" }}
                    >
                      {PROVIDER_LABEL[user.provider] ?? user.provider}
                    </span>
                  </div>
                  {user.email && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

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

            {/* 스타일링 진행 현황 슬라이더 (로그인 시에만) */}
            <StylingProgressSlider />
          </>
        ) : (
          /* ── 비로그인 상태: 스타일링 슬라이더 + 로그인 유도 ── */
          <>
            {/* 스타일링 진행 현황 (로그인 유도 메시지 포함) */}
            <div className="px-4 py-6 border-b border-border">
              {/* 로그인 유도 배너 */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <User size={28} className="text-muted-foreground" strokeWidth={1.5} />
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
          </>
        )}

        {/* 메뉴 항목 (공통) */}
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
      </main>

      <BottomNav />
    </div>
  );
}
