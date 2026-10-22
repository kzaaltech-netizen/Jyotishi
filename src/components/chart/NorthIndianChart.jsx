import React, { useMemo, useState } from 'react';
import { m } from 'motion/react';
import { normalizeChartData } from './chartDataNormalizer.js';
import { NORTH_INDIAN_HOUSE_METRICS, layoutPlanetsInNorthHouse } from './planetLayoutEngine.js';
import ChartNotice from './ChartNotice.jsx';
import useT from '../../hooks/useT.js';
import { pillClass } from './chartStyles.js';

// North Indian diamond chart. `focusHouse` / `focusPlanet` highlight what the
// conversation is currently talking about; `selected*` mark user clicks.
export default function NorthIndianChart({
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
  const title = titleProp || t.chart.d1;

  if (!normalized || !normalized.isValid) return <ChartNotice message={normalized?.error} />;

  const { houses, lagna } = normalized;

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
        <rect x="12" y="12" width="376" height="376" className="fill-none stroke-ink/40" strokeWidth="1.2" />
        <line x1="12" y1="12" x2="388" y2="388" className="stroke-ink/25" strokeWidth="1" />
        <line x1="388" y1="12" x2="12" y2="388" className="stroke-ink/25" strokeWidth="1" />
        <polygon points="200,12 388,200 200,388 12,200" className="fill-none stroke-ink/40" strokeWidth="1.2" />
        <polygon points="200,10 295,105 200,200 105,105" className="fill-gold-soft" opacity="0.7" />

        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
          const metrics = NORTH_INDIAN_HOUSE_METRICS[num];
          const house = houses.find((h) => h.number === num);
          const isFocus = focusHouse === num;
          const isSelected = selectedHouse === num;
          const isHover = hovered === num;
          const placed = layoutPlanetsInNorthHouse(num, house?.planets || []);

          return (
            <g
              key={num}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setHovered(num)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectHouse?.(house)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHouse?.(house)}
              tabIndex={onSelectHouse ? 0 : -1}
              role={onSelectHouse ? 'button' : undefined}
              aria-label={`House ${num}, ${house?.sign || ''}`}
            >
              <polygon
                points={metrics.poly}
                className={
                  isFocus
                    ? 'fill-accent/15 stroke-accent'
                    : isSelected
                    ? 'fill-gold/20 stroke-gold'
                    : isHover
                    ? 'fill-panel-2 stroke-transparent'
                    : 'fill-transparent stroke-transparent'
                }
                strokeWidth={isFocus || isSelected ? 2.2 : 0}
              />
              {isFocus && (
                <m.polygon
                  points={metrics.poly}
                  className="fill-none stroke-accent"
                  strokeWidth="2"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: [0.9, 0.2, 0.9] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <text
                x={metrics.rashiPos[0]}
                y={metrics.rashiPos[1]}
                textAnchor="middle"
                className={`text-[11px] ${isFocus ? 'fill-accent font-bold' : num === 1 ? 'fill-gold font-bold' : 'fill-muted'}`}
              >
                {house?.signNum || ''}
              </text>

              {placed.map((p) => {
                const active = selectedPlanet?.name === p.name || focusPlanet === p.name;
                return (
                  <g
                    key={p.name}
                    transform={`translate(${p.x}, ${p.y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlanet?.(p);
                    }}
                    role={onSelectPlanet ? 'button' : undefined}
                    tabIndex={onSelectPlanet ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        onSelectPlanet?.(p);
                      }
                    }}
                    aria-label={f(t.chart.planetIn, { planet: planetName(p.name), sign: sign(p.sign), n: num })}
                  >
                    <rect x="-20" y="-9.5" width="40" height="19" rx="6" className={pillClass(p, active)} strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" className={`text-[10.5px] font-semibold ${active ? 'fill-accent-ink' : 'fill-ink'}`}>
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
