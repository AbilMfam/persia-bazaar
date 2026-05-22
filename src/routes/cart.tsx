import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { cart } from "@/lib/cart";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/data";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "سبد خرید — دیجی‌مال" }] }),
});

function CartPage() {
  const items = useCart();
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const savings = items.reduce(
    (s, i) => s + ((i.product.oldPrice ?? i.product.price) - i.product.price) * i.qty,
    0,
  );

  return (
    <div className="animate-fade-in pb-32">
      <TopBar title="سبد خرید" back />
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-5 text-lg font-bold">سبد خرید شما خالی است</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            هنوز کالایی به سبد اضافه نکرده‌اید
          </p>
          <Link
            to="/"
            className="mt-6 rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-elevated"
          >
            شروع خرید
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex gap-3 rounded-2xl bg-card p-3 shadow-card animate-slide-up"
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3>
                  <div className="mt-1 text-xs text-muted-foreground">{product.seller}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border">
                      <button
                        onClick={() => cart.setQty(product.id, qty - 1)}
                        className="rounded-full p-1.5 hover:bg-accent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-bold">
                        {qty.toLocaleString("fa-IR")}
                      </span>
                      <button
                        onClick={() => cart.setQty(product.id, qty + 1)}
                        className="rounded-full p-1.5 hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {formatPrice(product.price * qty)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => cart.remove(product.id)}
                  className="self-start rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="fixed bottom-[60px] left-0 right-0 z-30 mx-auto max-w-md border-t border-border bg-card/95 p-4 backdrop-blur shadow-nav">
            {savings > 0 && (
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted-foreground">سود شما از خرید</span>
                <span className="font-bold text-success">{formatPrice(savings)}</span>
              </div>
            )}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">مبلغ قابل پرداخت</span>
              <span className="text-lg font-extrabold text-primary">{formatPrice(total)}</span>
            </div>
            <button className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated transition active:scale-[0.98]">
              ادامه فرآیند خرید
            </button>
          </div>
        </>
      )}
    </div>
  );
}
