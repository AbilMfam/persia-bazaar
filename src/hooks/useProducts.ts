import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/auth";
import { fetchMyProducts, fetchProduct, fetchProducts } from "@/lib/product-api";
import { productKeys } from "@/lib/product-query-keys";
import type { Product } from "@/lib/types";

export function useProducts(filters?: { q?: string; category?: string; skip?: boolean }) {
  const skip = filters?.skip === true;
  const query = useQuery({
    queryKey: productKeys.list({ q: filters?.q, category: filters?.category }),
    queryFn: () =>
      fetchProducts({
        q: filters?.q,
        category: filters?.category,
        per_page: 100,
      }),
    enabled: !skip,
  });

  return {
    products: skip ? ([] as Product[]) : (query.data ?? []),
    ready: skip ? true : query.isFetched,
    isLoading: !skip && query.isLoading,
    error: skip ? undefined : query.error,
    refetch: query.refetch,
  };
}

export function useProduct(id: string | undefined) {
  const q = useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  return {
    product: q.data,
    ready: q.isFetched,
    found: q.isSuccess && !!q.data,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useMyProducts() {
  const { user, ready: authReady } = useAuth();

  const q = useQuery({
    queryKey: productKeys.mine,
    queryFn: () => fetchMyProducts(auth.getToken()!),
    enabled: authReady && !!user && !!auth.getToken(),
  });

  return {
    products: q.data ?? ([] as Product[]),
    ready: q.isFetched,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
