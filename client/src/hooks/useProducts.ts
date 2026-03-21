import { useState, useEffect } from "react";
import {
  fetchApprovedProducts,
  fetchProductDetail,
  fetchProductsByCategory,
  type ProductWithImage,
} from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

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

/** 여러 상품 ID로 상품 목록 조회 훅 (찜 목록용) */
export function useProductsByIds(productIds: number[]) {
  const [products, setProducts] = useState<(ProductWithImage & { imageUrl?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const idStrings = productIds.map(String);
    const fetchData = async () => {
      try {
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .in("id", idStrings);
        if (cancelled || !prods) { setLoading(false); return; }
        // 대표 이미지 조회
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url, image_type, sort_order")
          .in("product_id", idStrings)
          .eq("image_type", "main")
          .order("sort_order", { ascending: true });
        const imageMap: Record<string, string> = {};
        (images ?? []).forEach((img: { product_id: string; image_url: string }) => {
          if (!imageMap[img.product_id]) imageMap[img.product_id] = img.image_url;
        });
        if (!cancelled) {
          setProducts(prods.map((p: ProductWithImage) => ({ ...p, imageUrl: imageMap[p.id] })));
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [productIds.join(",")]);

  return { products, loading };
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
