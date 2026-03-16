import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Star, MessageCircle, Calendar, ChevronRight } from "lucide-react";

const TERRACOTTA = "oklch(0.55 0.22 32)";

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

export default function DesignerProfile() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const designerId = parseInt(params.id ?? "0");
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews">("portfolio");

  const { data: designer, isLoading } = trpc.designer.get.useQuery({ id: designerId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: TERRACOTTA }} />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">디자이너를 찾을 수 없습니다</p>
        <button onClick={() => navigate("/designer")} className="text-sm underline">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const totalCompleted = designer.completedFurniture + designer.completedFullOnline + designer.completedFullOffline;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/designers")} className="p-1">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-bold text-base flex-1 text-center">디자이너 프로필</h1>
          <div className="w-8" />
        </div>
      </header>

      {/* 프로필 상단 */}
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="flex gap-4 items-start">
          <div
            className="w-20 h-20 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
            style={{ background: TERRACOTTA }}
          >
            {designer.profileImageUrl ? (
              <img src={designer.profileImageUrl} alt={designer.nickname} className="w-full h-full object-cover" />
            ) : (
              designer.nickname.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg mb-1">{designer.nickname}</h2>
            {designer.bio && (
              <p className="text-sm text-muted-foreground mb-2">{designer.bio}</p>
            )}
            {/* 별점 */}
            {designer.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={designer.avgRating} size={13} />
                <span className="text-sm font-medium">{designer.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({designer.reviewCount}개 리뷰)</span>
              </div>
            )}
            {/* 전문 타입 */}
            <div className="flex flex-wrap gap-1">
              {(designer.specialties as string[]).map(s => (
                <span
                  key={s}
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "#f0f0f0", color: "#555" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 완료 건수 통계 */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "배치솔루션", count: designer.completedFurniture },
            { label: "풀(온라인)", count: designer.completedFullOnline },
            { label: "풀(오프라인)", count: designer.completedFullOffline },
          ].map(stat => (
            <div key={stat.label} className="bg-[#f8f8f8] rounded-xl py-3 text-center">
              <div className="font-bold text-lg">{stat.count}</div>
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border">
        {[
          { key: "portfolio", label: "포트폴리오" },
          { key: "reviews", label: `리뷰 ${designer.reviewCount}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "portfolio" | "reviews")}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={
              activeTab === tab.key
                ? { color: TERRACOTTA, borderBottom: `2px solid ${TERRACOTTA}` }
                : { color: "#999" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-4 pt-4">
        {activeTab === "portfolio" && (
          <div>
            {(designer.portfolioUrls as string[]).length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">아직 등록된 포트폴리오가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(designer.portfolioUrls as string[]).map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#f0f0f0]">
                    <img src={url} alt={`포트폴리오 ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3">
            {designer.reviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">아직 리뷰가 없습니다</p>
              </div>
            ) : (
              designer.reviews.map(review => (
                <div key={review.id} className="bg-[#f8f8f8] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.reviewerNickname}</span>
                      {review.stylingType && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ebebeb] text-[#666]">
                          {review.stylingType}
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size={11} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground/80">{review.comment}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-background border-t border-border">
        <button
          onClick={() => navigate(`/booking?designerId=${designer.id}&designerName=${encodeURIComponent(designer.nickname)}`)}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
          style={{ background: TERRACOTTA }}
        >
          <Calendar size={18} />
          이 디자이너와 예약하기
        </button>
      </div>
    </div>
  );
}
