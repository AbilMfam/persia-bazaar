export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOpts = {
  method?: string;
  token?: string | null;
  json?: unknown;
};

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }
  let body: string | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }

  const method = opts.method ?? "GET";
  const isGet = method.toUpperCase() === "GET";
  const res = await fetch(path, {
    method,
    headers,
    body,
    /* جلوگیری از کش WebView برای دادهٔ پویا (لیست محصول بدون به‌روزرسانی تا پاک کردن اپ) */
    ...(isGet ? { cache: "no-store" as RequestCache } : {}),
  });
  const text = await res.text();

  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(text || "پاسخ نامعتبر از سرور", res.status);
  }

  if (typeof parsed !== "object" || parsed === null || !("status" in parsed)) {
    throw new ApiError("پاسخ غیرمنتظره از سرور", res.status);
  }

  const envelope = parsed as {
    status: string;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
  };

  if (envelope.status === "error") {
    throw new ApiError(envelope.message ?? "خطا در ارتباط با سرور", res.status, envelope.errors);
  }

  return envelope.data as T;
}
