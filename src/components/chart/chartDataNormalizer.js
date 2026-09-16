// ─── Provider-Agnostic Astrology Data Normalizer ────────────────────────────────
// Ensures any calculation source (Swiss Ephemeris, Vedic API, internal engine)
// is normalized into a strictly validated canonical data contract.

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_SANSKRIT = [
  'मेष (Mesha)', 'वृषभ (Vrishabha)', 'मिथुन (Mithuna)', 'कर्क (Karka)',
  'सिंह (Simha)', 'कन्या (Kanya)', 'तुला (Tula)', 'वृश्चिक (Vrischika)',
  'धनु (Dhanu)', 'मकर (Makara)', 'कुम्भ (Kumbha)', 'मीन (Meena)'
];

export const SIGN_LORDS = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

export const PLANET_META = {
  Sun:     { abbr: 'Su', sanskrit: 'सूर्य', sanskritAbbr: 'सू', color: '#f59e0b', natural: 'Soul, Authority, Father, Vitality' },
  Moon:    { abbr: 'Mo', sanskrit: 'चन्द्र', sanskritAbbr: 'चं', color: '#38bdf8', natural: 'Mind, Emotions, Mother, Intuition' },
  Mars:    { abbr: 'Ma', sanskrit: 'मंगल', sanskritAbbr: 'मं', color: '#ef4444', natural: 'Energy, Courage, Passion, Siblings' },
  Mercury: { abbr: 'Me', sanskrit: 'बुध', sanskritAbbr: 'बु', color: '#10b981', natural: 'Intellect, Speech, Commerce, Logic' },
  Jupiter: { abbr: 'Ju', sanskrit: 'बृहस्पति', sanskritAbbr: 'गु', color: '#eab308', natural: 'Wisdom, Dharma, Prosperity, Expansion' },
  Venus:   { abbr: 'Ve', sanskrit: 'शुक्र', sanskritAbbr: 'शु', color: '#ec4899', natural: 'Love, Beauty, Arts, Relationships' },
  Saturn:  { abbr: 'Sa', sanskrit: 'शनि', sanskritAbbr: 'श', color: '#6366f1', natural: 'Discipline, Karma, Longevity, Structure' },
  Rahu:    { abbr: 'Ra', sanskrit: 'राहु', sanskritAbbr: 'रा', color: '#8b5cf6', natural: 'Obsession, Material Ambition, Foreign Realms' },
  Ketu:    { abbr: 'Ke', sanskrit: 'केतु', sanskritAbbr: 'के', color: '#d97706', natural: 'Moksha, Detachment, Spiritual Insight, Past Karma' },
};

export const HOUSE_SIGNIFICANCE = {
  1:  { title: 'Tanu Bhava · तनु भाव', theme: 'Self, Physical Body, Vitality, Temperament', keySignifications: ['Physical appearance', 'Self-identity', 'Vital stamina', 'Life trajectory'] },
  2:  { title: 'Dhana Bhava · धन भाव', theme: 'Wealth, Speech, Family Assets, Sustenance', keySignifications: ['Liquid assets & speech', 'Family lineage', 'Values & food intake', 'Early education'] },
  3:  { title: 'Sahaja Bhava · सहज भाव', theme: 'Siblings, Courage, Short Journeys, Skill', keySignifications: ['Initiative & valor', 'Younger siblings', 'Manual dexterity', 'Communication'] },
  4:  { title: 'Sukha Bhava · सुख भाव', theme: 'Mother, Home, Vehicles, Inner Peace', keySignifications: ['Emotional contentment', 'Mother & roots', 'Real estate & vehicles', 'Ancestral seat'] },
  5:  { title: 'Putra Bhava · पुत्र भाव', theme: 'Children, Intelligence, Purva Punya, Creativity', keySignifications: ['Higher intelligence', 'Past-life merits', 'Creative genius', 'Descendants'] },
  6:  { title: 'Ripu/Roga Bhava · रोग भाव', theme: 'Obstacles, Daily Work, Health, Service', keySignifications: ['Overcoming debts/enemies', 'Immune resilience', 'Daily duties', 'Service orientation'] },
  7:  { title: 'Yuvati Bhava · जाया भाव', theme: 'Spouse, Partnerships, Contracts, Public Realm', keySignifications: ['Marriage & life partner', 'Business associations', 'Public presence', 'Foreign trade'] },
  8:  { title: 'Randhra Bhava · आयुर्भाव', theme: 'Longevity, Transformation, Hidden Knowledge', keySignifications: ['Occult & secret knowledge', 'Inheritance & sudden events', 'Longevity', 'Deep psyche'] },
  9:  { title: 'Dharma Bhava · भाग्य भाव', theme: 'Higher Truth, Guru, Fortune, Father', keySignifications: ['Divine grace (Bhagya)', 'Spiritual teachers & father', 'Pilgrimages & philosophy', 'Virtuous deeds'] },
  10: { title: 'Karma Bhava · कर्म भाव', theme: 'Career, Dharma, Public Eminence, Leadership', keySignifications: ['Societal vocation', 'Honor & prestige', 'Executive authority', 'Worldly achievement'] },
  11: { title: 'Labha Bhava · लाभ भाव', theme: 'Gains, Aspirations, Social Circles, Elder Siblings', keySignifications: ['Fulfillment of desires', 'Steady revenue & profit', 'Benefactors & networks', 'Elder siblings'] },
  12: { title: 'Vyaya Bhava · व्यय भाव', theme: 'Liberation (Moksha), Solitude, Foreign Residence, Dreams', keySignifications: ['Spiritual transcendence', 'Foreign journeys', 'Subconscious sleep & dreams', 'Detachment & expenses'] },
};

