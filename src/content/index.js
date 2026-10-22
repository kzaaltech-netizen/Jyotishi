// Public-page content in every language. English is bundled; other languages load
// on demand (see ./locales/) and fall back to English for anything missing.
// Call loadLocale(code) before rendering a language, then read it with contentFor(code).

import { SITE, HOME_META, LEARN_META, HOME_FAQ } from './site.js';
import { GUIDES, LEARN_UPDATED } from './learn.js';
import { UI } from './ui.js';
import { APP } from './app/en.js';
import { DEFAULT_LOCALE, isLocale } from './locales.js';

const EN = {
  code: DEFAULT_LOCALE,
  site: SITE,
  homeMeta: HOME_META,
  learnMeta: LEARN_META,
  faq: HOME_FAQ,
  ui: UI,
  app: APP,
  guides: GUIDES,
  learnUpdated: LEARN_UPDATED,
};

// Public pages (home, Learn) and the app screens, loaded together per language.
const LOADERS = {
  hi: () => Promise.all([import('./locales/hi.js'), import('./app/hi.js')]),
  mr: () => Promise.all([import('./locales/mr.js'), import('./app/mr.js')]),
  bn: () => Promise.all([import('./locales/bn.js'), import('./app/bn.js')]),
  ta: () => Promise.all([import('./locales/ta.js'), import('./app/ta.js')]),
  te: () => Promise.all([import('./locales/te.js'), import('./app/te.js')]),
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Translated values win; arrays are taken whole; missing keys keep the English text.
function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base[k], v);
  return out;
}

const cache = { [DEFAULT_LOCALE]: EN };

export async function loadLocale(code) {
  if (cache[code]) return cache[code];
  if (!isLocale(code) || !LOADERS[code]) return EN;
  const [site, app] = await LOADERS[code]();
  const t = site.default;
  cache[code] = {
    code,
    site: deepMerge(SITE, t.site),
    homeMeta: deepMerge(HOME_META, t.homeMeta),
    learnMeta: deepMerge(LEARN_META, t.learnMeta),
    faq: t.faq || HOME_FAQ,
    ui: deepMerge(UI, t.ui),
    app: deepMerge(APP, app.default),
    guides: GUIDES.map((g) => deepMerge(g, t.guides?.[g.slug])),
    learnUpdated: t.learnUpdated || LEARN_UPDATED,
  };
  return cache[code];
}

export const contentFor = (code) => cache[code] || EN;
export const guideIn = (content, slug) => content.guides.find((g) => g.slug === slug) || null;
export const isLoaded = (code) => Boolean(cache[code]);
