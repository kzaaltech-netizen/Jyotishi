// ─── VedAstro Service Layer ─────────────────────────────────────────────────────
// Single integration point for all VedAstro REST API calls.
// Swiss Ephemeris-backed, Lahiri ayanamsa.
//
// VedAstro URL pattern:
//   GET https://api.vedastro.org/api/Calculate/{Method}/Location/{lat},{lon}/Time/{HH:MM}/{DD-MM-YYYY}/{tz}/Ayanamsa/{LAHIRI}
//   Header: x-api-key: {VEDASTRO_API_KEY}

const BASE = 'https://api.vedastro.org/api';

function getApiKey() {
  return process.env.VEDASTRO_API_KEY || 'FreeAPIUser';
}

function getAyanamsa() {
  return process.env.VEDASTRO_AYANAMSA || 'LAHIRI';
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Build VedAstro URL path segment for birth time + location.
 * VedAstro expects: Location/{lat},{lon}/Time/{HH:MM}/{DD-MM-YYYY}/{+HH:MM}
 */
export function buildTimeLocation(lat, lon, birthTime, dob, timezone) {
  const [y, m, d] = dob.split('-');
  const vedDate = `${d}-${m}-${y}`;
  const tz = ianaToOffset(timezone);
  const time = birthTime || '12:00';
  return `Location/${lat},${lon}/Time/${time}/${vedDate}/${tz}`;
}

/**
 * Convert IANA timezone name to UTC offset string like "+05:30"
 */
export function ianaToOffset(tzName) {
  if (!tzName) return '+05:30'; // default IST
  if (/^[+-]\d{2}:\d{2}$/.test(tzName)) return tzName;
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzName,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      const match = tzPart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
      if (match) {
        const sign = match[1];
        const hrs = match[2].padStart(2, '0');
        const mins = (match[3] || '00').padStart(2, '0');
        return `${sign}${hrs}:${mins}`;
      }
    }
  } catch (e) { /* fallback */ }
  return '+05:30';
}

/**
 * Make a GET request to VedAstro API.
 */
export async function vedAstroGet(path, retries = 3) {
  const url = `${BASE}/${path}`;
  const headers = { 'x-api-key': getApiKey() };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[VedAstro] GET ${path.substring(0, 90)}...`);
      const res = await fetch(url, { headers });

      if (res.status === 429) {
        const wait = Math.min(15000 * (attempt + 1), 60000);
        console.warn(`[VedAstro] Rate limited (429). Waiting ${wait / 1000}s before retry ${attempt + 1}/${retries}...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`[VedAstro] Error ${res.status}: ${errBody.substring(0, 200)}`);
        throw new Error(`VedAstro API error ${res.status}: ${errBody.substring(0, 200)}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[VedAstro] Request failed, retrying... (${err.message})`);
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

export const PLANET_ABBR = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke'
};

export const PLANET_COLORS = {
  Sun: '#f2ca50', Moon: '#ffffff', Mars: '#ff7b7b', Mercury: '#00e4f2',
  Jupiter: '#ffd700', Venus: '#d8b9ff', Saturn: '#a0a0b0', Rahu: '#8b5cf6', Ketu: '#f97316'
};

export const NAKSHATRAS_LIST = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishtha', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' },
];

export const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
export const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
export const DASHA_TOTAL = 120;

export const SIGN_LORDS = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

// ─── API Fetches ────────────────────────────────────────────────────────────────

export async function fetchAllPlanetData(timeLoc) {
  const ayan = getAyanamsa();
  return vedAstroGet(`Calculate/AllPlanetData/PlanetName/All/${timeLoc}/Ayanamsa/${ayan}`);
}

export async function fetchAllHouseData(timeLoc) {
  const ayan = getAyanamsa();
  return vedAstroGet(`Calculate/AllHouseData/HouseName/All/${timeLoc}/Ayanamsa/${ayan}`);
}

export async function fetchHoroscopePredictions(timeLoc) {
  const ayan = getAyanamsa();
  return vedAstroGet(`Calculate/HoroscopePredictions/${timeLoc}/Ayanamsa/${ayan}`);
}

// ─── Data Parsers & Calculations ─────────────────────────────────────────────

