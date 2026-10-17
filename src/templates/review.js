import {
  escapeHtml,
  safeImageSrc,
} from "../utils.js";
import { documentPage, STAR_SVG } from "./shell.js";

const STAR_LABELS = [
  "امتیاز ۱ از ۵، خیلی ضعیف",
  "امتیاز ۲ از ۵، ضعیف",
  "امتیاز ۳ از ۵، متوسط",
  "امتیاز ۴ از ۵، خوب",
  "امتیاز ۵ از ۵، عالی",
];

const COPY = {
  ask: "از خدمات ما راضی بودید؟",
  hint: "",
  lowTitle: "متأسفیم که رضایت نداشتید.",
  lowBody: "لطفاً دلیل را بنویسید تا بررسی کنیم.",
  comment: "توضیحات",
  commentPh: "دلیل نارضایتی را بنویسید",
  name: "نام",
  nameOpt: "اختیاری",
  namePh: "نام شما",
  send: "ثبت",
  sending: "در حال ارسال…",
  thanksTitle: "نظر شما ثبت شد.",
  thanksBody: "سپاسگزاریم.",
  noPlatformTitle: "در حال حاضر امکان ثبت نظر فراهم نیست.",
  noPlatformBody: "لطفاً کمی بعد دوباره تلاش کنید.",
  title: "ثبت نظر",
};

function reviewCss() {
  const teal = "#04A0B6";
  const gold = "#F4C64A";
  const focusRing = "rgba(4,160,182,.38)";
  const okWash = "rgba(4,160,182,.16)";
  return `
:root{
  --bg:#000000;
  --ink:#FFFFFF;
  --muted:rgba(255,255,255,.62);
  --line:rgba(255,255,255,.16);
  --card:#141414;
  --star:${gold};
  --star-empty:rgba(244,198,74,.38);
  --primary:${teal};
  --focus:${teal};
  --danger:#FF6B6B;
  --ok:${teal};
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
.brand{display:flex;flex-direction:column;align-items:center;margin-bottom:24px}
.brand img{
  max-height:64px;
  max-width:min(200px,60vw);
  object-fit:contain;
  margin-bottom:8px;
}
.brand .name{
  font-size:0.95rem;
  font-weight:500;
  color:var(--muted);
  line-height:1.7;
}
h1{
  font-size:1.38rem;
  font-weight:700;
  line-height:1.85;
  margin-bottom:22px;
}
.stars{
  display:flex;
  direction:ltr;
  gap:8px;
  border:0;
  background:none;
  padding:4px;
}
.star{
  appearance:none;
  border:0;
  background:transparent;
  width:56px;
  height:56px;
  padding:6px;
  color:var(--star-empty);
  cursor:pointer;
  border-radius:50%;
  touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
  transition:color .16s ease, transform .16s ease, background .16s ease;
}
.star svg{width:100%;height:100%;display:block;overflow:visible}
.star svg path{
  fill:transparent;
  stroke:currentColor;
  paint-order:stroke fill;
  transition:fill .16s ease;
}
.star:focus-visible{outline:2px solid var(--focus);outline-offset:3px}
.star:active{transform:scale(.94)}
.star.is-on,.stars.is-locked .star.is-on{color:var(--star)}
.star.is-on svg path,.stars.is-locked .star.is-on svg path{fill:currentColor}
.star.is-on svg{
  filter:drop-shadow(0 0 6px rgba(244,198,74,.95)) drop-shadow(0 0 16px rgba(244,198,74,.55)) drop-shadow(0 0 28px rgba(244,198,74,.28));
}
@media (hover:hover){
  .stars:not(.is-locked):hover .star{color:var(--star)}
  .stars:not(.is-locked):hover .star svg path{fill:currentColor}
  .stars:not(.is-locked) .star:hover ~ .star{color:var(--star-empty)}
  .stars:not(.is-locked) .star:hover ~ .star svg path{fill:transparent}
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
  caret-color:var(--primary);
  transition:border-color .12s, box-shadow .12s;
}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,.38)}
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
  .star{width:50px;height:50px;padding:5px}
  .stars{gap:6px}
  h1{font-size:1.32rem}
}
@media (prefers-reduced-motion:reduce){
  .star,.btn,input,textarea{transition:none}
}
`;
}

