/**
 * Deterministic Intent Classifier & Relevance Filter
 * Classifies query intent and depth without extra LLM overhead,
 * and filters out irrelevant Kundli placements so responses remain
 * concise, personal, and focused.
 */

// Life-domain specific patterns take precedence over general dasha timing
const INTENT_PATTERNS = [
  {
    intent: 'health_vitality',
    patterns: [
      /\b(health|vitality|disease|illness|bimar|bimari|swasthya|energy|recovery|6th house|doctor|surgery|fitness|body|physical)\b/i,
    ],
  },
  {
    intent: 'mental_emotional',
    patterns: [
      /\b(overthink|overthinking|stress|anxiety|peace of mind|mind|tension|confus|restless|worried|worry|feel stuck|feeling stuck|internal|fear|emotional|mood|temperament|nature|swabhav|dimag|mann|man shanti|soch)\b/i,
      /\b(why do i feel|why am i so|why am i overthinking)\b/i,
    ],
  },
  {
    intent: 'career',
    patterns: [
      /\b(career|job|naukri|business|profession|work|promotion|boss|office|transfer|switch|calling|vocation|10th house|karma|livelihood|interview|unemployed|stuck in career)\b/i,
      /\b(job kab|career kab|naukri kab|switch job|switch jobs|change job|job switch)\b/i,
    ],
  },
  {
    intent: 'marriage_love',
    patterns: [
      /\b(marriage|shadi|shaadi|vivah|spouse|husband|wife|partner|relationship|love|divorce|remarriage|7th house|yuvati|manglik|compatibility|jeevansaathi|jeevansathi)\b/i,
      /\b(shadi kab|marriage timing|meraj|relationship)\b/i,
    ],
  },
  {
    intent: 'wealth_finance',
    patterns: [
      /\b(money|wealth|finance|paisa|dhan|assets|investment|earning|income|debt|loan|property|saving|savings|2nd house|11th house|rich|financial)\b/i,
      /\b(paisa kab|financial situation|wealth prospects)\b/i,
    ],
  },
  {
    intent: 'dasha_timing',
    patterns: [
      /\b(dasha|mahadasha|antardasha|vimshottari|timing|current phase|which phase|chal rahi|chal raha|kab tak|when will.*time|timing of)\b/i,
      /\b(what is my.*dasha|tell me my.*dasha|active dasha)\b/i,
    ],
  },
  {
    intent: 'chart_lookup',
    patterns: [
      /\b(lagna kya|what is my lagna|ascendant|which sign is my moon|where is|degree of|rashi kya|kundli dikhao|tell me my planets)\b/i,
    ],
  },
];

const QUICK_QUERY_PATTERNS = [
  /^what is my (current )?dasha( right now)?\??$/i,
  /^what (is|are) my lagna\??$/i,
  /^which sign is my moon\??$/i,
  /^where is (jupiter|saturn|mars|venus|mercury|sun|moon|rahu|ketu)\??$/i,
  /^(dasha|lagna|moon sign|rashi)\??$/i,
  /^meri dasha kya hai\??$/i,
  /^lagna batao\??$/i,
];

const DEEP_QUERY_PATTERNS = [
  /\b(tell me everything|complete analysis|detailed analysis|deep dive|comprehensive|pura vishleshan|sab kuch batao|entire chart|in detail|full life)\b/i,
  /\b(marriage and career|career and marriage|past life|future life)\b/i,
];

export function classifyIntent(userMessage = '') {
  const text = String(userMessage || '').trim();

  // 1. Depth check
  let depth = 'standard';
  if (QUICK_QUERY_PATTERNS.some(p => p.test(text)) || (text.split(/\s+/).length <= 4 && text.endsWith('?'))) {
    depth = 'quick';
  } else if (DEEP_QUERY_PATTERNS.some(p => p.test(text)) || text.length > 200) {
    depth = 'deep';
  }

  // 2. Intent match
  for (const item of INTENT_PATTERNS) {
    if (item.patterns.some(p => p.test(text))) {
      return { intent: item.intent, depth };
    }
  }

  return { intent: 'general', depth };
}

/**
 * Filters canonical chart bundle to extract only factors relevant to the user's intent.
 */
