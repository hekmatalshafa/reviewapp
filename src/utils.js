const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const DEFAULT_SETTINGS = {
  business_name: "",
  business_logo: "",
  business_description: "",
  business_phone: "",
  business_address: "",
  primary_color: "#1A5F52",
  secondary_color: "#C4A35A",
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toFa(value) {
  return String(value ?? "").replace(/\d/g, (d) => FA_DIGITS[d]);
}

export function sanitizeColor(value, fallback) {
  return /^#[0-9A-Fa-f]{6}$/.test(value || "") ? value : fallback;
}

export function sanitizeBranch(value) {
  if (!value) return "";
  const cleaned = String(value).trim().slice(0, 64);
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(cleaned) ? cleaned : "";
}

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeLink(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return /^[a-z][a-z0-9+.-]*:[^\s]+$/i.test(trimmed) &&
      !/^(javascript|data|vbscript|file):/i.test(trimmed);
  }
}

export function safeImageSrc(value) {
  if (!value) return "";
  const s = String(value);
  if (
    s.startsWith("data:image/png;base64,") ||
    s.startsWith("data:image/jpeg;base64,") ||
    s.startsWith("data:image/jpg;base64,") ||
    s.startsWith("data:image/webp;base64,") ||
    s.startsWith("data:image/gif;base64,")
  ) {
    return s;
  }
  if (s.startsWith("/") && !s.startsWith("//") && !s.includes("\\")) return s;
  return "";
}

export function clampText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export function normalizePhone(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const compact = raw.replace(/[\s\-()]/g, "");
  if (!/^\+?\d{8,15}$/.test(compact)) return null;
  return compact;
}

export function isBot(userAgent) {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram/i.test(
    userAgent || "",
  );
}

export function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function sniffImageType(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === "RIFF" && webp === "WEBP") return "image/webp";
  return null;
}

export async function fileToDataUrl(file, maxBytes = 400_000) {
  if (!file || typeof file === "string") return null;
  if (typeof file.size === "number" && file.size === 0) return null;
  if (typeof file.size === "number" && file.size > maxBytes) {
    const err = new Error("FILE_TOO_LARGE");
    err.code = "FILE_TOO_LARGE";
    throw err;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > maxBytes) {
    const err = new Error("FILE_TOO_LARGE");
    err.code = "FILE_TOO_LARGE";
    throw err;
  }
  const type = sniffImageType(bytes);
  if (!type) {
    const err = new Error("FILE_TYPE");
    err.code = "FILE_TYPE";
    throw err;
  }
  return `data:${type};base64,${bytesToBase64(bytes)}`;
}

export async function hashValue(value) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqual(a, b) {
  const left = String(a ?? "");
  const right = String(b ?? "");
  const max = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let i = 0; i < max; i++) {
    mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

export async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function newId(prefix = "platform") {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

export function formatJalali(isoLike) {
  const date = parseUtcDate(isoLike);
  if (!date) return "";
  const parts = tehranParts(date);
  const { jy, jm, jd } = toJalali(parts.year, parts.month, parts.day);
  return `${toFa(jd)} ${JALALI_MONTHS[jm - 1]} ${toFa(jy)}، ساعت ${toFa(String(parts.hour).padStart(2, "0"))}:${toFa(String(parts.minute).padStart(2, "0"))}`;
}

function parseUtcDate(isoLike) {
  if (!isoLike) return null;
  const raw = String(isoLike);
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T") + "Z";
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function tehranParts(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const map = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? 0 : map.hour),
    minute: Number(map.minute),
  };
}

export function clientIp(c) {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-real-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

export function wantsJson(c) {
  const accept = c.req.header("accept") || "";
  return accept.includes("application/json");
}