function extractPlanetData(rawPlanetData) {
  const payload = rawPlanetData?.Payload?.AllPlanetData || rawPlanetData?.Payload || rawPlanetData;
  const planetMap = {};
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  if (Array.isArray(payload)) {
    for (const item of payload) {
      for (const name of planetNames) {
        if (item[name]) planetMap[name] = item[name];
      }
    }
  } else if (typeof payload === 'object' && payload !== null) {
    for (const name of planetNames) {
      if (payload[name]) planetMap[name] = payload[name];
    }
  }
  return planetMap;
}

function extractHouseData(rawHouseData) {
  const payload = rawHouseData?.Payload?.AllHouseData || rawHouseData?.Payload || rawHouseData;
  const houseMap = {};
  if (Array.isArray(payload)) {
    for (let i = 0; i < payload.length; i++) {
      const item = payload[i];
      const hKey = `House${i + 1}`;
      if (item[hKey]) houseMap[hKey] = item[hKey];
      else if (item.House1) houseMap.House1 = item.House1;
    }
  } else if (typeof payload === 'object' && payload !== null) {
    for (let i = 1; i <= 12; i++) {
      const hKey = `House${i}`;
      if (payload[hKey]) houseMap[hKey] = payload[hKey];
    }
  }
  return houseMap;
}

export function parseD1Planets(planetMap, lagnaSignIdx) {
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const planets = [];

  for (const name of planetNames) {
    const pData = planetMap[name] || {};
    const sign = pData.PlanetZodiacSign?.Name || pData.Sign || ZODIAC_SIGNS[0];
    const signIdx = ZODIAC_SIGNS.indexOf(sign) >= 0 ? ZODIAC_SIGNS.indexOf(sign) : 0;
    const deg = pData.PlanetZodiacSign?.DegreesInSign?.TotalDegrees
             || pData.DegreesInSign
             || pData.Longitude?.TotalDegrees % 30
             || 0;
    
    // House placement relative to D1 Lagna
    const houseStr = pData.HousePlanetOccupiesBasedOnSign || pData.HousePlanetOccupiesBasedOnLongitudes || '';
    let house = parseInt(String(houseStr).replace(/\D/g, '')) || 0;
    if (!house || house < 1 || house > 12) {
      house = ((signIdx - lagnaSignIdx + 12) % 12) + 1;
    }

    const nakName = pData.PlanetConstellation?.Name || pData.Nakshatra || '';
    const dignity = pData.PlanetDignity || (pData.IsPlanetExalted ? 'Exalted' : (pData.IsPlanetDebilitated ? 'Debilitated' : (pData.IsPlanetInOwnSign ? 'OwnSign' : 'Normal')));

    planets.push({
      name,
      abbr: PLANET_ABBR[name],
      lon: pData.Longitude?.TotalDegrees || (signIdx * 30 + deg),
      sign,
      signIdx,
      house,
      deg: typeof deg === 'number' ? deg.toFixed(1) : String(deg),
      nakshatra: nakName,
      dignity: typeof dignity === 'string' ? dignity : 'Normal',
      color: PLANET_COLORS[name] || '#ffffff',
      isRetrograde: Boolean(pData.IsPlanetRetrograde),
    });
  }

  return planets;
}

export function buildHouses(planets, lagnaSignIdx) {
  return Array.from({ length: 12 }, (_, i) => {
    const sIdx = (lagnaSignIdx + i) % 12;
    const sign = ZODIAC_SIGNS[sIdx];
    return {
      number: i + 1,
      signIdx: sIdx,
      sign,
      lord: SIGN_LORDS[sign] || '',
      planets: planets.filter(p => p.house === i + 1),
    };
  });
}

