import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { LazyImage } from "@/components/LazyImage";
import { banners } from "@/lib/data";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;

export function BannerCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
    dragFree: false,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;

    let timer: ReturnType<typeof setInterval>;

    const start = () => {
      timer = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    };

    const stop = () => clearInterval(timer);

    start();
    emblaApi.on("pointerDown", stop);
    emblaApi.on("pointerUp", start);

    return () => {
      stop();
      emblaApi.off("pointerDown", stop);
      emblaApi.off("pointerUp", start);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  return (
    <section className="pt-4" aria-label="پیشنهادهای ویژه">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-x gap-3 px-4">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={cn(
                "relative min-h-[148px] shrink-0 grow-0 basis-[86%] overflow-hidden rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-elevated transition-[transform,opacity] duration-300 ease-out",
                selectedIndex === i ? "scale-100 opacity-100" : "scale-[0.97] opacity-85",
              )}
            >
              <div className="relative z-10 max-w-[58%]">
                <p className="text-xs/5 opacity-90">پیشنهاد ویژه</p>
                <h2 className="mt-1 text-xl font-extrabold leading-7">{b.title}</h2>
                <p className="mt-1 text-xs opacity-90">{b.subtitle}</p>
                <Link
                  to="/category/$categoryId"
                  params={{ categoryId: b.categoryId }}
                  className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary shadow-card transition hover:scale-105 active:scale-95"
                >
                  {b.cta}
                </Link>
              </div>
              <LazyImage
                src={b.image}
                alt={b.title}
                wrapperClassName="absolute -left-4 bottom-0 top-0 my-auto h-28 w-28 rounded-2xl opacity-90 ring-4 ring-white/20"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 px-4">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`اسلاید ${i + 1}`}
            aria-current={selectedIndex === i ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full bg-primary transition-all duration-300 ease-out",
              selectedIndex === i ? "w-7 opacity-100" : "w-1.5 opacity-35 hover:opacity-60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
