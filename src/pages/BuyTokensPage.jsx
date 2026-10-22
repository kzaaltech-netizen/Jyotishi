import React, { useState } from 'react';
import { m } from 'motion/react';
import { CheckCircle2, Coins } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import useT from '../hooks/useT.js';

// Labels and descriptions come from the app text (content/app), by id.
const PACKAGES = [
  { id: 'starter', tokens: 50, price: '₹199' },
  { id: 'popular', tokens: 150, price: '₹499', popular: true },
  { id: 'pro', tokens: 500, price: '₹1,299' },
];

export default function BuyTokensPage() {
  const { addTokens } = useTokens();
  const { setCurrentPage } = useApp();
  const { t, f } = useT();
  const b = t.buy;
  const [purchasing, setPurchasing] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // No payment gateway is connected yet; the server refuses unless test purchases are enabled.
  const purchase = async (pkg) => {
    setPurchasing(pkg.id);
    setError('');
    setSuccess('');
    try {
      await addTokens(pkg.tokens, `Purchased ${pkg.id}`);
      setSuccess(f(b.added, { n: pkg.tokens }));
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.code === 'PAYMENTS_UNAVAILABLE' ? b.unavailable : err.message || t.notices.generic);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <AppShell>
      <Page
        eyebrow={t.wallet.eyebrow}
        title={b.title}
        subtitle={b.subtitle}
        actions={<button type="button" className="btn-quiet" onClick={() => setCurrentPage('wallet')}>{b.back}</button>}
      >
        {success && (
          <m.p role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-2 rounded-2xl border border-ok/30 bg-panel/90 p-4 text-sm">
            <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden="true" />
            {success}
          </m.p>
        )}
        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-gold/40 bg-gold-soft/60 p-4 text-sm">{error}</p>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`card relative flex flex-col p-6 ${pkg.popular ? 'border-accent/50' : ''}`}>
              {pkg.popular && <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">{b.popular}</span>}
              <h2 className="text-xl">{b.packs[pkg.id].label}</h2>
              <p className="mt-3 font-display text-4xl">{pkg.price}</p>
              <p className="mt-1 flex items-center gap-1.5 font-semibold text-gold num">
                <Coins className="h-4 w-4" aria-hidden="true" />
                {f(t.common.tokens, { n: pkg.tokens })}
              </p>
              <p className="mt-3 flex-1 text-sm text-muted">{b.packs[pkg.id].desc}</p>
              {pkg.popular ? (
                <button type="button" className="btn-primary mt-6 w-full" disabled={purchasing === pkg.id} onClick={() => purchase(pkg)}>
                  {purchasing === pkg.id ? b.adding : b.get}
                </button>
              ) : (
                <button type="button" className="btn-ghost mt-6 w-full" disabled={purchasing === pkg.id} onClick={() => purchase(pkg)}>
                  {purchasing === pkg.id ? b.adding : b.get}
                </button>
              )}
            </div>
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
