// ─── Zodiac Motion Profile System ──────────────────────────────────────────
// Data-driven visual personalization based on the user's Ascendant / Lagna sign.
// IMPORTANT: Purely visual atmosphere — NOT horoscope predictions, does NOT alter
// AI responses, calculations, or astrology facts.

export const ZODIAC_MOTION_PROFILES = {
  Aries: {
    sign: 'Aries',
    sanskrit: 'मेष (Mesha)',
    element: 'Fire (Agni)',
    accentTint: '#b45309', // Warm saffron vermillion
    glowTint: 'rgba(180, 83, 9, 0.14)',
    orbitStroke: 'rgba(180, 83, 9, 0.48)',
    cosmicAccentTint: '#f97316', // Luminous cosmic vermillion
    cosmicGlowTint: 'rgba(249, 115, 22, 0.22)',
    cosmicOrbitStroke: 'rgba(249, 115, 22, 0.55)',
    orbitCount: 3,
    orbitSpeedPrimary: 75,
    orbitSpeedSecondary: 110,
    pulseDuration: 7,
    particleCount: 8,
    patternType: 'energetic-radial',
    atmosphereName: 'Pratham Agni · Energetic Orbit (Mesha Lagna)',
    description: 'Slightly energetic orbital movement with subtle saffron warmth and an active central rhythm.'
  },
  Taurus: {
    sign: 'Taurus',
    sanskrit: 'वृषभ (Vrishabha)',
    element: 'Earth (Prithvi)',
    accentTint: '#8a5316', // Deep antique brass / earth gold
    glowTint: 'rgba(138, 83, 22, 0.14)',
    orbitStroke: 'rgba(138, 83, 22, 0.46)',
    cosmicAccentTint: '#eab308', // Grounded antique solar brass
    cosmicGlowTint: 'rgba(234, 179, 8, 0.20)',
    cosmicOrbitStroke: 'rgba(234, 179, 8, 0.50)',
    orbitCount: 2,
    orbitSpeedPrimary: 140,
    orbitSpeedSecondary: 210,
    pulseDuration: 11,
    particleCount: 6,
    patternType: 'grounded-concentric',
    atmosphereName: 'Sthira Dhara · Grounded Rhythm (Vrishabha Lagna)',
    description: 'Slow, grounded movement with warm antique-gold and bistre, emphasizing stability.'
  },
  Gemini: {
    sign: 'Gemini',
    sanskrit: 'मिथुन (Mithuna)',
    element: 'Air (Vayu)',
    accentTint: '#a16207', // Warm amber brass
    glowTint: 'rgba(161, 98, 7, 0.14)',
    orbitStroke: 'rgba(161, 98, 7, 0.46)',
    cosmicAccentTint: '#facc15', // Luminous dual amber
    cosmicGlowTint: 'rgba(250, 204, 21, 0.20)',
    cosmicOrbitStroke: 'rgba(250, 204, 21, 0.52)',
    orbitCount: 3,
    orbitSpeedPrimary: 65,
    orbitSpeedSecondary: 95,
    pulseDuration: 6.5,
    particleCount: 10,
    patternType: 'dual-orbit',
    atmosphereName: 'Yugma Vayu · Dual Orbit (Mithuna Lagna)',
    description: 'Subtle dual-orbit movement with lighter cadence and paired particle drift.'
  },
  Cancer: {
    sign: 'Cancer',
    sanskrit: 'कर्क (Karka)',
    element: 'Water (Jala)',
    accentTint: '#96682b', // Warm antique lunar gold / brass
    glowTint: 'rgba(180, 120, 30, 0.14)',
    orbitStroke: 'rgba(150, 104, 43, 0.48)',
    cosmicAccentTint: '#38bdf8', // Cool lunar celestial cyan/blue
    cosmicGlowTint: 'rgba(56, 189, 248, 0.24)',
    cosmicOrbitStroke: 'rgba(56, 189, 248, 0.55)',
    orbitCount: 2,
    orbitSpeedPrimary: 120,
    orbitSpeedSecondary: 180,
    pulseDuration: 10,
    particleCount: 7,
    patternType: 'lunar-circular',
    atmosphereName: 'Chandra Shanti · Lunar Circular (Karka Lagna)',
    description: 'Soft circular, lunar-inspired movement with a quieter atmosphere and gentle drifting motion.'
  },
  Leo: {
    sign: 'Leo',
    sanskrit: 'सिंह (Simha)',
    element: 'Fire (Surya Agni)',
    accentTint: '#b47314', // Regal antique gold / solar amber
    glowTint: 'rgba(180, 115, 20, 0.16)',
    orbitStroke: 'rgba(180, 115, 20, 0.52)',
    cosmicAccentTint: '#fbbf24', // Warm golden solar aura
    cosmicGlowTint: 'rgba(251, 191, 36, 0.25)',
    cosmicOrbitStroke: 'rgba(251, 191, 36, 0.58)',
    orbitCount: 3,
    orbitSpeedPrimary: 90,
    orbitSpeedSecondary: 150,
    pulseDuration: 8.5,
    particleCount: 8,
    patternType: 'solar-radiant',
    atmosphereName: 'Surya Tejas · Solar Aura (Simha Lagna)',
    description: 'Subtle solar radiant aura with warm antique-gold accents and a slow, steady central pulse.'
  },
  Virgo: {
    sign: 'Virgo',
    sanskrit: 'कन्या (Kanya)',
    element: 'Earth (Prithvi)',
    accentTint: '#7c572b', // Muted architectural bronze
    glowTint: 'rgba(124, 87, 43, 0.13)',
    orbitStroke: 'rgba(124, 87, 43, 0.44)',
    cosmicAccentTint: '#2dd4bf', // Precise geometric teal
    cosmicGlowTint: 'rgba(45, 212, 191, 0.20)',
    cosmicOrbitStroke: 'rgba(45, 212, 191, 0.50)',
    orbitCount: 3,
    orbitSpeedPrimary: 110,
    orbitSpeedSecondary: 160,
    pulseDuration: 9,
    particleCount: 6,
    patternType: 'precise-geometry',
    atmosphereName: 'Shuddha Rekha · Precise Geometry (Kanya Lagna)',
    description: 'Precise geometric movement with restrained animation and clean symmetrical rings.'
  },
  Libra: {
    sign: 'Libra',
    sanskrit: 'तुला (Tula)',
    element: 'Air (Vayu)',
    accentTint: '#8a3c26', // Balanced terracotta burgundy & gold
    glowTint: 'rgba(138, 60, 38, 0.14)',
    orbitStroke: 'rgba(138, 60, 38, 0.46)',
    cosmicAccentTint: '#f472b6', // Balanced Venusian rose-indigo
    cosmicGlowTint: 'rgba(244, 114, 182, 0.20)',
    cosmicOrbitStroke: 'rgba(244, 114, 182, 0.50)',
    orbitCount: 2,
    orbitSpeedPrimary: 100,
    orbitSpeedSecondary: 100,
    pulseDuration: 8,
    particleCount: 8,
    patternType: 'balanced-symmetry',
    atmosphereName: 'Sama Mandala · Balanced Orbit (Tula Lagna)',
    description: 'Balanced symmetrical orbital movement with mirrored visual rhythm and burgundy-gold equilibrium.'
  },
  Scorpio: {
    sign: 'Scorpio',
    sanskrit: 'वृश्चिक (Vrischika)',
    element: 'Water (Gambhir Jala)',
    accentTint: '#7f2818', // Deep alizarin burgundy
    glowTint: 'rgba(127, 40, 24, 0.14)',
    orbitStroke: 'rgba(127, 40, 24, 0.48)',
    cosmicAccentTint: '#a855f7', // Deep indigo / violet intensity
    cosmicGlowTint: 'rgba(168, 85, 247, 0.24)',
    cosmicOrbitStroke: 'rgba(168, 85, 247, 0.55)',
    orbitCount: 2,
    orbitSpeedPrimary: 130,
    orbitSpeedSecondary: 190,
    pulseDuration: 9.5,
    particleCount: 6,
    patternType: 'inward-depth',
    atmosphereName: 'Gambhir Tejas · Inward Depth (Vrischika Lagna)',
    description: 'Deeper burgundy tone with slower inward movement and a restrained, contemplative pulse.'
  },
  Sagittarius: {
    sign: 'Sagittarius',
    sanskrit: 'धनु (Dhanu)',
    element: 'Fire (Guru Agni)',
    accentTint: '#a86208', // Expansive saffron-gold
    glowTint: 'rgba(168, 98, 8, 0.15)',
    orbitStroke: 'rgba(168, 98, 8, 0.50)',
    cosmicAccentTint: '#f59e0b', // Expansive Jupiter gold
    cosmicGlowTint: 'rgba(245, 158, 11, 0.24)',
    cosmicOrbitStroke: 'rgba(245, 158, 11, 0.56)',
    orbitCount: 3,
    orbitSpeedPrimary: 85,
    orbitSpeedSecondary: 130,
    pulseDuration: 7.5,
    particleCount: 9,
    patternType: 'expansive-radial',
    atmosphereName: 'Dharma Vistaar · Expansive Orbit (Dhanu Lagna)',
    description: 'Subtle outward radial movement with an expansive orbital feeling and warm saffron cues.'
  },
  Capricorn: {
    sign: 'Capricorn',
    sanskrit: 'मकर (Makara)',
    element: 'Earth (Prithvi)',
    accentTint: '#6e4a2c', // Disciplined deep bistre / stone
    glowTint: 'rgba(110, 74, 44, 0.13)',
    orbitStroke: 'rgba(110, 74, 44, 0.44)',
    cosmicAccentTint: '#818cf8', // Disciplined Saturnian indigo
    cosmicGlowTint: 'rgba(129, 140, 248, 0.20)',
    cosmicOrbitStroke: 'rgba(129, 140, 248, 0.50)',
    orbitCount: 2,
    orbitSpeedPrimary: 150,
    orbitSpeedSecondary: 230,
    pulseDuration: 12,
    particleCount: 5,
    patternType: 'disciplined-concentric',
    atmosphereName: 'Niyama Chakra · Disciplined Rhythm (Makara Lagna)',
    description: 'Slow structured movement with a disciplined geometric rhythm and very restrained motion.'
  },
  Aquarius: {
    sign: 'Aquarius',
    sanskrit: 'कुम्भ (Kumbha)',
    element: 'Air (Vayu)',
    accentTint: '#8a5c2d', // Asymmetric warm bronze
    glowTint: 'rgba(138, 92, 45, 0.14)',
    orbitStroke: 'rgba(138, 92, 45, 0.46)',
    cosmicAccentTint: '#60a5fa', // Electric celestial blue
    cosmicGlowTint: 'rgba(96, 165, 250, 0.22)',
    cosmicOrbitStroke: 'rgba(96, 165, 250, 0.52)',
    orbitCount: 3,
    orbitSpeedPrimary: 95,
    orbitSpeedSecondary: 145,
    pulseDuration: 8.5,
    particleCount: 8,
    patternType: 'asymmetric-orbit',
    atmosphereName: 'Gayana Chakra · Asymmetric Orbit (Kumbha Lagna)',
    description: 'Subtle asymmetric orbital movement with gently offset concentric pathways.'
  },
  Pisces: {
    sign: 'Pisces',
    sanskrit: 'मीन (Meena)',
    element: 'Water (Jala)',
    accentTint: '#855c35', // Fluid warm umber-sand
    glowTint: 'rgba(133, 92, 53, 0.14)',
    orbitStroke: 'rgba(133, 92, 53, 0.46)',
    cosmicAccentTint: '#06b6d4', // Fluid blue/teal drifting atmosphere
    cosmicGlowTint: 'rgba(6, 182, 212, 0.22)',
    cosmicOrbitStroke: 'rgba(6, 182, 212, 0.52)',
    orbitCount: 2,
    orbitSpeedPrimary: 125,
    orbitSpeedSecondary: 195,
    pulseDuration: 10.5,
    particleCount: 7,
    patternType: 'fluid-wave',
    atmosphereName: 'Moksha Dhara · Fluid Movement (Meena Lagna)',
    description: 'Fluid circular movement with soft drifting particles and a tranquil, contemplative presence.'
  },
};

