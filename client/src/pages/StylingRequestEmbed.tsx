import { useLocation } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";

const EMBED_URL = "https://soozipland-j3tut3mq.manus.space/";

export default function StylingRequestEmbed() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* 헤더 */}
      <header className="flex items-center px-4 py-3 border-b border-gray-100 bg-white shrink-0" style={{ minHeight: "52px" }}>
        <button
          onClick={() => navigate("/styling")}
          className="p-1 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 pr-8">
          스타일링 신청서 작성
        </h1>
        <a
          href={EMBED_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="새 탭에서 열기"
        >
          <ExternalLink size={18} className="text-gray-500" />
        </a>
      </header>

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="absolute inset-0 top-[52px] flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin"
            />
            <p className="text-sm text-gray-500">신청서를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* iframe 임베드 */}
      <iframe
        src={EMBED_URL}
        className="flex-1 w-full border-none"
        title="스타일링 신청서"
        onLoad={() => setLoading(false)}
        allow="camera; microphone; geolocation"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
