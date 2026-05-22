import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingCart, PlusSquare, LayoutDashboard, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const items = [
  { to: "/", label: "خانه", icon: Home },
  { to: "/cart", label: "سبد", icon: ShoppingCart },
  { to: "/sell", label: "افزودن", icon: PlusSquare },
  { to: "/dashboard", label: "فروشنده", icon: LayoutDashboard },
  { to: "/login", label: "حساب", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const cart = useCart();
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur shadow-nav">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {to === "/cart" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {cartCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                </span>
                <span className={active ? "font-semibold" : ""}>{label}</span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
