import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import './AuthPage.css';

export default function AuthPage() {
  const { register, loginWithPassword, guestLogin, navigateWithCurtain } = useApp();
  const [tab, setTab] = useState('login'); // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.'); return;
    }
    if (tab === 'signup' && !form.name) {
      setError('Please enter your full name.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        await register({ name: form.name, email: form.email, password: form.password });
        navigateWithCurtain('onboarding');
      } else {
        await loginWithPassword({ email: form.email, password: form.password });
        navigateWithCurtain('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await guestLogin();
      navigateWithCurtain('dashboard');
    } catch (err) {
      setError(err.message || 'Guest login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <TopBar />

      <main className="auth-main">
        <div className="auth-card-container">
          <div className="auth-header">
            <div className="auth-invocation font-label-sm">॥ ॐ श्री गणेशाय नमः ॥</div>
            <h1 className="auth-title font-headline-lg">
              {tab === 'login' ? 'Welcome Back · प्रवेश' : 'Begin Your Folio · पंजीकरण'}
            </h1>
            <p className="auth-subtitle font-editorial-italic">
              Inscribe your credentials to access your natal horoscope manuscript.
            </p>
          </div>

          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                Sign In · प्रवेश
              </button>
              <button
                className={`auth-tab ${tab === 'signup' ? 'auth-tab-active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); }}
              >
                Sign Up · पंजीकरण
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {tab === 'signup' && (
                <div className="form-group">
                  <label className="form-label font-label-sm">Full Name (पूरा नाम)</label>
                  <div className="input-frame">
                    <span className="material-symbols-outlined input-icon">person</span>
                    <input
                      className="form-input"
                      type="text"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Tushar Sharma"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label font-label-sm">Email Address (ईमेल)</label>
                <div className="input-frame">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="tushar@jyotish.app"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-label-sm">Password (पासवर्ड)</label>
                <div className="input-frame">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error-box font-body-sm">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-submit font-title-md"
                disabled={loading}
              >
                {loading ? 'Consulting Shastras…' : tab === 'login' ? 'Access Janam Kundli' : 'Create Sacred Folio'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="auth-divider">
              <span className="divider-line"></span>
              <span className="divider-label font-label-sm">OR</span>
              <span className="divider-line"></span>
            </div>

            <button className="btn-guest font-body-md" onClick={handleGuest}>
              <span className="material-symbols-outlined">explore</span>
              Continue as Guest Seeker
            </button>
          </div>

          <p className="auth-footer-legal font-body-sm">
            Strictly reverent & private. Sidereal Lahiri calculation standard.
          </p>
        </div>
      </main>
    </div>
  );
}
