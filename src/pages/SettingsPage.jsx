import React, { useState } from 'react';
import { Check, LogOut, Moon, Sun, Trash2 } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { LOCALES } from '../content/locales.js';
import useT from '../hooks/useT.js';

// Two steps: reveal, then confirm (with the password for real accounts).
function DeleteAccount() {
  const { user, deleteAccount } = useApp();
  const { t } = useT();
  const st = t.settings;
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Guests and Google-only accounts have no password to confirm with.
  const needsPassword = !user?.isGuest && user?.hasPassword !== false;

  const confirm = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await deleteAccount(needsPassword ? password : undefined);
    } catch (err) {
      setError(err.code === 'WRONG_PASSWORD' ? st.deleteWrong : err.message || t.notices.generic);
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="btn-quiet text-danger hover:text-danger" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {user?.isGuest ? st.deleteGuest : st.deleteBtn}
      </button>
    );
  }
  return (
    <form onSubmit={confirm} className="space-y-3 rounded-xl border border-danger/40 p-4">
      <p className="text-sm">{st.deleteSub}</p>
      {needsPassword && (
        <div>
          <label htmlFor="delete-password" className="field-label">{st.deleteConfirm}</label>
          <div className="field">
            <input id="delete-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary bg-danger hover:bg-danger/90" disabled={busy || (needsPassword && !password)}>
          {st.deleteFinal}
        </button>
        <button type="button" className="btn-quiet" onClick={() => setOpen(false)}>{st.cancel}</button>
      </div>
    </form>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ThemeOption({ value, current, onPick, Icon, title, sub, preview }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={`flex flex-col overflow-hidden rounded-2xl border text-left transition-colors ${active ? 'border-accent ring-2 ring-accent/20' : 'border-line hover:border-accent/40'}`}
    >
      <span className={`relative block h-24 ${preview}`} aria-hidden="true">
        {[[18, 30], [42, 18], [64, 40], [80, 22], [30, 62], [56, 70]].map(([x, y], i) => (
          <span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-current" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </span>
      <span className="flex items-center gap-3 p-4">
        <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="block text-xs text-muted">{sub}</span>
        </span>
        {active && <Check className="h-5 w-5 text-accent" aria-hidden="true" />}
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { user, birthProfile, logout, subscription, setCurrentPage, language, setLanguage, theme, setTheme } = useApp();
  const { balance } = useTokens();
  const { t, personName } = useT();
  const st = t.settings;
  const premium = subscription && new Date(subscription.endDate) > new Date();

  return (
    <AppShell>
      <Page eyebrow={st.eyebrow} title={st.title}>
        <div className="space-y-4">
          <Section title={st.appearance} description={st.appearanceSub}>
            <div className="grid gap-3 sm:grid-cols-2">
              <ThemeOption value="vedic" current={theme} onPick={setTheme} Icon={Sun} title={t.nav.vedic} sub={st.vedicSub} preview="bg-[#f4ebda] text-[#a9440a]" />
              <ThemeOption value="cosmic" current={theme} onPick={setTheme} Icon={Moon} title={t.nav.cosmic} sub={st.cosmicSub} preview="bg-[#04101a] text-[#2ee6c5]" />
            </div>
          </Section>

          <Section title={st.language} description={st.languageSub}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={l.code === language}
                  className={`flex min-h-[56px] flex-col items-center justify-center rounded-xl border px-2 text-center transition-colors ${
                    l.code === language ? 'border-accent bg-accent-soft/60' : 'border-line hover:bg-panel-2'
                  }`}
                >
                  <span className="font-semibold" lang={l.hreflang}>{l.native}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title={st.account}>
            <dl className="divide-y divide-line text-sm">
              {[
                [st.name, personName(user, birthProfile)],
                [st.email, user?.isGuest ? st.guestAccount : user?.email || st.guestAccount],
                [st.tokens, balance],
                [st.plan, premium ? st.pro : st.free],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold num">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => setCurrentPage('premium')}>{premium ? st.managePlan : st.seePro}</button>
              <button type="button" className="btn-quiet text-danger hover:text-danger" onClick={logout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t.common.signOut}
              </button>
            </div>
          </Section>

          <Section title={st.deleteTitle} description={st.deleteDesc}>
            <DeleteAccount />
          </Section>

          <Section title={st.about}>
            <p className="text-sm">
              {st.aboutText}
            </p>
            <p className="mt-2 text-sm text-muted">{st.aboutNote} <a className="underline" href="https://www.fasfaslabs.com/" target="_blank" rel="noopener noreferrer">FAS FAS Labs</a>.</p>
          </Section>
        </div>
      </Page>
    </AppShell>
  );
}
