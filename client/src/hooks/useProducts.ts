import { useState, useEffect } from "react";
import {
  fetchApprovedProducts,
  fetchProductDetail,
  fetchProductsByCategory,
  type ProductWithImage,
} from "@/lib/supabase";

/** 승인된 전체 상품 목록 훅 */
export function useApprovedProducts() {
  const [products, setProducts] = useState<ProductWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchApprovedProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? "데이터를 불러오지 못했습니다.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

/** 카테고리별 상품 목록 훅 */
export function useProductsByCategory(category?: string) {
  const [products, setProducts] = useState<ProductWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductsByCategory(category)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? "데이터를 불러오지 못했습니다.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { products, loading, error };
}

/** 단일 상품 상세 훅 */
export function useProductDetail(productId: string | null) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchProductDetail>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    fetchProductDetail(productId)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? "상품 정보를 불러오지 못했습니다.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { data, loading, error };
}
