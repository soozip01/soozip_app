/* SOOZIP Design: Japandi Minimalism - My Page (탭 구조)
 * 탭: 프로필 / 쇼핑 / 스타일링
 * - 쇼핑 탭: 주문 현황 + 메뉴 항목
 * - 스타일링 탭: 신청 유형별 STEP 분기 + 빈 상태 UI + 실제 DB 연동
 */
import {
  ShoppingBag, Heart, Bell, HelpCircle, ChevronRight, LogIn,
  Settings, ShoppingCart, PenLine, Share2, Sparkles,
  CheckCircle2, ClipboardList, MessageSquare, FileText, Home,
  Package
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";

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

/* ─── 서비스 유형별 STEP 정의 ─── */
type StepStatus = "done" | "active" | "pending";

interface StepDef {
  id: number;
  label: string;
  desc: string;
  actionLabel: string;
  actionRoute?: string; // 이동할 페이지 경로
}

const STEPS_FURNITURE: StepDef[] = [
  { id: 1, label: "공간 실측", desc: "공간의 가로·세로·높이 치수와 창문, 문 위치 정보를 전달해주세요", actionLabel: "실측 정보 입력하기", actionRoute: "/styling/step1" },
  { id: 2, label: "기존 가구 정보 전달", desc: "기존 가구의 제품 링크 또는 사이즈 정보를 입력해주세요", actionLabel: "정보 입력하기", actionRoute: "/styling/furniture-info" },
  { id: 3, label: "배치 솔루션 제안", desc: "제안된 배치안을 확인해주세요", actionLabel: "배치안 확인하기" },
  { id: 4, label: "피드백 및 수정", desc: "배치안에 대한 피드백을 남겨주세요", actionLabel: "피드백 남기기" },
  { id: 5, label: "최종 시안 전달", desc: "최종 배치안과 제품 링크를 확인해주세요", actionLabel: "최종 시안 확인하기" },
];

const STEPS_FULL_ONLINE: StepDef[] = [
  { id: 1, label: "공간 실측", desc: "공간의 가로·세로·높이 치수와 창문, 문 위치 정보를 전달해주세요", actionLabel: "실측 정보 입력하기", actionRoute: "/styling/step1" },
  { id: 2, label: "기존 가구 정보 전달", desc: "기존 가구의 제품 링크 또는 사이즈 정보를 입력해주세요", actionLabel: "정보 입력하기", actionRoute: "/styling/furniture-info" },
  { id: 3, label: "배치 솔루션 제안", desc: "제안된 배치안을 확인해주세요", actionLabel: "배치안 확인하기" },
  { id: 4, label: "풀 스타일링 진행", desc: "풀 스타일링 작업이 진행 중이에요", actionLabel: "진행 현황 확인" },
  { id: 5, label: "피드백 및 수정", desc: "스타일링 결과에 대한 피드백을 남겨주세요", actionLabel: "피드백 남기기" },
  { id: 6, label: "최종 시안 전달", desc: "최종 시안과 제품 링크를 확인해주세요", actionLabel: "최종 시안 확인하기" },
];

const STEPS_FULL_OFFLINE: StepDef[] = [
  { id: 1, label: "방문 상담 및 공간 실측", desc: "방문 상담 및 실측을 위한 일정을 조율해주세요", actionLabel: "일정 확인하기" },
  { id: 2, label: "기존 가구 정보 전달", desc: "기존 가구의 제품 링크 또는 사이즈 정보를 입력해주세요", actionLabel: "정보 입력하기", actionRoute: "/styling/furniture-info" },
  { id: 3, label: "배치 솔루션 제안", desc: "제안된 배치안을 확인해주세요", actionLabel: "배치안 확인하기" },
  { id: 4, label: "풀 스타일링 진행", desc: "풀 스타일링 작업이 진행 중이에요", actionLabel: "진행 현황 확인" },
  { id: 5, label: "피드백 및 수정", desc: "스타일링 결과에 대한 피드백을 남겨주세요", actionLabel: "피드백 남기기" },
  { id: 6, label: "최종 시안 전달", desc: "최종 시안과 제품 링크를 확인해주세요", actionLabel: "최종 시안 확인하기" },
  { id: 7, label: "가구 및 소품 세팅", desc: "선정된 가구와 소품 세팅이 진행됩니다", actionLabel: "세팅 현황 확인" },
];

const STEPS_MAP: Record<string, StepDef[]> = {
  "배치솔루션": STEPS_FURNITURE,
  "풀스타일링(온라인)": STEPS_FULL_ONLINE,
  "풀스타일링(오프라인)": STEPS_FULL_OFFLINE,
};

const SERVICE_ICON_MAP: Record<string, React.ReactNode> = {
  "배치솔루션": <Home size={18} />,
  "풀스타일링(온라인)": <Sparkles size={18} />,
  "풀스타일링(오프라인)": <Package size={18} />,
};

/* ─── 스타일링 탭 ─── */
function StylingTab({ userId, nickname, isLoggedIn }: { userId: string; nickname: string; isLoggedIn: boolean }) {
  const [, navigate] = useLocation();

  // 로그인 안 된 경우
  if (!isLoggedIn) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100">
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

  // Supabase 설문조사 신청 데이터 조회 (userId 기반 우선, 폴백: 닉네임)
  const { data: surveyData, isLoading } = trpc.survey.mySubmission.useQuery(
    { userId: userId || undefined, nickname: nickname || undefined },
    { enabled: isLoggedIn && (!!userId || !!nickname) }
  );

  if (isLoading) {
    return (
      <div className="px-4 py-10 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: TERRACOTTA }} />
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  // 신청한 스타일링이 없는 경우 - 빈 상태 UI
  if (!surveyData) {
    return (
      <div className="pb-6">
        <div className="px-4 py-12 flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#f9f9f9", border: "2px dashed #e5e7eb" }}
          >
            <Sparkles size={32} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-[16px]">아직 신청한 스타일링이 없어요</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              배치 솔루션, 풀 스타일링 등<br />다양한 서비스를 신청해보세요
            </p>
          </div>
        </div>

        {/* 서비스 소개 카드 */}
        <div className="px-4 space-y-3">
          {[
            { type: "배치솔루션", desc: "공간 실측 후 최적의 가구 배치안 제안", steps: "5단계" },
            { type: "풀스타일링(온라인)", desc: "배치안부터 가구 선정까지 온라인으로 진행", steps: "6단계" },
            { type: "풀스타일링(오프라인)", desc: "방문 상담부터 가구 세팅까지 오프라인 진행", steps: "7단계" },
          ].map((service) => (
            <div
              key={service.type}
              className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
              style={{ background: "#fafafa" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                style={{ background: TERRACOTTA }}
              >
                {SERVICE_ICON_MAP[service.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900">{service.type}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{service.desc}</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">{service.steps}</span>
            </div>
          ))}
        </div>

        <div className="px-4 mt-5">
          <button
            onClick={() => navigate("/styling/request")}
            className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: TERRACOTTA }}
          >
            스타일링 서비스 신청하기
          </button>
        </div>
      </div>
    );
  }

  // Supabase 데이터로 STEP 매핑
  // styling_type 실제 값: "배치솔루션(가구 재배치 위주)", "풀 스타일링(온라인)", "풀 스타일링(오프라인)"
  const rawType = surveyData.stylingType;
  let mappedType: string;
  if (rawType.includes("풀 스타일링(오프라인)") || rawType.includes("풀스타일링(오프라인)")) {
    mappedType = "풀스타일링(오프라인)";
  } else if (rawType.includes("풀 스타일링(온라인)") || rawType.includes("풀스타일링(온라인)")) {
    mappedType = "풀스타일링(온라인)";
  } else {
    mappedType = "배치솔루션";
  }

  const steps = STEPS_MAP[mappedType] ?? STEPS_FURNITURE;
  const totalSteps = steps.length;

  // step1~step7 컬럼 기반 완료 상태 계산
  // 관리자가 각 step 컬럼을 'completed'로 설정하면 완료로 표시
  const stepStatuses: Record<number, string> = {
    1: (surveyData as any).step1 ?? 'pending',
    2: (surveyData as any).step2 ?? 'pending',
    3: (surveyData as any).step3 ?? 'pending',
    4: (surveyData as any).step4 ?? 'pending',
    5: (surveyData as any).step5 ?? 'pending',
    6: (surveyData as any).step6 ?? 'pending',
    7: (surveyData as any).step7 ?? 'pending',
  };

  // 완료된 단계 수 계산 (현재 진행 단계 = 마지막 완료 단계 + 1)
  const completedCount = steps.filter((s) => stepStatuses[s.id] === 'completed').length;
  const currentStepIdx = completedCount; // 0-based: completedCount번째 인덱스가 현재 진행 중
  // 진행 바 계산용 (styling_state 폴백)
  const progressState = completedCount > 0 ? completedCount + 1 : (surveyData.stylingState ?? 1);

  return (
    <div className="pb-6">
      {/* 신청 현황 카드 */}
      <div className="mx-4 mt-5 mb-5 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#fafafa" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: TERRACOTTA }}
            >
              {SERVICE_ICON_MAP[mappedType] ?? <Sparkles size={16} />}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">진행 중인 스타일링</p>
              <p className="text-sm font-bold text-gray-900">{rawType}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {new Date(surveyData.createdAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })} 신청
            </p>
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
              {completedCount} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                background: TERRACOTTA,
                width: `${(completedCount / Math.max(totalSteps, 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* STEP 카드 리스트 */}
      <div className="px-4 space-y-3">
        {steps.map((step, idx) => {
          // step1~step7 컬럼 기반 상태 판단
          const stepStatus = stepStatuses[step.id] ?? 'pending';
          const isDone = stepStatus === 'completed';
          // 모든 이전 단계가 완료되고 현재 단계가 pending/in_progress인 경우 활성
          const allPrevDone = steps.slice(0, idx).every((s) => (stepStatuses[s.id] ?? 'pending') === 'completed');
          const isActive = !isDone && allPrevDone;
          const isPending = !isDone && !isActive;

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
                {/* STEP 번호 + 단계명 + 상태 - 한 줄 표시 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* 완료 시 체크 아이콘, 진행/대기 시 STEP 번호 */}
                    {isDone ? (
                      <CheckCircle2
                        size={16}
                        style={{ color: "#9ca3af", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isActive ? TERRACOTTA : "#f3f4f6" }}
                      >
                        <span
                          className="text-[9px] font-bold leading-none"
                          style={{ color: isActive ? "white" : "#9ca3af" }}
                        >
                          {String(step.id).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    {/* STEP 01 단계명 */}
                    <span
                      className="text-[14px] font-bold truncate"
                      style={{
                        color: isActive ? TERRACOTTA : isDone ? "#9ca3af" : "#c4c4c4",
                      }}
                    >
                      STEP {String(step.id).padStart(2, "0")} {step.label}
                    </span>
                  </div>
                  {isDone && <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-2">완료</span>}
                  {isPending && <span className="text-[11px] text-gray-300 font-medium shrink-0 ml-2">대기중</span>}
                  {isActive && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 ml-2"
                      style={{ background: TERRACOTTA }}
                    >
                      진행중
                    </span>
                  )}
                </div>

                {/* 설명 (활성 단계만) */}
                {isActive && (
                  <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">{step.desc}</p>
                )}

                {/* 액션 버튼 (활성 단계만) */}
                {isActive && (
                  <button
                    onClick={() => {
                      if (step.actionRoute) {
                        navigate(`${step.actionRoute}?surveyId=${surveyData.id}`);
                      } else {
                        toast.info("해당 기능이 준비 중입니다.");
                      }
                    }}
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

              {/* 활성 단계 하단 강조선 */}
              {isActive && (
                <div className="h-0.5" style={{ background: TERRACOTTA }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 다른 서비스 CTA */}
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

/* ─── 쇼핑 탭 ─── */
function ShoppingTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [, navigate] = useLocation();

  return (
    <>
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
        {activeTab === "styling" && (
          <StylingTab
            userId={user ? String(user.id) : ""}
            nickname={user?.nickname ?? ""}
            isLoggedIn={isLoggedIn}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
