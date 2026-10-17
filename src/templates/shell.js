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

export const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" stroke="currentColor" stroke-width="2.35" stroke-linejoin="round" stroke-linecap="round" d="M12 3.15 15.03 8.03 20.61 9.4 16.9 13.79 17.32 19.52 12 17.35 6.68 19.52 7.1 13.79 3.39 9.4 8.97 8.03Z"/></svg>`;
