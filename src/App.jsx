import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { TokenProvider } from './context/TokenContext.jsx';

// Pages
import SplashPage        from './pages/SplashPage.jsx';
import AuthPage          from './pages/AuthPage.jsx';
import OnboardingPage    from './pages/OnboardingPage.jsx';
import DashboardPage     from './pages/DashboardPage.jsx';
import AnalysisPage      from './pages/AnalysisPage.jsx';
import TokenWalletPage   from './pages/TokenWalletPage.jsx';
import BuyTokensPage     from './pages/BuyTokensPage.jsx';
import PremiumPage       from './pages/PremiumPage.jsx';
import SettingsPage      from './pages/SettingsPage.jsx';

// Shown while AppContext bootstraps from the backend
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--background)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(242,202,80,0.15), rgba(110,6,208,0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'orb-pulse 2s ease-in-out infinite',
      }}>
        <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--primary)', fontSize: 26 }}>
          auto_awesome
        </span>
      </div>
      <p className="body-md text-muted">Connecting to the cosmos…</p>
    </div>
  );
}


function Router() {
  const { currentPage, currentMode, setCurrentPage, setCurrentMode } = useApp();

  // Global navigation helper for components that can't use context directly
  useEffect(() => {
    window.__aj_navigate = (mode) => {
      setCurrentMode(mode);
      setCurrentPage(mode === 'general' ? 'dashboard' : 'analysis');
    };
    return () => { delete window.__aj_navigate; };
  }, [setCurrentMode, setCurrentPage]);

  switch (currentPage) {
    case 'loading':      return <LoadingScreen />;
    case 'splash':       return <SplashPage />;
    case 'auth':         return <AuthPage />;
    case 'onboarding':   return <OnboardingPage />;
    case 'dashboard':    return <DashboardPage />;
    case 'analysis':     return <AnalysisPage />;
    case 'wallet':       return <TokenWalletPage />;
    case 'buy-tokens':   return <BuyTokensPage />;
    case 'premium':      return <PremiumPage />;
    case 'settings':     return <SettingsPage />;
    default:             return <SplashPage />;
  }
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
