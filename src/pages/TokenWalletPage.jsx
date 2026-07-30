import React from 'react';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './TokenWalletPage.css';

export default function TokenWalletPage() {
  const { balance, ledger, todayUsed, totalUsed, purchases } = useTokens();
  const { subscription, setCurrentPage } = useApp();

  const isPremium = subscription && new Date(subscription.endDate) > new Date();

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />
      <main className="main-content">
        <div className="wallet-header fade-in">
          <h2 className="headline-md text-on-surface">Token Wallet</h2>
          <p className="body-md text-muted">Track your cosmic energy balance</p>
        </div>

        <div className="wallet-grid">
          {/* Balance overview */}
          <div className="wallet-balance-card card slide-up">
            <div className="balance-orb">
              <span className="material-symbols-outlined icon-filled">toll</span>
            </div>
            <div className="balance-number headline-lg text-primary">{balance}</div>
            <div className="label-sm text-muted">TOKENS REMAINING</div>
            {isPremium && (
              <div className="premium-badge chip chip-gold">
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 12 }}>workspace_premium</span>
                Premium Active
              </div>
            )}
            <div className="balance-stats">
              <div className="balance-stat">
                <span className="title-md text-tertiary">{todayUsed}</span>
                <span className="label-sm text-muted">Used Today</span>
              </div>
              <div className="balance-divider" />
              <div className="balance-stat">
                <span className="title-md text-secondary">{totalUsed}</span>
                <span className="label-sm text-muted">Total Used</span>
              </div>
            </div>
            <div className="wallet-actions">
              <button className="btn btn-primary" onClick={() => setCurrentPage('buy-tokens')}>
                <span className="material-symbols-outlined">add_circle</span>
                Buy Tokens
              </button>
              <button className="btn btn-ghost" onClick={() => setCurrentPage('premium')}>
                <span className="material-symbols-outlined icon-filled">workspace_premium</span>
                Go Premium
              </button>
            </div>
          </div>

          {/* Token costs reference */}
          <div className="card costs-card slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="title-sm text-on-surface costs-title">
              <span className="material-symbols-outlined text-primary">info</span>
              Token Costs
            </h3>
            {[
              { action: 'Generate natal chart', cost: 5, icon: 'brightness_7' },
              { action: 'Generate analysis chart', cost: 3, icon: 'analytics' },
              { action: 'AI chat message', cost: 1, icon: 'chat' },
              { action: 'Deep analysis report', cost: 5, icon: 'description' },
              { action: 'Re-run chart', cost: 3, icon: 'refresh' },
            ].map(c => (
              <div key={c.action} className="cost-row">
                <div className="cost-action">
                  <span className="material-symbols-outlined text-muted" style={{ fontSize: 16 }}>{c.icon}</span>
                  <span className="body-md">{c.action}</span>
                </div>
                <span className="chip chip-gold">{c.cost} tokens</span>
              </div>
            ))}
          </div>

          {/* Usage ledger */}
          <div className="card ledger-card slide-up" style={{ animationDelay: '0.15s', gridColumn: '1 / -1' }}>
            <h3 className="title-sm text-on-surface ledger-title">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              Usage History
            </h3>
            {ledger.length === 0 ? (
              <p className="body-md text-muted empty-ledger">No token activity yet. Generate a chart to begin.</p>
            ) : (
              <div className="ledger-list">
                {ledger.slice(0, 20).map(entry => (
                  <div key={entry.id} className="ledger-row">
                    <div className="ledger-info">
                      <span className="body-md text-on-surface">{entry.description || entry.action}</span>
                      <span className="label-sm text-muted">
                        {new Date(entry.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ·{' '}
                        {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="ledger-cost">
                      <span className={entry.cost < 0 ? 'text-tertiary' : 'text-primary'} style={{ fontWeight: 700, fontSize: 14 }}>
                        {entry.cost < 0 ? '+' : '-'}{Math.abs(entry.cost)}
                      </span>
                      <span className="label-sm text-muted">{entry.balance} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
