import type { CapacitorConfig } from "@capacitor/cli";

/**
 * درخواست از WebView اندروید به API بیرونی حتماً باید HTTPS باشد:
 * با `cleartext: false` ترافیک http خام به بیرون از اپ بسته می‌شود.
 * برای دامنهٔ production مانند https://diigiimall.ir/api مقدار `VITE_API_BASE_URL`
 * را پیش از `npm run build:mobile` / `npm run android` ست کنید.
 */
const config: CapacitorConfig = {
  appId: "com.digimall.app",
  appName: "DigiMall",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#e11d48",
  },
};

export default config;