export function buildDivisionalChart(divKey, lagnaSignName, planetMap) {
  const lagnaSign = lagnaSignName || 'Aries';
  const lagnaSignIdx = ZODIAC_SIGNS.indexOf(lagnaSign) >= 0 ? ZODIAC_SIGNS.indexOf(lagnaSign) : 0;
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  
  // Field names in VedAstro Planet Data
  const divFieldMap = {
    d9: 'PlanetNavamshaD9Sign',
    d10: 'PlanetDashamamshaD10Sign',
    d2: 'PlanetHoraD2Sign',
    d11: 'PlanetBhamshaD27Sign' // or PlanetRudramshaD11Sign
  };
  const propName = divFieldMap[divKey] || 'PlanetNavamshaD9Sign';

  const planets = [];
  for (const name of planetNames) {
    const pData = planetMap[name] || {};
    const divSignObj = pData[propName] || pData.PlanetNavamshaD9Sign || {};
    const sign = divSignObj.Name || pData.PlanetZodiacSign?.Name || ZODIAC_SIGNS[0];
    const signIdx = ZODIAC_SIGNS.indexOf(sign) >= 0 ? ZODIAC_SIGNS.indexOf(sign) : 0;
    const house = ((signIdx - lagnaSignIdx + 12) % 12) + 1;

    const rawDeg = divSignObj.DegreesIn?.TotalDegrees || divSignObj.TotalDegrees || 0;
    const degNum = parseFloat(rawDeg) || 0;

    planets.push({
      name,
      abbr: PLANET_ABBR[name],
      sign,
      signIdx,
      house,
      deg: degNum.toFixed(1),
      color: PLANET_COLORS[name] || '#ffffff',
    });
  }

  const houses = buildHouses(planets, lagnaSignIdx);

  return {
    type: divKey,
    source: 'vedastro',
    lagnaSign,
    lagnaSignIdx,
    planets,
    houses,
  };
}

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

export function calculateDasha(moonNakshatra, moonLon, birthDateStr) {
  const nakIdx = NAKSHATRAS_LIST.findIndex(n =>
    n.name.toLowerCase() === (moonNakshatra || '').toLowerCase()
  );
  const effectiveIdx = nakIdx >= 0 ? nakIdx : Math.floor(moonLon / (360 / 27));
  const nakshatraSpan = 360 / 27;
  const fractionElapsed = (moonLon % nakshatraSpan) / nakshatraSpan;
  const nakLord = NAKSHATRAS_LIST[effectiveIdx]?.lord || 'Ketu';
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
    dashas.push({ lord, years, start: new Date(startMs).toISOString(), end: new Date(endMs).toISOString() });
    currentMs = endMs;
  }

  const now = Date.now();
  const currentDasha = dashas.find(d => new Date(d.start).getTime() <= now && new Date(d.end).getTime() >= now);

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
        antardasha = { lord: adLord, start: new Date(adMs).toISOString(), end: new Date(adEndMs).toISOString() };
        break;
      }
      adMs = adEndMs;
    }
  }

  return { dashas, currentDasha, antardasha };
}

// ─── Master Orchestrator ────────────────────────────────────────────────────────

/**
 * Generate complete VedAstro chart bundle for a user:
 * { natal (D1), d9 (Navamsa), d10 (Dashamsha), d2 (Hora), d11 (Labhamsa), transit }
 */
