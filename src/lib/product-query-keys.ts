/** فقط آرایه‌های کلید React Query؛ بدون import به API تا SSR و ترتیب ماژول پایدار بماند. */
const PRODUCTS_QUERY_ROOT = ["products"] as const;

export const productKeys = {
  all: PRODUCTS_QUERY_ROOT,
  list: (filters: { q?: string; category?: string }) =>
    [...PRODUCTS_QUERY_ROOT, "list", filters.q ?? "", filters.category ?? ""] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_ROOT, "detail", id] as const,
  mine: [...PRODUCTS_QUERY_ROOT, "mine"] as const,
};
