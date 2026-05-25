export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  /** اگر چند تصویر ذخیره شده باشد؛ برای نمای گالری در صفحه محصول */
  images?: string[];
  rating: number;
  reviews: number;
  seller: string;
  sellerId: string;
  category: string;
  discount?: number;
  description: string;
  stock?: number;
  createdAt: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
};

export type CartItem = { product: Product; qty: number };
