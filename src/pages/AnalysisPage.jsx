import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { apiInterpretChart } from '../lib/api.js';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './AnalysisPage.css';

const MODE_META = {
  career: {
    title: 'Career Analysis',
    subtitle: 'Professional path, growth, and timing',
    icon: 'work',
    color: 'teal',
    accentColor: 'var(--tertiary)',
    bgGlow: 'rgba(0, 228, 242, 0.08)',
    focusHouses: [1, 6, 10],
    metrics: [
      { key: 'authority',  label: 'Authority',  icon: 'military_tech',       planet: 'Sun',    house: 10 },
      { key: 'stability',  label: 'Stability',  icon: 'anchor',              planet: 'Saturn', house: 6 },
      { key: 'growth',     label: 'Growth',     icon: 'trending_up',         planet: 'Jupiter',house: 1 },
    ]
  },
  wealth: {
    title: 'Wealth Analysis',
    subtitle: 'Income potential, savings, and financial flow',
    icon: 'payments',
    color: 'gold',
    accentColor: 'var(--primary)',
    bgGlow: 'rgba(242, 202, 80, 0.08)',
    focusHouses: [2, 5, 11],
    metrics: [
      { key: 'income',    label: 'Income',    icon: 'account_balance_wallet', planet: 'Jupiter',house: 2 },
      { key: 'savings',   label: 'Savings',   icon: 'savings',                planet: 'Saturn', house: 11 },
      { key: 'windfall',  label: 'Windfall',  icon: 'casino',                 planet: 'Rahu',   house: 5 },
    ]
  },
  abundance: {
    title: 'Abundance Analysis',
    subtitle: 'Prosperity, luck, and expansion windows',
    icon: 'eco',
    color: 'violet',
    accentColor: 'var(--secondary)',
    bgGlow: 'rgba(216, 185, 255, 0.08)',
    focusHouses: [5, 9, 11],
    metrics: [
      { key: 'luck',      label: 'Luck',       icon: 'star',       planet: 'Jupiter',house: 9 },
      { key: 'expansion', label: 'Expansion',  icon: 'expand',     planet: 'Jupiter',house: 5 },
      { key: 'flow',      label: 'Resource Flow',icon: 'water',    planet: 'Venus',  house: 11 },
    ]
  },
  union: {
    title: 'Union Analysis',
    subtitle: 'Love, partnership, and relationship timing',
    icon: 'favorite',
    color: 'violet',
    accentColor: 'var(--secondary)',
    bgGlow: 'rgba(216, 185, 255, 0.08)',
    focusHouses: [1, 5, 7],
    metrics: [
      { key: 'attraction',label: 'Attraction', icon: 'favorite',  planet: 'Venus',  house: 7 },
      { key: 'bonding',   label: 'Bonding',   icon: 'handshake', planet: 'Moon',   house: 5 },
      { key: 'longevity', label: 'Longevity', icon: 'shield',    planet: 'Saturn', house: 1 },
    ]
  }
};

