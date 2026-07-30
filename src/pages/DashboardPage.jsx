import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { apiInterpretChart } from '../lib/api.js';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import { dashaRemaining } from '../lib/astrology.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { chartData, birthProfile, setCurrentPage, setCurrentMode, savedReports, saveReport } = useApp();
  const { balance, hasTokens, reload: reloadTokens } = useTokens();
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!chartData) return;
    const existing = savedReports.find(r => r.mode === 'general');
    if (existing) {
      setSummary(existing.content);
    }
  }, [chartData, savedReports]);

  const handleGenerateSummary = async () => {
    if (!hasTokens('generate_analysis')) {
      setCurrentPage('buy-tokens');
      return;
    }
    setSummaryLoading(true);
    try {
      const { reply } = await apiInterpretChart('general');
      setSummary(reply);
      saveReport({ mode: 'general', content: reply });
      reloadTokens();
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (!chartData) return null;

  const { planets, lagnaSign, nakshatra, dashaInfo, strengths, houses } = chartData;
  const currentDasha = dashaInfo?.currentDasha;
  const antardasha   = dashaInfo?.antardasha;
  const sunPlanet    = planets.find(p => p.name === 'Sun');
  const moonPlanet   = planets.find(p => p.name === 'Moon');

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />

      <main className="main-content">
        {/* Welcome row */}
        <div className="welcome-row fade-in">
          <div>
            <h2 className="headline-md text-on-surface">
              {getGreeting()}, <span className="text-primary">{birthProfile?.fullName?.split(' ')[0]}</span>
            </h2>
            <p className="body-md text-muted">Your celestial snapshot · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {balance < 10 && (
            <button className="low-token-alert" onClick={() => setCurrentPage('buy-tokens')}>
              <span className="material-symbols-outlined">warning</span>
              <span>Only {balance} tokens left · Refill now</span>
            </button>
          )}
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          {/* Left: Chart */}
          <section className="chart-section slide-up">
            <div className="card chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="title-md text-on-surface">Natal Birth Chart (D1)</h3>
                  <p className="body-md text-muted">{birthProfile?.birthplace} · {birthProfile?.dob}</p>
                </div>
                <div className="chart-chips">
                  <span className="chip chip-gold">{lagnaSign} Lagna</span>
                  <span className="chip chip-violet">{nakshatra?.name}</span>
                </div>
              </div>
              <div className="chart-wrapper">
                <NorthIndianChart chartData={chartData} />
              </div>
            </div>
          </section>

          {/* Right: Insights */}
          <aside className="insights-section slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Nakshatra insights */}
            <div className="card insight-card">
              <h3 className="title-sm text-primary insight-title">
                <span className="material-symbols-outlined">flare</span>
                Nakshatra Insights
              </h3>
              <div className="insight-items">
                <InsightItem
                  label="Rising Sign" tag="Lagna"
                  title={`${lagnaSign}`}
                  desc={getLagnaDesc(lagnaSign)}
                  color="violet"
                />
                <InsightItem
                  label="Moon Mansion" tag={nakshatra?.name}
                  title={`${nakshatra?.name} (${nakshatra?.lord})`}
                  desc={getNakshatraDesc(nakshatra?.name)}
                  color="gold"
                />
                <InsightItem
                  label="Current Dasha" tag={antardasha ? `${currentDasha?.lord}/${antardasha?.lord}` : currentDasha?.lord}
                  title={`${currentDasha?.lord} Mahadasha`}
                  desc={dashaRemaining(currentDasha)}
                  color="teal"
                />
              </div>
            </div>

            {/* Strengths */}
            <div className="card insight-card">
              <h3 className="title-sm text-primary insight-title">
                <span className="material-symbols-outlined">analytics</span>
                Life Area Strengths
              </h3>
              <div className="strengths-list">
                {[
                  { label: 'Career', value: strengths?.career, color: 'teal',   icon: 'work' },
                  { label: 'Wealth', value: strengths?.wealth, color: 'gold',   icon: 'payments' },
                  { label: 'Abundance',value: strengths?.abundance, color: 'violet', icon: 'eco' },
                  { label: 'Union',  value: strengths?.union,  color: 'violet', icon: 'favorite' },
                ].map(s => (
                  <div key={s.label} className="strength-row">
                    <div className="strength-label">
                      <span className={`material-symbols-outlined text-${s.color === 'gold' ? 'primary' : s.color === 'teal' ? 'tertiary' : 'secondary'}`}>{s.icon}</span>
                      <span className="label-sm">{s.label}</span>
                    </div>
                    <div className="strength-right">
                      <span className={`label-sm text-${s.color === 'gold' ? 'primary' : s.color === 'teal' ? 'tertiary' : 'secondary'}`}>{s.value}%</span>
                      <div className="progress-track strength-track">
                        <div
                          className={`progress-fill progress-${s.color === 'gold' ? 'gold' : s.color === 'teal' ? 'teal' : 'violet'}`}
                          style={{ width: `${s.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav cards */}
            <div className="quick-modes">
              {[
                { mode: 'career',    label: 'Career',   icon: 'work',     color: 'teal' },
                { mode: 'wealth',    label: 'Wealth',   icon: 'payments', color: 'gold' },
                { mode: 'abundance', label: 'Abundance',icon: 'eco',      color: 'violet' },
                { mode: 'union',     label: 'Union',    icon: 'favorite', color: 'violet' },
              ].map(m => (
                <button
                  key={m.mode}
                  className="quick-mode-btn card-hover card"
                  onClick={() => { setCurrentMode(m.mode); setCurrentPage('analysis'); }}
                >
                  <span className={`material-symbols-outlined ${m.color === 'gold' ? 'text-primary' : m.color === 'teal' ? 'text-tertiary' : 'text-secondary'}`}>{m.icon}</span>
                  <span className="label-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Planet table */}
          <div className="col-12 planet-section slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="card">
              <h3 className="title-sm text-on-surface planet-table-title">
                <span className="material-symbols-outlined text-primary">brightness_7</span>
                Planetary Positions
              </h3>
              <div className="planet-table-wrapper">
                <table className="planet-table">
                  <thead>
                    <tr>
                      <th>Planet</th>
                      <th>Sign</th>
                      <th>Degree</th>
                      <th>House</th>
                      <th>Dignity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map(p => (
                      <tr key={p.name}>
                        <td>
                          <span className="planet-cell">
                            <span style={{ color: p.color, fontWeight: 700 }}>{p.abbr}</span>
                            <span className="text-muted body-md">{p.name}</span>
                          </span>
                        </td>
                        <td>{p.sign}</td>
                        <td className="text-muted">{p.deg}°</td>
                        <td>H{p.house}</td>
                        <td>
                          <span className={`dignity-badge dignity-${p.dignity.toLowerCase().replace(' ','-')}`}>
                            {p.dignity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="col-12 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card ai-summary-card">
              <div className="ai-summary-header">
                <div className="agent-icon agent-icon-gold">
                  <span className="material-symbols-outlined icon-filled">auto_awesome</span>
                </div>
                <div>
                  <div className="title-sm text-on-surface">Aetheric AI Reading</div>
                  <div className="label-sm text-muted">Jyotish · General Chart Analysis</div>
                </div>
                {!summary && !summaryLoading && (
                  <button className="btn btn-primary" onClick={handleGenerateSummary} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 13 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>toll</span>
                    Generate (3 Tokens)
                  </button>
                )}
              </div>
              {summaryLoading ? (
                <div className="summary-loading">
                  <div className="typing-dot" />
                  <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                  <div className="typing-dot" style={{ animationDelay: '300ms' }} />
                  <span className="label-sm text-muted" style={{ marginLeft: 8 }}>Reading your chart…</span>
                </div>
              ) : summary ? (
                <p className="body-md ai-summary-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{summary}</p>
              ) : (
                <p className="body-md text-muted" style={{ fontStyle: 'italic' }}>No analysis generated yet. Click generate to reveal your soul patterns.</p>
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className="col-12 slide-up" style={{ animationDelay: '0.25s' }}>
            <ChatPanel mode="general" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// Helpers
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getLagnaDesc(sign) {
  const desc = {
    Aries: 'Fierce vitality and natural leadership mark your presence in the world.',
    Taurus: 'A grounded nature with a deep appreciation for beauty and stability.',
    Gemini: 'A quick, versatile mind that thrives in communication and connection.',
    Cancer: 'Deeply intuitive and nurturing, the home and family anchor your being.',
    Leo: 'The solar lion bestows regal presence and strong creative leadership.',
    Virgo: 'Precision, service, and analytical clarity define your worldly approach.',
    Libra: 'Balance, aesthetics, and relationship harmony shape your outer life.',
    Scorpio: 'Intensity, depth, and transformative power are your signature gifts.',
    Sagittarius: 'Philosophical fire and expansive optimism propel your journey.',
    Capricorn: 'Structured ambition and patient mastery define your life path.',
    Aquarius: 'Humanitarian vision and intellectual originality set you apart.',
    Pisces: 'Boundless compassion and spiritual sensitivity color your world.',
  };
  return desc[sign] || 'Your rising sign shapes how the world perceives you.';
}

function getNakshatraDesc(name) {
  const desc = {
    Ashwini: 'The swift horsemen indicate healing abilities and new beginnings.',
    Bharani: 'Ruled by Yama, you carry creative force and transformative power.',
    Krittika: 'The Pleiades bestow sharp focus, courage, and decisive action.',
    Rohini: 'The red one — sensuality, fertility, and artistic abundance.',
    Mrigashira: 'The deer head — gentle seeking, curiosity, and restless search.',
    Ardra: 'Ruled by Rudra — stormy transformations lead to profound renewal.',
    Punarvasu: 'The return of light — restoration, joy, and multiple attempts.',
    Pushya: 'The nourisher — Saturn\'s grace brings discipline and care.',
  };
  return desc[name] || `${name} nakshatra brings unique cosmic qualities to your Moon.`;
}

// Reusable InsightItem for this page
function InsightItem({ label, tag, title, desc, color = 'gold' }) {
  const colorClass = color === 'gold' ? 'text-primary' : color === 'teal' ? 'text-tertiary' : 'text-secondary';
  return (
    <div className="insight-item-db">
      <div className="idb-top">
        <span className={`label-sm ${colorClass}`}>{label}</span>
        <span className="label-sm text-muted">{tag}</span>
      </div>
      <div className="title-sm text-on-surface">{title}</div>
      <p className="body-md text-muted" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{desc}</p>
    </div>
  );
}
