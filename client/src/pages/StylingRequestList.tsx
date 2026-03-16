import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, MessageCircle, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

const TERRACOTTA = "oklch(0.55 0.22 32)";

const TYPE_FILTERS = [
  { label: "전체", value: "" },
  { label: "배치솔루션", value: "배치솔루션" },
  { label: "풀스타일링(온라인)", value: "풀스타일링(온라인)" },
  { label: "풀스타일링(오프라인)", value: "풀스타일링(오프라인)" },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function StylingRequestList() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState("");

  const { data: requests = [], isLoading } = trpc.stylingRequest.listWaiting.useQuery();


  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1 as never)} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">스타일링 대기 고객</h1>
          <div className="w-8" />
        </div>
        {/* 타입 필터 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={
                activeFilter === f.value
                  ? { background: TERRACOTTA, color: "white" }
                  : { background: "#f0f0f0", color: "#555" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* 안내 배너 */}
        <div
          className="rounded-2xl px-4 py-3 mb-5 text-white text-sm font-medium text-center"
          style={{ background: "oklch(0.12 0 0)" }}
        >
          스타일링을 원하는 고객들이 대기 중입니다.<br />
          <span className="text-xs font-normal opacity-80">채팅 버튼으로 먼저 연락해보세요</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-[#f0f0f0] animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">현재 대기 중인 신청서가 없습니다</p>
            <p className="text-xs mt-1 text-muted-foreground/70">새로운 신청서가 등록되면 알려드릴게요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{req.requesterNickname}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "oklch(0.95 0.05 32)", color: TERRACOTTA }}
                      >
                        {req.stylingType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {req.roomType && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} />
                          {req.roomType}
                        </span>
                      )}
                      {req.roomSize && <span>{req.roomSize}</span>}
                      {req.budget && <span>예산: {req.budget}</span>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                    <Clock size={10} />
                    {timeAgo(new Date(req.createdAt).getTime())}
                  </span>
                </div>

                {req.description && (
                  <p className="text-xs text-muted-foreground bg-[#f8f8f8] rounded-lg px-3 py-2 mb-3 line-clamp-2">
                    "{req.description}"
                  </p>
                )}

                {req.preferredDate && (
                  <p className="text-xs text-muted-foreground mb-3">
                    희망 일정: <span className="font-medium text-foreground">{req.preferredDate}</span>
                  </p>
                )}

                {/* 채팅 버튼 (추후 채팅 기능 연결) */}
                <button
                  onClick={() => toast.info("채팅 기능은 준비 중입니다")}
                  className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border transition-colors"
                  style={{ borderColor: TERRACOTTA, color: TERRACOTTA }}
                >
                  <MessageCircle size={14} />
                  채팅으로 연락하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
