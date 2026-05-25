import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { BannerCarousel } from "@/components/BannerCarousel";
import { LazyImage } from "@/components/LazyImage";
import { categories } from "@/lib/data";
import { refetchAllProductQueries } from "@/lib/product-cache-sync";
import { useProducts } from "@/hooks/useProducts";
import { Flame, Truck, ShieldCheck, BadgePercent, RefreshCw } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "دیجی‌مال — صفحه اصلی" },
      { name: "description", content: "بازار آنلاین با تخفیف‌های ویژه" },
    ],
  }),
});

function Index() {
  const queryClient = useQueryClient();
  const [refreshBusy, setRefreshBusy] = useState(false);
  const { products } = useProducts();
  const discounted = products.filter((p) => p.discount);

  const onRefreshProducts = () => {
    void (async () => {
      setRefreshBusy(true);
      try {
        await refetchAllProductQueries(queryClient);
      } finally {
        setRefreshBusy(false);
      }
    })();
  };

  return (
    <div className="animate-fade-in">
      <TopBar
        showSearch
        right={
          <button
            type="button"
            onClick={onRefreshProducts}
            disabled={refreshBusy}
            aria-label="به‌روزرسانی لیست کالاها"
            title="به‌روزرسانی لیست از سرور"
            className={`rounded-full p-1.5 transition hover:bg-white/15 disabled:opacity-60 ${refreshBusy ? "cursor-wait" : ""}`}
          >
            <RefreshCw className={`h-5 w-5 ${refreshBusy ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <BannerCarousel />

      <section className="grid grid-cols-4 gap-2 px-4 pt-5 text-center text-[10px]">
        {[
          { icon: Truck, label: "ارسال سریع" },
          { icon: ShieldCheck, label: "ضمانت اصالت" },
          { icon: BadgePercent, label: "بهترین قیمت" },
          { icon: Flame, label: "پرفروش‌ها" },
        ].map(({ icon: I, label }) => (
          <div key={label} className="rounded-xl bg-card p-2 shadow-card">
            <I className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 font-medium text-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="pt-5">
        <h2 className="px-4 pb-2 text-sm font-bold">دسته‌بندی‌ها</h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/category/$categoryId"
              params={{ categoryId: c.id }}
              className="flex min-w-16 flex-col items-center gap-1.5 rounded-2xl bg-card p-3 shadow-card transition hover:-translate-y-0.5"
            >
              <span className="flex h-12 w-12 overflow-hidden rounded-full bg-accent">
                {c.coverImage ? (
                  <LazyImage src={c.coverImage} alt="" wrapperClassName="h-full w-full" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl">
                    {c.emoji ?? "📦"}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {discounted.length > 0 && (
        <section className="mt-5 mx-4 rounded-2xl bg-gradient-primary p-1 shadow-elevated">
          <div className="rounded-[14px] bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-bold">شگفت‌انگیزها</h2>
              </div>
              <Link to="/" className="text-xs font-bold text-primary">
                مشاهده همه
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {discounted.map((p) => (
                <div key={p.id} className="min-w-[150px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pt-6 pb-6">
        <h2 className="pb-3 text-sm font-bold">جدیدترین کالاها</h2>
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            هنوز کالایی ثبت نشده. اولین فروشنده باشید!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
