import { ZODIAC_SIGNS, SIGN_ABBR, SIGN_SYMBOLS, EXALTATION, DEBILITATION, OWN_SIGN } from '../constants/astrologyConstants.js';

export function signFromLon(lon) {
  const norm = (lon % 360 + 360) % 360;
  return Math.floor(norm / 30);
}

export function degInSign(lon) {
  const norm = (lon % 360 + 360) % 360;
  return norm % 30;
}

export function formatSignObj(lon) {
  const signIndex = signFromLon(lon);
  const degreeNum = degInSign(lon);
  return {
    signIndex,
    signName: ZODIAC_SIGNS[signIndex],
    signAbbr: SIGN_ABBR[signIndex],
    symbol: SIGN_SYMBOLS[signIndex],
    degree: parseFloat(degreeNum.toFixed(2)),
  };
}

export function getPlanetDignity(planet, signIdx) {
  if (planet === 'Rahu' || planet === 'Ketu') return 'Node';
  if (EXALTATION[planet] === signIdx) return 'Exalted';
  if (DEBILITATION[planet] === signIdx) return 'Debilitated';
  if (OWN_SIGN[planet]?.includes(signIdx)) return 'Own Sign';
  return 'Normal';
}
