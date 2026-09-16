/**
 * Base Astrology Provider Interface.
 * astro-ai-app interacts with astrology calculation sources solely through this abstraction.
 */
export class AstrologyProvider {
  /**
   * Calculate birth chart and divisional charts from normalized birth profile.
   *
   * @param {object} profile - User birth profile { dob, birthTime, lat, lon, timezone, birthplace }
   * @param {object} [options] - Calculation options (ayanamsha, house_system, etc.)
   * @returns {Promise<object>} Normalized canonical chart bundle
   */
  async calculateChart(profile, options = {}) {
    throw new Error('calculateChart() must be implemented by provider adapter');
  }

  /**
   * Provider identifier.
   * @returns {string}
   */
  getName() {
    throw new Error('getName() must be implemented by provider adapter');
  }
}

export default AstrologyProvider;
