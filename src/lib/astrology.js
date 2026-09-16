// ─── Vedic Astrology Engine ────────────────────────────────────────────────────
// Pure JS implementation — no external astrology library needed
// All calculations are self-contained for maximum reliability

// ─── Constants ────────────────────────────────────────────────────────────────

export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
export const PLANET_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
export const PLANET_COLORS = {
  Sun: '#f2ca50', Moon: '#ffffff', Mars: '#ff7b7b', Mercury: '#00e4f2',
  Jupiter: '#ffd700', Venus: '#d8b9ff', Saturn: '#a0a0b0', Rahu: '#8b5cf6', Ketu: '#f97316'
};

export const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];
export const SIGN_ABBR = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
export const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', years: 7 },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', years: 20 },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', years: 6 },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma', years: 10 },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', years: 7 },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', years: 18 },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', years: 16 },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', years: 19 },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', years: 17 },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitras', years: 7 },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', years: 20 },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', years: 6 },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitar', years: 10 },
  { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma', years: 7 },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', years: 18 },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni', years: 16 },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', years: 19 },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', years: 17 },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', years: 7 },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', years: 20 },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas', years: 6 },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', years: 10 },
  { name: 'Dhanishtha', lord: 'Mars', deity: 'Ashta Vasus', years: 7 },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', years: 18 },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Ajaikapada', years: 16 },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', years: 19 },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', years: 17 },
];

// Vimshottari Dasha order starting from Ketu
export const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
export const DASHA_TOTAL = 120;

// Lahiri Ayanamsa (mean value used in practice)
export const LAHIRI_AYANAMSA_2000 = 23.853;
export const AYANAMSA_RATE = 0.013997; // degrees per year

// ─── Julian Day Number ─────────────────────────────────────────────────────────
export function toJulianDay(year, month, day, hour = 0) {
  // Meeus algorithm
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5 + hour / 24;
}

// ─── Ayanamsa ─────────────────────────────────────────────────────────────────
export function getAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525; // centuries from J2000
  const yearsSince2000 = T * 100;
  return LAHIRI_AYANAMSA_2000 + (AYANAMSA_RATE * yearsSince2000);
}

// ─── Sun Longitude (approximate) ─────────────────────────────────────────────
function getSunLongitudeTropical(jd) {
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
  return ((lambda % 360) + 360) % 360;
}

// ─── Moon Longitude (approximate) ─────────────────────────────────────────────
function getMoonLongitudeTropical(jd) {
  const n = jd - 2451545.0;
  const L = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
  const M = ((134.963 + 13.064993 * n) % 360 + 360) % 360 * Math.PI / 180;
  const F = ((93.272 + 13.229350 * n) % 360 + 360) % 360 * Math.PI / 180;
  const lambda = L + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * F - M) + 0.658 * Math.sin(2 * F) - 0.214 * Math.sin(2 * M);
  return ((lambda % 360) + 360) % 360;
}

// ─── Planet Longitudes (VSOP87 simplified) ────────────────────────────────────
function getPlanetLongitudesTropical(jd) {
  const T = (jd - 2451545.0) / 36525;
  const planets = {};

  // Mercury
  let L = ((252.2503 + 149474.0722 * T) % 360 + 360) % 360;
  planets.Mercury = L;

  // Venus
  L = ((181.9798 + 58519.2130 * T) % 360 + 360) % 360;
  planets.Venus = L;

  // Mars
  L = ((355.4330 + 19141.6964 * T) % 360 + 360) % 360;
  planets.Mars = L;

  // Jupiter
  L = ((34.3515 + 3036.3027 * T) % 360 + 360) % 360;
  planets.Jupiter = L;

  // Saturn
  L = ((50.0774 + 1223.5110 * T) % 360 + 360) % 360;
  planets.Saturn = L;

  return planets;
}

// ─── Rahu (Mean North Lunar Node) ─────────────────────────────────────────────
function getRahuLongitudeTropical(jd) {
  const T = (jd - 2451545.0) / 36525;
  const omega = ((125.0445 - 1934.1362 * T) % 360 + 360) % 360;
  return omega;
}

// ─── Ascendant / Lagna ────────────────────────────────────────────────────────
export function calculateLagna(jd, lat, lon) {
  const T = (jd - 2451545.0) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const LST = ((GMST + lon) % 360 + 360) % 360; // Local Sidereal Time in degrees
  const latRad = lat * Math.PI / 180;
  const lstRad = LST * Math.PI / 180;
  const eps = (23.4393 - 0.013 * T) * Math.PI / 180;
  const RAMC = LST;
  const MC = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(eps)) * 180 / Math.PI;
  let ASC = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(lstRad))
  ) * 180 / Math.PI;
  if (ASC < 0) ASC += 360;
  return ((ASC + 360) % 360);
}

