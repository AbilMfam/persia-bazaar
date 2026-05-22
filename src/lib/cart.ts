import { emit, readJson, writeJson } from "./storage";
import type { CartItem, Product } from "./types";

const KEY = "digi_cart_v1";
export const CART_CHANGE = "cart:change";

type StoredCartItem = { productId: string; qty: number };

function readStored(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  return readJson<StoredCartItem[]>(KEY, []);
}

/** برای هوکٔ سبد: با لیست محصولات فعلی مرورگر/سرور ادغام می‌کند. */
export function hydrateCartFromCatalog(products: Product[]): CartItem[] {
  const map = new Map(products.map((p) => [p.id, p]));
  return readStored()
    .map((s) => {
      const product = map.get(s.productId);
      if (!product) return null;
      return { product, qty: s.qty } satisfies CartItem;
    })
    .filter((x): x is CartItem => x !== null);
}

export const cart = {
  add(product: Product) {
    const stored = readStored();
    const found = stored.find((s) => s.productId === product.id);
    if (found) found.qty += 1;
    else stored.push({ productId: product.id, qty: 1 });
    writeJson(KEY, stored);
    emit(CART_CHANGE);
  },

  remove(id: string) {
    writeJson(
      KEY,
      readStored().filter((s) => s.productId !== id),
    );
    emit(CART_CHANGE);
  },

  setQty(id: string, qty: number) {
    const next = readStored()
      .map((s) => (s.productId === id ? { ...s, qty } : s))
      .filter((s) => s.qty > 0);
    writeJson(KEY, next);
    emit(CART_CHANGE);
  },

  clear() {
    writeJson(KEY, []);
    emit(CART_CHANGE);
  },

  removeProductFromAll(productId: string) {
    writeJson(
      KEY,
      readStored().filter((s) => s.productId !== productId),
    );
    emit(CART_CHANGE);
  },
};
