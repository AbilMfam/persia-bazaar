const CACHE = "digi-mall-v5";
const PRECACHE = ["/manifest.json", "/icon-192.svg", "/icon-512.svg"];

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

function isAppShellRequest(request) {
  const url = new URL(request.url);
  if (request.mode === "navigate") return true;
  if (url.pathname.startsWith("/assets/")) return true;
  return /\.(js|css|mjs)$/i.test(url.pathname);
}

/** JSON و لیست محصولات نباید از Cache API سرو شوند — باعث مانده داده بعد از حذف/ثبت می‌شود. */
function isApiRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isApiRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isAppShellRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response?.ok && response.type !== "opaque") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return (await caches.match("/")) || Response.error();
          }
          return Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response?.ok && response.type !== "opaque") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }),
    ),
  );
});
