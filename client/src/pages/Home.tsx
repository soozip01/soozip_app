/* SOOZIP Design: Monochrome + Terracotta Orange
 * Primary: Black (#0a0a0a) / White (#ffffff)
 * Accent: Terracotta oklch(0.58 0.16 38) ≈ #D4622A
 * Layout: Mobile-first, full-width sections
 * Features:
 *   - 뉴스 슬라이더: 드래그/스와이프로 좌우 이동 (인스타 스토리 영역 삭제)
 *   - 스타일링샷: 드래그 슬라이드 (소비자/판매자 업로드 공간)
 *   - 제품 리스트: 별도 가로 슬라이드
 *   - 버튼: 포인트 컬러(테라코타) 배경
 *   - AI 스타일링: iframe 모달로 자연스럽게 연결
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, ShoppingCart, Home as HomeIcon, Sparkles, Map, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useApprovedProducts } from "@/hooks/useProducts";
import { useSoozipAuth } from "@/contexts/AuthContext";

const TERRACOTTA = "oklch(0.55 0.22 32)"; // 선명한 오렌지-레드 (#E84B1A 계열)

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

/* ─── 뉴스 배너 데이터 (관리자 등록 시 자동 슬라이드) ─── */
// 관리자가 등록한 핵심 뉴스만 표시됩니다. 비어있으면 영역이 숨겨집니다.
const NEWS_BANNERS: { id: number; title: string; desc: string; bg: string }[] = [
  // 예시: { id: 1, title: "공동구매 최신 소식", desc: "지금 바로 확인해보세요", bg: TERRACOTTA },
];

/* ─── 스타일링샷 데이터 (소비자/판매자 업로드 공간) ─── */
const STYLING_SHOTS = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/pasted_file_gyuR7v_image_3690b370.png",
    title: "코지 리빙룸",
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-1-DpQpCtKnhZ9TEbw6YMnHqr.webp",
    title: "내추럴 베드룸",
  },
  {
    id: 3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-2-jq9H9J9aQBWyEn4oo7kERK.webp",
    title: "미니멀 코너",
  },
];

/* STYLING_PRODUCTS: Supabase 실제 데이터로 교체됨 (useApprovedProducts 훅 사용) */

/* ─── 드래그 슬라이드 훅 ─── */
function useDragSlide(total: number) {
  const [current, setCurrent] = useState(0);
  const dragStart = useRef(0);
  const isDragging = useRef(false);

  const onDragStart = (x: number) => {
    dragStart.current = x;
    isDragging.current = true;
  };

  const onDragEnd = (x: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStart.current - x;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrent((p) => Math.min(p + 1, total - 1));
      else setCurrent((p) => Math.max(p - 1, 0));
    }
  };

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => onDragStart(e.clientX),
    onMouseUp: (e: React.MouseEvent) => onDragEnd(e.clientX),
    onTouchStart: (e: React.TouchEvent) => onDragStart(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => onDragEnd(e.changedTouches[0].clientX),
  };

  return { current, setCurrent, handlers };
}

