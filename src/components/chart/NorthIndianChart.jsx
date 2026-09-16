import React, { useState, useMemo } from 'react';
import { normalizeChartData } from './chartDataNormalizer.js';
import { NORTH_INDIAN_HOUSE_METRICS, layoutPlanetsInNorthHouse } from './planetLayoutEngine.js';
import './NorthIndianChart.css';

const DEVANAGARI_NUMS = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२'];

export default function NorthIndianChart({
  chartData,
  compact = false,
  title = "Lagna Chart (D1)",
  selectedPlanet = null,
  selectedHouse = null,
  onSelectPlanet,
  onSelectHouse,
}) {
  const [hoveredHouse, setHoveredHouse] = useState(null);

  // Normalize data using canonical contract
  const normalized = useMemo(() => normalizeChartData(chartData), [chartData]);

  if (!normalized || !normalized.isValid) {
    return (
      <div className="chart-error-card">
        <span className="material-symbols-outlined icon-md text-primary">warning</span>
        <h4 className="font-title-sm text-on-surface mt-1">Astronomical Computation Notice</h4>
        <p className="font-body-xs text-on-surface-variant mt-1">
          {normalized?.error || "Chart coordinates could not be resolved. Please verify birth details."}
        </p>
      </div>
    );
  }

  const { houses, lagna } = normalized;

  return (
    <div className={`north-indian-chart-wrapper ${compact ? 'chart-compact' : ''}`}>
      {/* Chart Header Strip */}
      <div className="chart-header-strip">
        <div className="chart-header-left">
          <span className="chart-header-dot"></span>
          <span className="chart-header-title">{title}</span>
        </div>
        {lagna && (
          <div className="chart-header-right">
            <span className="chart-lagna-badge">
              Lagna: {lagna.sign} {lagna.deg}°
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div className="chart-svg-container">
        <svg
          viewBox="0 0 400 400"
          className="north-indian-svg"
          fill="none"
          role="img"
          aria-label={`${title} - Lagna in ${lagna.sign}`}
        >
          {/* Base Background Fill */}
          <rect x="2" y="2" width="396" height="396" fill="#FFFDF8" stroke="#E2D9C8" strokeWidth="1.5" rx="8" className="chart-svg-base-rect" />

          {/* Outer Border */}
          <rect x="10" y="10" width="380" height="380" stroke="#8B2500" strokeWidth="1.5" fill="none" className="chart-svg-outer-boundary" />

          {/* Diagonal Cross Lines */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="#C8BFAF" strokeWidth="1" className="chart-svg-diagonal-line" />
          <line x1="390" y1="10" x2="10" y2="390" stroke="#C8BFAF" strokeWidth="1" className="chart-svg-diagonal-line" />

          {/* Central Inscribed Diamond */}
          <polygon points="200,10 390,200 200,390 10,200" stroke="#8B2500" strokeWidth="1.5" fill="none" className="chart-svg-diamond" />

          {/* 1st House (Lagna) Subtle Amber Tint */}
          <polygon points="200,10 295,105 200,200 105,105" fill="#FEF3C7" fillOpacity="0.45" stroke="none" className="chart-svg-lagna-tint" />

          {/* Central Astrological Bindu */}
          <circle cx="200" cy="200" r="3" fill="#8B2500" className="chart-svg-bindu-dot" />

          {/* House Regions & Interactive Overlay */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
            const metrics = NORTH_INDIAN_HOUSE_METRICS[houseNum];
            const houseData = houses.find((h) => h.number === houseNum);
            const isHovered = hoveredHouse === houseNum;
            const isSelected = selectedHouse === houseNum;
            const rashiNum = houseData?.signNum || 1;
            const rashiDevanagari = DEVANAGARI_NUMS[rashiNum - 1] || rashiNum;
            const positionedPlanets = layoutPlanetsInNorthHouse(houseNum, houseData?.planets || []);

            return (
              <g
                key={houseNum}
                className={`house-svg-group ${isHovered ? 'house-hovered' : ''} ${isSelected ? 'house-selected' : ''}`}
                onMouseEnter={() => setHoveredHouse(houseNum)}
                onMouseLeave={() => setHoveredHouse(null)}
                onClick={() => {
                  if (onSelectHouse) onSelectHouse(houseData);
                }}
                tabIndex="0"
                role="button"
                aria-label={`House ${houseNum}, ${houseData?.sign}`}
              >
                {/* Clickable House Polygon Backdrop for Hover and Focus */}
                <polygon
                  points={metrics.poly}
                  className="house-poly-backdrop"
                  fill={isSelected ? 'rgba(212, 175, 55, 0.22)' : isHovered ? 'rgba(254, 243, 199, 0.4)' : 'transparent'}
                />

                {/* Rashi / Sign Number inside House */}
                <text
                  x={metrics.rashiPos[0]}
                  y={metrics.rashiPos[1]}
                  textAnchor="middle"
                  className={`house-rashi-text ${houseNum === 1 ? 'rashi-lagna-text' : ''}`}
                >
                  {rashiDevanagari} ({rashiNum})
                </text>

                {/* Planet Badges inside House (Computed by PlanetLayoutEngine) */}
                {positionedPlanets.map((p) => {
                  const isPlanetSelected = selectedPlanet?.name === p.name;
                  const isExalted = p.dignity === 'Exalted';
                  const isDebilitated = p.dignity === 'Debilitated';
                  const isOwn = p.dignity === 'Own Sign';

                  return (
                    <g
                      key={p.name}
                      className={`planet-svg-item ${isPlanetSelected ? 'planet-selected' : ''}`}
                      transform={`translate(${p.x}, ${p.y})`}
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering house click
                        if (onSelectPlanet) onSelectPlanet(p);
                      }}
                      role="button"
                      tabIndex="0"
                      aria-label={`${p.name} in ${p.sign}, House ${houseNum}`}
                    >
                      {/* Pill Background Badge */}
                      <rect
                        x="-19"
                        y="-9"
                        width="38"
                        height="18"
                        rx="4"
                        className={`planet-pill-rect ${isExalted ? 'pill-rect-exalted' : isDebilitated ? 'pill-rect-debilitated' : isOwn ? 'pill-rect-own' : ''}`}
                      />
                      {/* Planet Abbr + Deg Text */}
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        className="planet-label-text"
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

      {/* Footer Detail Bar */}
      <div className="chart-footer-strip">
        <span className="footer-legend-item">
          <span className="legend-dot exalted"></span> Exalted (उच्च)
        </span>
        <span className="legend-dot-sep">•</span>
        <span className="footer-legend-item">
          <span className="legend-dot own"></span> Own Sign (स्वक्षेत्री)
        </span>
        <span className="legend-dot-sep">•</span>
        <span className="footer-legend-item">
          <span className="legend-dot retro"></span> ℞ Retrograde (वक्री)
        </span>
      </div>
    </div>
  );
}
