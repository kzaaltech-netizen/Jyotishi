import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  MapPin,
  Compass,
  Eye,
  Bot,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { apiGetChart } from '../lib/api.js';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import SouthIndianChart from '../components/chart/SouthIndianChart.jsx';
import PlanetDetailModal from '../components/chart/PlanetDetailModal.jsx';
import HouseDetailModal from '../components/chart/HouseDetailModal.jsx';
import DashaTimeline from '../components/chart/DashaTimeline.jsx';
import PlanetaryTable from '../components/chart/PlanetaryTable.jsx';
import { normalizeChartData } from '../components/chart/chartDataNormalizer.js';
import { t } from '../lib/i18n.js';
import { springTransition, gentleSpring, buttonPress } from '../lib/motion.js';
import './KundliPage.css';

export default function KundliPage() {
  const { chartData, setChartData, birthProfile, setCurrentPage, setCurrentMode, language } = useApp();
  const [activeTab, setActiveTab] = useState('d1'); // 'd1' | 'd9' | 'd10' | 'ephemeris' | 'dasha'
  const [chartStyle, setChartStyle] = useState('north'); // 'north' | 'south'
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingDivisional, setLoadingDivisional] = useState(false);

  // Proactively fetch divisional charts on demand if not present in memory
  useEffect(() => {
    if (['d9', 'd10'].includes(activeTab)) {
      if (!chartData?.divisionals?.[activeTab] && setChartData) {
        setLoadingDivisional(true);
        apiGetChart(activeTab)
          .then((data) => {
            if (data) {
              setChartData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  divisionals: {
                    ...(prev?.divisionals || {}),
                    [activeTab]: data,
                  },
                };
              });
            }
          })
          .catch((err) => {
            console.warn(`Could not load ${activeTab} chart:`, err);
          })
          .finally(() => {
            setLoadingDivisional(false);
          });
      }
    }
  }, [activeTab, chartData, setChartData]);

  // Normalize canonical chart data safely
  const normalizedD1 = useMemo(() => {
    return chartData ? normalizeChartData(chartData) : null;
  }, [chartData]);

  const normalizedD9 = useMemo(() => {
    if (!chartData?.divisionals?.d9) return null;
    return normalizeChartData(chartData.divisionals.d9);
  }, [chartData]);

  const normalizedD10 = useMemo(() => {
    if (!chartData?.divisionals?.d10) return null;
    return normalizeChartData(chartData.divisionals.d10);
  }, [chartData]);

  if (!chartData || !normalizedD1 || !normalizedD1.isValid) {
    return (
      <div className="kundli-page-wrapper">
        <TopBar />
        <main className="kundli-main">
          <div className="app-container text-center">
            <div className="loading-card">
              <span className="material-symbols-outlined icon-lg text-primary animate-spin">hourglass_empty</span>
              <p className="font-body-md text-on-surface mt-space-sm">{t('loading', language, 'Calculating Kundli...')}</p>
              {normalizedD1 && !normalizedD1.isValid && (
                <p className="font-body-xs text-error mt-2">{normalizedD1.error}</p>
              )}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const { planets, lagna, dasha, houses, nakshatra } = normalizedD1;
  const userName = birthProfile?.fullName || 'जातक (Subject)';
  const birthDate = birthProfile?.dob || '—';
  const birthTime = birthProfile?.birthTime || '—';
  const birthplace = birthProfile?.birthplace || '—';

  // Moon and key astrological placements
  const moon = planets.find(p => p.name === 'Moon');
  const exaltedPlanets = planets.filter(p => p.dignity === 'Exalted');
  const ownSignPlanets = planets.filter(p => p.dignity === 'Own Sign');
  const dashaInfo = dasha?.currentMahadasha || null;

  // Resolve current chart for active divisional tab
  let currentChart = chartData;
  let chartTitle = 'D1: Lagna Chart (लग्न कुण्डली)';
  let isDivisionalUnavailable = false;

  if (activeTab === 'd9') {
    if (normalizedD9 && normalizedD9.isValid) {
      currentChart = chartData.divisionals.d9;
      chartTitle = 'D9: Navamsha Chart (नवांश कुण्डली)';
    } else {
      isDivisionalUnavailable = true;
      chartTitle = 'D9: Navamsha Chart (नवांश कुण्डली)';
    }
  } else if (activeTab === 'd10') {
    if (normalizedD10 && normalizedD10.isValid) {
      currentChart = chartData.divisionals.d10;
      chartTitle = 'D10: Dashamsha Chart (दशमांश कुण्डली)';
    } else {
      isDivisionalUnavailable = true;
      chartTitle = 'D10: Dashamsha Chart (दशमांश कुण्डली)';
    }
  }

  // Handle Ask Your Kundli redirection from selected planet / house or quick queries
  const handleAskFromChart = (query, targetMode = 'general') => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pending_chart_query', query);
    }
    if (setCurrentMode) setCurrentMode(targetMode);
    if (setCurrentPage) setCurrentPage('ask');
  };

  const handleHouseSelect = (house) => {
    setSelectedHouse(house);
    setSelectedPlanet(null);
  };

  const handlePlanetSelect = (planet) => {
    setSelectedPlanet(planet);
    setSelectedHouse(null);
  };

  return (
    <div className="kundli-page-wrapper">
      <TopBar />

      <main className="kundli-main">
        <div className="app-container">

          {/* Top Archival Folio Header */}
          <motion.section
            className="kundli-hero-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="kundli-hero-flex">
              <div className="kundli-hero-left">
                <span className="editorial-manuscript-tag font-label-sm text-gold tracking-wider uppercase block mb-1">
                  प्रमाणिक वैदिक जन्म कुण्डली · Natal Chart
                </span>
                <h1 className="font-headline-xl text-ivory">
                  Janam Kundli <span className="font-editorial-italic text-gold">· जन्म पत्रिका</span>
                </h1>
                <p className="font-body-md text-ivory-muted mt-1">
                  Planetary dispositions at the moment of birth under Lahiri Ayanamsha.
                </p>
              </div>

              <div className="kundli-subject-card">
                <div className="subject-header">
                  <span className="font-label-sm text-gold uppercase">जातक · Subject</span>
                  <span className="font-title-md text-ivory font-bold">{userName}</span>
                </div>
                <div className="subject-details font-body-sm">
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold-light" /> {birthDate}, {birthTime}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-light" /> {birthplace}</div>
                  <div className="ayanamsha-line flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-gold" /> Ayanamsha: Chitra Paksha (Lahiri)</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 7. Kundli Summary Strip — Hero Astro Metrics */}
          <section className="kundli-summary-strip">
            <motion.div
              className="summary-metric-card"
              onClick={() => handleHouseSelect(houses[0])}
              role="button"
              tabIndex="0"
              {...buttonPress}
            >
              <span className="metric-label">Lagna · लग्न</span>
              <span className="metric-val text-primary">{lagna.sign}</span>
              <span className="metric-sub">{lagna.deg}° · House 1</span>
            </motion.div>

            <motion.div
              className="summary-metric-card"
              onClick={() => moon && handlePlanetSelect(moon)}
              role="button"
              tabIndex="0"
              {...buttonPress}
            >
              <span className="metric-label">Chandra · चन्द्र</span>
              <span className="metric-val">{moon ? moon.sign : '—'}</span>
              <span className="metric-sub">{moon ? `${moon.deg}° · H${moon.house}` : 'Moon'}</span>
            </motion.div>

            <motion.div className="summary-metric-card">
              <span className="metric-label">Nakshatra · नक्षत्र</span>
              <span className="metric-val">{nakshatra.name || (moon?.nakshatra) || '—'}</span>
              <span className="metric-sub">Pada {nakshatra.pada || moon?.pada || 1}</span>
            </motion.div>

            <motion.div className="summary-metric-card">
              <span className="metric-label">Mahadasha · दशा</span>
              <span className="metric-val text-gold">{dashaInfo?.planet || dashaInfo?.lord || 'Saturn'}</span>
              <span className="metric-sub">Until {dashaInfo?.endDate ? String(dashaInfo.endDate).slice(0, 4) : 'Active'}</span>
            </motion.div>

            <motion.div
              className="summary-metric-card metric-card-ask"
              onClick={() => handleAskFromChart(`What are the most pivotal planetary influences in my ${lagna.sign} Lagna chart?`, 'general')}
              role="button"
              tabIndex="0"
              {...buttonPress}
            >
              <div className="ask-metric-inner">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="ask-metric-title">Ask Your Kundli</span>
              </div>
              <span className="metric-sub text-gold flex items-center gap-1">Seek Vedic Guidance <ArrowRight className="w-3 h-3" /></span>
            </motion.div>
          </section>

          {/* Key Placement Highlights Bar */}
          {(exaltedPlanets.length > 0 || ownSignPlanets.length > 0) && (
            <div className="kundli-dignity-banner">
              <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
              <span className="font-label-sm font-semibold">Special Dignities:</span>
              {exaltedPlanets.map(p => (
                <span key={p.name} className="dignity-tag tag-exalted" onClick={() => handlePlanetSelect(p)} role="button" tabIndex="0">
                  ★ {p.name} Exalted in {p.sign} (H{p.house})
                </span>
              ))}
              {ownSignPlanets.map(p => (
                <span key={p.name} className="dignity-tag tag-own" onClick={() => handlePlanetSelect(p)} role="button" tabIndex="0">
                  ✦ {p.name} in Own Sign ({p.sign})
                </span>
              ))}
            </div>
          )}

          {/* Navigation Controls: Chart Style Selector + Divisional Tabs */}
          <div className="kundli-controls-row">
            {/* Nav Tabs for Charts */}
            <div className="kundli-tabs-bar">
              {[
                { id: 'd1', label: 'D1 Lagna · जन्म' },
                { id: 'd9', label: 'D9 Navamsha · नवांश' },
                { id: 'd10', label: 'D10 Dashamsha · दशमांश' },
                { id: 'ephemeris', label: 'Ephemeris · ग्रह सारणी' },
                { id: 'dasha', label: 'Dasha · विंशोत्तरी' }
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`kundli-tab relative ${active ? 'kundli-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeKundliTabIndicator"
                        className="kundli-tab-indicator-bg"
                        transition={springTransition}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 9. South Indian & North Indian Toggle */}
            {['d1', 'd9', 'd10'].includes(activeTab) && (
              <div className="chart-style-toggle-container">
                <span className="style-toggle-label">Format:</span>
                <div className="style-toggle-group">
                  <button
                    className={`style-toggle-btn ${chartStyle === 'north' ? 'style-active' : ''}`}
                    onClick={() => setChartStyle('north')}
                    title="North Indian Diamond Chart"
                  >
                    North (उत्तर)
                  </button>
                  <button
                    className={`style-toggle-btn ${chartStyle === 'south' ? 'style-active' : ''}`}
                    onClick={() => setChartStyle('south')}
                    title="South Indian Fixed Zodiac Grid"
                  >
                    South (दक्षिण)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="kundli-content-grid">
            {['d1', 'd9', 'd10'].includes(activeTab) && (
              <div className="chart-view-section">
                {loadingDivisional ? (
                  <div className="divisional-notice-card">
                    <span className="material-symbols-outlined icon-lg text-primary animate-spin">hourglass_empty</span>
                    <h3 className="font-title-md mt-2">Loading {chartTitle}...</h3>
                    <p className="font-body-sm text-on-surface-variant mt-1">
                      Retrieving authentic divisional calculation coordinates...
                    </p>
                  </div>
                ) : isDivisionalUnavailable ? (
                  <div className="divisional-notice-card">
                    <Info className="w-8 h-8 text-secondary mx-auto" />
                    <h3 className="font-title-md mt-2">{chartTitle}</h3>
                    <p className="font-body-sm text-on-surface-variant mt-1">
                      Divisional computation data for this chart is not included in the active calculation payload.
                      The primary D1 Lagna chart remains fully verified and canonical.
                    </p>
                    <button className="btn-secondary mt-3" onClick={() => setActiveTab('d1')}>
                      Return to D1 Lagna Chart
                    </button>
                  </div>
                ) : (
                  <div className="chart-render-wrapper">
                    <p className="chart-interactive-hint">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>Tap any planet or house box to inspect Shastric portfolios & remedies</span>
                    </p>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={chartStyle + activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={gentleSpring}
                      >
                        {chartStyle === 'north' ? (
                          <NorthIndianChart
                            chartData={currentChart}
                            compact={false}
                            title={chartTitle}
                            selectedPlanet={selectedPlanet}
                            selectedHouse={selectedHouse?.number}
                            onSelectPlanet={handlePlanetSelect}
                            onSelectHouse={handleHouseSelect}
                          />
                        ) : (
                          <SouthIndianChart
                            chartData={currentChart}
                            compact={false}
                            title={chartTitle}
                            selectedPlanet={selectedPlanet}
                            selectedHouse={selectedHouse?.number}
                            onSelectPlanet={handlePlanetSelect}
                            onSelectHouse={handleHouseSelect}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ephemeris' && (
              <div className="ephemeris-view-container">
                <PlanetaryTable planetaryData={planets} />
              </div>
            )}

            {activeTab === 'dasha' && (
              <div className="dasha-view-container">
                <DashaTimeline dashaData={dasha} />
              </div>
            )}
          </div>

          {/* Quick AI Astrological Inquiries connected to current chart */}
          {['d1', 'd9', 'd10'].includes(activeTab) && (
            <section className="chart-ai-prompts-section">
              <div className="ai-prompts-header">
                <Bot className="w-4 h-4 text-primary" />
                <span className="font-title-sm font-bold">Ask Your Kundli — Quick Inquiries</span>
              </div>
              <div className="ai-prompts-row">
                <button
                  className="ai-prompt-chip"
                  onClick={() => handleAskFromChart(`What does my 7th house in ${houses[6]?.sign} say about marriage and life partnerships?`, 'union')}
                >
                  💍 What does my 7th house say about marriage?
                </button>
                <button
                  className="ai-prompt-chip"
                  onClick={() => handleAskFromChart(`What is the planetary influence affecting my 10th house of career (${houses[9]?.sign})?`, 'career')}
                >
                  💼 What is affecting my career & 10th house?
                </button>
                <button
                  className="ai-prompt-chip"
                  onClick={() => handleAskFromChart(`How does my Moon placement in ${moon?.sign || 'its sign'} affect my mind and life focus?`, 'general')}
                >
                  🌙 What does my Moon placement signify?
                </button>
                <button
                  className="ai-prompt-chip"
                  onClick={() => handleAskFromChart(`Explain the karmic impact of my current ${dashaInfo?.planet || 'active'} Mahadasha period.`, 'abundance')}
                >
                  ⏳ Explain my current Mahadasha
                </button>
              </div>
            </section>
          )}

          {/* Expandable Advanced Ephemeris & Dasha Sections */}
          <div className="advanced-accordion-wrapper">
            <button
              className="advanced-toggle-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{showAdvanced ? 'Hide Deep Ephemeris & Dasha Details' : 'Expand Deep Planetary Ephemeris & Dasha Details'}</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-on-surface-variant" />
              ) : (
                <ChevronDown className="w-4 h-4 text-on-surface-variant" />
              )}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  className="kundli-sections-row mt-space-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PlanetaryTable planetaryData={planets} />
                  <DashaTimeline dashaData={dasha} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* 5. Interactive Planet Detail Modal */}
      <PlanetDetailModal
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onAskOracle={handleAskFromChart}
      />

      {/* 6. Interactive House Detail Modal */}
      <HouseDetailModal
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        onAskOracle={handleAskFromChart}
      />

      <BottomNav />
    </div>
  );
}
