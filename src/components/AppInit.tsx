import { useEffect } from "react";
import { initProducts } from "@/lib/products";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

async function clearStalePwaCaches() {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith("digi-mall") && key !== "digi-mall-v3").map((key) => caches.delete(key)),
  );
}

async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

export function AppInit() {
  useEffect(() => {
    initProducts();

    if (import.meta.env.DEV) {
      void unregisterServiceWorkers().then(clearStalePwaCaches);
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline — ignore */
      });
    }
  }, []);

  return <PwaInstallPrompt />;
}
