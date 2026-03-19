/* SOOZIP Design: Japandi Minimalism - Cart Page */
import { ArrowLeft, ShoppingCart, Package, Trash2, Minus, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";

const TERRACOTTA = "#d31400";

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

export default function CartPage() {
  const [, navigate] = useLocation();
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 max-w-lg mx-auto">
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1 as unknown as string)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-sm">장바구니</span>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingCart size={64} className="text-muted-foreground mb-4" strokeWidth={1} />
          <p className="font-semibold text-foreground mb-2">장바구니가 비어있습니다</p>
          <p className="text-sm text-muted-foreground mb-6 text-center">마음에 드는 상품을 장바구니에 담아보세요</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
          >
            쇼핑 계속하기
          </button>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44 max-w-lg mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1 as unknown as string)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <span className="font-bold text-[15px] text-gray-900">장바구니</span>
          <span className="text-[12px] text-gray-400 ml-1">{cart.totalItems}개</span>
          <div className="flex-1" />
          <button
            onClick={() => {
              cart.clearCart();
              toast.success("장바구니를 비웠습니다.");
            }}
            className="text-[12px] text-gray-400 hover:text-red-500 transition-colors"
          >
            전체 삭제
          </button>
        </div>
      </header>

      {/* 제품 목록 */}
      <div className="px-4 pt-4 space-y-3">
        {cart.items.map((item) => {
          const discount = item.originalPrice > item.salePrice
            ? Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100)
            : 0;

          return (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex gap-3 p-3">
                {/* 이미지 */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
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
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-400">{item.brandName}</p>
                      <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight mt-0.5">
                        {item.productName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        cart.removeItem(item.id);
                        toast.success("제품을 삭제했습니다.");
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {/* 가격 */}
                  <div className="flex items-center gap-2 mt-2">
                    {discount > 0 && (
                      <span className="text-[12px] font-bold" style={{ color: TERRACOTTA }}>
                        {discount}%
                      </span>
                    )}
                    <span className="text-[14px] font-bold text-gray-900">
                      ₩{formatPrice(item.salePrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ₩{formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* 수량 조절 */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={12} className="text-gray-600" />
                    </button>
                    <span className="text-[13px] font-bold text-gray-900 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={12} className="text-gray-600" />
                    </button>
                    <span className="text-[12px] text-gray-400 ml-auto">
                      ₩{formatPrice(item.salePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 패키지 출처 표시 */}
              {item.source === "package" && (
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50">
                    <Package size={11} style={{ color: TERRACOTTA }} />
                    <span className="text-[10px] font-semibold" style={{ color: TERRACOTTA }}>
                      스타일링 패키지 제품
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 고정 - 결제 요약 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 max-w-lg mx-auto z-50">
        {/* 가격 요약 */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400">상품 금액</span>
            <span className="text-[13px] text-gray-600">₩{formatPrice(cart.totalOriginalPrice)}</span>
          </div>
          {cart.totalDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-400">할인 금액</span>
              <span className="text-[13px] font-bold" style={{ color: TERRACOTTA }}>
                -₩{formatPrice(cart.totalDiscount)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
            <span className="text-[13px] font-bold text-gray-900">총 결제 금액</span>
            <span className="text-[18px] font-bold" style={{ color: TERRACOTTA }}>
              ₩{formatPrice(cart.totalPrice)}
            </span>
          </div>
        </div>

        {/* 구매 버튼 */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              toast.info("결제 기능은 준비 중입니다.");
            }}
            className="w-full py-3.5 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            style={{ background: TERRACOTTA }}
          >
            <ShoppingCart size={16} />
            {cart.totalItems}개 제품 구매하기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
