import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { normalizeChartData, SIGN_LORDS } from '../components/chart/chartDataNormalizer.js';

// One place to read the seeker's key placements. Returns nulls, never invented values.
export default function useChartSummary() {
  const { chartData, birthProfile, user } = useApp();

  return useMemo(() => {
    const norm = chartData ? normalizeChartData(chartData) : null;
    const valid = Boolean(norm?.isValid);
    const planets = valid ? norm.planets : [];
    const houses = valid ? norm.houses : [];
    const lagna = valid ? norm.lagna : null;
    const moon = planets.find((p) => p.name === 'Moon') || null;
    const dasha = valid ? norm.dasha || {} : {};
    const maha = dasha.currentMahadasha?.planet || dasha.currentMahadasha?.lord || null;
    const antar = dasha.currentAntardasha?.planet || dasha.currentAntardasha?.lord || null;

    return {
      norm,
      valid,
      planets,
      houses,
      house: (n) => houses.find((h) => h.number === n) || null,
      planet: (name) => planets.find((p) => p.name === name) || null,
      lagna,
      lagnaLord: lagna?.sign ? SIGN_LORDS[lagna.sign] : null,
      moon,
      moonNakshatra: (valid && norm.nakshatra?.name) || moon?.nakshatra || chartData?.nakshatra?.name || null,
      nakshatraPada: (valid && norm.nakshatra?.pada) || moon?.pada || null,
      dasha,
      maha,
      antar,
      dashaLabel: maha && antar ? `${maha}–${antar}` : maha,
      // Guests are created as 'Seeker'; that is not a name to greet.
      firstName: (birthProfile?.fullName || (user?.name !== 'Seeker' && user?.name) || '').split(' ')[0] || null,
      fullName: birthProfile?.fullName || user?.name || null,
    };
  }, [chartData, birthProfile, user]);
}
