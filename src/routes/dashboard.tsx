import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { LazyImage } from "@/components/LazyImage";
import { formatPrice } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useMyProducts } from "@/hooks/useProducts";
import { auth, formatAuthError } from "@/lib/auth";
import { deleteProduct } from "@/lib/product-api";
import { productKeys } from "@/lib/product-query-keys";
import { cart } from "@/lib/cart";
import { TrendingUp, Package, Wallet, Eye, Plus, ArrowUpRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "داشبورد فروشنده — دیجی‌مال" }] }),
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, ready: authReady, isLoggedIn } = useAuth();
  const { products: myProducts, ready: productsReady } = useMyProducts();

  const revenue = myProducts.reduce((s, p) => s + p.price, 0);

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in pb-6">
        <TopBar title="داشبورد فروشنده" />
        <div className="px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">برای مشاهده داشبورد وارد شوید</p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <Toaster position="top-center" dir="rtl" />
      <TopBar title="داشبورد فروشنده" />

      <div className="bg-gradient-hero px-4 pb-8 pt-2 text-primary-foreground">
        <p className="text-xs opacity-90">ارزش کل کالاهای شما</p>
        <div className="mt-1 flex items-end justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">{formatPrice(revenue)}</h2>
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-bold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {myProducts.length.toLocaleString("fa-IR")} کالا
          </span>
        </div>
      </div>

      <div className="-mt-6 grid grid-cols-2 gap-3 px-4">
        <Stat
          icon={Package}
          label="کالاهای من"
          value={myProducts.length.toLocaleString("fa-IR")}
          tone="primary"
        />
        <Stat icon={Eye} label="بازدید" value="—" />
        <Stat
          icon={TrendingUp}
          label="دسته‌ها"
          value={new Set(myProducts.map((p) => p.category)).size.toLocaleString("fa-IR")}
        />
        <Stat icon={Wallet} label="فروشنده" value={user?.name?.split(" ")[0] ?? "—"} />
      </div>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-bold">کالاهای من</h3>
          <Link
            to="/sell"
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            افزودن
          </Link>
        </div>

        {!productsReady ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : myProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            هنوز کالایی ثبت نکرده‌اید
          </p>
        ) : (
          <div className="space-y-2.5">
            {myProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card animate-slide-up"
              >
                <LazyImage src={p.image} alt="" wrapperClassName="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-medium">{p.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatPrice(p.price)}</span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 font-bold text-success">
                      فعال
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/sell"
                    search={{ edit: p.id }}
                    className="text-xs font-bold text-primary"
                  >
                    ویرایش
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const token = auth.getToken();
                        if (!token) {
                          toast.error("ابتدا وارد شوید");
                          return;
                        }
                        try {
                          await deleteProduct(token, p.id);
                          cart.removeProductFromAll(p.id);
                          await queryClient.invalidateQueries({
                            queryKey: productKeys.all,
                            refetchType: "all",
                          });
                          toast.success("کالا حذف شد");
                        } catch (err) {
                          toast.error(formatAuthError(err));
                        }
                      })();
                    }}
                    className="flex items-center gap-0.5 text-xs text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-card ${
        tone === "primary"
          ? "bg-gradient-primary text-primary-foreground"
          : "bg-card text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <div className="mt-3 text-xl font-extrabold">{value}</div>
      <div className={`text-xs ${tone === "primary" ? "opacity-90" : "text-muted-foreground"}`}>
        {label}
      </div>
    </div>
  );
}
