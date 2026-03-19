/* 수집 풀 스타일링(오프라인) 페이지
 * - 배치솔루션과 완전히 동일한 레이아웃 구조
 * - sticky STEP 진행 박스 (top-[57px]) + IntersectionObserver 스크롤 연동
 * - STEP 01~07 각 단계 상세 내용
 * - 이미지: 번호 플레이스홀더 (추후 업로드 예정)
 */
import { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, XCircle, Bell, ImageIcon } from "lucide-react";
import SurveyOverlay from "@/components/SurveyOverlay";

const TERRACOTTA = "#d31400";

const STEP_LABELS = [
  "01 공간 실측",
  "02 기존가구 정보",
  "03 배치 제안",
  "04 풀 스타일링",
  "05 피드백 및 수정",
  "06 최종안 전달",
  "07 가구 세팅",
];

/* ── 이미지 플레이스홀더 컴포넌트 ── */
function ImgPlaceholder({
  num,
  label,
  aspectRatio = "4/3",
  className = "",
}: {
  num: string | number;
  label?: string;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
      style={{ aspectRatio }}
    >
      <ImageIcon size={28} className="text-gray-400" />
      <span className="text-gray-500 font-bold text-[22px]">{num}</span>
      {label && <span className="text-gray-400 text-[12px] text-center px-2">{label}</span>}
    </div>
  );
}

