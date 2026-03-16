/* 수집 홈 스타일링 타입 페이지
 * - 배치 솔루션 / 풀 스타일링(온라인) / 풀 스타일링(오프라인) / 자주 묻는 질문
 * - 카드 배경: #EEEEEE, 추천 패널 배경: #D0D0D0
 * - 확성기 아이콘 클릭 시 추천 내용 패널 토글
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";

const MEGAPHONE_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/megaphone-icon_3f83e0cf.png";

/* ─── 타입 카드 데이터 ─── */
const CARD_DATA = [
  {
    id: "furniture",
    title: "배치 솔루션",
    subtitle: "(온라인 전용)",
    popular: false,
    navigateTo: "/styling/types/furniture",
    recommendations: [
      "기존가구를 주로 활용하실 분",
      "새로 산 가구들을 배치만 해보고 싶으신 분",
    ],
  },
  {
    id: "full-online",
    title: "풀 스타일링",
    subtitle: "(온라인 전용)",
    popular: true,
    navigateTo: "/styling/types/full-online",
    recommendations: [
      "곧 입주하실 분",
      "최근 입주하신 분",
      "빠르게 결과를 보고 싶으신 분",
    ],
  },
  {
    id: "full-offline",
    title: "풀 스타일링",
    subtitle: "(오프라인 전용)",
    popular: false,
    navigateTo: "/styling/types/full-offline",
    recommendations: [
      "곧 입주하실 분",
      "최근 입주하신 분",
      "대면 상담이 필요하신 분",
      "공간 세팅까지 희망하시는 분",
    ],
  },
];

/* ─── 타입 카드 컴포넌트 ─── */
function TypeCard({
  card,
  onNavigate,
}: {
  card: (typeof CARD_DATA)[0];
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleMegaphoneClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭(navigate) 방지
    setOpen((v) => !v);
  };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.97] transition-all"
      style={{ backgroundColor: "#EEEEEE", minHeight: "200px" }}
      onClick={() => !open && onNavigate(card.navigateTo)}
    >
      {/* 인기 뱃지 or 스페이서 */}
      <div className="h-6 mb-1 flex items-center">
        {card.popular && (
          <span
            className="text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: "#d31400" }}
          >
            인기
          </span>
        )}
      </div>

      {/* 제목 */}
      <div className="mb-auto">
        <p className="text-gray-900 font-bold text-[18px] leading-tight whitespace-nowrap">
          {card.title}
        </p>
        <p className="text-gray-700 text-[11px] mt-0.5 whitespace-nowrap">
          {card.subtitle}
        </p>
      </div>

      {/* 확성기 + 추천 버튼 */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleMegaphoneClick}
          className="flex items-center gap-1.5 shrink-0"
          aria-label="이런 분께 추천해요 토글"
        >
          <img
            src={MEGAPHONE_URL}
            alt="확성기"
            className="w-6 h-6 object-contain"
          />
        </button>
        {!open && (
          <button
            onClick={handleMegaphoneClick}
            className="text-[11px] font-semibold text-gray-600 bg-white/60 rounded-full px-3 py-1 whitespace-nowrap"
          >
            이런 분께 추천해요!
          </button>
        )}
      </div>

      {/* 추천 내용 패널 (토글) */}
      {open && (
        <div
          className="absolute inset-0 rounded-2xl p-4 flex flex-col"
          style={{ backgroundColor: "#D0D0D0" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="닫기"
            >
              <ChevronDown size={18} className="text-gray-700" />
            </button>
          </div>

          {/* 추천 목록 */}
          <ul className="flex flex-col gap-2 flex-1">
            {card.recommendations.map((rec, i) => (
              <li key={i} className="text-gray-800 text-[12px] leading-snug whitespace-nowrap">
                • {rec}
              </li>
            ))}
          </ul>

          {/* 하단 확성기 */}
          <div className="mt-auto pt-2">
            <img
              src={MEGAPHONE_URL}
              alt="확성기"
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
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
      <main className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-4">
        {/* 안내 배너 */}
        <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-center">
          <p className="text-white text-[12px] font-medium whitespace-nowrap">
            원하시는 타입을 누르면 진행 과정을 볼 수 있어요
          </p>
        </div>

        {/* 타입 카드 2x2 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {CARD_DATA.map((card) => (
            <TypeCard key={card.id} card={card} onNavigate={navigate} />
          ))}

          {/* 자주 묻는 질문 카드 (별도 - 추천 패널 없음) */}
          <div
            className="rounded-2xl p-4 flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.97] transition-all"
            style={{ backgroundColor: "#EEEEEE", minHeight: "200px" }}
            onClick={() => navigate("/styling/faq")}
          >
            <div className="h-6 mb-1" />
            <p className="text-gray-900 font-bold text-[18px] leading-tight whitespace-nowrap">
              자주 묻는 질문
            </p>
            {/* 말풍선 이모지 우측 하단 */}
            <div className="absolute bottom-4 right-4">
              <span className="text-5xl leading-none select-none">💬</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
