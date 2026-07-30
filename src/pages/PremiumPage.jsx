import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './PremiumPage.css';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹699',
    period: '/month',
    tokens: 'Unlimited',
    badge: null,
    features: ['Unlimited AI chat', 'All 5 chart modes', 'Deep analysis reports', 'Priority responses', 'Chat history saved', '5 chart types'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹4,999',
    period: '/year',
    tokens: 'Unlimited',
    badge: 'Best Value — Save 40%',
    features: ['Everything in Monthly', 'PDF export (coming soon)', 'D9/D10 charts (coming soon)', 'Compatibility analysis', 'Transit tracking', 'Priority support'],
    popular: true,
  }
];

const ALL_FEATURES = [
  { label: 'Natal chart generation', free: true, premium: true },
  { label: 'AI chat messages', free: '20/day', premium: 'Unlimited' },
  { label: 'Chart analysis modes', free: '1 (General)', premium: 'All 5' },
  { label: 'Deep analysis reports', free: false, premium: true },
  { label: 'Chat history', free: false, premium: true },
  { label: 'PDF export', free: false, premium: 'Soon' },
  { label: 'D9/D10 varga charts', free: false, premium: 'Soon' },
  { label: 'Transit tracking', free: false, premium: true },
  { label: 'Priority AI responses', free: false, premium: true },
];

export default function PremiumPage() {
  const { updateSubscription, setCurrentPage } = useApp();
  const { addTokens } = useTokens();
  const [subscribing, setSubscribing] = useState(null);
  const [done, setDone] = useState(false);
  const [chosenPlan, setChosenPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    setSubscribing(plan.id);
    await new Promise(r => setTimeout(r, 1800));

    const months = plan.id === 'yearly' ? 12 : 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    updateSubscription({
      planType: plan.id,
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
    });
    addTokens(9999, `${plan.name} subscription bonus`, 0);
    setSubscribing(null);
    setChosenPlan(plan);
    setDone(true);
    setTimeout(() => { setDone(false); setCurrentPage('dashboard'); }, 2500);
  };

  if (done && chosenPlan) {
    return (
      <div className="page-wrapper">
        <CosmicBackground intensity="dense" />
        <div className="premium-success fade-in">
          <div className="success-constellation">
            <div className="success-ring" />
            <div className="success-ring success-ring-2" />
            <span className="material-symbols-outlined icon-filled premium-success-icon">workspace_premium</span>
          </div>
          <h2 className="headline-md text-primary">Welcome to Premium!</h2>
          <p className="body-md text-muted">{chosenPlan.name} plan activated. Your cosmic journey begins now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />
      <main className="main-content">
        {/* Hero */}
        <div className="premium-hero fade-in">
          <div className="premium-badge-lg chip chip-gold">
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: 14 }}>workspace_premium</span>
            Aetheric Premium
          </div>
          <h2 className="headline-lg text-on-surface">Unlock the Full Cosmos</h2>
          <p className="body-lg text-muted">Unlimited AI insights, all chart modes, and deep analysis — powered by Gemini.</p>
        </div>

        {/* Plans */}
        <div className="plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`plan-card card ${plan.popular ? 'plan-popular pulsing-border' : ''}`}>
              {plan.badge && (
                <div className="plan-badge chip chip-gold">{plan.badge}</div>
              )}
              <div className="plan-name title-md text-on-surface">{plan.name}</div>
              <div className="plan-price-row">
                <span className="plan-price headline-lg text-primary">{plan.price}</span>
                <span className="body-md text-muted">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f} className="plan-feature">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="body-md">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-lg ${plan.popular ? 'btn-primary' : 'btn-ghost'} plan-btn`}
                onClick={() => handleSubscribe(plan)}
                disabled={!!subscribing}
              >
                {subscribing === plan.id ? (
                  <><span className="loading-spinner" />Activating…</>
                ) : (
                  <>Get {plan.name}<span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Feature comparison */}
        <div className="comparison-table card fade-in">
          <h3 className="title-sm text-on-surface comparison-title">Feature Comparison</h3>
          <table className="feature-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th className="text-primary">Premium</th>
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map(f => (
                <tr key={f.label}>
                  <td>{f.label}</td>
                  <td>{renderFeatureCell(f.free)}</td>
                  <td>{renderFeatureCell(f.premium, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="premium-footnote label-sm text-muted">
          Simulated subscription (MVP mode) · No real payment processed · Plans auto-activate for demo
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function renderFeatureCell(val, isPremium = false) {
  if (val === true)  return <span className="material-symbols-outlined icon-filled" style={{ color: isPremium ? 'var(--primary)' : 'var(--tertiary)', fontSize: 18 }}>check_circle</span>;
  if (val === false) return <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>remove</span>;
  return <span style={{ color: isPremium ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: 13, fontWeight: 600 }}>{val}</span>;
}
