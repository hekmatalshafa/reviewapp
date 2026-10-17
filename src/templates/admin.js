import {
  escapeHtml,
  safeImageSrc,
  toFa,
  formatJalali,
  sanitizeColor,
  DEFAULT_SETTINGS,
} from "../utils.js";
import { documentPage, STAR_SVG } from "./shell.js";

const ADMIN_SCRIPT = `
(function(){
  var toggle=document.querySelector("[data-nav-toggle]");
  var sidebar=document.querySelector(".sidebar");
  var backdrop=document.querySelector(".backdrop");
  function close(){document.body.classList.remove("nav-open");if(toggle)toggle.setAttribute("aria-expanded","false");}
  function open(){document.body.classList.add("nav-open");if(toggle)toggle.setAttribute("aria-expanded","true");}
  if(toggle){toggle.addEventListener("click",function(){document.body.classList.contains("nav-open")?close():open();});}
  if(backdrop){backdrop.addEventListener("click",close);}
  document.querySelectorAll("[data-confirm]").forEach(function(el){
    el.addEventListener("submit",function(e){
      if(!confirm(el.getAttribute("data-confirm"))) e.preventDefault();
    });
  });
  document.querySelectorAll("input[type=file][data-preview]").forEach(function(input){
    input.addEventListener("change",function(){
      var target=document.getElementById(input.getAttribute("data-preview"));
      if(!target||!input.files||!input.files[0])return;
      var url=URL.createObjectURL(input.files[0]);
      target.innerHTML='<img src="'+url+'" alt="پیش‌نمایش">';
    });
  });
})();
`;

function navIcon(name) {
  const icons = {
    dash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h7v9H4V4zm9 0h7v5h-7V4zM4 15h7v5H4v-5zm9-4h7v9h-7v-9z"/></svg>`,
    biz: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 20V8l8-4 8 4v12h-6v-6H10v6H4z"/></svg>`,
    plat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10a2 2 0 0 1 2 2v14l-7-3-7 3V5a2 2 0 0 1 2-2z"/></svg>`,
    fb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16v10H7l-3 3V5z"/></svg>`,
  };
  return icons[name] || "";
}

function adminLayout({ title, active, settings, flash, content }) {
  const name = (settings.business_name || "").trim() || "پنل مدیریت";
  const logo = safeImageSrc(settings.business_logo);
  const items = [
    { id: "dashboard", href: "/admin", label: "داشبورد", icon: "dash" },
    { id: "business", href: "/admin/business", label: "اطلاعات کسب‌وکار", icon: "biz" },
    { id: "platforms", href: "/admin/platforms", label: "پلتفرم‌های ثبت نظر", icon: "plat" },
    { id: "feedback", href: "/admin/feedback", label: "بازخوردها", icon: "fb" },
  ];

  const body = `
<div class="backdrop"></div>
<aside class="sidebar">
  <div class="side-brand">
    ${logo ? `<img src="${escapeHtml(logo)}" alt="">` : `<span class="mark">${STAR_SVG}</span>`}
    <div>
      <strong>${escapeHtml(name)}</strong>
      <span>پنل مدیریت</span>
    </div>
  </div>
  <nav>
    ${items
      .map(
        (item) =>
          `<a href="${item.href}" class="${item.id === active ? "is-active" : ""}">${navIcon(item.icon)}<span>${item.label}</span></a>`,
      )
      .join("")}
  </nav>
  <form class="logout" method="post" action="/admin/logout">
    <button type="submit">خروج</button>
  </form>
</aside>
<div class="wrap">
  <header class="top">
    <button class="menu" type="button" data-nav-toggle aria-expanded="false" aria-label="باز کردن منو">
      <span></span><span></span><span></span>
    </button>
    <h1>${escapeHtml(title)}</h1>
    <a class="ghost" href="/review" target="_blank" rel="noopener">مشاهده صفحه نظر</a>
  </header>
  <div class="content">
    ${flash ? `<div class="flash" role="status">${escapeHtml(flash)}</div>` : ""}
    ${content}
  </div>
</div>`;

  return documentPage({
    title: `${title} | پنل مدیریت`,
    themeColor: sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color),
    extraHead: `<link rel="stylesheet" href="/admin.css">`,
    css: "",
    body,
    script: ADMIN_SCRIPT,
    bodyClass: "admin",
  });
}

