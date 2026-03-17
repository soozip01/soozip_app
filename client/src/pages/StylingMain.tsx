/* 수집 홈 스타일링 메인 페이지
 * 레퍼런스: 첫 번째 사진 (수집 홈 스타일링)
 * - 홈 스타일링 타입이 궁금해요 / 홈 스타일링 예약하기 카드
 * - 빠른 상담 설문 버튼 / 먼저 상담 받기 버튼
 * - 수집 스타일링샷 보러가기 링크
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, X, Search, FileText } from "lucide-react";
import SurveyOverlay from "@/components/SurveyOverlay";

export default function StylingMain() {
  const [, navigate] = useLocation();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  const handleSurvey = () => {
    setShowSurvey(true);
  };

  const handleKakaoChat = () => {
    window.open("http://pf.kakao.com/_VNxiLn/chat", "_blank");
  };

  const handleStylingShot = () => {
    window.open("https://soozip.co.kr/portfolio/list.html?cate_no=97", "_blank");
  };

  const handleReservation = () => {
    setShowReservationModal(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
      {/* soozipland 설문 오버레이 */}
      {showSurvey && (
        <SurveyOverlay
          url="https://soozipland-j3tut3mq.manus.space/"
          title="스타일링 신청서"
          onClose={() => setShowSurvey(false)}
        />
      )}
      {/* 예약 방식 선택 모달 */}
      {showReservationModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowReservationModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">예약 방식 선택</h2>
              <button
                onClick={() => setShowReservationModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 방식 1: 디자이너 직접 선택 */}
            <button
              onClick={() => { setShowReservationModal(false); navigate("/designers"); }}
              className="w-full flex items-start gap-4 p-4 rounded-2xl mb-3 text-left active:scale-[0.98] transition-all border-2 border-gray-100 hover:border-gray-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#EEEEEE" }}
              >
                <Search size={22} className="text-gray-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[15px] mb-1">디자이너 직접 선택</p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  프로필과 포트폴리오를 보고<br />마음에 드는 디자이너에게 직접 예약해요
                </p>
              </div>
            </button>

            {/* 방식 2: 신청서 작성 후 제안 받기 */}
            <button
              onClick={() => { setShowReservationModal(false); navigate("/styling-request-embed"); }}
              className="w-full flex items-start gap-4 p-4 rounded-2xl text-left active:scale-[0.98] transition-all border-2 border-gray-100 hover:border-gray-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#EEEEEE" }}
              >
                <FileText size={22} className="text-gray-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-[15px] mb-1">신청서 작성 후 제안 받기</p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  간단한 신청서를 작성하면<br />디자이너들이 먼저 연락을 드려요
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
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
            className="rounded-2xl p-5 text-left flex flex-col justify-between min-h-[200px] active:scale-[0.97] transition-all"
            style={{ backgroundColor: "#EEEEEE" }}
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
            className="rounded-2xl p-5 text-left flex flex-col justify-between min-h-[200px] active:scale-[0.97] transition-all"
            style={{ backgroundColor: "#EEEEEE" }}
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