function brandBlock(settings) {
  const raw = settings.business_logo || "";
  const logo = raw && raw !== "/logo.png" ? safeImageSrc(raw) : "";
  const name = (settings.business_name || "").trim();
  if (!logo && !name) return "";
  return `<div class="brand">
    ${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(name || "لوگو")}" width="180" height="64">` : ""}
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
            if(btn){btn.disabled=true;btn.textContent=${JSON.stringify("در حال ارسال…")};}
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
        if(btn){btn.disabled=false;btn.textContent=${JSON.stringify("ثبت")};}
        fbForm.submit();
      });
    });
  }
})();
`;

export function renderReviewPage({ settings, branch, redirectUrl }) {
  const title = settings.business_name
    ? `${COPY.title} | ${settings.business_name}`
    : COPY.title;

  const body = `
<main>
  ${brandBlock(settings)}
  <h1 id="ask">${COPY.ask}</h1>
  <form id="rating-form" class="stars" method="post" action="/review/rate" dir="ltr" role="radiogroup" aria-labelledby="ask" data-redirect="${escapeHtml(redirectUrl || "")}" data-branch="${escapeHtml(branch || "")}">
    <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
    ${starButtons()}
  </form>
  ${COPY.hint ? `<p class="hint" id="hint">${COPY.hint}</p>` : `<p id="hint" hidden></p>`}
  <p id="live" class="hp" aria-live="polite"></p>

  <section class="panel" id="feedback" hidden>
    <div class="empathy">
      <h2>${COPY.lowTitle}</h2>
      <p>${COPY.lowBody}</p>
    </div>
    <form id="feedback-form" method="post" action="/review/feedback" novalidate>
      <input type="hidden" name="rating" id="fb-rating" value="">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      <div class="hp" aria-hidden="true">
        <label>وب‌سایت<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <label class="field">
        <span>${COPY.comment}</span>
        <textarea name="comment" required maxlength="2000" placeholder="${COPY.commentPh}"></textarea>
      </label>
      <label class="field">
        <span>${COPY.name} <small>(${COPY.nameOpt})</small></span>
        <input type="text" name="name" maxlength="80" placeholder="${COPY.namePh}" autocomplete="name">
      </label>
      <button class="btn" type="submit">${COPY.send}</button>
    </form>
  </section>

  <section class="thanks" id="thanks" hidden>
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
  </section>
</main>`;

  return documentPage({
    title,
    themeColor: "#000000",
    css: reviewCss(),
    body,
    script: REVIEW_SCRIPT,
    bodyClass: "review",
    colorScheme: "dark",
  });
}

export function renderFeedbackPage({ settings, branch, rating, error }) {
  const title = COPY.title;
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
      <h2>${COPY.lowTitle}</h2>
      <p>${COPY.lowBody}</p>
    </div>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
    <form method="post" action="/review/feedback">
      <input type="hidden" name="rating" value="${Number(rating)}">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      <div class="hp" aria-hidden="true">
        <label>وب‌سایت<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      </div>
      <label class="field">
        <span>${COPY.comment}</span>
        <textarea name="comment" required maxlength="2000" placeholder="${COPY.commentPh}"></textarea>
      </label>
      <label class="field">
        <span>${COPY.name} <small>(${COPY.nameOpt})</small></span>
        <input type="text" name="name" maxlength="80" placeholder="${COPY.namePh}" autocomplete="name">
      </label>
      <button class="btn" type="submit">${COPY.send}</button>
    </form>
  </section>
</main>`;

  return documentPage({
    title,
    themeColor: "#000000",
    css: reviewCss(),
    body,
    bodyClass: "review",
    colorScheme: "dark",
  });
}

export function renderThanksPage(settings) {
  const body = `
<main>
  ${brandBlock(settings)}
  <section class="thanks">
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
  </section>
</main>`;
  return documentPage({
    title: COPY.thanksTitle,
    themeColor: "#000000",
    css: reviewCss(),
    body,
    bodyClass: "review",
    colorScheme: "dark",
  });
}

export function renderNoPlatformPage(settings) {
  const body = `
<main>
  ${brandBlock(settings)}
  <section class="thanks">
    <h2>${COPY.noPlatformTitle}</h2>
    <p class="note">${COPY.noPlatformBody}</p>
  </section>
</main>`;
  return documentPage({
    title: COPY.title,
    themeColor: "#000000",
    css: reviewCss(),
    body,
    bodyClass: "review",
    colorScheme: "dark",
  });
}
