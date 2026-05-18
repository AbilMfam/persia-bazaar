import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(root, "dist", "client");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureIndexHtml() {
  const indexPath = path.join(clientDir, "index.html");
  if (await exists(indexPath)) return;

  const shellCandidates = [
    path.join(clientDir, "_shell.html"),
    path.join(clientDir, "index.html"),
  ];

  for (const candidate of shellCandidates) {
    if (await exists(candidate)) {
      await fs.copyFile(candidate, indexPath);
      console.log(`[prepare-capacitor] Created index.html from ${path.basename(candidate)}`);
      return;
    }
  }

  throw new Error(
    "[prepare-capacitor] No index.html found. Run MOBILE_BUILD=1 vite build with tanstackStart.spa enabled.",
  );
}

async function collectAssetUrls(dir, base = "") {
  const urls = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const rel = `${base}/${entry.name}`.replace(/\\/g, "/");
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      urls.push(...(await collectAssetUrls(full, rel)));
    } else if (/\.(js|css|svg|png|jpg|jpeg|webp|woff2?|json)$/i.test(entry.name)) {
      urls.push(rel.startsWith("/") ? rel : `/${rel}`);
    }
  }

  return urls;
}

async function patchServiceWorker() {
  const swPath = path.join(clientDir, "sw.js");
  if (!(await exists(swPath))) return;

  const assetUrls = await collectAssetUrls(clientDir);
  const precache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/icon-192.svg",
    "/icon-512.svg",
    "/sw.js",
    ...assetUrls.filter((u) => u !== "/sw.js"),
  ];
  const unique = [...new Set(precache)];

  const sw = `const CACHE = "digi-mall-cap-v1";
const PRECACHE = ${JSON.stringify(unique, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE);
        return (
          (await cache.match("/index.html")) ||
          (await cache.match("/")) ||
          (await cache.match(event.request))
        );
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    }),
  );
});
`;

  await fs.writeFile(swPath, sw, "utf8");
  console.log(`[prepare-capacitor] Patched sw.js with ${unique.length} precache entries`);
}

async function main() {
  if (!(await exists(clientDir))) {
    throw new Error("[prepare-capacitor] dist/client missing — run vite build first.");
  }

  await ensureIndexHtml();
  await patchServiceWorker();
  console.log("[prepare-capacitor] Ready for Capacitor sync.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
