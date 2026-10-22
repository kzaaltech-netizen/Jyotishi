import React, { useMemo } from 'react';
import { getNakshatraData } from '../../lib/nakshatra/nakshatraUtils.js';

// Small SVG drawing of a nakshatra's star pattern, for cards and badges.
export default function ConstellationGlyph({ nakshatra, size = 56, className = '', strokeClass = 'stroke-accent', starClass = 'fill-accent' }) {
  const def = getNakshatraData(nakshatra);
  const box = useMemo(() => {
    const xs = def.stars.map((s) => s.x);
    const ys = def.stars.map((s) => s.y);
    const pad = 40;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - minX + pad;
    const h = Math.max(...ys) - minY + pad;
    const side = Math.max(w, h);
    return `${minX - (side - w) / 2} ${minY - (side - h) / 2} ${side} ${side}`;
  }, [def]);

  return (
    <svg viewBox={box} width={size} height={size} className={className} aria-hidden="true">
      <path d={def.path} fill="none" className={strokeClass} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" opacity="0.55" />
      {def.stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.type === 'bright' ? 16 : s.type === 'secondary' ? 12 : 9} className={starClass} />
      ))}
    </svg>
  );
}
