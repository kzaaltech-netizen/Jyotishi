import crypto from 'crypto';
import AstrologyProvider from './astrologyProvider.interface.js';
import { validateBirthInput } from '../validators/inputValidator.js';
import { ZODIAC_SIGNS, PLANET_ABBR, PLANET_COLORS, SIGN_LORDS } from '../constants/astrologyConstants.js';
import { getPlanetDignity } from '../vedic/signs.js';
import { buildHouses, computeStrengths } from '../vedic/houses.js';

export class FreeAstroApiAdapter extends AstrologyProvider {
  constructor() {
    super();
  }

  getName() {
    return 'freeastroapi';
  }

  /**
   * Resolve API key strictly from environment variables without exposing to client.
   */
  getApiKey() {
    return process.env.FREEASTROAPI_API_KEY || process.env.FREE_ASTRO_API_KEY || '';
  }

  /**
   * Resolve FreeAstroAPI Base URL from environment or fallback to official production URL.
   */
  getBaseUrl() {
    return process.env.FREEASTROAPI_BASE_URL || 'https://api.freeastroapi.com';
  }

  /**
   * Format normalized birth profile into FreeAstroAPI request payload.
   * Documented endpoint: POST /api/v2/vedic/calculate
   */
  buildRequestPayload(profile, options = {}) {
    const valid = validateBirthInput(profile);
    const [yearStr, monthStr, dayStr] = valid.dob.split('-');
    const [hourStr, minStr] = valid.birthTime.split(':');

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    const lat = valid.lat;
    const lng = valid.lon; // FreeAstroAPI expects 'lng'

    return {
      year,
      month,
      day,
      hour,
      minute,
      lat,
      lng,
      city: profile.birthplace || 'Location',
      tz_str: valid.timezone || 'Asia/Kolkata',
      ayanamsha: options.ayanamsha || process.env.FREEASTROAPI_AYANAMSA || 'lahiri',
      house_system: options.house_system || 'whole_sign',
      node_type: options.node_type || 'mean',
      vargas: [1, 2, 3, 7, 9, 10, 12, 30, 60],
      include_yogas: true,
      include_panchang: true,
      include_shadbala: true,
      include_ashtakavarga: true,
      dasha_levels: 2,
    };
  }

