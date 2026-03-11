/* 수집 홈 스타일링 타입 페이지
 * - 배치 솔루션 / 풀 스타일링(온라인) / 풀 스타일링(오프라인) / 자주 묻는 질문
 * - 1번 사진 기준 2x2 그리드 레이아웃
 */
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function StylingTypes() {
  const [, navigate] = useLocation();

  // 인기 뱃지 높이(약 24px) + gap(12px) = 36px 고정 상단 여백으로 모든 카드 제목 위치 통일
  const TITLE_TOP = "pt-9"; // ~36px, 인기 뱃지 카드 기준

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
      <main className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-3">
        {/* 안내 배너 */}
        <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-center">
          <p className="text-white text-[12px] font-medium whitespace-nowrap">
            원하시는 타입을 누르면 진행 과정을 볼 수 있어요
          </p>
        </div>

        {/* 타입 카드 2x2 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 배치 솔루션 */}
          <button
            onClick={() => navigate("/styling/types/furniture")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col active:scale-[0.97] transition-all"
            style={{ minHeight: "210px" }}
          >
            {/* 인기 뱃지 자리 (투명 spacer) */}
            <div className="h-6 mb-1" />
            <div className="mb-auto">
              <p className="text-gray-900 font-bold text-[18px] leading-snug">
                배치 솔루션
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
              <ul className="flex flex-col gap-1">
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 기존가구를 주로 활용하실 분
                </li>
                <li className="text-gray-600 text-[8px] leading-snug">
                  • 새로 산 가구들을 배치만<br />해보고 싶으신 분
                </li>
              </ul>
            </div>
          </button>

          {/* 풀 스타일링 (온라인 전용) - 인기 뱃지 포함 */}
          <button
            onClick={() => navigate("/styling/types/full-online")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col active:scale-[0.97] transition-all"
            style={{ minHeight: "210px" }}
          >
            {/* 인기 뱃지 */}
            <div className="h-6 mb-1 flex items-center">
              <span
                className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#d31400" }}
              >
                인기
              </span>
            </div>
            <div className="mb-auto">
              <p className="text-gray-900 font-bold text-[18px] leading-snug">
                풀 스타일링
              </p>
              <p className="text-black text-[11px] mt-0.5">(온라인 전용)</p>
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
              <ul className="flex flex-col gap-1">
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 곧 입주 또는 입주 직후이신 분
                </li>
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 빠르게 결과를 보고 싶으신 분
                </li>
              </ul>
            </div>
          </button>

          {/* 풀 스타일링 (오프라인 전용) */}
          <button
            onClick={() => navigate("/styling/types/full-offline")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col active:scale-[0.97] transition-all"
            style={{ minHeight: "210px" }}
          >
            {/* 인기 뱃지 자리 (투명 spacer) */}
            <div className="h-6 mb-1" />
            <div className="mb-auto">
              <p className="text-gray-900 font-bold text-[18px] leading-snug">
                풀 스타일링
              </p>
              <p className="text-black text-[11px] mt-0.5">(오프라인 전용)</p>
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-[11px] font-semibold mb-1.5">이런 분께 추천해요!</p>
              <ul className="flex flex-col gap-1">
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 곧 입주 또는 입주 직후이신 분
                </li>
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 대면 상담이 필요하신 분
                </li>
                <li className="text-gray-600 text-[8px] leading-snug whitespace-nowrap">
                  • 공간 세팅까지 희망하시는 분
                </li>
              </ul>
            </div>
          </button>

          {/* 자주 묻는 질문 */}
          <button
            onClick={() => navigate("/styling/faq")}
            className="bg-gray-100 rounded-2xl p-4 text-left flex flex-col active:scale-[0.97] transition-all relative overflow-hidden"
            style={{ minHeight: "210px" }}
          >
            {/* 인기 뱃지 자리 (투명 spacer) */}
            <div className="h-6 mb-1" />
            <p className="text-gray-900 font-bold text-[18px] leading-snug">
              자주 묻는 질문
            </p>
            {/* 이모티콘 우측 하단 */}
            <div className="absolute bottom-4 right-4">
              <span className="text-5xl leading-none select-none">💬</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
