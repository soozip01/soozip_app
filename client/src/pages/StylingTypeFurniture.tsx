/* 수집 배치솔루션 페이지 (가구 배치만 받아보고 싶어요)
 * - 상단 소개 섹션 (실제 도면 이미지 2장, 설명 텍스트)
 * - 펼치기/접기 박스 (5단계 목록, 클릭 시 해당 STEP 제목으로 스크롤)
 * - STEP 01~05 각 단계 상세 내용 (실제 이미지 반영)
 * - 최하단 상담 버튼 추가
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const TERRACOTTA = "#d31400";
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH";

const IMGS = {
  // 소개 섹션
  restType: `${CDN}/furniture-rest-type_9712ff66.png`,
  zoneType: `${CDN}/furniture-zone-type_d51a6655.png`,
  // STEP 01
  packageImg: `${CDN}/step01-package_d5ea4baa.png`,
  bearApp: `${CDN}/step01-bear-app_874180ab.png`,
  paperApp: `${CDN}/step01-paper-app_564a707d.png`,
  // STEP 02
  productLink: `${CDN}/step02-product-link_6215389f.png`,
  sizeInfo: `${CDN}/step02-size-info_5ac35040.png`,
  hardCheck: `${CDN}/step02-hard-check_301d4e7d.png`,
  // STEP 03
  step03TitleImg: `${CDN}/step03-title-img_92d4d245.png`,
  plan1: `${CDN}/step03-plan1_d49cbf7c.jpg`,
  plan2: `${CDN}/step03-plan2_06f2dfaf.jpg`,
  // STEP 04
  feedbackImg: `${CDN}/step04-feedback_474d6423.png`,
  // STEP 05
  finalImg: `${CDN}/step05-final_d7c49b56.png`,
};

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
  const stepTitleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToStep = (index: number) => {
    setIsBoxOpen(false);
    setTimeout(() => {
      const el = stepTitleRefs.current[index];
      if (el) {
        // 헤더 높이(약 57px) + STEP 위 여백 24px = 81px 오프셋
        const top = el.getBoundingClientRect().top + window.scrollY - 81;
        window.scrollTo({ top, behavior: "smooth" });
      }
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
          {/* 누끼 이미지 2장 - 배경 없이 크게 */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <img
                  src={IMGS.restType}
                  alt="휴식중심형 배치 도면"
                  className="w-full object-contain"
                  style={{ maxHeight: "180px" }}
                />
              </div>
              <p className="text-gray-500 text-[12px] text-center mt-1">휴식중심형</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full">
                <img
                  src={IMGS.zoneType}
                  alt="공간분리형 배치 도면"
                  className="w-full object-contain"
                  style={{ maxHeight: "180px" }}
                />
              </div>
              <p className="text-gray-500 text-[12px] text-center mt-1">공간분리형</p>
            </div>
          </div>

          {/* 소개 텍스트 - 정확히 두 줄, 이미지보다 작게 */}
          <h2 className="text-gray-900 font-bold text-[17px] leading-snug mb-3">
            실제 공간과 가구의 사이즈를 반영하여<br />최적의 배치를 잡아드려요
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
                {isBoxOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* 펼쳐진 목록 */}
            {isBoxOpen && (
              <div className="pb-5 border-t border-gray-100 pt-4">
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
        <section className="px-4 pt-8 pb-8">
          {/* STEP 뱃지 - 스크롤 앵커 */}
          <div ref={(el) => { stepTitleRefs.current[0] = el; }}>
            <StepBadge num="01" />
          </div>
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            배치솔루션 예약이 완료되면<br />실측 패키지가 발송돼요!
          </h3>
          <p className="text-gray-400 text-[12px] mb-5">
            자료가 있으신 경우 빠른 진행을 위해 패키지 발송이 생략됩니다
          </p>

          {/* 패키지 구성품 - 이미지 하나로 표시 */}
          <div className="rounded-xl overflow-hidden mb-5">
            <img
              src={IMGS.packageImg}
              alt="실측 패키지 구성품 (레이저 줄자, 미니 줄자, 도면 초안)"
              className="w-full object-contain"
            />
          </div>

          {/* 실측 안내 */}
          <h3 className="text-gray-900 font-bold text-[16px] leading-snug mb-3">
            줄자들을 활용하여 발송드린 온라인 도면에<br />실측값을 작성해주세요
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
              <img src={IMGS.bearApp} alt="곰돌이 앱 도면" className="w-full h-full object-cover" />
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
              <img src={IMGS.paperApp} alt="종이 도면" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* ── STEP 02 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[1] = el; }}>
            <StepBadge num="02" />
          </div>
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-6 mt-6">
            기존가구 정보 전달
          </h3>

          {/* 3장 이미지로 교체 */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMGS.productLink}
                alt="제품 링크 전달 시"
                className="w-full object-contain"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMGS.sizeInfo}
                alt="사이즈+정보 전달 시"
                className="w-full object-contain"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src={IMGS.hardCheck}
                alt="이런건 확인이 어려워요"
                className="w-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── STEP 03 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[2] = el; }}>
            <StepBadge num="03" />
          </div>
          <div className="mt-6 mb-5">
            {/* 텍스트 대신 이미지로 교체 */}
            <img
              src={IMGS.step03TitleImg}
              alt="입력해주신 정보들로 최적의 배치를 잡아드려요"
              className="w-full object-contain"
            />
          </div>
          {/* 배치안 이미지 2장 업데이트 */}
          <div className="flex flex-col gap-3">
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img src={IMGS.plan1} alt="배치안 예시 1" className="w-full object-cover" />
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img src={IMGS.plan2} alt="배치안 예시 2" className="w-full object-cover" />
            </div>
          </div>
        </section>

        {/* ── STEP 04 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[3] = el; }}>
            <StepBadge num="04" />
          </div>
          {/* 단일 이미지로 교체 */}
          <div className="mt-6">
            <img
              src={IMGS.feedbackImg}
              alt="시안에 대한 피드백을 받아 최종안을 전달드려요"
              className="w-full object-contain"
            />
          </div>
        </section>

        {/* ── STEP 05 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[4] = el; }}>
            <StepBadge num="05" />
          </div>
          {/* 단일 이미지로 교체 */}
          <div className="mt-6">
            <img
              src={IMGS.finalImg}
              alt="최종안과 함께 추가된 가구가 있다면 링크를 함께 전달드려요"
              className="w-full object-contain"
            />
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
          {/* 상담 버튼 */}
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
