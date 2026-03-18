import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle2 } from "lucide-react";
import SurveyOverlay from "@/components/SurveyOverlay";

const TERRACOTTA = "oklch(0.55 0.22 32)";

export default function BookingComplete() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const surveyUrl = params.get("surveyUrl") ? decodeURIComponent(params.get("surveyUrl")!) : null;
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);

  // 설문 iframe 메시지 수신 (설문 완료 감지)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "survey_complete" || e.data?.type === "survey_complete") {
        setSurveyDone(true);
        setShowSurvey(false);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* SurveyOverlay - 앱 내부 전체화면 iframe */}
      {showSurvey && surveyUrl && (
        <SurveyOverlay
          url={surveyUrl}
          title="스타일링 신청 설문"
          onClose={() => setShowSurvey(false)}
        />
      )}

      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: surveyDone ? "oklch(0.92 0.08 150)" : "oklch(0.95 0.05 32)" }}
      >
        <CheckCircle2
          size={40}
          style={{ color: surveyDone ? "oklch(0.55 0.18 150)" : TERRACOTTA }}
        />
      </div>

      {surveyDone ? (
        <>
          <h2 className="font-bold text-xl mb-2">예약이 최종 완료되었습니다!</h2>
          <p className="text-sm text-muted-foreground mb-2">
            설문 작성이 완료되었습니다.<br />
            디자이너가 확인 후 연락드릴 예정입니다.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            마이페이지에서 진행 현황을 확인하실 수 있습니다
          </p>
        </>
      ) : (
        <>
          <h2 className="font-bold text-xl mb-2">예약 신청이 접수되었습니다!</h2>
          <p className="text-sm text-muted-foreground mb-2">
            아래 설문을 작성해주시면<br />
            <strong>최종 예약이 완료</strong>됩니다.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            설문은 스타일링에 필요한 정보를 수집하기 위해 사용됩니다
          </p>

          {surveyUrl && (
            <button
              onClick={() => setShowSurvey(true)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
              style={{ background: TERRACOTTA }}
            >
              설문 작성하기 (필수)
            </button>
          )}
        </>
      )}

      <button
        onClick={() => navigate("/mypage")}
        className="w-full py-3.5 rounded-2xl font-medium text-sm border border-border"
      >
        마이페이지에서 진행 현황 보기
      </button>
      <button
        onClick={() => navigate("/")}
        className="w-full py-3 rounded-2xl text-sm mt-2 text-muted-foreground"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}
