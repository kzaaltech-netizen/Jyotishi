import React, { lazy, Suspense } from 'react';
import { AnimatePresence, LazyMotion, m, MotionConfig } from 'motion/react';

// Animation features arrive in their own chunk after the first paint.
const loadMotionFeatures = () => import('./lib/motionFeatures.js').then((mod) => mod.default);
import { AppProvider, useApp } from './context/AppContext.jsx';
import { TokenProvider } from './context/TokenContext.jsx';
import NakshatraSky, { SkyProvider } from './components/sky/NakshatraSky.jsx';
import { BrandLockup } from './components/shell/Brand.jsx';
import useChartSummary from './hooks/useChartSummary.js';

import SplashPage from './pages/SplashPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import InfoPage, { NotFoundPage } from './pages/InfoPage.jsx';

// Signed-in screens load in their own chunks, so home and Learn ship less JavaScript.
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));
const ConsultPage = lazy(() => import('./pages/ConsultPage.jsx'));
const HoroscopePage = lazy(() => import('./pages/HoroscopePage.jsx'));
const KundliPage = lazy(() => import('./pages/KundliPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.jsx'));
const TokenWalletPage = lazy(() => import('./pages/TokenWalletPage.jsx'));
const BuyTokensPage = lazy(() => import('./pages/BuyTokensPage.jsx'));
const PremiumPage = lazy(() => import('./pages/PremiumPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

import useSeo from './hooks/useSeo.js';
import { ACCOUNT_PAGES, PUBLIC_PAGES } from './lib/routes.js';

function LoadingScreen() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center" role="status">
      <m.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <BrandLockup height={120} />
      </m.div>
      <span className="mt-8 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" aria-label="Loading" />
    </div>
  );
}

const PAGES = {
  loading: LoadingScreen,
  splash: SplashPage,
  auth: AuthPage,
  onboarding: OnboardingPage,
  dashboard: ConsultPage,
  ask: ConsultPage,
  horoscope: HoroscopePage,
  kundli: KundliPage,
  profile: ProfilePage,
  analysis: AnalysisPage,
  wallet: TokenWalletPage,
  'buy-tokens': BuyTokensPage,
  premium: PremiumPage,
  settings: SettingsPage,
  learn: LearnPage,
  about: InfoPage,
  contact: InfoPage,
  privacy: InfoPage,
  terms: InfoPage,
  notfound: NotFoundPage,
};

function Router() {
  const { currentPage, routeParam, locale, theme, user } = useApp();
  useSeo(currentPage, routeParam, locale);
  const { moonNakshatra } = useChartSummary();
  // Chat needs an account; other app screens wait for the (guest) session.
  const needsAccount = ACCOUNT_PAGES.has(currentPage);
  const needsSession = !PUBLIC_PAGES.has(currentPage);
  const Page = needsAccount && (!user || user.isGuest)
    ? AuthPage
    : needsSession && !user ? LoadingScreen : PAGES[currentPage] || ConsultPage;
  // dashboard and ask are the same screen; don't replay the transition between them.
  const key = currentPage === 'ask' ? 'dashboard' : `${currentPage}:${routeParam || ''}`;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-panel focus:px-4 focus:py-2">
        Skip to content
      </a>
      <NakshatraSky nakshatra={moonNakshatra} theme={theme} />
      {/* No fade on first paint: the prerendered page should stay visible as it is replaced. */}
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Page />
          </Suspense>
        </m.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures}>
        <AppProvider>
          <TokenProvider>
            <SkyProvider>
              <Router />
            </SkyProvider>
          </TokenProvider>
        </AppProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
