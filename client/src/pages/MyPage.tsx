/* SOOZIP Design: Japandi Minimalism - My Page (탭 구조)
 * 탭: 프로필 / 쇼핑 / 스타일링
 * - 쇼핑 탭: 주문 현황 + 메뉴 항목 (스타일링 슬라이더 제거)
 * - 스타일링 탭: 신청 현황 + STEP별 진행 카드
 */
import {
  ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn,
  Settings, ShoppingCart, PenLine, Share2, Sparkles,
  CheckCircle2, Circle, ClipboardList, ImageIcon, MessageSquare, FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
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

/* ─── 스타일링 STEP 정의 (배치솔루션 기준) ─── */
const STYLING_STEPS_FURNITURE = [
  {
    id: 1,
    label: "신청 완료",
    icon: CheckCircle2,
    desc: "서비스 신청이 완료되었어요",
    actionLabel: "신청 내역 확인",
    status: "done" as const,
  },
  {
    id: 2,
    label: "기존 가구 정보 입력",
    icon: ClipboardList,
    desc: "기존 가구의 제품 링크 또는 사이즈 정보를 입력해주세요",
    actionLabel: "정보 입력하기",
    status: "active" as const,
  },
  {
    id: 3,
    label: "실측 패키지 수령",
    icon: ImageIcon,
    desc: "실측 패키지를 수령한 후 확인해주세요",
    actionLabel: "수령 확인",
    status: "pending" as const,
  },
  {
    id: 4,
    label: "배치안 확인",
    icon: FileText,
    desc: "제안된 배치안을 확인해주세요",
    actionLabel: "배치안 확인하기",
    status: "pending" as const,
  },
  {
    id: 5,
    label: "피드백 전달",
    icon: MessageSquare,
    desc: "배치안에 대한 피드백을 남겨주세요",
    actionLabel: "피드백 남기기",
    status: "pending" as const,
  },
  {
    id: 6,
    label: "최종안 전달 완료",
    icon: CheckCircle2,
    desc: "최종 배치안과 제품 링크를 확인해주세요",
    actionLabel: "최종안 확인하기",
    status: "pending" as const,
  },
];

/* 예시 신청 정보 (추후 DB 연동) */
const MOCK_STYLING_ORDER = {
  serviceType: "배치 솔루션",
  appliedAt: "2025.03.10",
  currentStep: 2,
};

/* ─── 스타일링 탭 ─── */
function StylingTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [, navigate] = useLocation();

  if (!isLoggedIn) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
          <Sparkles size={28} className="text-gray-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">로그인 후 이용해 주세요</p>
          <p className="text-sm text-muted-foreground mt-1">스타일링 진행 현황을 확인할 수 있어요</p>
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

  const steps = STYLING_STEPS_FURNITURE;
  const currentStepIdx = MOCK_STYLING_ORDER.currentStep - 1;

  return (
    <div className="pb-6">
      {/* 신청 현황 카드 */}
      <div className="mx-4 mt-5 mb-5 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#fafafa" }}>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">진행 중인 스타일링</p>
            <p className="text-sm font-bold text-gray-900">{MOCK_STYLING_ORDER.serviceType}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{MOCK_STYLING_ORDER.appliedAt} 신청</p>
            <span
              className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: TERRACOTTA }}
            >
              진행중
            </span>
          </div>
        </div>
        {/* 진행 바 */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">진행 단계</span>
            <span className="text-xs font-semibold" style={{ color: TERRACOTTA }}>
              {MOCK_STYLING_ORDER.currentStep} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                background: TERRACOTTA,
                width: `${((MOCK_STYLING_ORDER.currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* STEP 카드 리스트 */}
      <div className="px-4 space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          const isPending = idx > currentStepIdx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                borderColor: isActive ? TERRACOTTA : isDone ? "#e5e7eb" : "#f3f4f6",
                background: isActive ? "#fff" : isDone ? "#fafafa" : "#f9f9f9",
              }}
            >
              <div className="px-4 py-4">
                {/* STEP 번호 + 상태 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isActive ? TERRACOTTA : isDone ? "#e5e7eb" : "#f3f4f6",
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} className="text-gray-500" />
                      ) : (
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: isActive ? "white" : "#9ca3af" }}
                        >
                          {String(step.id).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        color: isActive ? TERRACOTTA : isDone ? "#9ca3af" : "#c4c4c4",
                      }}
                    >
                      STEP {String(step.id).padStart(2, "0")}
                    </span>
                  </div>
                  {isDone && (
                    <span className="text-[11px] text-gray-400 font-medium">완료</span>
                  )}
                  {isPending && (
                    <span className="text-[11px] text-gray-300 font-medium">대기중</span>
                  )}
                  {isActive && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: TERRACOTTA }}
                    >
                      진행중
                    </span>
                  )}
                </div>

                {/* 단계 제목 */}
                <p
                  className="text-[15px] font-bold mb-1"
                  style={{ color: isPending ? "#c4c4c4" : "#111" }}
                >
                  {step.label}
                </p>

                {/* 설명 (활성 단계만) */}
                {isActive && (
                  <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">{step.desc}</p>
                )}

                {/* 액션 버튼 (활성 단계만) */}
                {isActive && (
                  <button
                    onClick={() => toast.info("해당 기능이 준비 중입니다.")}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#111111" }}
                  >
                    {step.actionLabel}
                  </button>
                )}

                {/* 완료 단계 - 확인 링크 */}
                {isDone && (
                  <button
                    onClick={() => toast.info("해당 기능이 준비 중입니다.")}
                    className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 mt-1"
                  >
                    {step.actionLabel}
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {/* 활성 단계 하단 구분선 강조 */}
              {isActive && (
                <div className="h-0.5" style={{ background: TERRACOTTA }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 스타일링 신청 없을 때 CTA (추후 신청 없는 경우 분기) */}
      <div className="mx-4 mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-[13px] font-semibold text-gray-700 mb-1">다른 스타일링 서비스도 살펴보세요</p>
        <p className="text-[12px] text-gray-400 mb-3">배치 솔루션, 풀 스타일링(온라인/오프라인)</p>
        <button
          onClick={() => navigate("/styling/types")}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: TERRACOTTA }}
        >
          스타일링 서비스 보러가기
        </button>
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

/* ─── 쇼핑 탭 (스타일링 슬라이더 제거, 주문 현황 상단) ─── */
function ShoppingTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [, navigate] = useLocation();

  return (
    <>
      {/* 로그인 유도 (비로그인 시) */}
      {!isLoggedIn && (
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
              <ShoppingBag size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">로그인 후 이용해 주세요</p>
              <p className="text-xs text-muted-foreground mt-0.5">주문 현황 및 쇼핑 내역을 확인할 수 있어요</p>
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
            <button
              key={status}
              onClick={() => toast.info(`${status} 기능이 준비 중입니다.`)}
              className="py-3 bg-secondary rounded-xl hover:bg-secondary/70 transition-colors"
            >
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{status}</p>
            </button>
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
  const [activeTab, setActiveTab] = useState<"profile" | "shopping" | "styling">("shopping");

  const tabs: { key: "profile" | "shopping" | "styling"; label: string }[] = [
    { key: "profile", label: "프로필" },
    { key: "shopping", label: "쇼핑" },
    { key: "styling", label: "스타일링" },
  ];

  // 탭 인디케이터 left 위치 계산 (각 탭 버튼 너비 기준)
  const TAB_POSITIONS: Record<string, string> = {
    profile: "16px",
    shopping: "76px",
    styling: "136px",
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === key ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
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
              left: TAB_POSITIONS[activeTab],
            }}
          />
        </div>
      </header>

      <main>
        {activeTab === "profile" && <ProfileTab user={isLoggedIn ? user : null} />}
        {activeTab === "shopping" && <ShoppingTab isLoggedIn={isLoggedIn} />}
        {activeTab === "styling" && <StylingTab isLoggedIn={isLoggedIn} />}
      </main>

      <BottomNav />
    </div>
  );
}
