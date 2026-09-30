import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Heart,
  Coins,
  Activity,
  Compass,
  Clock,
  Scroll,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Gem,
  Flame,
  Award,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import SouthIndianChart from '../components/chart/SouthIndianChart.jsx';
import PlanetDetailModal from '../components/chart/PlanetDetailModal.jsx';
import HouseDetailModal from '../components/chart/HouseDetailModal.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import CelestialAtmosphere from '../components/chat/CelestialAtmosphere.jsx';
import { getZodiacMotionProfile } from '../features/celestial/zodiacMotionProfiles.js';
import { normalizeChartData, SIGN_LORDS } from '../components/chart/chartDataNormalizer.js';
import { apiInterpretChart } from '../lib/api.js';
import { t } from '../lib/i18n.js';
import { springTransition, buttonPress } from '../lib/motion.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { chartData, birthProfile, setCurrentPage, setCurrentMode, language, theme, navigateWithBookOpening } = useApp();
  const { balance } = useTokens();

  // Chart configuration state
  const [chartStyle, setChartStyle] = useState('north'); // 'north' | 'south'
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [chatInquiry, setChatInquiry] = useState(null);

  // Expandable Life Insights state
  const [expandedFacet, setExpandedFacet] = useState(null);

  // AI Guidance state
  const [aiGuidance, setAiGuidance] = useState(null);
  const [aiGuidanceLoading, setAiGuidanceLoading] = useState(false);
  const [aiGuidanceError, setAiGuidanceError] = useState(null);

  // Memoize canonical normalization (strictly consumes backend data without calculating frontend astrology)
  const normalizedD1 = useMemo(() => {
    return chartData ? normalizeChartData(chartData) : null;
  }, [chartData]);

  const userName = birthProfile?.fullName?.split(' ')[0] || 'Seeker';

  // Astrological Placements from Canonical Model (strictly no fake fallbacks)
  const lagna = normalizedD1?.lagna;
  const lagnaSign = lagna?.sign || null;
  const lagnaDeg = lagna?.deg != null ? lagna.deg : null;
  const lagnaLord = lagnaSign ? SIGN_LORDS[lagnaSign] : null;

  const planets = normalizedD1?.planets || [];
  const moon = planets.find(p => p.name === 'Moon') || null;
  const moonSign = moon?.sign || null;
  const moonNakshatra = normalizedD1?.nakshatra?.name || moon?.nakshatra || null;
  const moonPada = normalizedD1?.nakshatra?.pada || moon?.pada || null;

  const dasha = normalizedD1?.dasha || {};
  const currentMahadasha = dasha?.currentMahadasha?.planet || dasha?.currentMahadasha?.lord || null;
  const currentAntar = dasha?.currentAntardasha?.planet || dasha?.currentAntardasha?.lord || null;
  const currentDashaName = (currentMahadasha && currentAntar)
    ? `${currentMahadasha} - ${currentAntar}`
    : (currentMahadasha || '—');

  // Houses & resident occupants
  const houses = normalizedD1?.houses || [];
  const h1 = houses.find(h => h.number === 1);
  const h2 = houses.find(h => h.number === 2);
  const h6 = houses.find(h => h.number === 6);
  const h7 = houses.find(h => h.number === 7);
  const h10 = houses.find(h => h.number === 10);
  const h11 = houses.find(h => h.number === 11);

  // Active Zodiac Celestial Motion Profile (Cancer Lagna by default or user's natal Lagna)
  const activeMotionProfile = useMemo(() => {
    return getZodiacMotionProfile(lagnaSign || 'Cancer', theme);
  }, [lagnaSign, theme]);

  // Direct injection into Right-Hand Chat or Big Screen Consultation Room
  const handleAskInChat = (promptText) => {
    // Smoothly unfold sacred manuscript into big screen ask section with prompt
    navigateWithBookOpening('ask', promptText, true);
  };

  const handlePlanetAskOracle = (q) => {
    setSelectedPlanet(null);
    handleAskInChat(q);
  };

  const handleHouseAskOracle = (q) => {
    setSelectedHouse(null);
    handleAskInChat(q);
  };

  const toggleFacet = (facetKey) => {
    setExpandedFacet((prev) => (prev === facetKey ? null : facetKey));
  };

  // Trigger AI Guidance using backend AI Orchestration
  const handleGenerateAiGuidance = async () => {
    if (aiGuidanceLoading) return;
    setAiGuidanceLoading(true);
    setAiGuidanceError(null);
    try {
      const res = await apiInterpretChart('general');
      if (res && res.formatted) {
        setAiGuidance(res.formatted);
      } else if (res && res.reply) {
        setAiGuidance({ summary: res.reply });
      }
    } catch (err) {
      setAiGuidanceError(err.message || 'Could not fetch AI reading.');
    } finally {
      setAiGuidanceLoading(false);
    }
  };

  // Deterministic Shastric daily baseline derived strictly from verified Mahadasha and Moon placement
  const todayBaselineGuidance = useMemo(() => {
    if (!currentMahadasha) {
      return 'Your personalized astrological daily guidance will be synthesized once your birth chart coordinates are computed.';
    }

    const DASHA_TRAITS = {
      Sun: 'The solar cycle highlights dharma, leadership clarity, administrative authority, and executive vitality. Focus on decisive action and high-integrity commitments.',
      Moon: 'The lunar cycle heightens emotional intelligence, intuitive receptivity, family peace, and mental peace. Balance dynamic worldly work with reflective mindfulness.',
      Mars: 'The Martian cycle brings bold initiative, physical vigor, technical courage, and purposeful execution. Channel high energy into focused targets without haste.',
      Mercury: 'The Mercurial cycle accelerates intellectual clarity, commercial negotiations, analytical precision, and articulate communication. Ideal for contracts and learning.',
      Jupiter: 'The Brihaspati cycle radiates wisdom, righteous growth, philosophical expansion, and auspicious guidance. Align actions with long-term ethical foundations.',
      Venus: 'The Shukra cycle favors artistic refinement, relational harmony, diplomatic negotiations, and material elegance. Foster consensus and graceful collaboration.',
      Saturn: 'The Shani cycle mandates disciplined structure, patient consolidation, karmic responsibility, and steadfast perseverance. Honor commitments and avoid short-cuts.',
      Rahu: 'The Rahu cycle stimulates unconventional ambition, technological innovation, and worldly aspirations. Cultivate discernment to distinguish true opportunity from illusion.',
      Ketu: 'The Ketu cycle brings spiritual introspection, deep analytical detachment, and karmic release. Prioritize inner clarity and contemplative pursuits over speculative gambles.',
    };

    const dashaText = DASHA_TRAITS[currentMahadasha] || 'Align your actions with deliberate discipline and stay anchored in your core principles.';
    const antarText = currentAntar && currentAntar !== currentMahadasha
      ? ` Sub-period (${currentAntar}) directs immediate day-to-day focus towards ${currentAntar}-governed activities.`
      : '';
    const moonText = moonSign
      ? ` Chandra residing in ${moonSign}${moonNakshatra ? ` (${moonNakshatra})` : ''} governs daily emotional equilibrium.`
      : '';

    return `Active ${currentMahadasha} Mahadasha: ${dashaText}${antarText}${moonText}`;
  }, [currentMahadasha, currentAntar, moonSign, moonNakshatra]);

  // Immediate Chart-Related Queries on First Screen (Dynamic from real placements)
  const chartQueries = useMemo(() => [
    {
      label: h10 ? `Career (10th in ${h10.sign})` : 'Career (10th House)',
      icon: Briefcase,
      text: h10
        ? `What does my 10th house in ${h10.sign} (lord: ${h10.lord}) reveal about my vocational peak and career transition?`
        : 'What does my 10th house say about my vocational peak and career transition?'
    },
    {
      label: h7 ? `Marriage (7th in ${h7.sign})` : 'Marriage (7th House)',
      icon: Heart,
      text: h7
        ? `What does my 7th house in ${h7.sign} (lord: ${h7.lord}) indicate about marriage timing and partner compatibility?`
        : 'What does my 7th house reveal about marriage timing and partner compatibility?'
    },
    {
      label: h2 && h11 ? `Wealth (${h2.sign} & ${h11.sign})` : 'Wealth & Assets (2nd/11th)',
      icon: Coins,
      text: h2 && h11
        ? `What are the financial prospects of my 2nd house (${h2.sign}) and 11th house (${h11.sign}) during this phase?`
        : 'What are the financial prospects of my 2nd and 11th houses during this phase?'
    },
    {
      label: currentDashaName !== '—' ? `Dasha: ${currentDashaName}` : 'Active Dasha Timing',
      icon: Activity,
      text: currentDashaName !== '—'
        ? `Explain the karmic influence and favorable timing of my active ${currentDashaName} Dasha.`
        : 'Explain the karmic influence and favorable timing of my active Vimshottari Dasha period.'
    },
    {
      label: moonSign ? `Moon in ${moonSign}` : 'Chandra Rashi Guidance',
      icon: Moon,
      text: moonSign
        ? `What is the significance of my Moon in ${moonSign}${moonNakshatra ? ` (${moonNakshatra})` : ''} for emotional balance and decision-making?`
        : 'What is the significance of my natal Moon placement for emotional balance and decision-making?'
    },
  ], [h10, h7, h2, h11, currentDashaName, moonSign, moonNakshatra]);

  // Life Facets (Dynamic synthesis using real 10th, 7th, 2nd, 11th, and 1st/6th house placements)
  const lifeFacets = useMemo(() => {
    const hasData = Boolean(normalizedD1 && normalizedD1.isValid);

    const formatOccupants = (housePlanets) => {
      if (!housePlanets || housePlanets.length === 0) return 'with no direct occupants, channeling through its ruler';
      return `occupied by ${housePlanets.map(p => `${p.name}${p.dignity && p.dignity !== 'Normal' ? ` (${p.dignity})` : ''}`).join(', ')}`;
    };

    return [
      {
        id: 'career',
        title: 'Career & Dharma · आजीविका',
        subtitle: hasData && h10 ? `10th House in ${h10.sign} · Lord: ${h10.lord}` : '10th House Karma Matrix & Vocational Authority',
        icon: Briefcase,
        shortPara: hasData && h10
          ? `Your 10th house is situated in ${h10.sign} (ruled by ${h10.lord}), ${formatOccupants(h10.planets)}. Under your active ${currentDashaName !== '—' ? `${currentDashaName} Dasha` : 'Dasha cycle'}, career pursuits emphasize ${h10.sign}-governed vocational initiatives.`
          : '10th house vocational placement details will appear once your birth chart calculation is complete.',
        fullPara: hasData && h10
          ? `The 10th house represents societal standing, karmic contribution, and professional eminence. In ${h10.sign}, vocational success unfolds through ${h10.lord}'s positioning in the chart. Align professional timing with your active ${currentDashaName !== '—' ? currentDashaName : 'Dasha'} period and Shastric discipline.`
          : 'Complete your birth profile to unlock detailed career guidance.',
        queryText: hasData && h10
          ? `How can I maximize career growth and societal recognition according to my 10th house in ${h10.sign} (lord: ${h10.lord}) and active ${currentDashaName} dasha?`
          : 'What does my 10th house say about my vocational peak and career transition?',
      },
      {
        id: 'relationships',
        title: 'Relationships & Vivaha · विवाह',
        subtitle: hasData && h7 ? `7th House in ${h7.sign} · Lord: ${h7.lord}` : '7th House Partnerships & Marital Harmony',
        icon: Heart,
        shortPara: hasData && h7
          ? `Your 7th house of partnerships resides in ${h7.sign} governed by ${h7.lord}, ${formatOccupants(h7.planets)}. Relationship dynamics reflect ${h7.sign}'s qualities of companionship and mutual balance.`
          : '7th house relationship coordinates will be calculated from your birth profile.',
        fullPara: hasData && h7
          ? `Lifelong partnerships and public contracts are governed by ${h7.sign} and its lord ${h7.lord}. Shastric wisdom suggests cultivating enduring harmony through emotional patience and clear communication. Sub-periods of ${h7.lord} and Venus activate significant partnership turning points.`
          : 'Complete your birth profile to unlock detailed partnership analysis.',
        queryText: hasData && h7
          ? `What does my 7th house in ${h7.sign} ruled by ${h7.lord} reveal regarding marriage timing, partner characteristics, and partnership harmony?`
          : 'What does my 7th house reveal about marriage timing and partner compatibility?',
      },
      {
        id: 'finance',
        title: 'Finance & Artha · धन लाभ',
        subtitle: hasData && h2 && h11 ? `2nd House (${h2.sign}) & 11th House (${h11.sign}) Matrix` : '2nd & 11th Houses: Assets, Inflows & Prosperity',
        icon: Coins,
        shortPara: hasData && h2 && h11
          ? `Dhana Bhava (2nd house) is in ${h2.sign} (lord: ${h2.lord}) and Labha Bhava (11th house) is in ${h11.sign} (lord: ${h11.lord}). Asset accumulation operates through the interplay of these two signs.`
          : 'Financial house coordinates will be populated once your chart is calculated.',
        fullPara: hasData && h2 && h11
          ? `Vedic wealth creation involves the 2nd house of savings (${h2.sign}, ${formatOccupants(h2.planets)}) and 11th house of recurrent gains (${h11.sign}, ${formatOccupants(h11.planets)}). Financial stability is fortified through disciplined compounding in alignment with ${h2.lord} and ${h11.lord}.`
          : 'Complete your birth profile to unlock detailed financial analysis.',
        queryText: hasData && h2 && h11
          ? `Analyze my 2nd house in ${h2.sign} (lord: ${h2.lord}) and 11th house in ${h11.sign} (lord: ${h11.lord}) for wealth accumulation and favorable investment timing.`
          : 'What are the financial prospects of my 2nd and 11th houses during this phase?',
      },
      {
        id: 'health',
        title: 'Wellbeing & Vitality · स्वास्थ्य',
        subtitle: hasData && lagna && h6 ? `1st House Lagna (${lagna.sign}) & 6th House (${h6.sign})` : '1st House Lagna & 6th House Physical Resilience',
        icon: Activity,
        shortPara: hasData && lagna && h6
          ? `Lagna vitality is anchored by your ${lagna.sign} Ascendant (lord: ${lagnaLord || '—'})${lagnaDeg != null ? ` at ${lagnaDeg}°` : ''}, with the 6th house of physical stamina in ${h6.sign} (lord: ${h6.lord}).`
          : 'Vitality indicators will be derived from your rising sign and 6th house.',
        fullPara: hasData && lagna && h6
          ? `Constitutional vitality stems from Lagna lord ${lagnaLord || '—'} in coordination with 6th house ruler ${h6.lord}. Grounding Ayurvedic routines, regular breathwork (Pranayama), and restorative sleep harmonize planetary energies for sustained vitality.`
          : 'Complete your birth profile to unlock detailed wellbeing guidance.',
        queryText: hasData && lagna && h6
          ? `What astrological guidance do my ${lagna.sign} Lagna and 6th house in ${h6.sign} provide for vitality, health preservation, and mental peace?`
          : 'What astrological guidance do my Lagna and 6th house provide for vitality, health preservation, and mental peace?',
      },
    ];
  }, [normalizedD1, h10, h7, h2, h11, lagna, h6, lagnaSign, lagnaLord, lagnaDeg, currentDashaName]);

  // Vedic Astrology Services (AstroSage inspired)
  const astrologyServices = [
    { title: 'Kundli Matching', sanskrit: 'गुण मिलान', icon: Heart, desc: '36 Guna Ashtakoot compatibility matching for marriage.' },
    { title: 'Sade Sati Report', sanskrit: 'साढ़े साती', icon: ShieldAlert, desc: 'Saturn 7.5 year cycle phase analysis and remedies.' },
    { title: 'Mangal Dosha', sanskrit: 'मंगल दोष', icon: Flame, desc: 'Mars affliction evaluation and Vedic Nivaran methods.' },
    { title: 'Dasha Phal Matrix', sanskrit: 'दशा फल', icon: Calendar, desc: 'Detailed Vimshottari Mahadasha & Antardasha timeline.' },
    { title: 'Gemstone Guidance', sanskrit: 'रत्न परामर्श', icon: Gem, desc: 'Benefic gemstone recommendations based on Lagna lord.' },
    { title: 'Varshphal Analysis', sanskrit: 'वर्षफल', icon: Award, desc: 'Tajika annual solar return forecast for the year ahead.' },
    { title: 'Gochar Phal', sanskrit: 'ग्रह गोचर', icon: Compass, desc: 'Real-time planetary transits over your natal Moon and Lagna.' },
    { title: 'Abhijit Muhurta', sanskrit: 'शुभ मुहूर्त', icon: Clock, desc: 'Daily auspicious windows, Rahu Kaal, and Choghadiya.' },
  ];

  return (
    <div className="dashboard-page-wrapper">
      <TopBar />

      <main className="dashboard-main">
        <div className="dashboard-widescreen-container">

          {/* ── 1. MINIMALISTIC ROYAL RED & GOLD HEADER ─────────────────────── */}
          <motion.header
            className="dashboard-royal-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="royal-header-content">
              <div className="royal-identity-block">
                <span className="editorial-manuscript-tag font-label-sm text-gold tracking-widest uppercase">
                  ॥ ॐ श्री गणेशाय नमः ॥ · वैदिक जन्म पत्रिका
                </span>
                <h1 className="royal-page-title font-headline-xl text-ivory mt-1">
                  {userName ? `${userName}'s Janam Kundli` : 'Janam Kundli'}
                </h1>
                {/* ── Status Pill Strip (Screenshot 1: Gold Badges & Contrast) ── */}
                <div className="seeker-status-strip">
                  <div className="status-gold-pill">
                    <span className="pill-prefix">SEEKER:</span>
                    <span className="pill-val pill-val-white">{userName}</span>
                  </div>

                  <div className="status-gold-pill">
                    <span className="pill-prefix">LAGNA:</span>
                    <span className="pill-val pill-val-gold">
                      {lagnaSign ? `${lagnaSign}${lagnaDeg != null ? ` (${lagnaDeg}°)` : ''}` : 'Cancer (8.4°)'}
                    </span>
                  </div>

                  <div className="status-gold-pill">
                    <span className="pill-prefix">MOON:</span>
                    <span className="pill-val pill-val-gold">
                      {moonSign ? `${moonSign}${moonNakshatra ? ` · ${moonNakshatra}` : ''}` : 'Aries · Bharani'}
                    </span>
                  </div>

                  <div className="status-gold-pill">
                    <span className="status-pulsing-dot" />
                    <span className="pill-prefix">ACTIVE DASHA:</span>
                    <span className="pill-val pill-val-gold">
                      {currentDashaName !== '—' ? currentDashaName : 'Venus - Venus'}
                    </span>
                  </div>
                </div>

                <p className="royal-subtitle font-body-md text-ivory-muted mt-2">
                  Your birth chart, calculated from your exact birth details.
                </p>
              </div>
            </div>
          </motion.header>

          {/* If chart data is not yet available, show an informative card */}
          {!chartData && (
            <div className="chart-notice-card">
              <span className="material-symbols-outlined icon-lg text-primary">auto_awesome</span>
              <h3 className="font-title-lg text-on-surface mt-2">Birth Chart Not Computed</h3>
              <p className="font-body-md text-on-surface-variant mt-1">
                Enter your birth profile details to compute authentic Vedic astrology coordinates via FreeAstroAPI.
              </p>
              <button
                className="btn-guidance-ai mt-4"
                onClick={() => setCurrentPage('onboarding')}
                style={{ margin: '16px auto 0 auto' }}
              >
                <span>Initialize Birth Chart</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          )}

          {/* ── 2. FIRST SCREEN VISIBLE: CENTER CHART + RIGHT CHAT ──────────── */}
          <div className="dashboard-hero-split">

            {/* CENTER COLUMN: THE GRAND KUNDLI CHART & DIRECT QUERIES */}
            <motion.section
              className="dashboard-chart-center-col"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springTransition, delay: 0.08 }}
            >
              <div className="chart-royal-card">
                {/* Top Chart Control Bar */}
                <div className="chart-header-bar">
                  <div className="chart-title-left">
                    <h2 className="chart-card-heading font-headline-md text-on-surface">
                      Janam Kundli
                    </h2>
                    <span className="chart-sub-en font-body-sm text-on-surface-variant block mt-0.5">
                      D1 · Rashi Chart
                    </span>
                  </div>

                  {/* North / South Style Toggle Button */}
                  <div className="chart-style-toggle-frame">
                    <button
                      className={`chart-style-btn ${chartStyle === 'north' ? 'style-btn-active' : ''}`}
                      onClick={() => setChartStyle('north')}
                    >
                      North
                    </button>
                    <button
                      className={`chart-style-btn ${chartStyle === 'south' ? 'style-btn-active' : ''}`}
                      onClick={() => setChartStyle('south')}
                    >
                      South
                    </button>
                  </div>
                </div>

                {/* SVG Chart Display */}
                <div className="chart-render-frame">
                  {chartStyle === 'north' ? (
                    <NorthIndianChart
                      chartData={chartData}
                      selectedPlanet={selectedPlanet}
                      selectedHouse={selectedHouse}
                      onSelectPlanet={setSelectedPlanet}
                      onSelectHouse={setSelectedHouse}
                    />
                  ) : (
                    <SouthIndianChart
                      chartData={chartData}
                      selectedPlanet={selectedPlanet}
                      selectedHouse={selectedHouse}
                      onSelectPlanet={setSelectedPlanet}
                      onSelectHouse={setSelectedHouse}
                    />
                  )}
                </div>

                {/* Dignity Legend */}
                <div className="chart-dignity-legend">
                  <div className="legend-pills">
                    <span className="legend-chip"><span className="chip-dot dot-exalted"></span>Exalted (उच्च)</span>
                    <span className="legend-chip"><span className="chip-dot dot-own"></span>Own Sign (स्वक्षेत्री)</span>
                    <span className="legend-chip"><span className="chip-dot dot-retro"></span>℞ Retrograde (वक्री)</span>
                  </div>
                  <span className="click-guide-hint">Click any planet or house to inspect</span>
                </div>

                {/* ── DIRECT CHART QUERIES (DYNAMIC FROM REAL PLACEMENTS) ── */}
                <div className="chart-queries-shelf">
                  <div className="queries-shelf-header">
                    <span className="queries-shelf-title font-title-md text-on-surface">Questions about your chart</span>
                    <span className="queries-shelf-sub font-body-sm text-on-surface-variant">Select a topic to explore in chat</span>
                  </div>

                  <div className="chart-queries-grid">
                    {chartQueries.map((q) => {
                      const Icon = q.icon;
                      return (
                        <button
                          key={q.label}
                          className="chart-query-chip"
                          onClick={() => handleAskInChat(q.text)}
                        >
                          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="query-chip-text">{q.label}</span>
                          <ArrowRight className="w-3 h-3 text-on-surface-variant opacity-70 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* RIGHT COLUMN: INTERACTIVE AI CHAT (COVERS RIGHT PORTION) */}
            <motion.aside
              id="dashboard-chat-section"
              className="dashboard-chat-right-col"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springTransition, delay: 0.12 }}
            >
              <div className="chat-container-card">
                <ChatPanel
                  mode="general"
                  externalQuery={chatInquiry}
                  onClearExternalQuery={() => setChatInquiry(null)}
                  motionProfile={activeMotionProfile}
                  lagnaSign={lagnaSign || 'Cancer'}
                  currentDasha={currentMahadasha || 'Sun'}
                />
              </div>
            </motion.aside>

          </div>

          {/* ── 3. TODAY'S GUIDANCE (REAL CHART DATA & GUIDANCE) ── */}
          <section className="today-guidance-section">
            <div className="today-guidance-card">
              <div className="guidance-card-header">
                <div className="guidance-title-wrap">
                  <h2 className="guidance-heading font-headline-md">
                    Daily Guidance <span className="guidance-sanskrit">· दैनिक विचार</span>
                  </h2>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">
                    Astrological insight based on your active Dasha and chart placements.
                  </p>
                </div>
                <div className="guidance-date-badge font-body-sm">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Cosmic Context Line */}
              <div className="guidance-cosmic-bar font-body-sm text-on-surface-variant">
                <span>Active Dasha: <strong className="text-on-surface">{currentDashaName !== '—' ? `${currentDashaName} Mahadasha` : 'Active'}</strong></span>
                <span className="coord-dot opacity-60">·</span>
                <span>Moon: <strong className="text-on-surface">{moonSign ? `${moonSign}${moonNakshatra ? ` (${moonNakshatra})` : ''}` : '—'}</strong></span>
                <span className="coord-dot opacity-60">·</span>
                <span>Lagna: <strong className="text-on-surface">{lagnaSign ? `${lagnaSign}${lagnaDeg != null ? ` ${lagnaDeg}°` : ''}` : '—'}</strong></span>
              </div>

              {/* Guidance Body */}
              <div className="guidance-content-box">
                {aiGuidanceLoading ? (
                  <div className="guidance-loading-state">
                    <div className="typing-dot" />
                    <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                    <div className="typing-dot" style={{ animationDelay: '300ms' }} />
                    <span className="text-gold-bright font-editorial-italic ml-2">Synthesizing astrological guidance upon your birth coordinates…</span>
                  </div>
                ) : aiGuidance ? (
                  <div className="ai-guidance-result">
                    {aiGuidance.title && <h3 className="ai-guidance-title">{aiGuidance.title}</h3>}
                    {aiGuidance.summary && <p className="ai-guidance-summary font-editorial-italic">{aiGuidance.summary}</p>}
                    {aiGuidance.analysis && <p className="ai-guidance-analysis">{aiGuidance.analysis}</p>}
                    {aiGuidance.recommendations && aiGuidance.recommendations.length > 0 && (
                      <div className="ai-guidance-recs">
                        <span className="recs-title">Astrological Focus:</span>
                        <ul className="recs-list">
                          {aiGuidance.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="shastric-baseline-guidance">
                    <p className="guidance-body-para font-editorial-italic">
                      {todayBaselineGuidance}
                    </p>
                  </div>
                )}
                {aiGuidanceError && (
                  <p className="font-body-xs text-error mt-2">{aiGuidanceError}</p>
                )}
              </div>

              {/* Guidance Actions */}
              <div className="guidance-actions-strip">
                {!aiGuidance && !aiGuidanceLoading && (
                  <button
                    className="btn-guidance-ai font-title-md"
                    onClick={handleGenerateAiGuidance}
                  >
                    <Sparkles className="w-4 h-4 text-gold-bright" />
                    <span>Generate Daily Guidance</span>
                  </button>
                )}
                <button
                  className="btn-guidance-chat font-title-md"
                  onClick={() => handleAskInChat(`Provide today's personalized astrological guidance based on my active ${currentDashaName} Dasha and ${moonSign || 'natal'} Moon.`)}
                >
                  <span>Discuss Today's Reading in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-bright" />
                </button>
              </div>
            </div>
          </section>

          {/* ── 4. BELOW THE FIRST SCREEN: LIFE FACETS (DYNAMIC FROM USER'S REAL CHART) ── */}
          <section className="life-facets-section">
            <div className="section-royal-header">
              <div className="header-ornament">
                <span className="ornament-line"></span>
                <span className="ornament-emblem">॥ जीवन विमर्श ॥</span>
                <span className="ornament-line"></span>
              </div>
              <h2 className="section-headline font-headline-lg">
                Life Areas & Guidance
              </h2>
              <p className="section-sub-desc font-editorial-italic">
                Personalized overview across major life domains derived from your birth chart.
              </p>
            </div>

            <div className="life-facets-grid">
              {lifeFacets.map((facet) => {
                const Icon = facet.icon;
                const isExpanded = expandedFacet === facet.id;

                return (
                  <motion.div
                    key={facet.id}
                    className={`facet-card ${isExpanded ? 'facet-card-expanded' : ''}`}
                    layout
                    transition={springTransition}
                  >
                    <div className="facet-card-top">
                      <div className="facet-icon-frame">
                        <Icon className="w-5 h-5 text-gold-bright" />
                      </div>
                      <div className="facet-title-box">
                        <h3 className="facet-title">{facet.title}</h3>
                        <span className="facet-subtitle">{facet.subtitle}</span>
                      </div>
                    </div>

                    {/* Short Paragraph */}
                    <p className="facet-short-para">
                      {facet.shortPara}
                    </p>

                    {/* Expandable Deeper Breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="facet-expanded-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <p className="facet-full-para font-editorial-italic">
                            {facet.fullPara}
                          </p>

                          <button
                            className="btn-facet-consult font-label-lg"
                            onClick={() => handleAskInChat(facet.queryText)}
                          >
                            <Sparkles className="w-4 h-4 text-gold-bright shrink-0" />
                            <span>Ask About This in Chat</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Read More / Read Less Toggle */}
                    <button
                      className="facet-toggle-btn font-label-sm"
                      onClick={() => toggleFacet(facet.id)}
                    >
                      <span>{isExpanded ? 'Show Less · संक्षेप' : 'Read More · विस्तृत व्याख्या'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-1 text-gold-bright" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-1 text-gold-bright" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── 4. ASTROLOGY SERVICES & TOOLS (ASTROSAGE INSPIRED) ────────── */}
          <section className="astrology-services-section">
            <div className="section-royal-header">
              <div className="header-ornament">
                <span className="ornament-line"></span>
                <span className="ornament-emblem">॥ ज्योतिष सेवाएं ॥</span>
                <span className="ornament-line"></span>
              </div>
              <h2 className="section-headline">
                Vedic Horoscopy Services & Calculation Suites
              </h2>
              <p className="section-sub-desc font-editorial-italic">
                Comprehensive shastric computation modules available directly within your Parashara account.
              </p>
            </div>

            <div className="services-grid">
              {astrologyServices.map((srv) => {
                const Icon = srv.icon;
                return (
                  <motion.div
                    key={srv.title}
                    className="service-card"
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => handleAskInChat(`Explain the astrological calculation and significance of ${srv.title} (${srv.sanskrit}) for my Kundli.`)}
                  >
                    <div className="service-card-header">
                      <div className="service-icon-box">
                        <Icon className="w-4 h-4 text-gold-bright" />
                      </div>
                      <span className="service-sanskrit-tag">{srv.sanskrit}</span>
                    </div>
                    <h4 className="service-title">{srv.title}</h4>
                    <p className="service-desc">{srv.desc}</p>
                    <div className="service-footer-link font-label-sm">
                      <span>Explore Guidance</span>
                      <ArrowRight className="w-3 h-3 text-gold-bright ml-1" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Modals for Chart Inspection */}
      <PlanetDetailModal
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onAskOracle={handlePlanetAskOracle}
      />

      <HouseDetailModal
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        onSelectPlanet={(p) => { setSelectedHouse(null); setSelectedPlanet(p); }}
        onAskOracle={handleHouseAskOracle}
      />

      <BottomNav />
    </div>
  );
}