function miniStars(n) {
  return `<span class="mini-stars" dir="ltr" aria-label="${toFa(n)} از ۵">${[1, 2, 3, 4, 5]
    .map((i) => `<span class="${i <= n ? "on" : ""}">${STAR_SVG}</span>`)
    .join("")}</span>`;
}

export function renderLogin({ error, settings }) {
  const primary = sanitizeColor(settings?.primary_color, DEFAULT_SETTINGS.primary_color);
  const body = `
<main class="login-main">
  <form class="login-card" method="post" action="/admin/login">
    <div class="login-mark">${STAR_SVG}</div>
    <h1>ورود به پنل مدیریت</h1>
    <p>برای مدیریت پلتفرم‌های ثبت نظر و اطلاعات کسب‌وکار وارد شوید.</p>
    ${error ? `<p class="flash bad" role="alert">${escapeHtml(error)}</p>` : ""}
    <label>
      <span>رمز عبور</span>
      <input type="password" name="password" required autocomplete="current-password" autofocus>
    </label>
    <button type="submit">ورود</button>
  </form>
</main>`;
  return documentPage({
    title: "ورود به پنل مدیریت",
    themeColor: primary,
    extraHead: `<link rel="stylesheet" href="/admin.css">`,
    css: "",
    body,
    bodyClass: "admin login-page",
  });
}

export function renderDashboard({ settings, stats, origin = "", flash }) {
  const max = Math.max(stats.rating1, stats.rating2, stats.rating3, stats.rating4, stats.rating5, 1);
  const cards = [
    { label: "تعداد بازدید", value: stats.visits },
    { label: "تعداد امتیازها", value: stats.ratings },
    { label: "انتقال به پلتفرم ثبت نظر", value: stats.redirects },
    { label: "بازخوردهای ثبت‌شده", value: stats.feedback },
  ];
  const dist = [1, 2, 3, 4, 5].map((n) => {
    const value = stats[`rating${n}`];
    const pct = Math.round((value / max) * 100);
    return `<div class="bar-row">
      <span class="bar-label">امتیاز ${toFa(n)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
      <span class="bar-n">${toFa(value)}</span>
    </div>`;
  });

  const reviewUrl = origin ? `${origin}/review` : "/review";
  const content = `
<section class="grid-stats">
  ${cards
    .map(
      (c) =>
        `<article class="stat"><span>${c.label}</span><strong>${toFa(c.value)}</strong></article>`,
    )
    .join("")}
</section>
<section class="card">
  <h2>توزیع امتیازها</h2>
  <div class="bars">${dist.join("")}</div>
</section>
<section class="card">
  <h2>نشانی صفحه نظر</h2>
  <p class="help">این نشانی را به‌صورت کد QR چاپ کنید. مشتری بعد از اسکن، مستقیم به صفحه امتیاز می‌رسد.</p>
  <p class="url-copy" dir="ltr">${escapeHtml(reviewUrl)}</p>
  <p class="help">برای شعبه جداگانه: <span dir="ltr">${escapeHtml(reviewUrl)}?branch=branch-a</span></p>
</section>`;

  return adminLayout({
    title: "داشبورد",
    active: "dashboard",
    settings,
    flash,
    content,
  });
}

