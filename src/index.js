import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import {
  createSession,
  clearSession,
  hasValidSession,
  requireAdmin,
} from "./auth.js";
import {
  getSettings,
  setSetting,
  listPlatforms,
  getPlatform,
  getPrimaryPlatform,
  savePlatform,
  deletePlatform,
  setPrimaryPlatform,
  setPlatformEnabled,
  logEvent,
  insertFeedback,
  listFeedback,
  getDashboardStats,
  rateLimit,
  ensureSchema,
} from "./db.js";
import {
  applyNonce,
} from "./templates/shell.js";
import {
  renderReviewPage,
  renderFeedbackPage,
  renderThanksPage,
  renderNoPlatformPage,
} from "./templates/review.js";
import {
  renderLogin,
  renderDashboard,
  renderBusiness,
  renderPlatforms,
  renderPlatformForm,
  renderFeedback,
} from "./templates/admin.js";
import {
  clampText,
  sanitizeBranch,
  isHttpUrl,
  isSafeLink,
  sanitizeColor,
  DEFAULT_SETTINGS,
  fileToDataUrl,
  hashValue,
  timingSafeEqual,
  clientIp,
  wantsJson,
  isBot,
  newId,
} from "./utils.js";

const app = new Hono();

app.use("*", async (c, next) => {
  if (c.env?.DB) {
    try {
      await ensureSchema(c.env.DB);
    } catch (err) {
      console.error("schema init failed", err);
    }
  }
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
});

function html(c, page, status = 200) {
  const nonce = crypto.randomUUID();
  c.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  );
  c.header("Cache-Control", "no-store");
  return c.html(applyNonce(page, nonce), status);
}

function headerHost(c) {
  const forwarded = c.req.header("x-forwarded-host");
  const host = forwarded || c.req.header("host") || new URL(c.req.url).host;
  return String(host).split(",")[0].trim();
}

function publicOrigin(c) {
  const proto = (
    c.req.header("x-forwarded-proto") ||
    new URL(c.req.url).protocol.replace(":", "") ||
    "http"
  )
    .split(",")[0]
    .trim()
    .replace(/:$/, "");
  return `${proto}://${headerHost(c)}`;
}

function hostMatches(c, candidateHost) {
  const incoming = headerHost(c);
  const requestHost = new URL(c.req.url).host;
  const names = new Set(
    [incoming, requestHost, incoming.split(":")[0], requestHost.split(":")[0]].filter(Boolean),
  );
  const host = String(candidateHost || "");
  return names.has(host) || names.has(host.split(":")[0]);
}

function isSameOrigin(c) {
  const origin = c.req.header("origin");
  const referer = c.req.header("referer");
  const check = origin || referer;
  if (!check) return true;
  try {
    return hostMatches(c, new URL(check).host);
  } catch {
    return false;
  }
}

async function hashedIp(c) {
  const secret = c.env.SESSION_SECRET || "ip";
  return (await hashValue(`${clientIp(c)}:${secret}`)).slice(0, 24);
}

function setFlash(c, message) {
  setCookie(c, "flash", message, {
    path: "/admin",
    maxAge: 20,
    httpOnly: true,
    sameSite: "Lax",
  });
}

function popFlash(c) {
  const raw = getCookie(c, "flash") || "";
  if (raw) deleteCookie(c, "flash", { path: "/admin" });
  return raw;
}

function redirectTo(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    /* ignore */
  }
  return null;
}

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));

async function serveReview(c) {
  const settings = await getSettings(c.env.DB);
  const branch = sanitizeBranch(c.req.query("branch") || "");
  const platform = await getPrimaryPlatform(c.env.DB);
  if (!isBot(c.req.header("user-agent"))) {
    try {
      await logEvent(c.env.DB, { type: "page_opened", branch });
    } catch {
      /* analytics must never block the funnel */
    }
  }
  return html(
    c,
    renderReviewPage({
      settings,
      branch,
      redirectUrl: platform?.review_url || FALLBACK_REVIEW_URL,
    }),
  );
}