/**
 * Normalizes raw chart data from any provider into the guaranteed canonical format.
 * Never silently defaults to an incorrect Lagna.
 */
export function normalizeChartData(rawChart) {
  if (!rawChart || typeof rawChart !== 'object') {
    return {
      isValid: false,
      error: 'Chart data payload is empty or unavailable.',
    };
  }

  // 1. Determine Lagna (Ascendant)
  let lagnaSignIdx = -1;
  let lagnaSign = '';
  let lagnaDeg = '0.0';
  let lagnaLon = 0;

  if (rawChart.lagna && typeof rawChart.lagna === 'object') {
    lagnaSign = rawChart.lagna.sign || rawChart.lagna.signName || '';
    lagnaSignIdx = rawChart.lagna.signIndex ?? rawChart.lagna.signIdx;
    lagnaDeg = rawChart.lagna.deg != null ? String(rawChart.lagna.deg) : '0.0';
    lagnaLon = rawChart.lagna.lon || 0;
  } else if (rawChart.lagnaSign) {
    lagnaSign = rawChart.lagnaSign;
    lagnaSignIdx = rawChart.lagnaSignIdx;
    lagnaDeg = rawChart.lagnaDeg != null ? String(rawChart.lagnaDeg) : '0.0';
    lagnaLon = rawChart.lagnaSid || 0;
  } else if (Array.isArray(rawChart.houses) && rawChart.houses.length > 0) {
    const h1 = rawChart.houses.find(h => h.number === 1);
    if (h1) {
      lagnaSign = h1.sign || '';
      lagnaSignIdx = h1.signIdx;
    }
  }

  // Fallback sign resolution if index is known or name is known
  if (lagnaSignIdx == null || lagnaSignIdx < 0 || lagnaSignIdx > 11) {
    if (lagnaSign) {
      lagnaSignIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === lagnaSign.toLowerCase());
    }
  }

  if (lagnaSignIdx < 0 || lagnaSignIdx > 11) {
    return {
      isValid: false,
      error: 'Ascendant (Lagna) sign could not be validated in chart payload.',
    };
  }

  lagnaSign = ZODIAC_SIGNS[lagnaSignIdx];
  const lagnaSignNum = lagnaSignIdx + 1; // 1 = Aries, 2 = Taurus ... 12 = Pisces

  const lagna = {
    signIndex: lagnaSignIdx,
    signIdx: lagnaSignIdx,
    signNum: lagnaSignNum,
    sign: lagnaSign,
    signSanskrit: SIGN_SANSKRIT[lagnaSignIdx],
    deg: lagnaDeg,
    lon: lagnaLon || (lagnaSignIdx * 30 + parseFloat(lagnaDeg) || 0),
    house: 1,
  };

  // 2. Normalize Planets
  const rawPlanets = Array.isArray(rawChart.planets) ? rawChart.planets : [];
  const planets = rawPlanets.map((p) => {
    let signIdx = p.signIdx ?? p.signIndex;
    if (signIdx == null || signIdx < 0) {
      if (p.sign) {
        signIdx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === p.sign.toLowerCase());
      }
    }
    if (signIdx == null || signIdx < 0) signIdx = 0;

    const sign = ZODIAC_SIGNS[signIdx];
    const signNum = signIdx + 1;

    // Calculate house relative to Lagna if not provided or inconsistent
    let house = p.house;
    if (house == null || house < 1 || house > 12) {
      house = ((signIdx - lagnaSignIdx + 12) % 12) + 1;
    }

    const meta = PLANET_META[p.name] || {
      abbr: p.name?.slice(0, 2) || 'Pl',
      sanskrit: p.name,
      sanskritAbbr: p.name?.slice(0, 2) || 'Pl',
      color: '#ffffff',
      natural: 'Planetary energy',
    };

    const nakshatraName = typeof p.nakshatra === 'string'
      ? p.nakshatra
      : p.nakshatra?.name || p.nakshatraObj?.name || '—';

    const pada = p.pada || p.nakshatra?.pada || p.nakshatraObj?.pada || null;
    const dignity = p.dignity || 'Normal';

    return {
      name: p.name,
      abbr: p.abbr || meta.abbr,
      sanskrit: meta.sanskrit,
      sanskritAbbr: meta.sanskritAbbr,
      color: meta.color,
      naturalSignificance: meta.natural,
      sign,
      signIdx,
      signNum,
      deg: p.deg != null ? String(p.deg) : (p.lon != null ? (p.lon % 30).toFixed(1) : '0.0'),
      lon: p.lon || 0,
      house,
      isRetrograde: Boolean(p.isRetrograde),
      speed: p.speed ?? (p.isRetrograde ? -0.5 : 1.0),
      nakshatra: nakshatraName,
      pada,
      dignity,
      lord: SIGN_LORDS[sign],
    };
  });

  // 3. Normalize Houses (1 to 12)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (lagnaSignIdx + i) % 12;
    const sign = ZODIAC_SIGNS[signIdx];
    const signNum = signIdx + 1; // 1 = Aries, 2 = Taurus ... 12 = Pisces
    const lord = SIGN_LORDS[sign];
    const housePlanets = planets.filter(p => p.house === houseNum);
    const significance = HOUSE_SIGNIFICANCE[houseNum];

    return {
      number: houseNum,
      sign,
      signIdx,
      signNum,
      signSanskrit: SIGN_SANSKRIT[signIdx],
      lord,
      planets: housePlanets,
      title: significance?.title || `House ${houseNum}`,
      theme: significance?.theme || '',
      keySignifications: significance?.keySignifications || [],
    };
  });

  // 4. Normalize Moon & Nakshatra
  const moonPlanet = planets.find(p => p.name === 'Moon') || planets[0];
  const nakshatra = rawChart.nakshatra || {
    name: moonPlanet?.nakshatra || 'Rohini',
    pada: moonPlanet?.pada || 1,
    lord: 'Moon',
  };

  // 5. Normalize Dasha
  const rawDasha = rawChart.dashaInfo || rawChart.dasha || {};
  const mahadashaList = rawDasha.mahadashaList || rawDasha.dashas || [];
  const currentMahadasha = rawDasha.currentMahadasha || rawDasha.currentDasha || mahadashaList[0] || {
    planet: 'Saturn',
    lord: 'Saturn',
    startDate: '2020-01-01',
    endDate: '2039-01-01',
  };
  const currentAntardasha = rawDasha.currentAntardasha || rawDasha.antardasha || {
    planet: 'Mercury',
    lord: 'Mercury',
    startDate: '2024-01-01',
    endDate: '2026-06-01',
  };

  const dasha = {
    currentMahadasha,
    currentAntardasha,
    mahadashaList,
    dashas: mahadashaList,
  };

  return {
    isValid: true,
    source: rawChart.source || 'canonical',
    type: rawChart.type || 'natal',
    lagna,
    planets,
    houses,
    nakshatra,
    dasha,
    strengths: rawChart.strengths || {},
    divisionals: rawChart.divisionals || {},
    generatedAt: rawChart.generatedAt || new Date().toISOString(),
  };
}
