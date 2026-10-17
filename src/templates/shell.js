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
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
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

export const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" d="M12 3.05 14.97 8.11 20.7 9.37 16.8 13.76 17.38 19.6 12 17.25 6.62 19.6 7.2 13.76 3.3 9.37 9.03 8.11Z"/></svg>`;
