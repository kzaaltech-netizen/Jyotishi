import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getNakshatraData, usePrefersReducedMotion } from './nakshatraUtils.js';
import './NakshatraAtmosphere.css';

/**
 * NakshatraAtmosphere
 *
 * 7-Layer Celestial Observatory & Living Nakshatra Constellation System
 * Rendered behind the Astro-AI chat consultation area.
 * Inspired directly by the Google Stitch Observatory Prototype.
 *
 * Props:
 *   nakshatra    {string|null} - User's Moon Nakshatra from canonical Kundli (e.g. "Ashlesha")
 *   theme        {string}      - "cosmic" | "vedic"
 *   gurujiState  {string}      - "idle" | "thinking" | "answer"
 *   intensity    {string}      - "chat" | "light"
 */
export default function NakshatraAtmosphere({
  nakshatra = null,
  theme = 'cosmic',
  gurujiState = 'idle',
  intensity = 'chat',
}) {
  const data = useMemo(() => getNakshatraData(nakshatra), [nakshatra]);
  const reducedMotion = usePrefersReducedMotion();

  const isVedic = theme === 'vedic';
  const isThinking = gurujiState === 'thinking';
  const isAnswer = gurujiState === 'answer';

  // Unique filter ID so multiple atmospheric SVG instances never collide
  const filterId = useMemo(
    () => `stitch-glow-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // Distant micro stars (Layer 3) - Dynamic gold/amber in Vedic light mode, luminous starlight in Cosmic mode
  const microStars = useMemo(() => {
    return [
      { top: '6%',  left: '9%',  size: 1.5, color: isVedic ? '#b8860b' : '#ffffff', opacity: 0.60, twinkle: '' },
      { top: '12%', left: '22%', size: 2.0, color: isVedic ? '#d4af37' : '#e2e8f0', opacity: 0.75, twinkle: 'twinkle-1' },
      { top: '16%', left: '42%', size: 1.5, color: isVedic ? '#c2921a' : '#fef08a', opacity: 0.70, twinkle: '' },
      { top: '9%',  left: '68%', size: 1.5, color: isVedic ? '#b07d1e' : '#bae6fd', opacity: 0.65, twinkle: 'twinkle-2' },
      { top: '22%', left: '88%', size: 2.0, color: isVedic ? '#d4af37' : '#ffffff', opacity: 0.85, twinkle: 'twinkle-3' },
      { top: '34%', left: '11%', size: 1.5, color: isVedic ? '#a07218' : '#cbd5e1', opacity: 0.55, twinkle: '' },
      { top: '36%', left: '94%', size: 1.5, color: isVedic ? '#c2921a' : '#c7d2fe', opacity: 0.70, twinkle: 'twinkle-4' },
      { top: '46%', left: '4%',  size: 2.2, color: isVedic ? '#d4af37' : '#fef3c7', opacity: 0.80, twinkle: 'twinkle-2' },
      { top: '56%', left: '92%', size: 1.5, color: isVedic ? '#b8860b' : '#ffffff', opacity: 0.55, twinkle: '' },
      { top: '66%', left: '15%', size: 1.5, color: isVedic ? '#a07218' : '#cffafe', opacity: 0.65, twinkle: 'twinkle-1' },
      { top: '74%', left: '29%', size: 2.0, color: isVedic ? '#d4af37' : '#ffffff', opacity: 0.60, twinkle: '' },
      { top: '82%', left: '78%', size: 1.5, color: isVedic ? '#c2921a' : '#fef08a', opacity: 0.75, twinkle: 'twinkle-3' },
      { top: '88%', left: '22%', size: 1.5, color: isVedic ? '#b07d1e' : '#cbd5e1', opacity: 0.55, twinkle: '' },
      { top: '64%', left: '86%', size: 2.0, color: isVedic ? '#d4af37' : '#e9d5ff', opacity: 0.70, twinkle: 'twinkle-4' },
      { top: '92%', left: '62%', size: 1.5, color: isVedic ? '#b8860b' : '#ffffff', opacity: 0.55, twinkle: 'twinkle-2' },
    ];
  }, [isVedic]);

  // Prominent sparkling stars (Layer 4)
  const sparkleStars = useMemo(() => [
    { top: '10%', left: '14%', glyph: '✦', color: isVedic ? 'rgba(184, 134, 11, 0.78)' : 'rgba(254, 240, 138, 0.65)', size: '12px', twinkle: 'twinkle-2' },
    { top: '8%',  right: '18%', glyph: '✧', color: isVedic ? 'rgba(212, 175, 55, 0.75)' : 'rgba(186, 230, 253, 0.60)', size: '14px', twinkle: 'twinkle-3' },
    { top: '34%', right: '7%',  glyph: '✦', color: isVedic ? 'rgba(194, 146, 26, 0.78)' : 'rgba(253, 224, 71, 0.70)', size: '13px', twinkle: 'twinkle-1' },
    { top: '48%', left: '6%',   glyph: '✦', color: isVedic ? 'rgba(176, 125, 30, 0.70)' : 'rgba(233, 213, 255, 0.55)', size: '11px', twinkle: 'twinkle-4' },
    { top: '76%', right: '12%', glyph: '✧', color: isVedic ? 'rgba(212, 175, 55, 0.70)' : 'rgba(254, 240, 138, 0.50)', size: '13px', twinkle: 'twinkle-2' },
  ], [isVedic]);

  const alpha = data.alphaStar || { x: 440, y: 185, name: 'YOGATARA', desc: 'KEY CELESTIAL NODE' };

  return (
    <motion.div
      className={`nakshatra-7layer-observatory ${isVedic ? 'nakshatra-vedic-mode' : 'nakshatra-cosmic-mode'} nakshatra-intensity-${intensity}`}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* =================================================================== */}
      {/* LAYER 1: Deep Cosmic Space Canvas Base Gradient                     */}
      {/* =================================================================== */}
      <div className="nakshatra-cosmic-base" />

      {/* =================================================================== */}
      {/* LAYER 2: Organic Galactic Milky Way Nebula Dust Bands               */}
      {/* =================================================================== */}
      <div className="nakshatra-nebula-bands">
        {/* Diagonal Milky Way Stream */}
        <div className="milkyway-diagonal-band" />
        {/* Soft Violet / Slate Cosmic Haze */}
        <div className="nebula-violet-haze" />
        {/* Ethereal Midnight Teal / Indigo Dust */}
        <div className="nebula-teal-dust" />
        {/* Cosmic Magenta Glow Accents */}
        <div className="nebula-magenta-glow" />
        {/* Soft Center Gold Core Glow behind Nakshatra */}
        <div className="nebula-center-gold-core" />
      </div>

      {/* =================================================================== */}
      {/* LAYER 3: Distant Micro Star Field                                   */}
      {/* =================================================================== */}
      <div className="nakshatra-micro-starfield">
        {microStars.map((s, idx) => (
          <div
            key={`micro-${idx}`}
            className={`micro-star ${s.twinkle}`}
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* =================================================================== */}
      {/* LAYER 4: Prominent Sparkling Stars (✦, ✧)                           */}
      {/* =================================================================== */}
      <div className="nakshatra-sparkle-field">
        {sparkleStars.map((sp, idx) => (
          <div
            key={`sparkle-${idx}`}
            className={`celestial-glint ${sp.twinkle}`}
            style={{
              top: sp.top,
              left: sp.left || 'auto',
              right: sp.right || 'auto',
              color: sp.color,
              fontSize: sp.size,
            }}
          >
            {sp.glyph}
          </div>
        ))}
      </div>

      {/* =================================================================== */}
      {/* LAYER 5: Distant Shooting Star Celestial Trail                      */}
      {/* =================================================================== */}
      {!reducedMotion && <div className="nakshatra-shooting-trail" />}

      {/* VIGNETTE MASK (Ambient backdrop shield behind constellation) */}
      <div className="nakshatra-readability-vignette" />

      {/* =================================================================== */}
      {/* LAYER 6 & 7: ELEVATED STITCH NAKSHATRA CONSTELLATION WEB + ALPHA    */}
      {/* Wide 960x620 canvas spreading branches around and behind chat area  */}
      {/* =================================================================== */}
      <div className="nakshatra-elevated-stage" data-purpose="elevated-nakshatra-stage">
        <div className="celestial-orbit-drift">
          <svg
            className="nakshatra-stitch-svg"
            viewBox="0 0 960 620"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Luminous Golden Star Filter */}
              <filter id={`${filterId}-goldAura`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={isVedic ? "4" : "6"} result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Alpha Star Breathing Heart Corona Glow */}
              <filter id={`${filterId}-alphaHeart`} x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation={isVedic ? "10" : "15"} result="bigGlow" />
                <feGaussianBlur stdDeviation={isVedic ? "4" : "5"} result="sharpGlow" />
                <feMerge>
                  <feMergeNode in="bigGlow" />
                  <feMergeNode in="sharpGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Connector Line Golden Energy Gradient */}
              <linearGradient id={`${filterId}-beam`} x1="0%" y1="0%" x2="100%" y2="100%">
                {isVedic ? (
                  <>
                    <stop offset="0%" stopColor="#C4921A" stopOpacity="0.88" />
                    <stop offset="50%" stopColor="#E6C265" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#B8860B" stopOpacity="0.88" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#ECD087" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#FFF4D0" stopOpacity="0.98" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.85" />
                  </>
                )}
              </linearGradient>

              {/* Line Drop Shadow / Aura Filter */}
              <filter id={`${filterId}-lineAura`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={isVedic ? "1.8" : "2.5"} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Sacred Manuscript Vedic Ring Radial Gradient */}
              <radialGradient id={`${filterId}-sacredRings`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={isVedic ? "0.18" : "0.14"} />
                <stop offset="60%" stopColor="#e6c687" stopOpacity={isVedic ? "0.06" : "0.04"} />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Sacred Astronomical Rings (centered at 480, 290) */}
            <circle
              cx="480"
              cy="290"
              r="285"
              fill="none"
              stroke={isVedic ? '#b8860b' : '#d4af37'}
              strokeDasharray="4 8"
              strokeOpacity={isVedic ? '0.24' : '0.14'}
              strokeWidth="1"
            />
            <circle
              cx="480"
              cy="290"
              r="195"
              fill={`url(#${filterId}-sacredRings)`}
              stroke={isVedic ? '#c2921a' : '#ecd087'}
              strokeDasharray="6 8"
              strokeOpacity={isVedic ? '0.22' : '0.12'}
              strokeWidth="0.9"
            />
            <circle
              cx="480"
              cy="290"
              r="115"
              fill="none"
              stroke={isVedic ? '#966f1e' : '#38bdf8'}
              strokeDasharray="3 6"
              strokeOpacity={isVedic ? '0.20' : '0.10'}
              strokeWidth="0.8"
            />

            {/* Subtle Tilted Astronomical Orbital Arc */}
            <ellipse
              cx="480"
              cy="290"
              rx="390"
              ry="230"
              transform="rotate(-9 480 290)"
              fill="none"
              stroke={isVedic ? '#c4921a' : '#60a5fa'}
              strokeDasharray="3 10"
              strokeOpacity={isVedic ? '0.22' : '0.12'}
              strokeWidth="0.8"
            />



            {/* Constellation Web Lines */}
            <g
              id="constellation-web"
              filter={`url(#${filterId}-lineAura)`}
              className={isThinking ? 'guruji-active-shimmer' : ''}
            >
              {/* Primary Constellation Path */}
              {data.path && (
                <path
                  className="vedic-line-color guruji-target-lines"
                  d={data.path}
                  stroke={`url(#${filterId}-beam)`}
                  strokeWidth={isVedic ? '2.8' : '2.4'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
              )}

              {/* Delicate Harmonic Cross-Struts (Sacred triangulations) */}
              {data.harmonics && data.harmonics.map((h, hIdx) => (
                <line
                  key={`harmonic-${hIdx}`}
                  className="vedic-harmonic-line"
                  x1={h.x1}
                  y1={h.y1}
                  x2={h.x2}
                  y2={h.y2}
                  stroke={isVedic ? '#C4921A' : '#ecd087'}
                  strokeDasharray="4 3"
                  strokeOpacity={isVedic ? '0.70' : '0.62'}
                  strokeWidth={isVedic ? '1.4' : '1.2'}
                />
              ))}
            </g>

            {/* Secondary Celestial Stars (Nodes with Respiration Keyframes) */}
            {data.stars && data.stars.map((star, sIdx) => {
              if (star.isAlpha) return null; // Rendered below with full corona
              return (
                <g
                  key={`node-${sIdx}`}
                  className={star.delayed ? 'node-respiration-delayed' : 'node-respiration'}
                  style={{ transformOrigin: `${star.x}px ${star.y}px` }}
                >
                  {/* Outer diffuse golden halo */}
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.halo || 12}
                    fill="#d4af37"
                    opacity={isVedic ? 0.30 : 0.24}
                  />
                  {/* Mid radiant star disc */}
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.r || 5.2}
                    fill={isVedic ? '#D4AF37' : '#f6e7ba'}
                    filter={`url(#${filterId}-goldAura)`}
                  />
                  {/* Pure white core disc */}
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.core || 2.6}
                    fill="#ffffff"
                  />
                  {/* Optional miniature 4-point sparkle on key nodes */}
                  {star.sparkle && (
                    <path
                      d={`M ${star.x} ${star.y - 10} L ${star.x + 2} ${star.y - 1.5} L ${star.x + 10} ${star.y} L ${star.x + 2} ${star.y + 1.5} L ${star.x} ${star.y + 10} L ${star.x - 2} ${star.y + 1.5} L ${star.x - 10} ${star.y} L ${star.x - 2} ${star.y - 1.5} Z`}
                      fill={isVedic ? '#FFFBEA' : '#ffffff'}
                      opacity="0.95"
                    />
                  )}
                </g>
              );
            })}

            {/* =============================================================== */}
            {/* LAYER 7: PRIMARY ALPHA STAR YOGATARA (Breathing Heart Corona)   */}
            {/* =============================================================== */}
            <g
              className={`alpha-heart-breathing ${isAnswer ? 'alpha-flare-active' : ''}`}
              style={{ transformOrigin: `${alpha.x}px ${alpha.y}px` }}
            >
              {/* Outermost Pulsing Corona Halo */}
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r="34"
                fill={isVedic ? '#e6c687' : '#f5e6ba'}
                filter={`url(#${filterId}-alphaHeart)`}
                opacity={isVedic ? 0.22 : 0.24}
              />
              {/* Secondary Gold Halo */}
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r="22"
                fill="#d4af37"
                filter={`url(#${filterId}-goldAura)`}
                opacity={isVedic ? 0.45 : 0.50}
              />
              {/* Champagne / Gold Starlight Core Disc */}
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r="11"
                fill={isVedic ? '#E5B842' : '#fef6dc'}
                filter={`url(#${filterId}-goldAura)`}
              />
              {/* Brilliant White Center */}
              <circle
                cx={alpha.x}
                cy={alpha.y}
                r="5.5"
                fill="#ffffff"
              />
              {/* 4-Point Brilliant Starlight Glint */}
              <path
                d={`M ${alpha.x} ${alpha.y - 24} L ${alpha.x + 3} ${alpha.y - 3.5} L ${alpha.x + 24} ${alpha.y} L ${alpha.x + 3} ${alpha.y + 3.5} L ${alpha.x} ${alpha.y + 24} L ${alpha.x - 3} ${alpha.y + 3.5} L ${alpha.x - 24} ${alpha.y} L ${alpha.x - 3} ${alpha.y - 3.5} Z`}
                fill={isVedic ? '#FFFDF4' : '#ffffff'}
                opacity="0.98"
              />
              {/* Diagonal Micro-Beams rotated 45 deg */}
              <path
                d={`M ${alpha.x} ${alpha.y - 13} L ${alpha.x + 2} ${alpha.y - 2} L ${alpha.x + 13} ${alpha.y} L ${alpha.x + 2} ${alpha.y + 2} L ${alpha.x} ${alpha.y + 13} L ${alpha.x - 2} ${alpha.y + 2} L ${alpha.x - 13} ${alpha.y} L ${alpha.x - 2} ${alpha.y - 2} Z`}
                fill={isVedic ? '#F6D88A' : '#fef0cd'}
                opacity="0.85"
                transform={`rotate(45 ${alpha.x} ${alpha.y})`}
              />
            </g>

          </svg>
        </div>
      </div>
    </motion.div>
  );
}
