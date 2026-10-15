import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { hmacHex, timingSafeEqual } from "./utils.js";

const COOKIE = "admin_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function b64url(value) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return atob(padded);
}

export async function createSession(c) {
  const secret = c.env.SESSION_SECRET;
  const payload = b64url(JSON.stringify({ v: 1, exp: Date.now() + TTL_MS }));
  const sig = await hmacHex(secret, payload);
  const secure = new URL(c.req.url).protocol === "https:";
  setCookie(c, COOKIE, `${payload}.${sig}`, {
    httpOnly: true,
    sameSite: "Lax",
    secure,
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export function clearSession(c) {
  deleteCookie(c, COOKIE, { path: "/" });
}

export async function hasValidSession(c) {
  const secret = c.env.SESSION_SECRET;
  const token = getCookie(c, COOKIE);
  if (!secret || !token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacHex(secret, payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const data = JSON.parse(fromB64url(payload));
    return data.v === 1 && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin(c, next) {
  const path = new URL(c.req.url).pathname;
  if (path === "/admin/login") return next();
  if (await hasValidSession(c)) return next();
  if (path.startsWith("/api/")) {
    return c.json({ ok: false, error: "unauthorized" }, 401);
  }
  return c.redirect("/admin/login", 303);
}
