import test from 'node:test';
import assert from 'node:assert/strict';
import { FreeAstroApiAdapter } from '../providers/freeAstroApi.adapter.js';
import { AstrologyService, CHART_STATUS } from '../astrology.service.js';
import { KarmaAgent } from '../../ai/agents/KarmaAgent.js';
import { PromptBuilder } from '../../ai/prompts/promptBuilder.js';

// Real sample FreeAstroAPI V2 calculate payload taken directly from documentation
const MOCK_FREEASTROAPI_RESPONSE = {
  ayanamsha: 'lahiri',
  timezone_used: 'Asia/Kolkata',
  chart: {
    ascendant: {
      degree: 58.7441,
      sign: 'Taurus',
      sign_id: 2,
      nakshatra: {
        id: 5,
        name: 'Mrigashira',
        pada: 2,
        lord: 'Mars',
      },
    },
    planets: [
      {
        name: 'Sun',
        absolute_degree: 155.9362,
        sign: 'Virgo',
        sign_id: 6,
        degree_in_sign: 5.9362,
        house: 5,
        is_retrograde: false,
        nakshatra: 'Uttara Phalguni',
        nakshatra_id: 12,
        pada: 3,
        nakshatra_lord: 'Sun',
      },
      {
        name: 'Moon',
        absolute_degree: 56.0529,
        sign: 'Taurus',
        sign_id: 2,
        degree_in_sign: 26.0529,
        house: 1,
        is_retrograde: false,
        nakshatra: 'Mrigashira',
        nakshatra_id: 5,
        pada: 1,
        nakshatra_lord: 'Mars',
      },
      {
        name: 'Mars',
        absolute_degree: 211.8965,
        sign: 'Scorpio',
        sign_id: 8,
        degree_in_sign: 1.8965,
        house: 7,
        is_retrograde: false,
        nakshatra: 'Vishakha',
        nakshatra_id: 16,
        pada: 4,
        nakshatra_lord: 'Jupiter',
      },
      {
        name: 'Mercury',
        absolute_degree: 139.8928,
        sign: 'Leo',
        sign_id: 5,
        degree_in_sign: 19.8928,
        house: 4,
        is_retrograde: false,
        nakshatra: 'Purva Phalguni',
        nakshatra_id: 11,
        pada: 2,
        nakshatra_lord: 'Venus',
      },
      {
        name: 'Jupiter',
        absolute_degree: 288.6611,
        sign: 'Capricorn',
        sign_id: 10,
        degree_in_sign: 18.6611,
        house: 9,
        is_retrograde: true,
        nakshatra: 'Shravana',
        nakshatra_id: 22,
        pada: 3,
        nakshatra_lord: 'Moon',
      },
      {
        name: 'Venus',
        absolute_degree: 198.4909,
        sign: 'Libra',
        sign_id: 7,
        degree_in_sign: 18.4909,
        house: 6,
        is_retrograde: false,
        nakshatra: 'Swati',
        nakshatra_id: 15,
        pada: 4,
        nakshatra_lord: 'Rahu',
      },
      {
        name: 'Saturn',
        absolute_degree: 354.4198,
        sign: 'Pisces',
        sign_id: 12,
        degree_in_sign: 24.4198,
        house: 11,
        is_retrograde: true,
        nakshatra: 'Revati',
        nakshatra_id: 27,
        pada: 3,
        nakshatra_lord: 'Mercury',
      },
      {
        name: 'Rahu',
        absolute_degree: 145.2107,
        sign: 'Leo',
        sign_id: 5,
        degree_in_sign: 25.2107,
        house: 4,
        is_retrograde: true,
        nakshatra: 'Purva Phalguni',
        nakshatra_id: 11,
        pada: 4,
        nakshatra_lord: 'Venus',
      },
      {
        name: 'Ketu',
        absolute_degree: 325.2107,
        sign: 'Aquarius',
        sign_id: 11,
        degree_in_sign: 25.2107,
        house: 10,
        is_retrograde: true,
        nakshatra: 'Purva Bhadrapada',
        nakshatra_id: 25,
        pada: 2,
        nakshatra_lord: 'Jupiter',
      },
    ],
    houses: [
      { house: 1, sign: 'Taurus', sign_id: 2, degree_cusp: 0 },
      { house: 2, sign: 'Gemini', sign_id: 3, degree_cusp: 0 },
      { house: 3, sign: 'Cancer', sign_id: 4, degree_cusp: 0 },
      { house: 4, sign: 'Leo', sign_id: 5, degree_cusp: 0 },
      { house: 5, sign: 'Virgo', sign_id: 6, degree_cusp: 0 },
      { house: 6, sign: 'Libra', sign_id: 7, degree_cusp: 0 },
      { house: 7, sign: 'Scorpio', sign_id: 8, degree_cusp: 0 },
      { house: 8, sign: 'Sagittarius', sign_id: 9, degree_cusp: 0 },
      { house: 9, sign: 'Capricorn', sign_id: 10, degree_cusp: 0 },
      { house: 10, sign: 'Aquarius', sign_id: 11, degree_cusp: 0 },
      { house: 11, sign: 'Pisces', sign_id: 12, degree_cusp: 0 },
      { house: 12, sign: 'Aries', sign_id: 1, degree_cusp: 0 },
    ],
    sade_sati: { active: false, phase: null, description: 'Sade Sati not active' },
    metadata: {
      endpoint_version: 'v2',
      ruleset_version: 'classical_chart_v1',
      ayanamsha: 'lahiri',
      house_system: 'whole_sign',
      node_type: 'mean',
      timezone_used: 'Asia/Kolkata',
    },
  },
  vargas: {
    vargas: {
      D1: {
        division: 1,
        name: 'Rashi',
        ascendant: { degree: 58.7441, sign: 'Taurus', sign_id: 2, house: 1 },
        planets: [
          { name: 'Sun', sign: 'Virgo', sign_id: 6, house: 5 },
          { name: 'Moon', sign: 'Taurus', sign_id: 2, house: 1 },
        ],
        houses: [
          { house: 1, sign: 'Taurus', sign_id: 2 },
          { house: 2, sign: 'Gemini', sign_id: 3 },
        ],
      },
      D9: {
        division: 9,
        name: 'Navamsha',
        ascendant: { sign: 'Virgo', sign_id: 6, house: 1 },
        planets: [
          { name: 'Sun', sign: 'Aquarius', sign_id: 11, house: 6 },
          { name: 'Moon', sign: 'Leo', sign_id: 5, house: 12 },
          { name: 'Mercury', sign: 'Virgo', sign_id: 6, house: 1 },
        ],
        houses: [
          { house: 1, sign: 'Virgo', sign_id: 6 },
          { house: 2, sign: 'Libra', sign_id: 7 },
        ],
      },
      D10: {
        division: 10,
        name: 'Dashamsha',
        ascendant: { sign: 'Libra', sign_id: 7, house: 1 },
        planets: [
          { name: 'Sun', sign: 'Gemini', sign_id: 3, house: 9 },
          { name: 'Saturn', sign: 'Cancer', sign_id: 4, house: 10 },
        ],
        houses: [
          { house: 1, sign: 'Libra', sign_id: 7 },
          { house: 2, sign: 'Scorpio', sign_id: 8 },
        ],
      },
    },
    metadata: {
      endpoint_version: 'v2',
      requested_divisions: [1, 9, 10, 60],
    },
  },
  vimshottari_dasha: {
    moon_nakshatra: { id: 5, name: 'Mrigashira', pada: 1, lord: 'Mars' },
    birth_balance: {
      lord: 'Mars',
      actual_start: '1996-04-19',
      birth_date: '1997-09-22',
      end: '2003-04-19',
      full_duration_years: 7,
      remaining_years: 5.5715,
    },
    active_periods: [
      {
        level: 'Mahadasha',
        lord: 'Jupiter',
        start: '2021-04-20',
        end: '2037-04-20',
        duration_years: 16,
        remaining_years: 10.9897,
      },
      {
        level: 'Antardasha',
        lord: 'Mercury',
        start: '2025-12-20',
        end: '2028-03-27',
        duration_years: 2.2669,
        remaining_years: 1.9247,
      },
    ],
    timeline: [
      {
        level: 'Mahadasha',
        lord: 'Mars',
        start: '1997-09-22',
        end: '2003-04-19',
        duration_years: 5.57,
        sub_periods: [
          { level: 'Antardasha', lord: 'Rahu', start: '1997-09-22', end: '1997-10-06', duration_years: 0.04 },
          { level: 'Antardasha', lord: 'Jupiter', start: '1997-10-06', end: '1998-09-12', duration_years: 0.93 },
        ],
      },
      {
        level: 'Mahadasha',
        lord: 'Jupiter',
        start: '2021-04-20',
        end: '2037-04-20',
        duration_years: 16,
        sub_periods: [],
      },
    ],
  },
  yogas: {
    yogas: [
      {
        id: 'ruchaka_yoga',
        name: 'Ruchaka Yoga',
        type: 'raj_yoga',
        category: 'Panch Mahapurusha',
        active: true,
        description: 'Mars in own or exalted sign in a kendra from Lagna.',
        planets: ['Mars'],
        houses_involved: [7],
        strength: 'Strong',
      },
    ],
  },
  metadata: {
    endpoint_version: 'v2',
    ruleset_version: 'classical_calculate_v1',
  },
};

