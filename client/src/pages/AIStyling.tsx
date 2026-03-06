/* SOOZIP Design: Japandi Minimalism - AI Styling Page
 * AI-powered styling recommendation service
 */
import { useState } from "react";
import { ArrowLeft, Sparkles, Upload, RefreshCw, Package } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

const STYLE_OPTIONS = ["미니멀", "내추럴", "보헤미안", "스칸디나비안", "모던", "클래식"];
const COLOR_OPTIONS = ["화이트/크림", "베이지/브라운", "그린/내추럴", "블루/그레이", "블랙/다크", "핑크/코랄"];
const ROOM_OPTIONS = ["거실", "침실", "주방", "욕실", "서재"];

const RECOMMENDED_PRODUCTS = [
  { id: 1, name: "내추럴 리넨 쿠션", brand: "홈리빙", price: "₩35,000", match: "98%" },
  { id: 2, name: "세라믹 화병 세트", brand: "아르떼", price: "₩52,000", match: "95%" },
  { id: 3, name: "우드 트레이", brand: "나무공방", price: "₩28,000", match: "92%" },
  { id: 4, name: "코튼 니트 담요", brand: "소프트홈", price: "₩68,000", match: "90%" },
];

export default function AIStyling() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const handleAnalyze = () => {
    if (!selectedStyle || !selectedColor || !selectedRoom) {
      toast.error("스타일, 색상, 공간을 모두 선택해주세요.");
      return;
    }
    setStep("loading");
    setTimeout(() => setStep("result"), 2500);
  };

  const handleReset = () => {
    setStep("input");
    setSelectedStyle("");
    setSelectedColor("");
    setSelectedRoom("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">AI 스타일링</span>
          {step === "result" && (
            <button
              onClick={handleReset}
              className="ml-auto p-1.5 hover:bg-secondary rounded-lg transition-colors"
            >
              <RefreshCw size={18} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Loading State */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={36} className="text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-2">AI가 분석 중입니다</p>
              <p className="text-sm text-muted-foreground">취향에 맞는 스타일링을 추천해드릴게요</p>
            </div>
          </div>
        )}

        {/* Input State */}
        {step === "input" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="relative rounded-2xl overflow-hidden h-36">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-2-TrWBStW7qFvVDic8hxjkgr.webp"
                alt="AI 스타일링"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
                <Sparkles size={28} strokeWidth={1.5} className="mb-2" />
                <p className="font-bold text-base">AI 스타일 추천</p>
                <p className="text-xs opacity-90">취향을 분석해 최적의 스타일을 제안합니다</p>
              </div>
            </div>

            {/* Photo Upload (placeholder) */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">공간 사진 업로드 (선택)</p>
              <button
                onClick={() => toast.info("사진 업로드 기능이 준비 중입니다.")}
                className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-secondary/50 transition-colors"
              >
                <Upload size={24} className="text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">사진을 업로드하면 더 정확한 추천이 가능합니다</p>
                <p className="text-xs text-muted-foreground/70">JPG, PNG (최대 10MB)</p>
              </button>
            </div>

            {/* Style Selection */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">선호 스타일 *</p>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedStyle === style
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">선호 색상 *</p>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors text-left ${
                      selectedColor === color
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">공간 선택 *</p>
              <div className="flex gap-2 flex-wrap">
                {ROOM_OPTIONS.map((room) => (
                  <button
                    key={room}
                    onClick={() => setSelectedRoom(room)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedRoom === room
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              AI 스타일링 추천받기
            </button>
          </div>
        )}

        {/* Result State */}
        {step === "result" && (
          <div className="space-y-6">
            {/* Result header */}
            <div className="bg-secondary rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-primary" />
                <p className="font-semibold text-foreground text-sm">AI 분석 결과</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">{selectedStyle} × {selectedColor}</span> 스타일의 {selectedRoom}을 위한 맞춤 스타일링을 추천해드립니다. 자연스럽고 따뜻한 분위기의 제품들을 큐레이션했습니다.
              </p>
            </div>

            {/* Styling shot */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">추천 스타일링샷</p>
              <div className="rounded-2xl overflow-hidden h-56">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-1-eErXfuzzDPMuwShQpGNzrW.webp"
                  alt="추천 스타일링"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Recommended products */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">추천 상품</p>
              <div className="space-y-3">
                {RECOMMENDED_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 bg-secondary rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition-colors"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="w-14 h-14 bg-background rounded-lg flex items-center justify-center shrink-0">
                      <Package size={24} className="text-muted-foreground" strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <p className="text-sm font-medium text-foreground leading-tight">{product.name}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{product.price}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {product.match} 매칭
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              전체 상품 보기
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
