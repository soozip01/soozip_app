/* SOOZIP Design: Japandi Minimalism - Home Page
 * Mobile-first layout matching original soozipapp-fcsfpps5.manus.space
 * Warm beige/cream palette, lifestyle imagery, clean typography
 * Full-width banner, bottom tab nav with icons
 */
import { useState, useEffect, useRef } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const BANNER_IMAGES = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-1-DpQpCtKnhZ9TEbw6YMnHqr.webp",
    title: "공동구매",
    subtitle: "인기차트",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-2-TrWBStW7qFvVDic8hxjkgr.webp",
    title: "신상품",
    subtitle: "최신 컬렉션",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-2-jq9H9J9aQBWyEn4oo7kERK.webp",
    title: "오늘의세일",
    subtitle: "영감을 얻다",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-3-XezbvD4LgG4u4sc5oCc2Kp.webp",
    title: "패키지",
    subtitle: "라이프스타일",
  },
];

const STYLING_SHOTS = [
  {
    id: 1,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-2-jq9H9J9aQBWyEn4oo7kERK.webp",
    title: "코지 리빙룸",
  },
  {
    id: 2,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-1-eErXfuzzDPMuwShQpGNzrW.webp",
    title: "내추럴 코너",
  },
  {
    id: 3,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-3-XezbvD4LgG4u4sc5oCc2Kp.webp",
    title: "키친 스타일링",
  },
];

const SAMPLE_PRODUCTS = [
  { id: 1, category: "라이프스타일", name: "샘플상품", discount: "할인10%", price: "₩10,000", originalPrice: "₩11,111" },
  { id: 2, category: "라이프스타일", name: "샘플상품", discount: "할인10%", price: "₩10,000", originalPrice: "₩11,111" },
  { id: 3, category: "라이프스타일", name: "샘플상품", discount: "할인10%", price: "₩10,000", originalPrice: "₩11,111" },
];

const CATEGORIES = ["공동구매", "인기차트", "오늘의세일", "패키지", "신상품"];

export default function Home() {
  const [, navigate] = useLocation();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState("공동구매");
  const [currentStylingPage, setCurrentStylingPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, []);

  const handleBannerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStart(x);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  const handleBannerDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - x;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
      }
    }
    setIsDragging(false);
    autoSlideRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 w-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        {/* Top bar */}
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div
            className="bg-foreground text-background px-3 py-1.5 rounded font-bold text-sm tracking-widest cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            SOOZIP
          </div>
          <form onSubmit={handleSearch} className="flex-1 bg-secondary rounded-lg px-3 py-2 flex items-center gap-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
          </form>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => navigate("/mypage")}
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
            >
              <User size={20} className="text-foreground" />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="p-1.5 hover:bg-secondary rounded-lg transition-colors relative"
            >
              <ShoppingCart size={20} className="text-foreground" />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Category tabs - same as original */}
        <div className="px-2 py-1.5 flex gap-1 overflow-x-auto scrollbar-hide border-t border-border">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                navigate(`/products?category=${encodeURIComponent(cat)}`);
              }}
              className={`px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors font-medium ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Banner - Full width */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "260px" }}
        onMouseDown={handleBannerDragStart}
        onMouseUp={handleBannerDragEnd}
        onTouchStart={handleBannerDragStart}
        onTouchEnd={handleBannerDragEnd}

      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentBanner * 100}%)`, width: `${BANNER_IMAGES.length * 100}%` }}
        >
          {BANNER_IMAGES.map((banner, idx) => (
            <div
              key={idx}
              className="relative h-full"
              style={{ width: `${100 / BANNER_IMAGES.length}%` }}
            >
              <img
                src={banner.url}
                alt={banner.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold tracking-tight">{banner.title}</h2>
                <p className="text-sm opacity-90 mt-1">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {BANNER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentBanner ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Styling Service Buttons */}
      <div className="px-4 py-4 flex gap-3 border-b border-border">
        <a
          href="/styling-request"
          onClick={(e) => { e.preventDefault(); navigate("/styling-request"); }}
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium text-center hover:bg-secondary transition-colors text-sm"
        >
          홈 스타일링 신청
        </a>
        <a
          href="/ai-styling"
          onClick={(e) => { e.preventDefault(); navigate("/ai-styling"); }}
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium text-center hover:bg-secondary transition-colors text-sm"
        >
          AI 스타일링
        </a>
      </div>

      {/* Best Styling Shots Section */}
      <section className="py-6">
        <h2 className="px-4 text-base font-semibold text-foreground mb-4">오늘의 베스트 스타일링샷</h2>

        {/* Featured styling shot - full width */}
        <div className="relative w-full" style={{ height: "220px" }}>
          <img
            src={STYLING_SHOTS[currentStylingPage]?.url}
            alt={STYLING_SHOTS[currentStylingPage]?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm font-medium">{STYLING_SHOTS[currentStylingPage]?.title}</p>
          </div>
          {/* Dot indicators */}
          <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
            {STYLING_SHOTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStylingPage(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStylingPage ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-3 gap-px mt-px bg-border">
          {SAMPLE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-background cursor-pointer p-3"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center mb-2 overflow-hidden hover:opacity-90 transition-opacity">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground leading-none">{product.category}</p>
              <p className="text-xs font-medium text-foreground leading-tight mt-0.5">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-primary font-medium">{product.discount}</span>
                <span className="text-xs font-bold text-foreground">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Business Inquiry Buttons */}
      <section className="px-4 py-5 border-t border-border">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/brand-entry")}
            className="flex-1 border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
          >
            입점문의
          </button>
          <button
            onClick={() => toast.info("공구문의 기능이 준비 중입니다.")}
            className="flex-1 border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
          >
            공구문의
          </button>
          <button
            onClick={() => toast.info("대량구매 문의 기능이 준비 중입니다.")}
            className="flex-1 border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
          >
            대량구매
          </button>
        </div>
      </section>

      {/* Customer Service */}
      <section className="px-4 py-6 border-t border-border">
        <div className="space-y-1.5 text-center">
          <p className="text-sm font-semibold text-foreground">고객센터</p>
          <p className="text-xs text-muted-foreground">
            통화가 어려운 경우 제품별 상세문의 또는 1:1문의를 남겨주세요
          </p>
          <p className="text-xl font-bold text-foreground">010-7520-8351</p>
          <p className="text-xs text-muted-foreground">평일 10:00-17:00</p>
        </div>
      </section>

      {/* Contact Buttons */}
      <section className="px-4 py-4 border-t border-border flex gap-3">
        <button
          onClick={() => navigate("/inquiry")}
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
        >
          1:1 문의하기
        </button>
        <button
          onClick={() => toast.info("자주 묻는 질문 페이지가 준비 중입니다.")}
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
        >
          자주 묻는 질문
        </button>
      </section>

      <BottomNav />
    </div>
  );
}
