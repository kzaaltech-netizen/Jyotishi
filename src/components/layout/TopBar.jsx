import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Home,
  MessageSquareQuote,
  Compass,
  Scroll,
  BookOpen,
  User,
  Coins,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import { SUPPORTED_LANGUAGES, t } from '../../lib/i18n.js';
import { springTransition } from '../../lib/motion.js';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import './TopBar.css';

export default function TopBar() {
  const { currentPage, setCurrentPage, language, setLanguage } = useApp();
  const { balance } = useTokens();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { page: 'dashboard', Icon: Home, labelKey: 'home', defaultLabel: 'Home · गृह' },
    { page: 'ask', Icon: MessageSquareQuote, labelKey: 'ask', defaultLabel: 'Ask · प्रश्न' },
    { page: 'horoscope', Icon: Compass, labelKey: 'horoscope', defaultLabel: 'Horoscope · गोचर' },
    { page: 'kundli', Icon: Scroll, labelKey: 'kundli', defaultLabel: 'Kundli · पत्रिका' },
    { page: 'analysis', Icon: BookOpen, labelKey: 'reports', defaultLabel: 'Reports · विवरण' },
    { page: 'profile', Icon: User, labelKey: 'profile', defaultLabel: 'Profile · प्रोफ़ाइल' },
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const showNav = ['dashboard', 'ask', 'horoscope', 'kundli', 'profile', 'analysis', 'wallet', 'buy-tokens', 'premium', 'settings'].includes(currentPage);

  // 1. Landing Page Dedicated Top Navigation (Full-width, zero sidebar obstruction)
  if (currentPage === 'splash') {
    return (
      <header className="landing-topbar" role="banner">
        <div className="landing-topbar-inner">
          <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-logo-frame">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="brand-title-group text-left">
              <span className="brand-title font-headline">PARSHARA</span>
              <span className="brand-subtitle">वैदिक ज्योतिष तकनीक · Vedic Technology</span>
            </div>
          </button>

          <div className="landing-topbar-actions">
            <ThemeToggle />

              {/* Language Selector Dropdown */}
              <div className="lang-selector-wrapper landing-lang-wrap relative">
                <button
                  className="lang-btn"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  title="Change Language"
                  aria-expanded={langMenuOpen}
                >
                  <Globe className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span className="lang-label">{currentLangObj.native}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {langMenuOpen && (
                  <div className="lang-menu">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-option ${l.code === language ? 'lang-option-active' : ''}`}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangMenuOpen(false);
                        }}
                      >
                        <span className="lang-opt-native">{l.native}</span>
                        <span className="lang-opt-name">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="landing-signin-btn font-label-lg"
                onClick={() => setCurrentPage('auth')}
              >
                Sign In · प्रवेश
              </button>

              <button
                className="landing-cta-btn font-label-lg"
                onClick={() => setCurrentPage('onboarding')}
              >
                <Sparkles className="w-4 h-4 text-gold shrink-0" />
                <span>Create Kundli Free</span>
              </button>
            </div>
          </div>
        </header>
    );
  }

  // 2. Auth / Onboarding Clean Header
  if (currentPage === 'auth' || currentPage === 'onboarding') {
    return (
      <header className="minimal-topbar" role="banner">
        <div className="landing-topbar-inner">
          <button className="landing-brand" onClick={() => setCurrentPage('splash')}>
            <div className="brand-logo-frame">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="brand-title-group text-left">
              <span className="brand-title font-headline">PARSHARA</span>
              <span className="brand-subtitle">Return to Overview</span>
            </div>
          </button>

          <div className="landing-topbar-actions">
            <ThemeToggle compact />
            <button
              className="landing-signin-btn font-label-lg"
              onClick={() => setCurrentPage('splash')}
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR NAVIGATION (Screens >= 900px) ───────────────── */}
      <aside className="left-sidebar hide-mobile" role="navigation" aria-label="Desktop Sidebar Navigation">
        <div className="sidebar-inner">
          
          {/* Brand Header Emblem */}
          <button className="sidebar-brand" onClick={() => setCurrentPage('dashboard')}>
            <div className="brand-logo-frame">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="brand-title-group">
              <span className="brand-title font-headline">PARSHARA</span>
              <span className="brand-subtitle">
                <span className="cosmic-brand-sub">Vedic Astrological Intelligence</span>
                <span className="light-brand-sub">वैदिक ज्योतिष · Vedic Technology</span>
              </span>
            </div>
          </button>

          {/* Abhijit Muhurta Pill */}
          <div className="abhijit-badge">
            <span className="abhijit-dot"></span>
            <span className="abhijit-text">अभिजित मुहूर्त · Auspicious Window</span>
          </div>

          {/* Vertical Navigation Links */}
          {showNav && (
            <nav className="sidebar-nav">
              {NAV_ITEMS.map(({ page, Icon, labelKey, defaultLabel }) => {
                const active = currentPage === page;
                return (
                  <button
                    key={page}
                    className={`sidebar-nav-link relative ${active ? 'sidebar-nav-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <motion.div
                        layoutId="desktopNavIndicator"
                        className="desktop-nav-active-pill"
                        transition={springTransition}
                      />
                    )}
                    <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-primary' : 'text-on-surface-variant'}`} />
                    <span className="nav-item-label relative z-10">{t(labelKey, language, defaultLabel)}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Ancient Wisdom Modern Clarity Quote Flourish */}
          <div className="sidebar-quote-card">
            <p className="sidebar-quote font-editorial-italic">"From Ancient Wisdom to Modern Insight"</p>
            <div className="sidebar-quote-flourish">
              <span className="sidebar-om-gold">ॐ</span>
            </div>
          </div>

          {/* Sidebar Footer Controls: Language & Wallet */}
          <div className="sidebar-footer">
            {/* Global Theme Switcher */}
            <div className="sidebar-theme-wrapper">
              <ThemeToggle />
            </div>

            {/* Token Wallet Badge */}
            {showNav && (
              <button
                className="sidebar-token-badge"
                onClick={() => setCurrentPage('wallet')}
                title="Token Balance"
              >
                <Coins className="w-4 h-4 text-gold shrink-0" />
                <span className="token-label">Tokens:</span>
                <span className="token-count">{balance}</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="lang-selector-wrapper">
              <button
                className="lang-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Change Language"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-on-surface-variant" />
                <span className="lang-label">{currentLangObj.native}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="lang-menu">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-option ${l.code === language ? 'lang-option-active' : ''}`}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                    >
                      <span className="lang-opt-native">{l.native}</span>
                      <span className="lang-opt-name">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* ── DEDICATED CLEAN MOBILE APP HEADER (Screens < 900px) ─────────── */}
      <header className="mobile-app-header hide-desktop" role="banner">
        <button
          className="mobile-brand-link"
          onClick={() => setCurrentPage('dashboard')}
          aria-label="PARSHARA Home"
        >
          <div className="brand-logo-frame">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="mobile-brand-name font-headline">PARSHARA</span>
        </button>

        <div className="mobile-header-actions">
          <ThemeToggle compact />

          {showNav && (
            <button
              className="mobile-token-pill"
              onClick={() => setCurrentPage('wallet')}
              title="Token Balance"
            >
              <Coins className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>{balance}</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}
