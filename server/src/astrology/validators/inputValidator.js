// ─── Birth Input Validator ──────────────────────────────────────────────────────

export function validateBirthInput(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Birth profile object is required.');
  }

  const { dob, birthTime, lat, lon } = profile;

  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw new Error('Valid date of birth (YYYY-MM-DD) is required.');
  }

  if (birthTime && !/^\d{1,2}:\d{2}(:\d{2})?$/.test(birthTime)) {
    throw new Error('Valid time of birth (HH:MM or HH:MM:SS) is required.');
  }

  const numLat = parseFloat(lat);
  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    throw new Error('Valid latitude between -90 and 90 is required.');
  }

  const numLon = parseFloat(lon);
  if (isNaN(numLon) || numLon < -180 || numLon > 180) {
    throw new Error('Valid longitude between -180 and 180 is required.');
  }

  return {
    dob,
    birthTime: birthTime || '12:00',
    lat: numLat,
    lon: numLon,
    timezone: profile.timezone || 'Asia/Kolkata'
  };
}
