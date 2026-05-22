/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Laravel API base URL — در dev اگر خالی باشد از `/api` + پروکسی Vite استفاده می‌شود. */
  readonly VITE_API_BASE_URL?: string;
  /** مبدأ Laravel بدون `/api` — برای آدرس مطلق تصاویر `/storage/*` وقتی API از پروکسی dev می‌آید؛ پیش‌فرض ۱۲۷...:۸۰۰۰ */
  readonly VITE_LARAVEL_ORIGIN?: string;
  /** همان مقصدی که vite پروکسی می‌اندازد (برای SSR در dev)، مثل `http://127.0.0.1:8000` */
  readonly VITE_DEV_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
