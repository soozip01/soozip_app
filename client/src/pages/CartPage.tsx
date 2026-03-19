/**
 * 장바구니 페이지 - 오늘의집 스타일 참고
 * - 체크박스 개별/전체 선택
 * - 브랜드별 그룹핑
 * - 수량 조절 (+ / -)
 * - 선택 항목 삭제
 * - 무료배송 프로그레스바 (5만원 이상 무료)
 * - 주문 금액 요약 (할인 포함)
 * - 로그인 없이도 이용 가능 (localStorage 기반)
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  ShoppingCart, Trash2, Minus, Plus, Package, ChevronLeft, Check,
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";
import type { CartItem } from "@/contexts/CartContext";

const TERRACOTTA = "#d31400";

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

function getDiscountRate(original: number, sale: number): number {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

function groupByBrand(items: CartItem[]): Record<string, CartItem[]> {
  return items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.brandName || "기타";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function CartPage() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();

  // 체크박스 선택 상태 (id set) - 초기에 전체 선택
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(items.map((i) => i.id))
  );

  const grouped = useMemo(() => groupByBrand(items), [items]);
  const brandKeys = Object.keys(grouped);

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  // 주문 금액 계산
  const subtotal = selectedItems.reduce((s, i) => s + i.salePrice * i.quantity, 0);
  const originalTotal = selectedItems.reduce((s, i) => s + i.originalPrice * i.quantity, 0);
  const discount = originalTotal - subtotal;
  const FREE_SHIPPING_THRESHOLD = 50000;
  const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 3000 : 0;
  const totalPayment = subtotal + shippingFee;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) {
      toast.error("삭제할 항목을 선택해주세요");
      return;
    }
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds(new Set());
    toast.success("선택한 상품을 삭제했습니다");
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      updateQuantity(id, newQty);
    }
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("상품을 삭제했습니다");
  };

  const handleCheckout = () => {
    if (selectedIds.size === 0) {
      toast.error("구매할 상품을 선택해주세요");
      return;
    }
    toast.info("결제 기능은 준비 중입니다", {
      description: "곧 이용하실 수 있습니다",
    });
  };

  // ── 빈 장바구니 ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 max-w-lg mx-auto">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center h-14 px-4 gap-3">
            <button
              onClick={() => navigate(-1 as unknown as string)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
            <h1 className="text-[17px] font-bold text-gray-900">장바구니</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <ShoppingCart size={32} className="text-gray-300" />
          </div>
          <p className="text-[16px] font-bold text-gray-700 mb-2">장바구니가 비어있어요</p>
          <p className="text-[13px] text-gray-400 mb-8 leading-relaxed">
            스타일링 서비스에서 추천받은 제품을<br />장바구니에 담아보세요
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-2xl text-white text-[14px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: TERRACOTTA }}
          >
            쇼핑 계속하기
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-52 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => navigate(-1 as unknown as string)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="flex-1 text-[17px] font-bold text-gray-900">
            장바구니
            <span className="ml-1.5 text-[14px] font-normal text-gray-400">{totalItems}</span>
          </h1>
          <button
            onClick={() => {
              clearCart();
              setSelectedIds(new Set());
              toast.success("장바구니를 비웠습니다");
            }}
            className="text-[12px] text-gray-400 hover:text-red-500 transition-colors"
          >
            전체 삭제
          </button>
        </div>
      </header>

      {/* 전체 선택 바 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={toggleAll} className="flex items-center gap-2.5">
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              allSelected ? "border-transparent" : "border-gray-300 bg-white"
            }`}
            style={allSelected ? { background: TERRACOTTA, borderColor: TERRACOTTA } : {}}
          >
            {allSelected && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-[14px] font-semibold text-gray-700">
            전체 선택 ({selectedIds.size}/{items.length})
          </span>
        </button>
        <button
          onClick={deleteSelected}
          className="text-[12px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 size={13} />
          선택 삭제
        </button>
      </div>

      {/* 브랜드별 그룹 */}
      <div className="space-y-2 mt-2">
        {brandKeys.map((brand) => (
          <div key={brand} className="bg-white">
            {/* 브랜드 헤더 */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <Package size={13} className="text-gray-400" />
              <span className="text-[13px] font-bold text-gray-700">{brand}</span>
            </div>

            {/* 제품 목록 */}
            {grouped[brand].map((item) => {
              const isSelected = selectedIds.has(item.id);
              const discountRate = getDiscountRate(item.originalPrice, item.salePrice);

              return (
                <div
                  key={item.id}
                  className={`px-4 py-4 border-b border-gray-50 transition-colors ${
                    isSelected ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* 체크박스 */}
                    <button onClick={() => toggleItem(item.id)} className="mt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-transparent" : "border-gray-300 bg-white"
                        }`}
                        style={isSelected ? { background: TERRACOTTA, borderColor: TERRACOTTA } : {}}
                      >
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>

                    {/* 제품 이미지 */}
                    <div className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={22} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* 제품 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-400">{item.brandName}</p>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight mt-0.5 line-clamp-2">
                            {item.productName}
                          </p>
                          {item.source === "package" && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-orange-50 text-[10px] font-semibold text-orange-600">
                              <Package size={9} />
                              스타일링 패키지
                            </span>
                          )}
                        </div>
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                        >
                          <Trash2 size={13} className="text-gray-400" />
                        </button>
                      </div>

                      {/* 가격 */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {discountRate > 0 && (
                          <span className="text-[12px] font-bold" style={{ color: TERRACOTTA }}>
                            {discountRate}%
                          </span>
                        )}
                        <span className="text-[15px] font-bold text-gray-900">
                          ₩{formatPrice(item.salePrice)}
                        </span>
                        {discountRate > 0 && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₩{formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* 수량 조절 */}
                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={13} className="text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-[14px] font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={13} className="text-gray-600" />
                          </button>
                        </div>
                        <span className="text-[13px] font-bold text-gray-700">
                          ₩{formatPrice(item.salePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 무료배송 프로그레스바 */}
      <div className="mx-4 mt-3">
        {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-[12px] text-blue-700 font-semibold mb-2">
              ₩{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} 더 담으면 무료배송!
            </p>
            <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        ) : subtotal >= FREE_SHIPPING_THRESHOLD ? (
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
            <p className="text-[12px] text-green-700 font-semibold flex items-center gap-1.5">
              <Check size={13} strokeWidth={3} />
              무료배송 조건 달성!
            </p>
          </div>
        ) : null}
      </div>

      {/* 주문 금액 요약 */}
      <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 p-4 space-y-3">
        <p className="text-[14px] font-bold text-gray-900">주문 금액</p>
        <div className="space-y-2.5">
          <div className="flex justify-between">
            <span className="text-[13px] text-gray-500">상품 금액</span>
            <span className="text-[13px] font-semibold text-gray-900">
              ₩{formatPrice(originalTotal)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-[13px] text-gray-500">할인 금액</span>
              <span className="text-[13px] font-semibold" style={{ color: TERRACOTTA }}>
                -₩{formatPrice(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[13px] text-gray-500">배송비</span>
            <span className="text-[13px] font-semibold text-gray-900">
              {shippingFee === 0 ? (
                <span className="text-green-600">무료</span>
              ) : (
                `₩${formatPrice(shippingFee)}`
              )}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-[14px] font-bold text-gray-900">결제 예정 금액</span>
            <span className="text-[18px] font-bold" style={{ color: TERRACOTTA }}>
              ₩{formatPrice(totalPayment)}
            </span>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <p className="text-center text-[12px] text-gray-400 mt-3">
          {selectedIds.size}개 상품 선택됨
        </p>
      )}

      {/* 하단 고정 구매 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 z-50 max-w-lg mx-auto bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleCheckout}
          disabled={selectedIds.size === 0}
          className={`w-full py-4 rounded-2xl text-white text-[16px] font-bold flex items-center justify-center gap-2 transition-all ${
            selectedIds.size === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "hover:opacity-90 active:scale-[0.98]"
          }`}
          style={selectedIds.size > 0 ? { background: TERRACOTTA } : {}}
        >
          <ShoppingCart size={18} />
          {selectedIds.size > 0
            ? `${selectedIds.size}개 구매하기 · ₩${formatPrice(totalPayment)}`
            : "상품을 선택해주세요"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
