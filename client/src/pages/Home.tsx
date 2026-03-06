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
import { Search, User, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const TERRACOTTA = "oklch(0.58 0.16 38)";

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

/* ─── 뉴스 슬라이더 데이터 (드래그 슬라이드) ─── */
const NEWS_ITEMS = [
  { id: 1, label: "공동구매", title: "공동구매 최신 소식", desc: "지금 바로 확인해보세요 →" },
  { id: 2, label: "신상품", title: "신상품 업데이트", desc: "새로운 컬렉션이 도착했어요 →" },
  { id: 3, label: "세일", title: "오늘의 세일 아이템", desc: "최대 50% 할인 중 →" },
  { id: 4, label: "패키지", title: "패키지 최신 소식", desc: "합리적인 패키지 구성 →" },
  { id: 5, label: "브랜드", title: "신규 브랜드 입점", desc: "새로운 브랜드를 만나보세요 →" },
  { id: 6, label: "이벤트", title: "이벤트 진행 중", desc: "놓치지 마세요 →" },
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

/* ─── 샘플 상품 (스타일링샷 연동 예정) ─── */
const STYLING_PRODUCTS = [
  { id: 1, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 2, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 3, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 4, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
  { id: 5, brand: "브랜드명", name: "상품명", discount: "할인%", price: "10,000" },
];

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

/* ─── 뉴스 슬라이더 컴포넌트 (드래그 슬라이드) ─── */
function NewsDragSlider() {
  const { current, setCurrent, handlers } = useDragSlide(NEWS_ITEMS.length);

  return (
    <div className="w-full bg-background border-b border-border overflow-hidden">
      {/* 카테고리 원형 탭 */}
      <div className="flex gap-3 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
        {NEWS_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrent(idx)}
            className="flex flex-col items-center gap-1 shrink-0 transition-opacity"
            style={{ opacity: idx === current ? 1 : 0.45 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={
                idx === current
                  ? { background: TERRACOTTA, color: "white", border: `2px solid ${TERRACOTTA}` }
                  : { background: "oklch(0.94 0 0)", color: "oklch(0.08 0 0)", border: "2px solid transparent" }
              }
            >
              {item.label.slice(0, 2)}
            </div>
            <span className="text-[10px] font-medium text-foreground whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 뉴스 카드 슬라이드 (드래그) */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none px-4 pb-3"
        {...handlers}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {NEWS_ITEMS.map((item) => (
            <div key={item.id} className="w-full shrink-0">
              <div className="bg-secondary rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: TERRACOTTA }}
                  >
                    S
                  </div>
                  <span className="text-xs font-semibold text-foreground">SOOZIP</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">방금 전</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex justify-center gap-1.5 pb-2">
        {NEWS_ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="rounded-full transition-all"
            style={{
              width: idx === current ? "16px" : "5px",
              height: "5px",
              background: idx === current ? TERRACOTTA : "oklch(0.8 0 0)",
            }}
          />
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
            <button onClick={() => navigate("/login")} className="p-1.5 hover:bg-secondary rounded-md transition-colors">
              <User size={19} />
            </button>
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

      {/* ── 뉴스 드래그 슬라이더 ── */}
      <NewsDragSlider />

      {/* ── 히어로 배너 (드래그 슬라이드) ── */}
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: "240px", cursor: "grab", touchAction: "pan-y" }}
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
              onClick={() => setBanner(idx)}
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
        <button
          onClick={() => setShowStylingModal(true)}
          className="flex-1 py-3 rounded-lg font-semibold text-center transition-opacity hover:opacity-90 text-sm"
          style={btnStyle}
        >
          홈 스타일링 신청
        </button>
        <button
          onClick={() => setShowAIModal(true)}
          className="flex-1 py-3 rounded-lg font-semibold text-center transition-opacity hover:opacity-90 text-sm"
          style={btnStyle}
        >
          AI 스타일링
        </button>
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

        {/* 스타일링샷 연동 제품 리스트 (별도 가로 슬라이드) */}
        <div className="mt-3 overflow-x-auto scrollbar-hide" style={{ touchAction: "pan-x" }}>
          <div className="flex gap-px pl-4" style={{ width: "max-content" }}>
            {STYLING_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-background cursor-pointer hover:bg-secondary transition-colors"
                style={{ width: "130px" }}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {/* 상품 이미지 플레이스홀더 (실제 입점 상품 연동 예정) */}
                <div
                  className="bg-secondary flex items-center justify-center overflow-hidden"
                  style={{ width: "130px", height: "130px" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-muted-foreground leading-none">{product.brand}</p>
                  <p className="text-xs font-semibold text-foreground leading-tight mt-0.5">{product.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-semibold" style={{ color: TERRACOTTA }}>
                      {product.discount}
                    </span>
                    <span className="text-xs font-bold text-foreground">{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
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