export function filterRelevantChartFacts(chartBundle = {}, intent = 'general') {
  const natal = chartBundle.canonical || chartBundle.natal || chartBundle;
  const planets = Array.isArray(natal.planets) ? natal.planets : [];
  const houses = Array.isArray(natal.houses) ? natal.houses : [];
  const lagna = natal.lagna || { sign: natal.lagnaSign, deg: natal.lagnaDeg, signIdx: natal.lagnaSignIdx };
  const dasha = natal.dasha || natal.dashaInfo || {};

  const getPlanet = (name) => planets.find(p => p.name?.toLowerCase() === name.toLowerCase());
  const getHouse = (num) => houses.find(h => (h.houseNumber ?? h.house ?? h.number) === num);

  const moon = getPlanet('Moon');
  const sun = getPlanet('Sun');
  const jupiter = getPlanet('Jupiter');
  const saturn = getPlanet('Saturn');
  const mercury = getPlanet('Mercury');
  const venus = getPlanet('Venus');
  const mars = getPlanet('Mars');
  const rahu = getPlanet('Rahu');
  const ketu = getPlanet('Ketu');

  const currentDasha = {
    mahadasha: dasha?.currentMahadasha?.planet || dasha?.currentMahadasha?.lord || 'Active',
    antardasha: dasha?.currentAntardasha?.planet || dasha?.currentAntardasha?.lord || null,
    startDate: dasha?.currentMahadasha?.startDate || null,
    endDate: dasha?.currentMahadasha?.endDate || null,
  };

  const facts = {
    lagna: {
      sign: lagna.sign,
      deg: lagna.deg,
      lord: houses.find(h => (h.houseNumber ?? h.house ?? h.number) === 1)?.lord || '—',
    },
    currentDasha,
    dasha,
    relevantHouses: [],
  };

  switch (intent) {
    case 'career': {
      const h10 = getHouse(10);
      const h6 = getHouse(6);
      facts.primaryDomain = '10th House (Karma / Vocation)';
      facts.h10 = h10 ? {
        houseNumber: 10,
        sign: h10.sign,
        lord: h10.lord,
        occupants: (h10.planets || []).map(p => typeof p === 'string' ? p : p.name),
      } : null;
      facts.h6 = h6 ? { houseNumber: 6, sign: h6.sign, lord: h6.lord } : null;
      facts.relevantHouses = [facts.h10, facts.h6].filter(Boolean);
      facts.keyPlanets = [saturn, mercury, sun].filter(Boolean).map(p => ({ name: p.name, sign: p.sign, house: p.house, dignity: p.dignity }));
      if (chartBundle.d10) {
        facts.dashamshaD10 = { lagnaSign: chartBundle.d10.lagnaSign };
      }
      break;
    }

    case 'marriage_love': {
      const h7 = getHouse(7);
      facts.primaryDomain = '7th House (Yuvati / Partnerships)';
      facts.h7 = h7 ? {
        houseNumber: 7,
        sign: h7.sign,
        lord: h7.lord,
        occupants: (h7.planets || []).map(p => typeof p === 'string' ? p : p.name),
      } : null;
      facts.relevantHouses = [facts.h7].filter(Boolean);
      facts.keyPlanets = [venus, jupiter, mars, saturn].filter(Boolean).map(p => ({ name: p.name, sign: p.sign, house: p.house, dignity: p.dignity }));
      if (chartBundle.d9) {
        facts.navamshaD9 = { lagnaSign: chartBundle.d9.lagnaSign };
      }
      break;
    }

    case 'wealth_finance': {
      const h2 = getHouse(2);
      const h11 = getHouse(11);
      facts.primaryDomain = '2nd House (Dhana) & 11th House (Labha)';
      facts.h2 = h2 ? {
        houseNumber: 2,
        sign: h2.sign,
        lord: h2.lord,
        occupants: (h2.planets || []).map(p => typeof p === 'string' ? p : p.name),
      } : null;
      facts.h11 = h11 ? {
        houseNumber: 11,
        sign: h11.sign,
        lord: h11.lord,
        occupants: (h11.planets || []).map(p => typeof p === 'string' ? p : p.name),
      } : null;
      facts.relevantHouses = [facts.h2, facts.h11].filter(Boolean);
      facts.keyPlanets = [jupiter, mercury, venus].filter(Boolean).map(p => ({ name: p.name, sign: p.sign, house: p.house, dignity: p.dignity }));
      break;
    }

    case 'mental_emotional': {
      const h4 = getHouse(4);
      const h5 = getHouse(5);
      facts.primaryDomain = 'Moon / Mental Processing & 4th/5th Houses';
      facts.moon = moon ? { sign: moon.sign, house: moon.house, nakshatra: moon.nakshatra, pada: moon.pada, dignity: moon.dignity } : null;
      facts.mercury = mercury ? { sign: mercury.sign, house: mercury.house, isRetrograde: mercury.isRetrograde } : null;
      facts.h4 = h4 ? { houseNumber: 4, sign: h4.sign, lord: h4.lord } : null;
      facts.h5 = h5 ? { houseNumber: 5, sign: h5.sign, lord: h5.lord } : null;
      facts.relevantHouses = [facts.h4, facts.h5].filter(Boolean);
      facts.pressurePoints = [rahu, ketu, saturn].filter(Boolean).map(p => ({ name: p.name, house: p.house, sign: p.sign }));
      break;
    }

    case 'dasha_timing': {
      facts.primaryDomain = 'Vimshottari Dasha Cycles';
      facts.moonNakshatra = moon ? { name: moon.nakshatra, pada: moon.pada } : null;
      facts.dashaDetails = dasha;
      facts.activeDashaLord = getPlanet(currentDasha.mahadasha);
      facts.relevantHouses = [];
      break;
    }

    case 'health_vitality': {
      const h6 = getHouse(6);
      const h1 = getHouse(1);
      facts.primaryDomain = 'Lagna Vitality & 6th House';
      facts.h1 = h1 ? { houseNumber: 1, sign: h1.sign, lord: h1.lord } : null;
      facts.h6 = h6 ? { houseNumber: 6, sign: h6.sign, lord: h6.lord } : null;
      facts.relevantHouses = [facts.h1, facts.h6].filter(Boolean);
      facts.sun = sun ? { sign: sun.sign, house: sun.house, dignity: sun.dignity } : null;
      break;
    }

    default: {
      facts.moon = moon ? { sign: moon.sign, house: moon.house, nakshatra: moon.nakshatra } : null;
      facts.sun = sun ? { sign: sun.sign, house: sun.house } : null;
      facts.relevantHouses = [];
      break;
    }
  }

  return facts;
}

export default { classifyIntent, filterRelevantChartFacts };
