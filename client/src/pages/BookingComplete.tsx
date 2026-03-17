import { useLocation, useSearch } from "wouter";
import { CheckCircle2 } from "lucide-react";

const TERRACOTTA = "oklch(0.55 0.22 32)";

export default function BookingComplete() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bookingId = params.get("bookingId");
  const stylingType = params.get("type") ? decodeURIComponent(params.get("type")!) : "";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: "oklch(0.95 0.05 32)" }}
      >
        <CheckCircle2 size={40} style={{ color: TERRACOTTA }} />
      </div>

      <h2 className="font-bold text-xl mb-2">예약 신청이 접수되었습니다!</h2>
      <p className="text-sm text-muted-foreground mb-2">
        아래 신청서를 작성해주시면<br />
        <strong>최종 예약이 완료</strong>됩니다.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        신청서는 스타일링에 필요한 정보를 수집하기 위해 사용됩니다
      </p>

      <button
        onClick={() => navigate("/styling/request")}
        className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
        style={{ background: TERRACOTTA }}
      >
        신청서 작성하기 (필수)
      </button>

      <button
        onClick={() => navigate("/my")}
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