test('FreeAstroAPI Integration Suite', async (t) => {
  const profile = {
    dob: '1997-09-22',
    birthTime: '23:25',
    lat: 19.3919,
    lon: 72.8397,
    timezone: 'Asia/Kolkata',
    birthplace: 'Mumbai',
  };

  await t.test('1. Provider Request Payload: Formats birth data and settings strictly per API doc', () => {
    const adapter = new FreeAstroApiAdapter();
    const payload = adapter.buildRequestPayload(profile);

    assert.equal(payload.year, 1997);
    assert.equal(payload.month, 9);
    assert.equal(payload.day, 22);
    assert.equal(payload.hour, 23);
    assert.equal(payload.minute, 25);
    assert.equal(payload.lat, 19.3919);
    assert.equal(payload.lng, 72.8397);
    assert.equal(payload.tz_str, 'Asia/Kolkata');
    assert.equal(payload.ayanamsha, 'lahiri');
    assert.equal(payload.house_system, 'whole_sign');
    assert.equal(payload.node_type, 'mean');
    assert.deepEqual(payload.vargas, [1, 2, 3, 7, 9, 10, 12, 30, 60]);
    assert.equal(payload.dasha_levels, 2);
  });

  await t.test('2. Error Handling: Missing API Key throws clean error', async () => {
    const origKey = process.env.FREEASTROAPI_API_KEY;
    const origAltKey = process.env.FREE_ASTRO_API_KEY;
    delete process.env.FREEASTROAPI_API_KEY;
    delete process.env.FREE_ASTRO_API_KEY;

    try {
      const adapter = new FreeAstroApiAdapter();
      await assert.rejects(
        async () => {
          await adapter.executeCalculation({ year: 1997 });
        },
        (err) => {
          assert.equal(err.code, 'MISSING_API_KEY');
          assert.match(err.message, /Missing API key/);
          return true;
        }
      );
    } finally {
      if (origKey !== undefined) process.env.FREEASTROAPI_API_KEY = origKey;
      if (origAltKey !== undefined) process.env.FREE_ASTRO_API_KEY = origAltKey;
    }
  });

  await t.test('3. Error Handling: HTTP 401/403 Authentication Failure', async () => {
    const adapter = new FreeAstroApiAdapter();
    const mockFetch = async () => ({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => '{"detail":"Invalid API Key"}',
    });

    process.env.FREEASTROAPI_API_KEY = 'test_key';
    await assert.rejects(
      async () => {
        await adapter.executeCalculation({}, mockFetch);
      },
      (err) => {
        assert.equal(err.code, 'AUTH_FAILED');
        assert.equal(err.status, 403);
        assert.match(err.message, /authentication failed/i);
        return true;
      }
    );
  });

  await t.test('4. Error Handling: HTTP 429 Rate Limit', async () => {
    const adapter = new FreeAstroApiAdapter();
    const mockFetch = async () => ({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limit exceeded',
    });

    process.env.FREEASTROAPI_API_KEY = 'test_key';
    await assert.rejects(
      async () => {
        await adapter.executeCalculation({}, mockFetch);
      },
      (err) => {
        assert.equal(err.code, 'RATE_LIMIT');
        assert.equal(err.status, 429);
        assert.match(err.message, /rate limit/i);
        return true;
      }
    );
  });

  await t.test('5. Error Handling: Invalid birth data validation', () => {
    const adapter = new FreeAstroApiAdapter();
    assert.throws(
      () => adapter.buildRequestPayload({ dob: 'not-a-date' }),
      /Valid date of birth/
    );
    assert.throws(
      () => adapter.buildRequestPayload({ dob: '1997-09-22', lat: 999 }),
      /Valid latitude/
    );
  });

  await t.test('6. Normalization: Maps Taurus Ascendant, Signs, Houses, Degrees, and Dignity correctly without Aries fallback', () => {
    const adapter = new FreeAstroApiAdapter();
    const normalized = adapter.normalizeResponse(MOCK_FREEASTROAPI_RESPONSE, profile);
    const natal = normalized.natal;

    // Ascendant check
    assert.equal(natal.lagna.sign, 'Taurus');
    assert.equal(natal.lagna.signNum, 2);
    assert.equal(natal.lagna.signIndex, 1);
    assert.equal(natal.lagna.deg, '28.7');
    assert.equal(natal.lagna.nakshatra, 'Mrigashira');
    assert.equal(natal.lagna.pada, 2);

    // Houses whole sign check
    assert.equal(natal.houses.length, 12);
    assert.equal(natal.houses[0].number, 1);
    assert.equal(natal.houses[0].sign, 'Taurus');
    assert.equal(natal.houses[1].number, 2);
    assert.equal(natal.houses[1].sign, 'Gemini');
    assert.equal(natal.houses[6].number, 7);
    assert.equal(natal.houses[6].sign, 'Scorpio');
    assert.equal(natal.houses[11].number, 12);
    assert.equal(natal.houses[11].sign, 'Aries');

    // Planetary positions & dignities
    const sun = natal.planets.find((p) => p.name === 'Sun');
    assert.equal(sun.sign, 'Virgo');
    assert.equal(sun.house, 5);
    assert.equal(sun.deg, '5.9');

    const moon = natal.planets.find((p) => p.name === 'Moon');
    assert.equal(moon.sign, 'Taurus');
    assert.equal(moon.house, 1);
    assert.equal(moon.dignity, 'Exalted'); // Moon exalted in Taurus!

    const mars = natal.planets.find((p) => p.name === 'Mars');
    assert.equal(mars.sign, 'Scorpio');
    assert.equal(mars.house, 7);
    assert.equal(mars.dignity, 'Own Sign'); // Mars own sign in Scorpio!

    const saturn = natal.planets.find((p) => p.name === 'Saturn');
    assert.equal(saturn.sign, 'Pisces');
    assert.equal(saturn.house, 11);
    assert.equal(saturn.isRetrograde, true);

    // Vimshottari Dasha
    assert.equal(natal.dashaInfo.currentMahadasha.planet, 'Jupiter');
    assert.equal(natal.dashaInfo.currentMahadasha.startDate, '2021-04-20');
    assert.equal(natal.dashaInfo.currentAntardasha.planet, 'Mercury');
    assert.equal(natal.dashaInfo.currentAntardasha.startDate, '2025-12-20');
    assert.equal(natal.dashaInfo.birthBalance.lord, 'Mars');

    // Divisional charts
    assert.ok(normalized.divisionals.d9, 'D9 Navamsha present');
    assert.equal(normalized.divisionals.d9.lagnaSign, 'Virgo');
    assert.ok(normalized.divisionals.d10, 'D10 Dashamsha present');
    assert.equal(normalized.divisionals.d10.lagnaSign, 'Libra');

    // Metadata
    assert.equal(natal.metadata.provider, 'freeastroapi');
    assert.equal(natal.metadata.apiVersion, 'v2');
    assert.equal(natal.metadata.ayanamsha, 'lahiri');
    assert.equal(natal.metadata.houseSystem, 'whole_sign');
  });

  await t.test('7. Multiple Ascendants: Verifies Libra and Capricorn Ascendants map signs and houses without Aries fallback', () => {
    const adapter = new FreeAstroApiAdapter();

    // Libra Ascendant mock
    const libraResponse = {
      ...MOCK_FREEASTROAPI_RESPONSE,
      chart: {
        ...MOCK_FREEASTROAPI_RESPONSE.chart,
        ascendant: {
          degree: 185.2,
          sign: 'Libra',
          sign_id: 7,
          nakshatra: { name: 'Chitra', pada: 3 },
        },
      },
    };

    const libraNorm = adapter.normalizeResponse(libraResponse, profile).natal;
    assert.equal(libraNorm.lagna.sign, 'Libra');
    assert.equal(libraNorm.lagna.signNum, 7);
    assert.equal(libraNorm.houses[0].sign, 'Libra');
    assert.equal(libraNorm.houses[1].sign, 'Scorpio');
    assert.equal(libraNorm.houses[6].sign, 'Aries'); // 7th house is Aries
    assert.equal(libraNorm.houses[11].sign, 'Virgo'); // 12th house is Virgo

    // Capricorn Ascendant mock
    const capricornResponse = {
      ...MOCK_FREEASTROAPI_RESPONSE,
      chart: {
        ...MOCK_FREEASTROAPI_RESPONSE.chart,
        ascendant: {
          degree: 275.4,
          sign: 'Capricorn',
          sign_id: 10,
          nakshatra: { name: 'Uttara Ashadha', pada: 2 },
        },
      },
    };

    const capNorm = adapter.normalizeResponse(capricornResponse, profile).natal;
    assert.equal(capNorm.lagna.sign, 'Capricorn');
    assert.equal(capNorm.lagna.signNum, 10);
    assert.equal(capNorm.houses[0].sign, 'Capricorn');
    assert.equal(capNorm.houses[1].sign, 'Aquarius');
    assert.equal(capNorm.houses[6].sign, 'Cancer'); // 7th house is Cancer
    assert.equal(capNorm.houses[11].sign, 'Sagittarius'); // 12th house is Sagittarius
  });

  await t.test('8. AI Context Layer: KarmaAgent extracts real FreeAstroAPI facts into prompt', () => {
    const adapter = new FreeAstroApiAdapter();
    const normalized = adapter.normalizeResponse(MOCK_FREEASTROAPI_RESPONSE, profile);

    const chartBundle = {
      natal: normalized.natal,
      d10: normalized.divisionals.d10,
    };

    const domainFacts = KarmaAgent.getDomainFacts(chartBundle);
    assert.equal(domainFacts.d10Lagna, 'Libra');
    assert.equal(domainFacts.house10.sign, 'Aquarius');
    assert.equal(domainFacts.house10.lord, 'Saturn');
    assert.equal(domainFacts.dashaInfo.currentMahadasha.planet, 'Jupiter');

    // Test PromptBuilder generates system instruction with domain facts
    const promptConfig = PromptBuilder.buildPrompt({
      agent: KarmaAgent,
      chartBundle,
      birthProfile: profile,
      userMessage: 'How is my career growth and vocation looking?',
      chatHistory: [],
      preferences: { personality: 'Professional', language: 'English' },
      isInterpretation: false,
    });

    assert.match(promptConfig.systemInstruction, /HALLUCINATION GUARD RULES/);
    assert.match(promptConfig.systemInstruction, /Aquarius/);
    assert.match(promptConfig.systemInstruction, /Saturn/);
    assert.match(promptConfig.systemInstruction, /Jupiter/);
  });

  await t.test('9. Caching & Idempotency: First call invokes provider and caches; second call serves from cache without API call', async () => {
    let callCount = 0;
    const mockAdapter = {
      calculateChart: async (prof) => {
        callCount++;
        const adapter = new FreeAstroApiAdapter();
        return adapter.normalizeResponse(MOCK_FREEASTROAPI_RESPONSE, prof);
      },
    };

    const testUserId = 'test_user_cache_' + Date.now();
    // Create temporary test user and profile in prisma DB
    const prisma = (await import('../../db.js')).default;
    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Cache Test Seeker',
        email: `cache_test_${Date.now()}@example.com`,
        birthProfile: {
          create: {
            fullName: 'Cache Test Seeker',
            dob: '1997-09-22',
            birthTime: '23:25',
            birthplace: 'Mumbai',
            lat: 19.3919,
            lon: 72.8397,
            timezone: 'Asia/Kolkata',
          },
        },
      },
    });

    try {
      // 1st call: Should calculate via adapter and save to cache
      const firstResult = await AstrologyService.generateOrGetBundle(testUserId, false, mockAdapter);
      assert.equal(firstResult.cached, false);
      assert.equal(callCount, 1);
      assert.equal(firstResult.natal.lagna.sign, 'Taurus');

      // 2nd call: Should return cached data, callCount remains 1!
      const secondResult = await AstrologyService.generateOrGetBundle(testUserId, false, mockAdapter);
      assert.equal(secondResult.cached, true);
      assert.equal(callCount, 1); // No new external API call!
      assert.equal(secondResult.natal.lagna.sign, 'Taurus');

      // 3rd call: Force refresh triggers fresh calculation
      const thirdResult = await AstrologyService.generateOrGetBundle(testUserId, true, mockAdapter);
      assert.equal(thirdResult.cached, false);
      assert.equal(callCount, 2);
    } finally {
      // Clean up test user
      await prisma.chart.deleteMany({ where: { userId: testUserId } });
      await prisma.birthProfile.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  await t.test('10. Frontend Normalizer Compatibility: normalizeChartData validates FreeAstroAPI chart', async () => {
    const { normalizeChartData } = await import('../../../../src/components/chart/chartDataNormalizer.js');
    const adapter = new FreeAstroApiAdapter();
    const normalized = adapter.normalizeResponse(MOCK_FREEASTROAPI_RESPONSE, profile);

    const clientNormalized = normalizeChartData(normalized.natal);
    assert.equal(clientNormalized.isValid, true);
    assert.equal(clientNormalized.lagna.sign, 'Taurus');
    assert.equal(clientNormalized.lagna.signNum, 2);
    assert.equal(clientNormalized.houses[0].sign, 'Taurus');
    assert.equal(clientNormalized.houses[11].sign, 'Aries');
    assert.equal(clientNormalized.planets.length, 9);
    assert.equal(clientNormalized.dasha.currentMahadasha.planet, 'Jupiter');
  });
});
