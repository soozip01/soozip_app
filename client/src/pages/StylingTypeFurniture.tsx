/* 수집 배치솔루션 페이지 (가구 배치만 받아보고 싶어요)
 * - 상단 소개 섹션 (도면 이미지 2장, 설명 텍스트)
 * - 펼치기/접기 박스 (5단계 목록, 클릭 시 해당 STEP으로 스크롤)
 * - STEP 01~05 각 단계 상세 내용
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const TERRACOTTA = "#E84B1A";

// 5단계 STEP 데이터
const STEPS = [
  {
    id: "step1",
    num: "01",
    title: "배치솔루션 예약이 완료되면\n실측 패키지가 발송돼요!",
    subtitle: "자료가 있으신 경우 빠른 진행을 위해 패키지 발송이 생략됩니다",
  },
  {
    id: "step2",
    num: "02",
    title: "기존가구 정보 전달",
    subtitle: "기존가구의 제품링크 또는\n사진+사이즈 정보를 전달해주세요",
  },
  {
    id: "step3",
    num: "03",
    title: "입력해주신 정보들로\n최적의 배치를 잡아드려요!",
    subtitle: "라이프 스타일에 맞춘 최적의 배치를 제안드려요",
  },
  {
    id: "step4",
    num: "04",
    title: "시안에 대한 피드백을 받아\n최종안을 전달드려요",
    subtitle: "최대 2회 수정이 가능하기 때문에 자세하게 말씀주실수록 좋아요",
  },
  {
    id: "step5",
    num: "05",
    title: "최종안과 함께 추가된 가구가 있다면\n링크를 함께 전달드려요",
    subtitle: "",
  },
];

const STEP_LABELS = [
  "1. 배치솔루션, 어떻게 진행되나요?",
  "2. 기존가구 정보 입력하기",
  "3. 니즈에 맞는 최적의 배치 받아보기",
  "4. 피드백 및 수정",
  "5. 최종 시안 확인 및 제품 링크 전달 받기",
];

export default function StylingTypeFurniture() {
  const [, navigate] = useLocation();
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  const scrollToStep = (index: number) => {
    setIsBoxOpen(false);
    setTimeout(() => {
      const el = stepRefs.current[index];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
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

      {/* 스크롤 가능한 메인 콘텐츠 */}
      <main className="flex-1">
        {/* ── 소개 섹션 ── */}
        <section className="px-4 pt-6 pb-6">
          {/* 도면 이미지 2장 */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center gap-2">
              <div className="text-5xl">🛋️</div>
              <p className="text-gray-500 text-[11px]">휴식중심형</p>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center gap-2">
              <div className="text-5xl">🪑</div>
              <p className="text-gray-500 text-[11px]">공간분리형</p>
            </div>
          </div>

          {/* 소개 텍스트 */}
          <h2 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
            실제 공간과 가구의 사이즈를 그대로 반영하여<br />최적의 배치를 잡아드려요
          </h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            거주 하실/거주하시고 계신 공간과 기존 가구들을 실제 사이즈로 반영하여
            라이프 스타일에 맞는 최적의 배치 1~3가지를 잡아드리는 서비스에요.
            추가로 필요하신 가구가 있다면, 완성될 배치에 함께 반영해드리고 있어요
          </p>
        </section>

        {/* ── 펼치기/접기 박스 ── */}
        <section className="px-4 mb-2">
          <div className="border-t border-b border-gray-200">
            {/* 박스 헤더 */}
            <button
              onClick={() => setIsBoxOpen(!isBoxOpen)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-gray-900 font-semibold text-[14px]">
                1. 배치솔루션, 어떻게 진행되나요?
              </span>
              <div className="flex items-center gap-1" style={{ color: TERRACOTTA }}>
                <span className="text-[13px] font-semibold">
                  {isBoxOpen ? "접기" : "펼치기"}
                </span>
                {isBoxOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {/* 펼쳐진 목록 */}
            {isBoxOpen && (
              <div className="pb-5 border-t border-gray-100 pt-4">
                {/* 상단 구분선 (테라코타) */}
                <div className="h-0.5 w-8 mb-5" style={{ background: TERRACOTTA }} />
                <ul className="space-y-4">
                  {STEP_LABELS.map((label, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => scrollToStep(idx)}
                        className="text-left text-[14px] hover:underline transition-colors"
                        style={idx === 0 ? { color: TERRACOTTA, fontWeight: 600 } : { color: "#333" }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ── STEP 01 ── */}
        <section
          ref={(el) => { stepRefs.current[0] = el; }}
          className="px-4 pt-8 pb-8"
        >
          <StepBadge num="01" />
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            배치솔루션 예약이 완료되면<br />실측 패키지가 발송돼요!
          </h3>
          <p className="text-gray-500 text-[13px] mb-5">
            자료가 있으신 경우 빠른 진행을 위해 패키지 발송이 생략됩니다
          </p>
          {/* 패키지 구성품 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { emoji: "📏", label: "레이저 줄자" },
                { emoji: "📐", label: "미니 줄자" },
                { emoji: "📋", label: "도면 초안(온라인 전송)" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                    {item.emoji}
                  </div>
                  <p className="text-gray-600 text-[11px] leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* 실측 안내 */}
          <h3 className="text-gray-900 font-bold text-[16px] leading-snug mb-2">
            줄자들을 활용하여 발송드린 온라인 도면에<br />실측값을 작성해주세요
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-100 rounded-xl h-28 flex items-center justify-center text-4xl">🐻</div>
            <div className="bg-gray-100 rounded-xl h-28 flex items-center justify-center text-4xl">📝</div>
          </div>
        </section>

        {/* ── STEP 02 ── */}
        <section
          ref={(el) => { stepRefs.current[1] = el; }}
          className="px-4 pt-8 pb-8 border-t border-gray-100"
        >
          <StepBadge num="02" />
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            기존가구 정보 전달
          </h3>
          <p className="text-gray-500 text-[13px] mb-5">
            기존가구의 제품링크 또는<br />사진+사이즈 정보를 전달해주세요
          </p>

          {/* 제품 링크 전달 시 */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle />
              <p className="font-bold text-[14px]" style={{ color: TERRACOTTA }}>제품 링크 전달 시</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700 font-bold text-[13px] mb-2">기존 제품 1</p>
              <div className="space-y-1.5">
                {[["제품 링크", "http://"], ["옵션 설명", "블랙 600"]].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-[12px]">
                    <span className="text-gray-500 shrink-0 w-16">{k} :</span>
                    <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded flex-1">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 사이즈+정보 전달 시 */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle />
              <p className="font-bold text-[14px]" style={{ color: TERRACOTTA }}>사이즈+정보 전달 시</p>
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">🗄️</div>
              <div className="flex-1">
                <p className="font-bold text-[13px] mb-2">사이즈 정보</p>
                <div className="space-y-1 text-[12px]">
                  {[["제품", "수납장"], ["가로", "800 mm"], ["깊이", "400 mm"], ["높이", "740 mm"]].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-gray-500 w-8 shrink-0">{k} :</span>
                      <span className="text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 이런건 확인이 어려워요 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle />
              <p className="font-bold text-[14px] text-gray-700">이런건 확인이 어려워요</p>
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">🏠</div>
              <ul className="flex-1 space-y-1.5 text-[12px] text-gray-600">
                <li>• 제품이 제대로 보이지 않는 사진</li>
                <li>• 제품이 잘려 나온 사진</li>
                <li>• 특정 제품이 아닌 공간의 사진</li>
                <li>• 제품의 디자인이나 색상이<br />잘 보이지 않는 사진</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── STEP 03 ── */}
        <section
          ref={(el) => { stepRefs.current[2] = el; }}
          className="px-4 pt-8 pb-8 border-t border-gray-100"
        >
          <StepBadge num="03" />
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            입력해주신 정보들로<br />최적의 배치를 잡아드려요!
          </h3>
          <p className="text-gray-500 text-[13px] mb-5">
            라이프 스타일에 맞춘 최적의 배치를 제안드려요
          </p>
          <div className="flex flex-col gap-3">
            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-5xl">🏗️</div>
            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-5xl">📐</div>
          </div>
          <p className="text-gray-500 text-[13px] text-center mt-4">
            실제 공간 사이즈와 가구 배치를 고려한<br />최적의 1~3가지 배치안을 제안드려요
          </p>
        </section>

        {/* ── STEP 04 ── */}
        <section
          ref={(el) => { stepRefs.current[3] = el; }}
          className="px-4 pt-8 pb-8 border-t border-gray-100"
        >
          <StepBadge num="04" />
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            시안에 대한 피드백을 받아<br />최종안을 전달드려요
          </h3>
          <p className="text-gray-500 text-[13px] mb-5">
            최대 2회 수정이 가능하기 때문에 자세하게 말씀주실수록 좋아요
          </p>
          <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center mb-4">
            <span className="text-7xl">🐻</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 font-semibold text-[13px] text-center">
              💡 최대 2회 수정 가능<br />
              <span className="font-normal text-amber-700 text-[12px]">
                자세하게 말씀주실수록 더 만족스러운 결과를 드릴 수 있어요
              </span>
            </p>
          </div>
        </section>

        {/* ── STEP 05 ── */}
        <section
          ref={(el) => { stepRefs.current[4] = el; }}
          className="px-4 pt-8 pb-8 border-t border-gray-100"
        >
          <StepBadge num="05" />
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            최종안과 함께 추가된 가구가 있다면<br />링크를 함께 전달드려요
          </h3>
          <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-5xl mb-4">🏠</div>
          <p className="text-gray-700 font-semibold text-[14px] mb-3">추천 제품 링크 예시</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-3">
              <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-3xl mb-2">🪑</div>
              <p className="text-gray-500 text-[10px]">가구 · 생활용품</p>
              <p className="text-gray-800 text-[12px] font-medium leading-tight">
                가림용 재활수거함 흰색재 행두거지대 1P
              </p>
              <p className="text-gray-900 font-bold text-[13px] mt-1">12,900원</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-3">
              <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center text-3xl mb-2">🪞</div>
              <p className="text-gray-500 text-[10px]">가구 · 가구</p>
              <p className="text-gray-800 text-[12px] font-medium leading-tight">
                세련장 한쪽 올리는 무따옹 티보 행거 주가 옷걸이봉
              </p>
              <p className="text-gray-900 font-bold text-[13px] mt-1">79,000원</p>
            </div>
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="px-4 pb-10 pt-4">
          <div className="h-px bg-gray-100 mb-6" />
          <button
            onClick={() => window.open("https://soozipland-j3tut3mq.manus.space/", "_blank")}
            className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "#111111" }}
          >
            배치솔루션 신청하기
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
        style={{ background: "#E84B1A" }}
      >
        STEP {num}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function CheckCircle() {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "#E84B1A" }}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function XCircle() {
  return (
    <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center shrink-0">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
