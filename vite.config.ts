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
const devProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET?.trim();
const devProxy =
  devProxyTarget && devProxyTarget.length > 0
    ? {
        "/api": {
          target: devProxyTarget,
          changeOrigin: true,
        },
      }
    : undefined;

export default defineConfig({
  vite: {
    server: {
      // Windows Phone Link can bind unusual ports — keep dev on 5173.
      port: 5173,
      strictPort: true,
      ...(devProxy ? { proxy: devProxy } : {}),
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
