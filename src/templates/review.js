import { escapeHtml, safeImageSrc, isHttpUrl, normalizePhone } from "../utils.js";
import { documentPage, STAR_SVG, STAR_PATH } from "./shell.js";

const STAR_LABELS = [
  "امتیاز ۱ از ۵، خیلی ضعیف",
  "امتیاز ۲ از ۵، ضعیف",
  "امتیاز ۳ از ۵، متوسط",
  "امتیاز ۴ از ۵، خوب",
  "امتیاز ۵ از ۵، عالی",
];

const COPY = {
  ask: "میزان رضایت خود را ثبت کنید.",
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
  thanksTitle: "نظر و امتیاز شما ثبت شد",
  thanksBody: "سپاسگزاریم.",
  noPlatformTitle: "در حال حاضر امکان ثبت نظر فراهم نیست.",
  noPlatformBody: "لطفاً کمی بعد دوباره تلاش کنید.",
  title: "ثبت نظر",
  sub: "با امتیاز دادن به بهبود خدمات این مجموعه کمک میکنید",
};

const STAR_D = STAR_PATH;

const GLOBE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3.8 12h16.4M12 3.8c2.3 2.5 3.5 5.4 3.5 8.2s-1.2 5.7-3.5 8.2c-2.3-2.5-3.5-5.4-3.5-8.2s1.2-5.7 3.5-8.2z"/></svg>`;
const INSTAGRAM_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.1" cy="6.9" r="1.05" fill="currentColor"/></svg>`;
const PHONE_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7.2 3.8h3.1l1.2 3.2-1.9 1.2a12.4 12.4 0 0 0 5.2 5.2l1.2-1.9 3.2 1.2v3.1c0 .7-.6 1.4-1.3 1.5-7.2.9-13.3-5.2-12.4-12.4.1-.7.8-1.3 1.7-1.3z"/></svg>`;

function instagramFollow(settings) {
  const url = String(settings.instagram_url || "").trim();
  if (!isHttpUrl(url)) {
    return `<button class="instagram-follow" type="button" disabled aria-describedby="instagram-unconfigured">${INSTAGRAM_SVG}<span>پیج اینستاگرام و هم دنبال کنید</span></button><p class="instagram-note" id="instagram-unconfigured">لینک اینستاگرام هنوز تنظیم نشده است.</p>`;
  }
  return `<a class="instagram-follow" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${INSTAGRAM_SVG}<span>پیج اینستاگرام و هم دنبال کنید</span></a>`;
}

const INSTAGRAM_FOLLOW_CSS = `
.thanks .mark{
  width:52px;height:52px;flex:none;margin:0 auto 20px;border-radius:18px;
  color:#fff;background:linear-gradient(145deg,#42CC92 0%,#21AA71 55%,#168959 100%);
  border:1px solid rgba(255,255,255,.55);
  box-shadow:inset 0 2px 1px rgba(255,255,255,.3),0 8px 20px rgba(28,151,99,.18),0 0 0 8px rgba(42,180,122,.07);
}
.thanks .mark svg{width:26px;height:26px;filter:drop-shadow(0 1px 1px rgba(0,80,45,.15))}

.instagram-follow{
  border:0;font-family:inherit;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  max-width:100%;margin-top:26px;padding:14px 18px;border-radius:16px;
  background:linear-gradient(115deg,#A9379A,#C83772,#DA6545);
  color:#fff;text-decoration:none;font-size:.88rem;font-weight:600;line-height:1.8;
  box-shadow:0 5px 16px rgba(190,55,118,.16);transition:filter .2s ease;
}
.instagram-follow:disabled{cursor:not-allowed;opacity:.7}
.instagram-note{font-size:.75rem!important;margin-top:10px;color:var(--muted);line-height:1.8}
.instagram-follow svg{width:22px;height:22px;flex:none}
.instagram-follow:hover{filter:brightness(1.08)}
.instagram-follow:focus-visible{outline:2px solid #B53D86;outline-offset:4px}
`;

