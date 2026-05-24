# دیجی‌مال (Persia Bazaar)

اپ وب/PWA با TanStack Start، React و Capacitor برای اندروید.

## بکند Laravel — داخل همین پروژه

کد API در پوشهٔ **`backend/`** کنار همین اپ قرار دارد (`persia-bazaar/backend`). این همان مارکت‌پلیس لاراول است که قبلاً جدا بود و اینجا کپی شده است.

**مسیر PHP (ویندوز):** اسکریپت‌های npm مثل `backend:dev` و `backend:migrate` از **`C:/xampp/php/php.exe`** (XAMPP، حداقل **۸.۲**) استفاده می‌کنند. در **`php.ini` همان نصب** معمولاً اکستنشن‌هایی مثل `openssl`، `mbstring`، `pdo_sqlite`، `curl` را فعال کن. برای Composer در یک ترمینال می‌توانی با `. .\scripts\use-persia-php.ps1` همان **`C:\xampp\php`** را اول PATH قرار دهی؛ اگر مسیر دیگری داری **`PERSIA_PHP_ROOT`** را به پوشهٔ حاوی **`php.exe`** بگذار.

**SQLite بدون Laravel:** در صورت نبود `vendor` یا مشکل Composer، بازسازیٔ فایل SQLite با **`npm run backend:bootstrap-sqlite`** (اسکریپت Python) ممکن است.

از داخل **`backend`** (یک‌بار برای نصب و دیتابیس):

```powershell
. ..\scripts\use-persia-php.ps1    # پر کردن PATH با همان مسیر؛ اگر قبلاً کامل است حذفش کن
composer install
php artisan key:generate
php artisan migrate
```

برای **ساخت کامل جداول + پر کردن داده‌های سید** (زمان `created_at` / `updated_at` همان ساعت سرور/سیستم است):

```powershell
# از ریشهٔ مخزن (بعد از composer در backend)
npm run backend:migrate
```

یا بازسازیٔ کامل از صفر با سید (همهٔ ردیف‌ها پاک و دوباره ساخته می‌شوند):

```powershell
npm run backend:fresh
```

معادل دستی با PowerShell از ریشهٔ مخزن:

```powershell
.\scripts\init-database.ps1
```

اگر PHP یا Composer در PATH ندارید، می‌توانی با **اسکریپت Python** همین طرح جداول و سید SQLite را یک‌باره بسازی (`pip install bcrypt` لازم است):

```powershell
npm run backend:bootstrap-sqlite
```

این فرمان فایل `backend/database/database.sqlite` را بازسازی می‌کند؛ اگر `APP_KEY` در `backend/.env` خالی باشد هم پر می‌کند.

برای هر بار توسعه، **سرور Laravel** باید روشن باشد — از **ریشهٔ مخزن**:

```powershell
npm run backend:dev
```

یا معادل دستی از داخل **`backend`**:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
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

در توسعه روی مرورگر معمولاً **نیازی نیست** `VITE_API_BASE_URL` در `.env` ریشه بگذاری: فرانت درخواست‌ها را به `/api` می‌فرستد و **Vite** آن‌ها را به `http://127.0.0.1:8000` پروکسی می‌کند؛ فقط حتماً همزمان **`npm run dev`** و **`npm run backend:dev`** را اجرا کن.

روی **ویندوز**، سرویس **Phone Link / Connect** (`Connect.exe`) گاهی پورت **`127.0.0.1:8080`** را می‌گیرد؛ در نتیجه `http://localhost:8080` ممکن است صفحهٔ سفید یا پاسخ خالی بدهد حتی وقتی Vite بالا است. برای همین در این پروژه dev روی **`http://localhost:5173/`** اجرا می‌شود؛ همان آدرسی را که ترمینال بعد از `npm run dev` چاپ می‌کند باز کن.

اگر Laravel را غیر از پورت ۸۰۰۰ اجرا می‌کنی، یا می‌خواهی مستقیم به API بزنی (مثلاً تست واقعی اندروید)، در `.env` ریشه بگذار:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

و در آن حالت پروکسی dev استفاده نمی‌شود. برای تست از روی اندروید، به‌جای `127.0.0.1` از **IP همان رایانه روی شبکه** استفاده کن و `CORS_ALLOWED_ORIGINS` در `.env` بکند را با آدرس فرانت/کپاسیتور هماهنگ کن.

### بیلد production و APK (دامنهٔ مثلاً `https://diigiimall.ir`)

- هر درخواست API در اپ فقط با **`getApiBaseUrl()`** که از **`VITE_API_BASE_URL`** پُر می‌شود ساخته می‌شود؛ در بیلدهای بدون **`import.meta.env.DEV`** اگر این متغیر خالی باشد، زمانٔ اولین درخواست خطای صریح می‌گیری — دیگر پیش‌فرض `127.0.0.1:8000` روی کلاینت production نیست.
- نمونهٔ آمادهٔ پروداکشن: فایل **`.env.production.example`** را به **`.env.production`** در ریشهٔ مخزن کپی کن (همان خط `https://diigiimall.ir/api`).
- دستور اندروید: **`npm run android`** — پیش از `vite build` اسکریپت **`scripts/build-mobile.mjs`** بررسی می‌کند که `VITE_API_BASE_URL` ست باشد (رد کردن کنترل: `MOBILE_BUILD_SKIP_VITE_ENV_CHECK=1`).
- WebView اندروید طبق **`capacitor.config.ts`** فقط **HTTPS** به بیرون می‌فرستد (`cleartext: false`).
- برای سرور Laravel، **`backend/.env`**: **`APP_URL`**, **`CORS_ALLOWED_ORIGINS`**, **`SANCTUM_STATEFUL_DOMAINS`** را با دامنهٔ واقعی و منشاهای Capacitor همسو کن؛ نمونه به‌روز در **`backend/.env.example`** است.

### اگر به API وصل نشد

- پروکسی مسیر **`/api` فقط وقتی کار می‌کند که Laravel همزمان بالا باشد**؛ یا یک ترمینال `npm run dev:full`، یا دو ترمینال: **`npm run backend:dev`** و **`npm run dev`** و بعد فرانت را روی **`http://localhost:5173/`** باز کن.
- اگر در `.env` ریشه **`VITE_API_BASE_URL`** ست شده، حتماً **آدرس و پورت** درست باشند؛ با آن مقدار دیگر `/api` نزد Vite استفاده نمی‌شود.
- تست با **گوشی روی شبکهٔ محلی**: `npm run dev:full:lan` و در گوشی برو به **`http://<آی‌پی رایانه>:5173/`**؛ اگر مستقیم به Laravel می‌زنی، در env همان **`http://<آی‌پی>:8000/api`** را بگذار (نه `127.0.0.1`). در صورت خطای CORS، `CORS_ALLOWED_ORIGINS` بکند را با مبدأ فرانت آپدیت کن.

## نسخهٔ خارج از مخزن (اختیاری)

اگر هنوز یک کپیٔ قدیمی جداگانه از بکند داری:  
`C:\Users\teacher\Desktop\work\laravel-marketplace`  
نسخهٔ مرجِح همین مخزن، پوشهٔ **`backend/`** است.
