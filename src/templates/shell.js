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
<meta name="color-scheme" content="light">
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

export const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.15l2.62 5.62 6.18.84-4.5 4.28 1.12 6.11L12 16.98l-5.42 2.02 1.12-6.11-4.5-4.28 6.18-.84L12 2.15z"/></svg>`;