export default function AnalysisPage() {
  const { chartData, birthProfile, currentMode, setCurrentPage, savedReports, saveReport } = useApp();
  const { balance, hasTokens, reload: reloadTokens } = useTokens();
  const meta = MODE_META[currentMode] || MODE_META.career;
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [prevMode, setPrevMode] = useState(null);

  useEffect(() => {
    if (prevMode === currentMode) return;
    setPrevMode(currentMode);
    setSummary('');
    if (!chartData) return;
    
    const existing = savedReports.find(r => r.mode === currentMode);
    if (existing) {
      setSummary(existing.content);
    }
  }, [currentMode, chartData, prevMode, savedReports]);

  const handleGenerateSummary = async () => {
    if (!hasTokens('generate_analysis')) {
      setCurrentPage('buy-tokens');
      return;
    }
    setLoading(true);
    try {
      const { reply } = await apiInterpretChart(currentMode);
      setSummary(reply);
      saveReport({ mode: currentMode, content: reply });
      reloadTokens();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!chartData) return null;
  const { planets, strengths, dashaInfo } = chartData;

  // Compute metric values from chart
  const getMetricValue = (metric) => {
    const planet = planets.find(p => p.name === metric.planet);
    if (!planet) return Math.floor(Math.random() * 30 + 55);
    let base = 60;
    if (planet.house === metric.house) base += 15;
    if (planet.dignity === 'Exalted') base += 20;
    if (planet.dignity === 'Debilitated') base -= 20;
    if (planet.dignity === 'Own Sign') base += 12;
    return Math.min(98, Math.max(30, base));
  };

  const modeStrength = strengths?.[currentMode] ?? 65;
  const currentDasha = dashaInfo?.currentDasha;

  return (
    <div className="page-wrapper">
      <CosmicBackground />
      <TopBar />

      {/* Mode glow overlay */}
      <div className="analysis-glow" style={{ background: `radial-gradient(ellipse at 70% 20%, ${meta.bgGlow} 0%, transparent 60%)` }} />

      <main className="main-content">
        {/* Header */}
        <div className="analysis-header fade-in">
          <div className="analysis-mode-badge" style={{ color: meta.accentColor, borderColor: `${meta.accentColor}40`, background: `${meta.bgGlow}` }}>
            <span className="material-symbols-outlined icon-filled">{meta.icon}</span>
            <span className="label-sm">{currentMode.toUpperCase()} MODE</span>
          </div>
          <h2 className="headline-md text-on-surface">{meta.title}</h2>
          <p className="body-md text-muted">{meta.subtitle}</p>
        </div>

        <div className="analysis-grid">
          {/* Left: Chart + transit */}
          <div className="analysis-left slide-up">
            <div className="card analysis-chart-card">
              <div className="analysis-chart-header">
                <h3 className="title-sm text-on-surface">{meta.title} Chart View</h3>
                <span className="chip chip-surface">D1 · Focus Houses: {meta.focusHouses.map(h => `H${h}`).join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <NorthIndianChart chartData={chartData} compact />
              </div>
              <div className="focus-houses">
                {meta.focusHouses.map(hNum => {
                  const house = chartData.houses?.find(h => h.number === hNum);
                  return (
                    <div key={hNum} className="focus-house-tag" style={{ borderColor: meta.accentColor + '30' }}>
                      <span className="label-sm" style={{ color: meta.accentColor }}>H{hNum}</span>
                      <span className="body-md text-muted">{house?.sign}</span>
                      {house?.planets?.map(p => (
                        <span key={p.name} style={{ color: p.color, fontWeight: 700, fontSize: 11 }}>{p.abbr}</span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current transit / dasha card */}
            <div className="card transit-card" style={{ borderLeft: `3px solid ${meta.accentColor}` }}>
              <div className="transit-header">
                <span className="material-symbols-outlined" style={{ color: meta.accentColor }}>timeline</span>
                <h4 className="title-sm text-on-surface">Current Period</h4>
              </div>
              <p className="body-md text-muted">
                <strong style={{ color: meta.accentColor }}>{currentDasha?.lord} Mahadasha</strong> is active.{' '}
                {getDashaNote(currentDasha?.lord, currentMode)}
              </p>
            </div>
          </div>

          {/* Right: Metrics + Chat */}
          <div className="analysis-right slide-up" style={{ animationDelay: '0.1s' }}>
            {/* AI Summary */}
            <div className="card analysis-summary-card">
              <div className="analysis-summary-header">
                <div className="agent-icon" style={{ background: meta.bgGlow, color: meta.accentColor }}>
                  <span className="material-symbols-outlined icon-filled">{meta.icon}</span>
                </div>
                <div>
                  <div className="title-sm text-on-surface">{meta.title} Reading</div>
                  <div className="label-sm text-muted">AI · Chart-based Analysis</div>
                </div>
                {!summary && !loading && (
                  <button className="btn btn-primary" onClick={handleGenerateSummary} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 13, background: meta.accentColor }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>toll</span>
                    Generate (3 Tokens)
                  </button>
                )}
              </div>
              {loading ? (
                <div className="summary-loading">
                  <div className="typing-dot" style={{ background: meta.accentColor }} />
                  <div className="typing-dot" style={{ animationDelay: '150ms', background: meta.accentColor }} />
                  <div className="typing-dot" style={{ animationDelay: '300ms', background: meta.accentColor }} />
                  <span className="label-sm text-muted" style={{ marginLeft: 8 }}>Analysing your {currentMode} chart…</span>
                </div>
              ) : summary ? (
                <p className="body-md text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{summary}</p>
              ) : (
                <p className="body-md text-muted" style={{ fontStyle: 'italic' }}>No analysis generated yet. Click generate to reveal insights.</p>
              )}
            </div>

            {/* Metrics */}
            <div className="card metrics-card">
              <h3 className="title-sm text-on-surface metrics-title">
                <span className="material-symbols-outlined" style={{ color: meta.accentColor }}>analytics</span>
                {meta.title} Metrics
              </h3>
              <div className="metrics-list">
                {meta.metrics.map(m => {
                  const val = getMetricValue(m);
                  return (
                    <div key={m.key} className="metric-row">
                      <div className="metric-label">
                        <span className="material-symbols-outlined" style={{ color: meta.accentColor, fontSize: 16 }}>{m.icon}</span>
                        <span className="label-sm">{m.label.toUpperCase()}</span>
                      </div>
                      <div className="metric-right">
                        <span className="label-sm" style={{ color: meta.accentColor }}>{val}%</span>
                        <div className="progress-track metric-track">
                          <div className="progress-fill metric-fill" style={{ width: `${val}%`, background: meta.accentColor }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Overall strength */}
                <div className="metric-overall">
                  <span className="label-sm text-muted">OVERALL {currentMode.toUpperCase()} STRENGTH</span>
                  <div className="overall-value headline-md" style={{ color: meta.accentColor }}>{modeStrength}<span className="label-sm text-muted">/100</span></div>
                </div>
              </div>
            </div>

            {/* Chat */}
            <ChatPanel mode={currentMode} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function getDashaNote(lord, mode) {
  const notes = {
    career: {
      Saturn: 'A Saturn Dasha phase rewards disciplined, structured effort — career growth is gradual but lasting.',
      Jupiter: 'Jupiter Dasha opens doors for expansion, teaching roles, and leadership opportunities.',
      Sun: 'The Sun Dasha brings authority, recognition, and clarity in professional identity.',
      Mars: 'Mars Dasha favours initiative, new ventures, and competitive environments.',
      default: 'This Dasha brings specific career lessons — ask the Career Oracle for details.'
    },
    wealth: {
      Jupiter: 'Jupiter Dasha is one of the most auspicious for wealth expansion and financial opportunities.',
      Venus: 'Venus Dasha often brings comfort, luxury, and steady income streams.',
      Mercury: 'Mercury Dasha favours trade, communication-based income, and smart investments.',
      default: 'This Dasha shapes your financial rhythm — ask the Wealth Oracle for personalized insight.'
    },
    abundance: {
      Jupiter: 'Jupiter Dasha is the peak abundance period — opportunities expand naturally.',
      Rahu: 'Rahu Dasha brings sudden windfalls and unconventional paths to prosperity.',
      Venus: 'Venus Dasha pours abundance through creativity, beauty, and relationships.',
      default: 'Current Dasha has specific abundance patterns — ask the Abundance Oracle.'
    },
    union: {
      Venus: 'Venus Dasha is the prime period for love, union, and deepened bonds.',
      Moon: 'Moon Dasha heightens emotional sensitivity and magnetic attraction to others.',
      Jupiter: 'Jupiter Dasha favours meaningful commitments and spiritual partnerships.',
      default: 'Your current Dasha shapes relationship themes — ask the Union Oracle for details.'
    }
  };
  const modeNotes = notes[mode] || notes.career;
  return modeNotes[lord] || modeNotes.default;
}

// InsightItem helper component (reused from dashboard)
function InsightItem({ label, tag, title, desc, color }) {
  return (
    <div className={`insight-item insight-item-${color}`}>
      <div className="insight-item-top">
        <span className={`label-sm text-${color === 'gold' ? 'primary' : color === 'teal' ? 'tertiary' : 'secondary'}`}>{label}</span>
        <span className="label-sm text-muted">{tag}</span>
      </div>
      <div className="title-sm text-on-surface">{title}</div>
      <p className="body-md text-muted insight-desc">{desc}</p>
    </div>
  );
}
