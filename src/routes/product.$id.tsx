import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { LazyImage } from "@/components/LazyImage";
import { formatPrice, getCategoryName } from "@/lib/data";
import { useProduct } from "@/hooks/useProducts";
import { cart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Heart, Share2, Star, ShoppingCart, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { product, ready, found } = useProduct(id);

  const galleryUrls = useMemo(
    () => (product?.images?.length ? product.images : product ? [product.image] : []),
    [product],
  );

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [id, product?.id]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!found || !product) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">کالا یافت نشد.</p>
        <Link to="/" className="mt-3 inline-block font-bold text-primary">
          بازگشت به خانه
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <Toaster position="top-center" dir="rtl" />
      <TopBar
        back
        right={
          <div className="flex gap-1">
            <button type="button" className="rounded-full p-1.5 hover:bg-white/15">
              <Share2 className="h-5 w-5" />
            </button>
            <button type="button" className="rounded-full p-1.5 hover:bg-white/15">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="bg-card">
        <LazyImage
          src={galleryUrls[activeImage] ?? product.image}
          alt={product.title}
          wrapperClassName="aspect-square w-full"
        />
        {galleryUrls.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-border p-2 no-scrollbar">
            {galleryUrls.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`تصویر ${i + 1}`}
                aria-current={activeImage === i ? "true" : undefined}
                className={cn(
                  "h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-transparent transition",
                  activeImage === i ? "ring-primary" : "opacity-80",
                )}
              >
                <LazyImage src={src} alt="" wrapperClassName="h-full w-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="text-xs text-muted-foreground">
            {product.seller} ·{" "}
            <Link
              to="/category/$categoryId"
              params={{ categoryId: product.category }}
              className="font-medium text-primary hover:underline"
            >
              {getCategoryName(product.category)}
            </Link>
          </div>
          <h1 className="mt-1 text-lg font-bold leading-7">{product.title}</h1>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-bold">{product.rating.toLocaleString("fa-IR")}</span>
          </div>
          <span className="text-muted-foreground">
            {product.reviews.toLocaleString("fa-IR")} دیدگاه
          </span>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="mb-2 text-sm font-bold">معرفی کالا</h2>
          <p className="text-sm leading-7 text-muted-foreground">{product.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-xs shadow-card">
            <Truck className="h-4 w-4 text-primary" />
            ارسال ۲۴ ساعته
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card p-3 text-xs shadow-card">
            <ShieldCheck className="h-4 w-4 text-primary" />
            ضمانت اصالت کالا
          </div>
        </div>
      </div>

      <div className="fixed bottom-[60px] left-0 right-0 z-30 mx-auto max-w-md border-t border-border bg-card/95 p-3 backdrop-blur shadow-nav">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              cart.add(product);
              toast.success("به سبد خرید اضافه شد");
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated transition active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" />
            افزودن به سبد
          </button>
          <div className="text-left">
            {product.oldPrice && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
            <div className="text-base font-extrabold text-primary">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
