import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Scroll, Compass } from 'lucide-react';
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
    idle: 'Ready when you are.',
    thinking: 'Reflecting on your Kundli…',
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

      {/* Guruji Portrait with Sacred Orbital Halos */}
      <div className="guruji-portrait-stage">
        {/* Cosmic Nebula Swirl behind Guruji in cosmic mode */}
        <div className="guruji-cosmic-swirl" aria-hidden="true" />

        {/* Orbital Ring Primary */}
        <div className="guruji-orbital-ring ring-outer" />
        <div className="guruji-orbital-ring ring-inner" />

        {/* Halo Glow */}
        <div className="guruji-luminous-aura" />

        {/* Portrait Circle */}
        <div className="guruji-portrait-frame">
          <img
            src="/guruji.jpg"
            alt="Guruji — Venerable Vedic Astrology Companion"
            className="guruji-portrait-img"
            loading="eager"
            onError={(e) => {
              // Graceful fallback if image is loading or unavailable
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('portrait-fallback');
            }}
          />
          <span className="portrait-fallback-om">ॐ</span>
        </div>

        {/* Small sacred Bindu indicator */}
        <span className="guruji-bindu-dot" />
      </div>

      {/* Guruji Identity */}
      <div className="companion-identity">
        <span className="companion-om-symbol">ॐ</span>
        <h3 className="companion-name font-headline-sm">Guruji</h3>
        <p className="companion-sub font-editorial-italic">Your chart, understood.</p>

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
            <span className="context-item-val font-body-sm">{lagnaSign} Lagna · {currentDasha} Dasha</span>
          </div>
        </div>
      </div>

      {/* Scriptural Vedic Quote */}
      <div className="companion-quote-box">
        <p className="companion-quote font-editorial-italic">
          “The same sky watches over you in every phase of your life.”
        </p>
        <span className="companion-footer-om">ॐ</span>
      </div>
    </div>
  );
}
