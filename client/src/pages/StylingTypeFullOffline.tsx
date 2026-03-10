/* 풀 스타일링 (오프라인 전용) - 타입 상세 페이지 */
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const STEPS = [
  {
    step: 1,
    emoji: "📋",
    title: "설문 작성",
    desc: "공간 정보, 예산, 원하는 스타일 등 상세 정보를 작성해주세요.",
  },
  {
    step: 2,
    emoji: "💬",
    title: "초기 상담",
    desc: "스타일리스트와 전화 또는 온라인으로 초기 상담을 진행합니다.",
  },
  {
    step: 3,
    emoji: "🏠",
    title: "현장 방문 상담",
    desc: "스타일리스트가 직접 고객님의 공간을 방문하여 상세 측정 및 상담을 진행합니다.",
  },
  {
    step: 4,
    emoji: "🎨",
    title: "스타일링 플랜 제안",
    desc: "가구 배치, 소품, 컬러 팔레트, 구매 리스트를 포함한 완성된 플랜을 제안합니다.",
  },
  {
    step: 5,
    emoji: "🛒",
    title: "제품 구매 및 세팅",
    desc: "수집 입점 브랜드 제품 구매를 도와드리고, 직접 공간 세팅까지 진행합니다.",
  },
  {
    step: 6,
    emoji: "📷",
    title: "완성 촬영 및 마무리",
    desc: "완성된 공간을 전문적으로 촬영하여 제공해드립니다.",
  },
];

export default function StylingTypeFullOffline() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate("/styling/types")}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          풀 스타일링 (오프라인)
        </h1>
      </header>

      <main className="flex-1 px-4 pt-6 pb-10 flex flex-col gap-5">
        {/* 타입 소개 카드 */}
        <div className="bg-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏘️</span>
            <div>
              <p className="font-bold text-gray-900 text-base">풀 스타일링 (오프라인 전용)</p>
              <p className="text-gray-500 text-xs mt-0.5">스타일리스트가 직접 방문하는 프리미엄 서비스</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-1">
            <p className="text-gray-500 text-[11px] font-semibold mb-2">이런 분께 추천해요!</p>
            <ul className="space-y-1.5">
              <li className="text-gray-700 text-[12px] flex items-start gap-1.5">
                <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                <span>곧 입주 또는 입주 직후이신 분</span>
              </li>
              <li className="text-gray-700 text-[12px] flex items-start gap-1.5">
                <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                <span>대면 상담이 필요하신 분</span>
              </li>
              <li className="text-gray-700 text-[12px] flex items-start gap-1.5">
                <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                <span>공간 세팅까지 희망하시는 분</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 진행 과정 */}
        <div>
          <p className="font-bold text-gray-900 text-sm mb-3">진행 과정</p>
          <div className="flex flex-col gap-3">
            {STEPS.map((item, idx) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: "#111111" }}
                  >
                    {item.step}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="w-0.5 h-5 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="font-bold text-gray-900 text-[13px]">{item.title}</p>
                  </div>
                  <p className="text-gray-600 text-[12px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 신청 버튼 */}
        <button
          onClick={() => navigate("/styling-request")}
          className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all mt-2"
          style={{ background: "#111111" }}
        >
          빠른 상담을 위해 설문을 먼저 작성할게요
        </button>
        <button
          onClick={() => window.open("http://pf.kakao.com/_VNxiLn/chat", "_blank")}
          className="w-full py-4 rounded-full font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: "#FEE500", color: "#111111" }}
        >
          먼저 상담을 받아보고 싶어요
        </button>
      </main>
    </div>
  );
}
