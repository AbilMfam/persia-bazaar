import { createId } from "./ids";
import { getSeedProducts } from "./seed";
import { emit, readJson, writeJson } from "./storage";
import type { Product } from "./types";

const PRODUCTS_KEY = "digi_products_v1";
const SEEDED_KEY = "digi_products_seeded_v1";
export const PRODUCTS_CHANGE = "products:change";

function readAll(): Product[] {
  return readJson<Product[]>(PRODUCTS_KEY, []);
}

function writeAll(products: Product[]): void {
  writeJson(PRODUCTS_KEY, products);
  emit(PRODUCTS_CHANGE);
}

export function initProducts(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  writeJson(PRODUCTS_KEY, getSeedProducts());
  localStorage.setItem(SEEDED_KEY, "1");
  emit(PRODUCTS_CHANGE);
}

export const productStore = {
  getAll(): Product[] {
    return readAll().sort((a, b) => b.createdAt - a.createdAt);
  },

  getById(id: string): Product | undefined {
    return readAll().find((p) => p.id === id);
  },

  getBySeller(sellerId: string): Product[] {
    return readAll()
      .filter((p) => p.sellerId === sellerId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getByCategory(categoryId: string): Product[] {
    return readAll()
      .filter((p) => p.category === categoryId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  create(
    input: Omit<Product, "id" | "createdAt" | "rating" | "reviews"> & {
      rating?: number;
      reviews?: number;
    },
  ): Product {
    const products = readAll();
    const product: Product = {
      ...input,
      id: createId("p"),
      rating: input.rating ?? 5,
      reviews: input.reviews ?? 0,
      createdAt: Date.now(),
    };
    products.unshift(product);
    writeAll(products);
    return product;
  },

  update(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>): Product | null {
    const products = readAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = { ...products[index], ...patch, id };
    products[index] = updated;
    writeAll(products);
    return updated;
  },

  remove(id: string): boolean {
    const next = readAll().filter((p) => p.id !== id);
    if (next.length === readAll().length) return false;
    writeAll(next);
    return true;
  },
};

export function calcDiscount(price: number, oldPrice?: number): number | undefined {
  if (!oldPrice || oldPrice <= price) return undefined;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
