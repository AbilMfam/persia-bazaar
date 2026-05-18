import { useEffect, useState } from "react";
import { productStore } from "./products";
import { emit, readJson, writeJson } from "./storage";
import type { CartItem, Product } from "./types";

const KEY = "digi_cart_v1";
export const CART_CHANGE = "cart:change";

type StoredCartItem = { productId: string; qty: number };

function hydrate(items: StoredCartItem[]): CartItem[] {
  return items
    .map((item) => {
      const product = productStore.getById(item.productId);
      if (!product) return null;
      return { product, qty: item.qty };
    })
    .filter((x): x is CartItem => x !== null);
}

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = readJson<StoredCartItem[]>(KEY, []);
  return hydrate(stored);
}

function persist(items: CartItem[]) {
  const stored: StoredCartItem[] = items.map((i) => ({
    productId: i.product.id,
    qty: i.qty,
  }));
  writeJson(KEY, stored);
  emit(CART_CHANGE);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const refresh = () => setItems(read());
    window.addEventListener(CART_CHANGE, refresh);
    window.addEventListener("products:change", refresh);
    return () => {
      window.removeEventListener(CART_CHANGE, refresh);
      window.removeEventListener("products:change", refresh);
    };
  }, []);
  return items;
}

export const cart = {
  add(product: Product) {
    const items = read();
    const found = items.find((i) => i.product.id === product.id);
    if (found) found.qty += 1;
    else items.push({ product, qty: 1 });
    persist(items);
  },
  remove(id: string) {
    persist(read().filter((i) => i.product.id !== id));
  },
  setQty(id: string, qty: number) {
    const items = read()
      .map((i) => (i.product.id === id ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);
    persist(items);
  },
  clear() {
    persist([]);
  },
  removeProductFromAll(productId: string) {
    persist(read().filter((i) => i.product.id !== productId));
  },
};