  /**
   * Call FreeAstroAPI POST /api/v2/vedic/calculate and handle all HTTP status codes.
   */
  async executeCalculation(payload, customFetch = null) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      const err = new Error('FreeAstroAPI authentication failed: Missing API key. Please configure FREEASTROAPI_API_KEY in environment variables.');
      err.code = 'MISSING_API_KEY';
      throw err;
    }

    const baseUrl = this.getBaseUrl().replace(/\/+$/, '');
    const url = `${baseUrl}/api/v2/vedic/calculate`;
    const idempotencyKey = crypto.randomUUID();

    const fetchFn = customFetch || globalThis.fetch;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let res;
    try {
      res = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        const err = new Error('FreeAstroAPI request timed out after 30 seconds.');
        err.code = 'TIMEOUT';
        throw err;
      }
      const err = new Error(`FreeAstroAPI network connection error: ${fetchErr.message}`);
      err.code = 'NETWORK_ERROR';
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let errBody = '';
      try {
        errBody = await res.text();
      } catch (e) {
        errBody = '';
      }

      if (res.status === 401 || res.status === 403) {
        const err = new Error('FreeAstroAPI authentication failed: Invalid or unauthorized API key.');
        err.code = 'AUTH_FAILED';
        err.status = res.status;
        throw err;
      }

      if (res.status === 429) {
        const err = new Error('FreeAstroAPI rate limit exceeded. Please try again later.');
        err.code = 'RATE_LIMIT';
        err.status = 429;
        throw err;
      }

      if (res.status === 400) {
        const err = new Error(`FreeAstroAPI bad request: ${errBody || res.statusText}`);
        err.code = 'BAD_REQUEST';
        err.status = 400;
        throw err;
      }

      if (res.status >= 500) {
        const err = new Error(`FreeAstroAPI server error (HTTP ${res.status}): ${errBody || res.statusText}`);
        err.code = 'SERVER_ERROR';
        err.status = res.status;
        throw err;
      }

      const err = new Error(`FreeAstroAPI returned HTTP ${res.status}: ${errBody || res.statusText}`);
      err.code = 'API_ERROR';
      err.status = res.status;
      throw err;
    }

    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      const err = new Error('FreeAstroAPI returned an invalid JSON response.');
      err.code = 'MALFORMED_RESPONSE';
      throw err;
    }

    if (!data || typeof data !== 'object' || !data.chart) {
      const err = new Error('FreeAstroAPI returned a malformed response: Missing chart structure.');
      err.code = 'MALFORMED_RESPONSE';
      throw err;
    }

    return data;
  }

  /**
   * Normalize FreeAstroAPI V2 calculate response into the Astro-AI canonical format.
   *
   * @param {object} apiData - Raw JSON response from FreeAstroAPI
   * @param {object} profile - Original user birth profile
   * @returns {object} Canonical chart bundle
   */
  normalizeResponse(apiData, profile) {
    const rawChart = apiData.chart;
    const rawAsc = rawChart.ascendant;

    if (!rawAsc || rawAsc.sign_id == null) {
      const err = new Error('FreeAstroAPI response missing valid Ascendant data.');
      err.code = 'MALFORMED_RESPONSE';
      throw err;
    }

    // 1. Ascendant / Lagna
    // sign_id is 1..12 (1 = Aries, 2 = Taurus ... 12 = Pisces)
    const lagnaSignNum = rawAsc.sign_id;
    const lagnaSignIdx = lagnaSignNum - 1;
    const lagnaSign = rawAsc.sign || ZODIAC_SIGNS[lagnaSignIdx];
    const lagnaDeg = rawAsc.degree != null
      ? (rawAsc.degree % 30).toFixed(1)
      : '0.0';
    const lagnaLon = rawAsc.degree != null
      ? parseFloat(rawAsc.degree.toFixed(2))
      : (lagnaSignIdx * 30 + parseFloat(lagnaDeg));

    const lagnaObj = {
      signIndex: lagnaSignIdx,
      signIdx: lagnaSignIdx,
      signNum: lagnaSignNum,
      sign: lagnaSign,
      signAbbr: PLANET_ABBR[lagnaSign] || lagnaSign.slice(0, 2),
      deg: lagnaDeg,
      lon: lagnaLon,
      house: 1,
      nakshatra: rawAsc.nakshatra?.name || '',
      pada: rawAsc.nakshatra?.pada || null,
    };

    // 2. Planets
    const rawPlanets = Array.isArray(rawChart.planets) ? rawChart.planets : [];
    const planets = rawPlanets.map((p) => {
      const pSignNum = p.sign_id != null ? p.sign_id : (ZODIAC_SIGNS.indexOf(p.sign) + 1);
      const pSignIdx = pSignNum > 0 ? pSignNum - 1 : 0;
      const pSign = p.sign || ZODIAC_SIGNS[pSignIdx];
      const pDeg = p.degree_in_sign != null
        ? parseFloat(p.degree_in_sign).toFixed(1)
        : (p.absolute_degree != null ? (p.absolute_degree % 30).toFixed(1) : '0.0');
      const pLon = p.absolute_degree != null
        ? parseFloat(p.absolute_degree.toFixed(2))
        : (pSignIdx * 30 + parseFloat(pDeg));

      // Use FreeAstroAPI house, or whole-sign fallback relative to Lagna
      let house = p.house;
      if (house == null || house < 1 || house > 12) {
        house = ((pSignIdx - lagnaSignIdx + 12) % 12) + 1;
      }

      const nakName = typeof p.nakshatra === 'string'
        ? p.nakshatra
        : (p.nakshatra?.name || '');
      const pada = p.pada ?? (p.nakshatra?.pada || null);
      const dignity = getPlanetDignity(p.name, pSignIdx);

      return {
        name: p.name,
        abbr: PLANET_ABBR[p.name] || p.name.slice(0, 2),
        lon: pLon,
        sign: pSign,
        signIdx: pSignIdx,
        signIndex: pSignIdx,
        signNum: pSignNum,
        deg: pDeg,
        house,
        isRetrograde: Boolean(p.is_retrograde),
        speed: p.is_retrograde ? -0.5 : 1.0,
        nakshatra: nakName,
        pada,
        dignity,
        color: PLANET_COLORS[p.name] || '#ffffff',
        nakshatraLord: p.nakshatra_lord || null,
      };
    });

    // 3. Whole Sign Houses (1..12)
    const houses = buildHouses(planets, lagnaSignIdx);

    // 4. Moon & Nakshatra
    const moonPlanet = planets.find(p => p.name === 'Moon') || planets[0];
    const moonNakshatra = {
      name: moonPlanet?.nakshatra || apiData.vimshottari_dasha?.moon_nakshatra?.name || 'Rohini',
      pada: moonPlanet?.pada || apiData.vimshottari_dasha?.moon_nakshatra?.pada || 1,
      lord: apiData.vimshottari_dasha?.moon_nakshatra?.lord || 'Moon',
      index: apiData.vimshottari_dasha?.moon_nakshatra?.id || 1,
    };

    // 5. Vimshottari Dasha
    const rawDasha = apiData.vimshottari_dasha || {};
    const activePeriods = Array.isArray(rawDasha.active_periods) ? rawDasha.active_periods : [];
    const timeline = Array.isArray(rawDasha.timeline) ? rawDasha.timeline : [];

    const mdActive = activePeriods.find(p => p.level === 'Mahadasha') || activePeriods[0];
    const adActive = activePeriods.find(p => p.level === 'Antardasha' || p.level === 'Pratyantardasha') || activePeriods[1];

    const currentMahadasha = mdActive ? {
      planet: mdActive.lord,
      lord: mdActive.lord,
      startDate: mdActive.start,
      endDate: mdActive.end,
      durationYears: mdActive.duration_years,
      remainingYears: mdActive.remaining_years,
    } : {
      planet: timeline[0]?.lord || 'Saturn',
      lord: timeline[0]?.lord || 'Saturn',
      startDate: timeline[0]?.start || '2020-01-01',
      endDate: timeline[0]?.end || '2039-01-01',
    };

    const currentAntardasha = adActive ? {
      planet: adActive.lord,
      lord: adActive.lord,
      startDate: adActive.start,
      endDate: adActive.end,
      durationYears: adActive.duration_years,
      remainingYears: adActive.remaining_years,
    } : {
      planet: 'Mercury',
      lord: 'Mercury',
      startDate: currentMahadasha.startDate,
      endDate: currentMahadasha.endDate,
    };

    const mahadashaList = timeline.map(item => ({
      lord: item.lord,
      planet: item.lord,
      start: item.start,
      startDate: item.start,
      end: item.end,
      endDate: item.end,
      durationYears: item.duration_years,
      years: item.duration_years,
      antardashas: Array.isArray(item.sub_periods) ? item.sub_periods.map(sub => ({
        lord: sub.lord,
        planet: sub.lord,
        start: sub.start,
        startDate: sub.start,
        end: sub.end,
        endDate: sub.end,
        durationYears: sub.duration_years,
        years: sub.duration_years,
      })) : [],
    }));

    const dashaInfo = {
      moonNakshatra,
      birthBalance: rawDasha.birth_balance || null,
      activePeriods,
      currentMahadasha,
      currentAntardasha,
      currentDasha: currentMahadasha,
      antardasha: currentAntardasha,
      mahadashaList,
      dashas: mahadashaList,
      timeline,
    };

    // 6. Divisional Charts (D1, D2, D3, D7, D9, D10, D12, D30, D60)
    const rawVargas = apiData.vargas?.vargas || {};
    const divisionals = {};
    const DIV_KEYS = ['D1', 'D2', 'D3', 'D7', 'D9', 'D10', 'D12', 'D30', 'D60'];

    for (const key of DIV_KEYS) {
      const vData = rawVargas[key];
      if (vData && vData.ascendant) {
        const vAsc = vData.ascendant;
        const vSignNum = vAsc.sign_id != null ? vAsc.sign_id : (ZODIAC_SIGNS.indexOf(vAsc.sign) + 1);
        const vSignIdx = vSignNum > 0 ? vSignNum - 1 : 0;
        const vSign = vAsc.sign || ZODIAC_SIGNS[vSignIdx];

        const vPlanets = (vData.planets || []).map(p => {
          const pSNum = p.sign_id != null ? p.sign_id : (ZODIAC_SIGNS.indexOf(p.sign) + 1);
          const pSIdx = pSNum > 0 ? pSNum - 1 : 0;
          return {
            name: p.name,
            abbr: PLANET_ABBR[p.name] || p.name.slice(0, 2),
            sign: p.sign || ZODIAC_SIGNS[pSIdx],
            signIdx: pSIdx,
            signIndex: pSIdx,
            signNum: pSNum,
            house: p.house != null ? p.house : (((pSIdx - vSignIdx + 12) % 12) + 1),
            color: PLANET_COLORS[p.name] || '#ffffff',
          };
        });

        const vHouses = (vData.houses || []).map(h => {
          const hSNum = h.sign_id != null ? h.sign_id : (ZODIAC_SIGNS.indexOf(h.sign) + 1);
          const hSIdx = hSNum > 0 ? hSNum - 1 : 0;
          const hSign = h.sign || ZODIAC_SIGNS[hSIdx];
          return {
            number: h.house,
            sign: hSign,
            signIdx: hSIdx,
            signNum: hSNum,
            lord: SIGN_LORDS[hSign] || '',
            planets: vPlanets.filter(p => p.house === h.house),
          };
        });

        const normalizedVarga = {
          type: key.toLowerCase(),
          source: 'freeastroapi',
          division: vData.division,
          name: vData.name,
          lagnaSign: vSign,
          lagnaSignIdx: vSignIdx,
          lagna: {
            sign: vSign,
            signIndex: vSignIdx,
            signNum: vSignNum,
            house: 1,
            deg: vAsc.degree != null ? (vAsc.degree % 30).toFixed(1) : '0.0',
          },
          planets: vPlanets,
          houses: vHouses.length === 12 ? vHouses : buildHouses(vPlanets, vSignIdx),
        };

        divisionals[key.toLowerCase()] = normalizedVarga;
      }
    }

    // 7. Life Domain Strengths
    const strengths = computeStrengths(planets);

    // 8. Canonical Chart Bundle Construction
    const generatedAt = new Date().toISOString();
    const metadata = {
      provider: 'freeastroapi',
      apiVersion: apiData.metadata?.endpoint_version || 'v2',
      rulesetVersion: apiData.metadata?.ruleset_version || null,
      ayanamsha: apiData.ayanamsha || 'lahiri',
      houseSystem: apiData.chart?.metadata?.house_system || 'whole_sign',
      nodeType: apiData.chart?.metadata?.node_type || 'mean',
      timezoneUsed: apiData.timezone_used || profile.timezone || 'Asia/Kolkata',
      generatedAt,
    };

    const natal = {
      source: 'freeastroapi',
      type: 'natal',
      ayanamsa: apiData.ayanamsha || 'lahiri',
      lagnaSid: lagnaLon,
      lagnaSignIdx,
      lagnaSign,
      lagnaSignAbbr: lagnaObj.signAbbr,
      lagnaDeg,
      lagna: lagnaObj,
      planets,
      houses,
      nakshatra: moonNakshatra,
      dashaInfo,
      dasha: dashaInfo,
      strengths,
      shadbala: apiData.shadbala || {},
      ashtakavarga: apiData.ashtakavarga || {},
      yogas: apiData.yogas?.yogas || [],
      panchang: apiData.panchang || null,
      sadeSati: apiData.chart?.sade_sati || null,
      divisionals,
      generatedAt,
      metadata,
    };

    return {
      source: 'freeastroapi',
      natal,
      bundle: {
        natal,
        d9: divisionals.d9 || null,
        d10: divisionals.d10 || null,
        d2: divisionals.d2 || null,
        d3: divisionals.d3 || null,
        d7: divisionals.d7 || null,
        d12: divisionals.d12 || null,
        d30: divisionals.d30 || null,
        d60: divisionals.d60 || null,
      },
      divisionals,
      metadata,
    };
  }

  /**
   * Primary Provider Method.
   * Accepts normalized birth profile, calls FreeAstroAPI, and returns canonical chart bundle.
   */
  async calculateChart(profile, options = {}, customFetch = null) {
    const payload = this.buildRequestPayload(profile, options);
    const apiData = await this.executeCalculation(payload, customFetch);
    return this.normalizeResponse(apiData, profile);
  }
}

export default FreeAstroApiAdapter;
