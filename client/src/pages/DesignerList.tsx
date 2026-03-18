import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Star, MessageCircle, Search } from "lucide-react";

const TERRACOTTA = "oklch(0.55 0.22 32)";

const TYPE_FILTERS = [
  { label: "전체", value: "" },
  { label: "배치솔루션", value: "배치솔루션" },
  { label: "풀스타일링(온라인)", value: "풀스타일링(온라인)" },
  { label: "풀스타일링(오프라인)", value: "풀스타일링(오프라인)" },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(rating) ? TERRACOTTA : "transparent"}
          stroke={s <= Math.round(rating) ? TERRACOTTA : "#ccc"}
        />
      ))}
    </div>
  );
}

export default function DesignerList() {
  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: designers = [], isLoading } = trpc.designer.list.useQuery({
    stylingType: activeFilter || undefined,
  });

  const filtered = designers.filter(d =>
    !searchQuery || d.nickname.includes(searchQuery) || (d.bio ?? "").includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/styling")} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">디자이너 찾기</h1>
          <div className="w-8" />
        </div>
        {/* 검색 */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-xl px-3 py-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="디자이너 이름 또는 소개 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
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
          원하는 디자이너를 선택해 직접 상담을 신청해보세요
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-[#f0f0f0] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm">
              {searchQuery || activeFilter
                ? "조건에 맞는 디자이너가 없습니다"
                : "아직 등록된 디자이너가 없습니다"}
            </p>
            <p className="text-xs mt-1 text-muted-foreground/70">곧 멋진 디자이너들이 합류할 예정입니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(designer => (
              <button
                key={designer.id}
                onClick={() => navigate(`/designer/${designer.id}`)}
                className="w-full text-left rounded-2xl border border-border bg-card p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex gap-3">
                  {/* 프로필 이미지 */}
                  <div
                    className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                    style={{ background: TERRACOTTA }}
                  >
                    {designer.profileImageUrl ? (
                      <img src={designer.profileImageUrl} alt={designer.nickname} className="w-full h-full object-cover" />
                    ) : (
                      designer.nickname.charAt(0)
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">{designer.nickname}</span>
                      {designer.reviewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <StarRating rating={designer.avgRating} size={11} />
                          <span className="text-xs text-muted-foreground">
                            {designer.avgRating.toFixed(1)} ({designer.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                    {designer.bio && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{designer.bio}</p>
                    )}
                    {/* 전문 타입 뱃지 */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(designer.specialties as string[]).map(s => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: "#f0f0f0", color: "#555" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    {/* 완료 건수 */}
                    <div className="flex gap-3 text-[11px] text-muted-foreground">
                      {designer.completedFurniture > 0 && (
                        <span>배치솔루션 {designer.completedFurniture}건</span>
                      )}
                      {designer.completedFullOnline > 0 && (
                        <span>풀(온라인) {designer.completedFullOnline}건</span>
                      )}
                      {designer.completedFullOffline > 0 && (
                        <span>풀(오프라인) {designer.completedFullOffline}건</span>
                      )}
                      {designer.completedFurniture === 0 && designer.completedFullOnline === 0 && designer.completedFullOffline === 0 && (
                        <span>신규 디자이너</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* 최신 리뷰 미리보기 */}
                {designer.recentReviews.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-start gap-2">
                      <MessageCircle size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        "{designer.recentReviews[0].comment}"
                      </p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
