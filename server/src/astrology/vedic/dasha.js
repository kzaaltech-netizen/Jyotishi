import { NAKSHATRAS, DASHA_ORDER, DASHA_YEARS, DASHA_TOTAL } from '../constants/astrologyConstants.js';

/**
 * Calculate 120-year Vimshottari Mahadasha and Antardasha sequence from Moon longitude.
 */
export function calculateDasha(moonNakshatraIdx, moonLon, birthDateStr) {
  const nakshatraSpan = 360 / 27;
  const fractionElapsed = (moonLon % nakshatraSpan) / nakshatraSpan;

  const nakLord = NAKSHATRAS[moonNakshatraIdx]?.lord || 'Ketu';
  const startIdx = DASHA_ORDER.indexOf(nakLord);

  const firstDashaYears = DASHA_YEARS[nakLord];
  const yearsElapsedInFirst = fractionElapsed * firstDashaYears;

  const birthMs = new Date(birthDateStr).getTime();
  const dashas = [];
  let currentMs = birthMs - yearsElapsedInFirst * 365.25 * 24 * 3600 * 1000;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const startMs = currentMs;
    const endMs = currentMs + years * 365.25 * 24 * 3600 * 1000;
    dashas.push({
      lord,
      planet: lord,
      years,
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
    });
    currentMs = endMs;
  }

  const now = Date.now();
  const currentDasha = dashas.find(d => new Date(d.start).getTime() <= now && new Date(d.end).getTime() >= now) || dashas[0];

  let antardasha = null;
  if (currentDasha) {
    const mdStart = new Date(currentDasha.start).getTime();
    const adStartIdx = DASHA_ORDER.indexOf(currentDasha.lord);
    let adMs = mdStart;
    for (let j = 0; j < 9; j++) {
      const adLord = DASHA_ORDER[(adStartIdx + j) % 9];
      const adYears = (currentDasha.years * DASHA_YEARS[adLord]) / DASHA_TOTAL;
      const adEndMs = adMs + adYears * 365.25 * 24 * 3600 * 1000;
      if (adMs <= now && adEndMs >= now) {
        antardasha = {
          lord: adLord,
          planet: adLord,
          start: new Date(adMs).toISOString(),
          end: new Date(adEndMs).toISOString(),
        };
        break;
      }
      adMs = adEndMs;
    }
  }

  return {
    dashas,
    currentDasha,
    currentMahadasha: currentDasha,
    currentAntardasha: antardasha,
    antardasha,
  };
}

export function dashaRemaining(dasha) {
  if (!dasha) return '';
  const end = new Date(dasha.end).getTime();
  const now = Date.now();
  const msLeft = end - now;
  if (msLeft <= 0) return 'Completed';
  const years = Math.floor(msLeft / (365.25 * 24 * 3600 * 1000));
  const months = Math.floor((msLeft % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
  return `${years}y ${months}m remaining`;
}
