import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { z } from "zod";
import { Search } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional().default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchPage,
  head: ({ search }) => ({
    meta: [
      {
        title: search.q ? `جستجو: ${search.q} — دیجی‌مال` : "جستجو — دیجی‌مال",
      },
    ],
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const trimmed = q.trim();
  const { products: results, ready } = useProducts({
    q: trimmed || undefined,
    skip: trimmed.length === 0,
  });

  return (
    <div className="animate-fade-in pb-6">
      <TopBar
        back
        showSearch
        searchValue={q}
        onSearchSubmit={(query) => {
          navigate({ to: "/search", search: { q: query.trim() }, replace: true });
        }}
      />

      <section className="px-4 pt-4">
        {!ready ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !trimmed ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Search className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">عبارت مورد نظر را در کادر بالا وارد کنید</p>
          </div>
        ) : results.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            نتیجه‌ای برای «{trimmed}» پیدا نشد.
          </p>
        ) : (
          <>
            <p className="pb-3 text-xs text-muted-foreground">
              {results.length.toLocaleString("fa-IR")} نتیجه برای «{trimmed}»
            </p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
