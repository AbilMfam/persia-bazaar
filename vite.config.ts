// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isMobileBuild = process.env.MOBILE_BUILD === "1";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
// MOBILE_BUILD=1 enables SPA shell + index.html for Capacitor (offline-first, no SSR at runtime).
/** Default Laravel URL for `/api` dev proxy (`php artisan serve`). */
const devApiProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET ?? "http://127.0.0.1:8000";

export default defineConfig({
  vite: {
    server: {
      // Windows (Phone Link): Connect.exe listens on 127.0.0.1:8080 and serves a fake
      // "Connect Internal WebServer" response → blank page while Vite listens on 0.0.0.0:8080.
      // Use Vite's default port instead of 8080 to avoid localhost hijacking that port pair.
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: devApiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  },
  cloudflare: isMobileBuild ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
    ...(isMobileBuild
      ? {
          spa: {
            enabled: true,
            prerender: {
              outputPath: "/index",
              crawlLinks: false,
            },
          },
        }
      : {}),
  },
});
