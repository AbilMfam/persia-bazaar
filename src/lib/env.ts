/**
 * Laravel origin در dev زمانی کاربرد دارد که `VITE_API_BASE_URL` ست نباشد و SSR
 * نیاز به آدرس مطلق `/api` دارد — فقط از متغیرهای محیطی خوانده می‌شود (بدون fallback به loopback).
 */
function devLaravelOrigin(): string {
  const fromEnv =
    import.meta.env.VITE_DEV_API_PROXY_TARGET?.trim() ||
    import.meta.env.VITE_LARAVEL_ORIGIN?.trim();
  if (!fromEnv || fromEnv.length === 0) {
    throw new Error(
      "در dev بدون `VITE_API_BASE_URL` یکی از `VITE_DEV_API_PROXY_TARGET` یا `VITE_LARAVEL_ORIGIN` را در `.env.local` ست کنید (مبدأ Laravel روی شبکهٔ توسعه).",
    );
  }
  return fromEnv.replace(/\/$/, "");
}

/** Laravel `/api` prefix included (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    // مرورگر در dev: `/api` تا Vite به Laravel پروکسی کند (فقط وقتی `VITE_DEV_API_PROXY_TARGET` در vite.config ست شده باشد).
    if (typeof window !== "undefined") {
      return "/api";
    }
    // SSR در dev: به پروکسی Vite نمی‌رسد — آدرس مطلق Laravel
    return `${devLaravelOrigin()}/api`;
  }

  throw new Error(
    "VITE_API_BASE_URL برای این بیلد تنظیم نشده است؛ `.env.production` را با مقدار «https://diigiimall.ir/api» بسازید یا پیش از بیلد موبایل همان متغیر را ست کنید.",
  );
}

/** Server origin بدون `/api`، برای resolve مسیرهای نسبی مثل `image_url`. */
export function getApiOrigin(): string {
  const base = getApiBaseUrl();
  if (base.startsWith("/")) {
    const fromEnv = import.meta.env.VITE_LARAVEL_ORIGIN?.trim();
    if (!fromEnv || fromEnv.length === 0) {
      throw new Error(
        "زمانی که `getApiBaseUrl()` مسیر `/api` برمی‌گرداند، `VITE_LARAVEL_ORIGIN` را برای resolve تصاویر ست کنید.",
      );
    }
    return fromEnv.replace(/\/$/, "");
  }
  const stripped = base.replace(/\/api\/?$/i, "");
  return stripped.length > 0 ? stripped : base;
}
