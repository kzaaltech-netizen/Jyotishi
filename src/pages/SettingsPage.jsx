import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, birthProfile, logout, subscription, setCurrentPage, generateNewChart } = useApp();
  const { balance } = useTokens();

  const [section, setSection] = useState('account'); // account | profile | subscription | billing | notifications | privacy | about

  const isPremium = subscription && new Date(subscription.endDate) > new Date();

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />
      <main className="main-content">
        <div className="settings-header fade-in">
          <h2 className="headline-md text-on-surface">Settings</h2>
          <p className="body-md text-muted">Manage your account and preferences</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <nav className="settings-nav card slide-up">
            {[
              { key: 'account',       icon: 'person',          label: 'Account' },
              { key: 'profile',       icon: 'assignment_ind',  label: 'Profile' },
              { key: 'subscription',  icon: 'workspace_premium',label: 'Subscription' },
              { key: 'billing',       icon: 'credit_card',     label: 'Billing' },
              { key: 'notifications', icon: 'notifications',   label: 'Notifications' },
              { key: 'privacy',       icon: 'security',        label: 'Privacy & Security' },
              { key: 'about',         icon: 'info',            label: 'About' },
            ].map(s => (
              <button
                key={s.key}
                className={`settings-nav-item ${section === s.key ? 'settings-nav-active' : ''}`}
                onClick={() => setSection(s.key)}
              >
                <span className="material-symbols-outlined">{s.icon}</span>
                <span className="body-md">{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="settings-content slide-up" style={{ animationDelay: '0.05s' }}>

            {section === 'account' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Account Details</h3>

                {/* Profile */}
                <div className="settings-group">
                  <div className="settings-row">
                    <span className="label-sm text-muted">Name</span>
                    <span className="body-md text-on-surface">{user?.name}</span>
                  </div>
                  <div className="settings-row">
                    <span className="label-sm text-muted">Email</span>
                    <span className="body-md text-on-surface">{user?.email}</span>
                  </div>
                  <div className="settings-row">
                    <span className="label-sm text-muted">Member since</span>
                    <span className="body-md text-on-surface">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="settings-row">
                    <span className="label-sm text-muted">Token balance</span>
                    <span className="body-md text-primary">{balance} tokens</span>
                  </div>
                  <div className="settings-row">
                    <span className="label-sm text-muted">Plan</span>
                    <span className={`chip ${isPremium ? 'chip-gold' : 'chip-surface'}`}>
                      {isPremium ? `Premium · expires ${new Date(subscription.endDate).toLocaleDateString('en-IN')}` : 'Free Tier'}
                    </span>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage('buy-tokens')}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Buy Tokens
                  </button>
                  {!isPremium && (
                    <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('premium')}>
                      <span className="material-symbols-outlined icon-filled">workspace_premium</span>
                      Go Premium
                    </button>
                  )}
                  <button className="btn btn-sm logout-btn" onClick={logout}>
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {section === 'profile' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Profile Configuration</h3>
                <p className="body-md text-muted">Update your personal astrology profile details here.</p>
                {birthProfile && (
                  <div className="settings-group" style={{ marginTop: 24 }}>
                    {[
                      { label: 'Full name', val: birthProfile.fullName },
                      { label: 'Date of birth', val: birthProfile.dob },
                      { label: 'Birth time', val: birthProfile.birthTime },
                      { label: 'Birthplace', val: birthProfile.birthplace },
                      { label: 'Coordinates', val: birthProfile.lat ? `${birthProfile.lat?.toFixed(3)}°N, ${birthProfile.lon?.toFixed(3)}°E` : 'Not geocoded' },
                      { label: 'Timezone', val: birthProfile.timezone || 'Asia/Kolkata' },
                    ].map(r => (
                      <div key={r.label} className="settings-row">
                        <span className="label-sm text-muted">{r.label}</span>
                        <span className="body-md text-on-surface">{r.val}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={() => setCurrentPage('onboarding')} style={{ marginTop: 16 }}>
                  Update Profile Details
                </button>
              </div>
            )}

            {section === 'subscription' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Manage Subscription</h3>
                <p className="body-md text-muted">View your active plan, usage limits, and upgrade options.</p>
                {!isPremium && (
                  <button className="btn btn-primary" onClick={() => setCurrentPage('premium')} style={{ marginTop: 16 }}>
                    Go Premium
                  </button>
                )}
              </div>
            )}

            {section === 'billing' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Billing & Invoices</h3>
                <p className="body-md text-muted">Manage your payment methods and download past invoices.</p>
                <div className="settings-group" style={{ marginTop: 24, padding: 24, background: 'var(--surface-light)', borderRadius: 12, textAlign: 'center' }}>
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: 32 }}>receipt_long</span>
                  <p className="body-md text-muted" style={{ marginTop: 8 }}>No recent invoices found.</p>
                </div>
              </div>
            )}

            {section === 'notifications' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Notification Preferences</h3>
                <p className="body-md text-muted">Control which emails and planetary transit alerts you receive.</p>
                <div className="settings-group" style={{ marginTop: 24 }}>
                  <div className="settings-row" style={{ alignItems: 'center' }}>
                    <div>
                      <span className="body-md text-on-surface" style={{ display: 'block' }}>Email Newsletters</span>
                      <span className="label-sm text-muted">Weekly cosmic insights and tips</span>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="settings-row" style={{ alignItems: 'center' }}>
                    <div>
                      <span className="body-md text-on-surface" style={{ display: 'block' }}>Transit Alerts</span>
                      <span className="label-sm text-muted">Major planetary shifts affecting your chart</span>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {section === 'privacy' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">Privacy & Security</h3>
                <p className="body-md text-muted">Manage your data, privacy settings, and account security.</p>
                <div className="settings-actions" style={{ marginTop: 24, justifyContent: 'flex-start' }}>
                  <button className="btn btn-secondary">Change Password</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--error)' }}>Delete Account</button>
                </div>
              </div>
            )}

            {section === 'about' && (
              <div className="settings-panel card">
                <h3 className="title-md text-on-surface settings-panel-title">About Aetheric Jyotish</h3>
                <p className="body-md text-muted">Version 1.0.0 — MVP Release</p>
                <div className="about-items">
                  {[
                    { icon: 'brightness_7', title: 'Vedic Astrology Engine', desc: 'Planetary positions calculated with Lahiri ayanamsa. Supports 9 planets, 12 houses, 27 nakshatras, and Vimshottari dasha system.' },
                    { icon: 'psychology',   title: 'Gemini AI Agents',       desc: 'Six specialized agents (General, Career, Wealth, Abundance, Union, Forecast) powered by Gemini 2.0 Flash.' },
                    { icon: 'location_on', title: 'Free Geocoding',          desc: 'Birthplace coordinates via OpenStreetMap Nominatim — no paid API key required.' },
                    { icon: 'toll',         title: 'Token Economy',          desc: 'Transparent pay-per-use model. 50 free tokens on signup. Buy more or subscribe for unlimited access.' },
                  ].map(a => (
                    <div key={a.title} className="about-item">
                      <span className="material-symbols-outlined text-primary about-icon">{a.icon}</span>
                      <div>
                        <div className="title-sm text-on-surface">{a.title}</div>
                        <p className="body-md text-muted about-desc">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="body-md text-muted about-disclaimer">
                  <strong>Disclaimer:</strong> Vedic astrology is a traditional interpretive system. Chart readings are not predictions and should not replace professional advice for medical, legal, or financial decisions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
