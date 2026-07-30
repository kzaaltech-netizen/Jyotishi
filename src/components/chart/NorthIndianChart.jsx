import React, { useState } from 'react';
import './NorthIndianChart.css';

// North Indian chart: 12 triangular houses in diamond pattern
// House 1 = top-center diamond, going clockwise

const HOUSE_POSITIONS = [
  // [cx, cy, label pos x, label pos y] for each house 1-12
  { cx: 200, cy: 108, lx: 200, ly: 95 },   // H1  - top center diamond
  { cx: 120, cy: 80,  lx: 108, ly: 68 },   // H2  - top left triangle
  { cx: 80,  cy: 150, lx: 56,  ly: 145 },  // H3  - left top
  { cx: 108, cy: 200, lx: 90,  ly: 200 },  // H4  - left center diamond
  { cx: 80,  cy: 250, lx: 56,  ly: 255 },  // H5  - left bottom
  { cx: 120, cy: 320, lx: 108, ly: 332 },  // H6  - bottom left triangle
  { cx: 200, cy: 292, lx: 200, ly: 305 },  // H7  - bottom center diamond
  { cx: 280, cy: 320, lx: 292, ly: 332 },  // H8  - bottom right triangle
  { cx: 320, cy: 250, lx: 344, ly: 255 },  // H9  - right bottom
  { cx: 292, cy: 200, lx: 310, ly: 200 },  // H10 - right center diamond
  { cx: 320, cy: 150, lx: 344, ly: 145 },  // H11 - right top
  { cx: 280, cy: 80,  lx: 292, ly: 68 },   // H12 - top right triangle
];

// North Indian chart SVG paths for the 12 house regions
const HOUSE_PATHS = [
  'M200,10 L310,110 L200,200 L90,110 Z',   // H1
  'M90,110 L200,10 L10,10 L10,200 Z',       // H2
  'M10,10 L200,10 L90,110 L10,200 Z',       // H3 (same as above, reorder)
  'M10,200 L90,110 L200,200 L90,290 Z',     // H4
  'M10,200 L10,390 L200,390 L90,290 Z',     // H5
  'M10,390 L200,390 L90,290 L200,390 Z',    // H6
  'M90,290 L200,390 L310,290 L200,200 Z',   // H7
  'M310,290 L200,390 L390,390 L390,200 Z',  // H8
  'M390,390 L390,200 L310,290 L200,390 Z',  // H9
  'M390,200 L310,110 L200,200 L310,290 Z',  // H10
  'M390,200 L390,10 L200,10 L310,110 Z',    // H11
  'M200,10 L390,10 L310,110 L200,200 Z',    // H12
];

// Corrected properly-defined house paths
const HOUSE_CLIPS = [
  // H1  top diamond
  [[200,10],[310,110],[200,200],[90,110]],
  // H2  top-left triangle
  [[90,110],[200,10],[10,10],[10,200]],
  // H3  left-top triangle
  [[10,10],[200,10],[90,110],[10,200]],
  // H4  left diamond
  [[10,200],[90,110],[200,200],[90,290]],
  // H5  left-bottom
  [[10,200],[10,390],[90,290],[90,110]],
  // H6  bottom-left
  [[10,390],[200,390],[90,290],[10,200]],
  // H7  bottom diamond
  [[200,390],[310,290],[200,200],[90,290]],
  // H8  bottom-right
  [[390,390],[390,200],[310,290],[200,390]],
  // H9  right-bottom
  [[310,290],[390,200],[390,390],[200,390]],
  // H10 right diamond
  [[390,200],[310,110],[200,200],[310,290]],
  // H11 right-top
  [[390,10],[390,200],[310,110],[200,10]],
  // H12 top-right
  [[200,10],[310,110],[390,10]],
];

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';
}

