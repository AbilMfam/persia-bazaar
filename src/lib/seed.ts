import type { Product } from "./types";

const placeholder = (label: string, hue: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,55%)"/><stop offset="100%" stop-color="hsl(${hue + 40},80%,40%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48" font-family="sans-serif">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const SEED_SELLER_ID = "seed-system";

export function getSeedProducts(): Product[] {
  const now = Date.now();
  const items: Omit<Product, "id" | "createdAt">[] = [
    {
      title: "گوشی هوشمند سامسونگ Galaxy S24 Ultra ۲۵۶ گیگابایت",
      price: 58_900_000,
      oldPrice: 64_500_000,
      image: placeholder("S24", 12),
      rating: 4.7,
      reviews: 1284,
      seller: "دیجی‌مال",
      sellerId: SEED_SELLER_ID,
      category: "mobile",
      discount: 9,
      description:
        "گوشی پرچم‌دار سامسونگ با دوربین ۲۰۰ مگاپیکسلی، پردازنده اسنپدراگون ۸ نسل ۳ و نمایشگر داینامیک امولد ۱۲۰ هرتز.",
    },
    {
      title: "هدفون بی‌سیم اپل AirPods Pro نسل دوم",
      price: 9_450_000,
      oldPrice: 11_200_000,
      image: placeholder("Pods", 220),
      rating: 4.8,
      reviews: 873,
      seller: "دیجی‌مال",
      sellerId: SEED_SELLER_ID,
      category: "mobile",
      discount: 15,
      description:
        "هدفون بی‌سیم با قابلیت حذف نویز فعال، صدای فضایی و کیس شارژ مگ‌سیف.",
    },
    {
      title: "کفش ورزشی نایک Air Zoom Pegasus 40",
      price: 4_290_000,
      image: placeholder("Nike", 145),
      rating: 4.6,
      reviews: 412,
      seller: "اسپرت‌شاپ",
      sellerId: SEED_SELLER_ID,
      category: "sport",
      description:
        "کفش دویدن سبک و راحت با تکنولوژی Zoom Air و رویه مش تنفسپذیر.",
    },
    {
      title: "ساعت هوشمند Apple Watch Series 9 ۴۵ میلی‌متری",
      price: 21_700_000,
      oldPrice: 24_000_000,
      image: placeholder("Watch", 200),
      rating: 4.9,
      reviews: 256,
      seller: "دیجی‌مال",
      sellerId: SEED_SELLER_ID,
      category: "mobile",
      discount: 10,
      description:
        "ساعت هوشمند با تراشه S9، نمایشگر روشن‌تر و قابلیت‌های سلامتی پیشرفته.",
    },
    {
      title: "کرم مرطوب‌کننده نیوآ Soft ۲۰۰ میلی‌لیتری",
      price: 285_000,
      image: placeholder("Nivea", 320),
      rating: 4.4,
      reviews: 1980,
      seller: "بیوتی‌مارت",
      sellerId: SEED_SELLER_ID,
      category: "beauty",
      description:
        "کرم مرطوب‌کننده سبک با ویتامین E و روغن جوجوبا، مناسب همه نوع پوست.",
    },
    {
      title: "کتاب ملت عشق اثر الیف شافاک",
      price: 320_000,
      oldPrice: 380_000,
      image: placeholder("Book", 35),
      rating: 4.9,
      reviews: 5670,
      seller: "نشر ققنوس",
      sellerId: SEED_SELLER_ID,
      category: "book",
      discount: 16,
      description:
        "رمانی درباره مولانا و شمس تبریزی، اثر معروف نویسنده ترک الیف شافاک.",
    },
    {
      title: "ست قابلمه گرانیتی ۹ پارچه",
      price: 6_800_000,
      image: placeholder("Home", 25),
      rating: 4.5,
      reviews: 320,
      seller: "خانه‌بازار",
      sellerId: SEED_SELLER_ID,
      category: "home",
      description: "ست کامل قابلمه با پوشش گرانیتی نچسب و دسته‌های ارگونومیک.",
    },
    {
      title: "تی‌شرت مردانه نخی یقه گرد",
      price: 480_000,
      oldPrice: 650_000,
      image: placeholder("Tee", 280),
      rating: 4.3,
      reviews: 892,
      seller: "مدبازار",
      sellerId: SEED_SELLER_ID,
      category: "fashion",
      discount: 26,
      description: "تی‌شرت ۱۰۰٪ نخی با پارچه نرم، مناسب استفاده روزمره.",
    },
  ];

  return items.map((item, i) => ({
    ...item,
    id: `seed-${i + 1}`,
    createdAt: now - (items.length - i) * 1000,
  }));
}
