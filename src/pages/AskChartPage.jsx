import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Briefcase,
  Coins,
  Heart,
  Activity,
  Scroll,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import GurujiCompanion from '../components/chat/GurujiCompanion.jsx';
import CelestialAtmosphere from '../components/chat/CelestialAtmosphere.jsx';
import { getZodiacMotionProfile } from '../features/celestial/zodiacMotionProfiles.js';
import { springTransition } from '../lib/motion.js';
import './AskChartPage.css';

const MODES = [
  { id: 'general', label: 'All Life Topics · सर्व प्रश्न', Icon: Sparkles },
  { id: 'career', label: 'Career & 10th House · आजीविका', Icon: Briefcase },
  { id: 'wealth', label: 'Finance & Wealth · अर्थ लाभ', Icon: Coins },
  { id: 'union', label: 'Love & Marriage · विवाह', Icon: Heart },
  { id: 'abundance', label: 'Dasha & Timing · दशा चक्र', Icon: Activity },
];

export default function AskChartPage() {
  const { currentMode, setCurrentMode, chartData, setCurrentPage, theme } = useApp();
  const [selectedMode, setSelectedMode] = useState(currentMode || 'general');
  const [gurujiState, setGurujiState] = useState('idle');

  // Natal Lagna Sign from canonical chart data
  const realLagnaSign = chartData?.lagna?.sign || chartData?.ascendant?.sign || 'Leo';
  const moonSign = chartData?.planets?.find((p) => p.name === 'Moon')?.sign || 'Chandra';
  const currentDasha = chartData?.dasha?.currentMahadasha?.planet || 'Sun';

  // Active Zodiac Motion Profile derived directly from verified natal Lagna & active theme
  const activeMotionProfile = getZodiacMotionProfile(realLagnaSign, theme);

  useEffect(() => {
    if (currentMode) setSelectedMode(currentMode);
  }, [currentMode]);

  const handleSelectMode = (m) => {
    setSelectedMode(m);
    setCurrentMode(m);
  };

  return (
    <div className="ask-page-wrapper relative">
      <TopBar />

      <main className="ask-main relative z-10">
        <div className="app-container">

          {/* Parashara Consultation Header Card */}
          <motion.section
            className="ask-hero-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="ask-hero-header">
              <div className="ask-hero-left">
                <div className="ask-header-top-row flex items-center justify-between gap-3 mb-2.5">
                  <button
                    type="button"
                    className="btn-back-kundli"
                    onClick={() => setCurrentPage('dashboard')}
                    title="Return to Janam Kundli Dashboard"
                  >
                    <span className="material-symbols-outlined icon-xs">arrow_back</span>
                    <span>← Janam Kundli Chart</span>
                  </button>
                  <div className="folio-record-tag flex items-center gap-2">
                    <span className="hero-brand-om">ॐ</span>
                    <span className="font-label-sm uppercase font-semibold text-secondary">
                      Parashara · Consultation Room
                    </span>
                  </div>
                </div>
                <h1 className="font-headline-xl text-on-surface">
                  Ask Guruji <span className="font-editorial-italic text-secondary">· प्रश्न विचार</span>
                </h1>
                <p className="font-editorial-italic text-on-surface-variant mt-1 max-w-xl">
                  Personal astrological dialogue grounded in your verified natal coordinates and active Vimshottari Dasha.
                </p>
              </div>

              {/* Kundli Provenance & Prototype Profile Selector */}
              <div className="ask-hero-right-container">
                <div className="ask-hero-right-badge">
                  <Scroll className="w-4 h-4 text-primary" />
                  <div className="badge-text">
                    <span className="font-label-sm text-primary uppercase font-bold">
                      {realLagnaSign} Lagna · {moonSign} Moon
                    </span>
                    <span className="font-body-xs text-on-surface-variant">
                      Active: {currentDasha} Dasha
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle atmosphere indicator */}
            <div className="atmosphere-indicator-strip">
              <span className="indicator-dot" style={{ backgroundColor: activeMotionProfile.accentTint }} />
              <span className="font-label-xs text-on-surface-variant">
                Resonance: <strong className="text-on-surface">{activeMotionProfile.atmosphereName}</strong> — {activeMotionProfile.description}
              </span>
            </div>
          </motion.section>

          {/* Mode Selector Chips */}
          <div className="ask-mode-selector-bar" role="tablist">
            {MODES.map(({ id, label, Icon }) => {
              const active = selectedMode === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  className={`mode-chip relative ${active ? 'mode-chip-active' : ''}`}
                  onClick={() => handleSelectMode(id)}
                >
                  {active && (
                    <motion.div
                      layoutId="activeAskModeIndicator"
                      className="mode-chip-active-bg"
                      transition={springTransition}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${active ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Center Conversation + Right Guruji Companion Layout */}
          <div className="ask-consultation-layout">
            <div className="ask-chat-column">
              <ChatPanel
                mode={selectedMode}
                motionProfile={activeMotionProfile}
                lagnaSign={realLagnaSign}
                currentDasha={currentDasha}
                onStateChange={setGurujiState}
              />
            </div>

            <aside className="ask-companion-column">
              <GurujiCompanion
                motionProfile={activeMotionProfile}
                lagnaSign={realLagnaSign}
                currentDasha={currentDasha}
                currentMode={selectedMode}
                gurujiState={gurujiState}
              />
            </aside>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

