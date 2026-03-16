/* 수집 배치솔루션 페이지 (가구 배치만 받아보고 싶어요)
 * - 상단 소개 섹션 (도면 예시 이미지 2장, 설명 텍스트)
 * - 펼치기/접기 박스 (5단계 목록, 클릭 시 해당 STEP 제목으로 스크롤)
 * - STEP 01~05 각 단계 상세 내용 (코드로 직접 구현)
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, Bell, ImageIcon } from "lucide-react";

const TERRACOTTA = "#d31400";

const STEP_LABELS = [
  "1. 실측 패키지 발송 및 공간 실측",
  "2. 기존가구 정보 입력하기",
  "3. 니즈에 맞는 최적의 배치 받아보기",
  "4. 피드백 및 수정",
  "5. 최종 시안 확인 및 제품 링크 전달 받기",
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

export default function StylingTypeFurniture() {
  const [, navigate] = useLocation();
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const stepTitleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToStep = (index: number) => {
    setIsBoxOpen(false);
    setTimeout(() => {
      const el = stepTitleRefs.current[index];
      if (el) {
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

      <main className="flex-1">
        {/* ── 소개 섹션 ── */}
        <section className="px-4 pt-6 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <ImgPlaceholder num="①" label="소개 이미지 1" aspectRatio="1/1" />
            <ImgPlaceholder num="②" label="소개 이미지 2" aspectRatio="1/1" />
          </div>

          <h2 className="text-gray-900 font-bold text-[17px] leading-snug mb-3">
            실제 공간과 가구의 사이즈를 반영하여<br />최적의 배치를 잡아드려요
          </h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            거주하실/거주하시고 계신 공간과 기존 가구들을 실제 사이즈로 반영하여
            라이프 스타일에 맞는 최적의 배치를 잡아드리는 서비스에요.{" "}
            추가로 필요하신 가구가 있다면, 완성될 배치에 함께 반영해드리고 있어요
          </p>
        </section>

        {/* ── 펼치기/접기 박스 ── */}
        <section className="px-4 mb-2">
          <div className="border-t border-b border-gray-200">
            <button
              onClick={() => setIsBoxOpen(!isBoxOpen)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[18px] font-serif leading-none">&ldquo;</span>
                <span className="text-gray-900 font-semibold text-[14px]">
                  배치솔루션, 어떻게 진행되나요?
                </span>
              </div>
              <div className="flex items-center gap-1" style={{ color: TERRACOTTA }}>
                <span className="text-[13px] font-semibold">
                  {isBoxOpen ? "접기" : "펼치기"}
                </span>
                {isBoxOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

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
          <div ref={(el) => { stepTitleRefs.current[0] = el; }}>
            <StepBadge num="01" />
          </div>
          <h3 className="text-gray-900 font-bold text-[18px] leading-snug mb-2 mt-6">
            배치솔루션 예약이 완료되면<br />실측 패키지가 발송돼요!
          </h3>
          <p className="text-gray-400 text-[11px] mb-5">
            자료가 있으신 경우 빠른 진행을 위해 패키지 발송이 생략됩니다
          </p>

          {/* 도면 초안 카드 */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 w-full max-w-[200px]">
              <ImgPlaceholder num="③" label="도면 초안" aspectRatio="1/1" />
              <span className="text-gray-700 text-[13px] font-medium text-center">도면 초안</span>
              <span className="text-gray-400 text-[11px] text-center">(온라인 전송)</span>
            </div>
          </div>

          <h3 className="text-gray-900 font-bold text-[16px] leading-snug mb-3">
            발송드린 온라인 도면에<br />실측값을 작성해주세요
          </h3>
        </section>

        {/* ── STEP 02 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[1] = el; }}>
            <StepBadge num="02" />
          </div>

          <div className="mt-6 mb-6">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-2">
              기존가구 정보 전달
            </h3>
            <p className="text-gray-500 text-[14px] leading-relaxed">
              기존가구의 제품링크 또는<br />사진+사이즈 정보를 전달해주세요
            </p>
          </div>

          {/* 제품 링크 전달 시 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} style={{ color: TERRACOTTA }} fill={TERRACOTTA} className="text-white shrink-0" />
              <span className="font-bold text-[15px]" style={{ color: TERRACOTTA }}>제품 링크 전달 시</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 font-bold text-[15px] mb-3">기존 제품 1</p>
              <div className="space-y-2">
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
          <div className="mb-6">
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
                  <p className="text-gray-800 font-bold text-[14px] mb-2">사이즈 정보</p>
                  <div className="space-y-1.5">
                    <SizeRow label="제품 :" value="수납장" />
                    <SizeRow label="가로 :" value="800" unit="mm" />
                    <SizeRow label="깊이 :" value="400" unit="mm" />
                    <SizeRow label="높이 :" value="740" unit="mm" />
                  </div>
                  <p className="text-gray-500 text-[12px] mt-2">특이사항</p>
                  <div className="bg-white border border-gray-200 rounded px-2 py-1.5 mt-1">
                    <span className="text-gray-500 text-[12px]">여닫이 제품이에요</span>
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
                <ul className="flex-1 space-y-2.5 pt-1">
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
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[2] = el; }}>
            <StepBadge num="03" />
          </div>

          <div className="mt-6 mb-5">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-2">
              입력해주신 정보들로<br />최적의 배치를 잡아드려요!
            </h3>
            <p className="text-gray-500 text-[14px] mb-3">
              라이프 스타일에 맞춘 최적의 배치를 제안드려요
            </p>
            <NoticeBox text="공간에 따라 제안되는 시안의 갯수는 1~3가지로 달라질 수 있어요" />
          </div>

          <div className="flex flex-col gap-3">
            <ImgPlaceholder num="⑥" label="배치안 예시 1" aspectRatio="4/3" />
            <ImgPlaceholder num="⑦" label="배치안 예시 2" aspectRatio="4/3" />
          </div>
        </section>

        {/* ── STEP 04 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[3] = el; }}>
            <StepBadge num="04" />
          </div>

          <div className="mt-6 mb-5">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
              시안에 대한 피드백을 받아<br />최종안을 전달드려요
            </h3>
            <NoticeBox text="최대 2회 수정이 가능하기 때문에 자세하게 말씀 주실수록 좋아요" />
          </div>

          <div className="flex justify-center mt-4">
            <ImgPlaceholder num="⑧" label="피드백 안내 이미지" aspectRatio="4/3" className="max-w-xs" />
          </div>
        </section>

        {/* ── STEP 05 ── */}
        <section className="px-4 pt-8 pb-8 border-t border-gray-100">
          <div ref={(el) => { stepTitleRefs.current[4] = el; }}>
            <StepBadge num="05" />
          </div>

          <div className="mt-6 mb-5">
            <h3 className="text-gray-900 font-bold text-[20px] leading-snug mb-3">
              최종안과 함께 추가된 가구가 있다면<br />링크를 함께 전달드려요
            </h3>
          </div>

          <ImgPlaceholder num="⑨" label="최종 배치안 이미지" aspectRatio="4/3" className="mb-4" />

          <div className="flex gap-3 items-start">
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <ImgPlaceholder num="⑩" label="제품" aspectRatio="1/1" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-400 text-[11px] mb-0.5">서랍형 · 옵션</p>
              <p className="text-gray-800 text-[13px] font-medium leading-snug mb-1">
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