app.get("/", serveReview);
app.get("/review", serveReview);

app.post("/review/rate", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const body = await c.req.parseBody();
  const rating = Number(body.rating);
  const branch = sanitizeBranch(body.branch || c.req.query("branch") || "");
  const settings = await getSettings(c.env.DB);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.redirect("/review", 303);
  }

  await logEvent(c.env.DB, { type: "rating_selected", rating, branch });

  if (rating >= 4) {
    const platform = await getPrimaryPlatform(c.env.DB);
    const url = redirectTo(platform?.review_url || FALLBACK_REVIEW_URL);
    if (!url) return html(c, renderNoPlatformPage(settings));
    await logEvent(c.env.DB, {
      type: "review_redirect",
      rating,
      branch,
      platform_id: platform.id,
    });
    return c.redirect(url, 302);
  }

  const params = new URLSearchParams({ rating: String(rating) });
  if (branch) params.set("branch", branch);
  return c.redirect(`/review/feedback?${params.toString()}`, 303);
});

app.get("/review/feedback", async (c) => {
  const rating = Number(c.req.query("rating"));
  const branch = sanitizeBranch(c.req.query("branch") || "");
  const settings = await getSettings(c.env.DB);
  if (!Number.isInteger(rating) || rating < 1 || rating > 3) {
    return c.redirect("/review", 303);
  }
  return html(c, renderFeedbackPage({ settings, branch, rating }));
});

app.post("/review/feedback", async (c) => {
  if (!isSameOrigin(c)) {
    if (wantsJson(c)) return c.json({ ok: false, error: "forbidden" }, 403);
    return c.text("درخواست نامعتبر است.", 403);
  }

  const body = await c.req.parseBody();
  const settings = await getSettings(c.env.DB);
  const branch = sanitizeBranch(body.branch || "");
  const rating = Number(body.rating);
  const honeypot = String(body.website || "").trim();
  const json = wantsJson(c);

  const fail = (message, status = 400) => {
    if (json) return c.json({ ok: false, error: message }, status);
    const safeRating = Number.isInteger(rating) && rating >= 1 && rating <= 3 ? rating : 3;
    return html(c, renderFeedbackPage({ settings, branch, rating: safeRating, error: message }), status);
  };

  if (honeypot) {
    if (json) return c.json({ ok: true });
    return c.redirect("/review/thanks", 303);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 3) {
    return fail("امتیاز نامعتبر است.");
  }

  const comment = clampText(body.comment, 2000);
  if (comment.length < 3) {
    return fail("لطفاً توضیحات را بنویسید.");
  }

  const name = clampText(body.name, 80);

  const ipKey = await hashedIp(c);
  const limit = await rateLimit(c.env.DB, `fb:${ipKey}`, 5, 3600);
  if (!limit.ok) {
    return fail("تعداد درخواست‌ها بیش از حد است. کمی بعد دوباره تلاش کنید.", 429);
  }

  await insertFeedback(c.env.DB, { rating, comment, name, phone: "", branch });
  await logEvent(c.env.DB, { type: "feedback_submitted", rating, branch });

  if (json) return c.json({ ok: true });
  return c.redirect("/review/thanks", 303);
});

app.get("/review/thanks", async (c) => {
  const settings = await getSettings(c.env.DB);
  return html(c, renderThanksPage(settings));
});

app.post("/api/events", async (c) => {
  if (!isSameOrigin(c)) return c.json({ ok: false }, 403);
  let payload = {};
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ ok: false }, 400);
  }

  const type = String(payload.type || "");
  if (type !== "rating_selected" && type !== "review_redirect") {
    return c.json({ ok: false }, 400);
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ ok: false }, 400);
  }
  if (type === "review_redirect" && rating < 4) {
    return c.json({ ok: false }, 400);
  }
  if (type === "rating_selected" && rating <= 3) {
    /* low ratings stay on-site; still recorded */
  }

  const branch = sanitizeBranch(payload.branch || "");
  const ipKey = await hashedIp(c);
  const limit = await rateLimit(c.env.DB, `ev:${ipKey}`, 40, 600);
  if (!limit.ok) return c.json({ ok: true });

  let platform_id = null;
  if (type === "review_redirect") {
    const platform = await getPrimaryPlatform(c.env.DB);
    platform_id = platform?.id || null;
  }

  await logEvent(c.env.DB, { type, rating, branch, platform_id });
  return c.json({ ok: true });
});

