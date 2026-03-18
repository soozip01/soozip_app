/* SOOZIP Design: Monochrome + Terracotta - Styling Shop Page
 * 스타일링샷을 보거나 쇼핑만을 할 수 있는 탭
 */
import { useState } from "react";
import { useLocation } from "wouter";
import BottomNav from "@/components/BottomNav";

const TABS = ["스타일링샷", "쇼핑"];

const STYLING_SHOTS = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/pasted_file_gyuR7v_image_3690b370.png",
    title: "코지 원룸 스타일링",
    brand: "SOOZIP",
    likes: 128,
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-2-jq9H9J9aQBWyEn4oo7kERK.webp",
    title: "내추럴 코너",
    brand: "SOOZIP",
    likes: 95,
  },
  {
    id: 3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/styling-shot-3-XezbvD4LgG4u4sc5oCc2Kp.webp",
    title: "미니멀 키친",
    brand: "SOOZIP",
    likes: 74,
  },
  {
    id: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663406277448/XB7s4BudnCsvwTPgLTz9RH/banner-lifestyle-1-DpQpCtKnhZ9TEbw6YMnHqr.webp",
    title: "베드룸 무드",
    brand: "SOOZIP",
    likes: 61,
  },
];

const SHOP_PRODUCTS = [
  { id: 1, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
  { id: 2, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
  { id: 3, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
  { id: 4, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
  { id: 5, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
  { id: 6, brand: "브랜드명", name: "상품명", discount: "10%", price: "10,000", originalPrice: "11,111" },
];

export default function StylingShop() {
  const [activeTab, setActiveTab] = useState("스타일링샷");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-black tracking-tight text-foreground">스타일링 & 쇼핑</h1>
        </div>
        {/* 탭 */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors relative"
              style={{ color: activeTab === tab ? "oklch(0.08 0 0)" : "oklch(0.5 0 0)" }}
            >
              {tab}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "oklch(0.58 0.16 38)" }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 스타일링샷 탭 */}
      {activeTab === "스타일링샷" && (
        <div className="grid grid-cols-2 gap-px bg-border">
          {STYLING_SHOTS.map((shot) => (
            <div
              key={shot.id}
              className="bg-background cursor-pointer"
              onClick={() => navigate(`/styling-shop/${shot.id}`)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={shot.image}
                  alt={shot.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground leading-tight">{shot.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{shot.brand}</span>
                  <div className="flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="oklch(0.58 0.16 38)" stroke="none">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span className="text-[10px] text-muted-foreground">{shot.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 쇼핑 탭 */}
      {activeTab === "쇼핑" && (
        <div className="grid grid-cols-2 gap-px bg-border">
          {SHOP_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-background cursor-pointer p-3"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="aspect-square bg-secondary rounded-md flex items-center justify-center mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground">{product.brand}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{product.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-medium" style={{ color: "oklch(0.58 0.16 38)" }}>
                  할인{product.discount}
                </span>
                <span className="text-xs font-bold text-foreground">₩{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
