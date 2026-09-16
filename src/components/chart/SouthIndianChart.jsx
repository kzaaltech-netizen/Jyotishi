import React, { useState, useMemo } from 'react';
import { normalizeChartData } from './chartDataNormalizer.js';
import { layoutPlanetsInSouthBox } from './planetLayoutEngine.js';
import './SouthIndianChart.css';

// Fixed South Indian Zodiac Cell Coordinates (100x100 per box on 400x400 canvas)
const SOUTH_INDIAN_SIGN_BOXES = [
  { signIdx: 11, sign: 'Pisces',      sanskrit: 'मीन',   x: 0,   y: 0 },
  { signIdx: 0,  sign: 'Aries',       sanskrit: 'मेष',   x: 100, y: 0 },
  { signIdx: 1,  sign: 'Taurus',      sanskrit: 'वृषभ',  x: 200, y: 0 },
  { signIdx: 2,  sign: 'Gemini',      sanskrit: 'मिथुन', x: 300, y: 0 },
  { signIdx: 3,  sign: 'Cancer',      sanskrit: 'कर्क',   x: 300, y: 100 },
  { signIdx: 4,  sign: 'Leo',         sanskrit: 'सिंह',  x: 300, y: 200 },
  { signIdx: 5,  sign: 'Virgo',       sanskrit: 'कन्या', x: 300, y: 300 },
  { signIdx: 6,  sign: 'Libra',       sanskrit: 'तुला',  x: 200, y: 300 },
  { signIdx: 7,  sign: 'Scorpio',     sanskrit: 'वृश्चिक',x: 100, y: 300 },
  { signIdx: 8,  sign: 'Sagittarius', sanskrit: 'धनु',   x: 0,   y: 300 },
  { signIdx: 9,  sign: 'Capricorn',   sanskrit: 'मकर',   x: 0,   y: 200 },
  { signIdx: 10, sign: 'Aquarius',    sanskrit: 'कुम्भ', x: 0,   y: 100 },
];

