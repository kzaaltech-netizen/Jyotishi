// ─── Geocoding via OpenStreetMap Nominatim ────────────────────────────────────
// No API key required. Returns { lat, lon, timezone, displayName }

export async function geocodeCity(cityName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=5&addressdetails=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'AethericJyotish/1.0' }
  });
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  if (!data.length) throw new Error(`City not found: "${cityName}"`);

  const { lat, lon, display_name } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon), displayName: display_name };
}

// ─── Timezone via timeapi.io (free, no key required) ─────────────────────────
export async function getTimezone(lat, lon) {
  try {
    const res = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`
    );
    if (!res.ok) throw new Error('Timezone fetch failed');
    const data = await res.json();
    return data.timeZone || 'Asia/Kolkata';
  } catch {
    // Fallback: estimate offset from longitude
    return estimateTimezone(lon);
  }
}

function estimateTimezone(lon) {
  // Rough heuristic by longitude
  if (lon >= 68 && lon <= 97)  return 'Asia/Kolkata';
  if (lon >= -5 && lon <= 2)   return 'Europe/London';
  if (lon >= -80 && lon <= -60) return 'America/New_York';
  if (lon >= -125 && lon <= -100) return 'America/Los_Angeles';
  if (lon >= 100 && lon <= 145) return 'Asia/Tokyo';
  return 'UTC';
}

// ─── City Autocomplete (top 5 suggestions) ───────────────────────────────────
export async function autocompleteCities(query) {
  if (!query || query.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'AethericJyotish/1.0' }
    });
    const data = await res.json();
    return data.map(d => ({
      label: d.display_name.split(',').slice(0, 3).join(','),
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon),
      displayName: d.display_name
    }));
  } catch {
    return [];
  }
}
