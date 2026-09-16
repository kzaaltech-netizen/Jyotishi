import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Scale,
  Moon,
  Sun,
  Activity,
  Briefcase,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Compass,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import { normalizeChartData, SIGN_LORDS } from '../components/chart/chartDataNormalizer.js';
import { apiInterpretChart } from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { springTransition, buttonPress } from '../lib/motion.js';
import './HoroscopePage.css';

export default function HoroscopePage() {
  const { chartData, birthProfile, setCurrentMode, setCurrentPage, language } = useApp();
  const [expandedItem, setExpandedItem] = useState('mahadasha');
  const [aiForecast, setAiForecast] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Normalize canonical chart bundle
  const normalizedD1 = useMemo(() => {
    if (!chartData) return null;
    const norm = normalizeChartData(chartData);
    return norm.isValid ? norm : null;
  }, [chartData]);

  const lagna = normalizedD1?.lagna;
  const lagnaLord = lagna?.sign ? (SIGN_LORDS[lagna.sign] || 'Lagna Lord') : 'Lagna Lord';
  const planets = normalizedD1?.planets || [];
  const houses = normalizedD1?.houses || [];

  const moon = planets.find((p) => p.name === 'Moon');
  const sun = planets.find((p) => p.name === 'Sun');
  const venus = planets.find((p) => p.name === 'Venus');
  const jupiter = planets.find((p) => p.name === 'Jupiter');
  const saturn = planets.find((p) => p.name === 'Saturn');

  const h7 = houses.find((h) => h.number === 7);
  const h10 = houses.find((h) => h.number === 10);

  const dasha = normalizedD1?.dasha || {};
  const currentMahadasha = dasha.currentMahadasha || {};
  const currentAntardasha = dasha.currentAntardasha || {};
  const dashaLord = currentMahadasha.planet || currentMahadasha.lord || 'Saturn';
  const antarLord = currentAntardasha.planet || currentAntardasha.lord || 'Mercury';

  const dashaLordPlanet = planets.find((p) => p.name.toLowerCase() === dashaLord.toLowerCase());
  const antarLordPlanet = planets.find((p) => p.name.toLowerCase() === antarLord.toLowerCase());

  const lagnaSignLabel = lagna?.sign ? `${lagna.sign} Lagna` : 'Lagna';
  const moonSignLabel = moon?.sign ? `Chandra in ${moon.sign}` : 'Chandra Rashi';
  const todayDateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const toggleAccordion = (id) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

  const handleGenerateForecast = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiInterpretChart('forecast');
      if (res && res.formatted) {
        setAiForecast(res.formatted);
      } else if (res && res.reply) {
        setAiForecast({ summary: res.reply });
      }
    } catch (err) {
      setAiError(err.message || 'Unable to generate personalized AI forecast.');
    } finally {
      setAiLoading(false);
    }
  };

  // Four Core Spheres derived deterministically from canonical placements
  const mindSphere = useMemo(() => {
    if (!moon) {
      return {
        badge: 'Chandra · Mind',
        text: 'Reflect on emotional equanimity and steady inner clarity.',
        footer: 'Chandra Rashi'
      };
    }
    const houseDescriptions = {
      1: 'Heightened sensitivity and intuitive self-awareness. Center mental focus on grounded routines.',
      2: 'Mental energy turns toward family matters, financial discernment, and measured speech.',
      3: 'Dynamic curiosity and analytical communication. Excellent for study, writing, and skill acquisition.',
      4: 'Deep inner contemplation, domestic comfort, and emotional rooting. Value peaceful environments.',
      5: 'Creative intelligence and purva-punya activation. Conducive to strategic ideation and contemplative studies.',
      6: 'Methodical discernment and problem-solving. Favorable for attending to details and bodily discipline.',
      7: 'Relational empathy and communicative diplomacy. Balance individual needs with shared understandings.',
      8: 'Introspective intuition and transformative focus. Seek quiet moments away from surface noise.',
      9: 'Philosophical optimism, spiritual reverence, and dharmic inquiry. Ideal for higher learning.',
      10: 'Emotional investment in purposeful action, vocational dedication, and visible contribution.',
      11: 'Collaborative networking, progressive aspirations, and harmonious communal interactions.',
      12: 'Meditative solitude and imaginative reflection. Prioritize restful sleep and quiet surrender.'
    };
    return {
      badge: `Moon in H${moon.house} · ${moon.sign}`,
      text: houseDescriptions[moon.house] || `Moon in ${moon.sign} guides mental clarity and emotional focus.`,
      footer: `Nakshatra: ${moon.nakshatra || '—'}${moon.pada ? ` (Pada ${moon.pada})` : ''}`
    };
  }, [moon]);

  const careerSphere = useMemo(() => {
    if (!h10) {
      return {
        badge: 'Karma Bhava',
        text: 'Maintain methodical persistence and disciplined focus on professional duties.',
        footer: 'Career'
      };
    }
    const occupants = h10.planets || [];
    const occupantNames = occupants.map((p) => p.name).join(', ');
    return {
      badge: `H10 ${h10.sign} · Lord ${h10.lord}`,
      text: occupants.length > 0
        ? `Karma Bhava in ${h10.sign} tenanted by ${occupantNames}. Direct energetic efforts through ${h10.lord}'s discipline.`
        : `Karma Bhava governed by ${h10.lord} in ${h10.sign}. Emphasize methodical execution, accountability, and clarity in public actions.`,
      footer: occupants.length > 0 ? `Occupants: ${occupantNames}` : `Dispositor: ${h10.lord}`
    };
  }, [h10]);

  const harmonySphere = useMemo(() => {
    if (!h7) {
      return {
        badge: 'Yuvati Bhava',
        text: 'Cultivate patient listening and mutual understanding in relationships.',
        footer: 'Harmony'
      };
    }
    return {
      badge: `H7 ${h7.sign} · Venus in H${venus?.house || '—'}`,
      text: `Relational axis aligns through ${h7.sign} (governed by ${h7.lord}) with Venus placed in ${venus?.sign || 'chart'}. Practice measured speech and generous reciprocity.`,
      footer: venus ? `Venus in ${venus.sign} (${venus.deg}°)` : `7th Lord: ${h7.lord}`
    };
  }, [h7, venus]);

  const energySphere = useMemo(() => {
    if (!lagna) {
      return {
        badge: 'Tanu Bhava',
        text: 'Cultivate vitality through balanced nutrition and conscious breathwork.',
        footer: 'Vitality'
      };
    }
    return {
      badge: `${lagna.sign} Lagna · Lord ${lagnaLord}`,
      text: `Physical vitality anchored by ${lagna.sign} Ascendant (${lagna.deg}°) with Sun in House ${sun?.house || 1} in ${sun?.sign || 'chart'}. Harmonize stamina with disciplined morning routine.`,
      footer: sun ? `Surya in House ${sun.house} (${sun.deg}°)` : `Lagna Lord: ${lagnaLord}`
    };
  }, [lagna, sun, lagnaLord]);

  return (
    <div className="horoscope-page-wrapper">
      <TopBar />

      <main className="horoscope-main">
        <div className="app-container">

          {!normalizedD1 ? (
            <div className="horoscope-empty-state">
              <Compass className="w-12 h-12 text-primary opacity-60 mx-auto" />
              <h2 className="font-headline-md text-on-surface mt-space-md">Astrology Data Not Loaded</h2>
              <p className="font-body-md text-on-surface-variant max-w-md mx-auto mt-space-xs">
                Your personalized horoscope is calculated directly from your Vedic birth chart. Please generate or load your chart to view real planetary placements and cosmic cycles.
              </p>
              <motion.button
                className="btn-submit font-title-md mt-space-md mx-auto inline-flex"
                onClick={() => setCurrentPage('kundli')}
                {...buttonPress}
              >
                <span>View Kundli & Chart</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
          ) : (
            <>
              {/* Top Parchment Texture Lead Header */}
              <motion.section
                className="transit-hero-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springTransition}
              >
                <div className="transit-hero-content">
                  <div className="transit-hero-top">
                    <div className="transit-left">
                      <div className="transit-tag">
                        <span className="pulse-dot-sm"></span>
                        <span>Personal Vedic Forecast · व्यक्तिगत फलविचार</span>
                      </div>
                      <h1 className="font-headline-xl text-ivory">
                        Today's Guidance <span className="font-editorial-italic text-gold">· दैनिक विचार</span>
                      </h1>
                    </div>
                    <div className="transit-right text-right">
                      <div className="font-headline-sm text-ivory">{todayDateStr}</div>
                      <div className="font-body-sm text-gold mt-1">
                        {lagna?.sign} Lagna · {moon?.sign || 'Chandra'} Rashi
                      </div>
                    </div>
                  </div>

                  <div className="transit-hero-bar mt-space-md">
                    <span className="font-body-sm text-ivory-muted">Calculated for:</span>
                    <span className="transit-pill">
                      <Scale className="w-3.5 h-3.5 text-gold-light" />
                      <span>{lagnaSignLabel}</span>
                    </span>
                    <span className="transit-pill">
                      <Moon className="w-3.5 h-3.5 text-gold-light" />
                      <span>{moonSignLabel}</span>
                    </span>
                    <span className="font-label-sm text-gold-muted ml-auto">Sidereal (Lahiri) · Verified D1</span>
                  </div>
                </div>

                {/* Real Cosmic Coordinates Strip */}
                <div className="transit-panchanga-strip">
                  <div className="strip-col">
                    <span className="font-label-sm text-secondary">लग्न · Ascendant</span>
                    <span className="font-title-md text-on-surface font-bold">
                      {lagna?.sign} ({lagna?.deg}°)
                    </span>
                    <span className="font-body-sm text-outline">Lord: {lagnaLord} • House 1</span>
                  </div>

                  <div className="strip-col">
                    <span className="font-label-sm text-secondary">जन्म नक्षत्र · Janma Nakshatra</span>
                    <span className="font-title-md text-on-surface font-bold">
                      {moon?.nakshatra || normalizedD1.nakshatra?.name || '—'}
                    </span>
                    <span className="font-body-sm text-outline">
                      Pada {moon?.pada || normalizedD1.nakshatra?.pada || 1} • Moon in {moon?.sign || 'Rashi'}
                    </span>
                  </div>

                  <div className="strip-col">
                    <span className="font-label-sm text-secondary">सक्रिय महादशा · Mahadasha</span>
                    <span className="font-title-md text-on-surface font-bold">
                      {dashaLord} Mahadasha
                    </span>
                    <span className="font-body-sm text-secondary font-medium">
                      Antardasha: {antarLord}
                    </span>
                  </div>

                  <div className="strip-col highlight-col">
                    <span className="font-label-sm text-primary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>दशा कालखण्ड · Active Phase</span>
                    </span>
                    <span className="font-title-md text-primary font-bold">
                      {dashaLord} – {antarLord}
                    </span>
                    <span className="font-body-sm text-on-surface-variant">
                      {currentMahadasha.endDate
                        ? `Until ${new Date(currentMahadasha.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                        : 'Active Vimshottari Cycle'}
                    </span>
                  </div>
                </div>
              </motion.section>

              {/* Primary Layout Grid */}
              <div className="horoscope-grid mt-space-xl">

                {/* Left 8 Cols: Spheres & Planetary Alignments */}
                <div className="horoscope-left-col">

                  {/* Four Core Spheres */}
                  <section className="spheres-section">
                    <div className="section-header-flex">
                      <div className="flex-center gap-2">
                        <Compass className="w-4 h-4 text-primary" />
                        <h2 className="font-headline-sm text-on-surface">Four Core Spheres · चतुर्विध फल</h2>
                      </div>
                      <span className="font-label-sm text-on-surface-variant">Lagna & Planetary Coordinates</span>
                    </div>

                    <div className="spheres-grid mt-space-md">
                      {/* Sphere 1: Mind */}
                      <div className="sphere-card">
                        <div className="sphere-top">
                          <div className="flex-center gap-2">
                            <Moon className="w-4 h-4 text-primary" />
                            <span className="font-headline-sm text-on-surface">मन · Mind</span>
                          </div>
                          <span className="sphere-badge">{mindSphere.badge}</span>
                        </div>
                        <p className="font-body-md text-on-surface mt-space-xs">
                          {mindSphere.text}
                        </p>
                        <div className="sphere-footer">
                          <Sparkles className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-body-sm font-medium">{mindSphere.footer}</span>
                        </div>
                      </div>

                      {/* Sphere 2: Career */}
                      <div className="sphere-card">
                        <div className="sphere-top">
                          <div className="flex-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="font-headline-sm text-on-surface">कर्म · Career</span>
                          </div>
                          <span className="sphere-badge">{careerSphere.badge}</span>
                        </div>
                        <p className="font-body-md text-on-surface mt-space-xs">
                          {careerSphere.text}
                        </p>
                        <div className="sphere-footer">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                          <span className="font-body-sm font-medium">{careerSphere.footer}</span>
                        </div>
                      </div>

                      {/* Sphere 3: Harmony */}
                      <div className="sphere-card">
                        <div className="sphere-top">
                          <div className="flex-center gap-2">
                            <Heart className="w-4 h-4 text-primary" />
                            <span className="font-headline-sm text-on-surface">सम्बन्ध · Harmony</span>
                          </div>
                          <span className="sphere-badge">{harmonySphere.badge}</span>
                        </div>
                        <p className="font-body-md text-on-surface mt-space-xs">
                          {harmonySphere.text}
                        </p>
                        <div className="sphere-footer">
                          <Heart className="w-3.5 h-3.5 text-tertiary" />
                          <span className="font-body-sm font-medium">{harmonySphere.footer}</span>
                        </div>
                      </div>

                      {/* Sphere 4: Energy */}
                      <div className="sphere-card">
                        <div className="sphere-top">
                          <div className="flex-center gap-2">
                            <Sun className="w-4 h-4 text-primary" />
                            <span className="font-headline-sm text-on-surface">प्राण · Energy</span>
                          </div>
                          <span className="sphere-badge">{energySphere.badge}</span>
                        </div>
                        <p className="font-body-md text-on-surface mt-space-xs">
                          {energySphere.text}
                        </p>
                        <div className="sphere-footer">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-body-sm font-medium">{energySphere.footer}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Planetary Alignments Section */}
                  <section className="transits-section mt-space-xl">
                    <div className="section-header-flex mb-space-md">
                      <div className="flex-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h2 className="font-headline-sm text-on-surface">Active Celestial Rulers · ग्रह गोचर प्रभाव</h2>
                      </div>
                      <span className="font-label-sm text-on-surface-variant">Vimshottari & Natal Alignments</span>
                    </div>

                    <div className="transits-accordion-list">
                      {/* Item 1: Active Mahadasha */}
                      <div className="transit-item">
                        <button className="transit-trigger" onClick={() => toggleAccordion('mahadasha')}>
                          <div className="trigger-left">
                            <span className="transit-symbol-box">
                              {dashaLordPlanet?.sanskritAbbr || dashaLord.slice(0, 2)}
                            </span>
                            <div>
                              <span className="font-title-md text-on-surface font-semibold">
                                {dashaLord} Mahadasha · महादशा अधिपति
                              </span>
                              <span className="font-body-sm text-outline block">
                                {dashaLordPlanet ? `${dashaLordPlanet.sign} (${dashaLordPlanet.deg}°) • House ${dashaLordPlanet.house}` : 'Active Period Ruler'}
                              </span>
                            </div>
                          </div>
                          {expandedItem === 'mahadasha' ? (
                            <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedItem === 'mahadasha' && (
                            <motion.div
                              className="transit-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="font-body-md text-on-surface">
                                As primary Vimshottari ruler, {dashaLord} commands the overarching life chapter. Its placement in {dashaLordPlanet?.sign || 'the natal chart'} (House {dashaLordPlanet?.house || 1}) sets the dominant themes, karmic duties, and material opportunities during this cycle.
                              </p>
                              <div className="transit-footer-info">
                                <span>Ruler: {dashaLord}</span>
                                <span>Nakshatra: {dashaLordPlanet?.nakshatra || 'Natal Placement'}</span>
                                <span>Dignity: {dashaLordPlanet?.dignity || 'Standard'}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Item 2: Active Antardasha */}
                      <div className="transit-item">
                        <button className="transit-trigger" onClick={() => toggleAccordion('antardasha')}>
                          <div className="trigger-left">
                            <span className="transit-symbol-box gold">
                              {antarLordPlanet?.sanskritAbbr || antarLord.slice(0, 2)}
                            </span>
                            <div>
                              <span className="font-title-md text-on-surface font-semibold">
                                {antarLord} Antardasha · अन्तर्दशा अधिपति
                              </span>
                              <span className="font-body-sm text-outline block">
                                {antarLordPlanet ? `${antarLordPlanet.sign} (${antarLordPlanet.deg}°) • House ${antarLordPlanet.house}` : 'Sub-Period Ruler'}
                              </span>
                            </div>
                          </div>
                          {expandedItem === 'antardasha' ? (
                            <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedItem === 'antardasha' && (
                            <motion.div
                              className="transit-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="font-body-md text-on-surface">
                                The sub-period of {antarLord} operationalizes current experiences, directing immediate affairs towards the affairs of House {antarLordPlanet?.house || 1}. Harmonizing actions with {antarLord}'s core nature yields favorable momentum.
                              </p>
                              <div className="transit-footer-info">
                                <span>Sub-Ruler: {antarLord}</span>
                                <span>Sign: {antarLordPlanet?.sign || 'Chart Placement'}</span>
                                <span>Nature: {antarLordPlanet?.naturalSignificance || 'Karmic Agent'}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Item 3: Jupiter Placement */}
                      <div className="transit-item">
                        <button className="transit-trigger" onClick={() => toggleAccordion('jupiter')}>
                          <div className="trigger-left">
                            <span className="transit-symbol-box">बृ</span>
                            <div>
                              <span className="font-title-md text-on-surface font-semibold">
                                Jupiter (Guru) · बृहस्पति स्थिति
                              </span>
                              <span className="font-body-sm text-outline block">
                                {jupiter ? `${jupiter.sign} (${jupiter.deg}°) • House ${jupiter.house}` : 'Guru'}
                              </span>
                            </div>
                          </div>
                          {expandedItem === 'jupiter' ? (
                            <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedItem === 'jupiter' && (
                            <motion.div
                              className="transit-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="font-body-md text-on-surface">
                                Guru illuminates wisdom, ethical clarity, and analytical synthesis. Positioned in {jupiter?.sign || 'natal chart'} in House {jupiter?.house || 1}, its expansive grace anchors higher principles and discernment in significant life choices.
                              </p>
                              <div className="transit-footer-info">
                                <span>Nakshatra: {jupiter?.nakshatra || '—'}</span>
                                <span>Dignity: {jupiter?.dignity || 'Standard'}</span>
                                <span>Motion: {jupiter?.isRetrograde ? 'Retrograde (वक्र)' : 'Direct (मार्गी)'}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Item 4: Saturn Placement */}
                      <div className="transit-item">
                        <button className="transit-trigger" onClick={() => toggleAccordion('saturn')}>
                          <div className="trigger-left">
                            <span className="transit-symbol-box gold">श</span>
                            <div>
                              <span className="font-title-md text-on-surface font-semibold">
                                Saturn (Shani) · शनि स्थिति
                              </span>
                              <span className="font-body-sm text-outline block">
                                {saturn ? `${saturn.sign} (${saturn.deg}°) • House ${saturn.house}` : 'Shani'}
                              </span>
                            </div>
                          </div>
                          {expandedItem === 'saturn' ? (
                            <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedItem === 'saturn' && (
                            <motion.div
                              className="transit-content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="font-body-md text-on-surface">
                                Shani demands disciplined execution, resilience, and patience. Situated in {saturn?.sign || 'natal chart'} in House {saturn?.house || 1}, it rewards steady, deliberate effort over hasty shortcuts.
                              </p>
                              <div className="transit-footer-info">
                                <span>Nakshatra: {saturn?.nakshatra || '—'}</span>
                                <span>Dignity: {saturn?.dignity || 'Standard'}</span>
                                <span>Motion: {saturn?.isRetrograde ? 'Retrograde (वक्र)' : 'Direct (मार्गी)'}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </section>

                </div>

                {/* Right 4 Cols: Reference Chart & AI Forecast */}
                <div className="horoscope-right-col">
                  <NorthIndianChart
                    chartData={chartData}
                    compact={true}
                    title="जन्म लग्न चक्र · Natal Lagna Reference (D1)"
                  />

                  {/* Daily Forecast Card */}
                  <div className="ai-forecast-card">
                    <div className="ai-forecast-header">
                      <div className="flex-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-headline-sm text-on-surface">
                          दैनिक विचार · Daily Forecast
                        </span>
                      </div>
                      <span className="font-label-sm text-secondary uppercase font-semibold">
                        Gochara & Dasha
                      </span>
                    </div>

                    <p className="font-body-sm text-on-surface-variant mt-2">
                      Personalized forecast derived from your verified Lagna, Moon, and active Vimshottari cycle.
                    </p>

                    {aiError && (
                      <div className="ai-forecast-error mt-space-sm">
                        <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                        <span className="font-body-sm text-error">{aiError}</span>
                      </div>
                    )}

                    {aiForecast ? (
                      <div className="ai-forecast-result mt-space-md">
                        {aiForecast.title && (
                          <h4 className="ai-forecast-title font-headline-sm">{aiForecast.title}</h4>
                        )}
                        {aiForecast.summary && (
                          <p className="ai-forecast-summary font-editorial-italic">{aiForecast.summary}</p>
                        )}
                        {aiForecast.analysis && (
                          <p className="ai-forecast-analysis font-body-sm">{aiForecast.analysis}</p>
                        )}
                        {Array.isArray(aiForecast.recommendations) && aiForecast.recommendations.length > 0 && (
                          <div className="ai-forecast-recs">
                            <span className="recs-title">Astrological Guidance</span>
                            <ul className="recs-list">
                              {aiForecast.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <motion.button
                          className="btn-text-action font-label-sm text-primary mt-space-sm inline-flex items-center gap-1"
                          onClick={handleGenerateForecast}
                          disabled={aiLoading}
                          {...buttonPress}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                          <span>Refresh Forecast</span>
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        className="btn-submit font-title-md mt-space-md w-full justify-center"
                        onClick={handleGenerateForecast}
                        disabled={aiLoading}
                        {...buttonPress}
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Synthesizing Forecast...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 text-gold-light" />
                            <span>Generate Forecast</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Ask Promo Card */}
                  <div className="ask-oracle-promo-card">
                    <span className="font-label-sm text-secondary uppercase font-semibold">शास्त्रीय विमर्श</span>
                    <h4 className="font-headline-sm text-on-surface mt-1">Have a question about your chart?</h4>
                    <p className="font-body-sm text-on-surface-variant mt-1">
                      Inquire directly about your Lagna, active Dasha, or planetary influences.
                    </p>
                    <motion.button
                      className="btn-submit font-title-md mt-space-md"
                      onClick={() => { setCurrentMode('forecast'); setCurrentPage('ask'); }}
                      {...buttonPress}
                    >
                      <span>Ask About Your Chart</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </motion.button>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
