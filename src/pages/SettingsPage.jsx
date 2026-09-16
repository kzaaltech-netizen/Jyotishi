import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import { SUPPORTED_LANGUAGES } from '../lib/i18n.js';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, birthProfile, logout, subscription, setCurrentPage, language, setLanguage, theme } = useApp();
  const { balance } = useTokens();
  const [section, setSection] = useState('account');

  const isPremium = subscription && new Date(subscription.endDate) > new Date();

  return (
    <div className="settings-page-wrapper">
      <TopBar />

      <main className="settings-main">
        <div className="app-container">

          <section className="settings-hero-card">
            <span className="font-label-sm text-gold uppercase font-semibold">विन्यास · System Preferences</span>
            <h1 className="font-headline-xl text-ivory">Settings & Preferences</h1>
            <p className="font-editorial-italic text-ivory-muted">Manage your user account, birth coordinates, and application settings.</p>
          </section>

          <div className="settings-layout-grid mt-space-xl">
            <nav className="settings-sidebar">
              {[
                { key: 'account',       icon: 'person',            label: 'Account Details' },
                { key: 'appearance',    icon: 'palette',           label: 'Theme & Appearance' },
                { key: 'profile',       icon: 'assignment_ind',    label: 'Birth Coordinates' },
                { key: 'language',      icon: 'translate',         label: 'Language & Script' },
                { key: 'subscription',  icon: 'workspace_premium', label: 'Subscription' },
                { key: 'about',         icon: 'info',              label: 'About Jyotish' },
              ].map(s => (
                <button
                  key={s.key}
                  className={`settings-nav-btn ${section === s.key ? 'nav-btn-active' : ''}`}
                  onClick={() => setSection(s.key)}
                >
                  <span className="material-symbols-outlined icon-sm">{s.icon}</span>
                  <span className="font-body-md">{s.label}</span>
                </button>
              ))}
            </nav>

            <div className="settings-content-card">
              {section === 'account' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">Account Details</h3>
                  <div className="settings-rows-list mt-space-md font-body-sm">
                    <div className="setting-row">
                      <span className="font-label-sm text-on-surface-variant">Name:</span>
                      <span className="font-body-sm text-on-surface font-semibold">{user?.name || birthProfile?.fullName || 'Seeker'}</span>
                    </div>
                    <div className="setting-row">
                      <span className="font-label-sm text-on-surface-variant">Email:</span>
                      <span className="font-body-sm text-on-surface font-semibold">{user?.email || 'Guest Account'}</span>
                    </div>
                    <div className="setting-row">
                      <span className="font-label-sm text-on-surface-variant">Token Balance:</span>
                      <span className="font-body-sm text-primary font-bold">{balance} Tokens</span>
                    </div>
                    <div className="setting-row">
                      <span className="font-label-sm text-on-surface-variant">Plan Status:</span>
                      <span className="font-body-sm text-secondary font-bold">{isPremium ? 'Vedic Pro Active' : 'Standard Seeker'}</span>
                    </div>
                  </div>
                  <div className="mt-space-lg">
                    <button className="btn-guest logout-row" onClick={logout}>
                      <span className="material-symbols-outlined icon-sm text-error">logout</span>
                      <span className="text-error font-body-md">Sign Out of Account</span>
                    </button>
                  </div>
                </div>
              )}

              {section === 'appearance' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">Atmosphere & Visual Theme</h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    Select your preferred visual atmosphere. Switch freely between the warm Vedic Manuscript and the genuine Cosmic Night Sky.
                  </p>
                  <div className="mt-space-md p-space-md rounded-md bg-surface-container-low border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-title-sm font-semibold text-on-surface">Active World</div>
                      <div className="font-body-xs text-on-surface-variant mt-0.5">
                        {theme === 'cosmic'
                          ? 'Cosmic Night Sky · अलौकिक व्योम (Deep Space, Nebulae & Stars)'
                          : 'Vedic Manuscript · वैदिक पाण्डुलिपि (Warm Ivory & Antique Gold)'}
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              )}

              {section === 'profile' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">Birth Coordinates</h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">Re-calculate your horoscope by updating birth date, time, or location.</p>
                  <button className="btn-submit font-title-md mt-space-md" onClick={() => setCurrentPage('onboarding')}>
                    Update Birth Coordinates
                  </button>
                </div>
              )}

              {section === 'language' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">Language & Local Script</h3>
                  <div className="language-grid-settings mt-space-md">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-option-btn ${l.code === language ? 'lang-btn-active' : ''}`}
                        onClick={() => setLanguage(l.code)}
                      >
                        <span className="font-title-md font-bold">{l.native}</span>
                        <span className="font-body-sm opacity-80">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {section === 'subscription' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">Subscription Status</h3>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    {isPremium ? 'Your Pro membership is currently active.' : 'Upgrade to Pro for unlimited chart interpretations.'}
                  </p>
                  <button className="btn-submit font-title-md mt-space-md" onClick={() => setCurrentPage('premium')}>
                    {isPremium ? 'Manage Membership' : 'Upgrade to Pro Plan'}
                  </button>
                </div>
              )}

              {section === 'about' && (
                <div className="settings-panel">
                  <h3 className="font-headline-sm text-on-surface">About Jyotish (ज्योतिष)</h3>
                  <p className="font-body-md text-on-surface mt-space-xs leading-relaxed">
                    Rooted in the timeless astronomical principles of <em>Bṛhat Parāśara Horā Śāstra</em> and Lahiri Chitra Paksha Ayanamsha. Designed with warm manuscript editorial aesthetics.
                  </p>
                  <p className="font-body-sm text-outline mt-space-md">
                    Disclaimer: Astrological insights are intended for self-reflection and philosophical study.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
