// Languages the public pages (home and Learn) are published in. English lives at the
// site root; every other language gets a path prefix, e.g. /hi/learn/sade-sati.
// Plain data only — the prerender script imports this file.

export const LOCALES = [
  { code: 'en', native: 'English', hreflang: 'en-IN', og: 'en_IN' },
  { code: 'hi', native: 'हिन्दी', hreflang: 'hi-IN', og: 'hi_IN' },
  { code: 'mr', native: 'मराठी', hreflang: 'mr-IN', og: 'mr_IN' },
  { code: 'bn', native: 'বাংলা', hreflang: 'bn-IN', og: 'bn_IN' },
  { code: 'ta', native: 'தமிழ்', hreflang: 'ta-IN', og: 'ta_IN' },
  { code: 'te', native: 'తెలుగు', hreflang: 'te-IN', og: 'te_IN' },
];

export const DEFAULT_LOCALE = 'en';
export const isLocale = (code) => LOCALES.some((l) => l.code === code);
export const localeInfo = (code) => LOCALES.find((l) => l.code === code) || LOCALES[0];

// The language the person chose earlier (Settings or the site switcher), if any.
export function storedLocale() {
  try {
    const code = localStorage.getItem('jy_site_lang') || localStorage.getItem('jyotish_lang');
    return isLocale(code) ? code : null;
  } catch {
    return null;
  }
}