// ─── Convert to Sidereal ──────────────────────────────────────────────────────
function toSidereal(tropical, ayanamsa) {
  return ((tropical - ayanamsa) % 360 + 360) % 360;
}

// ─── Sign from Longitude ─────────────────────────────────────────────────────
export function signFromLon(lon) {
  return Math.floor(lon / 30);
}
export function degInSign(lon) {
  return lon % 30;
}

// ─── Nakshatra from Moon longitude ───────────────────────────────────────────
export function getNakshatra(moonLon) {
  const idx = Math.floor(moonLon / (360 / 27));
  return { ...NAKSHATRAS[idx], index: idx, longitude: moonLon };
}

// ─── House Number for a planet given Lagna sign ──────────────────────────────
export function getHouse(planetSignIdx, lagnaSignIdx) {
  return ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
}

// ─── Vimshottari Dasha ────────────────────────────────────────────────────────
export function calculateDasha(moonNakshatraIdx, moonLonInNakshatra, birthDate) {
  // Fraction of nakshatra elapsed
  const nakshatraSpan = 360 / 27;
  const fractionElapsed = (moonLonInNakshatra % nakshatraSpan) / nakshatraSpan;
  const nakLord = NAKSHATRAS[moonNakshatraIdx].lord;
  const startIdx = DASHA_ORDER.indexOf(nakLord);

  // Time elapsed in first dasha
  const firstDashaYears = DASHA_YEARS[nakLord];
  const yearsElapsedInFirst = fractionElapsed * firstDashaYears;
  const yearsRemainingInFirst = firstDashaYears - yearsElapsedInFirst;

  const birthMs = new Date(birthDate).getTime();
  const dashas = [];

  // Build dasha sequence
  let currentMs = birthMs - yearsElapsedInFirst * 365.25 * 24 * 3600 * 1000;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = DASHA_YEARS[lord];
    const startMs = currentMs;
    const endMs = currentMs + years * 365.25 * 24 * 3600 * 1000;
    dashas.push({ lord, years, start: new Date(startMs).toISOString(), end: new Date(endMs).toISOString() });
    currentMs = endMs;
  }

  const now = Date.now();
  const currentDasha = dashas.find(d => new Date(d.start).getTime() <= now && new Date(d.end).getTime() >= now);
  const currentDashaIdx = dashas.indexOf(currentDasha);

  // Calculate antardasha within current mahadasha
  let antardasha = null;
  if (currentDasha) {
    const mdStart = new Date(currentDasha.start).getTime();
    const mdDuration = currentDasha.years * 365.25 * 24 * 3600 * 1000;
    const adStartIdx = DASHA_ORDER.indexOf(currentDasha.lord);
    let adMs = mdStart;
    for (let j = 0; j < 9; j++) {
      const adLord = DASHA_ORDER[(adStartIdx + j) % 9];
      const adYears = (currentDasha.years * DASHA_YEARS[adLord]) / DASHA_TOTAL;
      const adEndMs = adMs + adYears * 365.25 * 24 * 3600 * 1000;
      if (adMs <= now && adEndMs >= now) {
        antardasha = { lord: adLord, start: new Date(adMs).toISOString(), end: new Date(adEndMs).toISOString() };
        break;
      }
      adMs = adEndMs;
    }
  }

  return { dashas, currentDasha, antardasha };
}

// ─── Dignity of a planet ──────────────────────────────────────────────────────
const EXALTATION = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const DEBILITATION = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
const OWN_SIGN = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10]
};

export function getPlanetDignity(planet, signIdx) {
  if (planet === 'Rahu' || planet === 'Ketu') return 'Node';
  if (EXALTATION[planet] === signIdx) return 'Exalted';
  if (DEBILITATION[planet] === signIdx) return 'Debilitated';
  if (OWN_SIGN[planet]?.includes(signIdx)) return 'Own Sign';
  return 'Normal';
}

// ─── Chart Strength Scores ────────────────────────────────────────────────────
export function computeStrengths(planets, houses) {
  const scores = { career: 0, wealth: 0, abundance: 0, union: 0 };

  planets.forEach(p => {
    const h = p.house;
    const dignity = p.dignity;
    const mult = dignity === 'Exalted' ? 1.5 : dignity === 'Debilitated' ? 0.5 : 1;

    // Career: 10th, 6th, 1st house + Saturn/Sun
    if ([10, 6, 1].includes(h)) {
      scores.career += (p.name === 'Saturn' || p.name === 'Sun') ? 15 * mult : 8 * mult;
    }
    // Wealth: 2nd, 11th, 5th + Jupiter/Venus
    if ([2, 11, 5].includes(h)) {
      scores.wealth += (p.name === 'Jupiter' || p.name === 'Venus') ? 15 * mult : 8 * mult;
    }
    // Abundance: 9th, 5th, 11th + Jupiter/Rahu
    if ([9, 5, 11].includes(h)) {
      scores.abundance += (p.name === 'Jupiter' || p.name === 'Rahu') ? 14 * mult : 7 * mult;
    }
    // Union: 7th, 5th, 1st + Venus/Moon
    if ([7, 5, 1].includes(h)) {
      scores.union += (p.name === 'Venus' || p.name === 'Moon') ? 15 * mult : 8 * mult;
    }
  });

  // Normalize to 0-100
  const max = 100;
  Object.keys(scores).forEach(k => {
    scores[k] = Math.min(Math.round(scores[k]), max);
  });
  return scores;
}

