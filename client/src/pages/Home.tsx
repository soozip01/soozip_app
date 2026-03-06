/* SOOZIP Design: Monochrome + Terracotta Orange
 * Primary: Black (#0a0a0a) / White (#ffffff)
 * Accent: Terracotta oklch(0.58 0.16 38) ≈ #D4622A
 * Layout: Mobile-first, full-width sections
 * Features: Instagram-story-style news slider, external link buttons, styling shot gallery
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

/* ─── 배너 데이터 ─── */
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
    subtitle: "특별 할인",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-3-XezbvD4LgG4u4sc5oCc2Kp.webp",
    title: "패키지",
    subtitle: "라이프스타일",
  },
];

/* ─── 뉴스/스토리 슬라이더 데이터 ─── */
const NEWS_STORIES = [
  { id: 1, label: "공동구매", color: "bg-terracotta", active: true },
  { id: 2, label: "신상품", color: "bg-foreground", active: false },
  { id: 3, label: "세일", color: "bg-foreground", active: false },
  { id: 4, label: "패키지", color: "bg-foreground", active: false },
  { id: 5, label: "브랜드", color: "bg-foreground", active: false },
  { id: 6, label: "이벤트", color: "bg-foreground", active: false },
];

/* ─── 스타일링샷 (실제 상품 연동 예정) ─── */
const STYLING_SHOT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/pasted_file_gyuR7v_image_3690b370.png";

