/* 수집 홈 스타일링 메인 페이지
 * 레퍼런스: 첫 번째 사진 (수집 홈 스타일링)
 * - 홈 스타일링 타입이 궁금해요 / 홈 스타일링 예약하기 카드
 * - 빠른 상담 설문 버튼 / 먼저 상담 받기 버튼
 * - 수집 스타일링샷 보러가기 링크
 */
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function StylingMain() {
  const [, navigate] = useLocation();

  const handleSurvey = () => {
    window.open("https://soozipland-j3tut3mq.manus.space/", "_blank");
  };

  const handleKakaoChat = () => {
    window.open("http://pf.kakao.com/_VNxiLn/chat", "_blank");
  };

  const handleStylingShot = () => {
    window.open("https://soozip.co.kr/portfolio/list.html?cate_no=97", "_blank");
  };

  const handleReservation = () => {
    toast.info("홈 스타일링 예약하기 기능이 준비 중입니다.");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          수집 홈 스타일링
        </h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 pt-8 pb-10 flex flex-col gap-6">
        {/* 상단 카드 2개 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 홈 스타일링 타입이 궁금해요 */}
          <button
            onClick={() => navigate("/styling/types")}
            className="bg-gray-100 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[200px] hover:bg-gray-150 active:scale-[0.97] transition-all"
          >
            <p className="text-gray-900 font-bold text-[15px] leading-snug">
              홈 스타일링<br />타입이 궁금해요
            </p>
            <div className="flex justify-end mt-4">
              <span className="text-3xl">🏠</span>
            </div>
          </button>

          {/* 홈 스타일링 예약하기 */}
          <button
            onClick={handleReservation}
            className="bg-gray-100 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[200px] hover:bg-gray-150 active:scale-[0.97] transition-all"
          >
            <p className="text-gray-900 font-bold text-[15px] leading-snug">
              홈 스타일링<br />예약하기
            </p>
            <div className="flex justify-end mt-4">
              <span className="text-3xl">📅</span>
            </div>
          </button>
        </div>

        {/* 하단 버튼 2개 */}
        <div className="flex flex-col gap-3 mt-2">
          {/* 빠른 상담 설문 버튼 */}
          <button
            onClick={handleSurvey}
            className="w-full py-4 rounded-full text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "#111111" }}
          >
            빠른 상담을 위해 설문을 먼저 작성할게요
          </button>

          {/* 먼저 상담 받기 버튼 (카카오 노란색) */}
          <button
            onClick={handleKakaoChat}
            className="w-full py-4 rounded-full font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "#FEE500", color: "#111111" }}
          >
            먼저 상담을 받아보고 싶어요
          </button>
        </div>

        {/* 수집 스타일링샷 보러가기 */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleStylingShot}
            className="text-gray-800 font-semibold text-sm underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            수집 스타일링샷 보러가기
          </button>
        </div>
      </main>
    </div>
  );
}
