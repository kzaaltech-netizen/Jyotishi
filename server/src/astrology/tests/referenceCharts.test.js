import { AstrologyService } from '../astrology.service.js';

/**
 * Automated Verification Suite for Swiss Ephemeris Vedic Engine.
 */
export async function runReferenceChartTests() {
  console.log('====================================================');
  console.log('  SWISS EPHEMERIS AUTOMATED CHART VALIDATION SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  function assertTolerance(actual, expected, maxDiff, name) {
    const diff = Math.abs(actual - expected);
    assert(diff <= maxDiff, `${name} longitude ${actual.toFixed(2)}° matches expected ${expected.toFixed(2)}° (diff: ${diff.toFixed(4)}°, max allowed: ${maxDiff}°)`);
  }

  // ─── CHART 1: Reference Natal Chart (1995-10-14 08:42 IST @ New Delhi) ───
  console.log('📌 Testing Reference Chart 1: 14-Oct-1995 08:42 IST (New Delhi)');
  try {
    const chart1 = await AstrologyService.calculateSwissBirthChart({
      dob: '1995-10-14',
      birthTime: '08:42',
      lat: 28.6139,
      lon: 77.2090,
      timezone: '+05:30'
    });

    assert(chart1.source === 'swiss-ephemeris', 'Engine source identified as swiss-ephemeris');
    assert(chart1.lagnaSign === 'Libra', `Lagna sign is Libra (actual: ${chart1.lagnaSign})`);
    assertTolerance(chart1.lagnaSid, 206.03, 1.0, 'Lagna');

    const sun = chart1.planets.find(p => p.name === 'Sun');
    assert(sun.sign === 'Virgo', `Sun sign is Virgo (actual: ${sun.sign})`);
    assertTolerance(sun.lon, 176.50, 0.5, 'Sun');

    const moon = chart1.planets.find(p => p.name === 'Moon');
    assert(moon.sign === 'Taurus', `Moon sign is Taurus (actual: ${moon.sign})`);
    assert(moon.dignity === 'Exalted', `Moon dignity is Exalted (actual: ${moon.dignity})`);
    assert(chart1.nakshatra.name === 'Mrigashira', `Moon Nakshatra is Mrigashira (actual: ${chart1.nakshatra.name})`);
    assert(chart1.nakshatra.lord === 'Mars', `Mrigashira lord is Mars (actual: ${chart1.nakshatra.lord})`);

    const mercury = chart1.planets.find(p => p.name === 'Mercury');
    assert(mercury.dignity === 'Exalted', `Mercury dignity is Exalted (actual: ${mercury.dignity})`);

    const venus = chart1.planets.find(p => p.name === 'Venus');
    assert(venus.dignity === 'Own Sign', `Venus dignity is Own Sign in Libra (actual: ${venus.dignity})`);

    const saturn = chart1.planets.find(p => p.name === 'Saturn');
    assert(saturn.dignity === 'Own Sign', `Saturn dignity is Own Sign in Aquarius (actual: ${saturn.dignity})`);

    assert(chart1.dashaInfo.currentMahadasha.planet !== undefined, `Vimshottari Dasha calculated cleanly (Mahadasha: ${chart1.dashaInfo.currentMahadasha.planet})`);

  } catch (err) {
    console.error('Chart 1 Exception:', err.stack || err.message);
    failed++;
  }

  // ─── CHART 2: Millennium Reference Chart (2000-01-01 12:00 UTC @ Greenwich) ───
  console.log('\n📌 Testing Reference Chart 2: 01-Jan-2000 12:00 UTC (Greenwich)');
  try {
    const chart2 = await AstrologyService.calculateSwissBirthChart({
      dob: '2000-01-01',
      birthTime: '12:00',
      lat: 51.4769,
      lon: 0.0005,
      timezone: '+00:00'
    });

    const sun2 = chart2.planets.find(p => p.name === 'Sun');
    assert(sun2.sign === 'Sagittarius', `Sun sign is Sagittarius (actual: ${sun2.sign})`);
    assertTolerance(sun2.lon, 256.52, 0.5, 'Sun 2000');

    const moon2 = chart2.planets.find(p => p.name === 'Moon');
    assert(moon2.sign === 'Libra', `Moon sign is Libra (actual: ${moon2.sign})`);
    assert(chart2.nakshatra.name === 'Swati', `Moon Nakshatra is Swati (actual: ${chart2.nakshatra.name})`);

  } catch (err) {
    console.error('Chart 2 Exception:', err.stack || err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED  `);
  console.log('====================================================\n');

  if (failed > 0) {
    throw new Error(`Swiss Ephemeris Validation Failed with ${failed} errors.`);
  }

  return { passed, failed };
}

// Run test if invoked directly
if (process.argv[1]?.includes('referenceCharts.test.js')) {
  runReferenceChartTests().then(() => process.exit(0)).catch(() => process.exit(1));
}
