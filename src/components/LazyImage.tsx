import { useState } from "react";
import { cn } from "@/lib/utils";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
};

export function LazyImage({ src, alt, className, wrapperClassName }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </div>
  );
}
