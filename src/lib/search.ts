import { getCategoryName } from "./data";
import type { Product } from "./types";

export function filterProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return products.filter((p) => {
    const haystack = [
      p.title,
      p.description,
      p.seller,
      p.category,
      getCategoryName(p.category),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
