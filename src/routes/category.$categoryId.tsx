import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/lib/data";
import { useProducts } from "@/hooks/useProducts";

export const Route = createFileRoute("/category/$categoryId")({
  component: CategoryPage,
  head: ({ params }) => {
    const name = categories.find((c) => c.id === params.categoryId)?.name ?? "دسته‌بندی";
    return {
      meta: [
        { title: `${name} — دیجی‌مال` },
        { name: "description", content: `خرید کالاهای ${name}` },
      ],
    };
  },
});

function CategoryPage() {
  const { categoryId } = Route.useParams();
  const category = categories.find((c) => c.id === categoryId);
  const { products: items, ready } = useProducts({ category: categoryId });

  if (!category) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">دسته‌بندی یافت نشد</p>
        <Link to="/" className="mt-3 inline-block font-bold text-primary">
          بازگشت به خانه
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <TopBar title={category.name} back showSearch />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl">
            {category.emoji}
          </span>
          <div>
            <h1 className="text-base font-bold">{category.name}</h1>
            <p className="text-xs text-muted-foreground">
              {ready
                ? `${items.length.toLocaleString("fa-IR")} کالا`
                : "در حال بارگذاری..."}
            </p>
          </div>
        </div>
      </div>

      <section className="px-4 pt-5">
        {!ready ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            هنوز کالایی در این دسته ثبت نشده.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p, i) => (
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
