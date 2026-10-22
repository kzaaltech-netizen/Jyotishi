import React from 'react';
import { BookOpen, Calendar, ChevronRight, Clock, Coins, Crown, LogOut, MapPin, Settings, Sunrise } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import ConstellationGlyph from '../components/sky/ConstellationGlyph.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import useChartSummary from '../hooks/useChartSummary.js';
import useT from '../hooks/useT.js';

function Row({ Icon, label, value }) {
  const { t } = useT();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted"><Icon className="h-4 w-4" aria-hidden="true" />{label}</span>
      <span className="text-right font-semibold">{value || t.common.notSet}</span>
    </div>
  );
}

function LinkRow({ Icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-[52px] w-full items-center gap-3 px-1 text-left hover:text-accent ${danger ? 'text-danger hover:text-danger' : ''}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="flex-1 font-medium">{label}</span>
      {!danger && <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />}
    </button>
  );
}

export default function ProfilePage() {
  const { user, birthProfile, isPremium, logout, setCurrentPage } = useApp();
  const { balance } = useTokens();
  const s = useChartSummary();
  const { t, f, sign, nak, personName } = useT();
  const pr = t.profile;
  const name = personName(user, birthProfile);

  return (
    <AppShell>
      <Page>
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft font-display text-3xl text-accent">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl">{name}</h1>
            {user?.isGuest ? (
              <p className="text-muted">
                {pr.guest}{' '}
                <button type="button" className="font-medium text-accent hover:underline" onClick={() => setCurrentPage('auth')}>
                  {pr.createAccount}
                </button>{' '}
                {pr.toSave}
              </p>
            ) : (
              <p className="text-muted">{user?.email}</p>
            )}
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {s.lagna && <span className="pill">{f(pr.lagnaPill, { sign: sign(s.lagna.sign) })}</span>}
              {s.moonNakshatra && <span className="pill">{nak(s.moonNakshatra)}</span>}
              {isPremium() && <span className="pill bg-gold-soft text-gold">Pro</span>}
            </div>
          </div>
          {s.moonNakshatra && <ConstellationGlyph nakshatra={s.moonNakshatra} size={88} className="hidden sm:block" />}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">{pr.birth}</h2>
              <button type="button" className="btn-quiet -mr-3" onClick={() => setCurrentPage('onboarding')}>{t.common.edit}</button>
            </div>
            <div className="mt-2 divide-y divide-line">
              <Row Icon={Calendar} label={pr.date} value={birthProfile?.dob} />
              <Row Icon={Clock} label={pr.time} value={birthProfile?.birthTime} />
              <Row Icon={MapPin} label={pr.place} value={birthProfile?.birthplace} />
              <Row Icon={Sunrise} label={pr.lagna} value={s.lagna ? sign(s.lagna.sign) : null} />
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg">{pr.tokens}</h2>
            <p className="mt-3 flex items-center gap-2 font-display text-4xl num">
              <Coins className="h-7 w-7 text-gold" aria-hidden="true" />
              {balance}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={() => setCurrentPage('buy-tokens')}>{t.common.addTokens}</button>
              <button type="button" className="btn-ghost" onClick={() => setCurrentPage('wallet')}>{pr.history}</button>
            </div>
          </section>
        </div>

        <section className="card mt-4 divide-y divide-line px-5 py-1">
          <LinkRow Icon={BookOpen} label={pr.readings} onClick={() => setCurrentPage('analysis')} />
          <LinkRow Icon={Crown} label={pr.pro} onClick={() => setCurrentPage('premium')} />
          <LinkRow Icon={Settings} label={pr.settings} onClick={() => setCurrentPage('settings')} />
          <LinkRow Icon={LogOut} label={t.common.signOut} onClick={logout} danger />
        </section>
      </Page>
    </AppShell>
  );
}
