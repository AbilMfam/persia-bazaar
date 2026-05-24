# دیجی‌مال (Persia Bazaar)

اپ وب/PWA با TanStack Start، React و Capacitor برای اندروید.

## بکند Laravel — داخل همین پروژه

کد API در پوشهٔ **`backend/`** کنار همین اپ قرار دارد (`persia-bazaar/backend`). این همان مارکت‌پلیس لاراول است که قبلاً جدا بود و اینجا کپی شده است.

از داخل **`backend`** (یک‌بار برای نصب و دیتابیس):

```powershell
composer install
php artisan key:generate
php artisan migrate
```

برای هر بار توسعه، **سرور Laravel** باید روشن باشد — از **ریشهٔ مخزن**:

```powershell
npm run backend:dev
```

یا معادل دستی از داخل **`backend`**:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

فایل **`.env`** بکند در همان پوشه تنظیم شده است؛ برای توسعه روی همین دستگاه **`DB_CONNECTION=sqlite`** و فایل **`database/database.sqlite`** استفاده می‌شود (بدون نیاز به MySQL). برای پروداکشن می‌توانی به MySQL برگردی و مقادیر دیتابیس را در `.env` عوض کنی.

## فرانت‌اند

از ریشهٔ مخزن (همین اپ):

```powershell
npm install
npm run dev
```

برای یک‌خطی (Laravel `:8000` + Vite، معمولا فرانت `:5173`):

```powershell
npm run dev:full
```

اگر به‌خاطر قطعی شبکه دانلوی پکیج‌ها با خطا مواجه شدی (`ECONNRESET` و غیره)، دوباره `npm install` را اجرا کن یا با شبکهٔ پایدارتر نصب کن.

**پیش‌فرض مخزن:** در `.env` و `.env.production` مقدار **`VITE_API_BASE_URL=https://diigiimall.ir/api`** ست شده است؛ با آن هر `npm run dev` هم به همان دامنهٔ زنده می‌زند — برای اندروید بیلد‌شده خطای اتصال ناشی از لاهاست قدیمی رفع می‌شود.

برای Laravel روی شبکهٔ توسعه (روی دستگاه‌ها قابلٔ دسترس):

```env
# در `.env.local` یا `.env.development.local`
VITE_API_BASE_URL=http://<HOST_LARAVEL>:8000/api
```

برای **`/api` + پروکسی Vite** به‌جای آدرس کامل، اول مقدار کامل را خالی کن (`VITE_API_BASE_URL=` در همان دو فایل محلی)، سپس:

```env
VITE_DEV_API_PROXY_TARGET=http://<HOST_LARAVEL>:8000
VITE_LARAVEL_ORIGIN=http://<HOST_LARAVEL>:8000
```

روی ویندوز، سرویس **Phone Link / Connect** گاهی پورت‌های پیش‌فرض بعضی دستورکارها را می‌گیرد؛ در این مخزن dev روی **پورت 5173** است — همان آدرسی را که ترمینال بعد از `npm run dev` چاپ می‌کند باز کن.

برای تست از روی گوشی با API محلی یا فرانت شبکهٔ LAN از **`npm run dev:full:lan`** استفاده کن و **`CORS_ALLOWED_ORIGINS`** بکند را با مبدأ فرانت هماهنگ کن.

### بیلد production و APK (دامنهٔ `https://diigiimall.ir`)

- هر درخواست API در اپ از **`import.meta.env.VITE_API_BASE_URL`** از طریق **`getApiBaseUrl()`** می‌آید؛ در اپ نصبی اگر این مقدار خالی باشد، زمانٔ اولین درخواست خطای صریح می‌گیری (دیگر پیش‌فرض مخفی نیست).
- فایل **`.env.production`** در ریشهٔ مخزن پیش‌فرض **`https://diigiimall.ir/api`** را در بیلد تزریق می‌کند (برای اندروید و GitHub Actions).
- دستور اندروید: **`npm run android`** — اسکریپت **`scripts/build-mobile.mjs`** قبل از **`vite build`** مطمئن می‌شود `VITE_API_BASE_URL` موجود است (اختیاری: `MOBILE_BUILD_SKIP_VITE_ENV_CHECK=1`).
- طبق **`capacitor.config.ts`** برای ترافیک بیرون از اپ فقط **HTTPS** مجاز است (`cleartext: false`).
- بکند: **`backend/.env`** شامل **`APP_URL`**, **`CORS_ALLOWED_ORIGINS`**, **`SANCTUM_STATEFUL_DOMAINS`** با دامنهٔ prod و origins مخصوص WebView اندروید — نمونه در **`backend/.env.production.example`**.

### اگر به API وصل نشد

- اگر API محلی با پروکسی می‌خواهی: هم Laravel را با **`npm run backend:dev`** باز کن هم **`VITE_DEV_API_PROXY_TARGET`** را ست کن؛ بدون آن پروکسی `/api` فعال نیست.
- با **`VITE_API_BASE_URL`** ست‌شده مستقیم، دیگر مسیر **`/api` نزد Vite برای پروکسی استفاده نمی‌شود**؛ برای APK این همان رفتار مطلوب است.

## نسخهٔ خارج از مخزن (اختیاری)

اگر هنوز یک کپیٔ قدیمی جداگانه از بکند داری:  
`C:\Users\teacher\Desktop\work\laravel-marketplace`  
نسخهٔ مرجِح همین مخزن، پوشهٔ **`backend/`** است.
