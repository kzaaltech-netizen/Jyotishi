import prisma from '../db.js';
import { FreeAstroApiAdapter } from './providers/freeAstroApi.adapter.js';

export const CHART_STATUS = {
  GENERATING: 'GENERATING',
  READY: 'READY',
  FAILED: 'FAILED',
  STALE: 'STALE',
};

export class AstrologyService {
  /**
   * Primary FreeAstroAPI Birth Chart Calculator.
   *
   * @param {object} profile - { dob, birthTime, lat, lon, timezone, birthplace }
   * @param {object} [options] - Vedic calculation settings
   * @param {object} [customAdapter] - Optional dependency injection for testing
   * @returns {Promise<object>} Standardized Natal D1 Chart
   */
  static async calculateBirthChart(profile, options = {}, customAdapter = null) {
    const adapter = customAdapter || new FreeAstroApiAdapter();
    const result = await adapter.calculateChart(profile, options);
    return result.natal;
  }

  /**
   * Reference Swiss Ephemeris WASM calculation (retained for verification).
   */
  static async calculateSwissBirthChart(profile) {
    const swissEphEngine = (await import('./swissEphemeris.js')).default;
    const { validateBirthInput } = await import('./validators/inputValidator.js');
    const { PLANETS, PLANET_ABBR, PLANET_COLORS } = await import('./constants/astrologyConstants.js');
    const { formatSignObj, getPlanetDignity } = await import('./vedic/signs.js');
    const { getNakshatra } = await import('./vedic/nakshatra.js');
    const { getHouse, buildHouses, computeStrengths } = await import('./vedic/houses.js');
    const { calculateDasha } = await import('./vedic/dasha.js');

    const valid = validateBirthInput(profile);
    const { dob, birthTime, lat, lon, timezone } = valid;

    const [year, month, day] = dob.split('-').map(Number);
    const [hh, mm] = birthTime.split(':').map(Number);

    let tzOffsetHours = 5.5;
    if (timezone && /^[+-]\d{2}:\d{2}$/.test(timezone)) {
      const sign = timezone.startsWith('-') ? -1 : 1;
      const [h, m] = timezone.slice(1).split(':').map(Number);
      tzOffsetHours = sign * (h + m / 60);
    }

    const localHourDecimal = hh + mm / 60;
    let hourUTC = localHourDecimal - tzOffsetHours;
    let calcDay = day, calcMonth = month, calcYear = year;

    if (hourUTC < 0) {
      hourUTC += 24;
      calcDay -= 1;
    } else if (hourUTC >= 24) {
      hourUTC -= 24;
      calcDay += 1;
    }

    const jd = await swissEphEngine.toJulianDay(calcYear, calcMonth, calcDay, hourUTC);
    const ayanamsa = await swissEphEngine.getAyanamsa(jd);
    const lagnaRes = await swissEphEngine.calcLagna(jd, lat, lon);
    const lagnaSignData = formatSignObj(lagnaRes.siderealLagna);
    const lagnaSignIdx = lagnaSignData.signIndex;

    const lagnaObj = {
      lon: parseFloat(lagnaRes.siderealLagna.toFixed(2)),
      signIndex: lagnaSignIdx,
      sign: lagnaSignData.signName,
      signAbbr: lagnaSignData.signAbbr,
      deg: lagnaSignData.degree.toFixed(1),
      house: 1,
    };

    const swe = await swissEphEngine.init();
    const PLANET_ID_MAP = {
      Sun: swe.SE_SUN, Moon: swe.SE_MOON, Mars: swe.SE_MARS,
      Mercury: swe.SE_MERCURY, Jupiter: swe.SE_JUPITER, Venus: swe.SE_VENUS,
      Saturn: swe.SE_SATURN, Rahu: swe.SE_MEAN_NODE,
    };

    const planets = [];
    for (const name of PLANETS) {
      let pLon = 0, speed = 0, isRetrograde = false;
      if (name === 'Ketu') {
        const rahuRes = await swissEphEngine.calcPlanet(jd, swe.SE_MEAN_NODE);
        pLon = (rahuRes.longitude + 180) % 360;
        speed = rahuRes.speed;
        isRetrograde = true;
      } else {
        const pId = PLANET_ID_MAP[name];
        const res = await swissEphEngine.calcPlanet(jd, pId);
        pLon = res.longitude;
        speed = res.speed;
        isRetrograde = res.isRetrograde;
      }

      const signData = formatSignObj(pLon);
      const house = getHouse(signData.signIndex, lagnaSignIdx);
      const nakshatra = getNakshatra(pLon);
      const dignity = getPlanetDignity(name, signData.signIndex);

      planets.push({
        name,
        abbr: PLANET_ABBR[name] || name.slice(0, 2),
        lon: parseFloat(pLon.toFixed(2)),
        speed: parseFloat(speed.toFixed(4)),
        isRetrograde,
        sign: signData.signName,
        signIdx: signData.signIndex,
        deg: signData.degree.toFixed(1),
        house,
        nakshatra: nakshatra.name,
        nakshatraObj: nakshatra,
        dignity,
        color: PLANET_COLORS[name] || '#ffffff',
      });
    }

    const moonPlanet = planets.find(p => p.name === 'Moon');
    const moonNakshatra = getNakshatra(moonPlanet.lon);
    const houses = buildHouses(planets, lagnaSignIdx);
    const dashaInfo = calculateDasha(moonNakshatra.index, moonPlanet.lon, dob);
    const strengths = computeStrengths(planets);

    return {
      source: 'swiss-ephemeris',
      type: 'natal',
      jd,
      ayanamsa: parseFloat(ayanamsa.toFixed(4)),
      lagnaSid: lagnaObj.lon,
      lagnaSignIdx,
      lagnaSign: lagnaObj.sign,
      lagnaSignAbbr: lagnaObj.signAbbr,
      lagnaDeg: lagnaObj.deg,
      lagna: lagnaObj,
      planets,
      houses,
      nakshatra: moonNakshatra,
      dashaInfo,
      dasha: dashaInfo,
      strengths,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch stored chart from database.
   */
  static async getChart(userId, type = 'natal') {
    const record = await prisma.chart.findUnique({
      where: { userId_type: { userId, type } },
    });
    if (!record) return null;

    try {
      const chartData = JSON.parse(record.chartData);

      // If natal chart is fetched, automatically bundle stored divisional charts (D9, D10, etc.)
      if (type === 'natal') {
        const divRecords = await prisma.chart.findMany({
          where: {
            userId,
            type: { in: ['d9', 'd10', 'd2', 'd3', 'd7', 'd11', 'd12', 'd30', 'd60'] },
          },
        });
        const divisionals = { ...(chartData.divisionals || {}) };
        for (const div of divRecords) {
          try {
            divisionals[div.type] = JSON.parse(div.chartData);
          } catch (e) {}
        }
        chartData.divisionals = divisionals;
      }

      return {
        ...record,
        chartData,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Mark user's cached charts STALE when birth profile changes.
   */
  static async markChartsStale(userId) {
    try {
      await prisma.chart.updateMany({
        where: { userId },
        data: { status: CHART_STATUS.STALE },
      });
    } catch (e) {
      console.warn(`[AstrologyService] Could not mark charts stale for user ${userId}:`, e.message);
    }
  }

  /**
   * Generate or retrieve full chart bundle for user via FreeAstroAPI.
   * Database persistence ensures FreeAstroAPI is only called when charts are missing or force-refreshed.
   *
   * @param {string} userId
   * @param {boolean} [forceRefresh=false]
   * @param {object} [customAdapter=null]
   * @returns {Promise<object>}
   */
  static async generateOrGetBundle(userId, forceRefresh = false, customAdapter = null) {
    const profile = await prisma.birthProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error('Birth profile not found. Complete onboarding first.');
    }

    // 1. Caching check: return existing ready chart without calling external API
    if (!forceRefresh) {
      const existingNatal = await this.getChart(userId, 'natal');
      if (existingNatal && existingNatal.chartData && existingNatal.status === CHART_STATUS.READY) {
        const d9Record = await this.getChart(userId, 'd9');
        const d10Record = await this.getChart(userId, 'd10');
        const d2Record = await this.getChart(userId, 'd2');
        const d3Record = await this.getChart(userId, 'd3');
        const d7Record = await this.getChart(userId, 'd7');
        const d12Record = await this.getChart(userId, 'd12');
        const d30Record = await this.getChart(userId, 'd30');
        const d60Record = await this.getChart(userId, 'd60');

        let parsedMetadata = null;
        if (existingNatal.metadata) {
          try {
            parsedMetadata = JSON.parse(existingNatal.metadata);
          } catch (e) {
            parsedMetadata = null;
          }
        }

        return {
          natal: existingNatal.chartData,
          bundle: {
            natal: existingNatal.chartData,
            d9: d9Record?.chartData || existingNatal.chartData.divisionals?.d9 || null,
            d10: d10Record?.chartData || existingNatal.chartData.divisionals?.d10 || null,
            d2: d2Record?.chartData || existingNatal.chartData.divisionals?.d2 || null,
            d3: d3Record?.chartData || existingNatal.chartData.divisionals?.d3 || null,
            d7: d7Record?.chartData || existingNatal.chartData.divisionals?.d7 || null,
            d12: d12Record?.chartData || existingNatal.chartData.divisionals?.d12 || null,
            d30: d30Record?.chartData || existingNatal.chartData.divisionals?.d30 || null,
            d60: d60Record?.chartData || existingNatal.chartData.divisionals?.d60 || null,
          },
          cached: true,
          status: CHART_STATUS.READY,
          metadata: parsedMetadata || existingNatal.chartData?.metadata || null,
        };
      }
    }

    console.log(`[AstrologyService] Generating FreeAstroAPI Vedic chart bundle for user ${userId}`);

    // 2. Call FreeAstroAPI Adapter
    const adapter = customAdapter || new FreeAstroApiAdapter();
    const result = await adapter.calculateChart(profile);
    const { natal, bundle, divisionals, metadata } = result;

    const metadataStr = JSON.stringify(metadata);

    // 3. Persist normalized canonical results to Prisma database
    const upsertOps = [
      prisma.chart.upsert({
        where: { userId_type: { userId, type: 'natal' } },
        create: {
          userId,
          type: 'natal',
          status: CHART_STATUS.READY,
          chartData: JSON.stringify(natal),
          metadata: metadataStr,
        },
        update: {
          status: CHART_STATUS.READY,
          chartData: JSON.stringify(natal),
          metadata: metadataStr,
        },
      }),
    ];

    // Persist each divisional chart actually returned
    const divKeys = ['d1', 'd2', 'd3', 'd7', 'd9', 'd10', 'd12', 'd30', 'd60'];
    for (const divKey of divKeys) {
      if (divisionals && divisionals[divKey]) {
        upsertOps.push(
          prisma.chart.upsert({
            where: { userId_type: { userId, type: divKey } },
            create: {
              userId,
              type: divKey,
              status: CHART_STATUS.READY,
              chartData: JSON.stringify(divisionals[divKey]),
              metadata: metadataStr,
            },
            update: {
              status: CHART_STATUS.READY,
              chartData: JSON.stringify(divisionals[divKey]),
              metadata: metadataStr,
            },
          })
        );
      }
    }

    await prisma.$transaction(upsertOps);

    return {
      natal,
      bundle,
      cached: false,
      status: CHART_STATUS.READY,
      metadata,
    };
  }
}

export default AstrologyService;
