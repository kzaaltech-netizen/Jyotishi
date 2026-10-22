// Page titles, descriptions, hreflang alternates and JSON-LD for every route. Shared
// by the browser (hooks/useSeo) and the build-time prerender script, so plain JS only.
// A language must be loaded (content/index.js loadLocale) before asking for its meta.

import { SITE } from '../content/site.js';
import { contentFor, guideIn } from '../content/index.js';
import { DEFAULT_LOCALE, LOCALES, localeInfo } from '../content/locales.js';
import { CONTACT, INFO_PAGES, NOT_FOUND, PAGES_UPDATED } from '../content/pages.js';
import { pathFor, INDEXABLE_PAGES } from './routes.js';

const PRIVATE_TITLES = {
  auth: 'Sign in',
  onboarding: 'Add your birth details',
  dashboard: 'Consult',
  ask: 'Consult',
  kundli: 'Your Kundli',
  horoscope: 'Today',
  analysis: 'Saved readings',
  wallet: 'Wallet',
  'buy-tokens': 'Add tokens',
  premium: 'Jyotishly Pro',
  profile: 'Profile',
  settings: 'Settings',
};

const abs = (path) => `${SITE.url}${path === '/' ? '' : path}`;

// Share image per page and language (scripts/og-images.mjs); other pages use the site image.
const ogImage = (lang, key) => `${SITE.url}/og/${lang}/${key}.jpg`;
const DEFAULT_IMAGE = `${SITE.url}/og-image.jpg`;

// The same page in every language, plus x-default (English) for everyone else.
const alternates = (page, param) => [
  ...LOCALES.map((l) => ({ hreflang: l.hreflang, href: abs(pathFor(page, param, l.code)) })),
  { hreflang: 'x-default', href: abs(pathFor(page, param, DEFAULT_LOCALE)) },
];

const organization = () => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  image: `${SITE.url}/og-image.jpg`,
  email: CONTACT.email,
  address: { '@type': 'PostalAddress', addressLocality: CONTACT.city, addressRegion: CONTACT.region, addressCountry: CONTACT.countryCode },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT.email, availableLanguage: LOCALES.map((l) => l.native) },
  parentOrganization: { '@type': 'Organization', name: SITE.publisher.name, url: SITE.publisher.url },
});

const website = () => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  inLanguage: LOCALES.map((l) => l.hreflang),
  publisher: { '@id': `${SITE.url}/#org` },
});

const faqPage = (faqs, url, inLanguage) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  inLanguage,
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

export function pageMeta(page, param, lang = DEFAULT_LOCALE) {
  // About, contact and policy pages exist only in English.
  if (INFO_PAGES[page]) lang = DEFAULT_LOCALE;
  const c = contentFor(lang);
  const { hreflang, og } = localeInfo(lang);
  const base = { lang: hreflang, ogLocale: og, image: DEFAULT_IMAGE };
  const home = pathFor('splash', null, lang);
  const learn = pathFor('learn', null, lang);

  if (page === 'learn' && param) {
    const g = guideIn(c, param);
    if (g) {
      const path = pathFor('learn', g.slug, lang);
      return {
        ...base,
        title: `${g.metaTitle} | ${SITE.name}`,
        image: ogImage(lang, g.slug),
        description: g.description,
        path,
        type: 'article',
        alternates: alternates('learn', g.slug),
        jsonLd: [
          organization(),
          {
            '@type': 'Article',
            '@id': `${abs(path)}#article`,
            headline: g.title,
            description: g.description,
            image: ogImage(lang, g.slug),
            abstract: g.short,
            inLanguage: hreflang,
            datePublished: c.learnUpdated,
            dateModified: c.learnUpdated,
            mainEntityOfPage: abs(path),
            author: { '@id': `${SITE.url}/#org` },
            publisher: { '@id': `${SITE.url}/#org` },
            about: { '@type': 'Thing', name: 'Vedic astrology (Jyotisha)' },
            ...(g.sources?.length ? { citation: g.sources.map((src) => ({ '@type': 'CreativeWork', name: src.title, url: src.url })) } : {}),
          },
          faqPage(g.faqs, abs(path), hreflang),
          breadcrumbs([[c.ui.nav.home, home], [c.ui.nav.learn, learn], [g.title, path]]),
        ],
      };
    }
  }

  if (page === 'learn') {
    return {
      ...base,
      ...c.learnMeta,
      image: ogImage(lang, 'learn'),
      path: learn,
      type: 'website',
      alternates: alternates('learn', null),
      jsonLd: [
        organization(),
        {
          '@type': 'CollectionPage',
          name: c.ui.learn.collection,
          url: abs(learn),
          inLanguage: hreflang,
          hasPart: c.guides.map((g) => ({ '@type': 'Article', headline: g.title, url: abs(pathFor('learn', g.slug, lang)) })),
        },
        breadcrumbs([[c.ui.nav.home, home], [c.ui.nav.learn, learn]]),
      ],
    };
  }

  if (page === 'splash' || !page) {
    return {
      ...base,
      ...c.homeMeta,
      image: ogImage(lang, 'home'),
      path: home,
      type: 'website',
      alternates: alternates('splash', null),
      jsonLd: [
        organization(),
        website(),
        {
          '@type': 'WebApplication',
          name: SITE.name,
          url: abs(home),
          inLanguage: hreflang,
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any (web browser)',
          description: c.site.description,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: c.ui.seo.offer },
          publisher: { '@id': `${SITE.url}/#org` },
        },
        faqPage(c.faq, abs(home), hreflang),
      ],
    };
  }

  // About, contact and policy pages: English only.
  if (INFO_PAGES[page]) {
    const info = INFO_PAGES[page];
    const path = pathFor(page);
    const type = { about: 'AboutPage', contact: 'ContactPage' }[page] || 'WebPage';
    return {
      ...base,
      title: info.metaTitle.includes(SITE.name) ? info.metaTitle : `${info.metaTitle} | ${SITE.name}`,
      description: info.description,
      path,
      type: 'website',
      alternates: [],
      jsonLd: [
        organization(),
        { '@type': type, name: info.title, url: abs(path), description: info.description, inLanguage: 'en-IN', dateModified: PAGES_UPDATED, about: { '@id': `${SITE.url}/#org` } },
        breadcrumbs([[c.ui.nav.home, '/'], [info.title, path]]),
      ],
    };
  }

  if (page === 'notfound') {
    return { ...base, title: `${NOT_FOUND.title} · ${SITE.name}`, description: NOT_FOUND.description, path: '/404', type: 'website', noindex: true, alternates: [], jsonLd: [] };
  }

  return {
    ...base,
    title: `${PRIVATE_TITLES[page] || SITE.name} · ${SITE.name}`,
    description: SITE.description,
    path: pathFor(page, param),
    type: 'website',
    noindex: !INDEXABLE_PAGES.has(page),
    alternates: [],
    jsonLd: [],
  };
}

export const ldGraph = (items) => JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
export const canonicalUrl = abs;
