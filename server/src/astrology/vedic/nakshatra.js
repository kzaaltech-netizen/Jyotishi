import { NAKSHATRAS } from '../constants/astrologyConstants.js';

export function getNakshatra(longitude) {
  const normLon = (longitude % 360 + 360) % 360;
  const nakSpan = 360 / 27; // 13.3333 degrees per nakshatra
  const padaSpan = nakSpan / 4; // 3.3333 degrees per pada

  const index = Math.floor(normLon / nakSpan);
  const nakObj = NAKSHATRAS[index] || NAKSHATRAS[0];

  const lonInNak = normLon % nakSpan;
  const pada = Math.floor(lonInNak / padaSpan) + 1;

  return {
    name: nakObj.name,
    index,
    pada,
    lord: nakObj.lord,
    deity: nakObj.deity,
    years: nakObj.years,
    longitude: parseFloat(normLon.toFixed(2)),
  };
}
