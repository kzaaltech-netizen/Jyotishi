import React, { useMemo, useState } from 'react';
import { normalizeChartData } from './chartDataNormalizer.js';
import { layoutPlanetsInSouthBox } from './planetLayoutEngine.js';
import ChartNotice from './ChartNotice.jsx';
import useT from '../../hooks/useT.js';
import { pillClass } from './chartStyles.js';

// Fixed South Indian sign grid (100×100 cells on a 400×400 canvas).
const SIGN_BOXES = [
  { signIdx: 11, sign: 'Pisces', x: 0, y: 0 },
  { signIdx: 0, sign: 'Aries', x: 100, y: 0 },
  { signIdx: 1, sign: 'Taurus', x: 200, y: 0 },
  { signIdx: 2, sign: 'Gemini', x: 300, y: 0 },
  { signIdx: 3, sign: 'Cancer', x: 300, y: 100 },
  { signIdx: 4, sign: 'Leo', x: 300, y: 200 },
  { signIdx: 5, sign: 'Virgo', x: 300, y: 300 },
  { signIdx: 6, sign: 'Libra', x: 200, y: 300 },
  { signIdx: 7, sign: 'Scorpio', x: 100, y: 300 },
  { signIdx: 8, sign: 'Sagittarius', x: 0, y: 300 },
  { signIdx: 9, sign: 'Capricorn', x: 0, y: 200 },
  { signIdx: 10, sign: 'Aquarius', x: 0, y: 100 },
];

export default function SouthIndianChart({
  chartData,
  title: titleProp = null,
  showHeader = true,
  selectedPlanet = null,
  selectedHouse = null,
  focusHouse = null,
  focusPlanet = null,
  onSelectPlanet,
  onSelectHouse,
  className = '',
}) {
  const [hovered, setHovered] = useState(null);
  const normalized = useMemo(() => normalizeChartData(chartData), [chartData]);
  const { t, f, sign, planet: planetName, abbr, code } = useT();
  const title = titleProp || t.chart.south;

  if (!normalized || !normalized.isValid) return <ChartNotice message={normalized?.error} />;

  const { houses, lagna, planets } = normalized;

  return (
    <figure className={`m-0 ${className}`}>
      {showHeader && (
        <figcaption className="mb-3 flex items-center justify-between gap-3">
          <span className="font-display text-base">{title}</span>
          {lagna && <span className="pill num">{f(t.chart.lagnaLabel, { sign: sign(lagna.sign) })} {lagna.deg}°</span>}
        </figcaption>
      )}
      <svg viewBox="0 0 400 400" className="block h-auto w-full select-none" role="img" aria-label={f(t.chart.lagnaIn, { title, sign: sign(lagna.sign) })}>
        <rect x="1" y="1" width="398" height="398" rx="14" className="fill-panel stroke-line" strokeWidth="1.5" />
        <rect x="100" y="100" width="200" height="200" className="fill-panel-2/60 stroke-ink/30" strokeWidth="1" />
        <text x="200" y="192" textAnchor="middle" className="fill-ink font-display text-[15px]">{f(t.chart.lagnaLabel, { sign: sign(lagna.sign) })}</text>
        <text x="200" y="214" textAnchor="middle" className="fill-muted text-[11px]">{t.chart.signsFixed}</text>

        {SIGN_BOXES.map((box) => {
          const house = houses.find((h) => h.signIdx === box.signIdx);
          const num = house?.number || 1;
          const isLagna = lagna.signIdx === box.signIdx;
          const isFocus = focusHouse === num;
          const isSelected = selectedHouse === num;
          const isHover = hovered === box.signIdx;
          const placed = layoutPlanetsInSouthBox(box.x, box.y, planets.filter((p) => p.signIdx === box.signIdx));

          return (
            <g
              key={box.signIdx}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setHovered(box.signIdx)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => house && onSelectHouse?.(house)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && house && onSelectHouse?.(house)}
              tabIndex={onSelectHouse ? 0 : -1}
              role={onSelectHouse ? 'button' : undefined}
              aria-label={`${box.sign}, house ${num}`}
            >
              <rect
                x={box.x}
                y={box.y}
                width="100"
                height="100"
                className={
                  isFocus
                    ? 'fill-accent/15 stroke-accent'
                    : isSelected
                    ? 'fill-gold/20 stroke-gold'
                    : isLagna
                    ? 'fill-gold-soft stroke-ink/30'
                    : isHover
                    ? 'fill-panel-2 stroke-ink/30'
                    : 'fill-transparent stroke-ink/30'
                }
                strokeWidth={isFocus || isSelected ? 2.2 : 1}
              />
              {isLagna && <line x1={box.x} y1={box.y} x2={box.x + 26} y2={box.y + 26} className="stroke-gold" strokeWidth="1.5" />}
              <text x={box.x + 50} y={box.y + 16} textAnchor="middle" className={`text-[10.5px] ${isFocus ? 'fill-accent font-bold' : 'fill-muted'}`}>
                {code === 'en' ? box.sign.slice(0, 3) : sign(box.sign)} · {f(t.chart.houseShort, { n: num })}
              </text>
              {placed.map((p) => {
                const active = selectedPlanet?.name === p.name || focusPlanet === p.name;
                return (
                  <g
                    key={p.name}
                    transform={`translate(${p.x}, ${p.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlanet?.(p);
                    }}
                    role={onSelectPlanet ? 'button' : undefined}
                    tabIndex={onSelectPlanet ? 0 : -1}
                    aria-label={f(t.chart.planetInSign, { planet: planetName(p.name), sign: sign(p.sign) })}
                  >
                    <rect x="-19" y="-8.5" width="38" height="17" rx="5" className={pillClass(p, active)} strokeWidth="1" />
                    <text x="0" y="3.5" textAnchor="middle" className={`text-[10px] font-semibold ${active ? 'fill-accent-ink' : 'fill-ink'}`}>
                      {abbr(p)} {p.deg != null ? `${Math.round(parseFloat(p.deg))}°` : ''}
                      {p.isRetrograde ? ' ℞' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
