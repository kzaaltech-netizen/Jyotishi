import SwissEph from 'swisseph-wasm';

class SwissEphemerisEngine {
  constructor() {
    this.swe = null;
    this.initialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initialized) return this.swe;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      console.log('[SwissEphemeris] Initializing WebAssembly engine (v2.10.03)...');
      const instance = new SwissEph();
      await instance.initSwissEph();
      
      // Configure Lahiri Sidereal mode
      instance.set_sid_mode(instance.SE_SIDM_LAHIRI, 0, 0);

      this.swe = instance;
      this.initialized = true;
      console.log(`[SwissEphemeris] Engine ready. Version: ${instance.version()}`);
      return instance;
    })();

    return this.initPromise;
  }

  /**
   * Convert UTC date & time to Julian Day number.
   */
  async toJulianDay(year, month, day, hourUTC = 0) {
    const swe = await this.init();
    return swe.julday(year, month, day, hourUTC, swe.SE_GREG_CAL);
  }

  /**
   * Get Lahiri Ayanamsa for a Julian Day.
   */
  async getAyanamsa(jd) {
    const swe = await this.init();
    return swe.get_ayanamsa_ut(jd);
  }

  /**
   * Calculate planetary longitude & speed.
   * ipl: SE_SUN, SE_MOON, SE_MARS, SE_MERCURY, SE_JUPITER, SE_VENUS, SE_SATURN, SE_MEAN_NODE
   */
  async calcPlanet(jd, ipl) {
    const swe = await this.init();
    const flags = swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
    const res = swe.calc_ut(jd, ipl, flags);

    const longitude = (res[0] % 360 + 360) % 360;
    const speed = res[3];
    const isRetrograde = speed < 0;

    return { longitude, speed, isRetrograde };
  }

  /**
   * Calculate Ascendant (Lagna) and MC.
   */
  async calcLagna(jd, lat, lon) {
    const swe = await this.init();
    const ayanamsa = await this.getAyanamsa(jd);
    // House system 'P' (Placidus) or 'W' (Whole Sign)
    const res = swe.houses(jd, lat, lon, 'P');
    const tropLagna = res.ascmc[0];
    const sidLagna = (tropLagna - ayanamsa + 360) % 360;

    return {
      tropicalLagna: tropLagna,
      siderealLagna: sidLagna,
      ayanamsa,
    };
  }
}

export const swissEphEngine = new SwissEphemerisEngine();
export default swissEphEngine;
