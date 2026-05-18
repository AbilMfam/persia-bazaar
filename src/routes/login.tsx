import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Smartphone, Lock, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "ورود — دیجی‌مال" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isLoggedIn) setName(user?.name ?? "");
  }, [isLoggedIn, user?.name]);

  if (isLoggedIn && user) {
    return (
      <div className="animate-fade-in">
        <TopBar title="حساب کاربری" back />
        <Toaster position="top-center" dir="rtl" />
        <div className="px-6 pt-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary shadow-elevated">
            <span className="text-2xl font-extrabold text-primary-foreground">
              {user.name.charAt(0)}
            </span>
          </div>
          <h1 className="text-xl font-extrabold">{user.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
            {user.phone}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            ورود محلی — داده‌ها فقط در مرورگر شما ذخیره می‌شوند
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="rounded-2xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-elevated"
            >
              داشبورد فروشنده
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success("خارج شدید");
              }}
              className="rounded-2xl border border-border py-3 text-sm font-bold text-foreground"
            >
              خروج از حساب
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TopBar title="ورود | ثبت‌نام" back />
      <Toaster position="top-center" dir="rtl" />
      <div className="px-6 pt-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary shadow-elevated">
          <span className="text-2xl font-extrabold text-primary-foreground">د</span>
        </div>
        <h1 className="text-center text-xl font-extrabold">به دیجی‌مال خوش آمدید</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "برای ورود شماره موبایل و رمز عبور را وارد کنید"
            : "برای ثبت‌نام اطلاعات خود را تکمیل کنید"}
        </p>

        <div className="mt-6 flex rounded-2xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === "login" ? "bg-card shadow-card text-primary" : "text-muted-foreground"
            }`}
          >
            ورود
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === "register" ? "bg-card shadow-card text-primary" : "text-muted-foreground"
            }`}
          >
            ثبت‌نام
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              if (mode === "register") {
                auth.register({ name, phone, password });
                toast.success("ثبت‌نام موفق");
              } else {
                auth.login(phone, password);
                toast.success("خوش آمدید");
              }
              navigate({ to: "/" });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "خطا در ورود");
            }
          }}
          className="mt-6 space-y-4"
        >
          {mode === "register" && (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <User className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="نام و نام خانوادگی"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-base font-medium outline-none"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <input
              type="password"
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              className="flex-1 bg-transparent text-base font-medium outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition active:scale-[0.98]"
          >
            {mode === "login" ? "ورود" : "ثبت‌نام"}
            <ArrowLeft className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          با ورود، <Link to="/" className="text-primary">قوانین</Link> دیجی‌مال را می‌پذیرید
        </p>
      </div>
    </div>
  );
}
