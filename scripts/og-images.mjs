// Draws a 1200×630 share image (og:image) for the home page, the Learn index and
// every guide, in every language, into public/og/<lang>/<key>.jpg.
//
//   npm run og
//
// Run it after changing guide titles. It needs Google Chrome installed; set CHROME_PATH
// if Chrome is not in the default Windows location. Images are committed, so the
// production build does not need a browser.

import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { contentFor, loadLocale } from '../src/content/index.js';
import { LOCALES } from '../src/content/locales.js';

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('public/og');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Script-specific fonts so every language renders with real glyphs.
const FONT = {
  en: 'Fraunces',
  hi: 'Noto Serif Devanagari',
  mr: 'Noto Serif Devanagari',
  bn: 'Noto Serif Bengali',
  ta: 'Noto Serif Tamil',
  te: 'Noto Serif Telugu',
};
const FONTS_CSS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Manrope:wght@500;600&family=Noto+Serif+Devanagari:wght@500&family=Noto+Serif+Bengali:wght@500&family=Noto+Serif+Tamil:wght@500&family=Noto+Serif+Telugu:wght@500&family=Noto+Sans+Devanagari:wght@500&family=Noto+Sans+Bengali:wght@500&family=Noto+Sans+Tamil:wght@500&family=Noto+Sans+Telugu:wght@500&display=block';

const mark = `data:image/webp;base64,${(await readFile('public/brand/mark-light.webp')).toString('base64')}`;

function page({ lang, eyebrow, title, sub }) {
  const serif = FONT[lang];
  const sans = lang === 'en' ? 'Manrope' : serif.replace('Serif', 'Sans');
  const size = title.length > 60 ? 54 : title.length > 40 ? 62 : 72;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS_CSS}">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #f4ebda; color: #2a1a0e; font-family: '${sans}', 'Manrope', sans-serif; position: relative; overflow: hidden; }
  .wheel { position: absolute; right: -150px; top: -60px; width: 760px; height: 760px; opacity: .55; }
  .card { position: absolute; inset: 56px 64px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; font-family: 'Fraunces', serif; font-size: 34px; color: #2a1a0e; }
  .brand img { width: 58px; height: 58px; }
  .eyebrow { margin-top: 64px; font-size: 26px; font-weight: 600; color: #a9440a; letter-spacing: .02em; }
  h1 { margin-top: 18px; max-width: 840px; font-family: '${serif}', 'Fraunces', serif; font-weight: 500; font-size: ${size}px; line-height: 1.18; }
  p { margin-top: 22px; max-width: 760px; font-size: 26px; line-height: 1.45; color: #6b5440; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .foot { padding-top: 16px; }
  .foot { margin-top: auto; font-size: 24px; color: #a9440a; font-weight: 600; }
</style></head><body>
<svg class="wheel" viewBox="0 0 400 400" fill="none" stroke="#a9440a" stroke-opacity=".35">
  <rect x="40" y="40" width="320" height="320" stroke-width="2"/>
  <path d="M40 40L360 360M360 40L40 360M200 40L360 200L200 360L40 200Z" stroke-width="2"/>
  <circle cx="200" cy="200" r="190" stroke-dasharray="2 8"/>
</svg>
<div class="card">
  <div class="brand"><img src="${mark}" alt="">Jyotishly</div>
  <div class="eyebrow">${esc(eyebrow)}</div>
  <h1>${esc(title)}</h1>
  ${sub ? `<p>${esc(sub)}</p>` : ''}
  <div class="foot">jyotishly.com</div>
</div></body></html>`;
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, s.lastIndexOf(' ', n) > n * 0.6 ? s.lastIndexOf(' ', n) : n)}…` : s);

const browser = await chromium.launch({ executablePath: CHROME });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let count = 0;
for (const { code } of LOCALES) {
  await loadLocale(code);
  const c = contentFor(code);
  const items = [
    { key: 'home', eyebrow: c.ui.home.askLabel, title: `${c.ui.home.titleA} ${c.ui.home.titleB}`, sub: clip(c.ui.home.sub, 140) },
    { key: 'learn', eyebrow: c.ui.learn.eyebrow, title: c.ui.learn.title, sub: clip(c.ui.learn.sub, 140) },
    ...c.guides.map((g) => ({ key: g.slug, eyebrow: c.ui.learn.eyebrow, title: g.title, sub: clip(g.short, 150) })),
  ];
  await mkdir(path.join(OUT, code), { recursive: true });
  for (const it of items) {
    await tab.setContent(page({ lang: code, ...it }), { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: path.join(OUT, code, `${it.key}.jpg`), type: 'jpeg', quality: 82 });
    count += 1;
  }
}
await browser.close();
console.log(`og: ${count} images in public/og`);
