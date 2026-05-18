import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, Bell, Search } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type Props = {
  title?: string;
  back?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchSubmit?: (query: string) => void;
  right?: ReactNode;
};

export function TopBar({
  title,
  back,
  showSearch,
  searchValue,
  onSearchSubmit,
  right,
}: Props) {
  const router = useRouter();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchValue ?? "");

  useEffect(() => {
    if (searchValue !== undefined) setQuery(searchValue);
  }, [searchValue]);

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
      return;
    }

    navigate({ to: "/search", search: { q: trimmed } });
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-primary text-primary-foreground shadow-elevated">
      <div className="flex items-center gap-3 px-4 py-3">
        {back ? (
          <button
            onClick={() => router.history.back()}
            className="-mr-1 rounded-full p-1.5 transition hover:bg-white/15"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <Link to="/" className="text-lg font-extrabold tracking-tight">
            دیجی‌مال
          </Link>
        )}
        {title ? (
          <h1 className="flex-1 text-base font-bold">{title}</h1>
        ) : (
          <div className="flex-1" />
        )}
        {right ?? (
          <button className="rounded-full p-1.5 transition hover:bg-white/15" aria-label="اعلانات">
            <Bell className="h-5 w-5" />
          </button>
        )}
      </div>
      {showSearch && (
        <form onSubmit={submitSearch} className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 text-foreground shadow-card">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در دیجی‌مال..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="جستجو"
            />
          </div>
        </form>
      )}
    </header>
  );
}
