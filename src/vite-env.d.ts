/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Laravel API base؛ در اپ نصبی باید مثل «https://diigiimall.ir/api» در زمان build تزریق شود. */
  readonly VITE_API_BASE_URL?: string;
  /** مبدأ Laravel بدون `/api` — برای resolve تصاویر وقتی `getApiBaseUrl()` مسیر نسبی `/api` می‌دهد */
  readonly VITE_LARAVEL_ORIGIN?: string;
  /** مبدأ پروکسی dev در vite.config؛ باید صریح در `.env.local` ست شود تا `/api` پروکسی شود */
  readonly VITE_DEV_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
