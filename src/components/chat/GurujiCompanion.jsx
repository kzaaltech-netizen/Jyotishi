import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Scroll, Compass } from 'lucide-react';
import CosmicEnergyOrb from '../ui/CosmicEnergyOrb.jsx';
import './GurujiCompanion.css';

const MODE_FOCUS_MAP = {
  general:   { label: 'Life Path · 1st House', icon: Compass },
  career:    { label: 'Career · 10th House', icon: Target },
  wealth:    { label: 'Finance · 2nd & 11th House', icon: Sparkles },
  union:     { label: 'Partnership · 7th House', icon: Scroll },
  abundance: { label: 'Dasha Cycle · Mahadasha', icon: Compass },
};

export default function GurujiCompanion({
  motionProfile,
  lagnaSign = 'Leo',
  currentDasha = 'Sun',
  currentMode = 'general',
  gurujiState = 'idle', // 'idle' | 'thinking' | 'answer'
  compact = false,
}) {
  const focus = MODE_FOCUS_MAP[currentMode] || MODE_FOCUS_MAP.general;
  const FocusIcon = focus.icon;

  const stateTextMap = {
    idle: 'Cosmic energy aligned.',
    thinking: 'Synthesizing planetary coordinates…',
    answer: 'Considering your current phase…',
  };

  const statusText = stateTextMap[gurujiState] || stateTextMap.idle;

  return (
    <div
      className={`guruji-companion-card ${compact ? 'companion-compact' : ''}`}
      style={{
        '--companion-accent': motionProfile?.accentTint || 'var(--secondary)',
        '--companion-glow': motionProfile?.glowTint || 'rgba(251, 191, 36, 0.15)',
      }}
    >
      {/* Subtle planetary background backdrop */}
      <div className="companion-ambient-planet" aria-hidden="true" />
      <div className="companion-ambient-glow" aria-hidden="true" />

      {/* Living Cosmic Energy Core */}
      <div className="guruji-portrait-stage">
        <CosmicEnergyOrb
          size={compact ? 84 : 116}
          state={gurujiState}
          motionProfile={motionProfile}
          showRings={true}
        />
        {/* Sacred Bindu indicator */}
        <span className="guruji-bindu-dot" />
      </div>

      {/* Cosmic Energy Intelligence Identity */}
      <div className="companion-identity">
        <span className="companion-om-symbol">ॐ</span>
        <h3 className="companion-name font-headline-sm">Cosmic Guide</h3>
        <p className="companion-sub font-editorial-italic">Vedic intelligence, grounded in your chart.</p>

        {/* Dynamic State (Idle / Thinking / Answer) */}
        <div className={`companion-state-pill state-${gurujiState}`}>
          <span className="state-pulse-dot" />
          <span className="state-text font-body-xs">{statusText}</span>
        </div>
      </div>

      {/* Kundli Context Breakdown */}
      <div className="companion-context-grid">
        <div className="context-item">
          <FocusIcon className="w-3.5 h-3.5 context-item-icon" />
          <div className="context-item-text">
            <span className="context-item-label font-label-xs">Current focus</span>
            <span className="context-item-val font-body-sm">{focus.label}</span>
          </div>
        </div>

        <div className="context-item">
          <Scroll className="w-3.5 h-3.5 context-item-icon" />
          <div className="context-item-text">
            <span className="context-item-label font-label-xs">Based on your Kundli</span>
            <span className="context-item-val font-body-sm">{lagnaSign} Lagna · {currentDasha} Dasha (4 factors)</span>
          </div>
        </div>
      </div>

      {/* Scriptural Vedic Quote */}
      <div className="companion-quote-box">
        <p className="companion-quote font-editorial-italic">
          “The same sky watches over you, in every phase of your journey.”
        </p>
        <span className="companion-footer-om">ॐ</span>
      </div>
    </div>
  );
}