export default function SouthIndianChart({
  chartData,
  compact = false,
  title = "South Indian Chart (दक्षिण कुण्डली)",
  selectedPlanet = null,
  selectedHouse = null,
  onSelectPlanet,
  onSelectHouse,
}) {
  const [hoveredSign, setHoveredSign] = useState(null);

  const normalized = useMemo(() => normalizeChartData(chartData), [chartData]);

  if (!normalized || !normalized.isValid) {
    return (
      <div className="chart-error-card">
        <span className="material-symbols-outlined icon-md text-primary">warning</span>
        <h4 className="font-title-sm text-on-surface mt-1">Chart Notice</h4>
        <p className="font-body-xs text-on-surface-variant mt-1">
          {normalized?.error || "Chart coordinates could not be resolved."}
        </p>
      </div>
    );
  }

  const { houses, lagna, planets } = normalized;

  return (
    <div className={`south-indian-chart-wrapper ${compact ? 'chart-compact' : ''}`}>
      {/* Header Strip */}
      <div className="chart-header-strip">
        <div className="chart-header-left">
          <span className="chart-header-dot gold-dot"></span>
          <span className="chart-header-title">{title}</span>
        </div>
        {lagna && (
          <span className="chart-lagna-badge">
            Lagna: {lagna.sign} {lagna.deg}°
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="chart-svg-container">
        <svg
          viewBox="0 0 400 400"
          className="south-indian-svg"
          fill="none"
          role="img"
          aria-label={`${title} - Lagna in ${lagna.sign}`}
        >
          {/* Base Background */}
          <rect x="2" y="2" width="396" height="396" fill="#FFFDF8" stroke="#E2D9C8" strokeWidth="1.5" rx="8" className="chart-svg-base-rect" />

          {/* Outer Border */}
          <rect x="10" y="10" width="380" height="380" stroke="#8B2500" strokeWidth="1.5" fill="none" className="chart-svg-outer-boundary" />

          {/* Central 200x200 Hub */}
          <rect x="100" y="100" width="200" height="200" fill="#FAF6EE" stroke="#8B2500" strokeWidth="1.5" className="chart-svg-hub-box" />

          {/* Central Information Stamp */}
          <g className="south-chart-center-hub">
            <circle cx="200" cy="170" r="28" fill="#FFFDF8" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3,2" className="chart-svg-hub-circle" />
            <text x="200" y="176" textAnchor="middle" fill="#8B2500" fontSize="18" fontWeight="bold" className="chart-svg-hub-om">॥ ॐ ॥</text>
            <text x="200" y="214" textAnchor="middle" fill="#1F1610" fontSize="12" fontWeight="700" fontFamily="var(--font-headline, serif)" className="chart-svg-hub-title">
              दक्षिण भारतीय चक्र
            </text>
            <text x="200" y="230" textAnchor="middle" fill="#8B2500" fontSize="11" fontWeight="600" className="chart-svg-hub-lagna">
              {lagna.sign} Lagna ({lagna.deg}°)
            </text>
            <text x="200" y="246" textAnchor="middle" fill="#796E65" fontSize="10" className="chart-svg-hub-sub">
              Fixed Signs • Clockwise Order
            </text>
          </g>

          {/* 12 Fixed Sign Boxes */}
          {SOUTH_INDIAN_SIGN_BOXES.map((box) => {
            const isLagnaSign = lagna.signIdx === box.signIdx;
            const house = houses.find((h) => h.signIdx === box.signIdx);
            const houseNum = house?.number || 1;
            const isHovered = hoveredSign === box.signIdx;
            const isSelected = selectedHouse === houseNum;
            const boxPlanets = planets.filter((p) => p.signIdx === box.signIdx);
            const positionedPlanets = layoutPlanetsInSouthBox(box.x, box.y, boxPlanets);

            return (
              <g
                key={box.signIdx}
                className={`south-box-group ${isLagnaSign ? 'box-lagna' : ''} ${isSelected ? 'box-selected' : ''}`}
                onMouseEnter={() => setHoveredSign(box.signIdx)}
                onMouseLeave={() => setHoveredSign(null)}
                onClick={() => {
                  if (onSelectHouse && house) onSelectHouse(house);
                }}
                tabIndex="0"
                role="button"
                aria-label={`${box.sign} - House ${houseNum}`}
              >
                {/* Box Rectangle */}
                <rect
                  x={box.x}
                  y={box.y}
                  width="100"
                  height="100"
                  stroke="#C8BFAF"
                  strokeWidth="1"
                  fill={isLagnaSign ? '#FEF3C7' : isSelected ? '#FDF6B2' : isHovered ? '#FAF6EE' : '#FFFDF8'}
                  className="south-box-rect"
                />

                {/* Classic Lagna Corner Slash for South Indian chart */}
                {isLagnaSign && (
                  <>
                    <line x1={box.x} y1={box.y} x2={box.x + 32} y2={box.y + 32} stroke="#8B2500" strokeWidth="1.5" />
                    <rect x={box.x + 4} y={box.y + 4} width="28" height="14" rx="3" fill="#8B2500" />
                    <text x={box.x + 18} y={box.y + 14} textAnchor="middle" fill="#FFFFFF" fontSize="8.5" fontWeight="800">
                      ASC
                    </text>
                  </>
                )}

                {/* Sign Label Header */}
                <text
                  x={isLagnaSign ? box.x + 62 : box.x + 50}
                  y={box.y + 16}
                  textAnchor="middle"
                  className="south-sign-title"
                >
                  {box.sanskrit} (H{houseNum})
                </text>

                {/* Planets inside Box */}
                {positionedPlanets.map((p) => {
                  const isPlanetSelected = selectedPlanet?.name === p.name;
                  const isExalted = p.dignity === 'Exalted';
                  const isDebilitated = p.dignity === 'Debilitated';
                  const isOwn = p.dignity === 'Own Sign';

                  return (
                    <g
                      key={p.name}
                      transform={`translate(${p.x}, ${p.y})`}
                      className={`south-planet-pill ${isPlanetSelected ? 'planet-selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPlanet) onSelectPlanet(p);
                      }}
                      tabIndex="0"
                      role="button"
                    >
                      <rect
                        x="-18"
                        y="-8"
                        width="36"
                        height="16"
                        rx="3"
                        className={`south-pill-rect ${isExalted ? 'pill-rect-exalted' : isDebilitated ? 'pill-rect-debilitated' : isOwn ? 'pill-rect-own' : ''}`}
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        className="south-planet-text"
                      >
                        {p.sanskritAbbr || p.abbr} {p.deg != null ? `${Math.round(parseFloat(p.deg))}°` : ''} {p.isRetrograde ? '℞' : ''}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Legend */}
      <div className="chart-footer-strip">
        <span className="footer-legend-item">
          <span className="legend-dot asc-dot"></span> ASC: Ascendant (लग्न)
        </span>
        <span className="legend-dot-sep">•</span>
        <span className="footer-legend-item">
          <span className="legend-dot exalted"></span> Exalted
        </span>
        <span className="legend-dot-sep">•</span>
        <span className="footer-legend-item">
          <span className="legend-dot own"></span> Own Sign
        </span>
      </div>
    </div>
  );
}
