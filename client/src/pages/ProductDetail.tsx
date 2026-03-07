/* SOOZIP Design: Minimalism B&W + Orange-Red Accent (#E84B1A)
 * Product Detail Page - Supabase 실제 데이터 연동
 * 이미지 슬라이더 + 상세 HTML + 상세 이미지
 */
import { useState } from "react";
import { ArrowLeft, Heart, Share2, ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useProductDetail } from "@/hooks/useProducts";

const TERRACOTTA = "#E84B1A";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const productId = params.id ?? null;

  const { data, loading, error } = useProductDetail(productId);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  /* ─── 로딩 상태 ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-sm">상품 상세</span>
            <div className="w-8" />
          </div>
        </header>
        <div className="w-full aspect-square bg-secondary animate-pulse" />
        <div className="px-4 py-5 space-y-3">
          <div className="bg-secondary animate-pulse h-3 w-32 rounded" />
          <div className="bg-secondary animate-pulse h-6 w-48 rounded" />
          <div className="bg-secondary animate-pulse h-6 w-24 rounded" />
        </div>
        <BottomNav />
      </div>
    );
  }

  /* ─── 에러 / 상품 없음 ─── */
  if (error || !data?.product) {
    return (
      <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={() => window.history.back()} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-sm">상품 상세</span>
            <div className="w-8" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <Package size={48} className="text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">상품 정보를 불러올 수 없습니다.</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 text-sm font-medium underline"
            style={{ color: TERRACOTTA }}
          >
            상품 목록으로 돌아가기
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { product, images, detailPages, detailImages } = data;

  // 이미지 목록 (main → sub 순서)
  const allImages = images.filter((img) => img.image_type === "main")
    .concat(images.filter((img) => img.image_type === "sub"));

  const prevImage = () => setCurrentImageIdx((i) => Math.max(0, i - 1));
  const nextImage = () => setCurrentImageIdx((i) => Math.min(allImages.length - 1, i + 1));

  // 상세 페이지 HTML 콘텐츠 (detail_type 기준 정렬)
  const detailHtml = detailPages
    .sort((a, b) => a.detail_type.localeCompare(b.detail_type))
    .map((dp) => dp.html_content)
    .join("");

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">상품 상세</span>
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ── 상품 이미지 슬라이더 ── */}
        <div className="relative w-full aspect-square bg-secondary overflow-hidden">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIdx].image_url}
                alt={`${product.product_name} 이미지 ${currentImageIdx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 이전/다음 버튼 */}
              {allImages.length > 1 && (
                <>
                  {currentImageIdx > 0 && (
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  {currentImageIdx < allImages.length - 1 && (
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                  {/* 인디케이터 */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIdx(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentImageIdx ? "16px" : "6px",
                          height: "6px",
                          background: i === currentImageIdx ? TERRACOTTA : "rgba(255,255,255,0.6)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={80} className="text-muted-foreground" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* ── 상품 기본 정보 ── */}
        <div className="px-4 py-5 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">
            {product.brand_name}
            {product.main_category ? ` · ${product.main_category}` : ""}
            {product.sub_category ? ` · ${product.sub_category}` : ""}
          </p>
          <h1 className="text-lg font-bold text-foreground mb-3">{product.product_name}</h1>
          <div className="flex items-baseline gap-3">
            {product.discount_rate > 0 && (
              <span className="font-semibold text-sm" style={{ color: TERRACOTTA }}>
                {product.discount_rate}% 할인
              </span>
            )}
            <span className="text-xl font-bold text-foreground">
              {product.sale_price.toLocaleString()}원
            </span>
            {product.discount_rate > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {product.original_price.toLocaleString()}원
              </span>
            )}
          </div>
        </div>

        {/* ── 상세 페이지 HTML 콘텐츠 ── */}
        {detailHtml && (
          <div className="border-b border-border">
            <div
              className="product-detail-html"
              dangerouslySetInnerHTML={{ __html: detailHtml }}
            />
          </div>
        )}

        {/* ── 상세 이미지 ── */}
        {detailImages.length > 0 && (
          <div className="border-b border-border">
            {detailImages
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((img, i) => (
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

        {/* 상세 정보 없을 경우 안내 */}
        {!detailHtml && detailImages.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            상세 정보가 준비 중입니다.
          </div>
        )}
      </main>

      {/* ── 하단 구매 버튼 ── */}
      <div className="fixed bottom-14 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-background border-t border-border flex gap-3">
        <button
          onClick={() => toast.success("장바구니에 담겼습니다.")}
          className="flex items-center justify-center gap-2 flex-1 border border-border text-foreground py-3 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
        >
          <ShoppingCart size={18} />
          장바구니
        </button>
        <button
          onClick={() => toast.success("구매 기능이 준비 중입니다.")}
          className="flex-1 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
          style={{ background: TERRACOTTA }}
        >
          바로 구매
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
