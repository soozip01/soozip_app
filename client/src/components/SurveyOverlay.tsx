/**
 * SurveyOverlay
 * soozipland 설문 페이지를 앱 내부 전체화면 iframe으로 자연스럽게 표시합니다.
 * - 슬라이드업 애니메이션으로 열림
 * - 상단 헤더에 뒤로가기 버튼 제공
 * - 로딩 스피너 표시
 */
import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface SurveyOverlayProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function SurveyOverlay({ url, title = "스타일링 신청서", onClose }: SurveyOverlayProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      style={{ animation: "slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      {/* 헤더 */}
      <header
        className="flex items-center px-4 py-3 border-b border-gray-100 bg-white shrink-0"
        style={{ minHeight: "52px" }}
      >
        <button
          onClick={onClose}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          {title}
        </h1>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="새 탭에서 열기"
        >
          <ExternalLink size={18} className="text-gray-400" />
        </a>
      </header>

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="absolute inset-0 top-[52px] flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin" />
            <p className="text-sm text-gray-500">신청서를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* iframe */}
      <iframe
        src={url}
        className="flex-1 w-full border-none"
        title={title}
        onLoad={() => setLoading(false)}
        allow="camera; microphone; geolocation"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
