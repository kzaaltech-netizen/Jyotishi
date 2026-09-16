import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Coins,
  Globe,
  LogOut,
  ArrowRight,
  Sparkles,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import { SUPPORTED_LANGUAGES, t } from '../lib/i18n.js';
import { springTransition, buttonPress } from '../lib/motion.js';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, birthProfile, chartData, subscription, isPremium, logout, setCurrentPage, language, setLanguage } = useApp();
  const { balance } = useTokens();

  const userName = birthProfile?.fullName || user?.name || 'Seeker';
  const userEmail = user?.email || 'Guest Seeker';

  return (
    <div className="profile-page-wrapper">
      <TopBar />

      <main className="profile-main">
        <div className="app-container">

          {/* Hero Header */}
          <motion.section
            className="profile-hero-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="profile-avatar-circle">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline-lg text-ivory">{userName}</h1>
            <p className="font-editorial-italic text-ivory-muted">{userEmail}</p>
          </motion.section>

          {/* Profile Cards Grid */}
          <div className="profile-cards-grid mt-space-xl">

            {/* Card 1: Birth Details Management */}
            <div className="profile-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>Birth Coordinates (जन्म विवरण)</span>
                </span>
                <button className="btn-edit-link font-label-sm" onClick={() => setCurrentPage('onboarding')}>
                  Edit Coordinates
                </button>
              </div>
              <div className="details-rows-list mt-space-md">
                <div className="detail-row">
                  <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date of Birth:</span>
                  <span className="font-body-sm text-on-surface font-semibold">{birthProfile?.dob || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Birth Time:</span>
                  <span className="font-body-sm text-on-surface font-semibold">{birthProfile?.birthTime || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Birthplace:</span>
                  <span className="font-body-sm text-on-surface font-semibold">{birthProfile?.birthplace || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="font-label-sm text-on-surface-variant flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Lagna (Ascendant):</span>
                  <span className="font-body-sm text-primary font-bold">{chartData?.lagna?.sign || 'Ascendant'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Language Preference */}
            <div className="profile-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-secondary" />
                  <span>Language Selection (भाषा चुनाव)</span>
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-1">Select your preferred script and language for UI & readings.</p>
              <div className="language-buttons-grid mt-space-md">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-select-btn ${l.code === language ? 'lang-btn-active' : ''}`}
                    onClick={() => setLanguage(l.code)}
                  >
                    <span className="lang-native">{l.native}</span>
                    <span className="lang-code">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Wallet & Subscriptions */}
            <div className="profile-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gold" />
                  <span>Token Balance & Access</span>
                </span>
              </div>
              <div className="balance-box mt-space-md">
                <div className="balance-left">
                  <Coins className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <span className="font-headline-md text-primary font-bold">{balance}</span>
                    <span className="font-label-sm text-on-surface-variant block">Tokens Remaining</span>
                  </div>
                </div>
                <div className="balance-actions">
                  <motion.button className="btn-submit font-label-lg" onClick={() => setCurrentPage('buy-tokens')} {...buttonPress}>
                    Refill Tokens
                  </motion.button>
                  <motion.button className="btn-guest font-label-lg" onClick={() => setCurrentPage('wallet')} {...buttonPress}>
                    History
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Card 4: Account Actions */}
            <div className="profile-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-on-surface-variant" />
                  <span>Settings & Session</span>
                </span>
              </div>
              <div className="account-actions-list mt-space-md">
                <button className="account-action-row" onClick={() => setCurrentPage('settings')}>
                  <span>Application Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="account-action-row text-error" onClick={logout}>
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
