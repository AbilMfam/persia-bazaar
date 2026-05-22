import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { LazyImage } from "@/components/LazyImage";
import { categories } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useProduct } from "@/hooks/useProducts";
import { auth, formatAuthError } from "@/lib/auth";
import { createProduct, updateProduct } from "@/lib/product-api";
import { productKeys } from "@/lib/product-query-keys";
import { Upload, Check, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { z } from "zod";

const sellSearchSchema = z.object({
  edit: z.string().optional(),
});

export const Route = createFileRoute("/sell")({
  validateSearch: sellSearchSchema,
  component: SellPage,
  head: () => ({ meta: [{ title: "افزودن کالا — دیجی‌مال" }] }),
});

function SellPage() {
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, ready: authReady, isLoggedIn } = useAuth();
  const {
    product: editing,
    ready: editReady,
    found,
    isLoading: editLoading,
  } = useProduct(edit);

  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const isEdit = Boolean(edit && editing);

  useEffect(() => {
    if (!editing) return;
    setImage(editing.image);
    setTitle(editing.title);
    setCategory(editing.category !== "general" ? editing.category : "");
    setPrice(String(editing.price));
    setStock(String(editing.stock ?? 1));
    setDescription(editing.description);
  }, [editing?.id]);

  const onImageFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_500_000) {
      toast.error("حجم تصویر باید کمتر از ۲.۵ مگابایت باشد");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in pb-8">
        <TopBar title="افزودن کالای جدید" back />
        <div className="px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">برای فروش کالا ابتدا وارد حساب شوید</p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            ورود / ثبت‌نام
          </Link>
        </div>
      </div>
    );
  }

  if (edit && editLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (edit && editReady && !found) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">کالا یافت نشد</p>
        <Link to="/dashboard" className="mt-3 inline-block font-bold text-primary">
          بازگشت به داشبورد
        </Link>
      </div>
    );
  }

  if (editing && editing.sellerId !== user?.id) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        فقط صاحب کالا می‌تواند آن را ویرایش کند
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <Toaster position="top-center" dir="rtl" />
      <TopBar title={isEdit ? "ویرایش کالا" : "افزودن کالای جدید"} back />

      {submitted ? (
        <div className="flex flex-col items-center px-8 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h2 className="mt-4 text-lg font-bold">
            {isEdit ? "کالا با موفقیت به‌روز شد" : "کالا با موفقیت ثبت شد"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            کالا در فهرست سرور ذخیره شد و در فروشگاه نمایش داده می‌شود.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setImage("");
                setTitle("");
                setCategory("");
                setPrice("");
                setStock("1");
                setDescription("");
                navigate({ to: "/sell", search: {} });
              }}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold"
            >
              ثبت کالای دیگر
            </button>
            <Link
              to="/dashboard"
              className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-elevated"
            >
              داشبورد
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              if (!image) {
                toast.error("تصویر کالا را انتخاب کنید");
                return;
              }
              const desc = description.trim();
              if (desc.length < 10) {
                toast.error("توضیحات باید حداقل ۱۰ کاراکتر باشد");
                return;
              }
              const priceNum = Number(price);
              if (!Number.isFinite(priceNum) || priceNum < 0) {
                toast.error("قیمت نامعتبر است");
                return;
              }
              const token = auth.getToken();
              if (!token || !user) {
                toast.error("ابتدا وارد شوید");
                return;
              }

              setSubmitting(true);
              try {
                const catTrim = category.trim();
                const payloadBase = {
                  title: title.trim(),
                  description: desc,
                  price: Math.round(priceNum),
                  image_url: image || null,
                  ...(catTrim ? { category: catTrim } : {}),
                };

                if (isEdit && editing) {
                  await updateProduct(token, editing.id, {
                    title: payloadBase.title,
                    description: payloadBase.description,
                    category: catTrim === "" ? null : catTrim,
                    price: payloadBase.price,
                    image_url: payloadBase.image_url,
                  });
                  toast.success("کالا به‌روز شد");
                } else {
                  await createProduct(token, payloadBase);
                  toast.success("کالا ثبت شد");
                }
                await queryClient.invalidateQueries({ queryKey: productKeys.all });
                setSubmitted(true);
              } catch (err) {
                toast.error(formatAuthError(err));
              } finally {
                setSubmitting(false);
              }
            })();
          }}
          className="space-y-4 p-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold">تصویر کالا</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              {image ? (
                <LazyImage src={image} alt="پیش‌نمایش" wrapperClassName="h-full w-full" />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">انتخاب یا بکشید و رها کنید</span>
                </div>
              )}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-primary"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                تغییر تصویر
              </button>
            )}
          </label>

          <Field label="عنوان کالا">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً گوشی سامسونگ A54"
              className="input-field"
            />
          </Field>

          <Field label="دسته‌بندی">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="">عمومی (بدون دسته)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="قیمت (تومان)">
              <input
                required
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="۰"
                className="input-field"
              />
            </Field>
            <Field label="موجودی (نمایشی)">
              <input
                required
                type="number"
                min={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="۰"
                className="input-field"
              />
            </Field>
          </div>

          <Field label="توضیحات">
            <textarea
              required
              rows={4}
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="حداقل ۱۰ کاراکتر — ویژگی‌ها و مشخصات کالا..."
              className="input-field resize-none"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-elevated transition active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت کالا"}
          </button>
        </form>
      )}

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 14px;
          border: 1px solid var(--color-border);
          background: var(--color-card);
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          transition: all .15s;
          box-shadow: var(--shadow-card);
        }
        .input-field:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px oklch(0.58 0.22 25 / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}