app.get("/admin/login", async (c) => {
  if (await hasValidSession(c)) return c.redirect("/admin", 303);
  const settings = await getSettings(c.env.DB);
  return html(c, renderLogin({ settings }));
});

app.post("/admin/login", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const settings = await getSettings(c.env.DB);
  const ipKey = await hashedIp(c);
  const limit = await rateLimit(c.env.DB, `login:${ipKey}`, 8, 900);
  if (!limit.ok) {
    return html(
      c,
      renderLogin({ settings, error: "تعداد تلاش بیش از حد مجاز است. کمی بعد دوباره تلاش کنید." }),
      429,
    );
  }

  const body = await c.req.parseBody();
  const password = String(body.password || "");
  const expected = c.env.ADMIN_PASSWORD || "";
  if (!expected || !timingSafeEqual(password, expected)) {
    return html(c, renderLogin({ settings, error: "رمز عبور نادرست است." }), 401);
  }

  await createSession(c);
  return c.redirect("/admin", 303);
});

app.post("/admin/logout", async (c) => {
  clearSession(c);
  return c.redirect("/admin/login", 303);
});

app.use("/admin/*", requireAdmin);
app.use("/admin", requireAdmin);

app.get("/admin", async (c) => {
  const settings = await getSettings(c.env.DB);
  const stats = await getDashboardStats(c.env.DB);
  const origin = publicOrigin(c);
  return html(c, renderDashboard({ settings, stats, origin, flash: popFlash(c) }));
});

app.post("/admin/stats/reset", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const body = await c.req.parseBody();
  if (body.confirm !== "reset") return c.text("تأیید ریست آمار لازم است.", 400);
  await c.env.DB.prepare("DELETE FROM events").run();
  setFlash(c, "آمار صفر شد. بازخوردهای مشتریان و تنظیمات حفظ شدند.");
  return c.redirect("/admin", 303);
});

app.get("/admin/business", async (c) => {
  const settings = await getSettings(c.env.DB);
  return html(c, renderBusiness({ settings, flash: popFlash(c) }));
});

app.post("/admin/business", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const settings = await getSettings(c.env.DB);
  const body = await c.req.parseBody();

  const websiteInput = String(body.website_url || "").trim();
  const instagramInput = String(body.instagram_url || "").trim();
  if ((websiteInput && !isHttpUrl(websiteInput)) || (instagramInput && !isHttpUrl(instagramInput))) {
    return html(c, renderBusiness({
      settings: { ...settings, business_name: clampText(body.business_name,80), business_description: clampText(body.business_description,400), business_phone: clampText(body.business_phone,30), business_address: clampText(body.business_address,200), website_url: websiteInput, instagram_url: instagramInput },
      error: "لینک وب‌سایت و اینستاگرام باید با https:// یا http:// شروع شود.",
    }), 400);
  }
  try {
    await setSetting(c.env.DB, "business_name", clampText(body.business_name, 80));
    await setSetting(c.env.DB, "business_description", clampText(body.business_description, 400));
    await setSetting(c.env.DB, "business_phone", clampText(body.business_phone, 30));
    await setSetting(c.env.DB, "business_address", clampText(body.business_address, 200));
    const website = String(body.website_url || "").trim();
    const instagram = String(body.instagram_url || "").trim();
    await setSetting(c.env.DB, "website_url", !website || isHttpUrl(website) ? website : settings.website_url || "");
    await setSetting(
      c.env.DB,
      "instagram_url",
      !instagram || isHttpUrl(instagram) ? instagram : settings.instagram_url || "",
    );
    setFlash(c, "اطلاعات کسب‌وکار ذخیره شد.");
    return c.redirect("/admin/business", 303);
  } catch (err) {
    const message =
      err.code === "FILE_TOO_LARGE"
        ? "حجم تصویر بیش از حد مجاز است (حداکثر ۴۰۰ کیلوبایت)."
        : err.code === "FILE_TYPE"
          ? "فقط تصویر PNG، JPEG، WEBP یا GIF پذیرفته می‌شود."
          : "ذخیره اطلاعات ممکن نشد.";
    return html(c, renderBusiness({ settings, error: message }), 400);
  }
});

