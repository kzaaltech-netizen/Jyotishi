import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './AuthPage.css';

export default function AuthPage() {
  const { register, loginWithPassword, guestLogin } = useApp();
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
      setError('Please enter your name.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        await register({ name: form.name, email: form.email, password: form.password });
      } else {
        await loginWithPassword({ email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await guestLogin();
    } catch (err) {
      setError(err.message || 'Guest login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <CosmicBackground />

      <div className="auth-container fade-in">
        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-orb floating">
            <span className="material-symbols-outlined icon-filled">auto_awesome</span>
          </div>
          <h1 className="headline-lg text-primary">Aetheric Jyotish</h1>
          <p className="body-md text-muted">Your Destiny in the Stars</p>
        </div>

        {/* Card */}
        <div className="auth-card glass-strong">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >Login</button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'auth-tab-active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); }}
            >Create Account</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {tab === 'signup' && (
              <div className="input-group slide-up">
                <label className="input-label">Full Name</label>
                <div className="input-wrapper">
                  <input
                    className="stellar-input"
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Arjun Sharma"
                    autoComplete="name"
                  />
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <input
                  className="stellar-input"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@cosmos.io"
                  autoComplete="email"
                />
                <span className="material-symbols-outlined">mail</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  className="stellar-input"
                  type="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <span className="material-symbols-outlined">lock</span>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Aligning the stars…
                </>
              ) : (
                <>
                  {tab === 'login' ? 'Enter the Cosmos' : 'Begin Your Journey'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span className="divider" />
            <span className="label-sm text-muted">or</span>
            <span className="divider" />
          </div>

          <button className="btn btn-ghost" onClick={handleGuest} style={{ width: '100%' }}>
            <span className="material-symbols-outlined">explore</span>
            Continue as Guest
          </button>

          <p className="auth-footnote label-sm text-muted">
            {tab === 'login'
              ? 'New to Aetheric Jyotish? '
              : 'Already have an account? '}
            <button className="text-link" onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}>
              {tab === 'login' ? 'Create account' : 'Log in'}
            </button>
          </p>
        </div>

        <p className="auth-legal label-sm text-muted">
          By continuing, you acknowledge that astrology is interpretive and not predictive science.
        </p>
      </div>
    </div>
  );
}
