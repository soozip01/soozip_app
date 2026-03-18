/* SOOZIP Design: Japandi Minimalism - Search Page */
import { useState } from "react";
import { ArrowLeft, Search, Package } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

const POPULAR_SEARCHES = ["침구", "캔들", "쿠션", "러그", "식기", "조명", "화분", "수납"];

const ALL_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `라이프스타일 샘플상품 ${i + 1}`,
  brand: `브랜드${(i % 4) + 1}`,
  price: `₩${(10000 + i * 3000).toLocaleString()}`,
  category: ["홈/인테리어", "패브릭/침구", "주방/식기", "조명/소품"][i % 4],
}));

export default function SearchPage() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const results = searched && query
    ? ALL_PRODUCTS.filter((p) => p.name.includes(query) || p.brand.includes(query) || p.category.includes(query))
    : [];

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
            className="flex-1 bg-secondary rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </form>
        </div>
      </header>

      <main className="px-4 py-6">
        {!searched ? (
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">인기 검색어</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-secondary rounded-full text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={48} className="text-muted-foreground mb-4" strokeWidth={1} />
            <p className="font-medium text-foreground mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground">다른 검색어로 시도해보세요</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-4">"{query}" 검색 결과 {results.length}개</p>
            <div className="grid grid-cols-2 gap-4">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="aspect-square bg-secondary rounded-xl flex items-center justify-center mb-2 overflow-hidden group-hover:opacity-90 transition-opacity">
                    <Package size={40} className="text-muted-foreground" strokeWidth={1} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground leading-tight mt-0.5 line-clamp-2">{product.name}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
