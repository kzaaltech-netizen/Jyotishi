import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './SplashPage.css';

export default function SplashPage() {
  const { setCurrentPage } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="splash-page">
      <CosmicBackground intensity="dense" />

      <div className={`splash-content ${visible ? 'fade-in' : ''}`}>
        {/* Orbital rings decoration */}
        <div className="orbital-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="orb floating">
            <span className="material-symbols-outlined icon-filled">auto_awesome</span>
          </div>
        </div>

        <div className="splash-text">
          <h1 className="display-lg splash-title">Aetheric Jyotish</h1>
          <p className="splash-tagline headline-md">
            The Stars Know You Better Than You Know Yourself
          </p>
          <p className="body-lg splash-desc">
            A premium AI-powered Vedic astrology platform. Generate your natal chart,
            explore deep planetary insights, and converse with specialized cosmic intelligence.
          </p>
        </div>

        <div className="splash-features">
          {[
            { icon: 'brightness_7', label: 'Real Vedic Charts', desc: 'Accurate planetary positions with Lahiri ayanamsa' },
            { icon: 'psychology', label: 'AI Intelligence', desc: 'Gemini-powered agents specialized per chart mode' },
            { icon: 'toll', label: 'Token Economy', desc: 'Pay only for what you use. Upgrade for unlimited access' },
          ].map(f => (
            <div key={f.label} className="feature-chip glass">
              <span className="material-symbols-outlined text-primary">{f.icon}</span>
              <div>
                <div className="title-sm text-on-surface">{f.label}</div>
                <div className="body-md text-muted">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="splash-cta">
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentPage('auth')}>
            Begin Your Journey
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <p className="label-sm text-muted">50 free tokens to start · No credit card required</p>
        </div>
      </div>
    </div>
  );
}
