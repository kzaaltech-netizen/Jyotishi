// Content and translations: every language complete and consistent with English.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLocale, contentFor } from '../../src/content/index.js';
import { LOCALES } from '../../src/content/locales.js';
import { APP } from '../../src/content/app/en.js';
import { UI } from '../../src/content/ui.js';
import { GUIDES, FEATURED_GUIDES } from '../../src/content/learn.js';
import { INFO_PAGES, CONTACT } from '../../src/content/pages.js';

for (const l of LOCALES) await loadLocale(l.code);

const flat = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out[key] = v;
  }
  return out;
};
const vars = (s) => (typeof s === 'string' ? (s.match(/\{\w+\}/g) || []).sort().join(',') : '');
const slugs = new Set(GUIDES.map((g) => g.slug));

test('app and site text: same keys and placeholders in every language', async () => {
  const enApp = flat(APP);
  const enUi = flat(UI);
  for (const { code } of LOCALES.filter((l) => l.code !== 'en')) {
    const app = flat((await import(`../../src/content/app/${code}.js`)).default);
    const ui = flat((await import(`../../src/content/locales/${code}.js`)).default.ui);
    for (const [en, tr, label] of [[enApp, app, 'app'], [enUi, ui, 'ui']]) {
      const missing = Object.keys(en).filter((k) => !(k in tr) && !k.startsWith('names.nakshatras'));
      assert.deepEqual(missing, [], `${code} ${label} missing keys`);
      const extra = Object.keys(tr).filter((k) => !(k in en) && !/^names\.(nakshatras|abbr)/.test(k));
      assert.deepEqual(extra, [], `${code} ${label} unknown keys`);
      for (const k of Object.keys(tr)) if (k in en) assert.equal(vars(tr[k]), vars(en[k]), `${code} ${label} ${k} placeholders`);
    }
  }
});

test('every guide is translated with the same structure', async () => {
  for (const { code } of LOCALES.filter((l) => l.code !== 'en')) {
    const raw = (await import(`../../src/content/locales/${code}.js`)).default.guides;
    for (const g of GUIDES) {
      const t = raw[g.slug];
      assert.ok(t, `${code} ${g.slug} translated`);
      assert.equal(t.sections.length, g.sections.length, `${code} ${g.slug} sections`);
      t.sections.forEach((s, i) => assert.equal(s.list?.length || 0, g.sections[i].list?.length || 0, `${code} ${g.slug} list ${i}`));
      assert.equal(t.faqs.length, g.faqs.length, `${code} ${g.slug} faqs`);
      for (const f of ['title', 'metaTitle', 'description', 'short', 'ask']) assert.ok(t[f]?.trim(), `${code} ${g.slug} ${f}`);
    }
  }
});

test('guides: answer-first, linked, sourced, sized for search', () => {
  for (const { code } of LOCALES) {
    for (const g of contentFor(code).guides) {
      const words = g.short.split(/\s+/).length;
      assert.ok(words >= 25 && words <= 90, `${code} ${g.slug} short answer is ${words} words`);
      assert.ok([...g.description].length <= 175, `${code} ${g.slug} description ${[...g.description].length} chars`);
      assert.ok([...`${g.metaTitle} | Jyotishly`].length <= 75, `${code} ${g.slug} title too long`);
      assert.ok(g.faqs.length >= 2, `${code} ${g.slug} faqs`);
    }
  }
  for (const g of GUIDES) {
    assert.ok(g.related.length >= 2 && g.related.every((s) => slugs.has(s) && s !== g.slug), `${g.slug} related`);
    assert.ok(g.sources.length >= 2, `${g.slug} sources`);
    for (const s of g.sources) assert.match(s.url, /^https:\/\/[^\s]+$/, `${g.slug} source url`);
  }
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, GUIDES.length, 'slugs are unique');
  for (const s of FEATURED_GUIDES) assert.ok(slugs.has(s), `featured ${s}`);
});

test('home page chart examples highlight words that appear in the answer', () => {
  for (const { code } of LOCALES) {
    for (const ex of contentFor(code).ui.home.chart.examples) assert.ok(ex.a.includes(ex.mark), `${code}: "${ex.mark}"`);
  }
});

test('home FAQ exists in every language with eight questions', () => {
  for (const { code } of LOCALES) assert.equal(contentFor(code).faq.length, 8, code);
});

test('policy pages are complete and use the real contact email', () => {
  for (const key of ['about', 'contact', 'privacy', 'terms']) {
    const p = INFO_PAGES[key];
    assert.ok(p.title && p.description && p.intro && p.sections.length, key);
    assert.ok([...p.description].length <= 175, `${key} description`);
  }
  assert.match(CONTACT.email, /^[^@\s]+@[^@\s]+\.[a-z]+$/);
  const privacy = JSON.stringify(INFO_PAGES.privacy);
  for (const service of ['Gemini', 'Neon', 'Vercel', 'Nominatim']) assert.ok(privacy.includes(service), `privacy lists ${service}`);
  assert.ok(privacy.includes('Delete account'), 'privacy explains self-service deletion');
});
