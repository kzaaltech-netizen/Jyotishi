import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import './TopBar.css';

export default function TopBar() {
  const { user, currentPage, setCurrentPage, currentMode, setCurrentMode } = useApp();
  const { balance } = useTokens();

  const NAV_ITEMS = [
    { key: 'dashboard', mode: 'general',    label: 'Cosmos',   icon: 'auto_awesome' },
    { key: 'analysis',  mode: 'career',     label: 'Career',   icon: 'work' },
    { key: 'analysis',  mode: 'wealth',     label: 'Wealth',   icon: 'payments' },
    { key: 'analysis',  mode: 'abundance',  label: 'Abundance',icon: 'eco' },
    { key: 'analysis',  mode: 'union',      label: 'Union',    icon: 'favorite' },
  ];

  const isActive = (item) => {
    if (item.key === 'dashboard') return currentPage === 'dashboard' && currentMode === 'general';
    return currentPage === 'analysis' && currentMode === item.mode;
  };

  const handleNav = (item) => {
    setCurrentMode(item.mode);
    setCurrentPage(item.key);
  };

  const showNav = ['dashboard', 'analysis', 'wallet', 'chat-history', 'settings'].includes(currentPage);

  return (
    <header className="topbar">
      {/* Brand */}
      <button className="topbar-brand" onClick={() => { setCurrentPage('dashboard'); setCurrentMode('general'); }}>
        <div className="brand-icon floating">
          <span className="material-symbols-outlined icon-filled">auto_awesome</span>
        </div>
        <span className="brand-name headline-md">Aetheric Jyotish</span>
      </button>

      {/* Desktop Nav */}
      {showNav && (
        <nav className="topbar-nav hide-mobile">
          {NAV_ITEMS.map(item => (
            <button
              key={`${item.key}-${item.mode}`}
              className={`nav-link label-sm ${isActive(item) ? 'nav-link-active' : ''}`}
              onClick={() => handleNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Right Side */}
      <div className="topbar-right">
        {showNav && (
          <>
            <button
              className="token-badge"
              onClick={() => setCurrentPage('wallet')}
              title="Token Wallet"
            >
              <span className="material-symbols-outlined">toll</span>
              <span>{balance} Tokens</span>
            </button>
            <button
              className="topbar-icon-btn"
              onClick={() => setCurrentPage('settings')}
              title="Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