// ─── Master Chart Generator ───────────────────────────────────────────────────
export function calculateVedicChart(profile) {
  return generateChart(profile);
}

export function generateChart(profile) {
  const { dob, birthTime, lat, lon } = profile;

  // Parse date and time
  const [year, month, day] = dob.split('-').map(Number);
  const [hh, mm] = (birthTime || '12:00').split(':').map(Number);
  const hourUTC = hh + (mm / 60); // Simplified: treating input as UTC-equivalent (timezone offset applied separately)

  const jd = toJulianDay(year, month, day, hourUTC);
  const ayanamsa = getAyanamsa(jd);

  // Get tropical longitudes
  const sunTropical   = getSunLongitudeTropical(jd);
  const moonTropical  = getMoonLongitudeTropical(jd);
  const planetsTrop   = getPlanetLongitudesTropical(jd);
  const rahuTropical  = getRahuLongitudeTropical(jd);
  const lagnaTropical = calculateLagna(jd, lat, lon);

  // Convert to sidereal
  const sunSid    = toSidereal(sunTropical, ayanamsa);
  const moonSid   = toSidereal(moonTropical, ayanamsa);
  const lagnaSid  = toSidereal(lagnaTropical, ayanamsa);
  const rahuSid   = toSidereal(rahuTropical, ayanamsa);
  const ketuSid   = (rahuSid + 180) % 360;

  const lagnaSignIdx = signFromLon(lagnaSid);
  const lagnaSign    = ZODIAC_SIGNS[lagnaSignIdx];
  const lagnaDeg     = degInSign(lagnaSid).toFixed(1);

  // Build planet list
  const rawPlanets = [
    { name: 'Sun',     lon: sunSid },
    { name: 'Moon',    lon: moonSid },
    { name: 'Mars',    lon: toSidereal(planetsTrop.Mars, ayanamsa) },
    { name: 'Mercury', lon: toSidereal(planetsTrop.Mercury, ayanamsa) },
    { name: 'Jupiter', lon: toSidereal(planetsTrop.Jupiter, ayanamsa) },
    { name: 'Venus',   lon: toSidereal(planetsTrop.Venus, ayanamsa) },
    { name: 'Saturn',  lon: toSidereal(planetsTrop.Saturn, ayanamsa) },
    { name: 'Rahu',    lon: rahuSid },
    { name: 'Ketu',    lon: ketuSid },
  ];

  const planets = rawPlanets.map(p => {
    const signIdx = signFromLon(p.lon);
    const house   = getHouse(signIdx, lagnaSignIdx);
    const dignity = getPlanetDignity(p.name, signIdx);
    return {
      ...p,
      abbr:    PLANET_ABBR[p.name],
      sign:    ZODIAC_SIGNS[signIdx],
      signIdx,
      house,
      deg:     degInSign(p.lon).toFixed(1),
      dignity,
      color:   PLANET_COLORS[p.name]
    };
  });

  // Nakshatra for Moon
  const moonPlanet = planets.find(p => p.name === 'Moon');
  const nakshatra  = getNakshatra(moonPlanet.lon);

  // Houses array: for each of 12 houses, which sign occupies it
  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    signIdx: (lagnaSignIdx + i) % 12,
    sign:    ZODIAC_SIGNS[(lagnaSignIdx + i) % 12],
    planets: planets.filter(p => p.house === i + 1)
  }));

  // Dasha
  const dashaInfo = calculateDasha(nakshatra.index, moonPlanet.lon, dob);

  // Strength scores
  const strengths = computeStrengths(planets, houses);

  return {
    jd, ayanamsa, lagnaSid, lagnaSignIdx, lagnaSign, lagnaDeg,
    planets, houses, nakshatra, dashaInfo, strengths,
    generatedAt: new Date().toISOString()
  };
}

// ─── Helper: format dasha duration remaining ─────────────────────────────────
export function dashaRemaining(dasha) {
  if (!dasha) return '';
  const end = new Date(dasha.end).getTime();
  const now = Date.now();
  const msLeft = end - now;
  if (msLeft <= 0) return 'Completed';
  const years  = Math.floor(msLeft / (365.25 * 24 * 3600 * 1000));
  const months = Math.floor((msLeft % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
  return `${years}y ${months}m remaining`;
}
