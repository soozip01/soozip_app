/* 수집 홈 스타일링 타입 페이지
 * - 안내 배너: "원하시는 타입을 누르면 진행 과정을 볼 수 있어요"
 * - 가구 배치만 / 풀 스타일링(온라인) / 풀 스타일링(오프라인) / 자주 묻는 질문 카드
 * - 글씨 크기 비율 통일, 추천 텍스트 한 줄, FAQ 이모티콘 우측 하단
 * - 두 도형 내부 간격 통일, 세부항목 행간 좁힘
 */
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function StylingTypes() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate("/styling")}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          수집 홈 스타일링 타입
        </h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 pt-6 pb-10 flex flex-col gap-4">
        {/* 안내 배너 */}
        <div
          className="w-full rounded-2xl px-5 py-4 text-center"
          style={{ background: "#111111" }}
        >
          <p className="text-white font-bold text-[14px] leading-snug">
            원하시는 타입을 누르면 진행 과정을 볼 수 있어요
          </p>
        </div>

        {/* 타입 카드 2x2 그리드 */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* 가구 배치만 받아보고 싶어요 */}
          <button
            onClick={() => navigate("/styling/types/furniture")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col min-h-[200px] hover:bg-gray-200 active:scale-[0.97] transition-all"
          >
            {/* 제목 영역 - 고정 높이로 통일 */}
            <div className="mb-3">
              <p className="text-gray-900 font-bold text-[15px] leading-snug">
                가구 배치만<br />받아보고 싶어요
              </p>
            </div>
            {/* 추천 영역 */}
            <p className="text-gray-500 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
            <ul className="flex flex-col gap-0.5">
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">기존가구를 주로 활용하실 분</span>
              </li>
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">새로 산 가구들을 배치만</span>
              </li>
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5"></span>
                <span className="whitespace-nowrap">해보고 싶으신 분</span>
              </li>
            </ul>
          </button>

          {/* 풀 스타일링 (온라인) - 인기 뱃지 */}
          <button
            onClick={() => navigate("/styling/types/full-online")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col min-h-[200px] hover:bg-gray-200 active:scale-[0.97] transition-all relative"
          >
            {/* 인기 뱃지 */}
            <div className="absolute top-3 left-3">
              <span
                className="text-white text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#E84B1A" }}
              >
                인기
              </span>
            </div>
            {/* 제목 영역 - 뱃지 높이만큼 mt 추가해서 가구 배치 카드와 추천 위치 맞춤 */}
            <div className="mt-7 mb-3">
              <p className="text-gray-900 font-bold text-[15px] leading-snug">
                풀 스타일링을<br />받아보고 싶어요
              </p>
              <p className="text-gray-500 text-[12px] mt-0.5">(온라인 전용)</p>
            </div>
            {/* 추천 영역 */}
            <p className="text-gray-500 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
            <ul className="flex flex-col gap-0.5">
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">곧 입주 또는 입주 직후이신 분</span>
              </li>
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">빠르게 결과를 보고 싶으신 분</span>
              </li>
            </ul>
          </button>

          {/* 풀 스타일링 (오프라인) */}
          <button
            onClick={() => navigate("/styling/types/full-offline")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col min-h-[200px] hover:bg-gray-200 active:scale-[0.97] transition-all"
          >
            {/* 제목 영역 */}
            <div className="mb-3">
              <p className="text-gray-900 font-bold text-[15px] leading-snug">
                풀 스타일링을<br />받아보고 싶어요
              </p>
              <p className="text-gray-500 text-[12px] mt-0.5">(오프라인 전용)</p>
            </div>
            {/* 추천 영역 */}
            <p className="text-gray-500 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
            <ul className="flex flex-col gap-0.5">
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">곧 입주 또는 입주 직후이신 분</span>
              </li>
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">대면 상담이 필요하신 분</span>
              </li>
              <li className="text-gray-600 text-[11px] flex items-start gap-1">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="whitespace-nowrap">공간 세팅까지 희망하시는 분</span>
              </li>
            </ul>
          </button>

          {/* 자주 묻는 질문 - 이모티콘 우측 하단 */}
          <button
            onClick={() => navigate("/styling/faq")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col min-h-[200px] hover:bg-gray-200 active:scale-[0.97] transition-all relative"
          >
            <p className="text-gray-900 font-bold text-[15px] leading-snug">
              자주 묻는 질문
            </p>
            {/* 이모티콘 우측 하단 */}
            <div className="absolute bottom-4 right-4">
              <span className="text-4xl">💬</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
