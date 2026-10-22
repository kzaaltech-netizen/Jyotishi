import React, { useState } from 'react';
import { Check, CheckCircle2 } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import { useApp } from '../context/AppContext.jsx';
import useT from '../hooks/useT.js';

// Names and features come from the app text (content/app), by id.
const PLANS = [
  { id: 'monthly', price: '₹499', per: 'month' },
  { id: 'annual', price: '₹3,999', per: 'year', best: true },
];

export default function PremiumPage() {
  const { isPremium, updateSubscription, setCurrentPage } = useApp();
  const { t, f } = useT();
  const pro = t.pro;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const active = isPremium();

  const subscribe = async (plan) => {
    setLoading(true);
    setError('');
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (plan === 'annual' ? 12 : 1));
    try {
      // The API names the yearly plan "yearly".
      await updateSubscription({ planType: plan === 'annual' ? 'yearly' : 'monthly', startDate: startDate.toISOString(), endDate: endDate.toISOString() });
      setSuccess(f(pro.onPlan, { plan: pro.plans[plan].name }));
    } catch (err) {
      setError(err.code === 'PAYMENTS_UNAVAILABLE' ? pro.unavailable : err.message || t.notices.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Page
        eyebrow={t.profile.pro}
        title={pro.title}
        subtitle={pro.subtitle}
        actions={<button type="button" className="btn-quiet" onClick={() => setCurrentPage('profile')}>{pro.back}</button>}
      >
        {success && (
          <p role="status" className="mb-6 flex items-center gap-2 rounded-2xl border border-ok/30 bg-panel/90 p-4 text-sm">
            <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden="true" />
            {success}
          </p>
        )}
        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-gold/40 bg-gold-soft/60 p-4 text-sm">{error}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.id} className={`card relative flex flex-col p-7 ${p.best ? 'border-gold/60' : ''}`}>
              {p.best && <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-bg">{pro.best}</span>}
              <h2 className="text-2xl">{pro.plans[p.id].name}</h2>
              <p className="mt-3">
                <span className="font-display text-4xl">{p.price}</span>
                <span className="text-muted"> / {pro[p.per]}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {pro.plans[p.id].features.map((feat) => (
                  <li key={feat} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={p.best ? 'btn-primary mt-7 w-full' : 'btn-ghost mt-7 w-full'}
                disabled={loading || active}
                onClick={() => subscribe(p.id)}
              >
                {active ? pro.active : f(pro.choose, { plan: pro.plans[p.id].name })}
              </button>
            </div>
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
