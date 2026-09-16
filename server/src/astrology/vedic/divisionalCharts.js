import { ZODIAC_SIGNS, PLANET_ABBR, PLANET_COLORS } from '../constants/astrologyConstants.js';
import { buildHouses } from './houses.js';

/**
 * Calculate D9 Navamsha sign for a planet longitude.
 * Each rashi (30°) is divided into 9 padas of 3° 20' (3.3333°).
 * Aries, Leo, Sagittarius (Fiery signs): start counting from Aries.
 * Taurus, Virgo, Capricorn (Earthy signs): start counting from Capricorn.
 * Gemini, Libra, Aquarius (Airy signs): start counting from Libra.
 * Cancer, Scorpio, Pisces (Watery signs): start counting from Cancer.
 */
export function calculateNavamshaSignIdx(longitude) {
  const norm = (longitude % 360 + 360) % 360;
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  const pada = Math.floor(degInSign / (30 / 9)); // 0..8

  const elementStartMap = {
    0: 0,  // Fiery (Aries) -> starts Aries (0)
    1: 9,  // Earthy (Taurus) -> starts Capricorn (9)
    2: 6,  // Airy (Gemini) -> starts Libra (6)
    3: 3,  // Watery (Cancer) -> starts Cancer (3)
  };
  const startSign = elementStartMap[signIdx % 4];
  return (startSign + pada) % 12;
}

/**
 * Calculate D10 Dashamsha sign for a planet longitude.
 * Even signs: start from 9th sign from rashi.
 * Odd signs: start from same rashi.
 */
export function calculateDashamshaSignIdx(longitude) {
  const norm = (longitude % 360 + 360) % 360;
  const signIdx = Math.floor(norm / 30); // 0..11
  const degInSign = norm % 30;
  const part = Math.floor(degInSign / 3); // 10 parts of 3° each (0..9)

  const isOdd = (signIdx + 1) % 2 !== 0;
  const startSign = isOdd ? signIdx : (signIdx + 8) % 12;
  return (startSign + part) % 12;
}

/**
 * Build D9 Navamsha or D10 Dashamsha chart object from D1 planets & Lagna.
 */
export function buildDivisionalChart(divKey, d1Planets, d1LagnaSignIdx) {
  const calculatorMap = {
    d9: calculateNavamshaSignIdx,
    d10: calculateDashamshaSignIdx,
  };
  const calcFn = calculatorMap[divKey] || calculateNavamshaSignIdx;

  const lagnaLon = d1LagnaSignIdx * 30 + 15; // approximation if exact lon unavailable
  const lagnaDivSignIdx = calcFn(lagnaLon);

  const planets = d1Planets.map(p => {
    const divSignIdx = calcFn(p.lon);
    const sign = ZODIAC_SIGNS[divSignIdx];
    const house = ((divSignIdx - lagnaDivSignIdx + 12) % 12) + 1;
    return {
      name: p.name,
      abbr: PLANET_ABBR[p.name] || p.name.slice(0, 2),
      lon: p.lon,
      sign,
      signIdx: divSignIdx,
      house,
      deg: (p.lon % 3.333).toFixed(1),
      color: PLANET_COLORS[p.name] || '#ffffff',
    };
  });

  const houses = buildHouses(planets, lagnaDivSignIdx);

  return {
    type: divKey,
    source: 'swiss-ephemeris',
    lagnaSign: ZODIAC_SIGNS[lagnaDivSignIdx],
    lagnaSignIdx: lagnaDivSignIdx,
    planets,
    houses,
    generatedAt: new Date().toISOString(),
  };
}