app.get("/admin/platforms", async (c) => {
  const settings = await getSettings(c.env.DB);
  const platforms = await listPlatforms(c.env.DB);
  return html(c, renderPlatforms({ settings, platforms, flash: popFlash(c) }));
});

app.post("/admin/platforms/primary", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const body = await c.req.parseBody();
  const ok = await setPrimaryPlatform(c.env.DB, String(body.id || ""));
  setFlash(c, ok ? "پلتفرم اصلی به‌روز شد." : "پلتفرم پیدا نشد.");
  return c.redirect("/admin/platforms", 303);
});

app.get("/admin/platforms/new", async (c) => {
  const settings = await getSettings(c.env.DB);
  return html(
    c,
    renderPlatformForm({
      settings,
      isNew: true,
      platform: { enabled: 1, is_primary: 0 },
    }),
  );
});

async function readPlatformForm(body, existing) {
  const name = clampText(body.name, 80);
  const review_url = String(body.review_url || "").trim();
  const deep_link = String(body.deep_link || "").trim();
  const web_fallback = String(body.web_fallback || "").trim();

  if (!name) throw Object.assign(new Error("نام پلتفرم را وارد کنید."), { code: "FORM" });
  if (!isHttpUrl(review_url)) {
    throw Object.assign(new Error("لینک ثبت نظر باید یک نشانی http یا https معتبر باشد."), {
      code: "FORM",
    });
  }
  if (deep_link && !isSafeLink(deep_link)) {
    throw Object.assign(new Error("لینک اپ / دیپ‌لینک نامعتبر است."), { code: "FORM" });
  }
  if (web_fallback && !isHttpUrl(web_fallback)) {
    throw Object.assign(new Error("لینک جایگزین وب نامعتبر است."), { code: "FORM" });
  }

  let icon = existing?.icon || "";
  if (body.remove_icon) icon = "";
  if (body.icon) {
    const uploaded = await fileToDataUrl(body.icon);
    if (uploaded) icon = uploaded;
  }

  return {
    id: existing?.id || newId("platform"),
    name,
    review_url,
    deep_link,
    web_fallback,
    icon,
    enabled: body.is_primary || body.enabled ? 1 : 0,
    is_primary: body.is_primary ? 1 : 0,
  };
}

app.post("/admin/platforms/new", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const settings = await getSettings(c.env.DB);
  const body = await c.req.parseBody();
  try {
    const platform = await readPlatformForm(body, null);
    await savePlatform(c.env.DB, platform);
    setFlash(c, "پلتفرم اضافه شد.");
    return c.redirect("/admin/platforms", 303);
  } catch (err) {
    const message =
      err.code === "FILE_TOO_LARGE"
        ? "حجم تصویر بیش از حد مجاز است (حداکثر ۴۰۰ کیلوبایت)."
        : err.code === "FILE_TYPE"
          ? "فقط تصویر PNG، JPEG، WEBP یا GIF پذیرفته می‌شود."
          : err.message || "ذخیره پلتفرم ممکن نشد.";
    return html(
      c,
      renderPlatformForm({
        settings,
        isNew: true,
        error: message,
        platform: {
          name: body.name,
          review_url: body.review_url,
          deep_link: body.deep_link,
          web_fallback: body.web_fallback,
          enabled: body.enabled ? 1 : 0,
          is_primary: body.is_primary ? 1 : 0,
        },
      }),
      400,
    );
  }
});

