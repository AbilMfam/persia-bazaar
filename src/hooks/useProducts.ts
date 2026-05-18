import { useEffect, useState } from "react";
import { PRODUCTS_CHANGE, productStore } from "@/lib/products";
import type { Product } from "@/lib/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setProducts(productStore.getAll());
      setReady(true);
    };
    refresh();
    window.addEventListener(PRODUCTS_CHANGE, refresh);
    return () => window.removeEventListener(PRODUCTS_CHANGE, refresh);
  }, []);

  return { products, ready };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      setProduct(productStore.getById(id));
      setReady(true);
    };
    load();
    window.addEventListener(PRODUCTS_CHANGE, load);
    return () => window.removeEventListener(PRODUCTS_CHANGE, load);
  }, [id]);

  return { product, ready, found: ready && !!product };
}

export function useSellerProducts(sellerId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!sellerId) {
      setProducts([]);
      return;
    }
    const load = () => setProducts(productStore.getBySeller(sellerId));
    load();
    window.addEventListener(PRODUCTS_CHANGE, load);
    return () => window.removeEventListener(PRODUCTS_CHANGE, load);
  }, [sellerId]);

  return products;
}
