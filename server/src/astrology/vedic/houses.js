import { ZODIAC_SIGNS, SIGN_LORDS } from '../constants/astrologyConstants.js';

/**
 * Calculate Whole Sign house placement for a planet sign relative to Lagna sign.
 * Lagna sign is House 1.
 */
export function getHouse(planetSignIdx, lagnaSignIdx) {
  return ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
}

/**
 * Build 12 house objects mapping occupied rashi and planets.
 */
export function buildHouses(planets, lagnaSignIdx) {
  return Array.from({ length: 12 }, (_, i) => {
    const signIdx = (lagnaSignIdx + i) % 12;
    const sign = ZODIAC_SIGNS[signIdx];
    return {
      number: i + 1,
      signIdx,
      signNum: signIdx + 1, // Standardized 1..12 rashi number for UI chart rendering!
      sign,
      lord: SIGN_LORDS[sign] || '',
      planets: planets.filter(p => p.house === i + 1),
    };
  });
}

/**
 * Compute Vedic life domain strengths (0..100) based on planetary house placements & dignities.
 */
export function computeStrengths(planets) {
  const scores = { career: 0, wealth: 0, abundance: 0, union: 0 };
  planets.forEach(p => {
    const h = p.house;
    const d = p.dignity;
    const mult = d === 'Exalted' ? 1.5 : (d === 'Debilitated' ? 0.5 : 1);
    if ([10, 6, 1].includes(h)) scores.career += (p.name === 'Saturn' || p.name === 'Sun') ? 15 * mult : 8 * mult;
    if ([2, 11, 5].includes(h)) scores.wealth += (p.name === 'Jupiter' || p.name === 'Venus') ? 15 * mult : 8 * mult;
    if ([9, 5, 11].includes(h)) scores.abundance += (p.name === 'Jupiter' || p.name === 'Rahu') ? 14 * mult : 7 * mult;
    if ([7, 5, 1].includes(h)) scores.union += (p.name === 'Venus' || p.name === 'Moon') ? 15 * mult : 8 * mult;
  });
  Object.keys(scores).forEach(k => { scores[k] = Math.min(Math.round(scores[k]), 100); });
  return scores;
}
