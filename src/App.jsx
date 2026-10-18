import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { TokenProvider } from './context/TokenContext.jsx';

// Pages
import SplashPage        from './pages/SplashPage.jsx';
import AuthPage          from './pages/AuthPage.jsx';
import OnboardingPage    from './pages/OnboardingPage.jsx';
import DashboardPage     from './pages/DashboardPage.jsx';
import AskChartPage      from './pages/AskChartPage.jsx';
import HoroscopePage     from './pages/HoroscopePage.jsx';
import KundliPage        from './pages/KundliPage.jsx';
import ProfilePage       from './pages/ProfilePage.jsx';
import AnalysisPage      from './pages/AnalysisPage.jsx';
import TokenWalletPage   from './pages/TokenWalletPage.jsx';
import BuyTokensPage     from './pages/BuyTokensPage.jsx';
import PremiumPage       from './pages/PremiumPage.jsx';
import SettingsPage      from './pages/SettingsPage.jsx';

// Shown while AppContext bootstraps from backend
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--surface)', color: 'var(--on-surface)'
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: 'var(--surface-container-low)',
        border: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)', fontSize: 28 }}>
          auto_awesome
        </span>
      </div>
      <p className="font-editorial-italic" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>
        Consulting the Celestial Manuscript…
      </p>
    </div>
  );
}

import CurtainTransition from './components/ui/CurtainTransition.jsx';
import BookOpeningTransition from './components/ui/BookOpeningTransition.jsx';
import CosmicBackground from './components/layout/CosmicBackground.jsx';

function Router() {
  const {
    currentPage,
    setCurrentPage,
    setCurrentMode,
    theme,
    chartData,
    curtainActive,
    bookTransitionActive,
  } = useApp();

  // Global navigation helper for backwards compatibility
  useEffect(() => {
    window.__aj_navigate = (mode) => {
      setCurrentMode(mode);
      setCurrentPage('ask');
    };
    return () => { delete window.__aj_navigate; };
  }, [setCurrentMode, setCurrentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'loading':      return <LoadingScreen />;
      case 'splash':       return <SplashPage />;
      case 'auth':         return <AuthPage />;
      case 'onboarding':   return <OnboardingPage />;
      case 'dashboard':    return <DashboardPage />;
      case 'ask':          return <AskChartPage />;
      case 'horoscope':    return <HoroscopePage />;
      case 'kundli':       return <KundliPage />;
      case 'profile':      return <ProfilePage />;
      case 'analysis':     return <AnalysisPage />;
      case 'wallet':       return <TokenWalletPage />;
      case 'buy-tokens':   return <BuyTokensPage />;
      case 'premium':      return <PremiumPage />;
      case 'settings':     return <SettingsPage />;
      default:             return <DashboardPage />;
    }
  };

  return (
    <>
      <CosmicBackground lagnaSign={chartData?.lagna?.sign || 'Leo'} theme={theme} />
      <CurtainTransition isOpen={curtainActive} />
      <BookOpeningTransition isOpen={bookTransitionActive} />
      {renderPage()}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TokenProvider>
        <Router />
      </TokenProvider>
    </AppProvider>
  );
}

