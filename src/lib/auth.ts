import { emit, readJson, writeJson } from "./storage";
import type { User } from "./types";
import { getApiBaseUrl } from "./env";
import { apiFetch, ApiError } from "./api-client";

const TOKEN_KEY = "digi_auth_token_v1";
const USER_KEY = "digi_auth_user_v1";
export const AUTH_CHANGE = "auth:change";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    createdAt: Date.parse(u.created_at),
  };
}

export function formatAuthError(err: unknown): string {
  if (err instanceof TypeError) {
    const m = err.message.toLowerCase();
    if (m.includes("fetch") || m.includes("failed") || m.includes("network")) {
      if (import.meta.env.DEV) {
        return (
          "به API وصل نشد. پروکسی `/api` فقط با روشن بودن Laravel کار می‌کند — `npm run dev:full`، " +
          "یا دو ترمینال برای بکند و فرانت؛ فرانت را روی آدرس همان 포رتی باز کن که Vite چاپ می‌کند. " +
          "اگر مستقیم به API می‌زنی، `VITE_API_BASE_URL` را در `.env` ریشه چک کن (روی شبکهٔ محلی از IP رایانه، نه localhost)."
        );
      }
      return (
        "ارتباط با سرور برقرار نشد. اتصال اینترنت یا در دسترس بودن سرویس API را بررسی کن؛ " +
        "برای اپ نصبی، آدرس API در زمان build با `VITE_API_BASE_URL` تعیین می‌شود."
      );
    }
  }
  if (err instanceof ApiError && err.errors) {
    const first = Object.values(err.errors)[0]?.[0];
    if (first) return first;
    if (err.message.toLowerCase().includes("invalid credentials")) {
      return "ایمیل یا رمز عبور اشتباه است";
    }
  }
  if (err instanceof Error) return err.message;
  return "خطای نامشخص";
}

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return readJson<string | null>(TOKEN_KEY, null);
  },

  getSessionUserId(): string | null {
    return readJson<User | null>(USER_KEY, null)?.id ?? null;
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    return readJson<User | null>(USER_KEY, null);
  },

  async bootstrap(): Promise<void> {
    const token = this.getToken();
    if (!token) return;
    try {
      const base = getApiBaseUrl();
      const data = await apiFetch<{ user: ApiUser }>(`${base}/auth/me`, { token });
      writeJson(USER_KEY, mapUser(data.user));
      emit(AUTH_CHANGE);
    } catch {
      writeJson(TOKEN_KEY, null);
      writeJson(USER_KEY, null);
      emit(AUTH_CHANGE);
    }
  },

  async login(email: string, password: string): Promise<User> {
    const base = getApiBaseUrl();
    const data = await apiFetch<{ user: ApiUser; token: string }>(`${base}/auth/login`, {
      method: "POST",
      json: {
        email: email.trim().toLowerCase(),
        password,
        device_name:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : "digimall-web",
      },
    });
    writeJson(TOKEN_KEY, data.token);
    const user = mapUser(data.user);
    writeJson(USER_KEY, user);
    emit(AUTH_CHANGE);
    return user;
  },

  async register(input: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<User> {
    const base = getApiBaseUrl();
    const data = await apiFetch<{ user: ApiUser; token: string }>(`${base}/auth/register`, {
      method: "POST",
      json: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        password_confirmation: input.password_confirmation,
        device_name:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : "digimall-web",
      },
    });
    writeJson(TOKEN_KEY, data.token);
    const user = mapUser(data.user);
    writeJson(USER_KEY, user);
    emit(AUTH_CHANGE);
    return user;
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        const base = getApiBaseUrl();
        await apiFetch(`${base}/auth/logout`, { method: "POST", token });
      } catch {
        /* شبکه قطع است؛ پاک‌سازی محلی را انجام می‌دهیم */
      }
    }
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    emit(AUTH_CHANGE);
  },
};
