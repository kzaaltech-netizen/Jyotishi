import React, { useState } from 'react';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './BuyTokensPage.css';

const TOKEN_PACKS = [
  { id: 'starter',   name: 'Starter Pack',   tokens: 100,  price: 99,   popular: false, icon: 'bolt',           desc: 'Perfect to explore the basics' },
  { id: 'explorer',  name: 'Explorer Pack',   tokens: 500,  price: 399,  popular: true,  icon: 'explore',         desc: 'Best value — most popular choice' },
  { id: 'oracle',    name: 'Oracle Pack',     tokens: 1200, price: 799,  popular: false, icon: 'auto_awesome',    desc: 'For dedicated cosmic seekers' },
  { id: 'cosmic',    name: 'Cosmic Bundle',   tokens: 3000, price: 1799, popular: false, icon: 'galaxy_component', desc: 'Unlimited depth for serious practitioners' },
];

export default function BuyTokensPage() {
  const { addTokens, balance } = useTokens();
  const { setCurrentPage } = useApp();
  const [purchasing, setPurchasing] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePurchase = async (pack) => {
    setPurchasing(pack.id);
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 1500));
    addTokens(pack.tokens, pack.name, pack.price);
    setPurchasing(null);
    setSuccess(pack);
    setTimeout(() => { setSuccess(null); setCurrentPage('wallet'); }, 2000);
  };

  if (success) {
    return (
      <div className="page-wrapper">
        <CosmicBackground />
        <div className="purchase-success fade-in">
          <div className="success-orb">
            <span className="material-symbols-outlined icon-filled">check_circle</span>
          </div>
          <h2 className="headline-md text-primary">Tokens Added!</h2>
          <p className="body-md text-muted">{success.tokens} tokens have been added to your wallet.</p>
          <p className="label-sm text-muted">New balance: {balance + success.tokens} tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />
      <main className="main-content">
        <div className="buy-header fade-in">
          <h2 className="headline-md text-on-surface">Refill Your Cosmic Energy</h2>
          <p className="body-md text-muted">Current balance: <strong className="text-primary">{balance} tokens</strong></p>
        </div>

        <div className="packs-grid">
          {TOKEN_PACKS.map(pack => (
            <div key={pack.id} className={`pack-card card card-hover ${pack.popular ? 'pack-popular pulsing-border' : ''}`}>
              {pack.popular && (
                <div className="popular-badge chip chip-gold">
                  <span className="material-symbols-outlined icon-filled" style={{ fontSize: 12 }}>star</span>
                  Most Popular
                </div>
              )}
              <div className="pack-icon" style={{ background: pack.popular ? 'rgba(242,202,80,0.12)' : 'rgba(255,255,255,0.05)' }}>
                <span className="material-symbols-outlined icon-filled text-primary">{pack.icon}</span>
              </div>
              <div className="pack-name title-md text-on-surface">{pack.name}</div>
              <div className="pack-tokens headline-md text-primary">{pack.tokens.toLocaleString()}</div>
              <div className="label-sm text-muted">tokens</div>
              <p className="body-md text-muted pack-desc">{pack.desc}</p>
              <div className="pack-price title-md text-on-surface">₹{pack.price}</div>
              <div className="label-sm text-muted" style={{ marginTop: -8, marginBottom: 8 }}>
                ₹{(pack.price / pack.tokens).toFixed(2)}/token
              </div>
              <button
                className={`btn btn-lg ${pack.popular ? 'btn-primary' : 'btn-ghost'} pack-btn`}
                onClick={() => handlePurchase(pack)}
                disabled={!!purchasing}
              >
                {purchasing === pack.id ? (
                  <><span className="loading-spinner" />Processing…</>
                ) : (
                  <>Buy Now<span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="buy-footer card fade-in">
          <span className="material-symbols-outlined text-tertiary">lock</span>
          <p className="body-md text-muted">
            Simulated purchase (MVP mode) · Tokens are added instantly · No real payment processed
          </p>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage('premium')}>
            Or go Premium instead
            <span className="material-symbols-outlined">workspace_premium</span>
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
