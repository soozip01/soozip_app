/* 수집 배치솔루션 페이지 (가구 배치만 받아보고 싶어요)
 * - 상단 소개 섹션 (도면 예시 이미지 2장, 설명 텍스트)
 * - STEP 박스: sticky 고정 + IntersectionObserver로 현재 단계 자동 변경
 * - STEP 01~05 각 단계 상세 내용
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, XCircle, Bell } from "lucide-react";

const TERRACOTTA = "#d31400";

// CDN 이미지 URL 매핑
const IMG = {
  1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-1_edc6cc5f.png",
  2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-2_3d2bc782.png",
  3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-3_5fa1c0fc.png",
  4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-4_1930ace5.png",
  5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-5_7efdb40c.png",
  6: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-6_93525efd.jpg",
  7: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-7_8f8e2299.jpg",
  8: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-8_0e5cab5e.png",
  9: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-9_3a98f947.jpg",
  10: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-10_2cd6493b.png",
  11: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-11_fa4191ff.png",
  12: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/furniture-12_0c1e3f7a.png",
};

const STEP_LABELS = [
  "1. 공간 실측",
  "2. 기존 가구 정보 전달",
  "3. 배치 솔루션 제안",
  "4. 피드백 및 수정",
  "5. 최종안 및 제품 링크 전달",
];

export default function StylingTypeFurniture() {
  const [, navigate] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const stepSectionRefs = useRef<(HTMLElement | null)[]>([]);

  // IntersectionObserver: 각 STEP 섹션이 뷰포트 상단 40% 이내에 들어오면 activeStep 변경
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepSectionRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(idx);
            }
          });
        },
        {
          rootMargin: "-30% 0px -60% 0px",
          threshold: 0,
        }
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
          수집 배치솔루션
        </h1>
      </header>

      {/* ── sticky STEP 진행 박스 ── */}
      <div className="sticky top-[57px] z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3">
          {/* 활성 STEP 버튼 좌우에 빨간 선이 뻗는 레이아웃 */}
          <div className="flex items-center">
            {/* 왼쪽 비활성 번호들 + 선 */}
            {STEP_LABELS.slice(0, activeStep).map((_, idx) => (
              <div key={`left-${idx}`} className="flex items-center shrink-0">
                <button
                  onClick={() => scrollToStep(idx)}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                  style={{ background: "#e5e7eb", color: "#9ca3af" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </button>
                <div className="shrink-0 mx-1" style={{ width: "12px", height: "2.5px", background: "#d31400", borderRadius: "1px" }} />
              </div>
            ))}

            {/* 활성 STEP 버튼 (좌우 선 포함) */}
            <div className="flex items-center flex-1 min-w-0">
              {activeStep > 0 && (
                <div className="flex-1 mr-1.5" style={{ height: "2.5px", background: "#d31400", borderRadius: "1px" }} />
              )}
              <button
                onClick={() => scrollToStep(activeStep)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-300"
                style={{ background: TERRACOTTA }}
              >
                <span className="text-[11px] font-bold text-white whitespace-nowrap">
                  STEP {String(activeStep + 1).padStart(2, "0")}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] text-white">
                  {STEP_LABELS[activeStep].replace(/^\d+\.\s*/, "")}
                </span>
              </button>
              {activeStep < STEP_LABELS.length - 1 && (
                <div className="flex-1 ml-1.5" style={{ height: "2.5px", background: "#d31400", borderRadius: "1px" }} />
              )}
            </div>

            {/* 오른쪽 비활성 번호들 + 선 */}
            {STEP_LABELS.slice(activeStep + 1).map((_, i) => {
              const idx = activeStep + 1 + i;
              return (
                <div key={`right-${idx}`} className="flex items-center shrink-0">
                  {i > 0 && (
                    <div className="shrink-0 mx-1" style={{ width: "12px", height: "2.5px", background: "#d31400", borderRadius: "1px" }} />
                  )}
                  <button
                    onClick={() => scrollToStep(idx)}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                    style={{ background: "#f3f4f6", color: "#9ca3af" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* ── 소개 섹션 ── */}
        <section className="px-4 pt-8 pb-8">
          {/* ①② 소개 이미지 2장 — 원본 비율(세로형) 유지, 2열 그리드 */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[1]}
                alt="소개 이미지 1"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[2]}
                alt="소개 이미지 2"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <h2 className="text-gray-900 font-bold text-[17px] leading-snug mb-4">
            실제 공간과 가구의 사이즈를 반영하여<br />최적의 배치를 잡아드려요
          </h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            거주하실/거주하시고 계신 공간과 기존 가구들을 실제 사이즈로 반영하여
            라이프 스타일에 맞는 최적의 배치를 잡아드리는 서비스에요.{" "}
            추가로 필요하신 가구가 있다면, 완성될 배치에 함께 반영해드리고 있어요
          </p>
        </section>

        {/* ── STEP 01 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[0] = el; }}
          className="pt-8 pb-10 border-t border-gray-100"
        >
          <div className="px-4">
            <StepBadge num="01" />
          </div>
          <div className="px-4 mt-7 mb-6">
            <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-3">
              배치솔루션 예약이 완료되면<br />실측 패키지가 발송돼요!
            </h3>
            <p className="text-gray-400 text-[11px]">
              자료가 있으신 경우 빠른 진행을 위해 패키지 발송이 생략됩니다
            </p>
          </div>

          {/* ③ 도면 초안 — 좌우 여백 2배(px-8) */}
          <div className="px-8 mb-7">
            <img
              src={IMG[3]}
              alt="도면 초안"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="px-4 mb-6">
            <h3 className="text-gray-900 font-bold text-[16px] leading-snug">
              줄자들을 활용하여 발송드린 온라인 도면에<br />실측값을 작성해주세요
            </h3>
          </div>

          {/* STEP 01 추가 이미지 — 좌우 2장 */}
          <div className="px-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[11]}
                alt="실측 이미지 1"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[12]}
                alt="실측 이미지 2"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── STEP 02 ── */}
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
                {/* ④ 가구 사진 — 원본 비율 유지 */}
                <div className="w-28 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={IMG[4]}
                    alt="가구 사진"
                    className="w-full h-auto object-contain rounded-lg"
                  />
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
                {/* ⑤ 공간 사진 — 원본 비율 유지 */}
                <div className="w-28 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={IMG[5]}
                    alt="공간 사진"
                    className="w-full h-auto object-contain rounded-lg"
                  />
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

        {/* ── STEP 03 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[2] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="03" />

          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
              입력해주신 정보들로<br />최적의 배치를 잡아드려요!
            </h3>
            <p className="text-gray-500 text-[14px] mb-4">
              라이프 스타일에 맞춘 최적의 배치를 제안드려요
            </p>
            <NoticeBox text="공간에 따라 제안되는 시안의 갯수는 달라질 수 있어요" />
          </div>

          {/* ⑥⑦ 배치안 예시 — 원본 가로형 비율 유지 */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[6]}
                alt="배치안 예시 1"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMG[7]}
                alt="배치안 예시 2"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── STEP 04 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[3] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="04" />

          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-4">
              시안에 대한 피드백을 받아<br />최종안을 전달드려요
            </h3>
            <NoticeBox text="최대 2회 수정이 가능하여, 자세히 말씀 주실수록 좋아요" />
          </div>

          {/* ⑧ 피드백 안내 이미지 — 원본 비율 유지 */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs rounded-xl overflow-hidden">
              <img
                src={IMG[8]}
                alt="피드백 안내 이미지"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── STEP 05 ── */}
        <section
          ref={(el) => { stepSectionRefs.current[4] = el; }}
          className="px-4 pt-8 pb-10 border-t border-gray-100"
        >
          <StepBadge num="05" />

          <div className="mt-7 mb-7">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug">
              최종안과 함께 추가된 가구가 있다면<br />링크를 함께 전달드려요
            </h3>
          </div>

          {/* ⑨ 최종 배치안 — 원본 가로형 비율 유지 */}
          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src={IMG[9]}
              alt="최종 배치안"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="flex gap-3 items-start">
            {/* ⑩ 제품 이미지 — 원본 세로형 비율 유지 */}
            <div className="w-20 shrink-0 rounded-lg overflow-hidden">
              <img
                src={IMG[10]}
                alt="제품"
                className="w-full h-auto object-contain rounded-lg"
              />
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

        {/* 하단 CTA */}
        <section className="px-4 pb-10 pt-4">
          <button
            onClick={() => window.open("https://soozipland-j3tut3mq.manus.space/", "_blank")}
            className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all mb-3"
            style={{ background: "#111111" }}
          >
            배치솔루션 신청하기
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
      <div className="flex-1 h-px bg-gray-200" />
      <div
        className="text-white font-bold text-[13px] px-4 py-1.5 rounded-full shrink-0"
        style={{ background: "#d31400" }}
      >
        STEP {num}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
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