export function renderBusiness({ settings, flash, error }) {
  const logo = safeImageSrc(settings.business_logo);
  const content = `
<section class="card">
  <form method="post" action="/admin/business" enctype="multipart/form-data">
    ${error ? `<p class="flash bad">${escapeHtml(error)}</p>` : ""}
    <label>
      <span>نام کسب‌وکار</span>
      <input type="text" name="business_name" maxlength="80" value="${escapeHtml(settings.business_name)}" placeholder="نام کسب‌وکار">
    </label>
    <label>
      <span>توضیحات</span>
      <textarea name="business_description" maxlength="400" placeholder="توضیح کوتاه">${escapeHtml(settings.business_description)}</textarea>
    </label>
    <div class="row-2">
      <label>
        <span>شماره تماس</span>
        <input type="text" name="business_phone" maxlength="30" dir="ltr" value="${escapeHtml(settings.business_phone)}" placeholder="۰۲۱-۰۰۰۰۰۰۰۰">
      </label>
      <label>
        <span>آدرس</span>
        <input type="text" name="business_address" maxlength="200" value="${escapeHtml(settings.business_address)}" placeholder="آدرس">
      </label>
    </div>
    <div class="row-2">
      <label>
        <span>وب‌سایت</span>
        <input type="url" name="website_url" maxlength="300" dir="ltr" value="${escapeHtml(settings.website_url || "")}" placeholder="https://">
      </label>
      <label>
        <span>اینستاگرام</span>
        <input type="url" name="instagram_url" maxlength="300" dir="ltr" value="${escapeHtml(settings.instagram_url || "")}" placeholder="https://instagram.com/">
      </label>
    </div>
    <p class="help">شماره تماس، وب‌سایت و اینستاگرام در منوی صفحه نظر نمایش داده می‌شوند.</p>
    <div class="row-2">
      <label>
        <span>رنگ اصلی</span>
        <input type="color" name="primary_color" value="${escapeHtml(settings.primary_color)}">
      </label>
      <label>
        <span>رنگ ثانویه</span>
        <input type="color" name="secondary_color" value="${escapeHtml(settings.secondary_color)}">
      </label>
    </div>
    <label>
      <span>لوگو</span>
      <input type="file" name="business_logo" accept="image/png,image/jpeg,image/webp,image/gif" data-preview="logo-preview">
    </label>
    ${logo ? `<input type="hidden" name="keep_logo" value="1">` : ""}
    <div class="preview" id="logo-preview">${logo ? `<img src="${escapeHtml(logo)}" alt="لوگو">` : "<span>لوگویی انتخاب نشده</span>"}</div>
    ${logo ? `<label class="check"><input type="checkbox" name="remove_logo" value="1"> حذف لوگو</label>` : ""}
    <button class="btn" type="submit">ذخیره</button>
  </form>
</section>`;

  return adminLayout({
    title: "اطلاعات کسب‌وکار",
    active: "business",
    settings,
    flash,
    content,
  });
}

function platformCard(p) {
  const icon = safeImageSrc(p.icon);
  const enabled = Number(p.enabled) === 1;
  const primary = Number(p.is_primary) === 1;
  const initial = escapeHtml((p.name || "؟").trim().slice(0, 1));
  return `
<article class="plat">
  <div class="plat-head">
    <div class="plat-id">
      ${icon ? `<img src="${escapeHtml(icon)}" alt="">` : `<span class="letter">${initial}</span>`}
      <div>
        <h3>${escapeHtml(p.name)}</h3>
        <a class="url" href="${escapeHtml(p.review_url)}" target="_blank" rel="noopener noreferrer" dir="ltr">${escapeHtml(p.review_url)}</a>
      </div>
    </div>
    <div class="badges">
      ${primary ? `<span class="badge gold">پلتفرم اصلی</span>` : ""}
      <span class="badge ${enabled ? "ok" : "off"}">${enabled ? "فعال ✓" : "غیرفعال"}</span>
    </div>
  </div>
  <div class="plat-actions">
    <a class="btn-lite" href="/admin/platforms/${escapeHtml(p.id)}">ویرایش</a>
    <form method="post" action="/admin/platforms/${escapeHtml(p.id)}/toggle">
      <button type="submit">${enabled ? "غیرفعال کردن" : "فعال کردن"}</button>
    </form>
    ${
      primary
        ? ""
        : `<form method="post" action="/admin/platforms/primary"><input type="hidden" name="id" value="${escapeHtml(p.id)}"><button type="submit">انتخاب به‌عنوان اصلی</button></form>`
    }
    <form method="post" action="/admin/platforms/${escapeHtml(p.id)}/delete" data-confirm="این پلتفرم حذف شود؟">
      <button class="danger" type="submit">حذف</button>
    </form>
  </div>
</article>`;
}

export function renderPlatforms({ settings, platforms, flash }) {
  const enabled = platforms.filter((p) => Number(p.enabled) === 1);
  const content = `
<section class="card toolbar">
  <form class="inline" method="post" action="/admin/platforms/primary">
    <label>
      <span>پلتفرم اصلی ثبت نظر</span>
      <select name="id" ${enabled.length ? "" : "disabled"}>
        ${
          enabled.length
            ? enabled
                .map(
                  (p) =>
                    `<option value="${escapeHtml(p.id)}" ${Number(p.is_primary) === 1 ? "selected" : ""}>${escapeHtml(p.name)}</option>`,
                )
                .join("")
            : `<option>پلتفرم فعالی وجود ندارد</option>`
        }
      </select>
    </label>
    <button class="btn-lite" type="submit" ${enabled.length ? "" : "disabled"}>ذخیره</button>
  </form>
  <a class="btn" href="/admin/platforms/new">افزودن پلتفرم</a>
</section>
<section class="plat-list">
  ${
    platforms.length
      ? platforms.map(platformCard).join("")
      : `<div class="empty">هنوز پلتفرمی اضافه نشده است.</div>`
  }
</section>`;

  return adminLayout({
    title: "پلتفرم‌های ثبت نظر",
    active: "platforms",
    settings,
    flash,
    content,
  });
}

