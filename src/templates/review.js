import {
  escapeHtml,
  safeImageSrc,
  sanitizeColor,
  DEFAULT_SETTINGS,
} from "../utils.js";
import { documentPage, STAR_SVG } from "./shell.js";

const STAR_LABELS = [
  "امتیاز ۱ از ۵، خیلی ضعیف",
  "امتیاز ۲ از ۵، ضعیف",
  "امتیاز ۳ از ۵، متوسط",
  "امتیاز ۴ از ۵، خوب",
  "امتیاز ۵ از ۵، عالی",
];

function hexToRgba(hex, alpha) {
  const n = parseInt(String(hex).slice(1), 16);
  if (Number.isNaN(n)) return `rgba(26,95,82,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function reviewCss(primary, secondary) {
  const focusRing = hexToRgba(primary, 0.18);
  const okWash = hexToRgba("#1A5F52", 0.12);
  return `
:root{
  --bg:#F3EEE4;
  --ink:#1C1915;
  --muted:#6F6A62;
  --line:#E4DCD0;
  --card:#FFFcf6;
  --star:${secondary};
  --star-empty:#D6CFC3;
  --primary:${primary};
  --focus:${primary};
  --danger:#9F2D20;
  --ok:#1A5F52;
  --radius:18px;
  --font:"Vazirmatn","Tahoma",system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{min-height:100%;-webkit-text-size-adjust:100%}
html,body{min-height:100%;background:var(--bg);color:var(--ink);font-family:var(--font)}
body{
  min-height:100dvh;
  display:flex;
  flex-direction:column;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
button,input,textarea,select{font-family:inherit}
main{
  width:min(430px,100%);
  margin:auto;
  padding:max(28px, env(safe-area-inset-top)) 22px max(28px, env(safe-area-inset-bottom));
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}
.brand{display:flex;flex-direction:column;align-items:center;margin-bottom:28px}
.brand img{
  max-height:72px;
  max-width:min(220px,70vw);
  object-fit:contain;
  margin-bottom:10px;
}
.brand .name{
  font-size:0.95rem;
  font-weight:500;
  color:var(--muted);
  line-height:1.7;
}
h1{
  font-size:1.45rem;
  font-weight:700;
  line-height:1.75;
  margin-bottom:28px;
}
.stars{
  display:flex;
  direction:ltr;
  gap:6px;
  border:0;
  background:none;
  padding:4px;
}
.star{
  appearance:none;
  border:0;
  background:transparent;
  width:58px;
  height:58px;
  padding:4px;
  color:var(--star-empty);
  cursor:pointer;
  border-radius:14px;
  touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
  transition:color .12s ease, transform .12s ease;
}
.star svg{width:100%;height:100%;display:block;filter:drop-shadow(0 1px 0 rgba(28,25,21,.04))}
.star:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.star:active{transform:scale(.92)}
.star.is-on,.stars.is-locked .star.is-on{color:var(--star)}
@media (hover:hover){
  .stars:not(.is-locked):hover .star{color:var(--star)}
  .stars:not(.is-locked) .star:hover ~ .star{color:var(--star-empty)}
}
.hint{
  margin-top:26px;
  color:var(--muted);
  font-size:.98rem;
  font-weight:500;
  line-height:1.8;
}
.panel{
  width:100%;
  margin-top:8px;
  text-align:right;
}
.empathy h2{
  font-size:1.12rem;
  font-weight:700;
  line-height:1.8;
  margin-bottom:6px;
  text-align:center;
}
.empathy p{
  color:var(--muted);
  font-size:.95rem;
  line-height:1.85;
  margin-bottom:22px;
  text-align:center;
}
label.field{
  display:block;
  margin-bottom:14px;
}
label.field span{
  display:block;
  font-size:.82rem;
  font-weight:600;
  color:var(--muted);
  margin-bottom:6px;
}
input[type=text],input[type=tel],textarea{
  width:100%;
  border:1px solid var(--line);
  background:var(--card);
  color:var(--ink);
  border-radius:14px;
  padding:14px 14px;
  font-size:16px;
  line-height:1.7;
  outline:none;
  transition:border-color .12s, box-shadow .12s;
}
textarea{min-height:128px;resize:vertical}
input:focus-visible,textarea:focus-visible{
  border-color:var(--primary);
  box-shadow:0 0 0 3px ${focusRing};
}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.btn{
  display:block;
  width:100%;
  margin-top:8px;
  border:0;
  background:var(--primary);
  color:#fff;
  font-size:1.02rem;
  font-weight:700;
  line-height:1;
  padding:18px 16px;
  border-radius:14px;
  cursor:pointer;
  touch-action:manipulation;
}
.btn:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.btn:active{transform:translateY(1px)}
.btn:disabled{opacity:.65;cursor:wait}
.thanks{
  padding:12px 8px 24px;
}
.thanks .mark{
  width:64px;
  height:64px;
  margin:0 auto 18px;
  border-radius:50%;
  background:${okWash};
  color:var(--ok);
  display:grid;
  place-items:center;
}
.thanks .mark svg{width:32px;height:32px}
.thanks h2{
  font-size:1.18rem;
  font-weight:700;
  line-height:1.8;
  margin-bottom:8px;
}
.thanks p{
  color:var(--muted);
  font-size:.98rem;
  line-height:1.85;
}
.note{
  color:var(--muted);
  line-height:1.85;
  font-size:.98rem;
}
.error{color:var(--danger);font-size:.9rem;margin-top:10px;text-align:center}
[hidden]{display:none !important}
@media (max-width:380px){
  .star{width:50px;height:50px}
  .stars{gap:4px}
  h1{font-size:1.32rem}
}
@media (prefers-reduced-motion:reduce){
  .star,.btn,input,textarea{transition:none}
}
`;
}

function brandBlock(settings) {
  const logo = safeImageSrc(settings.business_logo);
  const name = (settings.business_name || "").trim();
  if (!logo && !name) return "";
  return `<div class="brand">
    ${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(name || "لوگو")}" width="180" height="72">` : ""}
    ${name ? `<div class="name">${escapeHtml(name)}</div>` : ""}
  </div>`;
}

function starButtons() {
  return STAR_LABELS.map(
    (label, i) =>
      `<button class="star" type="submit" role="radio" aria-checked="false" name="rating" value="${i + 1}" data-rating="${i + 1}" aria-label="${label}">${STAR_SVG}</button>`,
  ).join("");
}

const REVIEW_SCRIPT = `
(function(){
  var form=document.getElementById("rating-form");
  if(!form)return;
  var redirect=form.getAttribute("data-redirect")||"";
  var branch=form.getAttribute("data-branch")||"";
  var stars=[].slice.call(form.querySelectorAll("[data-rating]"));
  var feedback=document.getElementById("feedback");
  var thanks=document.getElementById("thanks");
  var ask=document.getElementById("ask");
  var hint=document.getElementById("hint");
  var ratingInput=document.getElementById("fb-rating");
  var live=document.getElementById("live");
  function paint(n){
    stars.forEach(function(s){
      var v=+s.getAttribute("data-rating");
      s.classList.toggle("is-on", v<=n);
      s.setAttribute("aria-checked", v===n ? "true" : "false");
    });
  }
  function beacon(type,rating){
    try{
      var body=JSON.stringify({type:type,rating:rating,branch:branch});
      if(navigator.sendBeacon){
        navigator.sendBeacon("/api/events", new Blob([body],{type:"application/json"}));
      }else{
        fetch("/api/events",{method:"POST",body:body,headers:{"content-type":"application/json"},keepalive:true,credentials:"same-origin"});
      }
    }catch(e){}
  }
  form.addEventListener("submit",function(e){
    var btn=e.submitter;
    if(!btn)return;
    var rating=+btn.value;
    if(!(rating>=1&&rating<=5))return;
    if(live) live.textContent="امتیاز "+rating+" از ۵ انتخاب شد";
    if(rating>=4 && redirect){
      e.preventDefault();
      paint(rating);
      beacon("rating_selected",rating);
      beacon("review_redirect",rating);
      window.location.href=redirect;
      return;
    }
    if(rating<=3 && feedback){
      e.preventDefault();
      paint(rating);
      beacon("rating_selected",rating);
      if(ratingInput) ratingInput.value=String(rating);
      if(ask) ask.hidden=true;
      if(hint) hint.hidden=true;
      form.classList.add("is-locked");
      stars.forEach(function(s){s.disabled=true});
      feedback.hidden=false;
      var ta=feedback.querySelector("textarea");
      if(ta) ta.focus();
    }
  });
  stars.forEach(function(s){
    s.addEventListener("focus",function(){
      if(!form.classList.contains("is-locked")) paint(+s.getAttribute("data-rating"));
    });
  });
  if(window.matchMedia("(hover: hover)").matches){
    stars.forEach(function(s){
      s.addEventListener("mouseenter",function(){
        if(!form.classList.contains("is-locked")) paint(+s.getAttribute("data-rating"));
      });
    });
    form.addEventListener("mouseleave",function(){
      if(!form.classList.contains("is-locked")){
        var checked=form.querySelector('[aria-checked="true"]');
        paint(checked?+checked.getAttribute("data-rating"):0);
      }
    });
  }
  form.addEventListener("keydown",function(e){
    if(form.classList.contains("is-locked"))return;
    var i=stars.indexOf(document.activeElement);
    if(i<0)return;
    var next=i;
    if(e.key==="ArrowLeft"||e.key==="ArrowDown") next=Math.min(stars.length-1,i+1);
    else if(e.key==="ArrowRight"||e.key==="ArrowUp") next=Math.max(0,i-1);
    else if(e.key==="Home") next=0;
    else if(e.key==="End") next=stars.length-1;
    else return;
    e.preventDefault();
    stars[next].focus();
    paint(+stars[next].getAttribute("data-rating"));
  });
  var fbForm=document.getElementById("feedback-form");
  if(fbForm){
    fbForm.addEventListener("submit",function(e){
      if(!window.fetch)return;
      e.preventDefault();
      var btn=fbForm.querySelector("[type=submit]");
      if(btn){btn.disabled=true;btn.textContent="در حال ارسال…";}
      fetch("/review/feedback",{
        method:"POST",
        body:new FormData(fbForm),
        headers:{Accept:"application/json"},
        credentials:"same-origin"
      }).then(function(r){return r.json().then(function(d){return {ok:r.ok&&d&&d.ok, err:d&&d.error};});})
      .then(function(res){
        if(res.ok){
          feedback.hidden=true;
          form.hidden=true;
          if(ask) ask.hidden=true;
          if(hint) hint.hidden=true;
          if(thanks) thanks.hidden=false;
        }else{
          throw new Error(res.err||"fail");
        }
      }).catch(function(){
        if(btn){btn.disabled=false;btn.textContent="ارسال بازخورد";}
        fbForm.submit();
      });
    });
  }
})();
`;

export function renderReviewPage({ settings, branch, redirectUrl }) {
  const primary = sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color);
  const secondary = sanitizeColor(settings.secondary_color, DEFAULT_SETTINGS.secondary_color);
  const title = settings.business_name
    ? `نظر شما | ${settings.business_name}`
    : "تجربه‌تان چطور بود؟";

  const body = `
<main>
  ${brandBlock(settings)}
  <h1 id="ask">تجربه‌تان چطور بود؟</h1>
  <form id="rating-form" class="stars" method="post" action="/review/rate" dir="ltr" role="radiogroup" aria-labelledby="ask" data-redirect="${escapeHtml(redirectUrl || "")}" data-branch="${escapeHtml(branch || "")}">
    <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
    ${starButtons()}
  </form>
  <p class="hint" id="hint">نظر شما برای ما مهم است</p>
  <p id="live" class="hp" aria-live="polite"></p>

  <section class="panel" id="feedback" hidden>
    <div class="empathy">
      <h2>متأسفیم که تجربه‌تان ایده‌آل نبوده.</h2>
      <p>خوشحال می‌شویم بدانیم چه چیزی می‌توانست بهتر باشد.</p>
    </div>
    <form id="feedback-form" method="post" action="/review/feedback" novalidate>
      <input type="hidden" name="rating" id="fb-rating" value="">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      <div class="hp" aria-hidden="true">
        <label>وب‌سایت<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <label class="field">
        <span>توضیحات</span>
        <textarea name="comment" required maxlength="2000" placeholder="چه چیزی باعث شد تجربه خوبی نداشته باشید؟"></textarea>
      </label>
      <label class="field">
        <span>نام <small>(اختیاری)</small></span>
        <input type="text" name="name" maxlength="80" placeholder="نام شما" autocomplete="name">
      </label>
      <button class="btn" type="submit">ارسال بازخورد</button>
    </form>
  </section>

  <section class="thanks" id="thanks" hidden>
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>از اینکه نظر خود را با ما در میان گذاشتید، ممنونیم.</h2>
    <p>بازخورد شما برای ما ارزشمند است.</p>
  </section>
</main>`;

  return documentPage({
    title,
    themeColor: primary,
    css: reviewCss(primary, secondary),
    body,
    script: REVIEW_SCRIPT,
    bodyClass: "review",
  });
}

export function renderFeedbackPage({ settings, branch, rating, error }) {
  const primary = sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color);
  const secondary = sanitizeColor(settings.secondary_color, DEFAULT_SETTINGS.secondary_color);
  const title = "ارسال بازخورد";
  const filled = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<span class="star ${n <= rating ? "is-on" : ""}" aria-hidden="true">${STAR_SVG}</span>`,
    )
    .join("");

  const body = `
<main>
  ${brandBlock(settings)}
  <div class="stars is-locked" dir="ltr" aria-label="امتیاز ${rating} از ۵">${filled}</div>
  <section class="panel">
    <div class="empathy">
      <h2>متأسفیم که تجربه‌تان ایده‌آل نبوده.</h2>
      <p>خوشحال می‌شویم بدانیم چه چیزی می‌توانست بهتر باشد.</p>
    </div>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <form method="post" action="/review/feedback">
      <input type="hidden" name="rating" value="${Number(rating)}">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      <div class="hp" aria-hidden="true">
        <label>وب‌سایت<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <label class="field">
        <span>توضیحات</span>
        <textarea name="comment" required maxlength="2000" placeholder="چه چیزی باعث شد تجربه خوبی نداشته باشید؟"></textarea>
      </label>
      <label class="field">
        <span>نام <small>(اختیاری)</small></span>
        <input type="text" name="name" maxlength="80" placeholder="نام شما" autocomplete="name">
      </label>
      <button class="btn" type="submit">ارسال بازخورد</button>
    </form>
  </section>
</main>`;

  return documentPage({
    title,
    themeColor: primary,
    css: reviewCss(primary, secondary),
    body,
    bodyClass: "review",
  });
}

export function renderThanksPage(settings) {
  const primary = sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color);
  const secondary = sanitizeColor(settings.secondary_color, DEFAULT_SETTINGS.secondary_color);
  const body = `
<main>
  ${brandBlock(settings)}
  <section class="thanks">
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>از اینکه نظر خود را با ما در میان گذاشتید، ممنونیم.</h2>
    <p>بازخورد شما برای ما ارزشمند است.</p>
  </section>
</main>`;
  return documentPage({
    title: "سپاس از بازخورد شما",
    themeColor: primary,
    css: reviewCss(primary, secondary),
    body,
    bodyClass: "review",
  });
}

export function renderNoPlatformPage(settings) {
  const primary = sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color);
  const secondary = sanitizeColor(settings.secondary_color, DEFAULT_SETTINGS.secondary_color);
  const body = `
<main>
  ${brandBlock(settings)}
  <section class="thanks">
    <h2>از توجه شما سپاسگزاریم.</h2>
    <p class="note">در حال حاضر امکان انتقال به پلتفرم ثبت نظر وجود ندارد. لطفاً کمی بعد دوباره تلاش کنید.</p>
  </section>
</main>`;
  return documentPage({
    title: "ثبت نظر",
    themeColor: primary,
    css: reviewCss(primary, secondary),
    body,
    bodyClass: "review",
  });
}
