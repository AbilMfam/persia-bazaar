import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { LazyImage } from "@/components/LazyImage";
import { formatPrice, type Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:shadow-elevated"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <LazyImage
          src={product.image}
          alt={product.title}
          wrapperClassName="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.discount ? (
          <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-elevated">
            ٪{product.discount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-6 text-foreground">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span>{product.rating.toLocaleString("fa-IR")}</span>
          <span>({product.reviews.toLocaleString("fa-IR")})</span>
        </div>
        <div className="flex items-end justify-between pt-1">
          <div>
            {product.oldPrice ? (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </div>
            ) : null}
            <div className="text-sm font-bold text-primary">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
