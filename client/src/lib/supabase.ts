import { createClient } from "@supabase/supabase-js";

// soozip 단일 프로젝트로 통합 - Survey Supabase 사용 (2026-03-19)
// 기존 일반 Supabase(rrtbkrewrgqobyjhkolw)는 삭제됨 → VITE_SURVEY_SUPABASE_URL 우선 사용
const SUPABASE_URL =
  import.meta.env.VITE_SURVEY_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  "https://lrozgykdsydvoppqnjdl.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SURVEY_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyb3pneWtkc3lkdm9wcHFuamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDc0MjgsImV4cCI6MjA4NzkyMzQyOH0.tW0xv9j5R1jnsgkGC5VxZvry8j4VGg-BUR13SCOu01I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── 타입 정의 ─── */

export interface Product {
  id: string;
  brand_name: string;
  product_name: string;
  main_category: string;
  sub_category: string;
  original_price: number;
  sale_price: number;
  discount_rate: number;
  status: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_type: "main" | "sub";
  image_url: string;
  sort_order: number;
}

export interface ProductDetailPage {
  id: string;
  product_id: string;
  detail_type: string;
  html_content: string;
}

export interface ProductDetailImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface ProductWithImage extends Product {
  main_image_url?: string;
}

/* ─── 쿼리 함수 ─── */

/** status='approved'인 상품 목록 + 대표 이미지 조회 */
export async function fetchApprovedProducts(): Promise<ProductWithImage[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved")
    .order("id", { ascending: false });

  if (error) {
    console.error("fetchApprovedProducts error:", error);
    return [];
  }

  if (!products || products.length === 0) return [];

  // 각 상품의 main 이미지 조회
  const productIds = products.map((p: Product) => p.id);
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url, image_type, sort_order")
    .in("product_id", productIds)
    .eq("image_type", "main")
    .order("sort_order", { ascending: true });

  // product_id → main image_url 매핑
  const imageMap: Record<string, string> = {};
  if (images) {
    for (const img of images as ProductImage[]) {
      if (!imageMap[img.product_id]) {
        imageMap[img.product_id] = img.image_url;
      }
    }
  }

  return products.map((p: Product) => ({
    ...p,
    main_image_url: imageMap[p.id] ?? undefined,
  }));
}

/** 단일 상품 상세 조회 (이미지 + 상세페이지 포함) */
export async function fetchProductDetail(productId: string) {
  const [
    { data: product },
    { data: images },
    { data: detailPages },
    { data: detailImages },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).single(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_detail_page")
      .select("*")
      .eq("product_id", productId),
    supabase
      .from("product_detail_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    product: product as Product | null,
    images: (images as ProductImage[]) ?? [],
    detailPages: (detailPages as ProductDetailPage[]) ?? [],
    detailImages: (detailImages as ProductDetailImage[]) ?? [],
  };
}

/** 카테고리별 상품 조회 */
export async function fetchProductsByCategory(
  mainCategory?: string
): Promise<ProductWithImage[]> {
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "approved")
    .order("id", { ascending: false });

  if (mainCategory && mainCategory !== "전체") {
    query = query.eq("main_category", mainCategory);
  }

  const { data: products, error } = await query;
  if (error || !products) return [];

  const productIds = products.map((p: Product) => p.id);
  if (productIds.length === 0) return [];

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url, image_type, sort_order")
    .in("product_id", productIds)
    .eq("image_type", "main")
    .order("sort_order", { ascending: true });

  const imageMap: Record<string, string> = {};
  if (images) {
    for (const img of images as ProductImage[]) {
      if (!imageMap[img.product_id]) {
        imageMap[img.product_id] = img.image_url;
      }
    }
  }

  return products.map((p: Product) => ({
    ...p,
    main_image_url: imageMap[p.id] ?? undefined,
  }));
}
