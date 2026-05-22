/** همان مبدأیی که `php artisan serve` در dev استفاده می‌کند (برای تصاویر `/storage/*` وقتی API از پروکسی می‌آید). */
const DEFAULT_LARAVEL_ORIGIN_DEV = "http://127.0.0.1:8000";

function devLaravelOrigin(): string {
  const fromEnv =
    import.meta.env.VITE_DEV_API_PROXY_TARGET?.trim() ||
    import.meta.env.VITE_LARAVEL_ORIGIN?.trim();
  const o = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_LARAVEL_ORIGIN_DEV;
  return o.replace(/\/$/, "");
}

/** Laravel `/api` prefix included (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    // مرورگر در dev: `/api` تا Vite به Laravel پروکسی کند
    if (typeof window !== "undefined") {
      return "/api";
    }
    // SSR در dev: به پروکسی Vite نمی‌رسد — آدرس مطلق Laravel
    return `${devLaravelOrigin()}/api`;
  }
  return `${DEFAULT_LARAVEL_ORIGIN_DEV}/api`;
}

/** Server origin without `/api`, for resolving relative `image_url` paths. */
export function getApiOrigin(): string {
  const base = getApiBaseUrl();
  if (base.startsWith("/")) {
    const fromEnv = import.meta.env.VITE_LARAVEL_ORIGIN?.trim();
    if (fromEnv && fromEnv.length > 0) {
      return fromEnv.replace(/\/$/, "");
    }
    return DEFAULT_LARAVEL_ORIGIN_DEV;
  }
  const stripped = base.replace(/\/api\/?$/i, "");
  return stripped.length > 0 ? stripped : base;
}
