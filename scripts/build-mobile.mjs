import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadMergedEnvForProductionBuild } from "./merge-vite-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const skipEnvCheck =
  process.env.MOBILE_BUILD_SKIP_VITE_ENV_CHECK === "1" ||
  process.env.MOBILE_BUILD_SKIP_VITE_ENV_CHECK === "true";

const mergedEnv = skipEnvCheck ? process.env : loadMergedEnvForProductionBuild(root);

function ensureMobileApiEnv() {
  if (skipEnvCheck) return;
  const api = (mergedEnv.VITE_API_BASE_URL ?? "").trim().replace(/^["']|["']$/g, "");
  if (api && !/^https:\/\//i.test(api)) {
    console.warn(
      "[build-mobile] Capacitor اندروید cleartext غیرفعال است؛ برای API واقعی پیشنهاد می‌شود VITE_API_BASE_URL با https:// شروع شود.",
    );
  }
  if (!api) {
    console.error(
      [
        "[build-mobile] VITE_API_BASE_URL یافت نشد.",
        "یکی از کارها:",
        `  • فایلی مثل ".env.production" در ریشهٔ مخزن بگذارید؛ مثلاً:`,
        "      VITE_API_BASE_URL=https://diigiimall.ir/api",
        "  • یا پیش از اجرا در این شل (ویندوز):",
        "      set VITE_API_BASE_URL=https://diigiimall.ir/api",
        "توضیح: این متغیر باید سر زمان vite build ست باشد؛ اسکریپت همان‌ها را با اولویت شل برای فرزند vite کپی می‌کند.",
        "برای غیرفعال کردن این بررسی: MOBILE_BUILD_SKIP_VITE_ENV_CHECK=1",
      ].join("\n"),
    );
    process.exit(1);
  }
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

ensureMobileApiEnv();

const procEnv = { ...mergedEnv, MOBILE_BUILD: "1" };

run("npx", ["vite", "build"], procEnv);
run("node", ["scripts/prepare-capacitor.mjs"], procEnv);
