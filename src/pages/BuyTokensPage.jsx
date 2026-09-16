import React, { useState } from 'react';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import './BuyTokensPage.css';

const PACKAGES = [
  { id: 'starter', tokens: 50, price: '₹199', label: 'Starter Pack', popular: false, desc: 'Ideal for 10 full AI consultation queries.' },
  { id: 'popular', tokens: 150, price: '₹499', label: 'Seeker Pack', popular: true, desc: 'Recommended for deep horoscopy exploration.' },
  { id: 'pro', tokens: 500, price: '₹1,299', label: 'Jyotishi Pack', popular: false, desc: 'Best value for extensive shastric research.' },
];

export default function BuyTokensPage() {
  const { addTokens } = useTokens();
  const { setCurrentPage } = useApp();
  const [purchasing, setPurchasing] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handlePurchase = (pkg) => {
    setPurchasing(pkg.id);
    setTimeout(() => {
      addTokens(pkg.tokens, `Purchased ${pkg.label}`);
      setPurchasing(null);
      setSuccessMsg(`Successfully added ${pkg.tokens} tokens to your wallet!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1000);
  };

  return (
    <div className="buy-tokens-page-wrapper">
      <TopBar />

      <main className="buy-main">
        <div className="app-container">

          <section className="buy-hero-card">
            <span className="font-label-sm text-gold uppercase font-semibold">टोकन वर्धन · Energy Refill</span>
            <h1 className="font-headline-xl text-ivory">Refill Consultation Tokens</h1>
            <p className="font-editorial-italic text-ivory-muted">Select a shastric token package to continue your celestial inquiries.</p>
          </section>

          {successMsg && (
            <div className="success-banner font-body-md">
              <span className="material-symbols-outlined icon-sm text-secondary">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <div className="packages-grid mt-space-xl">
            {PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`package-card ${pkg.popular ? 'package-popular' : ''}`}>
                {pkg.popular && <span className="popular-badge font-label-sm">Most Popular · लोकप्रिय</span>}
                <h3 className="font-headline-sm text-on-surface">{pkg.label}</h3>
                <div className="package-price font-headline-xl text-primary mt-space-2xs">{pkg.price}</div>
                <div className="package-tokens font-title-md text-secondary font-bold">{pkg.tokens} Tokens</div>
                <p className="package-desc font-body-sm text-on-surface-variant mt-space-xs">{pkg.desc}</p>
                <button
                  className="btn-submit font-title-md mt-space-lg"
                  disabled={purchasing === pkg.id}
                  onClick={() => handlePurchase(pkg)}
                >
                  {purchasing === pkg.id ? 'Processing...' : 'Get Tokens'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-space-2xl">
            <button className="btn-edit-link font-body-md" onClick={() => setCurrentPage('wallet')}>
              ← Back to Token Wallet
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
