/* SOOZIP Design: Minimalism B&W + Terracotta Accent (#E84B1A)
 * Product Detail Page — 오늘의집 레이아웃 참조, Supabase 실제 데이터 연동
 * 구성: 이미지 슬라이더 → 상품 기본정보 → 수량/주문 → 탭(상품정보/배송환불) → 상세이미지
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Package,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  Store,
  Plus,
  Minus,
  ImageOff,
  CheckCircle2,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useProductDetail } from "@/hooks/useProducts";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { Star, Lock, MessageCircle, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const ACCENT = "#E84B1A";

type TabType = "info" | "delivery" | "review" | "inquiry";

/* ── 별점 컴포넌트 ── */
function StarRating({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          disabled={!onChange}
        >
          <Star
            size={size}
            fill={(hover || value) >= star ? ACCENT : "none"}
            stroke={(hover || value) >= star ? ACCENT : "#d1d5db"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

/* ── 리뷰 탭 ── */
function ReviewTab({ productId, userId, userNickname, isLoggedIn }: {
  productId: number;
  userId?: number;
  userNickname?: string;
  isLoggedIn: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.review.list.useQuery({ productId, page, limit: 10 }, { enabled: productId > 0 });
  const createMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate({ productId });
      setShowForm(false);
      setContent("");
      setRating(5);
      toast.success("리뷰가 등록되었습니다.");
    },
    onError: (e) => toast.error(e.message),
  });

  const stats = data?.stats ?? { total: 0, average: 0, distribution: {} };
  const reviews = data?.reviews ?? [];

  return (
    <div className="px-4 py-5">
      {/* 별점 통계 */}
      <div className="flex items-center gap-5 pb-5 border-b border-border mb-5">
        <div className="text-center">
          <p className="text-4xl font-extrabold text-foreground">{stats.average.toFixed(1)}</p>
          <StarRating value={Math.round(stats.average)} size={16} />
          <p className="text-xs text-muted-foreground mt-1">{stats.total}에 리뷰</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5,4,3,2,1].map((star) => {
            const cnt = (stats.distribution as Record<number,number>)[star] ?? 0;
            const pct = stats.total > 0 ? (cnt / stats.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ACCENT }} />
                </div>
                <span className="text-xs text-muted-foreground w-4 text-right">{cnt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 리뷰 작성 버튼 */}
      {isLoggedIn && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 mb-5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
        >
          <Star size={15} />
          리뷰 작성하기
        </button>
      )}

      {/* 리뷰 작성 폼 */}
      {showForm && (
        <div className="mb-5 p-4 border border-border rounded-xl bg-secondary/30">
          <p className="text-sm font-semibold mb-3">리뷰 작성</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">별점</span>
            <StarRating value={rating} onChange={setRating} size={22} />
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품에 대한 소감을 작성해주세요 (10자 이상)"
            className="text-sm min-h-[100px] mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (!userId || !userNickname) return;
                createMutation.mutate({ userId, userNickname, productId, rating, content });
              }}
              disabled={createMutation.isPending || content.length < 10}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: ACCENT }}
            >
              {createMutation.isPending ? "등록 중..." : "리뷰 등록"}
            </button>
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-14 text-center">
          <Star size={40} className="text-muted-foreground mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">첫 리뷰를 작성해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                    {review.userNickname.slice(0,1)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{review.userNickname}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <StarRating value={review.rating} size={14} />
              <p className="text-sm text-foreground mt-2 leading-relaxed">{review.content}</p>
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {review.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="리뷰 이미지" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 상품문의 탭 ── */
function InquiryTab({ productId, userId, userNickname, isLoggedIn }: {
  productId: number;
  userId?: number;
  userNickname?: string;
  isLoggedIn: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.inquiry.list.useQuery(
    { productId, userId: userId ?? 0 },
    { enabled: productId > 0 }
  );
  const createMutation = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      utils.inquiry.list.invalidate({ productId });
      setShowForm(false);
      setTitle("");
      setContent("");
      toast.success("문의가 등록되었습니다.");
    },
    onError: (e) => toast.error(e.message),
  });

  const inquiries = data?.inquiries ?? [];

  return (
    <div className="px-4 py-5">
      {/* 문의 작성 버튼 */}
      {isLoggedIn && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 mb-5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={15} />
          문의 작성하기
        </button>
      )}
      {!isLoggedIn && (
        <div className="mb-5 p-4 bg-secondary/50 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">로그인 후 문의를 작성할 수 있습니다.</p>
        </div>
      )}

      {/* 문의 작성 폼 */}
      {showForm && (
        <div className="mb-5 p-4 border border-border rounded-xl bg-secondary/30">
          <p className="text-sm font-semibold mb-3">상품 문의</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목"
            className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background mb-2 focus:outline-none focus:ring-1 focus:ring-border"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 입력해주세요 (10자 이상)"
            className="text-sm min-h-[100px] mb-2"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground mb-3 cursor-pointer">
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="rounded" />
            <Lock size={12} />
            비밀글로 등록
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (!userId || !userNickname) return;
                createMutation.mutate({ userId, userNickname, productId, title, content, isSecret });
              }}
              disabled={createMutation.isPending || content.length < 10 || title.length < 2}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: ACCENT }}
            >
              {createMutation.isPending ? "등록 중..." : "문의 등록"}
            </button>
          </div>
        </div>
      )}

      {/* 문의 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-14 text-center">
          <MessageCircle size={40} className="text-muted-foreground mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">첫 문의를 남겨보세요</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-border">
          {inquiries.map((inq) => (
            <div key={inq.id} className="py-3.5">
              <button
                onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {inq.isSecret && <Lock size={11} className="text-muted-foreground shrink-0" />}
                    <span className="text-sm font-medium text-foreground truncate">{inq.title}</span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-muted-foreground shrink-0 transition-transform ${expandedId === inq.id ? "rotate-180" : ""}`}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{inq.userNickname}</span>
                  <span className="text-xs text-muted-foreground">{new Date(inq.createdAt).toLocaleDateString("ko-KR")}</span>
                  {inq.answer && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}20`, color: ACCENT }}>답변완료</span>
                  )}
                </div>
              </button>
              {expandedId === inq.id && (
                <div className="mt-2.5 space-y-2">
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/50 rounded-xl p-3">{inq.content}</p>
                  {inq.answer && (
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-[11px] font-bold mb-1" style={{ color: ACCENT }}>판매자 답변</p>
                      <p className="text-sm text-foreground leading-relaxed">{inq.answer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 이미지 로드 실패 처리 컴포넌트 ── */
function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const isBlobUrl = src.startsWith("blob:");

  if (isBlobUrl || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-secondary text-muted-foreground gap-2 ${className ?? ""}`}
      >
        <ImageOff size={36} strokeWidth={1.5} />
        <span className="text-xs">이미지 준비 중</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const productId = params.id ?? null;

  const { data, loading, error } = useProductDetail(productId);

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const { user, isLoggedIn } = useSoozipAuth();
  const numericProductId = productId ? parseInt(productId, 10) : null;

  // 찜 여부 조회 (로그인 시)
  const { data: wishlistData } = trpc.wishlist.check.useQuery(
    { productId: numericProductId!, userId: user?.id ?? 0 },
    { enabled: isLoggedIn && !!numericProductId && !!user?.id }
  );
  const wishlistToggle = trpc.wishlist.toggle.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (wishlistData !== undefined) {
      setIsWishlisted(wishlistData.wishlisted);
    }
  }, [wishlistData]);

  const tabRef = useRef<HTMLDivElement>(null);

  /* 스와이프 핸들러 */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, total: number) => {
      if (touchStartX === null) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) setCurrentImageIdx((i) => Math.min(i + 1, total - 1));
        else setCurrentImageIdx((i) => Math.max(i - 1, 0));
      }
      setTouchStartX(null);
    },
    [touchStartX]
  );

  /* ── 공유 ── */
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: data?.product?.product_name ?? "SOOZIP 상품",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었습니다.");
    }
  }, [data?.product?.product_name]);

  /* ── 로딩 스켈레톤 ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-4 w-32 bg-secondary animate-pulse rounded" />
          <div className="w-8" />
        </header>
        <div className="w-full aspect-square bg-secondary animate-pulse" />
        <div className="px-4 py-5 space-y-3 border-b border-border">
          <div className="h-3 w-24 bg-secondary animate-pulse rounded" />
          <div className="h-5 w-48 bg-secondary animate-pulse rounded" />
          <div className="h-7 w-28 bg-secondary animate-pulse rounded" />
          <div className="h-3 w-36 bg-secondary animate-pulse rounded" />
        </div>
        <div className="px-4 py-4 border-b border-border">
          <div className="h-4 w-12 bg-secondary animate-pulse rounded mb-3" />
          <div className="h-9 w-28 bg-secondary animate-pulse rounded" />
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ── 에러 / 없음 ── */
  if (error || !data?.product) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">상품 상세</span>
          <div className="w-8" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <Package size={52} className="text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-sm font-medium text-foreground mb-1">상품을 찾을 수 없습니다</p>
          <p className="text-xs text-muted-foreground mb-5">
            삭제되었거나 승인 대기 중인 상품입니다.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="text-sm font-semibold px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors"
          >
            상품 목록으로
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { product, images, detailPages, detailImages } = data;

  /* 이미지 정렬: main → sub */
  const allImages = [
    ...images.filter((i) => i.image_type === "main").sort((a, b) => a.sort_order - b.sort_order),
    ...images.filter((i) => i.image_type === "sub").sort((a, b) => a.sort_order - b.sort_order),
  ];

  /* 상세 HTML (null 필터링) */
  const detailHtml = detailPages
    .filter((dp) => dp.html_content)
    .sort((a, b) => a.detail_type.localeCompare(b.detail_type))
    .map((dp) => dp.html_content)
    .join("");

  /* 상세 이미지 정렬 */
  const sortedDetailImages = [...detailImages].sort((a, b) => a.sort_order - b.sort_order);

  /* 유효한 이미지만 (blob 제외) */
  const validImages = allImages.filter((img) => !img.image_url.startsWith("blob:"));
  const validDetailImages = sortedDetailImages.filter(
    (img) => !img.image_url.startsWith("blob:")
  );

  const totalPrice = product.sale_price * quantity;
  const hasDiscount = product.discount_rate > 0;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm truncate max-w-[200px] text-foreground">
            {product.product_name}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              aria-label="공유"
            >
              <Share2 size={19} />
            </button>
            <button
              onClick={async () => {
                if (!isLoggedIn || !user?.id || !numericProductId) {
                  toast.error("로그인 후 찜하기가 가능합니다.");
                  return;
                }
                const newState = !isWishlisted;
                setIsWishlisted(newState);
                try {
                  await wishlistToggle.mutateAsync({ productId: numericProductId, userId: user.id });
                  utils.wishlist.list.invalidate({ userId: user.id });
                  if (newState) toast.success("찜 목록에 추가되었습니다.");
                  else toast.success("찜 목록에서 제거되었습니다.");
                } catch {
                  setIsWishlisted(!newState);
                  toast.error("잠시 후 다시 시도해주세요.");
                }
              }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              aria-label="찜하기"
            >
              <Heart
                size={19}
                fill={isWishlisted ? ACCENT : "none"}
                stroke={isWishlisted ? ACCENT : "currentColor"}
                className="transition-all"
              />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ── 메인 이미지 슬라이더 ── */}
        <div
          className="relative w-full aspect-square bg-secondary overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, allImages.length)}
        >
          {allImages.length > 0 ? (
            <>
              <ProductImage
                src={allImages[Math.min(currentImageIdx, allImages.length - 1)].image_url}
                alt={`${product.product_name} ${currentImageIdx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* 좌/우 화살표 (2장 이상) */}
              {allImages.length > 1 && (
                <>
                  {currentImageIdx > 0 && (
                    <button
                      onClick={() => setCurrentImageIdx((i) => i - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {currentImageIdx < allImages.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIdx((i) => i + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}

                  {/* 인디케이터 도트 */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {allImages.map((_, i) => (
                      <span
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === currentImageIdx ? "20px" : "6px",
                          height: "6px",
                          background:
                            i === currentImageIdx
                              ? ACCENT
                              : "rgba(255,255,255,0.7)",
                        }}
                      />
                    ))}
                  </div>

                  {/* 카운터 배지 */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                    {currentImageIdx + 1} / {allImages.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Package size={64} strokeWidth={1} />
              <span className="text-sm">이미지 준비 중</span>
            </div>
          )}
        </div>

        {/* 썸네일 스트립 (2장 이상) */}
        {allImages.length > 1 && (
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-border">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIdx(i)}
                className="shrink-0 rounded-lg overflow-hidden transition-all"
                style={{
                  width: 52,
                  height: 52,
                  outline: i === currentImageIdx ? `2px solid ${ACCENT}` : "2px solid transparent",
                  outlineOffset: "1px",
                  opacity: i === currentImageIdx ? 1 : 0.5,
                }}
              >
                <ProductImage
                  src={img.image_url}
                  alt={`썸네일 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── 상품 기본 정보 ── */}
        <div className="px-4 pt-4 pb-5 border-b border-border">
          {/* 카테고리 브레드크럼 */}
          {(product.main_category || product.sub_category) && (
            <p className="text-[11px] text-muted-foreground mb-2 tracking-wide">
              {[product.main_category, product.sub_category].filter(Boolean).join("  ›  ")}
            </p>
          )}

          {/* 브랜드 */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <Store size={12} className="text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">
              {product.brand_name}
            </span>
          </div>

          {/* 상품명 */}
          <h1 className="text-[15px] font-bold text-foreground leading-snug mb-4">
            {product.product_name}
          </h1>

          {/* 가격 블록 */}
          <div className="flex items-end gap-3 mb-4">
            <div>
              {hasDiscount && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: ACCENT }}
                  >
                    {product.discount_rate}%
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {product.original_price.toLocaleString()}원
                  </span>
                </div>
              )}
              <p className="text-[26px] font-extrabold text-foreground leading-none tracking-tight">
                {product.sale_price.toLocaleString()}
                <span className="text-base font-semibold ml-0.5">원</span>
              </p>
            </div>
          </div>

          {/* 혜택 배지 */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            <CheckCircle2 size={12} />
            SOOZIP 입점 브랜드 공식 상품
          </div>

          {/* 배송 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck size={13} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">배송비</span>
                &nbsp;3,000원 · 일반택배 (30,000원 이상 무료)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={13} className="text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">반품/교환</span>
                &nbsp;수령 후 7일 이내 가능
              </span>
            </div>
          </div>
        </div>

        {/* ── 수량 선택 ── */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-2">수량 선택</p>
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="수량 감소"
                >
                  <Minus size={14} />
                </button>
                <span className="w-11 text-center text-sm font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="수량 증가"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">총 주문금액</p>
              <p
                className="text-xl font-extrabold tracking-tight"
                style={{ color: ACCENT }}
              >
                {totalPrice.toLocaleString()}
                <span className="text-sm font-semibold text-foreground ml-0.5">원</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 탭 네비게이션 ── */}
        <div
          ref={tabRef}
          className="sticky top-[53px] z-30 bg-background border-b border-border"
        >
          <div className="flex">
            {(
        [
              { key: "info" as TabType, label: "상품정보" },
              { key: "delivery" as TabType, label: "배송/환불" },
              { key: "review" as TabType, label: "리뷰" },
              { key: "inquiry" as TabType, label: "상품문의" },
            ]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex-1 py-3.5 text-sm font-semibold transition-colors relative"
                style={{
                  color: activeTab === key ? ACCENT : "var(--muted-foreground)",
                }}
              >
                {label}
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                  style={{
                    background: activeTab === key ? ACCENT : "transparent",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── 상품정보 탭 ── */}
        {activeTab === "info" && (
          <div>
            {/* 상세 HTML */}
            {detailHtml && (
              <div
                className="product-detail-html"
                dangerouslySetInnerHTML={{ __html: detailHtml }}
              />
            )}

            {/* 상세 이미지 */}
            {validDetailImages.length > 0 && (
              <div className="overflow-hidden">
                {validDetailImages.map((img, i) => (
                  <img
                    key={i}
                    src={img.image_url}
                    alt={`상세 이미지 ${i + 1}`}
                    className="w-full block"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            {/* blob URL 상세 이미지가 있을 때 안내 */}
            {sortedDetailImages.length > 0 && validDetailImages.length === 0 && (
              <div className="px-4 py-10 text-center">
                <ImageOff size={40} className="text-muted-foreground mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm font-medium text-foreground mb-1">이미지 준비 중</p>
                <p className="text-xs text-muted-foreground">
                  상세 이미지가 곧 업데이트됩니다.
                </p>
              </div>
            )}

            {/* 상세 정보 없을 때 */}
            {!detailHtml && sortedDetailImages.length === 0 && (
              <div className="px-4 py-14 text-center">
                <Package size={44} className="text-muted-foreground mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm font-medium text-foreground mb-1">상세 정보 준비 중</p>
                <p className="text-xs text-muted-foreground">
                  판매자가 상세 정보를 등록하고 있습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 배송/환불 탭 ── */}
        {activeTab === "delivery" && (
          <div className="px-4 py-6 space-y-7">
            {/* 배송 안내 */}
            <section>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Truck size={15} style={{ color: ACCENT }} />
                배송 안내
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      ["배송 방법", "일반택배"],
                      ["배송비", "3,000원 (30,000원 이상 무료)"],
                      ["도서산간 추가비", "10,000원"],
                      ["배송 기간", "결제 후 2~5일 이내 출고"],
                    ].map(([label, value], idx, arr) => (
                      <tr
                        key={label}
                        className={idx < arr.length - 1 ? "border-b border-border" : ""}
                      >
                        <td className="py-3 px-3.5 text-muted-foreground font-medium bg-secondary/50 w-28">
                          {label}
                        </td>
                        <td className="py-3 px-3.5 text-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 교환/환불 안내 */}
            <section>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <RotateCcw size={15} style={{ color: ACCENT }} />
                교환/환불 안내
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      ["반품 배송비", "4,000원 (최초 무료 시 8,000원)"],
                      ["교환 배송비", "8,000원"],
                      ["단순 변심", "수령 후 7일 이내"],
                      ["상품 불량", "수령 후 3개월 이내"],
                    ].map(([label, value], idx, arr) => (
                      <tr
                        key={label}
                        className={idx < arr.length - 1 ? "border-b border-border" : ""}
                      >
                        <td className="py-3 px-3.5 text-muted-foreground font-medium bg-secondary/50 w-28">
                          {label}
                        </td>
                        <td className="py-3 px-3.5 text-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3.5 bg-secondary/60 rounded-xl">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  반품 시 판매자와 먼저 연락하여 반품 사유, 택배사, 배송비,
                  반품지 주소 등을 협의한 후 상품을 발송해 주세요.
                </p>
              </div>
            </section>

            {/* 유의사항 */}
            <section>
              <h3 className="text-sm font-bold text-foreground mb-3">유의사항</h3>
              <div className="space-y-2">
                {[
                  "상품 수령 후 단순 변심에 의한 반품 시 왕복 배송비는 고객 부담입니다.",
                  "상품 불량 또는 오배송의 경우 배송비는 판매자 부담입니다.",
                  "주문 취소는 결제 완료 후 배송 준비 전까지 가능합니다.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-muted-foreground/50 translate-y-1.5" />
                    <span className="leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── 리뷰 탭 ── */}
        {activeTab === "review" && (
          <ReviewTab
            productId={numericProductId ?? 0}
            userId={user?.id}
            userNickname={user?.nickname}
            isLoggedIn={isLoggedIn}
          />
        )}

        {/* ── 상품문의 탭 ── */}
        {activeTab === "inquiry" && (
          <InquiryTab
            productId={numericProductId ?? 0}
            userId={user?.id}
            userNickname={user?.nickname}
            isLoggedIn={isLoggedIn}
          />
        )}
      </main>

      {/* ── 하단 고정 구매 버튼 ── */}
      <div className="fixed bottom-14 left-0 right-0 max-w-lg mx-auto z-30">
        <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border flex gap-2.5">
          <button
            onClick={() => {
              addItem({
                id: product.id,
                productId: product.id,
                productName: product.product_name,
                brandName: product.brand_name,
                mainCategory: product.main_category ?? null,
                subCategory: product.sub_category ?? null,
                salePrice: product.sale_price,
                originalPrice: product.original_price,
                imageUrl: validImages[0]?.image_url ?? null,
                memo: null,
                source: "product",
                quantity,
              });
              toast.success(`장바구니에 담겼습니다. (${quantity}개)`);
            }}
            className="flex items-center justify-center gap-1.5 flex-1 border border-border text-foreground py-3.5 rounded-xl font-semibold hover:bg-secondary transition-colors text-sm"
          >
            <ShoppingCart size={16} />
            장바구니
          </button>
          <button
            onClick={() => toast.success("구매 기능이 준비 중입니다.")}
            className="flex-[1.5] text-white py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-sm"
            style={{ background: ACCENT }}
          >
            바로 구매
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
