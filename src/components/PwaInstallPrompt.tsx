import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("digi_pwa_dismissed");
    if (dismissed) setHidden(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (Capacitor.isNativePlatform() || hidden || !deferred) return null;

  return (
    <div className="fixed bottom-[72px] left-3 right-3 z-50 mx-auto max-w-md animate-slide-up">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-elevated">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-sm font-extrabold text-primary-foreground">
          د
        </div>
        <div className="flex-1 text-xs">
          <p className="font-bold">نصب اپ دیجی‌مال</p>
          <p className="mt-0.5 text-muted-foreground">دسترسی سریع و آفلاین به فروشگاه</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
            setHidden(true);
            localStorage.setItem("digi_pwa_dismissed", "1");
          }}
          className="flex items-center gap-1 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          نصب
        </button>
        <button
          type="button"
          onClick={() => {
            setHidden(true);
            localStorage.setItem("digi_pwa_dismissed", "1");
          }}
          className="rounded-full p-1 text-muted-foreground hover:bg-accent"
          aria-label="بستن"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
