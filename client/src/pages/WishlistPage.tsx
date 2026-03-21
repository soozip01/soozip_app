/**
 * WishlistPage — 찜(스크랩) 목록 페이지
 * 마이페이지 쇼핑 탭 > 상품 찜 리스트
 */
import { useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Trash2, Package, ImageOff, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProductsByIds } from "@/hooks/useProducts";

const ACCENT = "#E84B1A";

function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || src.startsWith("blob:") || failed) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-muted-foreground ${className ?? ""}`}>
        <ImageOff size={24} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} draggable={false} />
  );
}

export default function WishlistPage() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const { addItem } = useCart();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.wishlist.list.useQuery(
    { userId: user?.id ?? 0 },
    { enabled: isLoggedIn && !!user?.id }
  );

  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate({ userId: user?.id ?? 0 });
      toast.success("찜 목록에서 제거되었습니다.");
    },
  });

  const wishlistItems = data?.items ?? [];
  const productIds = wishlistItems.map((w) => w.productId); // number[]

  // Supabase에서 상품 정보 가져오기
  const { products, loading: productsLoading } = useProductsByIds(productIds);

  const handleRemove = (productId: number) => {
    if (!user?.id) return;
    removeMutation.mutate({ productId, userId: user.id });
  };

  const handleAddToCart = (product: {
    id: number;
    product_name: string;
    brand_name: string;
    sale_price: number;
    original_price: number;
    main_category?: string | null;
    sub_category?: string | null;
    imageUrl?: string | null;
  }) => {
    addItem({
      id: String(product.id),
      productId: String(product.id),
      productName: product.product_name,
      brandName: product.brand_name,
      mainCategory: product.main_category ?? null,
      subCategory: product.sub_category ?? null,
      salePrice: product.sale_price,
      originalPrice: product.original_price,
      imageUrl: product.imageUrl ?? null,
      memo: null,
      source: "product",
      quantity: 1,
    });
    toast.success("장바구니에 담겼습니다.");
  };

  // 비로그인 상태
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto flex flex-col">
        <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">찜 목록</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <Heart size={52} className="text-muted-foreground mb-4" strokeWidth={1} />
          <p className="text-sm font-medium text-foreground mb-1">로그인 후 이용해 주세요</p>
          <p className="text-xs text-muted-foreground mb-5">찜한 상품을 저장하고 관리할 수 있어요</p>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: ACCENT }}
          >
            <LogIn size={16} />
            로그인 / 회원가입
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const loading = isLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-sm">찜 목록</span>
        {wishlistItems.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{wishlistItems.length}개</span>
        )}
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-3 border border-border rounded-xl animate-pulse">
                <div className="w-20 h-20 bg-secondary rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-secondary rounded w-16" />
                  <div className="h-4 bg-secondary rounded w-36" />
                  <div className="h-5 bg-secondary rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart size={52} className="text-muted-foreground mb-4" strokeWidth={1} />
            <p className="text-sm font-medium text-foreground mb-1">찜한 상품이 없습니다</p>
            <p className="text-xs text-muted-foreground mb-5">마음에 드는 상품을 찜해보세요</p>
            <button
              onClick={() => navigate("/products")}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              상품 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map((item) => {
              const product = products.find((p) => String(p.id) === String(item.productId));
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 border border-border rounded-xl hover:border-border/80 transition-colors"
                >
                  {/* 상품 이미지 */}
                  <button
                    onClick={() => navigate(`/products/${item.productId}`)}
                    className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-secondary"
                  >
                    <ProductImage
                      src={product?.imageUrl ?? ""}
                      alt={product?.product_name ?? "상품"}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="text-left w-full"
                    >
                      {product ? (
                        <>
                          <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{product.brand_name}</p>
                          <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2 mb-1.5">
                            {product.product_name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {product.discount_rate > 0 && (
                              <span className="text-xs font-bold" style={{ color: ACCENT }}>
                                {product.discount_rate}%
                              </span>
                            )}
                            <span className="text-sm font-bold text-foreground">
                              {product.sale_price.toLocaleString()}원
                            </span>
                            {product.discount_rate > 0 && (
                              <span className="text-[11px] text-muted-foreground line-through">
                                {product.original_price.toLocaleString()}원
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="h-3 bg-secondary rounded w-16 animate-pulse" />
                          <div className="h-4 bg-secondary rounded w-32 animate-pulse" />
                          <div className="h-4 bg-secondary rounded w-20 animate-pulse" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                      aria-label="찜 해제"
                    >
                      <Trash2 size={15} />
                    </button>
                    {product && (
                      <button
                        onClick={() => handleAddToCart({ ...product, id: Number(product.id), imageUrl: product.imageUrl })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                        aria-label="장바구니 담기"
                      >
                        <ShoppingCart size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
