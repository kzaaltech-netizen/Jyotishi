// ─── Deterministic Planet Layout Engine for Vedic Kundli Charts ─────────────────
// Computes exact collision-free coordinates for 1, 2, 3, 4, 5+ planets inside
// North Indian diamonds/triangles and South Indian grid cells.

export const NORTH_INDIAN_HOUSE_METRICS = {
  1:  { shape: 'diamond',  rashiPos: [200, 52],  center: [200, 120], poly: "200,10 295,105 200,200 105,105" },
  2:  { shape: 'triangle', rashiPos: [105, 36],  center: [105, 70],  poly: "10,10 200,10 105,105" },
  3:  { shape: 'triangle', rashiPos: [36, 105],  center: [70, 105],  poly: "10,10 105,105 10,200" },
  4:  { shape: 'diamond',  rashiPos: [52, 200],  center: [120, 200], poly: "10,200 105,105 200,200 105,295" },
  5:  { shape: 'triangle', rashiPos: [36, 295],  center: [70, 295],  poly: "10,200 105,295 10,390" },
  6:  { shape: 'triangle', rashiPos: [105, 365], center: [105, 330], poly: "10,390 200,390 105,295" },
  7:  { shape: 'diamond',  rashiPos: [200, 350], center: [200, 280], poly: "105,295 200,200 295,295 200,390" },
  8:  { shape: 'triangle', rashiPos: [295, 365], center: [295, 330], poly: "200,390 390,390 295,295" },
  9:  { shape: 'triangle', rashiPos: [365, 295], center: [330, 295], poly: "295,295 390,200 390,390" },
  10: { shape: 'diamond',  rashiPos: [350, 200], center: [280, 200], poly: "200,200 295,105 390,200 295,295" },
  11: { shape: 'triangle', rashiPos: [365, 105], center: [330, 105], poly: "295,105 390,10 390,200" },
  12: { shape: 'triangle', rashiPos: [295, 36],  center: [295, 70],  poly: "200,10 390,10 295,105" },
};

/**
 * Computes deterministic (x, y) coordinates for planets in a North Indian house.
 * Avoids overlapping badges or labels escaping house boundaries.
 *
 * @param {number} houseNumber - 1 to 12
 * @param {Array} planets - Array of planets occupying this house
 * @returns {Array} Array of planets enriched with { x, y, badgeWidth, badgeHeight }
 */
export function layoutPlanetsInNorthHouse(houseNumber, planets = []) {
  if (!planets || planets.length === 0) return [];

  const metrics = NORTH_INDIAN_HOUSE_METRICS[houseNumber] || NORTH_INDIAN_HOUSE_METRICS[1];
  const [cx, cy] = metrics.center;
  const count = planets.length;

  // Single planet: exact center of mass
  if (count === 1) {
    return [{
      ...planets[0],
      x: cx,
      y: cy,
    }];
  }

  // 2 planets: placed with balanced offset
  if (count === 2) {
    if (metrics.shape === 'diamond') {
      // Diamonds have wider horizontal space
      return [
        { ...planets[0], x: cx - 26, y: cy },
        { ...planets[1], x: cx + 26, y: cy },
      ];
    } else {
      // Triangles: vertical stack within center corridor
      return [
        { ...planets[0], x: cx, y: cy - 12 },
        { ...planets[1], x: cx, y: cy + 12 },
      ];
    }
  }

  // 3 planets: triangular pyramid layout
  if (count === 3) {
    return [
      { ...planets[0], x: cx - 22, y: cy - 10 },
      { ...planets[1], x: cx + 22, y: cy - 10 },
      { ...planets[2], x: cx,      y: cy + 14 },
    ];
  }

  // 4 planets: 2x2 grid
  if (count === 4) {
    return [
      { ...planets[0], x: cx - 22, y: cy - 12 },
      { ...planets[1], x: cx + 22, y: cy - 12 },
      { ...planets[2], x: cx - 22, y: cy + 12 },
      { ...planets[3], x: cx + 22, y: cy + 12 },
    ];
  }

  // 5+ planets: 2-column compact staggered layout
  const colOffset = 24;
  const rowSpacing = 16;
  const startY = cy - Math.floor(count / 2) * (rowSpacing / 2);

  return planets.map((p, idx) => {
    const isLeft = idx % 2 === 0;
    const rowIndex = Math.floor(idx / 2);
    const x = isLeft ? cx - colOffset : cx + colOffset;
    const y = startY + rowIndex * rowSpacing;
    return {
      ...p,
      x,
      y,
    };
  });
}

/**
 * Computes deterministic (x, y) coordinates for planets in a South Indian grid cell (width: 100, height: 100).
 *
 * @param {number} boxX - Left X of box (0, 100, 200, 300)
 * @param {number} boxY - Top Y of box (0, 100, 200, 300)
 * @param {Array} planets - Array of planets in this sign box
 * @returns {Array} Array of planets with { x, y }
 */
export function layoutPlanetsInSouthBox(boxX, boxY, planets = []) {
  if (!planets || planets.length === 0) return [];

  // Usable area in cell: x from (boxX + 8) to (boxX + 92), y from (boxY + 28) to (boxY + 92)
  const startX = boxX + 10;
  const startY = boxY + 34;
  const count = planets.length;

  if (count === 1) {
    return [{
      ...planets[0],
      x: boxX + 50,
      y: boxY + 56,
    }];
  }

  if (count === 2) {
    return [
      { ...planets[0], x: boxX + 28, y: boxY + 56 },
      { ...planets[1], x: boxX + 72, y: boxY + 56 },
    ];
  }

  if (count === 3) {
    return [
      { ...planets[0], x: boxX + 28, y: boxY + 46 },
      { ...planets[1], x: boxX + 72, y: boxY + 46 },
      { ...planets[2], x: boxX + 50, y: boxY + 74 },
    ];
  }

  // 4+ planets: 2-column grid
  return planets.map((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? boxX + 26 : boxX + 74;
    const y = startY + row * 18;
    return {
      ...p,
      x,
      y,
    };
  });
}

export const layoutPlanetsInHouse = layoutPlanetsInNorthHouse;