app.get("/admin/platforms/:id", async (c) => {
  const settings = await getSettings(c.env.DB);
  const platform = await getPlatform(c.env.DB, c.req.param("id"));
  if (!platform) return c.redirect("/admin/platforms", 303);
  return html(
    c,
    renderPlatformForm({ settings, isNew: false, platform, flash: popFlash(c) }),
  );
});

app.post("/admin/platforms/:id", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const settings = await getSettings(c.env.DB);
  const existing = await getPlatform(c.env.DB, c.req.param("id"));
  if (!existing) return c.redirect("/admin/platforms", 303);
  const body = await c.req.parseBody();
  try {
    const platform = await readPlatformForm(body, existing);
    await savePlatform(c.env.DB, platform);
    setFlash(c, "پلتفرم ذخیره شد.");
    return c.redirect("/admin/platforms", 303);
  } catch (err) {
    const message =
      err.code === "FILE_TOO_LARGE"
        ? "حجم تصویر بیش از حد مجاز است (حداکثر ۴۰۰ کیلوبایت)."
        : err.code === "FILE_TYPE"
          ? "فقط تصویر PNG، JPEG، WEBP یا GIF پذیرفته می‌شود."
          : err.message || "ذخیره پلتفرم ممکن نشد.";
    return html(
      c,
      renderPlatformForm({
        settings,
        isNew: false,
        error: message,
        platform: { ...existing, ...body },
      }),
      400,
    );
  }
});

app.post("/admin/platforms/:id/toggle", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  const platform = await getPlatform(c.env.DB, c.req.param("id"));
  if (platform) {
    await setPlatformEnabled(c.env.DB, platform.id, Number(platform.enabled) !== 1);
    setFlash(c, "وضعیت پلتفرم به‌روز شد.");
  }
  return c.redirect("/admin/platforms", 303);
});

app.post("/admin/platforms/:id/delete", async (c) => {
  if (!isSameOrigin(c)) return c.text("درخواست نامعتبر است.", 403);
  await deletePlatform(c.env.DB, c.req.param("id"));
  setFlash(c, "پلتفرم حذف شد.");
  return c.redirect("/admin/platforms", 303);
});

app.get("/admin/feedback", async (c) => {
  const settings = await getSettings(c.env.DB);
  const items = await listFeedback(c.env.DB, 200);
  return html(c, renderFeedback({ settings, items, flash: popFlash(c) }));
});

app.notFound(async (c) => {
  const body = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>صفحه پیدا نشد</title>
<style>@font-face{font-family:Vazirmatn;src:url("/fonts/Vazirmatn-Variable.woff2") format("woff2");font-weight:100 900;font-display:swap}body{font-family:Vazirmatn,Tahoma,sans-serif;background:#000;color:#fff;display:grid;place-items:center;min-height:100dvh;margin:0;text-align:center;line-height:1.8}a{color:#04A0B6}</style>
</head><body><main><h1>این صفحه پیدا نشد.</h1><p><a href="/review">بازگشت به ثبت نظر</a></p></main></body></html>`;
  return c.html(body, 404);
});

app.onError((err, c) => {
  console.error(err);
  const body = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>خطا</title>
<style>@font-face{font-family:Vazirmatn;src:url("/fonts/Vazirmatn-Variable.woff2") format("woff2");font-weight:100 900;font-display:swap}body{font-family:Vazirmatn,Tahoma,sans-serif;background:#000;color:#fff;display:grid;place-items:center;min-height:100dvh;margin:0;text-align:center;line-height:1.8}</style>
</head><body><main><h1>مشکلی پیش آمد.</h1><p>کمی بعد دوباره تلاش کنید.</p></main></body></html>`;
  return c.html(body, 500);
});

export default app;
