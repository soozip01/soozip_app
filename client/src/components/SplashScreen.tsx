/**
 * SOOZIP 스플래시 화면
 * 앱 최초 진입 시 1.8초 동안 표시되는 로딩 화면
 * 디자인: 흰 배경 + 전체 스플래시 이미지 (로고 + 곰 캐릭터)
 */
import { useEffect, useState } from "react";

const SPLASH_IMAGE_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/soozip-splash-new_49b3819e.png";

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
      className="fixed inset-0 z-[9999]"
      style={{
        background: "#ffffff",
        transition: "opacity 0.5s ease-out",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      {/* 스플래시 이미지 - 화면 전체에 꽉 차게 표시 */}
      <img
        src={SPLASH_IMAGE_URL}
        alt="SOOZIP"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          animation: "splashFadeIn 0.4s ease-out forwards",
          opacity: 0,
        }}
        draggable={false}
      />

      <style>{`
        @keyframes splashFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
