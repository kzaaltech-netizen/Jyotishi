import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import ZodiacWheel from './ZodiacWheel.jsx';
import { usePrefersReducedMotion } from '../../lib/nakshatra/nakshatraUtils.js';

// Sixteen-petal lotus ring (shodashadal) for the Vedic theme.
function LotusRing() {
  const petal = 'M260 30 C 238 80 238 130 260 170 C 282 130 282 80 260 30 Z';
  return (
    <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g className="animate-[spin_260s_linear_infinite]" style={{ transformOrigin: '260px 260px' }}>
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d={petal} transform={`rotate(${i * 22.5} 260 260)`} className="fill-accent/[0.07] stroke-accent/30" strokeWidth="1" />
        ))}
      </g>
      <circle cx="260" cy="260" r="44" className="fill-gold-soft/60 stroke-gold/50" strokeWidth="1" />
      <circle cx="260" cy="260" r="5" className="fill-accent/70" />
    </svg>
  );
}

// Planets on tilted orbits, with a soft aurora behind, for the Cosmic theme.
function Orbits() {
  const still = usePrefersReducedMotion();
  const orbits = [
    { rx: 130, ry: 50, tilt: -18, dur: 38, r: 6, cls: 'fill-accent' },
    { rx: 190, ry: 74, tilt: -18, dur: 62, r: 9, cls: 'fill-gold' },
    { rx: 250, ry: 98, tilt: -18, dur: 95, r: 6, cls: 'fill-[#7fd8cc]' },
  ];
  return (
    <svg viewBox="0 0 520 520" className="pointer-events-none h-full w-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(155 242 161)" stopOpacity="0.9" />
          <stop offset="45%" stopColor="rgb(46 230 197)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(46 230 197)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="260" cy="260" r="70" fill="url(#hero-sun)" />
      <circle cx="260" cy="260" r="14" className="fill-ink/90" />
      {orbits.map((o, i) => (
        <g key={i} transform={`rotate(${o.tilt} 260 260)`}>
          <ellipse cx="260" cy="260" rx={o.rx} ry={o.ry} className="fill-none stroke-accent/40" strokeWidth="1.2" strokeDasharray={i === 1 ? '0' : '3 6'} />
          <circle r={o.r} className={o.cls} cx={still ? 260 + o.rx : undefined} cy={still ? 260 : undefined}>
            {!still && <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={`M ${260 + o.rx} 260 A ${o.rx} ${o.ry} 0 1 1 ${260 - o.rx} 260 A ${o.rx} ${o.ry} 0 1 1 ${260 + o.rx} 260`} />}
          </circle>
        </g>
      ))}
      {[[80, 90], [440, 70], [470, 380], [60, 420], [390, 470], [150, 30]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} className="fill-ink/60" />
      ))}
    </svg>
  );
}

// Decorative art behind the hero card: a lotus mandala by day, planets in orbit by night.
export default function HeroArt({ className = '' }) {
  const { theme } = useApp();
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {theme === 'cosmic' ? (
        <Orbits />
      ) : (
        <div className="relative h-full w-full">
          <LotusRing />
          <ZodiacWheel className="absolute inset-0 h-full w-full" />
        </div>
      )}
    </div>
  );
}
