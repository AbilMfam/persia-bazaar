export type { Product } from "./types";

/** پس‌زمینهٔ کوچک برای کاشی دسته (SVG). */
export function categoryCoverPlaceholder(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="22" fill="hsl(${hue},68%,42%)"/><circle cx="48" cy="40" r="14" fill="white" opacity="0.35"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export type CategoryItem = {
  id: string;
  name: string;
  emoji?: string;
  /** اگر ست شود کنار عنوان دسته نشان داده می‌شود */
  coverImage?: string;
};

const bannerBeauty = "/banners/category-beauty.png";
const bannerMobile = "/banners/category-mobile.png";

export const categories: CategoryItem[] = [
  {
    id: "mobile",
    name: "موبایل",
    emoji: "📱",
    coverImage: bannerMobile,
  },
  { id: "fashion", name: "مد و پوشاک", emoji: "👗" },
  { id: "home", name: "خانه", emoji: "🏠" },
  {
    id: "beauty",
    name: "زیبایی",
    emoji: "💄",
    coverImage: bannerBeauty,
  },
  { id: "book", name: "کتاب", emoji: "📚" },
  { id: "sport", name: "ورزش", emoji: "⚽" },
  { id: "toy", name: "اسباب‌بازی", emoji: "🧸" },
  { id: "food", name: "خوراکی", emoji: "🍎" },
];

/** بنر کارousel با لینک به دسته */
export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  categoryId: string;
};

export const banners: HomeBanner[] = [
  {
    id: "b-beauty",
    title: "دستهٔ زیبایی و مراقبت",
    subtitle: "محصولات منتخب پوست و مو؛ شروع از همین امروز",
    cta: "رفتن به زیبایی",
    image: bannerBeauty,
    categoryId: "beauty",
  },
  {
    id: "b-mobile",
    title: "موبایل و کالای دیجیتال",
    subtitle: "گوشی، لوازم همراه و دیجیتال‌های پرکاربرد",
    cta: "مشاهده موبایل",
    image: bannerMobile,
    categoryId: "mobile",
  },
];

export const formatPrice = (n: number) => n.toLocaleString("fa-IR") + " تومان";

export function getCategoryName(id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}