export function renderPlatformForm({ settings, platform, flash, error, isNew }) {
  const p = platform || {
    name: "",
    review_url: "",
    deep_link: "",
    web_fallback: "",
    icon: "",
    enabled: 1,
    is_primary: 0,
  };
  const icon = safeImageSrc(p.icon);
  const action = isNew ? "/admin/platforms/new" : `/admin/platforms/${encodeURIComponent(p.id)}`;
  const content = `
<section class="card">
  <form method="post" action="${escapeHtml(action)}" enctype="multipart/form-data">
    ${error ? `<p class="flash bad">${escapeHtml(error)}</p>` : ""}
    <label>
      <span>نام پلتفرم</span>
      <input type="text" name="name" required maxlength="80" value="${escapeHtml(p.name)}" placeholder="مثلاً نشان">
    </label>
    <label>
      <span>لینک ثبت نظر</span>
      <input type="url" name="review_url" required maxlength="500" dir="ltr" value="${escapeHtml(p.review_url)}" placeholder="https://example.com/review">
    </label>
    <label>
      <span>لینک اپ / دیپ‌لینک <small>(اختیاری)</small></span>
      <input type="text" name="deep_link" maxlength="500" dir="ltr" value="${escapeHtml(p.deep_link || "")}" placeholder="اختیاری">
    </label>
    <label>
      <span>لینک جایگزین وب <small>(اختیاری)</small></span>
      <input type="url" name="web_fallback" maxlength="500" dir="ltr" value="${escapeHtml(p.web_fallback || "")}" placeholder="https://">
    </label>
    <label>
      <span>آیکون / لوگو <small>(اختیاری)</small></span>
      <input type="file" name="icon" accept="image/png,image/jpeg,image/webp,image/gif" data-preview="icon-preview">
    </label>
    ${icon ? `<input type="hidden" name="keep_icon" value="1">` : ""}
    <div class="preview" id="icon-preview">${icon ? `<img src="${escapeHtml(icon)}" alt="">` : "<span>آیکونی انتخاب نشده</span>"}</div>
    ${icon ? `<label class="check"><input type="checkbox" name="remove_icon" value="1"> حذف آیکون</label>` : ""}
    <label class="check">
      <input type="checkbox" name="enabled" value="1" ${Number(p.enabled) === 1 ? "checked" : ""}>
      وضعیت: فعال
    </label>
    <label class="check">
      <input type="checkbox" name="is_primary" value="1" ${Number(p.is_primary) === 1 ? "checked" : ""}>
      پلتفرم اصلی ثبت نظر
    </label>
    <div class="form-actions">
      <button class="btn" type="submit">ذخیره</button>
      <a class="btn-lite" href="/admin/platforms">انصراف</a>
    </div>
  </form>
</section>`;

  return adminLayout({
    title: isNew ? "افزودن پلتفرم" : "ویرایش پلتفرم",
    active: "platforms",
    settings,
    flash,
    content,
  });
}

export function renderFeedback({ settings, items, flash }) {
  const rows = items.length
    ? items
        .map((item) => {
          const who = [item.name, item.phone].filter(Boolean).join(" · ");
          return `<article class="fb">
            <header>
              ${miniStars(item.rating)}
              <time>${formatJalali(item.created_at)}</time>
            </header>
            <p>${escapeHtml(item.comment)}</p>
            <footer>
              ${who ? `<span>${escapeHtml(who)}</span>` : "<span>بدون نام</span>"}
              ${item.branch ? `<span class="branch">شعبه: ${escapeHtml(item.branch)}</span>` : ""}
            </footer>
          </article>`;
        })
        .join("")
    : `<div class="empty">هنوز بازخوردی ثبت نشده است.</div>`;

  return adminLayout({
    title: "بازخوردها",
    active: "feedback",
    settings,
    flash,
    content: `<section class="fb-list">${rows}</section>`,
  });
}
