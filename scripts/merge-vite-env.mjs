/**
 * ادغام سادهٔ فایل‌های .env مطابق زنجیرٔ معمول Vite برای `vite build`:
 * هر فایل بعدی روی قبلی بازنویسی می‌کند؛ در نهایت متغیرهای محیطیِ پروسس Node بر همهٔ فایل‌ها اولویت دارد (مثل خود Vite).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** کم‌اولویت → زیاداولویت (فقط داخل همین ادغام). */
export const PRODUCTION_DOTENV_CHAIN = /** @type {const} */ [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

/**
 * @param {string} content
 */
function parseDotenv(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();

    const q = val[0];
    if ((q === '"' && val.endsWith('"')) || (q === "'" && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\([\\"'])/g, "$1");
    } else if (val.includes("#")) {
      val = val.split("#")[0].trim();
    }
    out[key] = val.trim();
  }
  return out;
}

/**
 * @param {string} root
 */
export function loadMergedEnvForProductionBuild(root) {
  /** @type {Record<string, string>} */
  let fromFiles = {};
  for (const name of PRODUCTION_DOTENV_CHAIN) {
    const fp = path.join(root, name);
    if (!existsSync(fp)) continue;
    const parsed = parseDotenv(readFileSync(fp, "utf8"));
    fromFiles = { ...fromFiles, ...parsed };
  }
  return { ...fromFiles, ...process.env };
}
