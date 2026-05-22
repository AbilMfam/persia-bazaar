import { apiFetch } from "./api-client";
import { getApiBaseUrl, getApiOrigin } from "./env";
import type { Product } from "./types";

/** بازexport کلیدهای React Query؛ نسخهٔ اصلی در `product-query-keys.ts` است. */
export { productKeys } from "./product-query-keys";

export type ApiProductDto = {
  id: number;
  title: string;
  description: string;
  category?: string | null;
  price: number;
  image_url: string | null;
  user_id: number;
  created_at?: string | null;
};

function placeholderImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#e5e7eb" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="18">بدون تصویر</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function resolveProductImageUrl(url: string | null | undefined): string {
  if (!url) return placeholderImage();
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const origin = getApiOrigin().replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

export function mapApiProductToProduct(p: ApiProductDto): Product {
  const cat = (p.category && p.category.trim()) || "general";
  return {
    id: String(p.id),
    title: p.title,
    price: p.price,
    image: resolveProductImageUrl(p.image_url),
    rating: 5,
    reviews: 0,
    seller: "فروشنده",
    sellerId: String(p.user_id),
    category: cat,
    description: p.description ?? "",
    stock: undefined,
    createdAt: p.created_at ? Date.parse(p.created_at) : Date.now(),
    oldPrice: undefined,
    discount: undefined,
  };
}

export async function fetchProducts(params?: {
  q?: string;
  category?: string;
  per_page?: number;
}): Promise<Product[]> {
  const base = getApiBaseUrl();
  const sp = new URLSearchParams();
  sp.set("per_page", String(params?.per_page ?? 100));
  if (params?.q) sp.set("q", params.q);
  if (params?.category) sp.set("category", params.category);
  const rows = await apiFetch<ApiProductDto[]>(`${base}/products?${sp}`);
  return rows.map(mapApiProductToProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const base = getApiBaseUrl();
  const row = await apiFetch<ApiProductDto>(`${base}/products/${encodeURIComponent(id)}`);
  return mapApiProductToProduct(row);
}

export async function fetchMyProducts(token: string): Promise<Product[]> {
  const base = getApiBaseUrl();
  const rows = await apiFetch<ApiProductDto[]>(`${base}/products/mine`, { token });
  return rows.map(mapApiProductToProduct);
}

export async function createProduct(
  token: string,
  body: {
    title: string;
    description: string;
    category?: string;
    price: number;
    image_url?: string | null;
  },
): Promise<Product> {
  const base = getApiBaseUrl();
  const row = await apiFetch<ApiProductDto>(`${base}/products`, {
    method: "POST",
    token,
    json: body,
  });
  return mapApiProductToProduct(row);
}

export async function updateProduct(
  token: string,
  id: string,
  body: Partial<{
    title: string;
    description: string;
    category: string | null;
    price: number;
    image_url: string | null;
  }>,
): Promise<Product> {
  const base = getApiBaseUrl();
  const row = await apiFetch<ApiProductDto>(`${base}/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    json: body,
  });
  return mapApiProductToProduct(row);
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  const base = getApiBaseUrl();
  await apiFetch<{ deleted: boolean }>(`${base}/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}