function glossyStarSvg(index) {
  const g = `sg${index}`;
  const h = `sh${index}`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="se${index}" x1="5" y1="3" x2="18" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFFFFF"/><stop offset=".48" stop-color="#F6FAFF"/><stop offset="1" stop-color="#CAD7E7"/>
      </linearGradient>
      <filter id="bevel${index}" x="-30%" y="-30%" width="160%" height="180%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation=".45" result="blur"/>
        <feOffset in="blur" dx="0" dy="-.65" result="offset"/>
        <feComposite in="SourceAlpha" in2="offset" operator="out" result="edge"/>
        <feFlood flood-color="#875013" flood-opacity=".25"/>
        <feComposite in2="edge" operator="in" result="shade"/>
        <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/></feMerge>
      </filter>
      <linearGradient id="${g}" x1="6" y1="2" x2="17" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFEBA6"/>
        <stop offset=".38" stop-color="#FFDB78"/>
        <stop offset=".7" stop-color="#FFC13C"/>
        <stop offset="1" stop-color="#E99A24"/>
      </linearGradient>
      <linearGradient id="${h}" x1="12" y1="3" x2="12" y2="11" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".7"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="shape-depth" d="${STAR_D}" transform="translate(0 .85)" fill="#AFBED2"/>
    <path class="shape-empty" d="${STAR_D}" fill="url(#se${index})" filter="url(#bevel${index})" stroke="#C4CDD8" stroke-width=".55" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="shape-gold" d="${STAR_D}" fill="url(#${g})" filter="url(#bevel${index})" stroke="#E7AD48" stroke-width=".7" stroke-linejoin="round" stroke-linecap="round"/>
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
  return "";
}

