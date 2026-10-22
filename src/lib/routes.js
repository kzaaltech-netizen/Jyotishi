// URL <-> screen mapping. The app keeps `currentPage` state; these helpers give
// every screen a real address so links, the back button and search engines work.

import { DEFAULT_LOCALE, isLocale, storedLocale } from '../content/locales.js';

export const SITE_URL = 'https://jyotishly.com';

const PATHS = {
  splash: '/',
  auth: '/login',
  onboarding: '/start',
  dashboard: '/chat',
  ask: '/chat',
  kundli: '/kundli',
  horoscope: '/today',
  analysis: '/readings',
  wallet: '/wallet',
  'buy-tokens': '/wallet/buy',
  premium: '/pro',
  profile: '/profile',
  settings: '/settings',
  learn: '/learn',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

// Screens anyone may open without signing in, and that search engines may index.
export const INFO_PAGE_KEYS = ['about', 'contact', 'privacy', 'terms'];
export const PUBLIC_PAGES = new Set(['splash', 'auth', 'learn', 'notfound', ...INFO_PAGE_KEYS]);
export const INDEXABLE_PAGES = new Set(['splash', 'learn', ...INFO_PAGE_KEYS]);
// Screens that need a signed-in account. Everything else (chat, Kundli, Today, profile)
// also opens on a guest session; sending a chat question asks for sign-in.
export const ACCOUNT_PAGES = new Set(['buy-tokens', 'premium']);

// Screens published in every language, under a prefix such as /hi.
export const LOCALIZED_PAGES = new Set(['splash', 'learn']);

export function pathFor(page, param, lang = DEFAULT_LOCALE) {
  const base = PATHS[page] || '/';
  const path = page === 'learn' && param ? `${base}/${param}` : base;
  if (!lang || lang === DEFAULT_LOCALE || !LOCALIZED_PAGES.has(page)) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

export function parsePath(pathname = '/') {
  let clean = pathname.replace(/\/+$/, '') || '/';
  let lang = DEFAULT_LOCALE;
  const prefix = clean.match(/^\/([a-z]{2})(?=\/|$)/);
  if (prefix && prefix[1] !== DEFAULT_LOCALE && isLocale(prefix[1])) {
    lang = prefix[1];
    clean = clean.slice(3) || '/';
  }
  let page = null;
  let param = null;
  if (clean.startsWith('/learn/')) {
    page = 'learn';
    param = clean.slice('/learn/'.length);
  } else {
    const entry = Object.entries(PATHS).find(([p, path]) => path === clean && p !== 'ask');
    // Unknown addresses get the 404 screen; the root is home.
    page = entry ? entry[0] : clean === '/' ? null : 'notfound';
  }
  // Only home and Learn exist in other languages.
  if (lang !== DEFAULT_LOCALE && page && !LOCALIZED_PAGES.has(page)) page = 'notfound';
  return { page, param, lang };
}

// Language to start in: the URL's for home and Learn, otherwise the person's saved choice.
export function initialLocale(pathname) {
  const { page, lang } = parsePath(pathname);
  if (lang !== DEFAULT_LOCALE || LOCALIZED_PAGES.has(page)) return lang;
  return storedLocale() || DEFAULT_LOCALE;
}
