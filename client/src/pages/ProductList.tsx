/* SOOZIP Design: Japandi Minimalism - Product List Page
 * Grid layout with product cards, category filter tabs
 */
import { useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal, Package } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

const CATEGORIES = ["전체", "공동구매", "인기차트", "오늘의세일", "패키지", "신상품", "라이프스타일"];

const PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
  name: `라이프스타일 샘플상품 ${i + 1}`,
  discount: i % 3 === 0 ? "할인10%" : i % 3 === 1 ? "할인15%" : "",
  price: `₩${(10000 + i * 5000).toLocaleString()}`,
  originalPrice: `₩${(12000 + i * 5500).toLocaleString()}`,
  brand: `브랜드${(i % 4) + 1}`,
  image: null,
}));

export default function ProductList() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "전체" || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.includes(searchQuery) || p.brand.includes(searchQuery);
    return matchCat && matchSearch;
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
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors font-medium ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        <p className="text-xs text-muted-foreground mb-4">총 {filtered.length}개 상품</p>
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="cursor-pointer group"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="aspect-square bg-secondary rounded-xl flex items-center justify-center mb-2 overflow-hidden group-hover:opacity-90 transition-opacity">
                <Package size={40} className="text-muted-foreground" strokeWidth={1} />
              </div>
              <p className="text-[11px] text-muted-foreground">{product.brand} · {product.category}</p>
              <p className="text-sm font-medium text-foreground leading-tight mt-0.5 line-clamp-2">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {product.discount && (
                  <span className="text-[11px] text-primary font-semibold">{product.discount}</span>
                )}
                <span className="text-sm font-bold text-foreground">{product.price}</span>
              </div>
              {product.originalPrice && product.discount && (
                <p className="text-[11px] text-muted-foreground line-through">{product.originalPrice}</p>
              )}
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
