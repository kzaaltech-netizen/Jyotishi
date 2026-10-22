// Checks the built site (dist/) for SEO regressions. Runs after the prerender in
// `npm run build` and fails the build on errors; warnings are printed only.
//
// Checked for every published page: title, meta description, canonical URL that
// matches its path, one <h1>, html lang, robots meta, hreflang links that point
// at pages which exist, valid JSON-LD, share image present, and internal links
// that lead somewhere. sitemap.xml must list only pages that exist.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://jyotishly.com';
// Screens the SPA serves from app.html (see vercel.json).
const APP_ROUTES = new Set(['/chat', '/kundli', '/today', '/readings', '/wallet', '/wallet/buy', '/pro', '/profile', '/settings', '/login', '/start']);

const errors = [];
const warnings = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'assets') out.push(...(await htmlFiles(p)));
    } else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const urlPathOf = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  return `/${rel.replace(/\/?index\.html$/, '')}`;
};

const exists = async (p) => stat(p).then(() => true, () => false);
// Does a site path resolve to a published page or an app route?
async function resolves(p) {
  const clean = p.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
  if (APP_ROUTES.has(clean)) return true;
  if (clean === '/') return exists(path.join(DIST, 'index.html'));
  if (/\.[a-z0-9]+$/i.test(clean)) return exists(path.join(DIST, clean));
  return exists(path.join(DIST, clean, 'index.html'));
}

const attr = (html, re) => (html.match(re) || [])[1];
const textLen = (s) => [...(s || '')].length;

const files = (await htmlFiles(DIST)).filter((f) => !['app.html', '404.html'].includes(path.basename(f)) || path.dirname(f) !== DIST);
const pages = new Map();

for (const file of files) {
  const page = urlPathOf(file);
  const html = await readFile(file, 'utf8');
  pages.set(page, html);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const lang = attr(html, /<html lang="([^"]*)"/);
  const image = attr(html, /<meta property="og:image" content="([^"]*)"/);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;

  if (!title) err(page, 'missing <title>');
  else if (textLen(title) > 75) warn(page, `title is ${textLen(title)} characters`);
  if (!desc) err(page, 'missing meta description');
  else if (textLen(desc) > 175) warn(page, `description is ${textLen(desc)} characters`);
  if (!canonical) err(page, 'missing canonical');
  else if (canonical !== `${SITE}${page === '/' ? '' : page}`) err(page, `canonical ${canonical} does not match the page URL`);
  if (h1s !== 1) err(page, `${h1s} <h1> elements (expected 1)`);
  if (!lang) err(page, 'missing <html lang>');
  if (!robots?.startsWith('index')) err(page, `robots meta is "${robots}" on a public page`);
  if (!image) err(page, 'missing og:image');
  else if (image.startsWith(SITE) && !(await exists(path.join(DIST, image.slice(SITE.length))))) err(page, `og:image ${image} not found`);

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      err(page, `invalid JSON-LD: ${e.message}`);
    }
  }

  for (const [, href] of html.matchAll(/<link rel="alternate" hreflang="[^"]*" href="([^"]*)"/g)) {
    if (!(await resolves(href.slice(SITE.length) || '/'))) err(page, `hreflang target ${href} does not exist`);
  }

  for (const [, href] of html.matchAll(/<a [^>]*href="(\/[^"]*)"/g)) {
    if (!(await resolves(href))) err(page, `broken internal link ${href}`);
  }
}

// Every hreflang set should be reciprocal: if A lists B, B lists A.
for (const [page, html] of pages) {
  const self = `${SITE}${page === '/' ? '' : page}`;
  for (const [, href] of html.matchAll(/<link rel="alternate" hreflang="(?!x-default)[^"]*" href="([^"]*)"/g)) {
    const other = pages.get(href.slice(SITE.length) || '/');
    if (other && !other.includes(`href="${self}"`)) err(page, `hreflang to ${href} is not returned`);
  }
}

const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8').catch(() => '');
if (!sitemap) err('sitemap.xml', 'missing');
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) {
  if (!pages.has(loc.slice(SITE.length) || '/')) err('sitemap.xml', `${loc} is not a published page`);
}
for (const page of pages.keys()) {
  if (!locs.includes(`${SITE}${page === '/' ? '' : page}`)) warn(page, 'not listed in sitemap.xml');
}
if (!(await exists(path.join(DIST, 'robots.txt')))) err('robots.txt', 'missing');
if (!(await exists(path.join(DIST, '404.html')))) err('404.html', 'missing');

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);
console.log(`audit-seo: ${pages.size} pages, ${locs.length} sitemap URLs, ${errors.length} errors, ${warnings.length} warnings`);
if (errors.length) process.exitCode = 1;
