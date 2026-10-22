import React from 'react';

const RASHIS = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
const C = 260;
// Keep labels readable: flip the ones on the lower half of the wheel.
const upright = (deg) => (deg > 90 && deg < 270 ? deg + 180 : deg);

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

// Rashi wheel with a slowly turning nakshatra ring. Decorative only.
export default function ZodiacWheel({ className = '' }) {
  return (
    <svg viewBox="0 0 520 520" className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <g>
        <circle cx={C} cy={C} r="250" className="fill-none stroke-accent/25" strokeWidth="1" />
        <circle cx={C} cy={C} r="212" className="fill-none stroke-accent/25" strokeWidth="1" />
        {RASHIS.map((name, i) => {
          const [x1, y1] = polar(212, i * 30);
          const [x2, y2] = polar(250, i * 30);
          const [tx, ty] = polar(231, i * 30 + 15);
          return (
            <g key={name}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-accent/30" strokeWidth="1" />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" className="fill-muted font-deva text-[13px]" transform={`rotate(${upright(i * 30 + 15)} ${tx} ${ty})`}>
                {name}
              </text>
            </g>
          );
        })}
      </g>
      <g className="animate-[spin_220s_linear_infinite_reverse]" style={{ transformOrigin: '260px 260px' }}>
        <circle cx={C} cy={C} r="190" className="fill-none stroke-gold/30" strokeWidth="1" strokeDasharray="2 6" />
        {Array.from({ length: 27 }, (_, i) => {
          const [x1, y1] = polar(178, (i * 360) / 27);
          const [x2, y2] = polar(190, (i * 360) / 27);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-gold/50" strokeWidth="1.2" />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const [x, y] = polar(150, i * 40 + 12);
          return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.2 : 2.2} className="fill-gold/70" />;
        })}
      </g>
      <circle cx={C} cy={C} r="120" className="fill-accent/[0.06] stroke-accent/15" strokeWidth="1" />
    </svg>
  );
}