/* ─── 카테고리 원형 탭 컴포넌트 (독립 영역) ─── */
// 각 카테고리에 어울리는 lucide 아이콘 SVG path
const CATEGORY_TABS = [
  {
    id: 1, label: "공동구매",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 2, label: "신상품",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
  {
    id: 3, label: "세일",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 4, label: "패키지",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    id: 5, label: "브랜드",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
      </svg>
    ),
  },
  {
    id: 6, label: "이벤트",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

function CategoryTabs() {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full bg-background">
      <div className="flex gap-3 px-4 pt-3 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORY_TABS.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActive(idx)}
            className="flex flex-col items-center gap-1 shrink-0 transition-opacity"
            style={{ opacity: idx === active ? 1 : 0.45 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              style={
                idx === active
                  ? { background: TERRACOTTA, color: "white", border: `2px solid ${TERRACOTTA}` }
                  : { background: "oklch(0.94 0 0)", color: "oklch(0.35 0 0)", border: "2px solid transparent" }
              }
            >
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── 뉴스 배너 컴포넌트 (관리자 등록 시 3초 자동 슬라이드) ─── */
function NewsBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (NEWS_BANNERS.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % NEWS_BANNERS.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (NEWS_BANNERS.length === 0) return null;

  return (
    <div className="w-full overflow-hidden" style={{ background: TERRACOTTA }}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {NEWS_BANNERS.map((item) => (
          <div key={item.id} className="w-full shrink-0 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                S
              </div>
              <div>
                <span className="text-xs font-bold text-white">{item.title}</span>
                {item.desc && <span className="text-[11px] text-white/80 ml-1.5">{item.desc}</span>}
              </div>
            </div>
            {NEWS_BANNERS.length > 1 && (
              <div className="flex gap-1 shrink-0">
                {NEWS_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className="rounded-full transition-all"
                    style={{
                      width: idx === current ? "14px" : "4px",
                      height: "4px",
                      background: idx === current ? "white" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 메인 홈 컴포넌트 ─── */
export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showStylingModal, setShowStylingModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const { user: soozipUser, isLoggedIn } = useSoozipAuth();

  /* 배너 자동 슬라이드 */
  const { current: currentBanner, setCurrent: setBanner, handlers: bannerHandlers } = useDragSlide(BANNER_IMAGES.length);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setBanner((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3500);
  }, [setBanner]);

  useEffect(() => {
    startAutoSlide();
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [startAutoSlide]);

  /* 스타일링샷 슬라이드 */
  const { current: currentShot, setCurrent: setShot, handlers: shotHandlers } = useDragSlide(STYLING_SHOTS.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  /* Supabase 승인 상품 데이터 */
  const { products: approvedProducts, loading: productsLoading } = useApprovedProducts();

  /* 버튼 공통 스타일 - 포인트 컬러 배경 */
  const btnStyle = {
    background: TERRACOTTA,
    color: "white",
    border: "none",
  };

  return (
    <div className="min-h-screen bg-background pb-16 w-full overflow-x-hidden">
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <div
            className="text-white px-3 py-1.5 rounded font-black text-sm tracking-widest cursor-pointer shrink-0"
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
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/mypage")}
                className="flex items-center gap-1 px-2 py-1 hover:bg-secondary rounded-md transition-colors text-xs font-semibold text-foreground"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: TERRACOTTA }}
                >
                  {soozipUser?.nickname?.slice(0, 1) ?? "U"}
                </div>
                <span className="max-w-[60px] truncate">{soozipUser?.nickname}</span>
              </button>
            ) : (
              <button onClick={() => navigate("/login")} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
                <User size={19} />
              </button>
            )}
            <button onClick={() => navigate("/cart")} className="p-1.5 hover:bg-secondary rounded-md transition-colors relative">
              <ShoppingCart size={19} />
              <span
                className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: TERRACOTTA }}
              >
                0
              </span>
            </button>
          </div>
        </div>


      </header>

      {/* ── 카테고리 원형 탭 (독립 영역) ── */}
      <CategoryTabs />

      {/* ── 뉴스 배너 (관리자 등록 시만 표시) ── */}
      <NewsBanner />


      {/* ── 서비스 버튼 카드 (3개 그리드) ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto" }}>
          {/* 홈 스타일링 신청 - 왼쪽 큰 카드 (세로 2칸 차지) */}
          <button
            onClick={() => setShowStylingModal(true)}
            className="relative overflow-hidden rounded-2xl text-left transition-all hover:brightness-95 active:scale-[0.97]"
            style={{ background: "oklch(0.93 0 0)", gridRow: "1 / 3", minHeight: "150px" }}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <p className="text-foreground font-bold text-base leading-snug">홈 스타일링<br />신청하기</p>
              <div className="flex justify-end">
                {/* 집 + 스파클 역동적 아이콘 */}
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect x="8" y="22" width="28" height="22" rx="2" fill="oklch(0.75 0 0)" />
                  <polygon points="4,24 22,8 40,24" fill="oklch(0.55 0 0)" />
                  <rect x="17" y="30" width="10" height="14" rx="1" fill="white" />
                  <circle cx="40" cy="14" r="5" fill={TERRACOTTA} opacity="0.85" />
                  <path d="M40 10v8M36 14h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </button>
          {/* AI 스타일링 - 오른쪽 위 */}
          <button
            onClick={() => setShowAIModal(true)}
            className="relative overflow-hidden rounded-2xl text-left transition-all hover:brightness-95 active:scale-[0.97]"
            style={{ background: "oklch(0.93 0 0)", minHeight: "70px" }}
          >
            <div className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-foreground font-bold text-sm">AI 스타일링</p>
              <div className="flex justify-end">
                {/* 뇌+번개 역동적 아이콘 */}
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <ellipse cx="17" cy="15" rx="10" ry="9" fill="oklch(0.78 0 0)" />
                  <path d="M13 24l2-5h4l-2 5h3l-5 9 1-6h-3z" fill={TERRACOTTA} />
                  <circle cx="13" cy="13" r="2" fill="white" opacity="0.7" />
                  <circle cx="20" cy="12" r="1.5" fill="white" opacity="0.5" />
                </svg>
              </div>
            </div>
          </button>
          {/* 내 집 도면찾기 - 오른쪽 아래 */}
          <button
            onClick={() => toast.info("내 집 도면찾기 기능이 준비 중입니다.")}
            className="relative overflow-hidden rounded-2xl text-left transition-all hover:brightness-95 active:scale-[0.97]"
            style={{ background: "oklch(0.93 0 0)", minHeight: "70px" }}
          >
            <div className="p-3.5 h-full flex flex-col justify-between">
              <p className="text-foreground font-bold text-sm">내 집 도면찾기</p>
              <div className="flex justify-end">
                {/* 도면+핀 역동적 아이콘 */}
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <rect x="4" y="6" width="22" height="18" rx="2" fill="oklch(0.78 0 0)" />
                  <rect x="7" y="9" width="8" height="6" rx="1" fill="white" opacity="0.8" />
                  <rect x="17" y="9" width="6" height="3" rx="0.5" fill="white" opacity="0.5" />
                  <rect x="7" y="17" width="16" height="2" rx="0.5" fill="white" opacity="0.4" />
                  <circle cx="26" cy="22" r="6" fill={TERRACOTTA} />
                  <path d="M26 18v5M26 25v1" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── 히어로 배너 (좌우 여백 + 더 축소) ── */}
      <div className="px-4 pb-4 pt-1">
        <div
          className="relative w-full overflow-hidden select-none rounded-xl"
          style={{ height: "130px", cursor: "grab", touchAction: "pan-y" }}
          onMouseDown={(e) => { bannerHandlers.onMouseDown(e); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
          onMouseUp={(e) => { bannerHandlers.onMouseUp(e); startAutoSlide(); }}
          onTouchStart={(e) => { bannerHandlers.onTouchStart(e); if (autoSlideRef.current) clearInterval(autoSlideRef.current); }}
          onTouchEnd={(e) => { bannerHandlers.onTouchEnd(e); startAutoSlide(); }}
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
                <div className="absolute inset-0 bg-black/35 rounded-xl" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-xl font-black tracking-tight">{banner.title}</h2>
                  <p className="text-xs opacity-75 mt-0.5">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          {/* 슬라이드 카운터 (우측 하단) */}
          <div
            className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold z-10"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {currentBanner + 1}/{BANNER_IMAGES.length}
          </div>
          {/* 도트 인디케이터 */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {BANNER_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setBanner(idx)}
                className="h-1 rounded-full transition-all"
                style={{
                  width: idx === currentBanner ? "16px" : "4px",
                  background: idx === currentBanner ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 오늘의 베스트 스타일링샷 ── */}
      <section className="py-5">
        <h2 className="px-4 text-base font-bold text-foreground mb-3">오늘의 베스트 스타일링샷</h2>

        {/* 스타일링샷 드래그 슬라이드 (소비자/판매자 업로드 공간) */}
        <div
          className="relative w-full overflow-hidden select-none"
          style={{ height: "220px", cursor: "grab", touchAction: "pan-y" }}
          {...shotHandlers}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentShot * 100}%)`,
              width: `${STYLING_SHOTS.length * 100}%`,
            }}
          >
            {STYLING_SHOTS.map((shot, idx) => (
              <div key={idx} className="relative h-full" style={{ width: `${100 / STYLING_SHOTS.length}%` }}>
                <img src={shot.image} alt={shot.title} className="w-full h-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-sm font-bold">{shot.title}</p>
                </div>
              </div>
            ))}
          </div>
          {/* 도트 인디케이터 */}
          <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
            {STYLING_SHOTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setShot(idx)}
                className="rounded-full transition-all"
                style={{
                  width: "6px",
                  height: "6px",
                  background: idx === currentShot ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </div>

        {/* 스타일링샷 연동 제품 리스트 - Supabase 실제 데이터 */}
        <div className="mt-3 overflow-x-auto scrollbar-hide" style={{ touchAction: "pan-x" }}>
          <div className="flex gap-px pl-4" style={{ width: "max-content" }}>
            {productsLoading ? (
              /* 로딩 스켈레톤 */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: "130px" }}>
                  <div className="bg-secondary animate-pulse" style={{ width: "130px", height: "130px" }} />
                  <div className="p-2 space-y-1">
                    <div className="bg-secondary animate-pulse h-2 w-16 rounded" />
                    <div className="bg-secondary animate-pulse h-3 w-20 rounded" />
                    <div className="bg-secondary animate-pulse h-3 w-14 rounded" />
                  </div>
                </div>
              ))
            ) : approvedProducts.length === 0 ? (
              /* 상품 없음 */
              <div className="pl-2 py-4 text-sm text-muted-foreground">
                등록된 상품이 없습니다.
              </div>
            ) : (
              approvedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-background cursor-pointer hover:bg-secondary transition-colors"
                  style={{ width: "130px" }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* 상품 대표 이미지 */}
                  <div
                    className="bg-secondary flex items-center justify-center overflow-hidden"
                    style={{ width: "130px", height: "130px" }}
                  >
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-muted-foreground leading-none">{product.brand_name}</p>
                    <p className="text-xs font-semibold text-foreground leading-tight mt-0.5">{product.product_name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {product.discount_rate > 0 && (
                        <span className="text-[10px] font-semibold" style={{ color: TERRACOTTA }}>
                          {product.discount_rate}%
                        </span>
                      )}
                      <span className="text-xs font-bold text-foreground">
                        {product.sale_price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {/* 오른쪽 여백 */}
            <div style={{ width: "16px", flexShrink: 0 }} />
          </div>
        </div>
      </section>

      {/* ── 비즈니스 문의 버튼 ── */}
      <section className="px-4 py-4 border-t border-border">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/brand-entry")}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm"
            style={btnStyle}
          >
            입점문의
          </button>
          <button
            onClick={() => toast.info("공구문의 기능이 준비 중입니다.")}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm"
            style={btnStyle}
          >
            공구문의
          </button>
          <button
            onClick={() => toast.info("대량구매 문의 기능이 준비 중입니다.")}
            className="flex-1 py-2.5 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm"
            style={btnStyle}
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
          className="flex-1 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm"
          style={btnStyle}
        >
          1:1 문의하기
        </button>
        <button
          onClick={() => toast.info("자주 묻는 질문 페이지가 준비 중입니다.")}
          className="flex-1 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 text-sm"
          style={btnStyle}
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
          style={{ animation: "slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
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
          <iframe
            src="https://soozipland-j3tut3mq.manus.space/"
            className="flex-1 w-full border-none"
            title="홈 스타일링 신청"
          />
        </div>
      )}

      {/* ── AI 스타일링 iframe 모달 ── */}
      {showAIModal && (
        <div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          style={{ animation: "slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background shrink-0">
            <button
              onClick={() => setShowAIModal(false)}
              className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <span className="text-sm font-bold text-foreground">AI 스타일링</span>
            <div className="w-8" />
          </div>
          <iframe
            src="https://www.houme.kr/"
            className="flex-1 w-full border-none"
            title="AI 스타일링"
          />
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