export async function generateFullChartBundle(profile) {
  const { dob, birthTime, lat, lon, timezone } = profile;
  const timeLoc = buildTimeLocation(lat, lon, birthTime, dob, timezone);

  console.log(`[VedAstro] Generating full chart bundle for ${profile.fullName || 'User'} (${timeLoc})`);

  // 1. Fetch All Planet Data and All House Data in parallel
  const [rawPlanetData, rawHouseData, rawPredictions] = await Promise.all([
    fetchAllPlanetData(timeLoc).catch(err => {
      console.error(`[VedAstro] AllPlanetData error: ${err.message}`);
      throw err;
    }),
    fetchAllHouseData(timeLoc).catch(err => {
      console.warn(`[VedAstro] AllHouseData error (will fallback): ${err.message}`);
      return null;
    }),
    fetchHoroscopePredictions(timeLoc).catch(err => {
      console.warn(`[VedAstro] HoroscopePredictions error (non-fatal): ${err.message}`);
      return null;
    }),
  ]);

  const planetMap = extractPlanetData(rawPlanetData);
  const houseMap = extractHouseData(rawHouseData);

  // 2. Determine D1 Lagna
  const house1 = houseMap.House1 || {};
  const lagnaSign = house1.HouseSignName || house1.HouseRasiSign?.Name || 'Aries';
  const lagnaSignIdx = ZODIAC_SIGNS.indexOf(lagnaSign) >= 0 ? ZODIAC_SIGNS.indexOf(lagnaSign) : 0;
  const lagnaDeg = house1.HouseRasiSign?.DegreesIn?.TotalDegrees || 0;

  // 3. Parse D1 Planets & Houses
  const d1Planets = parseD1Planets(planetMap, lagnaSignIdx);
  const d1Houses = buildHouses(d1Planets, lagnaSignIdx);

  // 4. Nakshatra & Dasha
  const moonPlanet = d1Planets.find(p => p.name === 'Moon');
  const moonNakName = moonPlanet?.nakshatra || '';
  const moonNakIdx = NAKSHATRAS_LIST.findIndex(n => n.name.toLowerCase() === moonNakName.toLowerCase());
  const nakshatra = {
    name: moonNakName || NAKSHATRAS_LIST[Math.floor((moonPlanet?.lon || 0) / (360 / 27))]?.name || 'Ashwini',
    lord: moonNakIdx >= 0 ? NAKSHATRAS_LIST[moonNakIdx].lord : 'Ketu',
    index: moonNakIdx >= 0 ? moonNakIdx : 0,
    longitude: moonPlanet?.lon || 0,
  };

  const dashaInfo = calculateDasha(nakshatra.name, moonPlanet?.lon || 0, dob);
  const strengths = computeStrengths(d1Planets);

  // 5. Yogas & Horoscope Predictions
  const predictions = rawPredictions?.Payload || [];
  const yogas = Array.isArray(predictions)
    ? predictions.filter(p => p && p.Name).slice(0, 30).map(p => ({
        name: p.Name,
        description: p.Description,
        tags: p.Tags || [],
        weight: p.Weight || 0,
      }))
    : [];

  // 6. Build D1 Natal Chart
  const generatedAt = new Date().toISOString();
  const natal = {
    source: 'vedastro',
    type: 'natal',
    ayanamsa: getAyanamsa(),
    lagnaSignIdx,
    lagnaSign,
    lagnaDeg: typeof lagnaDeg === 'number' ? lagnaDeg.toFixed(1) : String(lagnaDeg),
    lagnaSid: lagnaSignIdx * 30 + (parseFloat(lagnaDeg) || 0),
    planets: d1Planets,
    houses: d1Houses,
    nakshatra,
    dashaInfo,
    strengths,
    yogas,
    predictions: Array.isArray(predictions) ? predictions.slice(0, 20) : [],
    generatedAt,
  };

  // 7. Build Divisional Charts (D9, D10, D2, D11)
  const d9LagnaSign = house1.HouseNavamshaD9Sign?.Name || lagnaSign;
  const d10LagnaSign = house1.HouseDashamamshaD10Sign?.Name || lagnaSign;
  const d2LagnaSign = house1.HouseHoraD2Sign?.Name || lagnaSign;
  const d11LagnaSign = house1.HouseBhamshaD27Sign?.Name || lagnaSign;

  const d9  = { ...buildDivisionalChart('d9',  d9LagnaSign,  planetMap), generatedAt };
  const d10 = { ...buildDivisionalChart('d10', d10LagnaSign, planetMap), generatedAt };
  const d2  = { ...buildDivisionalChart('d2',  d2LagnaSign,  planetMap), generatedAt };
  const d11 = { ...buildDivisionalChart('d11', d11LagnaSign, planetMap), generatedAt };

  // 8. Fetch Current Transits for User Location
  let transit = null;
  try {
    const now = new Date();
    const nowDob = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
    const nowTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    const transitTimeLoc = buildTimeLocation(lat, lon, nowTime, nowDob, '+00:00');
    
    const transitPlanetData = await fetchAllPlanetData(transitTimeLoc);
    const transitPlanetMap = extractPlanetData(transitPlanetData);
    const transitPlanets = parseD1Planets(transitPlanetMap, lagnaSignIdx);

    transit = {
      source: 'vedastro',
      type: 'transit',
      calculatedAt: now.toISOString(),
      lagnaSign,
      planets: transitPlanets,
      houses: buildHouses(transitPlanets, lagnaSignIdx),
      generatedAt,
    };
  } catch (tErr) {
    console.warn(`[VedAstro] Transit calculation warning: ${tErr.message}`);
    transit = {
      source: 'vedastro',
      type: 'transit',
      lagnaSign,
      planets: d1Planets,
      houses: d1Houses,
      generatedAt,
    };
  }

  console.log(`[VedAstro] Chart bundle ready: natal (D1), d9, d10, d2, d11, transit`);
  const rawData = {
    allPlanetData: rawPlanetData,
    allHouseData: rawHouseData,
    horoscopePredictions: rawPredictions,
  };
  return { natal, d9, d10, d2, d11, transit, rawData };
}

/**
 * Legacy single-chart export wrapper for backward compatibility.
 */
export async function generateFullChart(profile) {
  const bundle = await generateFullChartBundle(profile);
  return bundle.natal;
}
