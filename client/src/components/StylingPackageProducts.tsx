/**
 * 스타일링 패키지 제품 목록 컴포넌트
 * - Supabase styling_packages + styling_package_items 데이터를 표시
 * - 디자이너가 선정한 제품들을 카드 형태로 보여줌
 * - 외부 구매 링크 또는 장바구니 담기 기능 제공
 */
import { useState, useMemo } from "react";
import {
  Package, ShoppingCart, ExternalLink, ChevronDown, ChevronUp,
  Loader2, Tag, Layers, Info
} from "lucide-react";
import { toast } from "sonner";

const TERRACOTTA = "#d31400";

export interface PackageItem {
  id: string;
  packageId: string;
  productId: string;
  productName: string;
  brandName: string;
  mainCategory: string | null;
  subCategory: string | null;
  salePrice: number;
  originalPrice: number;
  imageUrl: string | null;
  quantity: number;
  memo: string | null;
  sortOrder: number;
}

export interface StylingPackageData {
  id: string;
  surveyId: string;
  surveyName: string;
  packageName: string;
  stylingType: string;
  designerName: string | null;
  memo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: PackageItem[];
}

interface StylingPackageProductsProps {
  packages: StylingPackageData[];
  isLoading: boolean;
  onAddToCart?: (item: PackageItem) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

function getDiscountRate(original: number, sale: number): number {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export default function StylingPackageProducts({
  packages,
  isLoading,
  onAddToCart,
}: StylingPackageProductsProps) {
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(
    new Set(packages.map((p) => p.id))
  );

  // 패키지가 로드되면 모두 펼침
  useMemo(() => {
    if (packages.length > 0) {
      setExpandedPackages(new Set(packages.map((p) => p.id)));
    }
  }, [packages]);

  const togglePackage = (pkgId: string) => {
    setExpandedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-gray-400" />
        <p className="text-sm text-gray-400">패키지 제품을 불러오는 중...</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-6 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Package size={20} className="text-gray-400" />
        </div>
        <p className="text-[13px] font-medium text-gray-500">
          아직 패키지가 준비되지 않았어요
        </p>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          담당 디자이너가 제품을 선정하면
          <br />
          여기에서 확인할 수 있어요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => {
        const isExpanded = expandedPackages.has(pkg.id);
        const totalItems = pkg.items.length;
        const totalPrice = pkg.items.reduce(
          (sum, item) => sum + item.salePrice * item.quantity,
          0
        );
        const totalOriginalPrice = pkg.items.reduce(
          (sum, item) => sum + item.originalPrice * item.quantity,
          0
        );
        const totalDiscount = totalOriginalPrice - totalPrice;

        return (
          <div
            key={pkg.id}
            className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
          >
            {/* 패키지 헤더 */}
            <button
              onClick={() => togglePackage(pkg.id)}
              className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: TERRACOTTA }}
              >
                <Layers size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {pkg.packageName || "스타일링 패키지"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {pkg.designerName && `${pkg.designerName} · `}
                  {totalItems}개 제품
                  {totalPrice > 0 && ` · 총 ₩${formatPrice(totalPrice)}`}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp size={18} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronDown size={18} className="text-gray-400 shrink-0" />
              )}
            </button>

            {/* 패키지 메모 */}
            {isExpanded && pkg.memo && (
              <div className="mx-4 mb-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-[11px] text-blue-600 flex items-center gap-1 mb-1 font-semibold">
                  <Info size={11} /> 디자이너 메모
                </p>
                <p className="text-[12px] text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {pkg.memo}
                </p>
              </div>
            )}

            {/* 제품 리스트 */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {pkg.items.map((item) => {
                  const discount = getDiscountRate(
                    item.originalPrice,
                    item.salePrice
                  );

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden"
                    >
                      <div className="flex gap-3 p-3">
                        {/* 제품 이미지 */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* 제품 정보 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-400 mb-0.5">
                            {item.brandName}
                          </p>
                          <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight">
                            {item.productName}
                          </p>

                          {/* 카테고리 태그 */}
                          {(item.mainCategory || item.subCategory) && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Tag size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">
                                {[item.mainCategory, item.subCategory]
                                  .filter(Boolean)
                                  .join(" > ")}
                              </span>
                            </div>
                          )}

                          {/* 가격 */}
                          <div className="flex items-center gap-2 mt-1.5">
                            {discount > 0 && (
                              <span
                                className="text-[12px] font-bold"
                                style={{ color: TERRACOTTA }}
                              >
                                {discount}%
                              </span>
                            )}
                            <span className="text-[13px] font-bold text-gray-900">
                              ₩{formatPrice(item.salePrice)}
                            </span>
                            {discount > 0 && (
                              <span className="text-[11px] text-gray-400 line-through">
                                ₩{formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* 수량 */}
                          {item.quantity > 1 && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              수량: {item.quantity}개
                            </p>
                          )}

                          {/* 메모 */}
                          {item.memo && (
                            <p className="text-[11px] text-gray-400 mt-1 italic">
                              {item.memo}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 하단 액션 버튼 */}
                      {onAddToCart && (
                        <div className="px-3 pb-3">
                          <button
                            onClick={() => {
                              onAddToCart(item);
                              toast.success(
                                `${item.productName}을(를) 장바구니에 추가했습니다.`
                              );
                            }}
                            className="w-full py-2.5 rounded-lg text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
                            style={{ background: TERRACOTTA }}
                          >
                            <ShoppingCart size={13} />
                            장바구니 담기
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 패키지 합계 */}
                {totalPrice > 0 && (
                  <div className="rounded-xl bg-gray-900 p-4 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-gray-400">
                        패키지 합계 ({totalItems}개 제품)
                      </span>
                      {totalDiscount > 0 && (
                        <span className="text-[11px] text-gray-500 line-through">
                          ₩{formatPrice(totalOriginalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold">총 금액</span>
                      <span className="text-[18px] font-bold">
                        ₩{formatPrice(totalPrice)}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <p
                        className="text-[11px] mt-1 text-right font-semibold"
                        style={{ color: "#ff6b5a" }}
                      >
                        총 ₩{formatPrice(totalDiscount)} 할인
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
