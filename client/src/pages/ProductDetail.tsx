/* SOOZIP Design: Japandi Minimalism - Product Detail Page */
import { ArrowLeft, Heart, Share2, ShoppingCart, Package } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const product = {
    id: productId,
    name: `라이프스타일 샘플상품 ${productId}`,
    brand: "SOOZIP 브랜드",
    category: "라이프스타일",
    price: "₩10,000",
    originalPrice: "₩11,111",
    discount: "10%",
    description: "자연 소재로 만든 라이프스타일 제품입니다. 따뜻하고 편안한 인테리어를 위한 아이템으로, 내추럴한 텍스처와 중성적인 색상으로 어떤 공간에도 잘 어울립니다.",
    details: ["소재: 천연 면 100%", "사이즈: 50x50cm", "색상: 아이보리, 베이지, 그레이", "세탁: 손세탁 권장"],
  };

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/products")} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-sm">상품 상세</span>
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Product Image */}
        <div className="w-full aspect-square bg-secondary flex items-center justify-center">
          <Package size={80} className="text-muted-foreground" strokeWidth={1} />
        </div>

        {/* Product Info */}
        <div className="px-4 py-5 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</p>
          <h1 className="text-lg font-bold text-foreground mb-3">{product.name}</h1>
          <div className="flex items-center gap-3">
            <span className="text-primary font-semibold text-sm">{product.discount} 할인</span>
            <span className="text-xl font-bold text-foreground">{product.price}</span>
            <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-5 border-b border-border">
          <h2 className="heading-text text-foreground mb-3">상품 설명</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Details */}
        <div className="px-4 py-5 border-b border-border">
          <h2 className="heading-text text-foreground mb-3">상품 정보</h2>
          <ul className="space-y-2">
            {product.details.map((detail, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">·</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-14 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-background border-t border-border flex gap-3">
        <button
          onClick={() => toast.success("장바구니에 담겼습니다.")}
          className="flex items-center justify-center gap-2 flex-1 border border-border text-foreground py-3 rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
        >
          <ShoppingCart size={18} />
          장바구니
        </button>
        <button
          onClick={() => toast.success("구매 기능이 준비 중입니다.")}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
        >
          바로 구매
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