function contactCards(settings) {
  const phone = normalizePhone(settings.business_phone);
  const items = [
    ["وبسایت", isHttpUrl(settings.website_url || "") ? settings.website_url : "", GLOBE_SVG],
    ["اینستاگرام", isHttpUrl(settings.instagram_url || "") ? settings.instagram_url : "", INSTAGRAM_SVG],
    ["تماس", phone ? `tel:${phone}` : "", PHONE_SVG],
  ];
  return `<nav class="contact-cards" aria-label="راه‌های ارتباط با ما">${items.map(([label, href, icon]) =>
    href ? `<a class="contact-card" href="${escapeHtml(href)}"${href.startsWith("tel:") ? "" : ' target="_blank" rel="noopener noreferrer"'}>${icon}<span>${label}</span></a>`
      : `<span class="contact-card is-unconfigured" aria-disabled="true">${icon}<span>${label}</span></span>`
  ).join("")}</nav>`;
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
.contact-cards{
  position:absolute;top:max(18px, env(safe-area-inset-top));left:0;right:0;
  width:min(370px,calc(100% - 32px));margin-inline:auto;
  z-index:6;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;
}
.contact-card{
  display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;padding:10px 6px;
  text-decoration:none;color:var(--navy);font-size:.85rem;font-weight:500;
  border:1px solid rgba(255,255,255,.58);border-radius:16px;
  background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(240,249,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 6px 24px rgba(11,42,91,.05);
  backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);
  transition:background .2s ease;
}
.contact-card svg{width:18px;height:18px;flex:none;opacity:.8}
.contact-card svg [stroke]{stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
@media(max-width:350px){.contact-card{gap:5px;font-size:.78rem}.contact-card svg{width:16px;height:16px}}
a.contact-card:hover{background:rgba(255,255,255,.6)}
a.contact-card:focus-visible{outline:2px solid var(--navy);outline-offset:3px}
.contact-card.is-unconfigured{opacity:.55}
.top{
  position:absolute;
  top:auto;left:16px;right:16px;
  bottom:max(24px, env(safe-area-inset-bottom));
  z-index:5;
  display:flex;
  justify-content:center;
}
.brand{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  min-width:0;
  max-width:100%;
}
.logo{
  width:44px;
  height:44px;
  border-radius:12px;
  flex:none;
  object-fit:cover;
  background:#E7F3FC;
  border:1px solid rgba(11,42,91,.12);
}
.brand-text{
  min-width:0;text-align:center;
  padding:10px 12px;
  border:1px solid rgba(255,255,255,.58);
  border-radius:18px;
  background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(240,249,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(255,255,255,.12),0 6px 24px rgba(11,42,91,.05);
  backdrop-filter:blur(22px) saturate(140%);
  -webkit-backdrop-filter:blur(22px) saturate(140%);
}
.clinic-name{white-space:nowrap;font-size:clamp(12px,3.8vw,17px);font-weight:700;line-height:1.8}
.brand-admin-link{color:inherit;text-decoration:none}
.brand-admin-link:focus-visible{outline:2px solid var(--navy);outline-offset:3px;border-radius:4px}
.brand-text .kicker,.brand-text .name{white-space:normal;overflow-wrap:anywhere}

.brand-text .kicker{
  font-size:14px;
  font-weight:400;
  color:var(--navy);
  line-height:1.35;
  white-space:normal;
}
.brand-text .name{
  font-size:18px;
  font-weight:800;
  color:var(--navy);
  line-height:1.35;
  white-space:normal;
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
.hero-copy{
  width:100%;max-width:370px;
  padding:20px 18px;margin-bottom:12px;
  border:1px solid rgba(255,255,255,.58);
  border-radius:18px;
  background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(240,249,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(255,255,255,.12),0 8px 28px rgba(11,42,91,.06);
  backdrop-filter:blur(22px) saturate(140%);
  -webkit-backdrop-filter:blur(22px) saturate(140%);
}
.hero h1{
  font-size:clamp(16px,5vw,23px);
  white-space:nowrap;
  font-weight:700;
  color:#0B2A5B;
  line-height:1.6;
  margin:0 0 6px;
}
.hero .sub{
  font-size:14px;
  font-weight:400;
  color:#425B76;
  line-height:1.8;
  margin:0;
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
/* A quiet surface keeps the dimensional stars legible over the photo. */
.hero > .stars{
  width:fit-content;
  max-width:100%;
  gap:8px;
  padding:8px 12px;
  background:linear-gradient(135deg,rgba(255,255,255,.36),rgba(240,249,255,.12));
  border:1px solid rgba(255,255,255,.52);
  border-radius:18px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.65),inset 0 -1px 0 rgba(255,255,255,.1),0 6px 24px rgba(11,42,91,.05);
  backdrop-filter:blur(22px) saturate(140%);
  -webkit-backdrop-filter:blur(22px) saturate(140%);
}
.hero > .stars .star{width:clamp(42px,12vw,60px);height:clamp(42px,12vw,60px);flex:none}
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
  filter:drop-shadow(0 4px 6px rgba(11,42,91,.08));
  transition:transform .2s ease,filter .2s ease;
}
.star .shape-gold,
.star .shape-shine{display:none}
.star.is-on .shape-gold,
.star.is-on .shape-shine{display:block}
.star.is-on .shape-empty{display:none}
.star.is-on .shape-depth{fill:#C98B24}
.star.is-on svg{
  filter:drop-shadow(0 3px 4px rgba(255,155,0,.35)) drop-shadow(0 8px 14px rgba(255,168,0,.22));
}
@media (hover:hover){.star:hover svg{transform:translateY(-3px) rotate(-4deg)}}
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
  top:auto;
  left:0;
  right:0;
  bottom:0;
  height:75dvh;
  z-index:20;
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  background:#FAFCFE;
  border:1px solid rgba(255,255,255,.8);
  border-bottom:0;
  border-radius:28px 28px 0 0;
  padding:32px 24px max(24px, env(safe-area-inset-bottom));
  text-align:right;
  box-shadow:0 -12px 48px rgba(11,42,91,.18),0 -80vh 0 40vh rgba(11,42,91,.22);
  animation:sheet-up .38s cubic-bezier(.22,1,.36,1) both;
  scroll-padding:24px;
}
.sheet-handle{
  display:block;width:64px;height:28px;margin:-25px auto 16px;
  border:0;background:transparent;cursor:grab;touch-action:none;
}
.sheet-handle::before{
  content:"";display:block;width:36px;height:4px;border-radius:4px;
  background:#D4DEE7;margin:auto;
}
.sheet-handle:active{cursor:grabbing}
.sheet-handle:focus-visible{outline:2px solid var(--navy);border-radius:8px}
.float form,.float .field{min-width:0;max-width:100%}
.float textarea{max-width:100%;resize:vertical}
@keyframes sheet-up{
  from{transform:translateY(100%);opacity:0}
  to{transform:translateY(0);opacity:1}
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
.thanks{text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:32px 24px}
.thanks .mark{
  width:56px;height:56px;margin:0 auto 12px;border-radius:50%;
  background:#E5F7ED;color:#20965C;display:grid;place-items:center;
}
.thanks .mark svg{width:28px;height:28px}
.thanks h2{font-size:1.1rem;font-weight:800;margin-bottom:6px}
.thanks p{color:var(--muted);font-size:.95rem;line-height:1.8}
.error{color:#C23B3B;font-size:.88rem;margin:8px 0;text-align:center}
[hidden]{display:none !important}
.stage:has(#feedback:not([hidden])) .hero,
.stage:has(#thanks:not([hidden])) .hero{visibility:hidden;pointer-events:none}
@media (max-width:400px){
  .hero h1{font-size:clamp(16px,5vw,23px)}
  .hero .sub{font-size:13px}
  .star{width:52px;height:52px}
  .stars{gap:8px}
  .brand-text .name{font-size:16px}
  .brand-text .kicker{font-size:12px}
}
@media (max-height:700px){
  .hero{top:14%}
  .hero h1{font-size:clamp(16px,5vw,23px)}
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
  .star.is-pop,.star.is-pop .burst i,.drawer,.float,.contact-card{animation:none;transition:none}
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
  if(feedback){
    var handle=feedback.querySelector(".sheet-handle");
    var dragStart=null, dragY=0, closing=false;
    function dismissFeedback(){
      if(closing || feedback.hidden)return;
      closing=true;
      if(document.activeElement && feedback.contains(document.activeElement)) document.activeElement.blur();
      function finish(){
        feedback.hidden=true;
        feedback.style.transform="";
        feedback.style.animation="";
        feedback.style.transition="";
        form.classList.remove("is-locked");
        stars.forEach(function(star){star.disabled=false});
        if(ask)ask.hidden=false;
        if(hint)hint.hidden=false;
        closing=false;
        var selected=form.querySelector('[aria-checked="true"]');
        if(selected)selected.focus({preventScroll:true});
      }
      if(reduce){finish();return;}
      feedback.style.animation="none";
      feedback.style.transition="transform .25s ease";
      feedback.style.transform="translateY(100%)";
      setTimeout(finish,250);
    }
    handle.addEventListener("click",function(e){if(e.detail===0 || dragY<5)dismissFeedback();});
    handle.addEventListener("pointerdown",function(e){
      if(closing || (e.pointerType==="mouse" && e.button!==0))return;
      dragStart=e.clientY;dragY=0;
      handle.setPointerCapture(e.pointerId);
      feedback.style.animation="none";
      feedback.style.transition="none";
    });
    handle.addEventListener("pointermove",function(e){
      if(dragStart===null)return;
      dragY=Math.max(0,e.clientY-dragStart);
      feedback.style.transform="translateY("+dragY+"px)";
    });
    function endDrag(e){
      if(dragStart===null)return;
      dragStart=null;
      if(e.type!=="pointercancel" && dragY>70){dismissFeedback();return;}
      feedback.style.transition=reduce?"none":"transform .2s ease";
      feedback.style.transform="translateY(0)";
    }
    handle.addEventListener("pointerup",endDrag);
    handle.addEventListener("pointercancel",endDrag);
    feedback.addEventListener("keydown",function(e){if(e.key==="Escape")dismissFeedback();});
  }
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
        if(ta) ta.focus({preventScroll:true});
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
      e.preventDefault();
      var error=fbForm.querySelector(".submit-error");
      if(error){error.hidden=true;error.textContent="";}
      var comment=fbForm.querySelector("textarea[name=comment]");
      if(comment && comment.value.trim().length<3){
        error.textContent="لطفاً توضیحات را بنویسید (حداقل ۳ حرف).";
        error.hidden=false;
        comment.focus({preventScroll:true});
        return;
      }
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
          throw new Error(res.err||"ثبت نظر انجام نشد. لطفاً دوباره تلاش کنید.");
        }
      }).catch(function(err){
        if(btn){btn.disabled=false;btn.textContent=${JSON.stringify("ثبت")};}
        if(error){
          error.textContent=err.message==="Failed to fetch"?"ارتباط برقرار نشد. لطفاً دوباره تلاش کنید.":err.message;
          error.hidden=false;
        }
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

  ${contactCards(settings)}

  <header class="top">
    <div class="brand">
      ${headerLogo(settings)}
      <div class="brand-text">
        <div class="clinic-name">کلینیک تخصصی دندانپزشکی <a class="brand-admin-link" href="/admin">حکمت</a></div>
      </div>
    </div>
  </header>

  <div class="hero">
    <div class="hero-copy">
      <h1 id="ask">${COPY.ask}</h1>
      <p class="sub" id="hint">${COPY.sub}</p>
    </div>
    <form id="rating-form" class="stars" method="post" action="/review/rate" dir="ltr" role="radiogroup" aria-labelledby="ask" data-redirect="${escapeHtml(redirectUrl || "")}" data-branch="${escapeHtml(branch || "")}">
      <input type="hidden" name="branch" value="${escapeHtml(branch || "")}">
      ${landingStarButtons()}
    </form>
    <p id="live" class="hp" aria-live="polite"></p>
  </div>

  <section class="float" id="feedback" hidden>
    <button class="sheet-handle" type="button" aria-label="بستن فرم بازخورد"></button>
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
      <p class="error submit-error" role="alert" hidden></p>
      <button class="btn" type="submit">${COPY.send}</button>
    </form>
  </section>

  <section class="float thanks" id="thanks" role="status" aria-live="polite" hidden>
    <div class="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6.5 12 3.7 3.7 7.3-7.4" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
    ${instagramFollow(settings)}
  </section>
</div>`;

  return documentPage({
    title,
    themeColor: "#0B2A5B",
    css: landingCss() + INSTAGRAM_FOLLOW_CSS,
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
    css: reviewCss() + INSTAGRAM_FOLLOW_CSS,
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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6.5 12 3.7 3.7 7.3-7.4" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h2>${COPY.thanksTitle}</h2>
    <p>${COPY.thanksBody}</p>
    ${instagramFollow(settings)}
  </section>
  </article>
</main>`;
  return documentPage({
    title: COPY.thanksTitle,
    themeColor: "#000000",
    css: reviewCss() + INSTAGRAM_FOLLOW_CSS,
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
    css: reviewCss() + INSTAGRAM_FOLLOW_CSS,
    body,
    bodyClass: "review",
    colorScheme: "dark",
  });
}
