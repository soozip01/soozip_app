/**
 * 스타일링 패키지 제품 목록 컴포넌트
 * - 디자이너가 선정한 제품들을 심플하게 표시
 * - 개별 "장바구니 담기" → AddToCartModal 연동
 * - "패키지 전체 담기" 버튼 제공
 */
import { useState } from "react";
import {
  Package, ShoppingCart, Loader2, Info, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import AddToCartModal from "./AddToCartModal";
import { useCart } from "@/contexts/CartContext";

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
  productUrl?: string | null;
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
}: StylingPackageProductsProps) {
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(
    () => new Set(packages.map((p) => p.id))
  );
  const [modalProduct, setModalProduct] = useState<PackageItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingAll, setAddingAll] = useState<string | null>(null);

  const togglePackage = (pkgId: string) => {
    setExpandedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  const openModal = (item: PackageItem) => {
    setModalProduct(item);
    setIsModalOpen(true);
  };

  const handleAddAll = (pkg: StylingPackageData) => {
    setAddingAll(pkg.id);
    // 모든 제품을 기본 수량으로 한 번에 장바구니에 추가
    pkg.items.forEach((item) => {
      addItem({
        id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        productId: item.id,
        productName: item.productName,
        brandName: item.brandName,
        mainCategory: item.mainCategory,
        subCategory: item.subCategory,
        salePrice: item.salePrice,
        originalPrice: item.originalPrice,
        imageUrl: item.imageUrl,
        quantity: item.quantity || 1,
        memo: item.memo,
        source: "package",
        packageId: item.packageId,
      });
    });
    setTimeout(() => {
      setAddingAll(null);
      toast.success(`${pkg.items.length}개 제품을 모두 장바구니에 담았습니다!`, {
        description: "장바구니에서 확인하세요",
        action: {
          label: "장바구니 보기",
          onClick: () => navigate("/cart"),
        },
      });
    }, 200);
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
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Package size={20} className="text-gray-400" />
        </div>
        <p className="text-[13px] font-semibold text-gray-500">
          아직 패키지가 준비되지 않았어요
        </p>
        <p className="text-[12px] text-gray-400 leading-relaxed">
          담당 디자이너가 제품을 선정하면<br />여기에서 확인할 수 있어요
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {packages.map((pkg) => {
          const isExpanded = expandedPackages.has(pkg.id);
          const totalItems = pkg.items.length;
          const totalPrice = pkg.items.reduce(
            (sum, item) => sum + item.salePrice * item.quantity, 0
          );
          const totalOriginalPrice = pkg.items.reduce(
            (sum, item) => sum + item.originalPrice * item.quantity, 0
          );
          const totalDiscount = totalOriginalPrice - totalPrice;
          const displayName =
            pkg.packageName && pkg.packageName.trim() && pkg.packageName.trim() !== "."
              ? pkg.packageName
              : "스타일링 패키지";

          return (
            <div key={pkg.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {/* 패키지 헤더 */}
              <button
                onClick={() => togglePackage(pkg.id)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: TERRACOTTA }}
                >
                  <Package size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[14px] font-bold text-gray-900">{displayName}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {pkg.designerName && `${pkg.designerName} 디자이너 · `}
                    제품 {totalItems}개
                    {totalPrice > 0 && ` · ₩${formatPrice(totalPrice)}`}
                  </p>
                </div>
                {isExpanded
                  ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={18} className="text-gray-400 shrink-0" />
                }
              </button>

              {/* 디자이너 메모 */}
              {isExpanded && pkg.memo && pkg.memo.trim() && (
                <div className="mx-4 mb-3 rounded-xl bg-blue-50 border border-blue-100 p-3">
                  <p className="text-[11px] text-blue-600 flex items-center gap-1 mb-1 font-semibold">
                    <Info size={11} /> 디자이너 메모
                  </p>
                  <p className="text-[12px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {pkg.memo}
                  </p>
                </div>
              )}

              {/* 제품 리스트 */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {pkg.items.map((item) => {
                    const discount = getDiscountRate(item.originalPrice, item.salePrice);

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden"
                      >
                        <div className="flex gap-3 p-3">
                          {/* 제품 이미지 */}
                          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-200 shrink-0">
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

                          {/* 제품 정보 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-400">{item.brandName}</p>
                            <p className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-tight mt-0.5">
                              {item.productName}
                            </p>

                            {/* 가격 */}
                            <div className="flex items-center gap-1.5 mt-1.5">
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

                            {/* 디자이너 메모 */}
                            {item.memo && item.memo.trim() && (
                              <p className="text-[11px] text-gray-400 mt-1 italic leading-relaxed">
                                "{item.memo}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="px-3 pb-3 flex gap-2">
                          {/* 제품 링크 (있을 경우) */}
                          {item.productUrl && (
                            <a
                              href={item.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-600 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink size={12} />
                              제품 보기
                            </a>
                          )}
                          {/* 장바구니 담기 */}
                          <button
                            onClick={() => openModal(item)}
                            className="flex-1 py-2.5 rounded-xl text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity active:scale-[0.98]"
                            style={{ background: TERRACOTTA }}
                          >
                            <ShoppingCart size={13} />
                            장바구니 담기
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 패키지 합계 + 전체 담기 */}
                  {totalPrice > 0 && (
                    <div className="rounded-xl bg-gray-900 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-gray-400">
                          패키지 합계 ({totalItems}개)
                        </span>
                        {totalDiscount > 0 && (
                          <span className="text-[11px] text-gray-500 line-through">
                            ₩{formatPrice(totalOriginalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[15px] font-bold text-white">총 금액</span>
                        <div className="text-right">
                          <span className="text-[18px] font-bold text-white">
                            ₩{formatPrice(totalPrice)}
                          </span>
                          {totalDiscount > 0 && (
                            <p className="text-[11px] font-semibold" style={{ color: "#ff6b5a" }}>
                              ₩{formatPrice(totalDiscount)} 할인
                            </p>
                          )}
                        </div>
                      </div>

                        {totalItems > 1 && (
                        <button
                          onClick={() => handleAddAll(pkg)}
                          disabled={addingAll === pkg.id}
                          className="w-full py-3 rounded-xl border border-white/20 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:scale-[0.98] disabled:opacity-60"
                        >
                          {addingAll === pkg.id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              담는 중...
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={15} />
                              패키지 전체 담기 ({totalItems}개)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 안내 */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2">
          <p className="text-[12px] font-bold text-gray-600">안내사항</p>
          <div className="space-y-1.5">
            <p className="text-[11px] text-gray-500 flex items-start gap-2">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 text-white"
                style={{ background: TERRACOTTA }}
              >1</span>
              최종 시안을 꼼꼼히 검토해주세요
            </p>
            <p className="text-[11px] text-gray-500 flex items-start gap-2">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold mt-0.5 text-white"
                style={{ background: TERRACOTTA }}
              >2</span>
              원하는 제품을 장바구니에 담아 구매하세요
            </p>
          </div>
        </div>
      </div>

      {/* 장바구니 담기 모달 */}
      <AddToCartModal
        product={modalProduct ? {
          id: modalProduct.id,
          productName: modalProduct.productName,
          brandName: modalProduct.brandName,
          mainCategory: modalProduct.mainCategory,
          subCategory: modalProduct.subCategory,
          salePrice: modalProduct.salePrice,
          originalPrice: modalProduct.originalPrice,
          imageUrl: modalProduct.imageUrl,
          memo: modalProduct.memo,
          source: "package",
          packageId: modalProduct.packageId,
        } : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
