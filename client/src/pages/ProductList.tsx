/* SOOZIP Design: Minimalism B&W + Orange-Red Accent (#E84B1A)
 * Product List Page - Supabase 실제 데이터 연동
 * 카테고리 필터 + 검색 + 그리드 레이아웃
 */
import { useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal, Package } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";
import { useProductsByCategory } from "@/hooks/useProducts";

const TERRACOTTA = "#E84B1A";

const CATEGORIES = ["전체", "공동구매", "신상품", "세일", "패키지", "브랜드", "이벤트"];

export default function ProductList() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // Supabase 카테고리별 상품 조회
  const { products, loading } = useProductsByCategory(
    activeCategory === "전체" ? undefined : activeCategory
  );

  // 검색어 필터 (클라이언트 사이드)
  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(q) ||
      p.brand_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 bg-secondary rounded-lg px-3 py-2 flex items-center gap-2">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="상품 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
        {/* Category tabs */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors font-medium"
              style={
                activeCategory === cat
                  ? { background: TERRACOTTA, color: "white" }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          /* 로딩 스켈레톤 */
          <>
            <div className="bg-secondary animate-pulse h-4 w-24 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-square bg-secondary animate-pulse rounded-xl mb-2" />
                  <div className="space-y-1.5">
                    <div className="bg-secondary animate-pulse h-3 w-20 rounded" />
                    <div className="bg-secondary animate-pulse h-4 w-28 rounded" />
                    <div className="bg-secondary animate-pulse h-4 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filtered.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-muted-foreground mb-3" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "등록된 상품이 없습니다."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">총 {filtered.length}개 상품</p>
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* 상품 이미지 */}
                  <div className="aspect-square bg-secondary rounded-xl flex items-center justify-center mb-2 overflow-hidden group-hover:opacity-90 transition-opacity">
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Package size={40} className="text-muted-foreground" strokeWidth={1} />
                    )}
                  </div>
                  {/* 상품 정보 */}
                  <p className="text-[11px] text-muted-foreground">
                    {product.brand_name}
                    {product.main_category ? ` · ${product.main_category}` : ""}
                  </p>
                  <p className="text-sm font-medium text-foreground leading-tight mt-0.5 line-clamp-2">
                    {product.product_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {product.discount_rate > 0 && (
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: TERRACOTTA }}
                      >
                        {product.discount_rate}%
                      </span>
                    )}
                    <span className="text-sm font-bold text-foreground">
                      {product.sale_price.toLocaleString()}원
                    </span>
                  </div>
                  {product.discount_rate > 0 && (
                    <p className="text-[11px] text-muted-foreground line-through">
                      {product.original_price.toLocaleString()}원
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
