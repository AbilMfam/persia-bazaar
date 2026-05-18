import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, MOBILE_BUILD: "1" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["vite", "build"]);
run("node", ["scripts/prepare-capacitor.mjs"]);
