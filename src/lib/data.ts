export type { Product } from "./types";

export const categories = [
  { id: "mobile", name: "موبایل", emoji: "📱" },
  { id: "fashion", name: "مد و پوشاک", emoji: "👗" },
  { id: "home", name: "خانه", emoji: "🏠" },
  { id: "beauty", name: "زیبایی", emoji: "💄" },
  { id: "book", name: "کتاب", emoji: "📚" },
  { id: "sport", name: "ورزش", emoji: "⚽" },
  { id: "toy", name: "اسباب‌بازی", emoji: "🧸" },
  { id: "food", name: "خوراکی", emoji: "🍎" },
];

const bannerPlaceholder = (hue: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="hsl(${hue},65%,45%)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const banners = [
  {
    id: "b1",
    title: "جشنواره بزرگ تخفیف",
    subtitle: "تا ۷۰٪ تخفیف روی هزاران کالا",
    cta: "خرید کنید",
    image: "/banner-discount.png",
  },
  {
    id: "b2",
    title: "موبایل و کالای دیجیتال",
    subtitle: "جدیدترین گوشی‌ها با قیمت ویژه",
    cta: "مشاهده",
    image: bannerPlaceholder(220),
  },
];

export const formatPrice = (n: number) =>
  n.toLocaleString("fa-IR") + " تومان";

export function getCategoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}
