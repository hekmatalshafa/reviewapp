import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import worker from "./index.js";
import { createD1 } from "./sqlite-d1.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const dataDir = join(root, "data");
const dbPath = join(dataDir, "reviewapp.sqlite");
const schemaPath = join(root, "migrations", "0001_init.sql");

function loadDevVars() {
  const file = join(root, ".dev.vars");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDevVars();
mkdirSync(dataDir, { recursive: true });

const sqlite = new DatabaseSync(dbPath);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");
const migrated = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'")
  .get();
if (!migrated) {
  sqlite.exec(readFileSync(schemaPath, "utf8"));
}

const env = {
  DB: createD1(sqlite),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
  SESSION_SECRET: process.env.SESSION_SECRET || "local-dev-session-secret-not-for-production",
};

const MIME = {
  ".woff2": "font/woff2",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function safePublicFile(pathname) {
  const decoded = decodeURIComponent(pathname.split("?")[0]);
  if (decoded.includes("\0")) return null;
  const relative = decoded.replace(/^\/+/, "");
  if (!relative || relative.startsWith("_")) return null;
  const resolved = resolve(publicDir, relative);
  if (resolved !== publicDir && !resolved.startsWith(publicDir + "/")) return null;
  if (!existsSync(resolved) || !statSync(resolved).isFile()) return null;
  return resolved;
}

const app = new Hono();
app.use("*", async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") return next();
  const file = safePublicFile(new URL(c.req.url).pathname);
  if (!file) return next();
  const body = await readFile(file);
  const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  const cache =
    extname(file).toLowerCase() === ".woff2"
      ? "public, max-age=31536000, immutable"
      : "public, max-age=300";
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": cache,
    },
  });
});
app.route("/", worker);

const port = Number(process.env.PORT || 8787);
const hostname = "0.0.0.0";

serve(
  {
    fetch: (request) => app.fetch(request, env),
    port,
    hostname,
  },
  (info) => {
    console.log(`Review app ready on http://${info.address}:${info.port}`);
  },
);
