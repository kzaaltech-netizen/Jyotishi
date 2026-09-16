import React, { useMemo } from 'react';
import './CelestialAtmosphere.css';

/**
 * CelestialAtmosphere
 * Renders a subtle, restrained celestial orbital geometry personalized by the user's Lagna.
 * Performance: uses pure SVG + CSS transforms; zero heavy render loops.
 */
export default function CelestialAtmosphere({ profile }) {
  const {
    accentTint = '#96682b',
    glowTint = 'rgba(180, 120, 30, 0.14)',
    orbitStroke = 'rgba(150, 104, 43, 0.48)',
    orbitCount = 3,
    orbitSpeedPrimary = 90,
    orbitSpeedSecondary = 150,
    pulseDuration = 9,
    particleCount = 8,
    patternType = 'solar-radiant',
  } = profile || {};

  // Deterministic particle positions distributed around center (300, 300)
  const particles = useMemo(() => {
    const list = [];
    const count = Math.max(5, Math.min(particleCount, 12));
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i * 0.4);
      const radius = 85 + ((i * 37) % 155);
      const cx = 300 + Math.cos(angle) * radius;
      const cy = 300 + Math.sin(angle) * radius;
      const r = 1.6 + ((i % 3) * 0.7);
      list.push({ id: i, cx, cy, r });
    }
    return list;
  }, [particleCount]);

  // 12 Astrolabe / Rashi Ticks around outer perimeter
  const zodiacTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x1 = 300 + Math.cos(angle) * 236;
      const y1 = 300 + Math.sin(angle) * 236;
      const x2 = 300 + Math.cos(angle) * 254;
      const y2 = 300 + Math.sin(angle) * 254;
      ticks.push({ id: i, x1, y1, x2, y2 });
    }
    return ticks;
  }, []);

  return (
    <div
      className="celestial-atmosphere-container"
      aria-hidden="true"
      style={{
        '--pulse-speed': `${pulseDuration}s`,
        '--orbit-speed-primary': `${orbitSpeedPrimary}s`,
        '--orbit-speed-secondary': `${orbitSpeedSecondary}s`,
      }}
    >
      {/* Central Ambient Breath Glow */}
      <div
        className="celestial-central-glow"
        style={{
          background: `radial-gradient(circle, ${glowTint} 0%, rgba(251, 191, 36, 0.08) 40%, transparent 72%)`,
        }}
      />

      {/* SVG Celestial Orbits & Sacred Geometry */}
      <svg
        className="celestial-orbit-svg"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gold glow filter for planetary nodes */}
          <filter id="celestialGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g>
          {/* Sacred Cardinal Axes (Lagna - 7th - 10th - 4th House Astrological Pillars) */}
          <line
            x1="55"
            y1="300"
            x2="545"
            y2="300"
            stroke={accentTint}
            strokeWidth="1.6"
            strokeDasharray="4 6"
            opacity="0.75"
          />
          <line
            x1="300"
            y1="55"
            x2="300"
            y2="545"
            stroke={accentTint}
            strokeWidth="1.6"
            strokeDasharray="4 6"
            opacity="0.75"
          />

          {/* Diagonal Trine Lines (Dharma / Moksha Axes) */}
          <line
            x1="125"
            y1="125"
            x2="475"
            y2="475"
            stroke={accentTint}
            strokeWidth="1.2"
            strokeDasharray="3 7"
            opacity="0.55"
          />
          <line
            x1="125"
            y1="475"
            x2="475"
            y2="125"
            stroke={accentTint}
            strokeWidth="1.2"
            strokeDasharray="3 7"
            opacity="0.55"
          />

          {/* Outermost Astrolabe Perimeter Ring with 12 Zodiac Ticks */}
          <circle
            cx="300"
            cy="300"
            r="245"
            stroke={accentTint}
            strokeWidth="1.8"
            strokeDasharray="6 8"
            opacity="0.75"
          />
          {zodiacTicks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={accentTint}
              strokeWidth="2.0"
              opacity="0.85"
            />
          ))}

          {/* Primary Orbital Ring */}
          <g className="orbit-ring-primary">
            <circle
              cx="300"
              cy="300"
              r="195"
              stroke={accentTint}
              strokeWidth="2.2"
              strokeDasharray={patternType === 'precise-geometry' ? '4 6' : '6 8'}
              opacity="0.85"
            />
            {/* Celestial luminous nodes on primary orbit */}
            <circle
              cx="495"
              cy="300"
              r="5.5"
              fill={accentTint}
              filter="url(#celestialGlow)"
              opacity="0.95"
            />
            <circle
              cx="105"
              cy="300"
              r="4.0"
              fill={accentTint}
              opacity="0.85"
            />
          </g>

          {/* Secondary Counter-Rotating Orbital Ring */}
          <g className="orbit-ring-secondary">
            <circle
              cx="300"
              cy="300"
              r={patternType === 'dual-orbit' ? '150' : '140'}
              stroke={accentTint}
              strokeWidth="1.8"
              strokeDasharray="4 6"
              opacity="0.8"
            />
            {/* Opposing Graha nodes */}
            <circle
              cx="300"
              cy="160"
              r="4.8"
              fill={accentTint}
              filter="url(#celestialGlow)"
              opacity="0.92"
            />
            <circle
              cx="300"
              cy="440"
              r="3.6"
              fill={accentTint}
              opacity="0.82"
            />
          </g>

          {/* Inner Sanctum Orbit */}
          <circle
            cx="300"
            cy="300"
            r="85"
            stroke={accentTint}
            strokeWidth="1.6"
            strokeDasharray="3 5"
            opacity="0.75"
          />

          {/* Core Bindu Ring */}
          <circle
            cx="300"
            cy="300"
            r="42"
            stroke={accentTint}
            strokeWidth="1.4"
            strokeDasharray="2 4"
            opacity="0.65"
          />

          {/* Tertiary Outer Orbital Ring */}
          {orbitCount >= 3 && (
            <g className="orbit-ring-tertiary">
              <circle
                cx="300"
                cy="300"
                r="268"
                stroke={accentTint}
                strokeWidth="1.4"
                strokeDasharray="8 14"
                opacity="0.6"
              />
              <circle cx="110" cy="300" r="3.6" fill={accentTint} opacity="0.8" />
              <circle cx="490" cy="300" r="3.2" fill={accentTint} opacity="0.75" />
            </g>
          )}

          {/* Ambient Celestial Particles drifting smoothly */}
          {particles.map((p) => (
            <circle
              key={p.id}
              className="celestial-particle"
              cx={p.cx}
              cy={p.cy}
              r={p.r * 1.8}
              fill={accentTint}
              opacity="0.85"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
