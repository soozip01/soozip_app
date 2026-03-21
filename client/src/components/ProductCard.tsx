/**
 * ProductCard — 재사용 가능한 상품 카드 컴포넌트
 * - 찜(하트) 버튼 포함
 * - 로그인 여부에 따라 찜 상태 조회 및 토글
 * - Home, ProductList, WishlistPage 등에서 공통 사용
 */
import { useState, useEffect } from "react";
import { Heart, Package } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";

const ACCENT = "#E84B1A";

interface ProductCardProps {
  id: string | number;
  productName: string;
  brandName?: string;
  category?: string;
  salePrice: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl?: string | null;
  onClick?: () => void;
  /** 카드 너비 고정 (Home 가로 스크롤용) */
  fixedWidth?: number;
  /** 이미지 높이 고정 (Home 가로 스크롤용) */
  fixedImageSize?: number;
  /** 텍스트 크기 작게 (Home 가로 스크롤용) */
  compact?: boolean;
}

export default function ProductCard({
  id,
  productName,
  brandName,
  category,
  salePrice,
  originalPrice,
  discountRate = 0,
  imageUrl,
  onClick,
  fixedWidth,
  fixedImageSize,
  compact = false,
}: ProductCardProps) {
  const { user, isLoggedIn } = useSoozipAuth();
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: wishlistData } = trpc.wishlist.check.useQuery(
    { productId: numericId, userId: user?.id ?? 0 },
    { enabled: isLoggedIn && !!user?.id && !isNaN(numericId) }
  );

  const wishlistToggle = trpc.wishlist.toggle.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (wishlistData !== undefined) {
      setIsWishlisted(wishlistData.wishlisted);
    }
  }, [wishlistData]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn || !user?.id) {
      toast.error("로그인 후 찜하기가 가능합니다.");
      return;
    }
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    try {
      await wishlistToggle.mutateAsync({ productId: numericId, userId: user.id });
      utils.wishlist.list.invalidate({ userId: user.id });
      if (newState) toast.success("찜 목록에 추가되었습니다.");
      else toast.success("찜 목록에서 제거되었습니다.");
    } catch {
      setIsWishlisted(!newState);
      toast.error("잠시 후 다시 시도해주세요.");
    }
  };

  const cardStyle = fixedWidth ? { width: `${fixedWidth}px`, flexShrink: 0 } : undefined;
  const imageStyle = fixedImageSize
    ? { width: `${fixedImageSize}px`, height: `${fixedImageSize}px` }
    : undefined;

  return (
    <div
      className="cursor-pointer group relative"
      style={cardStyle}
      onClick={onClick}
    >
      {/* 상품 이미지 */}
      <div
        className={`relative bg-secondary flex items-center justify-center overflow-hidden ${
          fixedImageSize ? "" : "aspect-square rounded-xl"
        } group-hover:opacity-90 transition-opacity`}
        style={imageStyle}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package
            size={compact ? 24 : 40}
            className="text-muted-foreground"
            strokeWidth={1}
          />
        )}

        {/* 찜 버튼 - 이미지 우하단 */}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label="찜하기"
        >
          <Heart
            size={14}
            fill={isWishlisted ? ACCENT : "none"}
            stroke={isWishlisted ? ACCENT : "#888"}
            className="transition-all"
          />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className={fixedImageSize ? "p-2" : "mt-2"}>
        {(brandName || category) && (
          <p className={`text-muted-foreground leading-none ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {brandName}
            {category ? ` · ${category}` : ""}
          </p>
        )}
        <p
          className={`font-medium text-foreground leading-tight mt-0.5 line-clamp-2 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {productName}
        </p>
        <div className={`flex items-center gap-1 mt-1`}>
          {discountRate > 0 && (
            <span
              className={`font-semibold ${compact ? "text-[10px]" : "text-[11px]"}`}
              style={{ color: ACCENT }}
            >
              {discountRate}%
            </span>
          )}
          <span className={`font-bold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
            {salePrice.toLocaleString()}원
          </span>
        </div>
        {discountRate > 0 && originalPrice && (
          <p className={`text-muted-foreground line-through ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {originalPrice.toLocaleString()}원
          </p>
        )}
      </div>
    </div>
  );
}
