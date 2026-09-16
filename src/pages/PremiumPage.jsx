import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import './PremiumPage.css';

export default function PremiumPage() {
  const { isPremium, updateSubscription, setCurrentPage } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubscribe = async (plan) => {
    setLoading(true);
    const months = plan === 'annual' ? 12 : 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    await updateSubscription({ plan, endDate: endDate.toISOString() });
    setLoading(false);
    setSuccess(`Subscribed to ${plan.toUpperCase()} Membership!`);
  };

  return (
    <div className="premium-page-wrapper">
      <TopBar />

      <main className="premium-main">
        <div className="app-container">

          <section className="premium-hero-card">
            <span className="font-label-sm text-gold uppercase font-semibold">असीम ज्ञानम् · Unlimited Membership</span>
            <h1 className="font-headline-xl text-ivory">Vedic Pro Membership</h1>
            <p className="font-editorial-italic text-ivory-muted">
              Unlock complete Parashara divisional analysis, daily transit journals, and unlimited AI consultations.
            </p>
          </section>

          {success && (
            <div className="success-banner font-body-md text-center mb-space-lg">
              <span className="material-symbols-outlined icon-sm text-secondary">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          <div className="plans-grid">
            <div className="plan-card">
              <h3 className="font-headline-sm text-on-surface">Monthly Seeker</h3>
              <div className="plan-price font-headline-xl text-primary mt-space-2xs">₹499 <span className="font-body-sm text-on-surface-variant">/ month</span></div>
              <ul className="plan-features mt-space-md font-body-sm">
                <li>• Complete D1, D9, D10 Divisional Charts</li>
                <li>• Unlimited Daily Gochar Transits</li>
                <li>• 100 Bonus Consultation Tokens / month</li>
                <li>• Shastric PDF Exporting</li>
              </ul>
              <button className="btn-submit font-title-md mt-space-lg" disabled={loading || isPremium()} onClick={() => handleSubscribe('monthly')}>
                {isPremium() ? 'Active Plan' : 'Subscribe Monthly'}
              </button>
            </div>

            <div className="plan-card plan-featured">
              <span className="popular-badge font-label-sm">Best Value · उत्तम विकल्प</span>
              <h3 className="font-headline-sm text-on-surface">Annual Archival Pass</h3>
              <div className="plan-price font-headline-xl text-primary mt-space-2xs">₹3,999 <span className="font-body-sm text-on-surface-variant">/ year</span></div>
              <ul className="plan-features mt-space-md font-body-sm">
                <li>• All Monthly Features Included</li>
                <li>• Unlimited AI Shastric Consultations</li>
                <li>• Full Ashtakavarga & Shadbala Strength Tables</li>
                <li>• Priority Jyotish Agent Orchestration</li>
              </ul>
              <button className="btn-submit font-title-md mt-space-lg" disabled={loading || isPremium()} onClick={() => handleSubscribe('annual')}>
                {isPremium() ? 'Active Plan' : 'Subscribe Annual (Save 33%)'}
              </button>
            </div>
          </div>

          <div className="text-center mt-space-2xl">
            <button className="btn-edit-link font-body-md" onClick={() => setCurrentPage('profile')}>
              ← Back to Profile
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
