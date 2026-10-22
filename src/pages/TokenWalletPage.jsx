import React from 'react';
import { Coins, Crown, Plus } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import useT from '../hooks/useT.js';

export default function TokenWalletPage() {
  const { balance, ledger, todayUsed, totalUsed, costs } = useTokens();
  const { setCurrentPage } = useApp();
  const { t, f, dateTime } = useT();
  const w = t.wallet;

  return (
    <AppShell>
      <Page eyebrow={w.eyebrow} title={w.title} subtitle={w.subtitle}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="card flex flex-col justify-between gap-6 p-6">
            <div>
              <p className="flex items-center gap-2 text-sm text-muted">
                <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
                {w.balance}
              </p>
              <p className="mt-1 font-display text-6xl num">
                <CountUp to={balance} duration={1.2} trigger="load" />
              </p>
              <p className="mt-2 text-sm text-muted num">{f(w.used, { today: todayUsed, total: totalUsed })}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={() => setCurrentPage('buy-tokens')}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t.common.addTokens}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setCurrentPage('premium')}>
                <Crown className="h-4 w-4" aria-hidden="true" />
                {w.seePro}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg">{w.costs}</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {Object.entries(costs || {}).map(([key, cost]) => (
                <li key={key} className="flex items-center justify-between py-2.5">
                  <span>{w.costLabels[key] || key}</span>
                  <span className="pill num">{f(cost === 1 ? t.common.token : t.common.tokens, { n: cost })}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-lg">{w.history}</h2>
          {ledger.length === 0 ? (
            <p className="card p-6 text-center text-muted">{w.none}</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-panel-2/70 text-xs text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">{w.when}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{w.what}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{w.tokens}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-panel/80">
                  {ledger.slice(0, 30).map((l, i) => {
                    const credit = (l.cost ?? 0) < 0;
                    return (
                      <tr key={i}>
                        <td className="px-4 py-3 text-muted num">{dateTime(l.timestamp || l.createdAt || Date.now(), { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td className="px-4 py-3">{l.description || l.action}</td>
                        <td className={`px-4 py-3 text-right font-semibold num ${credit ? 'text-ok' : ''}`}>
                          {credit ? `+${Math.abs(l.cost)}` : `−${l.cost ?? 0}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Page>
    </AppShell>
  );
}
