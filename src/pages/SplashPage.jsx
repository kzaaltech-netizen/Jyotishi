import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Scroll,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sun,
  Moon,
  CheckCircle2,
  ChevronRight,
  Eye,
  MessageSquareQuote
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import SouthIndianChart from '../components/chart/SouthIndianChart.jsx';
import PlanetDetailModal from '../components/chart/PlanetDetailModal.jsx';
import HouseDetailModal from '../components/chart/HouseDetailModal.jsx';
import { springTransition, gentleSpring, buttonPress } from '../lib/motion.js';
import './SplashPage.css';

// Canonical demo chart showcasing pure Vedic mathematics and exalted placements
const SAMPLE_DEMO_CHART = {
  isValid: true,
  source: 'canonical',
  type: 'natal',
  lagna: {
    sign: 'Aries',
    signIndex: 0,
    signIdx: 0,
    signNum: 1,
    deg: '14.2',
    lon: 14.2,
    house: 1,
  },
  planets: [
    { name: 'Sun', abbr: 'Su', sanskrit: 'सूर्य', sanskritAbbr: 'सू', sign: 'Aries', signIdx: 0, signNum: 1, house: 1, deg: '10.0', lon: 10.0, dignity: 'Exalted', isRetrograde: false, nakshatra: 'Ashwini', pada: 3, color: '#f59e0b' },
    { name: 'Moon', abbr: 'Mo', sanskrit: 'चन्द्र', sanskritAbbr: 'चं', sign: 'Taurus', signIdx: 1, signNum: 2, house: 2, deg: '03.4', lon: 33.4, dignity: 'Exalted', isRetrograde: false, nakshatra: 'Krittika', pada: 2, color: '#38bdf8' },
    { name: 'Mars', abbr: 'Ma', sanskrit: 'मंगल', sanskritAbbr: 'मं', sign: 'Capricorn', signIdx: 9, signNum: 10, house: 10, deg: '28.0', lon: 298.0, dignity: 'Exalted', isRetrograde: false, nakshatra: 'Dhanishta', pada: 2, color: '#ef4444' },
    { name: 'Mercury', abbr: 'Me', sanskrit: 'बुध', sanskritAbbr: 'बु', sign: 'Gemini', signIdx: 2, signNum: 3, house: 3, deg: '16.5', lon: 76.5, dignity: 'Own Sign', isRetrograde: false, nakshatra: 'Ardra', pada: 3, color: '#10b981' },
    { name: 'Jupiter', abbr: 'Ju', sanskrit: 'बृहस्पति', sanskritAbbr: 'गु', sign: 'Cancer', signIdx: 3, signNum: 4, house: 4, deg: '05.2', lon: 95.2, dignity: 'Exalted', isRetrograde: false, nakshatra: 'Pushya', pada: 1, color: '#eab308' },
    { name: 'Venus', abbr: 'Ve', sanskrit: 'शुक्र', sanskritAbbr: 'शु', sign: 'Taurus', signIdx: 1, signNum: 2, house: 2, deg: '21.0', lon: 51.0, dignity: 'Own Sign', isRetrograde: false, nakshatra: 'Rohini', pada: 4, color: '#ec4899' },
    { name: 'Saturn', abbr: 'Sa', sanskrit: 'शनि', sanskritAbbr: 'श', sign: 'Libra', signIdx: 6, signNum: 7, house: 7, deg: '20.1', lon: 200.1, dignity: 'Exalted', isRetrograde: true, nakshatra: 'Vishakha', pada: 1, color: '#6366f1' },
    { name: 'Rahu', abbr: 'Ra', sanskrit: 'राहु', sanskritAbbr: 'रा', sign: 'Pisces', signIdx: 11, signNum: 12, house: 12, deg: '18.4', lon: 348.4, dignity: 'Normal', isRetrograde: true, nakshatra: 'Revati', pada: 1, color: '#8b5cf6' },
    { name: 'Ketu', abbr: 'Ke', sanskrit: 'केतु', sanskritAbbr: 'के', sign: 'Virgo', signIdx: 5, signNum: 6, house: 6, deg: '18.4', lon: 168.4, dignity: 'Normal', isRetrograde: true, nakshatra: 'Hasta', pada: 3, color: '#d97706' },
  ],
  houses: [
    { number: 1, sign: 'Aries', signIdx: 0, signNum: 1, lord: 'Mars', title: 'Tanu Bhava · तनु भाव', theme: 'Self, Body, Vitality, Temperament', planets: [] },
    { number: 2, sign: 'Taurus', signIdx: 1, signNum: 2, lord: 'Venus', title: 'Dhana Bhava · धन भाव', theme: 'Wealth, Speech, Family Lineage', planets: [] },
    { number: 3, sign: 'Gemini', signIdx: 2, signNum: 3, lord: 'Mercury', title: 'Sahaja Bhava · सहज भाव', theme: 'Courage, Siblings, Manual Skill', planets: [] },
    { number: 4, sign: 'Cancer', signIdx: 3, signNum: 4, lord: 'Moon', title: 'Sukha Bhava · सुख भाव', theme: 'Mother, Home, Emotional Peace', planets: [] },
    { number: 5, sign: 'Leo', signIdx: 4, signNum: 5, lord: 'Sun', title: 'Putra Bhava · पुत्र भाव', theme: 'Intellect, Creativity, Purva Punya', planets: [] },
    { number: 6, sign: 'Virgo', signIdx: 5, signNum: 6, lord: 'Mercury', title: 'Ripu Bhava · रोग भाव', theme: 'Daily Work, Healing, Resilience', planets: [] },
    { number: 7, sign: 'Libra', signIdx: 6, signNum: 7, lord: 'Venus', title: 'Yuvati Bhava · जाया भाव', theme: 'Spouse, Partnerships, Public Standing', planets: [] },
    { number: 8, sign: 'Scorpio', signIdx: 7, signNum: 8, lord: 'Mars', title: 'Randhra Bhava · आयुर्भाव', theme: 'Longevity, Transformation, Deep Psyche', planets: [] },
    { number: 9, sign: 'Sagittarius', signIdx: 8, signNum: 9, lord: 'Jupiter', title: 'Dharma Bhava · भाग्य भाव', theme: 'Higher Wisdom, Guru, Fortune, Father', planets: [] },
    { number: 10, sign: 'Capricorn', signIdx: 9, signNum: 10, lord: 'Saturn', title: 'Karma Bhava · कर्म भाव', theme: 'Career, Societal Vocation, Authority', planets: [] },
    { number: 11, sign: 'Aquarius', signIdx: 10, signNum: 11, lord: 'Saturn', title: 'Labha Bhava · लाभ भाव', theme: 'Gains, Aspirations, Elder Allies', planets: [] },
    { number: 12, sign: 'Pisces', signIdx: 11, signNum: 12, lord: 'Jupiter', title: 'Vyaya Bhava · व्यय भाव', theme: 'Liberation (Moksha), Solitude, Foreign Realms', planets: [] },
  ],
  nakshatra: { name: 'Krittika', pada: 2, lord: 'Sun' },
  dasha: {
    currentMahadasha: { planet: 'Sun', startDate: '2022-01-01', endDate: '2028-01-01' },
    currentAntardasha: { planet: 'Jupiter', startDate: '2024-03-01', endDate: '2025-01-01' },
    mahadashaList: [],
  },
};

