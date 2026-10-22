// Page meta, hreflang and structured data (src/lib/seo.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMeta, ldGraph, canonicalUrl } from '../../src/lib/seo.js';
import { loadLocale } from '../../src/content/index.js';
import { LOCALES } from '../../src/content/locales.js';
import { GUIDES } from '../../src/content/learn.js';
import { pathFor, INFO_PAGE_KEYS } from '../../src/lib/routes.js';

for (const l of LOCALES) await loadLocale(l.code);
const SITE = 'https://jyotishly.com';
const PUBLIC = [['splash', null], ['learn', null], ...GUIDES.map((g) => ['learn', g.slug])];

test('public pages: title, description, canonical, image, language', () => {
  const titles = new Set();
  for (const { code, hreflang } of LOCALES) {
    for (const [page, param] of PUBLIC) {
      const m = pageMeta(page, param, code);
      assert.ok(m.title && m.description, `${code} ${page} ${param}`);
      assert.equal(canonicalUrl(m.path), `${SITE}${pathFor(page, param, code) === '/' ? '' : pathFor(page, param, code)}`);
      assert.equal(m.lang, hreflang);
      assert.match(m.image, /^https:\/\/jyotishly\.com\/og\/[a-z]{2}\/[a-z0-9-]+\.jpg$/);
      assert.ok(!m.noindex);
      assert.ok(!titles.has(m.title), `duplicate title: ${m.title}`);
      titles.add(m.title);
    }
  }
});

test('hreflang: every language plus x-default, and reciprocal', () => {
  for (const [page, param] of PUBLIC) {
    const sets = LOCALES.map(({ code }) => pageMeta(page, param, code).alternates.map((a) => `${a.hreflang} ${a.href}`).sort().join('|'));
    assert.equal(new Set(sets).size, 1, `${page} ${param}: every language lists the same alternates`);
    const alts = pageMeta(page, param, 'en').alternates;
    assert.equal(alts.length, LOCALES.length + 1);
    assert.ok(alts.some((a) => a.hreflang === 'x-default' && a.href === canonicalUrl(pathFor(page, param))));
  }
});

test('JSON-LD: valid graph with the right types', () => {
  for (const { code } of LOCALES) {
    for (const [page, param] of PUBLIC) {
      const m = pageMeta(page, param, code);
      const graph = JSON.parse(ldGraph(m.jsonLd))['@graph'];
      const types = graph.map((n) => n['@type']);
      assert.ok(types.includes('Organization'), 'organization');
      if (param) {
        const article = graph.find((n) => n['@type'] === 'Article');
        assert.ok(article && article.image && article.datePublished && article.citation?.length, `${code} ${param} article`);
        assert.ok(types.includes('FAQPage') && types.includes('BreadcrumbList'));
      }
      if (page === 'splash') assert.ok(types.includes('FAQPage') && types.includes('WebSite'));
    }
  }
  const org = pageMeta('splash').jsonLd.find((n) => n['@type'] === 'Organization');
  assert.ok(org.email && org.address?.addressCountry === 'IN' && org.contactPoint);
});

test('policy pages are English, indexable and typed; 404 and app screens are noindex', () => {
  for (const key of INFO_PAGE_KEYS) {
    const m = pageMeta(key, null, 'hi');
    assert.equal(m.lang, 'en-IN', `${key} stays English`);
    assert.ok(!m.noindex);
  }
  assert.equal(pageMeta('about').jsonLd[1]['@type'], 'AboutPage');
  assert.equal(pageMeta('contact').jsonLd[1]['@type'], 'ContactPage');
  assert.ok(pageMeta('notfound').noindex);
  for (const page of ['dashboard', 'kundli', 'settings', 'auth']) assert.ok(pageMeta(page).noindex, page);
});
