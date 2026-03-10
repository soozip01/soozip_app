/* 자주 묻는 질문 페이지 */
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: 1,
    question: "홈 스타일링 서비스는 어떻게 진행되나요?",
    answer:
      "설문 작성 → 스타일리스트 매칭 → 상담 진행 → 스타일링 플랜 제안 → 최종 확인 순서로 진행됩니다. 서비스 타입에 따라 온라인 또는 오프라인으로 진행됩니다.",
  },
  {
    id: 2,
    question: "서비스 비용은 얼마인가요?",
    answer:
      "서비스 타입과 공간 규모에 따라 비용이 다릅니다. 가구 배치 서비스는 상담 후 안내드리며, 풀 스타일링은 공간 크기와 요구사항에 따라 맞춤 견적을 제공합니다. 카카오 채널로 문의해주세요.",
  },
  {
    id: 3,
    question: "서비스 지역이 어디까지인가요?",
    answer:
      "온라인 서비스는 전국 어디서나 가능합니다. 오프라인 방문 서비스는 현재 수도권(서울, 경기, 인천) 지역을 중심으로 운영 중이며, 지방 서비스는 별도 문의해주세요.",
  },
  {
    id: 4,
    question: "스타일링 결과물은 어떻게 받을 수 있나요?",
    answer:
      "온라인 서비스의 경우 2D/3D 배치 플랜, 제품 추천 리스트, 컬러 팔레트 등을 파일로 제공합니다. 오프라인 서비스는 실제 공간 세팅 후 완성 사진도 제공합니다.",
  },
  {
    id: 5,
    question: "수정 요청은 몇 번까지 가능한가요?",
    answer:
      "가구 배치 서비스는 1회, 풀 스타일링(온라인)은 2회, 풀 스타일링(오프라인)은 협의 후 결정됩니다. 추가 수정은 별도 비용이 발생할 수 있습니다.",
  },
  {
    id: 6,
    question: "상담 후 서비스를 취소할 수 있나요?",
    answer:
      "초기 상담 단계에서는 무료로 취소 가능합니다. 스타일링 플랜 제안 이후에는 취소 정책에 따라 부분 환불이 적용될 수 있습니다. 자세한 내용은 카카오 채널로 문의해주세요.",
  },
  {
    id: 7,
    question: "수집 입점 브랜드 제품만 사용해야 하나요?",
    answer:
      "아닙니다. 수집 입점 브랜드 제품을 우선 추천드리지만, 고객님의 예산과 취향에 맞게 다양한 브랜드의 제품을 함께 제안해드립니다.",
  },
  {
    id: 8,
    question: "스타일링 후 사진을 수집 포트폴리오에 사용해도 되나요?",
    answer:
      "동의하신 경우에만 수집 포트폴리오 및 SNS에 활용됩니다. 동의 여부는 서비스 신청 시 선택하실 수 있으며, 언제든지 변경 가능합니다.",
  },
];

function FAQItem({ item }: { item: (typeof FAQ_ITEMS)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-none">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-1 rounded-lg transition-colors"
      >
        <div className="flex items-start gap-2.5 flex-1 pr-3">
          <span className="text-gray-400 font-bold text-sm shrink-0 mt-0.5">Q.</span>
          <p className="text-gray-900 font-semibold text-[13px] leading-snug">{item.question}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="pb-4 px-1 flex items-start gap-2.5">
          <span className="text-[#E84B1A] font-bold text-sm shrink-0 mt-0.5">A.</span>
          <p className="text-gray-600 text-[13px] leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function StylingFAQ() {
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
          자주 묻는 질문
        </h1>
      </header>

      <main className="flex-1 px-4 pt-4 pb-10">
        {/* 안내 */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-5">
          <p className="text-gray-600 text-[13px] leading-relaxed">
            궁금한 점이 있으시면 카카오 채널로 문의해주세요. 빠르게 답변드리겠습니다. 😊
          </p>
        </div>

        {/* FAQ 목록 */}
        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.id} item={item} />
          ))}
        </div>

        {/* 카카오 채널 문의 버튼 */}
        <div className="mt-8">
          <p className="text-center text-gray-500 text-[12px] mb-3">
            원하는 답변을 찾지 못하셨나요?
          </p>
          <button
            onClick={() => window.open("http://pf.kakao.com/_VNxiLn/chat", "_blank")}
            className="w-full py-4 rounded-full font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
            style={{ background: "#FEE500", color: "#111111" }}
          >
            카카오 채널로 문의하기 💬
          </button>
        </div>
      </main>
    </div>
  );
}