/* ─── 샘플 상품 (스타일링샷 연동 예정) ─── */
const STYLING_PRODUCTS = [
  { id: 1, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 2, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 3, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
];

const CATEGORIES = ["공동구매", "인기차트", "오늘의세일", "패키지", "신상품"];

/* ─── 인스타그램 스토리형 뉴스 슬라이더 컴포넌트 ─── */
function NewsStorySlider() {
  const [activeStory, setActiveStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 4000; // 4초
  const INTERVAL = 50;

  const goToStory = useCallback((idx: number) => {
    setActiveStory(idx);
    setProgress(0);
  }, []);

  const nextStory = useCallback(() => {
    setActiveStory((prev) => {
      const next = (prev + 1) % NEWS_STORIES.length;
      setProgress(0);
      return next;
    });
  }, []);

  const prevStory = useCallback(() => {
    setActiveStory((prev) => {
      const next = (prev - 1 + NEWS_STORIES.length) % NEWS_STORIES.length;
      setProgress(0);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (INTERVAL / DURATION) * 100;
      });
    }, INTERVAL);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPaused, activeStory, nextStory]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  return (
    <div className="w-full bg-background border-b border-border">
      {/* Progress bars */}
      <div className="flex gap-1 px-3 pt-3 pb-1">
        {NEWS_STORIES.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-none"
              style={{
                width: idx < activeStory ? "100%" : idx === activeStory ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Story content area */}
      <div
        className="relative px-3 py-3 cursor-pointer select-none"
        onClick={handleTap}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story labels row */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {NEWS_STORIES.map((story, idx) => (
            <button
              key={story.id}
              onClick={(e) => { e.stopPropagation(); goToStory(idx); }}
              className={`flex flex-col items-center gap-1.5 shrink-0 transition-opacity ${
                idx === activeStory ? "opacity-100" : "opacity-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden ${
                  idx === activeStory ? "border-terracotta" : "border-border"
                }`}
                style={idx === activeStory ? { borderColor: "oklch(0.58 0.16 38)" } : {}}
              >
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: idx === activeStory
                      ? "oklch(0.58 0.16 38)"
                      : "oklch(0.94 0 0)",
                    color: idx === activeStory ? "white" : "oklch(0.08 0 0)",
                  }}
                >
                  {story.label.slice(0, 2)}
                </div>
              </div>
              <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{story.label}</span>
            </button>
          ))}
        </div>

        {/* Active story content */}
        <div className="mt-3 p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "oklch(0.58 0.16 38)" }}
            >
              S
            </div>
            <span className="text-xs font-semibold text-foreground">SOOZIP</span>
            <span className="text-[10px] text-muted-foreground ml-auto">방금 전</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            {NEWS_STORIES[activeStory]?.label} 최신 소식
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            지금 바로 확인해보세요 →
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 홈 컴포넌트 ─── */
export default function Home() {
  const [, navigate] = useLocation();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState("공동구매");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 배너 자동 슬라이드 */
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3500);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [startAutoSlide]);

  const handleBannerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(x);
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  const handleBannerDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX - x;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
      }
    }
    setIsDragging(false);
    startAutoSlide();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  /* 홈 스타일링 신청 - iframe 오버레이로 자연스럽게 연결 */
  const [showStylingModal, setShowStylingModal] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 w-full overflow-x-hidden">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        {/* 상단 바 */}
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <div
            className="text-background px-3 py-1.5 rounded font-black text-sm tracking-widest cursor-pointer shrink-0"
            style={{ background: "oklch(0.08 0 0)" }}
            onClick={() => navigate("/")}
          >
            SOOZIP
          </div>
          <form onSubmit={handleSearch} className="flex-1 bg-secondary rounded-md px-3 py-2 flex items-center gap-2">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
          </form>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={() => navigate("/mypage")} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
              <User size={19} />
            </button>
            <button onClick={() => navigate("/cart")} className="p-1.5 hover:bg-secondary rounded-md transition-colors relative">
              <ShoppingCart size={19} />
              <span
                className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: "oklch(0.58 0.16 38)" }}
              >
                0
              </span>
            </button>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="px-2 py-1.5 flex gap-0.5 overflow-x-auto scrollbar-hide border-t border-border">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                navigate(`/products?category=${encodeURIComponent(cat)}`);
              }}
              className="px-3.5 py-1.5 rounded text-sm whitespace-nowrap transition-colors font-medium"
              style={
                activeCategory === cat
                  ? { background: "oklch(0.08 0 0)", color: "white" }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* ── 뉴스/스토리 슬라이더 (인스타그램 스토리형) ── */}
      <NewsStorySlider />

      {/* ── 히어로 배너 ── */}
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: "240px", cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleBannerDragStart}
        onMouseUp={handleBannerDragEnd}
        onTouchStart={handleBannerDragStart}
        onTouchEnd={handleBannerDragEnd}
      >
        <div
          className="flex h-full transition-transform duration-400 ease-out"
          style={{
            transform: `translateX(-${currentBanner * 100}%)`,
            width: `${BANNER_IMAGES.length * 100}%`,
          }}
        >
          {BANNER_IMAGES.map((banner, idx) => (
            <div key={idx} className="relative h-full" style={{ width: `${100 / BANNER_IMAGES.length}%` }}>
              <img src={banner.url} alt={banner.title} className="w-full h-full object-cover" draggable={false} />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-black tracking-tight">{banner.title}</h2>
                <p className="text-sm opacity-80 mt-1">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        {/* 도트 인디케이터 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {BANNER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === currentBanner ? "20px" : "6px",
                background: idx === currentBanner ? "white" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── 스타일링 서비스 버튼 ── */}
      <div className="px-4 py-4 flex gap-3 border-b border-border">
        {/* 홈 스타일링 신청 → iframe 모달로 자연스럽게 연결 */}
        <button
          onClick={() => setShowStylingModal(true)}
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium text-center hover:bg-secondary transition-colors text-sm"
        >
          홈 스타일링 신청
        </button>
        {/* AI 스타일링 → 외부 링크 */}
        <a
          href="https://www.houme.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 border border-border text-foreground py-3 rounded-lg font-medium text-center hover:bg-secondary transition-colors text-sm flex items-center justify-center"
        >
          AI 스타일링
        </a>
      </div>

      {/* ── 오늘의 베스트 스타일링샷 ── */}
      <section className="py-5">
        <h2 className="px-4 text-base font-bold text-foreground mb-3">오늘의 베스트 스타일링샷</h2>

        {/* 스타일링샷 이미지 (5번째 첨부 이미지) */}
        <div className="relative w-full" style={{ height: "220px" }}>
          <img
            src={STYLING_SHOT_IMAGE}
            alt="오늘의 베스트 스타일링샷"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* 스타일링샷 연동 상품 그리드 */}
        <div className="grid grid-cols-3 gap-px mt-px bg-border">
          {STYLING_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-background cursor-pointer p-3 hover:bg-secondary transition-colors"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* 상품 이미지 플레이스홀더 (실제 입점 상품 연동 예정) */}
              <div className="aspect-square bg-secondary rounded-md flex items-center justify-center mb-2 overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground leading-none">{product.brand}</p>
              <p className="text-xs font-semibold text-foreground leading-tight mt-0.5">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-medium" style={{ color: "oklch(0.58 0.16 38)" }}>
                  {product.discount}
                </span>
                <span className="text-xs font-bold text-foreground">₩{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 비즈니스 문의 버튼 ── */}
      <section className="px-4 py-4 border-t border-border">
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

      {/* ── 고객센터 ── */}
      <section className="px-4 py-6 border-t border-border">
        <div className="space-y-1.5 text-center">
          <p className="text-sm font-bold text-foreground">고객센터</p>
          <p className="text-xs text-muted-foreground">
            통화가 어려운 경우 제품별 상세문의 또는 1:1문의를 남겨주세요
          </p>
          <p className="text-xl font-black text-foreground tracking-tight">010-7520-8351</p>
          <p className="text-xs text-muted-foreground">평일 10:00 - 17:00</p>
        </div>
      </section>

      {/* ── 1:1 문의 / FAQ ── */}
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

      {/* ── 하단 네비게이션 ── */}
      <BottomNav />

      {/* ── 홈 스타일링 신청 iframe 모달 ── */}
      {showStylingModal && (
        <div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
            <button
              onClick={() => setShowStylingModal(false)}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <span className="text-sm font-bold text-foreground">홈 스타일링 신청</span>
            <div className="w-8" />
          </div>
          {/* iframe */}
          <iframe
            src="https://soozipland-j3tut3mq.manus.space/"
            className="flex-1 w-full border-none"
            title="홈 스타일링 신청"
          />
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
