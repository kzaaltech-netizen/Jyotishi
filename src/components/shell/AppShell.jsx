import React from 'react';
import { m } from 'motion/react';
import { BookOpen, Diamond, MessageCircle, Plus, Sunrise, User } from '../icons/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import Brand from './Brand.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import TokenPill from '../ui/TokenPill.jsx';
import useT from '../../hooks/useT.js';

// `label` is a key into the app's nav text (content/app).
const NAV = [
  { page: 'dashboard', label: 'consult', Icon: MessageCircle, match: ['dashboard', 'ask'] },
  { page: 'kundli', label: 'kundli', Icon: Diamond },
  { page: 'horoscope', label: 'today', Icon: Sunrise },
  { page: 'learn', label: 'learn', Icon: BookOpen },
];
const MOBILE_NAV = [
  ...NAV.slice(0, 3),
  { page: 'profile', label: 'profile', Icon: User, match: ['profile', 'settings', 'analysis', 'wallet', 'buy-tokens', 'premium'] },
];

const isActive = (item, page) => (item.match || [item.page]).includes(page);

// Start a fresh conversation: ConsultPage listens for this event.
export function startNewConsultation() {
  window.dispatchEvent(new CustomEvent('jy:new-chat'));
}

function NavRail() {
  const { currentPage, setCurrentPage, user, birthProfile } = useApp();
  const { t, personName } = useT();
  const name = personName(user, birthProfile);

  return (
    <aside className="glass relative z-20 hidden w-[240px] shrink-0 flex-col gap-6 border-y-0 border-l-0 px-3 py-4 lg:flex">
      <div className="px-2">
        <Brand onClick={() => setCurrentPage('dashboard')} />
      </div>

      <button
        type="button"
        className="btn-ghost justify-start"
        onClick={() => {
          setCurrentPage('dashboard');
          startNewConsultation();
        }}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {t.nav.newChat}
      </button>

      <nav aria-label={t.nav.main} className="flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(item, currentPage);
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => setCurrentPage(item.page)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                active ? 'text-ink' : 'text-muted hover:bg-panel-2/70 hover:text-ink'
              }`}
            >
              {active && (
                <m.span layoutId="rail-active" className="absolute inset-0 rounded-xl bg-panel-2" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
              )}
              <item.Icon className="relative h-[18px] w-[18px]" aria-hidden="true" />
              <span className="relative">{t.nav[item.label]}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <div className="flex items-center justify-between px-1">
          <TokenPill />
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => setCurrentPage('profile')}
          aria-current={['profile', 'settings', 'analysis'].includes(currentPage) ? 'page' : undefined}
          className="flex min-h-[48px] items-center gap-3 rounded-xl px-2 text-left hover:bg-panel-2/70"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 truncate text-sm font-semibold">{name}</span>
        </button>
      </div>
    </aside>
  );
}

function MobileTop({ action }) {
  const { setCurrentPage } = useApp();
  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between border-x-0 border-t-0 px-3 py-2 lg:hidden">
      <Brand onClick={() => setCurrentPage('dashboard')} />
      <div className="flex items-center gap-1">
        {action}
        <TokenPill />
      </div>
    </header>
  );
}

function MobileTabs() {
  const { currentPage, setCurrentPage } = useApp();
  const { t } = useT();
  return (
    <nav aria-label={t.nav.main} className="glass safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-x-0 border-b-0 lg:hidden">
      {MOBILE_NAV.map((item) => {
        const active = isActive(item, currentPage);
        return (
          <button
            key={item.page}
            type="button"
            onClick={() => setCurrentPage(item.page)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? 'text-accent' : 'text-muted'}`}
          >
            <item.Icon className="h-5 w-5" aria-hidden="true" />
            {t.nav[item.label]}
          </button>
        );
      })}
    </nav>
  );
}

// Page frame: left rail on desktop, top bar + tab bar on phones.
// `fixed` pages (the chat) manage their own scrolling.
export default function AppShell({ children, fixed = false, mobileAction = null, hideMobileTop = false }) {
  return (
    <div className="relative z-10 flex h-dvh overflow-hidden">
      <NavRail />
      <div className="flex min-w-0 flex-1 flex-col">
        {!hideMobileTop && <MobileTop action={mobileAction} />}
        <main id="main" className={`min-h-0 flex-1 pb-[64px] lg:pb-0 ${fixed ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </main>
      </div>
      <MobileTabs />
    </div>
  );
}

// Standard content page wrapper with a heading block.
export function Page({ eyebrow, title, subtitle, actions, children, width = 'max-w-5xl' }) {
  return (
    <div className={`mx-auto w-full ${width} px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10`}>
      {(title || eyebrow) && (
        <m.header
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h1 className="mt-1.5 text-3xl sm:text-[34px]">{title}</h1>}
            {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </m.header>
      )}
      {children}
    </div>
  );
}
