/**
 * SOOZIP 스플래시 화면
 * 앱 최초 진입 시 1.8초 동안 표시되는 로딩 화면
 * 디자인: 순수 검정 배경 + 중앙 SOOZIP 로고
 */
import { useEffect, useState } from "react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/soozip-splash-logo_ddc8f7c4.png";

const SPLASH_DURATION_MS = 1800;

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1.3초 후 fade-out 시작
    const fadeTimer = setTimeout(() => setFadeOut(true), SPLASH_DURATION_MS - 500);
    // 1.8초 후 onFinish 호출
    const finishTimer = setTimeout(onFinish, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "#000000",
        transition: "opacity 0.5s ease-out",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      {/* 로고 - 부드러운 등장 애니메이션 */}
      <div
        style={{
          animation: "splashLogoIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          opacity: 0,
        }}
      >
        <img
          src={LOGO_URL}
          alt="SOOZIP"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
          }}
          draggable={false}
        />
      </div>

      <style>{`
        @keyframes splashLogoIn {
          from {
            opacity: 0;
            transform: scale(0.75);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
