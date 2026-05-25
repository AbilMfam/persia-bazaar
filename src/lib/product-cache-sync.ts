import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { Product } from "./types";
import { productKeys } from "./product-query-keys";

function isProductsListKey(key: QueryKey): key is QueryKey & {
  readonly 0: "products";
  readonly 1: "list";
  readonly 2: string;
  readonly 3: string;
} {
  return Array.isArray(key) && key.length >= 4 && key[0] === "products" && key[1] === "list";
}

/**
 * همهٔ کوئری‌های محصول (لیست، جزئیات، کالاهای من) را دوباره از سرور می‌گیرد.
 * در WebView گاهی فقط invalidate کافی نیست — refetch صریح تضمین می‌کند دیتابیس دیده شود.
 */
export async function refetchAllProductQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.refetchQueries({ queryKey: productKeys.all, type: "all" });
}

/**
 * بدون انتظار برای شبکه، لیست‌های کش‌شدهٔ عمومی را با محصول ذخیره‌شده هم‌راستا می‌کند
 * (فقط کوئری‌های list بدون جستجو؛ بقیه با refetch به‌روز می‌شوند).
 */
export function upsertProductInListCaches(queryClient: QueryClient, product: Product): void {
  for (const q of queryClient.getQueryCache().findAll({ queryKey: productKeys.all })) {
    const key = q.queryKey;
    if (!isProductsListKey(key)) continue;

    const qFilter = String(key[2] ?? "");
    if (qFilter !== "") continue;

    const categoryFilter = String(key[3] ?? "");
    if (categoryFilter !== "" && categoryFilter !== product.category) continue;

    const prev = queryClient.getQueryData<Product[]>(key);
    if (!Array.isArray(prev)) continue;

    const next = [product, ...prev.filter((p) => p.id !== product.id)];
    next.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    queryClient.setQueryData(key, next);
  }
}

export function removeProductFromListCaches(queryClient: QueryClient, productId: string): void {
  for (const q of queryClient.getQueryCache().findAll({ queryKey: productKeys.all })) {
    const key = q.queryKey;
    if (!isProductsListKey(key)) continue;

    const prev = queryClient.getQueryData<Product[]>(key);
    if (!Array.isArray(prev)) continue;

    queryClient.setQueryData(
      key,
      prev.filter((p) => p.id !== productId),
    );
  }
}