export const NEUTRAL_CELESTIAL_PROFILE = {
  sign: 'Astro-AI',
  sanskrit: 'ज्योतिष (Jyotish)',
  element: 'Akasha (Space)',
  accentTint: '#8C6212', // Universal antique gold
  glowTint: 'rgba(140, 98, 18, 0.14)',
  orbitStroke: 'rgba(140, 98, 18, 0.48)',
  cosmicAccentTint: '#fbbf24',
  cosmicGlowTint: 'rgba(251, 191, 36, 0.22)',
  cosmicOrbitStroke: 'rgba(251, 191, 36, 0.52)',
  orbitCount: 2,
  orbitSpeedPrimary: 110,
  orbitSpeedSecondary: 170,
  pulseDuration: 9,
  particleCount: 7,
  patternType: 'neutral-celestial',
  atmosphereName: 'Astro-AI Celestial · Neutral Archival (Universal)',
  description: 'Balanced editorial celestial atmosphere honoring classical Vedic proportions.'
};

/**
 * Returns the ZodiacMotionProfile matching the provided sign, or neutral fallback.
 * Automatically respects active theme (vedic vs cosmic) for visual resonance.
 * Case-insensitive, tolerant of null/undefined chart data.
 */
export function getZodiacMotionProfile(lagnaSign, theme = 'vedic') {
  let profile = NEUTRAL_CELESTIAL_PROFILE;
  if (lagnaSign && typeof lagnaSign === 'string') {
    const cleanSign = lagnaSign.trim();
    const foundKey = Object.keys(ZODIAC_MOTION_PROFILES).find(
      (k) => k.toLowerCase() === cleanSign.toLowerCase()
    );
    if (foundKey) profile = ZODIAC_MOTION_PROFILES[foundKey];
  }

  if (theme === 'cosmic') {
    return {
      ...profile,
      accentTint: profile.cosmicAccentTint || profile.accentTint,
      glowTint: profile.cosmicGlowTint || profile.glowTint,
      orbitStroke: profile.cosmicOrbitStroke || profile.orbitStroke,
    };
  }

  return profile;
}
