import { createId } from "./ids";
import { emit, readJson, writeJson } from "./storage";
import type { User } from "./types";

const USERS_KEY = "digi_users_v1";
const SESSION_KEY = "digi_session_v1";
export const AUTH_CHANGE = "auth:change";

function readUsers(): User[] {
  return readJson<User[]>(USERS_KEY, []);
}

function writeUsers(users: User[]): void {
  writeJson(USERS_KEY, users);
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^98/, "0");
}

export const auth = {
  init() {
    return;
  },

  getSessionUserId(): string | null {
    return readJson<{ userId: string } | null>(SESSION_KEY, null)?.userId ?? null;
  },

  getCurrentUser(): User | null {
    const id = this.getSessionUserId();
    if (!id) return null;
    return readUsers().find((u) => u.id === id) ?? null;
  },

  register(input: { name: string; phone: string; password: string }): User {
    const phone = normalizePhone(input.phone);
    const users = readUsers();
    if (users.some((u) => u.phone === phone)) {
      throw new Error("این شماره قبلاً ثبت شده است");
    }
    const user: User = {
      id: createId("u"),
      name: input.name.trim(),
      phone,
      password: input.password,
      createdAt: Date.now(),
    };
    users.push(user);
    writeUsers(users);
    writeJson(SESSION_KEY, { userId: user.id });
    emit(AUTH_CHANGE);
    return user;
  },

  login(phone: string, password: string): User {
    const normalized = normalizePhone(phone);
    const user = readUsers().find(
      (u) => u.phone === normalized && u.password === password,
    );
    if (!user) throw new Error("شماره یا رمز عبور اشتباه است");
    writeJson(SESSION_KEY, { userId: user.id });
    emit(AUTH_CHANGE);
    return user;
  },

  loginOrRegister(phone: string, password: string, name?: string): User {
    const normalized = normalizePhone(phone);
    const existing = readUsers().find((u) => u.phone === normalized);
    if (existing) return this.login(phone, password);
    if (!name?.trim()) throw new Error("برای ثبت‌نام نام خود را وارد کنید");
    return this.register({ name, phone, password });
  },

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
    emit(AUTH_CHANGE);
  },
};
