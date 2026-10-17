import { escapeHtml, safeImageSrc, isHttpUrl, normalizePhone } from "../utils.js";
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
  sub: "با امتیاز دادن، به ما کمک کنید",
};

const STAR_D =
  "M12 2.4 14.55 8.7l6.75.52-5.14 4.42 1.57 6.58L12 16.95 6.27 20.22l1.57-6.58L2.7 9.22l6.75-.52Z";

const GLOBE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3.8 12h16.4M12 3.8c2.3 2.5 3.5 5.4 3.5 8.2s-1.2 5.7-3.5 8.2c-2.3-2.5-3.5-5.4-3.5-8.2s1.2-5.7 3.5-8.2z"/></svg>`;
const INSTAGRAM_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.1" cy="6.9" r="1.05" fill="currentColor"/></svg>`;
const PHONE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7.2 3.8h3.1l1.2 3.2-1.9 1.2a12.4 12.4 0 0 0 5.2 5.2l1.2-1.9 3.2 1.2v3.1c0 .7-.6 1.4-1.3 1.5-7.2.9-13.3-5.2-12.4-12.4.1-.7.8-1.3 1.7-1.3z"/></svg>`;

function glossyStarSvg(index) {
  const g = `sg${index}`;
  const h = `sh${index}`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${g}" x1="6" y1="2" x2="17" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFE889"/>
        <stop offset=".42" stop-color="#FFC727"/>
        <stop offset="1" stop-color="#FF9B00"/>
      </linearGradient>
      <linearGradient id="${h}" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".7"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="shape-empty" d="${STAR_D}" fill="#FFFFFF" stroke="#B7C4D4" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="shape-gold" d="${STAR_D}" fill="url(#${g})" stroke="#E09400" stroke-width="1.05" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="shape-shine" d="${STAR_D}" fill="url(#${h})"/>
  </svg>
  <span class="burst" aria-hidden="true"><i style="--r:0"></i><i style="--r:1"></i><i style="--r:2"></i><i style="--r:3"></i><i style="--r:4"></i></span>`;
}

function landingStarButtons() {
  return STAR_LABELS.map(
    (label, i) =>
      `<button class="star" type="submit" role="radio" aria-checked="false" name="rating" value="${i + 1}" data-rating="${i + 1}" aria-label="${label}">${glossyStarSvg(i + 1)}</button>`,
  ).join("");
}

function headerLogo(settings) {
  const src = safeImageSrc(settings.business_logo);
  if (src && src !== "/logo.png") {
    return `<img class="logo" src="${escapeHtml(src)}" alt="" width="44" height="44">`;
  }
  return `<span class="logo-ph" aria-hidden="true"></span>`;
}

function menuItem(href, label, icon, extra = "") {
  if (href) {
    return `<a class="drawer-link" href="${escapeHtml(href)}" ${extra}>${icon}<span>${escapeHtml(label)}</span></a>`;
  }
  return `<span class="drawer-link is-off">${icon}<span>${escapeHtml(label)}</span></span>`;
}

function socialLinks(settings) {
  const web = String(settings.website_url || "").trim();
  const ig = String(settings.instagram_url || "").trim();
  const compact = normalizePhone(settings.business_phone);
  const telHref = compact ? `tel:${compact}` : "";
  return `<div class="drawer-group">
    ${menuItem(isHttpUrl(web) ? web : "", "وبسایت", GLOBE_SVG, 'target="_blank" rel="noopener noreferrer"')}
    ${menuItem(isHttpUrl(ig) ? ig : "", "اینستاگرام", INSTAGRAM_SVG, 'target="_blank" rel="noopener noreferrer"')}
    ${menuItem(telHref, "تماس", PHONE_SVG, "")}
  </div>`;
}

function landingCss() {
  return `
:root{
  --navy:#0B2A5B;
  --muted:#7A8BA8;
  --sky:#8EC8F0;
  --gold-a:#FFC727;
  --gold-b:#FFA800;
  --font:"Vazirmatn","Tahoma",system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{min-height:100%;-webkit-text-size-adjust:100%}
html,body{min-height:100%;background:var(--sky);color:var(--navy);font-family:var(--font)}
body.land{
  min-height:100dvh;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
button,input,textarea,select{font-family:inherit}
.stage{
  position:relative;
  min-height:100dvh;
  overflow:hidden;
  isolation:isolate;
  background:#8EC8F0;
}
.bg{
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
}
.bg img{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center bottom;
  display:block;
}
.top{
  position:absolute;
  top:0;left:0;right:0;
  z-index:20;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:max(12px, env(safe-area-inset-top)) 16px 8px;
}
.brand{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:0;
}
.logo,.logo-ph{
  width:44px;
  height:44px;
  border-radius:12px;
  flex:none;
  object-fit:cover;
  background:#E7F3FC;
  border:1px solid rgba(11,42,91,.12);
}
.logo-ph{box-shadow:inset 0 0 0 1px rgba(11,42,91,.04)}
.brand-text{min-width:0;text-align:right}
.brand-text .kicker{
  font-size:14px;
  font-weight:400;
  color:var(--navy);
  line-height:1.35;
  white-space:nowrap;
}
.brand-text .name{
  font-size:18px;
  font-weight:800;
  color:var(--navy);
  line-height:1.35;
  white-space:nowrap;
}
.burger{
  appearance:none;
  border:0;
  background:transparent;
  width:44px;
  height:44px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  gap:5px;
  cursor:pointer;
  flex:none;
  padding:8px;
}
.burger span{
  display:block;
  width:28px;
  height:3px;
  border-radius:3px;
  background:var(--navy);
}
.burger:focus-visible{outline:2px solid var(--navy);outline-offset:3px;border-radius:10px}
.backdrop{
  position:absolute;
  inset:0;
  z-index:30;
  background:rgba(11,42,91,.28);
  border:0;
  padding:0;
  cursor:pointer;
}
.drawer{
  position:absolute;
  top:0;
  left:0;
  bottom:0;
  z-index:40;
  width:min(300px,86%);
  background:#fff;
  color:var(--navy);
  padding:max(18px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  box-shadow:12px 0 40px rgba(11,42,91,.16);
  display:flex;
  flex-direction:column;
  gap:8px;
  transform:translateX(-100%);
  transition:transform .24s ease;
}
.drawer.is-open{transform:none}
.drawer-close{
  appearance:none;
  align-self:flex-start;
  border:0;
  background:#E7F3FC;
  color:var(--navy);
  font-size:.9rem;
  font-weight:700;
  padding:8px 12px;
  border-radius:10px;
  cursor:pointer;
  margin-bottom:10px;
}
.drawer-link{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 10px;
  border-radius:12px;
  color:var(--navy);
  text-decoration:none;
  font-weight:700;
  font-size:1rem;
}
.drawer-link svg{width:20px;height:20px;flex:none}
.drawer-link:hover{background:#E7F3FC}
.drawer-link.is-off{opacity:.4;cursor:default}
.drawer-group{display:flex;flex-direction:column;gap:4px}
.drawer-admin{
  margin-top:auto;
  border-top:1px solid rgba(11,42,91,.1);
  border-radius:0 0 12px 12px;
  padding-top:16px;
}
.hero{
  position:absolute;
  top:18%;
  left:16px;
  right:16px;
  bottom:48%;
  z-index:5;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}
.hero h1{
  font-size:36px;
  font-weight:800;
  color:#0B2A5B;
  line-height:1.45;
  margin:0 0 8px;
}
.hero .sub{
  font-size:20px;
  font-weight:700;
  color:#7A8BA8;
  line-height:1.6;
  margin:0 0 18px;
}
.stars{
  display:flex;
  direction:ltr;
  gap:12px;
  border:0;
  background:none;
  padding:4px 0;
  justify-content:center;
}
.star{
  appearance:none;
  border:0;
  background:transparent;
  width:64px;
  height:64px;
  padding:0;
  position:relative;
  cursor:pointer;
  touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
}
.star svg{
  width:100%;
  height:100%;
  display:block;
  overflow:visible;
  filter:drop-shadow(0 3px 2px rgba(11,42,91,.10)) drop-shadow(0 8px 12px rgba(11,42,91,.12));
}
.star .shape-gold,
.star .shape-shine{display:none}
.star.is-on .shape-gold,
.star.is-on .shape-shine{display:block}
.star.is-on .shape-empty{display:none}
.star.is-on svg{
  filter:drop-shadow(0 3px 4px rgba(255,155,0,.35)) drop-shadow(0 8px 14px rgba(255,168,0,.22));
}
.star:focus-visible{outline:2px solid var(--navy);outline-offset:4px;border-radius:50%}
.burst{
  position:absolute;
  inset:0;
  pointer-events:none;
}
.burst i{
  position:absolute;
  left:50%;
  top:50%;
  width:3px;
  height:12px;
  margin:-6px 0 0 -1.5px;
  border-radius:2px;
  background:linear-gradient(#fff,#FFC727);
  opacity:0;
  transform:rotate(calc(var(--r)*72deg)) translateY(-10px);
}
.star.is-pop{animation:pop .45s cubic-bezier(.22,1.6,.36,1)}
.star.is-pop .burst i{animation:ray .5s ease-out}
@keyframes pop{
  0%{transform:scale(1)}
  40%{transform:scale(1.25)}
  100%{transform:scale(1)}
}
@keyframes ray{
  0%{opacity:1;transform:rotate(calc(var(--r)*72deg)) translateY(-10px) scale(.4)}
  100%{opacity:0;transform:rotate(calc(var(--r)*72deg)) translateY(-28px) scale(1)}
}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.float{
  position:absolute;
  top:16%;
  left:16px;
  right:16px;
  bottom:38%;
  z-index:8;
  overflow:auto;
  background:rgba(255,255,255,.94);
  border-radius:20px;
  padding:16px 16px 14px;
  text-align:right;
  box-shadow:0 12px 32px rgba(11,42,91,.12);
}
.empathy h2{
  font-size:1.05rem;
  font-weight:800;
  color:var(--navy);
  line-height:1.8;
  margin-bottom:4px;
  text-align:center;
}
.empathy p{
  color:var(--muted);
  font-size:.92rem;
  line-height:1.8;
  margin-bottom:14px;
  text-align:center;
}
label.field{display:block;margin-bottom:12px}
label.field span{
  display:block;
  font-size:.8rem;
  font-weight:700;
  color:var(--muted);
  margin-bottom:5px;
}
input[type=text],textarea{
  width:100%;
  border:1px solid rgba(11,42,91,.14);
  background:#fff;
  color:var(--navy);
  border-radius:12px;
  padding:12px;
  font-size:16px;
  line-height:1.7;
  outline:none;
}
textarea{min-height:96px;resize:vertical}
input:focus-visible,textarea:focus-visible{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,42,91,.12)}
.btn{
  display:block;
  width:100%;
  margin-top:6px;
  border:0;
  background:var(--navy);
  color:#fff;
  font-size:1rem;
  font-weight:800;
  line-height:1;
  padding:16px;
  border-radius:12px;
  cursor:pointer;
  touch-action:manipulation;
}
.btn:disabled{opacity:.65;cursor:wait}
.thanks{text-align:center;padding-top:12px}
.thanks .mark{
  width:56px;height:56px;margin:0 auto 12px;border-radius:50%;
  background:#E7F3FC;color:var(--navy);display:grid;place-items:center;
}
.thanks .mark svg{width:28px;height:28px}
.thanks h2{font-size:1.1rem;font-weight:800;margin-bottom:6px}
.thanks p{color:var(--muted);font-size:.95rem;line-height:1.8}
.error{color:#C23B3B;font-size:.88rem;margin:8px 0;text-align:center}
[hidden]{display:none !important}
.stage:has(#feedback:not([hidden])) .hero,
.stage:has(#thanks:not([hidden])) .hero{visibility:hidden;pointer-events:none}
@media (max-width:400px){
  .hero h1{font-size:28px}
  .hero .sub{font-size:16px}
  .star{width:52px;height:52px}
  .stars{gap:8px}
  .brand-text .name{font-size:16px}
  .brand-text .kicker{font-size:12px}
}
@media (max-height:700px){
  .hero{top:14%}
  .hero h1{font-size:28px}
  .star{width:52px;height:52px}
}
@media (min-width:560px){
  body.land{
    display:flex;
    justify-content:center;
    background:#6BB3E0;
  }
  .stage{
    width:480px;
    max-width:480px;
    min-height:100dvh;
    box-shadow:0 0 0 1px rgba(11,42,91,.08), 0 24px 80px rgba(11,42,91,.22);
  }
}
@media (prefers-reduced-motion:reduce){
  .star.is-pop,.star.is-pop .burst i,.drawer{animation:none;transition:none}
}
`;
}

function reviewCss() {
  const teal = "#04A0B6";
  const gold = "#FFD56A";
  const focusRing = "rgba(4,160,182,.38)";
  const okWash = "rgba(4,160,182,.16)";
  return `
:root{
  --bg:#060809;
  --ink:#F3F5F6;
  --muted:rgba(243,245,246,.58);
  --line:rgba(255,255,255,.10);
  --card:#14181B;
  --star:${gold};
  --star-empty:rgba(255,213,106,.40);
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
}
button,input,textarea,select{font-family:inherit}
main{
  width:min(400px,100%);
  margin:auto;
  padding:max(32px, env(safe-area-inset-top)) 18px max(32px, env(safe-area-inset-bottom));
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}
.sheet{
  width:100%;
  background:#0F1214;
  border:1px solid rgba(255,255,255,.08);
  border-radius:28px;
  padding:44px 26px 40px;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
}
h1{font-size:1.28rem;font-weight:700;line-height:1.85;margin-bottom:28px}
.stars{display:flex;direction:ltr;gap:14px;border:0;background:none;padding:8px 4px 4px}
.star{
  appearance:none;border:0;background:transparent;width:56px;height:56px;padding:4px;
  color:var(--star-empty);cursor:pointer;border-radius:50%;
}
.star svg{width:100%;height:100%;display:block;overflow:visible}
.star svg path{fill:transparent;stroke:currentColor;paint-order:stroke fill}
.star.is-on,.stars.is-locked .star.is-on{color:var(--star)}
.star.is-on svg path,.stars.is-locked .star.is-on svg path{fill:currentColor}
.panel{width:100%;margin-top:8px;text-align:right}
.empathy h2{font-size:1.12rem;font-weight:700;line-height:1.8;margin-bottom:6px;text-align:center}
.empathy p{color:var(--muted);font-size:.95rem;line-height:1.85;margin-bottom:22px;text-align:center}
label.field{display:block;margin-bottom:14px}
label.field span{display:block;font-size:.82rem;font-weight:600;color:var(--muted);margin-bottom:6px}
input[type=text],textarea{
  width:100%;border:1px solid var(--line);background:var(--card);color:var(--ink);
  border-radius:14px;padding:14px;font-size:16px;line-height:1.7;outline:none;
}
textarea{min-height:128px;resize:vertical}
input:focus-visible,textarea:focus-visible{border-color:var(--primary);box-shadow:0 0 0 3px ${focusRing}}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.btn{
  display:block;width:100%;margin-top:8px;border:0;background:var(--primary);color:#fff;
  font-size:1.02rem;font-weight:700;line-height:1;padding:18px 16px;border-radius:14px;cursor:pointer;
}
.thanks{padding:12px 8px 24px}
.thanks .mark{
  width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:${okWash};
  color:var(--ok);display:grid;place-items:center;
}
.thanks .mark svg{width:32px;height:32px}
.thanks h2{font-size:1.18rem;font-weight:700;line-height:1.8;margin-bottom:8px}
.thanks p,.note{color:var(--muted);font-size:.98rem;line-height:1.85}
.error{color:var(--danger);font-size:.9rem;margin-top:10px;text-align:center}
[hidden]{display:none !important}
`;
}

const LANDING_SCRIPT = `
(function(){
  var form=document.getElementById("rating-form");
  var burger=document.getElementById("burger");
  var drawer=document.getElementById("drawer");
  var backdrop=document.getElementById("backdrop");
  var closeBtn=document.getElementById("drawer-close");
  function setMenu(open){
    if(!drawer)return;
    drawer.classList.toggle("is-open", open);
    drawer.hidden=!open;
    if(backdrop) backdrop.hidden=!open;
    if(burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow=open ? "hidden" : "";
  }
  if(burger) burger.addEventListener("click", function(){ setMenu(drawer && drawer.hidden); });
  if(closeBtn) closeBtn.addEventListener("click", function(){ setMenu(false); });
  if(backdrop) backdrop.addEventListener("click", function(){ setMenu(false); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") setMenu(false); });

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
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function paint(n){
    stars.forEach(function(s){
      var v=+s.getAttribute("data-rating");
      s.classList.toggle("is-on", v<=n);
      s.setAttribute("aria-checked", v===n ? "true" : "false");
    });
  }
  function burst(el){
    if(!el||reduce)return;
    el.classList.remove("is-pop");
    void el.offsetWidth;
    el.classList.add("is-pop");
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
      burst(btn);
      beacon("rating_selected",rating);
      beacon("review_redirect",rating);
      setTimeout(function(){ window.location.href=redirect; }, reduce?0:280);
      return;
    }
    if(rating<=3 && feedback){
      e.preventDefault();
      paint(rating);
      burst(btn);
      beacon("rating_selected",rating);
      if(ratingInput) ratingInput.value=String(rating);
      setTimeout(function(){
        if(ask) ask.hidden=true;
        if(hint) hint.hidden=true;
        form.classList.add("is-locked");
        stars.forEach(function(s){s.disabled=true});
        feedback.hidden=false;
        var ta=feedback.querySelector("textarea");
        if(ta) ta.focus();
      }, reduce?0:280);
    }
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
<div class="stage">
  <picture class="bg" aria-hidden="true">
    <source type="image/webp" srcset="/assets/hero.webp">
    <img src="/assets/hero.jpg" alt="" width="1024" height="1536">
  </picture>

  <header class="top">
    <div class="brand">
      ${headerLogo(settings)}
      <div class="brand-text">
        <div class="kicker">کلینیک شبانه روزی تخصصی</div>
        <div class="name">دندانپزشکی حکمت‌الشفاء</div>
      </div>
    </div>
    <button class="burger" id="burger" type="button" aria-label="منو" aria-expanded="false" aria-controls="drawer">
      <span></span><span></span><span></span>
    </button>
  </header>

  <button class="backdrop" id="backdrop" type="button" hidden aria-label="بستن منو"></button>
  <nav class="drawer" id="drawer" hidden aria-label="منو">
    <button class="drawer-close" id="drawer-close" type="button">بستن</button>
    ${socialLinks(settings)}
    <a class="drawer-link drawer-admin" href="/admin">پنل مدیریت</a>
  </nav>

  <div class="hero">
    <h1 id="ask">${COPY.ask}</h1>
    <p class="sub" id="hint">${COPY.sub}</p>
    <form id="rating-form" class="stars" method="post" action="/review/rate" dir="ltr" role="radiogroup" aria-labelledby="ask" data-redirect="${escapeHtml(redirectUrl || "")}" data-branch="${escapeHtml(branch || "")}">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      ${landingStarButtons()}
    </form>
    <p id="live" class="hp" aria-live="polite"></p>
  </div>

  <section class="float" id="feedback" hidden>
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

  <section class="float thanks" id="thanks" hidden>
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
  </section>
</div>`;

  return documentPage({
    title,
    themeColor: "#0B2A5B",
    css: landingCss(),
    body,
    script: LANDING_SCRIPT,
    bodyClass: "land",
    colorScheme: "light",
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
  <article class="sheet">
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
  </article>
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
  <article class="sheet">
  <section class="thanks">
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
  </section>
  </article>
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
  <article class="sheet">
  <section class="thanks">
    <h2>${COPY.noPlatformTitle}</h2>
    <p class="note">${COPY.noPlatformBody}</p>
  </section>
  </article>
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