export default function NorthIndianChart({ chartData, compact = false }) {
  const [hoveredHouse, setHoveredHouse] = useState(null);
  const size = compact ? 280 : 400;
  const scale = size / 400;

  if (!chartData) return <div className="chart-placeholder" style={{ width: size, height: size }}>
    <span className="material-symbols-outlined">hourglass_empty</span>
  </div>;

  const { houses, lagnaSign, lagnaSignIdx } = chartData;

  // House paths with correct regions
  const houseDefs = [
    // [polygon points] for each house 1-12 (North Indian fixed layout)
    [[200,10],[310,110],[200,200],[90,110]],  // H1
    [[10,10],[200,10],[90,110],[10,110]],     // H2 (corner)
    [[10,10],[90,110],[10,200]],              // H3
    [[10,110],[90,110],[200,200],[90,290],[10,200]],  // H4 with adjust
    [[10,200],[90,290],[10,390]],             // H5
    [[10,390],[90,290],[200,390]],            // H6 (corner)
    [[90,290],[200,200],[310,290],[200,390]], // H7
    [[310,290],[390,390],[200,390]],          // H8 (corner)
    [[310,290],[390,200],[390,390]],          // H9
    [[310,110],[390,200],[310,290],[200,200]],// H10 (right mid)
    [[390,10],[390,200],[310,110]],           // H11
    [[200,10],[390,10],[310,110]],            // H12 (corner)
  ];

  // Exact North Indian chart polygon layout
  const HOUSES_SVG = [
    { id: 1,  pts: [[200,10],[310,110],[200,200],[90,110]],             text: [200,130] },
    { id: 2,  pts: [[10,10],[200,10],[90,110],[10,110]],                text: [75,65]  },
    { id: 3,  pts: [[10,10],[90,110],[10,200],[10,110]],                text: [36,148] },
    { id: 4,  pts: [[10,110],[90,110],[200,200],[90,290],[10,290],[10,200]],text:[85,200]},
    { id: 5,  pts: [[10,290],[10,390],[90,290]],                        text: [36,350] },
    { id: 6,  pts: [[10,390],[200,390],[90,290],[10,290]],              text: [75,335] },
    { id: 7,  pts: [[90,290],[200,200],[310,290],[200,390]],            text: [200,272]},
    { id: 8,  pts: [[310,290],[390,390],[200,390],[90,290]],            text: [325,335]},
    { id: 9,  pts: [[310,290],[390,290],[390,390],[310,390]],           text: [364,350]},
    { id: 10, pts: [[310,110],[390,200],[310,290],[200,200]],           text: [315,200]},
    { id: 11, pts: [[310,110],[390,110],[390,200],[310,200]],           text: [364,150]},
    { id: 12, pts: [[200,10],[390,10],[310,110],[200,110]],             text: [325,65] },
  ];

  return (
    <div className="chart-container" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        width={size}
        height={size}
        className="vedic-chart-svg"
      >
        {/* Outer glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="400" height="400" fill="rgba(17,19,24,0.6)" rx="8"/>

        {/* House regions */}
        {HOUSES_SVG.map(h => {
          const houseData = houses?.find(house => house.number === h.id);
          const isHovered = hoveredHouse === h.id;
          const planets   = houseData?.planets || [];
          const isLagna   = h.id === 1;
          return (
            <g key={h.id}
              onMouseEnter={() => setHoveredHouse(h.id)}
              onMouseLeave={() => setHoveredHouse(null)}
              style={{ cursor: 'pointer' }}
            >
              <polygon
                points={h.pts.map(p => p.join(',')).join(' ')}
                fill={isLagna
                  ? 'rgba(242,202,80,0.07)'
                  : isHovered
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.01)'}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                className="house-polygon"
              />
              {/* House number */}
              <text
                x={h.text[0]} y={h.text[1] - 18}
                textAnchor="middle"
                fill="rgba(208,197,175,0.35)"
                fontSize="9"
                fontFamily="Geist, sans-serif"
                fontWeight="600"
              >{h.id}</text>
              {/* Sign */}
              <text
                x={h.text[0]} y={h.text[1] - 6}
                textAnchor="middle"
                fill={isLagna ? 'rgba(242,202,80,0.7)' : 'rgba(208,197,175,0.5)'}
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >{houseData?.sign?.slice(0,3) || ''}</text>

              {/* Planets */}
              {planets.slice(0, 4).map((p, i) => (
                <g key={p.name}>
                  <text
                    x={h.text[0] + (i % 2 === 0 ? -12 : 12)}
                    y={h.text[1] + 8 + Math.floor(i / 2) * 16}
                    textAnchor="middle"
                    fill={p.color}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    filter="url(#glow)"
                    className="planet-glyph"
                  >{p.abbr}</text>
                  <text
                    x={h.text[0] + (i % 2 === 0 ? -12 : 12)}
                    y={h.text[1] + 18 + Math.floor(i / 2) * 16}
                    textAnchor="middle"
                    fill="rgba(208,197,175,0.5)"
                    fontSize="7"
                    fontFamily="Inter, sans-serif"
                  >{p.deg}°</text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Center diagonals */}
        <line x1="10" y1="10" x2="390" y2="390" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <line x1="390" y1="10" x2="10" y2="390" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        {/* Cross lines */}
        <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,6"/>
        <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,6"/>

        {/* Lagna marker — gold triangle top of chart */}
        <text x="200" y="28" textAnchor="middle" fill="#f2ca50" fontSize="9" fontFamily="Geist" fontWeight="700" letterSpacing="1">LAGNA</text>
      </svg>

      {/* Hover tooltip */}
      {hoveredHouse && (
        <div className="house-tooltip">
          <span className="tooltip-house">House {hoveredHouse}</span>
          <span className="tooltip-sign">{houses?.find(h => h.number === hoveredHouse)?.sign}</span>
        </div>
      )}
    </div>
  );
}
