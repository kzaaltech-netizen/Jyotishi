// Runs after `vite build`. Writes crawlable HTML for every public URL, in every
// language, so search engines and AI assistants see real content and the right
// <head> without running JavaScript, then writes sitemap.xml, llms.txt and llms-full.txt.
//
//   dist/index.html                      home, English (indexable, full landing content)
//   dist/learn/index.html                guide index, English
//   dist/learn/<slug>/index.html         one file per guide, English
//   dist/<lang>/…                        the same three for hi, mr, bn, ta, te
//   dist/app.html                        SPA shell for signed-in screens (noindex)

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pageMeta, ldGraph, canonicalUrl } from '../src/lib/seo.js';
import { SITE } from '../src/content/site.js';
import { contentFor, guideIn, loadLocale } from '../src/content/index.js';
import { DEFAULT_LOCALE, LOCALES } from '../src/content/locales.js';
import { pathFor, INFO_PAGE_KEYS } from '../src/lib/routes.js';
import { CONTACT, INFO_PAGES, NOT_FOUND, PAGES_UPDATED } from '../src/content/pages.js';

const DIST = path.resolve('dist');
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

for (const l of LOCALES) await loadLocale(l.code);
const EN = contentFor(DEFAULT_LOCALE);

function headFor(meta) {
  const url = canonicalUrl(meta.path);
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...(meta.alternates || []).map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`),
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    meta.jsonLd?.length ? `<script type="application/ld+json" id="ld-json">${ldGraph(meta.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

// Page bodies, one language at a time. `c` is that language's content.
function frame(c, lang, main) {
  const { nav, footer } = c.ui;
  const href = (page, param) => pathFor(page, param, lang);
  const langs = LOCALES.map((l) => `<a href="${pathFor('splash', null, l.code)}" hreflang="${l.hreflang}" lang="${l.hreflang}">${esc(l.native)}</a>`).join(' · ');
  return `<header><a href="${href('splash')}">${SITE.name}</a> · <a href="${href('learn')}">${esc(nav.learn)}</a> · <a href="/start">${esc(nav.getKundli)}</a> · <a href="/login">${esc(nav.signIn)}</a>
<nav aria-label="${esc(nav.language)}">${langs}</nav></header>
<main>${main}</main>
<footer><nav aria-label="${esc(nav.learn)}"><ul>${c.guides.map((g) => `<li><a href="${href('learn', g.slug)}">${esc(g.title)}</a></li>`).join('')}</ul></nav><nav aria-label="Jyotishly"><a href="/about">${esc(nav.about)}</a> · <a href="/contact">${esc(nav.contact)}</a> · <a href="/privacy">${esc(nav.privacy)}</a> · <a href="/terms">${esc(nav.terms)}</a></nav><p>${esc(footer.disclaimer)} <a href="${SITE.publisher.url}">${esc(SITE.publisher.name)}</a>.</p></footer>`;
}

const faqHtml = (faqs) => `<dl>${faqs.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>`;

const GUIDE_NAMES = { general: 'Parashara', career: 'Bhrigu', wealth: 'Garga', union: 'Vasishtha', abundance: 'Jaimini', forecast: 'Varahamihira' };

function homeBody(c, lang) {
  const h = c.ui.home;
  return frame(c, lang, `
<h1>${esc(h.titleA)} ${esc(h.titleB)}</h1>
<p>${esc(h.sub)}</p>
<p>${esc(h.freeNote)} <a href="/start">${esc(h.kundliLink)}</a></p>
<section><h2>${esc(h.chart.title)}</h2>
<p>${esc(h.chart.p1)}</p>
<p>${esc(h.chart.p2)}</p></section>
<section><h2>${esc(h.guides.title)}</h2><p>${esc(h.guides.sub)}</p><ul>
${Object.entries(GUIDE_NAMES).map(([mode, name]) => `<li>${esc(h.guides.items[mode].name || name)}: ${esc(h.guides.items[mode].topic)} — ${esc(h.guides.items[mode].about)}</li>`).join('')}
</ul></section>
<section><h2>${esc(h.learnTitle)}</h2><ul>${c.guides.map((g) => `<li><a href="${pathFor('learn', g.slug, lang)}">${esc(g.title)}</a> — ${esc(g.short)}</li>`).join('')}</ul></section>
<section><h2>${esc(h.faqTitle)}</h2>${faqHtml(c.faq)}</section>`);
}

function learnIndexBody(c, lang) {
  const t = c.ui.learn;
  return frame(c, lang, `<h1>${esc(t.title)}</h1>
<p>${esc(t.sub)}</p>
<ul>${c.guides.map((g) => `<li><h2><a href="${pathFor('learn', g.slug, lang)}">${esc(g.title)}</a></h2><p>${esc(g.short)}</p></li>`).join('')}</ul>`);
}

function guideBody(c, lang, g) {
  const t = c.ui.learn;
  const related = g.related.map((s) => guideIn(c, s)).filter(Boolean);
  return frame(c, lang, `<article>
<nav aria-label="Breadcrumb"><a href="${pathFor('splash', null, lang)}">${esc(c.ui.nav.home)}</a> / <a href="${pathFor('learn', null, lang)}">${esc(c.ui.nav.learn)}</a> / ${esc(g.title)}</nav>
<h1>${esc(g.title)}</h1>
<p><time datetime="${c.learnUpdated}">${esc(t.updated)} ${c.learnUpdated}</time></p>
<section aria-label="${esc(t.short)}"><h2>${esc(t.short)}</h2><p>${esc(g.short)}</p></section>
${g.sections.map((s) => `<section><h2>${esc(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}${s.list ? `<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</section>`).join('\n')}
<section><h2>${esc(t.faqs)}</h2>${faqHtml(g.faqs)}</section>
<nav aria-label="${esc(t.related)}"><h2>${esc(t.related)}</h2><ul>${related.map((r) => `<li><a href="${pathFor('learn', r.slug, lang)}">${esc(r.title)}</a></li>`).join('')}</ul></nav>
<p><a href="/start">${esc(t.ctaTitle)}</a></p>
${g.sources?.length ? `<section><h2>${esc(t.sources)}</h2><ul>${g.sources.map((s) => `<li><a href="${s.url}" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul></section>` : ''}
<p>${esc(t.disclaimer)}</p>
</article>`);
}

async function write(rel, html) {
  const file = path.join(DIST, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

function render(template, meta, body) {
  return template
    .replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
    .replace(/<meta property="og:locale" content="[^"]*"/, `<meta property="og:locale" content="${meta.ogLocale}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${meta.image}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${meta.image}"`)
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `${headFor(meta)}\n    ${preloadFor((meta.lang || '').slice(0, 2))}`)
    .replace('<!--app-->', body);
}

// Pages in other languages need that language's text chunks before the app can render;
// preload them so they download alongside the main script.
const manifest = JSON.parse(await readFile(path.join(DIST, '.vite/manifest.json'), 'utf8').catch(() => '{}'));
const preloadFor = (lang) =>
  lang === DEFAULT_LOCALE
    ? ''
    : [`src/content/locales/${lang}.js`, `src/content/app/${lang}.js`]
        .map((src) => manifest[src]?.file)
        .filter(Boolean)
        .map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`)
        .join('\n    ');

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
if (!template.includes('<!--seo:start-->') || !template.includes('<!--app-->')) {
  throw new Error('prerender: markers missing from dist/index.html');
}

// Signed-in screens: plain shell, never indexed.
await write('app.html', render(template, { ...pageMeta('dashboard'), noindex: true, jsonLd: [] }, ''));

const fileFor = (urlPath) => (urlPath === '/' ? 'index.html' : `${urlPath.slice(1)}/index.html`);
let pages = 0;
for (const { code } of LOCALES) {
  const c = contentFor(code);
  await write(fileFor(pathFor('splash', null, code)), render(template, pageMeta('splash', null, code), homeBody(c, code)));
  await write(fileFor(pathFor('learn', null, code)), render(template, pageMeta('learn', null, code), learnIndexBody(c, code)));
  for (const g of c.guides) {
    await write(fileFor(pathFor('learn', g.slug, code)), render(template, pageMeta('learn', g.slug, code), guideBody(c, code, g)));
  }
  pages += 2 + c.guides.length;
}

// About, contact and policy pages (English only), and the 404 page Vercel serves for unknown URLs.
const withEmail = (t) => esc(t).replaceAll(CONTACT.email, `<a href="mailto:${CONTACT.email}">${CONTACT.email}</a>`);
const sectionHtml = (s) =>
  `<section><h2>${esc(s.heading)}</h2>${s.paragraphs.map((x) => `<p>${withEmail(x)}</p>`).join('')}${
    s.list ? `<ul>${s.list.map((x) => `<li>${withEmail(x)}</li>`).join('')}</ul>` : ''
  }</section>`;
for (const key of INFO_PAGE_KEYS) {
  const info = INFO_PAGES[key];
  const body = frame(EN, DEFAULT_LOCALE, `<article><h1>${esc(info.title)}</h1>\n<p>${withEmail(info.intro)}</p>\n${info.sections.map(sectionHtml).join('\n')}\n</article>`);
  await write(fileFor(pathFor(key)), render(template, pageMeta(key), body));
  pages += 1;
}
await write(
  '404.html',
  render(
    template,
    pageMeta('notfound'),
    frame(EN, DEFAULT_LOCALE, `<h1>${esc(NOT_FOUND.title)}</h1><p>${esc(NOT_FOUND.body)}</p><ul><li><a href="/">Home</a></li><li><a href="/learn">All guides</a></li><li><a href="/start">Get your Kundli</a></li></ul>`)
  )
);

// sitemap.xml, with every language version of each page linked to the others.
const entries = [
  ['splash', null, '1.0'],
  ['learn', null, '0.8'],
  ...EN.guides.map((g) => ['learn', g.slug, '0.7']),
];
const urlXml = (page, param, priority, code) => {
  const alts = LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${canonicalUrl(pathFor(page, param, l.code))}" />`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(pathFor(page, param))}" />`)
    .join('\n');
  return `  <url>\n    <loc>${canonicalUrl(pathFor(page, param, code))}</loc>\n    <lastmod>${contentFor(code).learnUpdated}</lastmod>\n    <priority>${priority}</priority>\n${alts}\n  </url>`;
};
await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${LOCALES.flatMap((l) =>
    entries.map(([page, param, priority]) => urlXml(page, param, priority, l.code))
  ).join('\n')}\n${INFO_PAGE_KEYS.map(
    (key) => `  <url>\n    <loc>${canonicalUrl(pathFor(key))}</loc>\n    <lastmod>${PAGES_UPDATED}</lastmod>\n    <priority>0.3</priority>\n  </url>`
  ).join('\n')}\n</urlset>\n`
);

// llms.txt (https://llmstxt.org): a short map for AI assistants; llms-full.txt has every guide in full.
const llms = `# ${SITE.name}

> ${SITE.description}

Key facts:
- Product: ${SITE.name}, a Vedic astrology (Jyotish) web app built around chat, by ${SITE.publisher.name}.
- Calculation: sidereal zodiac, Lahiri (Chitra Paksha) ayanamsa; North and South Indian chart styles; Vimshottari dasha for timing.
- Inputs: date, time and place of birth.
- Languages: the chat replies in the user's language (English, Hindi, Hinglish and more). Guides are published in ${LOCALES.map((l) => l.native).join(', ')}.
- Answers are grounded in the user's own chart (Lagna, houses, nakshatra, current dasha); referenced houses and planets are highlighted on the chart.
- Readings are for reflection, not certainty.

## Guides
${EN.guides.map((g) => `- [${g.title}](${canonicalUrl(pathFor('learn', g.slug))}): ${g.description}`).join('\n')}

## Other languages
${LOCALES.filter((l) => l.code !== DEFAULT_LOCALE)
  .map((l) => `- [${l.native}](${canonicalUrl(pathFor('splash', null, l.code))}) · [${contentFor(l.code).ui.learn.title}](${canonicalUrl(pathFor('learn', null, l.code))})`)
  .join('\n')}

## Pages
- [Home](${SITE.url}): what ${SITE.name} does and FAQ
- [All guides](${canonicalUrl('/learn')})
- [About](${canonicalUrl('/about')}): who makes ${SITE.name}, how charts are calculated, what the AI guides will not do
- [Contact](${canonicalUrl('/contact')}): ${CONTACT.email}
- [Privacy policy](${canonicalUrl('/privacy')}) · [Terms and disclaimer](${canonicalUrl('/terms')})
- [Full guide text for LLMs](${canonicalUrl('/llms-full.txt')})
`;
await write('llms.txt', llms);

const guideText = (c, lang) =>
  c.guides
    .map(
      (g) =>
        `## ${g.title}\nSource: ${canonicalUrl(pathFor('learn', g.slug, lang))}\n\n${g.short}\n\n${g.sections
          .map((s) => `### ${s.heading}\n\n${[...s.paragraphs, ...(s.list ? [s.list.map((x) => `- ${x}`).join('\n')] : [])].join('\n\n')}`)
          .join('\n\n')}\n\n### ${c.ui.learn.faqs}\n\n${g.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}${
          g.sources?.length ? `\n\n### ${c.ui.learn.sources}\n\n${g.sources.map((s) => `- [${s.title}](${s.url})`).join('\n')}` : ''
        }`
    )
    .join('\n\n---\n\n');

const full = `# ${SITE.name} — full guide text\n\n${SITE.description}\n\n${guideText(EN, DEFAULT_LOCALE)}\n\n## FAQ\n\n${EN.faq
  .map((f) => `Q: ${f.q}\nA: ${f.a}`)
  .join('\n\n')}\n${LOCALES.filter((l) => l.code !== DEFAULT_LOCALE)
  .map((l) => `\n\n# ${l.native} (${l.hreflang})\n\n${guideText(contentFor(l.code), l.code)}`)
  .join('')}\n`;
await write('llms-full.txt', full);

// The manifest was only needed here; do not publish it.
await rm(path.join(DIST, '.vite'), { recursive: true, force: true });

console.log(`prerender: ${pages} pages in ${LOCALES.length} languages, sitemap.xml, llms.txt, llms-full.txt`);
