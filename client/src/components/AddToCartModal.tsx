/**
 * 장바구니 담기 모달
 * 1단계: 수량 선택 (옵션 선택 필수 UX)
 * 2단계: 담기 완료 후 "계속 쇼핑 / 장바구니 보기" 선택
 */
import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, Package, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import type { CartItem } from "@/contexts/CartContext";

const TERRACOTTA = "#d31400";

interface ProductForCart {
  id: string;
  productName: string;
  brandName: string;
  mainCategory?: string | null;
  subCategory?: string | null;
  salePrice: number;
  originalPrice: number;
  imageUrl?: string | null;
  memo?: string | null;
  source?: "package" | "product";
  packageId?: string;
}

interface AddToCartModalProps {
  product: ProductForCart | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

export default function AddToCartModal({ product, isOpen, onClose }: AddToCartModalProps) {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"select" | "added">("select");

  // 모달 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setStep("select");
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const discount = product.originalPrice > product.salePrice
    ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const cartItem: Omit<CartItem, "quantity"> & { quantity: number } = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.productName,
      brandName: product.brandName,
      mainCategory: product.mainCategory ?? null,
      subCategory: product.subCategory ?? null,
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl ?? null,
      quantity,
      memo: product.memo ?? null,
      source: product.source ?? "product",
      packageId: product.packageId,
    };
    addItem(cartItem);
    setStep("added");
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* 닫기 버튼 */}
          <div className="flex items-center justify-between px-5 pt-2 pb-3">
            <span className="text-[15px] font-bold text-gray-900">
              {step === "select" ? "장바구니 담기" : "장바구니에 담았어요!"}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>

          {step === "select" ? (
            /* ── 1단계: 수량 선택 ── */
            <div className="px-5 pb-6">
              {/* 제품 정보 */}
              <div className="flex gap-3 mb-5 p-3 rounded-2xl bg-gray-50">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-400">{product.brandName}</p>
                  <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight mt-0.5">
                    {product.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {discount > 0 && (
                      <span className="text-[12px] font-bold" style={{ color: TERRACOTTA }}>{discount}%</span>
                    )}
                    <span className="text-[14px] font-bold text-gray-900">
                      ₩{formatPrice(product.salePrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ₩{formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 수량 선택 */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-semibold text-gray-700">수량</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} className={quantity <= 1 ? "text-gray-300" : "text-gray-700"} />
                  </button>
                  <span className="text-[16px] font-bold text-gray-900 min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    <Plus size={14} className="text-gray-700" />
                  </button>
                </div>
              </div>

              {/* 합계 */}
              <div className="flex items-center justify-between mb-5 py-3 border-t border-gray-100">
                <span className="text-[13px] text-gray-500">합계</span>
                <span className="text-[18px] font-bold text-gray-900">
                  ₩{formatPrice(product.salePrice * quantity)}
                </span>
              </div>

              {/* 담기 버튼 */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
                style={{ background: TERRACOTTA }}
              >
                <ShoppingCart size={18} />
                장바구니에 담기
              </button>
            </div>
          ) : (
            /* ── 2단계: 담기 완료 ── */
            <div className="px-5 pb-8">
              {/* 완료 아이콘 */}
              <div className="flex flex-col items-center py-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: TERRACOTTA }}
                >
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] font-bold text-gray-900 mb-1">
                  장바구니에 담았어요
                </p>
                <p className="text-[12px] text-gray-400 text-center">
                  {product.productName}
                  <br />
                  <span className="font-semibold text-gray-600">{quantity}개</span>가 담겼습니다
                </p>
              </div>

              {/* 버튼 2개 */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  계속 쇼핑
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/cart");
                  }}
                  className="flex-1 py-3.5 rounded-2xl text-white text-[14px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
                  style={{ background: TERRACOTTA }}
                >
                  <ShoppingCart size={16} />
                  장바구니 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
