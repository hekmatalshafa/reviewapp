import { escapeHtml, sanitizeColor, DEFAULT_SETTINGS } from "../utils.js";

export function fontFace() {
  return `@font-face{font-family:"Vazirmatn";src:url("/fonts/Vazirmatn-Variable.woff2") format("woff2-variations"),url("/fonts/Vazirmatn-Variable.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap;}`;
}

export function documentPage({
  title,
  themeColor,
  css,
  body,
  script,
  extraHead = "",
  bodyClass = "",
  colorScheme = "light",
}) {
  const theme = sanitizeColor(themeColor, DEFAULT_SETTINGS.primary_color);
  const scriptTag = script
    ? `<script nonce="__NONCE__">${script}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${escapeHtml(theme)}">
<meta name="color-scheme" content="${escapeHtml(colorScheme)}">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>${escapeHtml(title)}</title>
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/Vazirmatn-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${fontFace()}${css}</style>
${extraHead}
<link rel="stylesheet" href="/buttons.css">
</head>
<body class="${escapeHtml(bodyClass)}">
${body}
${scriptTag}
</body>
</html>`;
}

export function applyNonce(html, nonce) {
  return html.replaceAll("__NONCE__", nonce);
}

export const STAR_PATH = "M10.65 3.7Q12 .85 13.35 3.7L15.15 7.4Q15.45 8.05 16.2 8.15L20.3 8.75Q23.4 9.2 21.15 11.4L18.2 14.25Q17.65 14.8 17.8 15.55L18.5 19.6Q19.05 22.7 16.3 21.25L12.75 19.35Q12 18.95 11.25 19.35L7.7 21.25Q4.95 22.7 5.5 19.6L6.2 15.55Q6.35 14.8 5.8 14.25L2.85 11.4Q.6 9.2 3.7 8.75L7.8 8.15Q8.55 8.05 8.85 7.4Z";

export const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" d="${STAR_PATH}"/></svg>`;
