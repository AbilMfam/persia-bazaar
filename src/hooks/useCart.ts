import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { CART_CHANGE, hydrateCartFromCatalog } from "@/lib/cart";
import type { CartItem } from "@/lib/types";

export function useCart(): CartItem[] {
  const { products } = useProducts();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener(CART_CHANGE, refresh);
    return () => window.removeEventListener(CART_CHANGE, refresh);
  }, []);

  return useMemo(() => hydrateCartFromCatalog(products), [products, tick]);
}