export default function StylingTypeFullOffline() {
  const [, navigate] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [showSurvey, setShowSurvey] = useState(false);
  const stepSectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepSectionRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveStep(idx);
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const scrollToStep = (index: number) => {
    setTimeout(() => {
      const el = stepSectionRefs.current[index];
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {showSurvey && (
        <SurveyOverlay
          url="https://soozipland-j3tut3mq.manus.space/"
          title="풀 스타일링(오프라인) 신청서"
          onClose={() => setShowSurvey(false)}
        />
      )}
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-20">
        <button
          onClick={() => navigate("/styling/types")}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          수집 풀 스타일링(오프라인)
        </h1>
      </header>

      {/* ── sticky STEP 진행 박스 ── */}
      <div className="sticky top-[57px] z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((label, idx) => {
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <button
                  key={idx}
                  onClick={() => scrollToStep(idx)}
                  className="flex items-center gap-1 transition-all duration-300"
                  style={{ flex: isActive ? "1 1 auto" : "0 0 auto" }}
                >
                  <div
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                    style={{
                      background: isActive ? TERRACOTTA : isPast ? "#e5e7eb" : "#f3f4f6",
                      color: isActive ? "white" : "#9ca3af",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  {isActive && (
                    <span
                      className="text-[12px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] transition-all duration-300"
                      style={{ color: TERRACOTTA }}
                    >
                      {label.replace(/^\d+\s*/, "")}
                    </span>
                  )}
                  {idx < STEP_LABELS.length - 1 && !isActive && (
                    <div className="w-2 h-px bg-gray-200 shrink-0 mx-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* ── 소개 섹션 ── */}
        <section className="px-4 pt-8 pb-8">
          <div className="grid grid-cols-2 gap-3 mb-7">
            <ImgPlaceholder num="①" label="사례 이미지 1" aspectRatio="3/4" />
            <ImgPlaceholder num="②" label="사례 이미지 2" aspectRatio="3/4" />
          </div>
          <h2 className="text-gray-900 font-bold text-[17px] leading-snug mb-4">
            공간 실측부터, 홈 스타일링, 가구 세팅까지<br />진행되는 타입이에요
          </h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            하루 한 공간 기준 공간 실측 상담부터 가구 선정과 배치까지
            진행되는 오프라인 방문 서비스에요.
          </p>
        </section>

        {/* ── STEP 01: 공간 실측 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[0] = el; }}
          className="pt-8 pb-10 border-t border-gray-100"
        >
          <div className="px-4">
            <StepBadge num="01" />
          </div>
          <div className="px-4 mt-7 mb-6">
            <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-3">
              풀 스타일링 예약이 완료되면<br />방문 상담 및 실측을 위한 일정을 조율해요!
            </h3>
            <p className="text-gray-500 text-[13px] leading-relaxed">
              조율한 일정에 맞춰 담당자가 방문하여 실측을 진행해요
            </p>
          </div>
          <div className="px-4 flex justify-center">
            <ImgPlaceholder num="③" label="방문 상담 및 실측 안내" aspectRatio="4/3" className="max-w-xs" />
          </div>
        </section>

        {/* ── STEP 02: 기존가구 정보 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[1] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="02" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
              기존가구 정보 전달
            </h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              기존가구의 제품링크 또는<br />사진+사이즈 정보를 전달해주세요
            </p>
          </div>

          {/* 제품 링크 전달 시 */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} style={{ color: TERRACOTTA }} fill={TERRACOTTA} className="text-white shrink-0" />
              <span className="font-bold text-[15px]" style={{ color: TERRACOTTA }}>제품 링크 전달 시</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 font-bold text-[15px] mb-4">기존 제품 1</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[13px] w-16 shrink-0">제품 링크 :</span>
                  <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5">
                    <span className="text-gray-400 text-[13px]">http://</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[13px] w-16 shrink-0">옵션 설명 :</span>
                  <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5">
                    <span className="text-gray-600 text-[13px]">블랙 600</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사이즈+정보 전달 시 */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} style={{ color: TERRACOTTA }} fill={TERRACOTTA} className="text-white shrink-0" />
              <span className="font-bold text-[15px]" style={{ color: TERRACOTTA }}>사이즈+정보 전달 시</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-28 shrink-0 rounded-lg overflow-hidden">
                  <ImgPlaceholder num="④" label="가구 사진" aspectRatio="1/1" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-bold text-[14px] mb-3">사이즈 정보</p>
                  <div className="space-y-2">
                    <SizeRow label="제품 :" value="수납장" />
                    <SizeRow label="가로 :" value="800" unit="mm" />
                    <SizeRow label="깊이 :" value="400" unit="mm" />
                    <SizeRow label="높이 :" value="740" unit="mm" />
                  </div>
                  <p className="text-gray-500 text-[12px] mt-3">특이사항</p>
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 mt-1">
                    <span className="text-gray-500 text-[12px]">여닫이 제품</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 이런건 확인이 어려워요 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={20} style={{ color: TERRACOTTA }} fill={TERRACOTTA} className="text-white shrink-0" />
              <span className="font-bold text-[15px]" style={{ color: TERRACOTTA }}>이런건 확인이 어려워요</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-28 shrink-0 rounded-lg overflow-hidden">
                  <ImgPlaceholder num="⑤" label="공간 사진" aspectRatio="1/1" />
                </div>
                <ul className="flex-1 space-y-3 pt-1">
                  {[
                    "제품이 제대로 보이지 않는 사진",
                    "제품이 잘려 나온 사진",
                    "특정 제품이 아닌 공간의 사진",
                    "제품의 디자인이나 색상이\n잘 보이지 않는 사진",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-gray-400 text-[13px] mt-0.5 shrink-0">•</span>
                      <span className="text-gray-700 text-[13px] leading-snug whitespace-pre-line">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── STEP 03: 배치 솔루션 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[2] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="03" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
              실측한 정보들로<br />최적의 배치를 잡아드려요!
            </h3>
            <p className="text-gray-500 text-[14px] mb-4">
              라이프 스타일에 맞춘 최적의 배치를 제안드려요
            </p>
            <NoticeBox text="공간에 따라 제안되는 시안의 갯수는 달라질 수 있어요" />
          </div>
          <div className="flex flex-col gap-4">
            <ImgPlaceholder num="⑥" label="배치안 예시 1" aspectRatio="4/3" />
            <ImgPlaceholder num="⑦" label="배치안 예시 2" aspectRatio="4/3" />
          </div>
        </section>

        {/* ── STEP 04: 풀 스타일링 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[3] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="04" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-4">
              배치안을 바탕으로<br />풀 스타일링을 진행해드려요
            </h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              확정된 배치안을 기반으로 공간에 어울리는 가구와 소품을 선정하여
              완성도 높은 스타일링을 제안드려요
            </p>
          </div>
          <div className="flex justify-center">
            <ImgPlaceholder num="⑧" label="풀 스타일링 진행 안내" aspectRatio="4/3" className="max-w-xs" />
          </div>
        </section>

        {/* ── STEP 05: 피드백 및 수정 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[4] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="05" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-4">
              시안에 대한 피드백을 받아<br />최종안을 전달드려요
            </h3>
            <NoticeBox text="최대 2회 수정이 가능하여, 자세히 말씀 주실수록 좋아요" />
          </div>
          <div className="flex justify-center">
            <ImgPlaceholder num="⑨" label="피드백 안내 이미지" aspectRatio="4/3" className="max-w-xs" />
          </div>
        </section>

        {/* ── STEP 06: 최종 시안 전달 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[5] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="06" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug">
              최종 시안과 함께 추가된 가구가 있다면<br />링크를 함께 전달드려요
            </h3>
          </div>
          <ImgPlaceholder num="⑩" label="최종 배치안" aspectRatio="4/3" className="mb-6" />
          <div className="flex gap-3 items-start">
            <div className="w-20 shrink-0 rounded-lg overflow-hidden">
              <ImgPlaceholder num="⑪" label="제품" aspectRatio="1/1" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-400 text-[11px] mb-1">서랍형 · 옵션</p>
              <p className="text-gray-800 text-[13px] font-medium leading-snug mb-2">
                서랍형 뒤로 물리는 무다곤 타노 행거 추가 옵션이용
              </p>
              <p className="text-gray-900 font-bold text-[14px]">79,000원</p>
            </div>
          </div>
        </section>

        {/* ── STEP 07: 가구 세팅 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[6] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="07" />
          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-4">
              선정된 가구와 소품을<br />직접 세팅해드려요
            </h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              최종 확정된 가구와 소품을 실제 공간에 배치하고 세팅하는
              오프라인 방문 서비스까지 함께 진행돼요
            </p>
          </div>
          <div className="flex justify-center">
            <ImgPlaceholder num="⑫" label="가구 및 소품 세팅 안내" aspectRatio="4/3" className="max-w-xs" />
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="px-4 pb-10 pt-4">
          <button
            onClick={() => setShowSurvey(true)}
            className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all mb-3"
            style={{ background: "#111111" }}
          >
            풀 스타일링(오프라인) 신청하기
          </button>
          <button
            onClick={() => window.open("http://pf.kakao.com/_VNxiLn/chat", "_blank")}
            className="w-full py-4 rounded-full font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "#FEE500", color: "#111111" }}
          >
            상담을 받아보고 싶어요
          </button>
        </section>
      </main>
    </div>
  );
}

/* ── 공통 서브 컴포넌트 ── */
function StepBadge({ num }: { num: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1" style={{ height: "2px", background: "#d31400", borderRadius: "1px" }} />
      <div
        className="text-white font-bold text-[13px] px-4 py-1.5 rounded-full shrink-0"
        style={{ background: "#d31400" }}
      >
        STEP {num}
      </div>
      <div className="flex-1" style={{ height: "2px", background: "#d31400", borderRadius: "1px" }} />
    </div>
  );
}

function SizeRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500 text-[12px] w-10 shrink-0">{label}</span>
      <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5 flex items-center justify-between">
        <span className="text-gray-700 text-[12px]">{value}</span>
        {unit && <span className="text-gray-400 text-[11px]">{unit}</span>}
      </div>
    </div>
  );
}

function NoticeBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 bg-gray-100 rounded-lg px-3 py-2.5">
      <Bell size={14} className="text-gray-500 mt-0.5 shrink-0" />
      <p className="text-gray-600 text-[12px] leading-relaxed">{text}</p>
    </div>
  );
}
