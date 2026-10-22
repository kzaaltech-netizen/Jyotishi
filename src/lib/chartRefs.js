// Finds chart references (houses, planets) inside an answer so the UI can
// turn them into buttons and light up the matching part of the chart.

const ORDINALS = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6,
  seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
};
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PATTERN = new RegExp(
  [
    '\\b(1[0-2]|[1-9])(?:st|nd|rd|th)\\s+(?:house|bhava)\\b',
    `\\b(${Object.keys(ORDINALS).join('|')})\\s+(?:house|bhava)\\b`,
    '\\b(?:house|bhava)\\s+(1[0-2]|[1-9])\\b',
    '\\b(lagna|ascendant)\\b',
    `\\b(${PLANETS.join('|')})\\b`,
  ].join('|'),
  'gi'
);

function toRef(match) {
  const [text, numA, word, numB, lagna, planet] = match;
  if (numA || numB) return { type: 'house', house: Number(numA || numB), text };
  if (word) return { type: 'house', house: ORDINALS[word.toLowerCase()], text };
  if (lagna) return { type: 'house', house: 1, text };
  if (planet) {
    // Only capitalised planet names count; "sun" in prose is usually not the graha.
    if (planet[0] !== planet[0].toUpperCase()) return null;
    return { type: 'planet', planet: planet[0].toUpperCase() + planet.slice(1).toLowerCase(), text };
  }
  return null;
}

// "Venus in the 7th house" -> ['', {planet}, ' in the ', {house}, '']
export function splitChartRefs(text) {
  if (!text) return [];
  const parts = [];
  let last = 0;
  for (const m of String(text).matchAll(PATTERN)) {
    const ref = toRef(m);
    if (!ref) continue;
    parts.push(text.slice(last, m.index));
    parts.push(ref);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

// The first house and planet an answer talks about — what the chart should show.
export function primaryFocus(text, evidence = []) {
  const corpus = [text, ...evidence.map((e) => `${e.label || ''} ${e.value || ''}`)].join(' ');
  let house = null;
  let planet = null;
  for (const part of splitChartRefs(corpus)) {
    if (typeof part === 'string') continue;
    if (part.type === 'house' && house == null) house = part.house;
    if (part.type === 'planet' && planet == null) planet = part.planet;
    if (house != null && planet != null) break;
  }
  return { house, planet };
}
