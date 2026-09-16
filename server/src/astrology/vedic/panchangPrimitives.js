/**
 * Astronomical primitives required for Vedic Panchang & Muhurat calculations.
 * Computes exact mathematical relationships between sidereal Sun & Moon longitudes.
 */

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
  'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

export const VARA_NAMES = ['Ravivara (Sunday)', 'Somavara (Monday)', 'Mangalavara (Tuesday)', 'Budhavara (Wednesday)', 'Guruvara (Thursday)', 'Shukravara (Friday)', 'Shanivara (Saturday)'];

/**
 * Tithi: Distance between Moon and Sun longitudes divided by 12 degrees.
 * 1 Tithi = 12° of Moon-Sun separation.
 * Returns { tithiIndex: 1..30, paksha: 'Shukla' | 'Krishna', tithiName }
 */
export function calculateTithiPrimitive(sunLon, moonLon) {
  const diff = (moonLon - sunLon + 360) % 360;
  const tithiIndex = Math.floor(diff / 12) + 1; // 1..30
  const paksha = tithiIndex <= 15 ? 'Shukla' : 'Krishna';
  const nameIdx = (tithiIndex - 1) % 15;
  const name = TITHI_NAMES[nameIdx] || 'Pratipada';

  return {
    tithiIndex,
    paksha,
    name: `${paksha} ${name}`,
    angle: parseFloat(diff.toFixed(2)),
  };
}

/**
 * Nitya Yoga: Sum of Sun and Moon sidereal longitudes divided by 13° 20' (13.3333°).
 * Returns { yogaIndex: 1..27, name }
 */
export function calculateYogaPrimitive(sunLon, moonLon) {
  const sum = (sunLon + moonLon) % 360;
  const yogaSpan = 360 / 27;
  const index = Math.floor(sum / yogaSpan);
  return {
    yogaIndex: index + 1,
    name: YOGA_NAMES[index] || 'Vishkambha',
    angle: parseFloat(sum.toFixed(2)),
  };
}

/**
 * Karana: Half of a Tithi = 6 degrees of Moon-Sun separation.
 * Returns { karanaIndex: 1..60, number: 1..11 }
 */
export function calculateKaranaPrimitive(sunLon, moonLon) {
  const diff = (moonLon - sunLon + 360) % 360;
  const karanaIndex = Math.floor(diff / 6) + 1;
  return {
    karanaIndex,
    angle: parseFloat(diff.toFixed(2)),
  };
}

/**
 * Vara (Weekday): Based on UTC / Local Date.
 */
export function calculateVaraPrimitive(date) {
  const day = date.getDay(); // 0 = Sunday
  return {
    dayIndex: day,
    name: VARA_NAMES[day],
  };
}
