import swissEphEngine from '../swissEphemeris.js';
import { PLANETS } from '../constants/astrologyConstants.js';
import { formatSignObj, getPlanetDignity } from './signs.js';
import { getNakshatra } from './nakshatra.js';
import { getHouse, buildHouses } from './houses.js';

/**
 * Calculate current transit planetary longitudes for a given date, time, and location using Swiss Ephemeris.
 */
export async function calculateTransits({ date = new Date(), lat = 28.6139, lon = 77.2090, lagnaSignIdx = 0 }) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hourUTC = date.getUTCHours() + date.getUTCMinutes() / 60;

  const jd = await swissEphEngine.toJulianDay(year, month, day, hourUTC);
  const ayanamsa = await swissEphEngine.getAyanamsa(jd);

  const swe = await swissEphEngine.init();

  const PLANET_ID_MAP = {
    Sun: swe.SE_SUN,
    Moon: swe.SE_MOON,
    Mars: swe.SE_MARS,
    Mercury: swe.SE_MERCURY,
    Jupiter: swe.SE_JUPITER,
    Venus: swe.SE_VENUS,
    Saturn: swe.SE_SATURN,
    Rahu: swe.SE_MEAN_NODE,
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
      lon: parseFloat(pLon.toFixed(2)),
      speed: parseFloat(speed.toFixed(4)),
      isRetrograde,
      sign: signData.signName,
      signIdx: signData.signIndex,
      deg: signData.degree.toFixed(1),
      house,
      nakshatra: nakshatra.name,
      dignity,
    });
  }

  const houses = buildHouses(planets, lagnaSignIdx);

  return {
    source: 'swiss-ephemeris',
    type: 'transit',
    calculatedAt: date.toISOString(),
    jd,
    ayanamsa: parseFloat(ayanamsa.toFixed(4)),
    planets,
    houses,
  };
}
