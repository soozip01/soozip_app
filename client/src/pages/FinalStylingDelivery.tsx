/**
 * 최종 시안 전달 페이지
 * - 디자이너가 업로드한 최종안 파일 표시
 * - Supabase styling_packages + styling_package_items에서 패키지 제품 데이터 조회
 * - 사용자가 제품을 확인하고 장바구니에 담아 구매할 수 있음
 */
import { useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Download, ShoppingCart,
  Loader2, FileImage, Package, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useSoozipAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import StylingPackageProducts, { type PackageItem } from "@/components/StylingPackageProducts";

const TERRACOTTA = "#d31400";

export default function FinalStylingDelivery() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn } = useSoozipAuth();
  const cart = useCart();

  // 사용자 제출 데이터 조회
  const { data: submission, isLoading: submissionLoading } = trpc.survey.mySubmission.useQuery(
    { userId: user?.id ? String(user.id) : '' },
    { enabled: !!user?.id }
  );

  // 패키지 데이터 조회
  const submissionId = submission?.id ? String(submission.id) : undefined;
  const { data: packageData, isLoading: packageLoading } = trpc.stylingPackage.getBySubmissionId.useQuery(
    { surveyId: submissionId ?? '' },
    { enabled: !!submissionId }
  );
  const stablePackages = useMemo(() => packageData ?? [], [packageData]);

  // 최종 시안 파일 파싱 (step5m 또는 step6m에서 가져옴)
  const finalFiles = useMemo(() => {
    const files: string[] = [];
    const rawStep5m = submission?.step5m;
    const rawStep6m = submission?.step6m;

    const extractFiles = (raw: string | null | undefined) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: string) => {
            if (s.startsWith('http')) files.push(s);
          });
          return;
        }
      } catch { /* not JSON */ }
      const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      lines.forEach(l => {
        if (l.startsWith('http')) files.push(l);
      });
    };

    extractFiles(rawStep5m);
    extractFiles(rawStep6m);
    return files;
  }, [submission]);

  // 장바구니 담기 핸들러
  const handleAddToCart = useCallback((item: PackageItem) => {
    cart.addItem({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      brandName: item.brandName,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      salePrice: item.salePrice,
      originalPrice: item.originalPrice,
      imageUrl: item.imageUrl,
      memo: item.memo,
      source: "package",
      packageId: item.packageId,
    });
  }, [cart]);

  const handleAddAllToCart = useCallback((items: PackageItem[]) => {
    cart.addAllPackageItems(
      items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        brandName: item.brandName,
        mainCategory: item.mainCategory,
        subCategory: item.subCategory,
        salePrice: item.salePrice,
        originalPrice: item.originalPrice,
        imageUrl: item.imageUrl,
        memo: item.memo,
        packageId: item.packageId,
      }))
    );
  }, [cart]);

  const isLoading = submissionLoading || packageLoading;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-semibold text-gray-800 mb-2">로그인이 필요합니다</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-3 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: TERRACOTTA }}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/mypage")}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <p className="text-[11px] text-gray-400 leading-none mb-0.5">FINAL</p>
            <h1 className="text-[16px] font-bold text-gray-900 leading-tight">최종 시안 전달</h1>
          </div>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: "100%", background: TERRACOTTA }}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-gray-400" />
          <p className="text-sm text-gray-400">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <div className="px-4 pt-6 space-y-6">

          {/* 안내 카드 */}
          <div className="rounded-2xl p-4 border border-gray-100" style={{ background: "#fafafa" }}>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: TERRACOTTA }}
              >
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-800 mb-1">스타일링이 완료되었습니다</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  담당 디자이너가 선정한 최종 시안과 제품 패키지를 확인해주세요.
                  아래 제품들로 공간을 완성할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 최종 시안 파일 섹션 */}
          {finalFiles.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: TERRACOTTA }}
                >
                  <FileImage size={11} className="text-white" />
                </div>
                <h2 className="text-[14px] font-bold text-gray-800">최종 시안 파일</h2>
              </div>

              <div className="space-y-3">
                {finalFiles.map((fileUrl, idx) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
                  const fileName = decodeURIComponent(
                    fileUrl.split('/').pop()?.split('?')[0] ?? `시안 파일 ${idx + 1}`
                  );

                  return (
                    <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
                      {isImage && (
                        <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ maxHeight: 240 }}>
                          <img src={fileUrl} alt={`시안 ${idx + 1}`} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                          {isImage ? (
                            <img src={fileUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileImage size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-800 truncate">{fileName}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">최종 시안 파일</p>
                        </div>
                        <a
                          href={fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[12px] font-bold transition-opacity hover:opacity-90 shrink-0"
                          style={{ background: TERRACOTTA }}
                        >
                          <Download size={13} />
                          다운로드
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 패키지 제품 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: TERRACOTTA }}
              >
                <Package size={11} className="text-white" />
              </div>
              <h2 className="text-[14px] font-bold text-gray-800">추천 제품 패키지</h2>
            </div>

            <StylingPackageProducts
              packages={stablePackages}
              isLoading={packageLoading}
              onAddToCart={handleAddToCart}
              onAddAllToCart={handleAddAllToCart}
            />
          </section>

        </div>
      )}

      {/* 하단 고정 바 - 장바구니 요약 */}
      {cart.totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 z-50 max-w-lg mx-auto">
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 mb-0.5">총 {cart.totalItems}개 제품</p>
            <p className="text-[16px] font-bold" style={{ color: TERRACOTTA }}>
              ₩{cart.totalPrice.toLocaleString("ko-KR")}
            </p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="px-6 py-3 rounded-xl text-white text-[13px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            style={{ background: TERRACOTTA }}
          >
            <ShoppingCart size={16} />
            장바구니 보기
          </button>
        </div>
      )}

      {/* 장바구니가 비어있을 때 하단 안내 */}
      {cart.totalItems === 0 && !isLoading && stablePackages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-3 z-50 max-w-lg mx-auto">
          <p className="text-[12px] text-gray-400 text-center">
            마음에 드는 제품을 장바구니에 담아보세요
          </p>
        </div>
      )}
    </div>
  );
}
