#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(args, options = {}) {
  const result = spawnSync("npx", ["wrangler", ...args], {
    stdio: "inherit",
    env: process.env,
    ...options,
  });
  return result.status ?? 1;
}

function whoami() {
  const result = spawnSync("npx", ["wrangler", "whoami"], {
    encoding: "utf8",
    env: process.env,
  });
  return {
    ok: result.status === 0,
    out: `${result.stdout || ""}${result.stderr || ""}`,
  };
}

const identity = whoami();
if (!identity.ok) {
  console.error(`
استقرار روی Cloudflare انجام نشد — هنوز وارد حساب نشده‌اید.

۱. در ترمینال خودتان اجرا کنید:
   npx wrangler login

۲. مرورگر باز می‌شود؛ به Cloudflare وارد شوید و دسترسی را تأیید کنید.

۳. بعد دوباره:
   npm run deploy

اگر در GitHub Actions هستید، این Secretها را بگذارید:
   CLOUDFLARE_API_TOKEN
   CLOUDFLARE_ACCOUNT_ID
`);
  process.exit(1);
}

console.log("در حال استقرار Worker و ساخت پایگاه D1 در صورت نیاز…");
const deployStatus = run(["deploy"]);
if (deployStatus !== 0) process.exit(deployStatus);

console.log("در حال اعمال مهاجرت پایگاه داده…");
const migrateStatus = run(["d1", "migrations", "apply", "reviewapp", "--remote"]);
if (migrateStatus !== 0) process.exit(migrateStatus);

console.log(`
انجام شد.

صفحه مشتری:  https://reviewapp.<ACCOUNT>.workers.dev/review
پنل مدیریت:  https://reviewapp.<ACCOUNT>.workers.dev/admin
رمز پیش‌فرض: admin123

حتماً بعد از ورود، رمز و SESSION_SECRET را عوض کنید:
  npx wrangler secret put ADMIN_PASSWORD
  npx wrangler secret put SESSION_SECRET
`);
