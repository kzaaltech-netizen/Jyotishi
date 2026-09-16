import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChartData, ZODIAC_SIGNS } from './chartDataNormalizer.js';
import { layoutPlanetsInHouse, layoutPlanetsInSouthBox } from './planetLayoutEngine.js';

test('Chart Validation Suite — Phase 2 Kundli & Chart System', async (t) => {

  // ─── 1. ALL 12 ASCENDANTS TEST ──────────────────────────────────────────────
  await t.test('All 12 Ascendants map signs and house numbers accurately without silent Aries fallback', () => {
    ZODIAC_SIGNS.forEach((signName, expectedSignIdx) => {
      const mockRawChart = {
        lagna: {
          sign: signName,
          signIndex: expectedSignIdx,
          deg: '15.2',
        },
        planets: [
          { name: 'Sun', sign: signName, signIdx: expectedSignIdx, deg: '10.0', house: 1 }
        ],
      };

      const result = normalizeChartData(mockRawChart);

      assert.equal(result.isValid, true, `Chart should be valid for ${signName}`);
      assert.equal(result.lagna.sign, signName, `Lagna sign should be ${signName}`);
      assert.equal(result.lagna.signIdx, expectedSignIdx, `Lagna signIdx should be ${expectedSignIdx}`);
      assert.equal(result.lagna.signNum, expectedSignIdx + 1, `Lagna signNum should be ${expectedSignIdx + 1}`);

      // Crucial: House 1 must have the exact Lagna sign number!
      assert.equal(result.houses[0].number, 1);
      assert.equal(
        result.houses[0].signNum,
        expectedSignIdx + 1,
        `House 1 for ${signName} Ascendant must have signNum ${expectedSignIdx + 1}, NEVER defaulted to 1!`
      );
      assert.equal(result.houses[0].sign, signName);

      // Check all 12 houses wrap around accurately
      for (let h = 0; h < 12; h++) {
        const expectedHSignIdx = (expectedSignIdx + h) % 12;
        const houseObj = result.houses[h];
        assert.equal(houseObj.number, h + 1, `House index ${h} should be number ${h + 1}`);
        assert.equal(houseObj.signIdx, expectedHSignIdx, `House ${h + 1} signIdx should match sequence`);
        assert.equal(houseObj.signNum, expectedHSignIdx + 1, `House ${h + 1} signNum should be 1-indexed`);
        assert.equal(houseObj.sign, ZODIAC_SIGNS[expectedHSignIdx], `House ${h + 1} sign name should match`);
      }
    });
  });

  // ─── 2. TAURUS ASCENDANT SPECIFIC VERIFICATION ─────────────────────────────
  await t.test('Specific User Case: Taurus Lagna gives H1=Taurus, H2=Gemini, H12=Aries', () => {
    const taurusChart = {
      lagna: { sign: 'Taurus', signIndex: 1, deg: '12.4' },
      planets: [],
    };

    const normalized = normalizeChartData(taurusChart);
    assert.equal(normalized.isValid, true);
    assert.equal(normalized.houses[0].sign, 'Taurus');
    assert.equal(normalized.houses[0].signNum, 2);
    assert.equal(normalized.houses[1].sign, 'Gemini');
    assert.equal(normalized.houses[1].signNum, 3);
    assert.equal(normalized.houses[11].sign, 'Aries');
    assert.equal(normalized.houses[11].signNum, 1);
  });

  // ─── 3. DETERMINISTIC PLANET LAYOUT ENGINE ──────────────────────────────────
  await t.test('Planet layout engine prevents coordinate collisions for 1, 2, 3, 4, 5+ planets', () => {
    const dummyPlanets = [
      { name: 'Sun', abbr: 'Su', deg: '14' },
      { name: 'Moon', abbr: 'Mo', deg: '08' },
      { name: 'Mars', abbr: 'Ma', deg: '22' },
      { name: 'Jupiter', abbr: 'Ju', deg: '05' },
      { name: 'Venus', abbr: 'Ve', deg: '19' },
    ];

    // Test North Indian Diamond (House 1: cx=200, cy=100)
    for (let count = 1; count <= 5; count++) {
      const subset = dummyPlanets.slice(0, count);
      const positioned = layoutPlanetsInHouse(1, subset);

      assert.equal(positioned.length, count);

      // Verify all coordinates are finite numbers
      positioned.forEach((p) => {
        assert.equal(typeof p.x, 'number');
        assert.equal(typeof p.y, 'number');
        assert.ok(!Number.isNaN(p.x) && !Number.isNaN(p.y));
        // Must stay reasonably close to house centroid without escaping
        assert.ok(Math.abs(p.x - 200) <= 60, `Planet ${p.name} x=${p.x} within bounds`);
        assert.ok(Math.abs(p.y - 100) <= 60, `Planet ${p.name} y=${p.y} within bounds`);
      });

      // Verify no two planets share the exact same coordinates (collision avoidance)
      if (count > 1) {
        for (let i = 0; i < positioned.length; i++) {
          for (let j = i + 1; j < positioned.length; j++) {
            const dist = Math.hypot(positioned[i].x - positioned[j].x, positioned[i].y - positioned[j].y);
            assert.ok(dist >= 12, `Planets ${positioned[i].name} and ${positioned[j].name} must not collide (dist=${dist})`);
          }
        }
      }
    }

    // Test South Indian Fixed Box (Box x=100, y=0)
    for (let count = 1; count <= 5; count++) {
      const subset = dummyPlanets.slice(0, count);
      const positioned = layoutPlanetsInSouthBox(100, 0, subset);

      assert.equal(positioned.length, count);
      positioned.forEach((p) => {
        assert.ok(p.x >= 110 && p.x <= 190, `South planet x=${p.x} inside 100-200 box`);
        assert.ok(p.y >= 20 && p.y <= 95, `South planet y=${p.y} inside 0-100 box`);
      });
    }
  });

  // ─── 4. MISSING AND INVALID DATA RESILIENCE ─────────────────────────────────
  await t.test('Handles missing and invalid chart data gracefully without crashing or false Aries default', () => {
    // Null / Undefined
    const nullRes = normalizeChartData(null);
    assert.equal(nullRes.isValid, false);
    assert.ok(nullRes.error.length > 0);

    // Empty object
    const emptyRes = normalizeChartData({});
    assert.equal(emptyRes.isValid, false);
    assert.ok(emptyRes.error.includes('Ascendant'));

    // Out of range lagna index
    const invalidIndexRes = normalizeChartData({ lagna: { signIndex: 99 } });
    assert.equal(invalidIndexRes.isValid, false);

    // Missing planets array should not throw
    const noPlanetsRes = normalizeChartData({ lagna: { sign: 'Leo', signIndex: 4 } });
    assert.equal(noPlanetsRes.isValid, true);
    assert.equal(noPlanetsRes.planets.length, 0);
  });

  // ─── 5. PROVIDER AGNOSTICISM ───────────────────────────────────────────────
  await t.test('Normalizer accepts multiple calculation provider schemas without provider lock-in', () => {
    // Provider Format 1: Swiss Ephemeris / Canonical Service format
    const formatSwiss = {
      source: 'swiss-ephemeris',
      lagna: { sign: 'Virgo', signIndex: 5, deg: '03.2' },
      planets: [{ name: 'Mercury', sign: 'Virgo', signIdx: 5, lon: 153.2, isRetrograde: false }],
    };

    // Provider Format 2: Flat API format
    const formatFlatApi = {
      source: 'third-party-vedic-api',
      lagnaSign: 'Virgo',
      lagnaSignIdx: 5,
      lagnaDeg: '03.2',
      planets: [{ name: 'Mercury', sign: 'Virgo', signIndex: 5, deg: '03.2', isRetrograde: false }],
    };

    // Provider Format 3: House-based format
    const formatHouseBased = {
      source: 'internal-engine',
      houses: [{ number: 1, sign: 'Virgo', signIdx: 5 }],
      planets: [{ name: 'Mercury', sign: 'Virgo', house: 1, deg: '03.2' }],
    };

    const res1 = normalizeChartData(formatSwiss);
    const res2 = normalizeChartData(formatFlatApi);
    const res3 = normalizeChartData(formatHouseBased);

    assert.equal(res1.isValid, true);
    assert.equal(res2.isValid, true);
    assert.equal(res3.isValid, true);

    // All must yield identical canonical lagna and house 1
    assert.equal(res1.lagna.sign, 'Virgo');
    assert.equal(res2.lagna.sign, 'Virgo');
    assert.equal(res3.lagna.sign, 'Virgo');

    assert.equal(res1.houses[0].signNum, 6);
    assert.equal(res2.houses[0].signNum, 6);
    assert.equal(res3.houses[0].signNum, 6);
  });

  // ─── 6. RETROGRADE, NAKSHATRA & DIGNITY PRESERVATION ───────────────────────
  await t.test('Preserves retrograde flags, Nakshatra, Pada and calculates dignity appropriately', () => {
    const chart = {
      lagna: { sign: 'Leo', signIndex: 4, deg: '21.5' },
      planets: [
        {
          name: 'Jupiter',
          sign: 'Cancer',
          signIdx: 3,
          deg: '05.2',
          house: 12,
          isRetrograde: true,
          nakshatra: 'Pushya',
          pada: 2,
          dignity: 'Exalted',
        },
        {
          name: 'Saturn',
          sign: 'Aries',
          signIdx: 0,
          deg: '20.1',
          house: 9,
          isRetrograde: false,
          nakshatra: 'Bharani',
          pada: 3,
          dignity: 'Debilitated',
        },
      ],
    };

    const normalized = normalizeChartData(chart);
    assert.equal(normalized.isValid, true);

    const jup = normalized.planets.find(p => p.name === 'Jupiter');
    assert.equal(jup.isRetrograde, true);
    assert.equal(jup.nakshatra, 'Pushya');
    assert.equal(jup.pada, 2);
    assert.equal(jup.dignity, 'Exalted');
    assert.equal(jup.house, 12);

    const sat = normalized.planets.find(p => p.name === 'Saturn');
    assert.equal(sat.isRetrograde, false);
    assert.equal(sat.nakshatra, 'Bharani');
    assert.equal(sat.pada, 3);
    assert.equal(sat.dignity, 'Debilitated');
    assert.equal(sat.house, 9);
  });

  // ─── 7. DIVISIONAL CHARTS PRESERVATION ──────────────────────────────────────
  await t.test('Divisional charts (D1, D9, D10) can be independently normalized and consumed', () => {
    const parentChart = {
      lagna: { sign: 'Libra', signIndex: 6, deg: '10.0' },
      planets: [{ name: 'Venus', sign: 'Libra', signIdx: 6, house: 1 }],
      divisionals: {
        d9: {
          lagna: { sign: 'Sagittarius', signIndex: 8, deg: '00.0' },
          planets: [{ name: 'Venus', sign: 'Pisces', signIdx: 11, house: 4, dignity: 'Exalted' }],
        },
        d10: {
          lagna: { sign: 'Capricorn', signIndex: 9, deg: '00.0' },
          planets: [{ name: 'Venus', sign: 'Taurus', signIdx: 1, house: 5, dignity: 'Own Sign' }],
        },
      },
    };

    const d1 = normalizeChartData(parentChart);
    const d9 = normalizeChartData(parentChart.divisionals.d9);
    const d10 = normalizeChartData(parentChart.divisionals.d10);

    assert.equal(d1.lagna.sign, 'Libra');
    assert.equal(d1.houses[0].sign, 'Libra');

    assert.equal(d9.lagna.sign, 'Sagittarius');
    assert.equal(d9.houses[0].sign, 'Sagittarius');
    assert.equal(d9.houses[3].sign, 'Pisces'); // H4 in D9

    assert.equal(d10.lagna.sign, 'Capricorn');
    assert.equal(d10.houses[0].sign, 'Capricorn');
    assert.equal(d10.houses[4].sign, 'Taurus'); // H5 in D10
  });

});

