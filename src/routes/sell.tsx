import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { LazyImage } from "@/components/LazyImage";
import { categories } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useProduct } from "@/hooks/useProducts";
import { auth, formatAuthError } from "@/lib/auth";
import { createProduct, encodeProductImagesForApi, updateProduct } from "@/lib/product-api";
import { productKeys } from "@/lib/product-query-keys";
import { Upload, Check, ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { z } from "zod";

const MAX_IMAGES = 8;
const MAX_SINGLE_FILE_BYTES = 2_500_000;

async function filesToDataUrls(files: Iterable<File>): Promise<string[]> {
  const out: string[] = [];
  for (const file of files) {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    out.push(dataUrl);
  }
  return out;
}

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
  const { product: editing, ready: editReady, found, isLoading: editLoading } = useProduct(edit);

  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const isEdit = Boolean(edit && editing);

  useEffect(() => {
    if (!edit) {
      setImages([]);
      setTitle("");
      setCategory("");
      setPrice("");
      setStock("1");
      setDescription("");
      return;
    }
    if (!editing) return;
    const ims =
      editing.images && editing.images.length > 0
        ? [...editing.images]
        : editing.image
          ? [editing.image]
          : [];
    setImages(ims);
    setTitle(editing.title);
    setCategory(editing.category !== "general" ? editing.category : "");
    setPrice(String(editing.price));
    setStock(String(editing.stock ?? 1));
    setDescription(editing.description);
  }, [edit, editing?.id]);

  const appendImageFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    void (async () => {
      const picked = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (!picked.length) {
        toast.error("فقط فایل تصویر انتخاب کنید");
        return;
      }
      const room = MAX_IMAGES - images.length;
      if (room <= 0) {
        toast.error(`حداکثر ${MAX_IMAGES} تصویر`);
        return;
      }
      const take = picked.slice(0, room);
      const validSized: File[] = [];
      for (const file of take) {
        if (file.size > MAX_SINGLE_FILE_BYTES) {
          toast.error(`«${file.name}» از ۲٫۵ مگابایت بزرگتر است`);
          continue;
        }
        validSized.push(file);
      }
      try {
        const urls = await filesToDataUrls(validSized);
        setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
      } catch {
        toast.error("خواندن فایل تصویر نشد");
      }
      if (fileRef.current) fileRef.current.value = "";
    })();
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
                setImages([]);
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
              if (images.length === 0) {
                toast.error("حداقل یک تصویر برای کالا انتخاب کنید");
                return;
              }
              let image_url: string | null;
              try {
                image_url = encodeProductImagesForApi(images);
              } catch (encErr) {
                toast.error(encErr instanceof Error ? encErr.message : "حجم تصاویر زیاد است");
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
                  image_url,
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
                await queryClient.invalidateQueries({
                  queryKey: productKeys.all,
                  refetchType: "all",
                });
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
            <span className="mb-1.5 block text-xs font-bold">
              تصاویر کالا (حداکثر {MAX_IMAGES})
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => appendImageFiles(e.target.files)}
            />
            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((src, idx) => (
                  <div
                    key={`${idx}-${src.slice(0, 24)}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-card"
                  >
                    <LazyImage src={src} alt="" wrapperClassName="h-full w-full" />
                    <button
                      type="button"
                      aria-label={`حذف تصویر ${idx + 1}`}
                      className="absolute left-1 top-1 rounded-full bg-background/90 p-1 shadow"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
              className="flex min-h-[7rem] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1.5 px-4">
                <Upload className="h-6 w-6" />
                <span className="text-center text-xs">
                  {images.length >= MAX_IMAGES
                    ? "سقف تعداد تصویر رسیده"
                    : "افزودن تصویر (چند فایل قابل انتخاب است)"}
                </span>
              </div>
            </button>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-primary disabled:opacity-50"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                افزودن تصویر دیگر
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
