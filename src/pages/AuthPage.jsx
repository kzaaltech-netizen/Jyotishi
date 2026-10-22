import React, { useState } from 'react';
import { AlertCircle, Lock, Mail, User } from '../components/icons/index.jsx';
import PublicFrame from '../components/shell/PublicFrame.jsx';
import Segmented from '../components/ui/Segmented.jsx';
import GoogleButton, { GOOGLE_CLIENT_ID } from '../components/ui/GoogleButton.jsx';
import { useApp } from '../context/AppContext.jsx';
import useT from '../hooks/useT.js';

export default function AuthPage() {
  const { register, loginWithPassword, loginWithGoogle, user, chartData, setCurrentPage } = useApp();
  // A visitor who typed a question first, or made a Kundli as a guest, most likely needs a new account.
  const { t } = useT();
  const au = t.auth;
  const [pending] = useState(() => sessionStorage.getItem('pending_chart_query'));
  const [tab, setTab] = useState(pending || user?.isGuest ? 'signup' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError(au.errFill);
    if (tab === 'signup' && !form.name) return setError(au.errName);
    if (form.password.length < 6) return setError(au.errShort);

    setLoading(true);
    try {
      if (tab === 'signup') {
        await register({ name: form.name, email: form.email, password: form.password });
      } else {
        await loginWithPassword({ email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.message || au.errFailed);
    } finally {
      setLoading(false);
    }
  };

  const google = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err.message || au.googleFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <h1 className="text-center text-3xl sm:text-4xl">{tab === 'login' ? au.welcomeBack : au.create}</h1>
        <p className="mt-2 text-center text-muted">
          {pending ? au.pending : chartData ? au.withChart : au.plain}
        </p>
        {pending && (
          <p className="mx-auto mt-4 max-w-sm rounded-xl bg-accent-soft px-4 py-3 text-center text-sm">“{pending}”</p>
        )}

        <div className="card mt-8 p-6">
          <Segmented
            className="w-full [&>button]:flex-1"
            label={au.switchLabel}
            value={tab}
            onChange={(v) => {
              setTab(v);
              setError('');
            }}
            options={[{ value: 'login', label: au.signIn }, { value: 'signup', label: au.signUp }]}
          />

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="mt-6">
                <GoogleButton signup={tab === 'signup'} onCredential={google} onError={() => setError(au.googleFailed)} />
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted" aria-hidden="true">
                <span className="h-px flex-1 bg-line" />
                {au.or}
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={GOOGLE_CLIENT_ID ? 'mt-5 space-y-4' : 'mt-6 space-y-4'} noValidate>
            {tab === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="field-label">{au.name}</label>
                <div className="field">
                  <User className="h-4 w-4 text-muted" aria-hidden="true" />
                  <input id="auth-name" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="field-label">{au.email}</label>
              <div className="field">
                <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                <input id="auth-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="auth-password" className="field-label">{au.password}</label>
              <div className="field">
                <Lock className="h-4 w-4 text-muted" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="flex items-center gap-2 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? au.wait : tab === 'login' ? au.signIn : au.createBtn}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {tab === 'login' ? au.newHere : au.haveAccount}
            <button
              type="button"
              className="font-semibold text-accent hover:underline"
              onClick={() => {
                setTab(tab === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {tab === 'login' ? au.createFree : au.signIn}
            </button>
          </p>
        </div>

        {!chartData && (
          <p className="mt-6 text-center text-sm text-muted">
            {au.justKundli}{' '}
            <button type="button" className="font-semibold text-accent hover:underline" onClick={() => setCurrentPage('onboarding')}>
              {au.makeFree}
            </button>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          {au.footer}{' '}
          <a className="underline" href="https://www.fasfaslabs.com/" target="_blank" rel="noopener noreferrer">FAS FAS Labs</a>
        </p>
      </div>
    </PublicFrame>
  );
}
