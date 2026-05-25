import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const PULL_THRESHOLD = 56;
const MAX_PULL_VISUAL = 88;

function dampen(delta: number): number {
  const k = MAX_PULL_VISUAL / (MAX_PULL_VISUAL + delta * 0.35);
  return Math.min(MAX_PULL_VISUAL, delta * k);
}

type PullToRefreshProps = {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
};

/**
 * وقتی اسکرول در بالای صفحه باشد، با کشیدن به‌سمت پایین همان کش pull-to-refresh دادهٔ React Query به‌روز می‌شود.
 */
export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const lockingRef = useRef(false);

  const [pullPx, setPullPx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  /* در حالت عادی و کشیدن: جابجایی با pullPx؛ هنگام رفرش دست نمی‌زنیم تا effect بعدی اندازهٔ ثابت بدهد */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    if (refreshing) return;
    inner.style.transition = pullPx === 0 ? "transform 0.22s ease-out" : "none";
    inner.style.transform = pullPx > 0 ? `translateY(${pullPx}px)` : "none";
  }, [pullPx, refreshing]);

  /* نشانگر باریک در حالت رفرش */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    if (!refreshing) return;
    inner.style.transition = "transform 0.2s ease-out";
    inner.style.transform = "translateY(52px)";
  }, [refreshing]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let activePull = 0;

    type Gesture = {
      y0: number;
      x0: number;
      fromTop: boolean;
      armed: boolean;
    };
    let gesture: Gesture | null = null;

    async function runRefreshSequence() {
      if (lockingRef.current) return;
      lockingRef.current = true;

      try {
        setRefreshing(true);
        setPullPx(0);
        await onRefreshRef.current();
      } finally {
        lockingRef.current = false;
        setRefreshing(false);
      }
    }

    function onTouchStart(e: TouchEvent) {
      if (lockingRef.current) return;
      const y = e.touches[0]?.clientY;
      const x = e.touches[0]?.clientX;
      if (y === undefined || x === undefined) return;
      gesture = {
        y0: y,
        x0: x,
        fromTop: scrollEl.scrollTop <= 1,
        armed: false,
      };
    }

    function onTouchMove(e: TouchEvent) {
      if (lockingRef.current || !gesture) return;
      const t = e.touches[0];
      if (!t) return;

      const dy = t.clientY - gesture.y0;
      const dx = t.clientX - gesture.x0;

      if (!gesture.armed) {
        if (!gesture.fromTop || scrollEl.scrollTop > 1) {
          gesture = null;
          activePull = 0;
          setPullPx(0);
          return;
        }
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
          gesture = null;
          return;
        }
        if (dy < 6) return;
        gesture.armed = true;
      }

      if (scrollEl.scrollTop > 1) {
        gesture = null;
        activePull = 0;
        setPullPx(0);
        return;
      }

      if (dy > 0) {
        e.preventDefault();
        activePull = dampen(dy);
        setPullPx(activePull);
      }
    }

    function onTouchEnd() {
      const wasArmed = gesture?.armed === true;
      const px = activePull;
      gesture = null;
      activePull = 0;

      if (wasArmed && px >= PULL_THRESHOLD) {
        void runRefreshSequence();
      } else {
        setPullPx(0);
      }
    }

    function onTouchCancel() {
      gesture = null;
      activePull = 0;
      setPullPx(0);
    }

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
    scrollEl.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchmove", onTouchMove);
      scrollEl.removeEventListener("touchend", onTouchEnd);
      scrollEl.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  const showSpinner = pullPx > 10 || refreshing;
  const spinIcon = refreshing || pullPx >= PULL_THRESHOLD;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <div
        ref={scrollRef}
        aria-busy={refreshing || undefined}
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto bg-background [-webkit-overflow-scrolling:touch]",
          "touch-pan-y overscroll-y-contain",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center transition-opacity duration-150",
            showSpinner ? "opacity-95" : "opacity-0",
          )}
          aria-hidden
        >
          <div className="rounded-full bg-card/95 p-2 shadow-card backdrop-blur-sm">
            <RefreshCw
              className={cn("size-6 text-primary", spinIcon && "animate-spin")}
              aria-hidden
            />
          </div>
        </div>

        <div ref={innerRef} className="min-h-full will-change-transform">
          {children}
        </div>
      </div>
    </div>
  );
}
