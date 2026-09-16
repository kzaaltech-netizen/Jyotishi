import React from 'react';
import { useTokens } from '../context/TokenContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import { t } from '../lib/i18n.js';
import './TokenWalletPage.css';

export default function TokenWalletPage() {
  const { balance, ledger, todayUsed, totalUsed } = useTokens();
  const { isPremium, setCurrentPage } = useApp();

  return (
    <div className="wallet-page-wrapper">
      <TopBar />

      <main className="wallet-main">
        <div className="app-container">

          {/* Hero Header */}
          <section className="wallet-hero-card">
            <div className="wallet-hero-flex">
              <div>
                <span className="font-label-sm text-gold uppercase font-semibold">टोकन कोश · Energy Balance</span>
                <h1 className="font-headline-xl text-ivory">Token Wallet</h1>
                <p className="font-editorial-italic text-ivory-muted">Track your shastric consultation balance and transaction ledger.</p>
              </div>

              <div className="wallet-balance-box">
                <span className="material-symbols-outlined icon-lg text-gold">toll</span>
                <div>
                  <span className="font-headline-xl text-gold font-bold">{balance}</span>
                  <span className="font-label-sm text-ivory-muted block">Tokens Remaining</span>
                </div>
              </div>
            </div>
          </section>

          {/* Wallet Grid */}
          <div className="wallet-layout-grid mt-space-xl">

            {/* Actions & Refill */}
            <div className="wallet-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold">Wallet Actions & Refills</span>
              </div>
              <div className="wallet-stats-row mt-space-md">
                <div className="stat-item">
                  <span className="font-title-md text-primary font-bold">{todayUsed}</span>
                  <span className="font-label-sm text-on-surface-variant">Used Today</span>
                </div>
                <div className="stat-item">
                  <span className="font-title-md text-secondary font-bold">{totalUsed}</span>
                  <span className="font-label-sm text-on-surface-variant">Total Used</span>
                </div>
              </div>

              <div className="actions-flex mt-space-lg">
                <button className="btn-submit font-title-md" onClick={() => setCurrentPage('buy-tokens')}>
                  <span className="material-symbols-outlined icon-sm">add_circle</span>
                  Buy Tokens
                </button>
                <button className="btn-guest font-title-md" onClick={() => setCurrentPage('premium')}>
                  <span className="material-symbols-outlined icon-sm">workspace_premium</span>
                  Go Premium
                </button>
              </div>
            </div>

            {/* Cost Reference */}
            <div className="wallet-card">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold">Shastric Action Token Costs</span>
              </div>
              <div className="costs-list mt-space-md font-body-sm">
                <div className="cost-item-row">
                  <span>Generate Janam Kundli</span>
                  <span className="cost-pill">5 Tokens</span>
                </div>
                <div className="cost-item-row">
                  <span>AI Shastric Chat Consultation</span>
                  <span className="cost-pill">5 Tokens</span>
                </div>
                <div className="cost-item-row">
                  <span>Comprehensive Analysis Report</span>
                  <span className="cost-pill">5 Tokens</span>
                </div>
                <div className="cost-item-row">
                  <span>Re-calculate Divisional Chart</span>
                  <span className="cost-pill">3 Tokens</span>
                </div>
              </div>
            </div>

            {/* Usage Ledger */}
            <div className="wallet-card full-width">
              <div className="card-header-flex">
                <span className="font-title-md text-on-surface font-semibold">Transaction Ledger (गतिविधि विवरण)</span>
              </div>

              {ledger.length === 0 ? (
                <p className="font-body-md text-on-surface-variant text-center py-space-md">No transaction history recorded yet.</p>
              ) : (
                <div className="ledger-table-container mt-space-md font-body-sm">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Action</th>
                        <th>Token Cost</th>
                        <th>Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.slice(0, 15).map((l, idx) => (
                        <tr key={idx}>
                          <td>{new Date(l.timestamp || Date.now()).toLocaleString('en-IN')}</td>
                          <td>{l.description || l.action}</td>
                          <td className="text-primary font-bold">-{l.cost || 5}</td>
                          <td>{l.balanceAfter || balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
