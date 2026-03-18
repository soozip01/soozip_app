/**
 * 최종 시안 전달 페이지
 * - 디자이너가 업로드한 최종안 파일 표시
 * - 최종 시안에 활용된 제품 리스트 표시 (플랫폼의 실제 제품 데이터)
 * - 사용자가 제품을 장바구니에 담을 수 있음
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Download, ShoppingCart, Heart, Star, AlertCircle,
  Loader2, FileImage, Package
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const TERRACOTTA = "#d31400";

interface Product {
  id: string;
  brandName: string;
  productName: string;
  mainCategory: string;
  subCategory: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  mainImageUrl: string;
  rating?: number;
  reviewCount?: number;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export default function FinalStylingDelivery() {
  const [, navigate] = useLocation();
  const { user } = useSoozipAuth();
  
  // 최종 시안 파일 및 제품 리스트
  const [finalFile, setFinalFile] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Map<string, CartItem>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 사용자 제출 데이터 조회
  const { data: submission, isLoading: submissionLoading } = trpc.survey.mySubmission.useQuery(
    { userId: user?.id ? String(user.id) : '' },
    { enabled: !!user?.id }
  );

  // 제품 데이터 조회 (테스트용 - 실제로는 디자이너가 선택한 제품 ID 리스트를 step 컬럼에서 가져와야 함)
  useEffect(() => {
    if (!user?.id || dataLoaded) return;

    const fetchProducts = async () => {
      try {
        // 실제 구현: step7_m 또는 별도 컬럼에서 제품 ID 리스트를 가져와 필터링
        // 현재는 테스트용으로 임의의 제품들을 표시
        const mockProducts: Product[] = [
          {
            id: "1",
            brandName: "IKEA",
            productName: "BILLY 책장",
            mainCategory: "가구",
            subCategory: "수납",
            originalPrice: 79900,
            salePrice: 59900,
            discountRate: 25,
            mainImageUrl: "https://via.placeholder.com/300x400?text=BILLY+Bookcase",
            rating: 4.5,
            reviewCount: 128,
          },
          {
            id: "2",
            brandName: "HAY",
            productName: "AAC 의자",
            mainCategory: "가구",
            subCategory: "의자",
            originalPrice: 449000,
            salePrice: 349000,
            discountRate: 22,
            mainImageUrl: "https://via.placeholder.com/300x400?text=AAC+Chair",
            rating: 4.8,
            reviewCount: 95,
          },
          {
            id: "3",
            brandName: "무인양품",
            productName: "스탠드",
            mainCategory: "조명",
            subCategory: "테이블 조명",
            originalPrice: 39900,
            salePrice: 29900,
            discountRate: 25,
            mainImageUrl: "https://via.placeholder.com/300x400?text=Stand+Lamp",
            rating: 4.3,
            reviewCount: 67,
          },
          {
            id: "4",
            brandName: "Hay",
            productName: "New Order 소파",
            mainCategory: "가구",
            subCategory: "소파",
            originalPrice: 2490000,
            salePrice: 1990000,
            discountRate: 20,
            mainImageUrl: "https://via.placeholder.com/300x400?text=New+Order+Sofa",
            rating: 4.6,
            reviewCount: 42,
          },
          {
            id: "5",
            brandName: "String",
            productName: "선반 시스템",
            mainCategory: "가구",
            subCategory: "수납",
            originalPrice: 599000,
            salePrice: 449000,
            discountRate: 25,
            mainImageUrl: "https://via.placeholder.com/300x400?text=String+Shelves",
            rating: 4.7,
            reviewCount: 156,
          },
          {
            id: "6",
            brandName: "Vitra",
            productName: "Eames Lounge Chair",
            mainCategory: "가구",
            subCategory: "의자",
            originalPrice: 4290000,
            salePrice: 3490000,
            discountRate: 19,
            mainImageUrl: "https://via.placeholder.com/300x400?text=Eames+Chair",
            rating: 4.9,
            reviewCount: 203,
          },
        ];

        setProducts(mockProducts);
        setDataLoaded(true);
      } catch (error) {
        console.error("제품 데이터 조회 실패:", error);
        toast.error("제품 데이터를 불러올 수 없습니다.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user?.id, dataLoaded]);

  // 최종 시안 파일 불러오기
  useEffect(() => {
    if (submission && submission.step7m) {
      setFinalFile(submission.step7m);
    }
  }, [submission]);

  // 장바구니에 추가
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(product.id);
      if (existing) {
        newCart.set(product.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newCart.set(product.id, { productId: product.id, quantity: 1 });
      }
      return newCart;
    });
    toast.success(`${product.productName}을(를) 장바구니에 추가했습니다.`);
  };

  // 실제 장바구니로 이동
  const handleGoToCart = () => {
    // 실제 구현: 장바구니 페이지로 이동하며 선택한 제품들을 전달
    navigate("/cart" as any);
  };

  // 최종 시안 파일 다운로드
  const handleDownloadFile = () => {
    if (finalFile) {
      const link = document.createElement("a");
      link.href = finalFile;
      link.download = "final-styling-design.pdf";
      link.click();
      toast.success("최종 시안을 다운로드했습니다.");
    }
  };

  const cartItemCount = cartItems.size;
  const totalPrice = Array.from(cartItems.values()).reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.salePrice * item.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => navigate("-1" as any)}
        className="p-1.5 hover:bg-secondary rounded-md transition-colors"
      >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">최종 시안 전달</h1>
            <p className="text-xs text-muted-foreground">디자이너가 선정한 제품으로 구성</p>
          </div>
        </div>
      </header>

      {/* 최종 시안 파일 섹션 */}
      {finalFile && (
        <div className="px-4 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <FileImage size={24} className="text-red-600 shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">최종 시안 파일</h3>
              <p className="text-sm text-muted-foreground mb-3">
                디자이너가 제작한 최종 스타일링 시안입니다. 아래의 제품들이 활용되었습니다.
              </p>
              <Button
                size="sm"
                variant="default"
                onClick={handleDownloadFile}
                className="gap-2"
                style={{ background: TERRACOTTA }}
              >
                <Download size={16} />
                최종 시안 다운로드
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 제품 리스트 섹션 */}
      <div className="px-4 py-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-1">추천 제품 ({products.length}개)</h2>
          <p className="text-sm text-muted-foreground">
            최종 시안에 활용된 제품들입니다. 마음에 드는 제품을 장바구니에 담으세요.
          </p>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={48} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground">아직 제품이 선정되지 않았습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => {
              const inCart = cartItems.has(product.id);
              const cartQuantity = cartItems.get(product.id)?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 제품 이미지 */}
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    <img
                      src={product.mainImageUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                    {product.discountRate > 0 && (
                      <div
                        className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded"
                        style={{ background: TERRACOTTA }}
                      >
                        {product.discountRate}%
                      </div>
                    )}
                    <button className="absolute top-2 left-2 p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Heart size={16} className="text-gray-400" />
                    </button>
                  </div>

                  {/* 제품 정보 */}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">{product.brandName}</p>
                    <h3 className="text-sm font-bold line-clamp-2 mb-2 min-h-8">
                      {product.productName}
                    </h3>

                    {/* 평점 */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2 text-xs">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    )}

                    {/* 가격 */}
                    <div className="mb-3">
                      {product.originalPrice > product.salePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          ₩{product.originalPrice.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-bold" style={{ color: TERRACOTTA }}>
                        ₩{product.salePrice.toLocaleString()}
                      </p>
                    </div>

                    {/* 장바구니 버튼 */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${
                        inCart
                          ? "bg-gray-100 text-foreground"
                          : "text-white"
                      }`}
                      style={{
                        background: inCart ? undefined : TERRACOTTA,
                      }}
                    >
                      <ShoppingCart size={14} />
                      {inCart ? `${cartQuantity}개` : "장바구니"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 고정 바 - 장바구니 요약 */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">총 {cartItemCount}개 상품</p>
            <p className="text-lg font-bold" style={{ color: TERRACOTTA }}>
              ₩{totalPrice.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={handleGoToCart}
            className="px-6 font-semibold"
            style={{ background: TERRACOTTA }}
          >
            장바구니 보기
          </Button>
        </div>
      )}

      {/* 장바구니가 비어있을 때 */}
      {cartItemCount === 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-border p-4">
          <p className="text-sm text-muted-foreground text-center">
            마음에 드는 제품을 장바구니에 담으세요.
          </p>
        </div>
      )}
    </div>
  );
}
