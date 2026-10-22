import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useSky } from '../sky/NakshatraSky.jsx';
import Brand, { BrandLockup } from './Brand.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import AppLink from '../ui/AppLink.jsx';
import { X } from '../icons/index.jsx';
import useContent from '../../hooks/useContent.js';
import { SITE } from '../../content/site.js';
import { contentFor, loadLocale } from '../../content/index.js';
import { DEFAULT_LOCALE, LOCALES, isLocale } from '../../content/locales.js';
import { LOCALIZED_PAGES } from '../../lib/routes.js';

const HINT_KEY = 'jy_lang_hint';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// The language this visitor most likely wants, if it differs from the page's:
// their earlier choice, else a supported language from their browser settings.
function preferredLocale(current) {
  const chosen = readStorage('jy_site_lang');
  if (isLocale(chosen)) return chosen === current ? null : chosen;
  const browser = (navigator.languages?.length ? navigator.languages : [navigator.language || ''])
    .map((l) => l.slice(0, 2).toLowerCase());
  // Visitors on a translated page chose it (usually from search); leave them there.
  if (current !== DEFAULT_LOCALE) return null;
  return browser.find((c) => c !== DEFAULT_LOCALE && isLocale(c)) || null;
}

// A slim bar, written in the suggested language, offering to switch. Never redirects.
function LanguageHint() {
  const { locale, changeLocale } = useApp();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    setTarget(null);
    if (readStorage(HINT_KEY) === 'off') return undefined;
    const wanted = preferredLocale(locale);
    if (!wanted) return undefined;
    let live = true;
    loadLocale(wanted).then(() => live && setTarget(wanted));
    return () => {
      live = false;
    };
  }, [locale]);

  if (!target) return null;
  const t = contentFor(target).ui.banner;
  const dismiss = () => {
    try {
      localStorage.setItem(HINT_KEY, 'off');
    } catch {
      // Without storage the bar simply comes back next visit.
    }
    setTarget(null);
  };

  return (
    <div lang={target} className="relative z-30 flex items-center justify-center gap-3 bg-accent-soft px-4 py-2 text-sm">
      <span>{t.text}</span>
      <button type="button" className="font-semibold text-accent hover:underline" onClick={() => changeLocale(target)}>
        {t.cta}
      </button>
      <button type="button" onClick={dismiss} aria-label={t.dismiss} className="rounded p-1 text-muted hover:text-ink">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function LanguageSwitcher() {
  const { locale, changeLocale } = useApp();
  const { ui } = useContent();
  return (
    <>
      <label htmlFor="site-lang" className="sr-only">{ui.nav.language}</label>
      <select
        id="site-lang"
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="h-9 max-w-[7.5rem] cursor-pointer rounded-lg border border-line bg-panel px-2 text-sm text-ink hover:border-ink/30"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.hreflang}>{l.native}</option>
        ))}
      </select>
    </>
  );
}

function Footer() {
  const { ui, guides } = useContent();
  return (
    <footer className="relative z-10 border-t border-line/70 px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLockup height={76} />
          <p className="mt-3 max-w-xs text-sm text-muted">{ui.footer.tagline}</p>
        </div>
        <nav aria-label={ui.nav.learn}>
          <p className="text-sm font-semibold">{ui.nav.learn}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {guides.map((g) => (
              <li key={g.slug}>
                <AppLink page="learn" param={g.slug} className="hover:text-accent">{g.title}</AppLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Jyotishly">
          <p className="text-sm font-semibold">Jyotishly</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li><AppLink page="splash" className="hover:text-accent">{ui.nav.home}</AppLink></li>
            <li><AppLink page="learn" className="hover:text-accent">{ui.nav.allGuides}</AppLink></li>
            <li><AppLink page="onboarding" className="hover:text-accent">{ui.nav.getKundli}</AppLink></li>
            <li><AppLink page="auth" className="hover:text-accent">{ui.nav.signIn}</AppLink></li>
            <li><AppLink page="about" className="hover:text-accent">{ui.nav.about}</AppLink></li>
            <li><AppLink page="contact" className="hover:text-accent">{ui.nav.contact}</AppLink></li>
            <li><AppLink page="privacy" className="hover:text-accent">{ui.nav.privacy}</AppLink></li>
            <li><AppLink page="terms" className="hover:text-accent">{ui.nav.terms}</AppLink></li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-muted">
        {ui.footer.disclaimer}{' '}
        <a className="underline" href={SITE.publisher.url} target="_blank" rel="noopener noreferrer">{SITE.publisher.name}</a>.
      </p>
    </footer>
  );
}

// Frame for pages shown before sign-in: landing, Learn, auth, onboarding.
export default function PublicFrame({ children, footer = false }) {
  const { user, setCurrentPage, currentPage } = useApp();
  const { ui } = useContent();
  const { setDim } = useSky();
  // Only home and Learn are published in other languages.
  const translated = LOCALIZED_PAGES.has(currentPage);
  useEffect(() => {
    setDim(true);
    return () => setDim(false);
  }, [setDim]);
  return (
    <div className="relative z-10 flex min-h-dvh flex-col overflow-x-clip">
      {translated && <LanguageHint />}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line/60 bg-bg px-4 py-2.5 sm:px-8">
        <Brand onClick={() => setCurrentPage(user ? 'dashboard' : 'splash')} />
        <nav aria-label="Site" className="flex items-center gap-1">
          <AppLink page="learn" className="btn-quiet hidden whitespace-nowrap sm:inline-flex">{ui.nav.learn}</AppLink>
          {user ? (
            <AppLink page="dashboard" className="btn-quiet whitespace-nowrap">{ui.nav.openApp}</AppLink>
          ) : (
            <AppLink page="auth" className="btn-quiet whitespace-nowrap">{ui.nav.signIn}</AppLink>
          )}
          {translated && <LanguageSwitcher />}
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" className="flex flex-1 flex-col">{children}</main>
      {footer && <Footer />}
    </div>
  );
}