export default function SplashPage() {
  const { setCurrentPage, setCurrentMode } = useApp();
  const [chartStyle, setChartStyle] = useState('north'); // 'north' | 'south'
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);

  const sampleQuestions = [
    {
      question: "What does my 7th house say about marriage?",
      domain: "union",
      house: "7th House (Libra / तुला)",
      preview: "Your 7th house is ruled by Venus with exalted Saturn resident, indicating a partner of deep maturity, grounded ethics, and enduring commitment. While marriage timing favors patience, partnerships formed bring long-term structural stability."
    },
    {
      question: "What is affecting my career & 10th house?",
      domain: "career",
      house: "10th House (Capricorn / मकर)",
      preview: "Exalted Mars occupies your 10th house (Kuladaivata Yoga), bestowing immense executive drive, technical aptitude, and natural leadership. High professional authority peaks during Mars and Saturn transits."
    },
    {
      question: "What is my current Mahadasha and its influence?",
      domain: "abundance",
      house: "Dasha Cycle (Sun-Jupiter)",
      preview: "You are currently progressing through Sun Mahadasha with Jupiter Antardasha. This is a potent Dharma-Karma alignment awakening higher purpose, leadership recognition, and scholarly clarity."
    },
    {
      question: "What does my Moon placement mean for peace of mind?",
      domain: "general",
      house: "2nd House (Taurus / वृषभ)",
      preview: "The Moon is exalted in Taurus in the 2nd house (Krittika Nakshatra). This confers emotional stability, refined speech, artistic discernment, and financial prudence."
    },
  ];

  const handleStartOnboarding = () => {
    setCurrentPage('onboarding');
  };

  const handleAskQuestionDemo = (q) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pending_chart_query', q.question);
    }
    if (setCurrentMode) setCurrentMode(q.domain);
    setCurrentPage('onboarding');
  };

  return (
    <div className="splash-page-wrapper">
      <TopBar />

      <main className="splash-main">
        {/* ── 1. HERO SECTION ──────────────────────────────────────────────── */}
        <section className="hero-landing-section">
          <div className="landing-container">
            <div className="hero-grid">
              
              {/* Left Column: Core Value Proposition */}
              <motion.div
                className="hero-text-col"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springTransition}
              >
                <div className="hero-badge">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Personal Vedic Astrology Companion</span>
                </div>

                <h1 className="hero-headline font-headline">
                  Your Kundli.<br />
                  Your Questions.<br />
                  <span className="hero-headline-highlight">Your Guidance.</span>
                </h1>

                <p className="hero-supporting-text">
                  Understand your Vedic birth chart, explore your planetary patterns, and ask questions about your life with guidance grounded in your own Kundli.
                </p>

                <div className="hero-cta-group">
                  <motion.button
                    className="btn-hero-primary"
                    onClick={handleStartOnboarding}
                    {...buttonPress}
                  >
                    <span>Create My Kundli</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.button>

                  <motion.a
                    href="#interactive-chart-preview"
                    className="btn-hero-secondary"
                    {...buttonPress}
                  >
                    <span>Explore Parashara</span>
                  </motion.a>
                </div>

                {/* Grounded Trust Strip */}
                <div className="hero-trust-bullets">
                  <div className="trust-bullet-item">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Pure Sidereal Mathematics (Lahiri)</span>
                  </div>
                  <div className="trust-bullet-item">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>North & South Indian Chart Geometry</span>
                  </div>
                  <div className="trust-bullet-item">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Vedic Shastric AI Interpretation</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Real Live Interactive Kundli Demo */}
              <motion.div
                className="hero-chart-col"
                id="interactive-chart-preview"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ ...gentleSpring, delay: 0.12 }}
              >
                <div className="hero-chart-wrapper">
                  <div className="hero-chart-topbar">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                      <span className="font-headline font-bold text-sm text-on-surface">Interactive Kundli Preview</span>
                    </div>

                    <div className="chart-format-pill-group">
                      <button
                        className={`format-pill-btn ${chartStyle === 'north' ? 'format-pill-active' : ''}`}
                        onClick={() => setChartStyle('north')}
                      >
                        North (उत्तर)
                      </button>
                      <button
                        className={`format-pill-btn ${chartStyle === 'south' ? 'format-pill-active' : ''}`}
                        onClick={() => setChartStyle('south')}
                      >
                        South (दक्षिण)
                      </button>
                    </div>
                  </div>

                  <p className="chart-tap-instruction">
                    <Eye className="w-3.5 h-3.5 text-secondary" />
                    <span>Tap any planet badge or house to inspect classical Shastric portfolios</span>
                  </p>

                  <div className="chart-render-frame">
                    {chartStyle === 'north' ? (
                      <NorthIndianChart
                        chartData={SAMPLE_DEMO_CHART}
                        compact={false}
                        title="Sample Aries Lagna Chart (मेष लग्न)"
                        selectedPlanet={selectedPlanet}
                        selectedHouse={selectedHouse?.number}
                        onSelectPlanet={(p) => { setSelectedPlanet(p); setSelectedHouse(null); }}
                        onSelectHouse={(h) => { setSelectedHouse(h); setSelectedPlanet(null); }}
                      />
                    ) : (
                      <SouthIndianChart
                        chartData={SAMPLE_DEMO_CHART}
                        compact={false}
                        title="South Indian Fixed Zodiac Grid"
                        selectedPlanet={selectedPlanet}
                        selectedHouse={selectedHouse?.number}
                        onSelectPlanet={(p) => { setSelectedPlanet(p); setSelectedHouse(null); }}
                        onSelectHouse={(h) => { setSelectedHouse(h); setSelectedPlanet(null); }}
                      />
                    )}
                  </div>

                  <div className="hero-chart-footer">
                    <span className="text-xs text-on-surface-variant">
                      Lagna: <strong>Aries (14.2°)</strong> · Chandra: <strong>Taurus (Exalted)</strong> · Current Dasha: <strong>Sun-Jupiter</strong>
                    </span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 2. YOUR KUNDLI: THE FOUNDATION ──────────────────────────────── */}
        <section className="section-feature-block bg-surface-container-low">
          <div className="landing-container">
            <div className="section-header-centered">
              <span className="section-kicker">The Foundation</span>
              <h2 className="section-heading font-headline">Everything Begins With Your Personal Chart</h2>
              <p className="section-lead">
                Unlike generic sun-sign horoscopes, Vedic astrology calculates the precise celestial sphere at your exact minute and location of birth.
              </p>
            </div>

            <div className="three-column-grid">
              <div className="editorial-card">
                <div className="card-icon-box">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title font-headline">True Sidereal Lagna</h3>
                <p className="card-description">
                  The Ascendant (Lagna) anchors your entire 12-house matrix. We calculate true sidereal positions under Lahiri Ayanamsha for authentic Vedic integrity.
                </p>
              </div>

              <div className="editorial-card">
                <div className="card-icon-box">
                  <Moon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="card-title font-headline">27 Lunar Nakshatras</h3>
                <p className="card-description">
                  Understand your Janma Nakshatra and exact Pada. The Moon’s placement reveals your psychological temperament and drives your 120-year Vimshottari Dasha sequence.
                </p>
              </div>

              <div className="editorial-card">
                <div className="card-icon-box">
                  <Scroll className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title font-headline">Classical 12 Bhavas</h3>
                <p className="card-description">
                  Every house governs a sacred portfolio: Dharma (Life Purpose), Artha (Wealth), Kama (Relationships), and Moksha (Transcendence) — evaluated by house lords and aspects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. ASK YOUR KUNDLI: CONVERSATIONAL CLARITY ─────────────────── */}
        <section className="section-feature-block">
          <div className="landing-container">
            <div className="section-header-centered">
              <span className="section-kicker">Contextual AI Guidance</span>
              <h2 className="section-heading font-headline">Ask Your Kundli, Not a Generic Chatbot</h2>
              <p className="section-lead">
                Ask specific, natural questions about career, marriage, dasha cycles, and finances. Parashara grounds every answer in your actual planetary coordinates.
              </p>
            </div>

            <div className="interactive-qa-showcase">
              {/* Question Selection Column */}
              <div className="qa-selector-col">
                {sampleQuestions.map((item, idx) => (
                  <button
                    key={idx}
                    className={`qa-item-btn ${activeQuestion === idx ? 'qa-item-active' : ''}`}
                    onClick={() => setActiveQuestion(idx)}
                  >
                    <div className="qa-item-header">
                      <MessageSquareQuote className="w-4 h-4 text-primary shrink-0" />
                      <span className="qa-item-question font-headline">{item.question}</span>
                    </div>
                    <span className="qa-item-sub">{item.house}</span>
                  </button>
                ))}
              </div>

              {/* Answer Reveal Card */}
              <div className="qa-answer-card">
                <div className="qa-answer-badge">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Scripturally Grounded Reading</span>
                </div>

                <h4 className="qa-answer-title font-headline">
                  "{sampleQuestions[activeQuestion].question}"
                </h4>

                <p className="qa-answer-body font-body">
                  {sampleQuestions[activeQuestion].preview}
                </p>

                <div className="qa-answer-footer">
                  <span className="text-xs text-on-surface-variant">
                    Portfolio Focus: <strong>{sampleQuestions[activeQuestion].house}</strong>
                  </span>
                  <button
                    className="btn-ask-demo"
                    onClick={() => handleAskQuestionDemo(sampleQuestions[activeQuestion])}
                  >
                    <span>Ask with My Birth Details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. UNDERSTAND YOUR PLANETS & DASHAS ──────────────────────────── */}
        <section className="section-feature-block bg-surface-container-low">
          <div className="landing-container">
            <div className="two-column-split">
              
              <div className="split-content-col">
                <span className="section-kicker">Planetary Dispositions</span>
                <h2 className="section-heading font-headline">Planetary Strengths & Dignities</h2>
                <p className="section-paragraph">
                  Discover which planets are exalted (Uccha), in their own signs (Swakshetra), or debilitated (Neecha). Every degree and retrograde motion (Vakri) influences how planetary energies express themselves in your daily reality.
                </p>

                <ul className="split-feature-list">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-on-surface">Exact Degree Precision:</strong>
                      <span className="text-on-surface-variant text-sm block">Sub-arcminute sidereal coordinates for all nine Grahas.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-on-surface">Retrograde (℞) Flags:</strong>
                      <span className="text-on-surface-variant text-sm block">Clear identification of inward, intensified karmic planets.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-on-surface">Divisional Harmonics:</strong>
                      <span className="text-on-surface-variant text-sm block">D9 Navamsha for soul destiny and D10 Dashamsha for career vocation.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="split-content-col">
                <span className="section-kicker">Temporal Cycles</span>
                <h2 className="section-heading font-headline">Vimshottari Dasha Timeline</h2>
                <p className="section-paragraph">
                  Vedic astrology does not treat life as a static snapshot. The 120-year Vimshottari Dasha cycle maps the unfolding of karma across distinct planetary chapters.
                </p>

                <div className="timeline-mock-card">
                  <div className="timeline-step active-step">
                    <div className="step-dot active-dot"></div>
                    <div className="step-content">
                      <span className="step-period">Active Mahadasha</span>
                      <h4 className="step-planet font-headline">Sun Mahadasha (सूर्य)</h4>
                      <p className="step-dates">2022 – 2028 · Phase of Authority & Life Focus</p>
                    </div>
                  </div>

                  <div className="timeline-step">
                    <div className="step-dot"></div>
                    <div className="step-content">
                      <span className="step-period">Current Antardasha</span>
                      <h4 className="step-planet font-headline">Jupiter Sub-Period (बृहस्पति)</h4>
                      <p className="step-dates">Active until Jan 2025 · Wisdom, Dharma & Guidance</p>
                    </div>
                  </div>

                  <div className="timeline-step">
                    <div className="step-dot"></div>
                    <div className="step-content">
                      <span className="step-period">Upcoming Chapter</span>
                      <h4 className="step-planet font-headline">Saturn Sub-Period (शनि)</h4>
                      <p className="step-dates">2025 – 2026 · Structure, Discipline & Long-term Consolidation</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 5. VEDIC ASTROLOGY, MADE CLEAR ──────────────────────────────── */}
        <section className="section-feature-block">
          <div className="landing-container">
            <div className="section-header-centered">
              <span className="section-kicker">Shastric Pillars</span>
              <h2 className="section-heading font-headline">Vedic Astrology, Made Clear</h2>
              <p className="section-lead">
                Ancient Parashara principles explained without confusing jargon or superstitious fatalism.
              </p>
            </div>

            <div className="five-pillars-grid">
              <div className="pillar-tile">
                <span className="pillar-num">01</span>
                <h4 className="pillar-name font-headline">Lagna (लग्न)</h4>
                <p className="pillar-desc">The rising sign on the eastern horizon at birth. Defines your physical body, vitality, and life perspective.</p>
              </div>

              <div className="pillar-tile">
                <span className="pillar-num">02</span>
                <h4 className="pillar-name font-headline">Rashi (राशि)</h4>
                <p className="pillar-desc">The 12 sidereal signs mapping planetary energy. Each rashi represents a specific elemental nature and planetary rulership.</p>
              </div>

              <div className="pillar-tile">
                <span className="pillar-num">03</span>
                <h4 className="pillar-name font-headline">Nakshatra (नक्षत्र)</h4>
                <p className="pillar-desc">27 lunar constellations that divide the sky into 13°20' segments. Governs emotional temperament and dasha start points.</p>
              </div>

              <div className="pillar-tile">
                <span className="pillar-num">04</span>
                <h4 className="pillar-name font-headline">Dasha (दशा)</h4>
                <p className="pillar-desc">The master timeline of your life. Reveals which planetary energies are actively operating in your current chapter.</p>
              </div>

              <div className="pillar-tile">
                <span className="pillar-num">05</span>
                <h4 className="pillar-name font-headline">Vargas (वर्ग चक्र)</h4>
                <p className="pillar-desc">Divisional harmonic charts like D9 Navamsha and D10 Dashamsha that provide fine-grained focus on marriage and career.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TRUST & TRANSPARENCY ─────────────────────────────────────── */}
        <section className="section-feature-block bg-surface-container-low border-t border-hairline">
          <div className="landing-container">
            <div className="trust-card-inner">
              <div className="trust-icon-box">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="trust-content">
                <h3 className="trust-title font-headline">Our Ethical Standard & Computational Transparency</h3>
                <p className="trust-text">
                  Parashara separates astronomical computation from interpretive guidance. Planetary positions are calculated using validated sidereal ephemeris mathematics. AI is employed purely as an interpretive lens grounded in classical Brihat Parashara Hora Shastra literature.
                </p>
                <div className="trust-badges-row">
                  <div className="trust-chip">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    <span>Structured Calculation Data Contract</span>
                  </div>
                  <div className="trust-chip">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    <span>No Arbitrary Hallucinations</span>
                  </div>
                  <div className="trust-chip">
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block"></span>
                    <span>Perspective, Not Fatalism</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. FINAL CALL TO ACTION ─────────────────────────────────────── */}
        <section className="final-cta-section">
          <div className="landing-container text-center">
            <div className="final-cta-box">
              <span className="section-kicker text-gold">Begin Your Journey</span>
              <h2 className="final-cta-heading font-headline">
                Cast Your Janam Kundli Today
              </h2>
              <p className="final-cta-subtext font-body">
                Enter your date, time, and city of birth to generate your high-precision Vedic chart and explore your planetary patterns.
              </p>
              <div className="final-cta-btn-wrap">
                <motion.button
                  className="btn-hero-primary"
                  onClick={handleStartOnboarding}
                  {...buttonPress}
                >
                  <span>Create My Kundli</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </motion.button>
              </div>
              <p className="text-xs text-on-surface-variant mt-4">
                Takes less than 60 seconds · Fully confidential · Authentic sidereal calculations
              </p>
              <p className="text-xs text-on-surface-variant mt-2">
                Parashara is a product of{' '}
                <a href="https://www.fasfaslabs.com/" target="_blank" rel="noopener noreferrer" className="underline">FAS FAS Labs</a>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Interactive Detail Modals for Planet & House clicks on preview chart */}
      <PlanetDetailModal
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onAskOracle={(q) => handleAskQuestionDemo({ question: q, domain: 'general' })}
      />

      <HouseDetailModal
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        onAskOracle={(q) => handleAskQuestionDemo({ question: q, domain: 'general' })}
      />
    </div>
  );
}
