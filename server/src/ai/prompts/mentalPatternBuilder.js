/**
 * Lightweight Mental & Personal Pattern Builder
 * Synthesizes 2 to 3 key psychological/behavioral tendencies from canonical chart placements.
 * Strictly astrological interpretations of personal temperament, NEVER medical or psychological diagnoses.
 */

export function buildMentalPatterns(chartBundle = {}) {
  const natal = chartBundle.canonical || chartBundle.natal || chartBundle;
  if (!natal || typeof natal !== 'object') return [];

  const planets = Array.isArray(natal.planets) ? natal.planets : [];
  const lagna = natal.lagna || { sign: natal.lagnaSign };
  const moon = planets.find(p => p.name === 'Moon');
  const mercury = planets.find(p => p.name === 'Mercury');
  const saturn = planets.find(p => p.name === 'Saturn');
  const rahu = planets.find(p => p.name === 'Rahu');

  const patterns = [];

  // 1. Emotional Processing & Inner Deliberation (derived from Moon)
  if (moon && moon.sign) {
    const moonSign = moon.sign.toLowerCase();
    if (['cancer', 'scorpio', 'pisces'].includes(moonSign)) {
      patterns.push({
        theme: 'internal_emotional_processing',
        observation: 'Deep internal processing; takes time to reflect on feelings privately before vocalizing them.',
        supportingFactor: `Moon in watery ${moon.sign}${moon.house ? ` (House ${moon.house})` : ''}`,
      });
    } else if (['gemini', 'virgo', 'aquarius'].includes(moonSign)) {
      patterns.push({
        theme: 'analytical_deliberation',
        observation: 'Tendency to analyze feelings intellectually and weigh multiple possibilities before feeling at peace with a direction.',
        supportingFactor: `Moon in intellectual ${moon.sign}${moon.nakshatra ? ` (${moon.nakshatra})` : ''}`,
      });
    } else if (['aries', 'leo', 'sagittarius'].includes(moonSign)) {
      patterns.push({
        theme: 'intuitive_impulse_and_candor',
        observation: 'Values directness and clarity; prefers taking constructive action rather than dwelling in stagnation.',
        supportingFactor: `Moon in fiery ${moon.sign}`,
      });
    } else {
      // Taurus, Capricorn, Libra
      patterns.push({
        theme: 'pragmatic_measured_grounding',
        observation: 'Needs practical grounding, predictability, and tangible milestones to feel secure in decisions.',
        supportingFactor: `Moon in ${moon.sign}`,
      });
    }
  }

  // 2. Decision Making & Problem Solving (derived from Lagna and Mercury)
  if (lagna && lagna.sign) {
    const lagnaSign = lagna.sign.toLowerCase();
    if (['taurus', 'virgo', 'capricorn'].includes(lagnaSign)) {
      patterns.push({
        theme: 'deliberate_and_persistent',
        observation: 'Does not rush important commitments; prefers building step-by-step with patient endurance.',
        supportingFactor: `${lagna.sign} Lagna`,
      });
    } else if (['gemini', 'libra', 'aquarius'].includes(lagnaSign)) {
      patterns.push({
        theme: 'conceptual_and_adaptable',
        observation: 'Thrives on perspective and intellectual exchange; dislikes feeling boxed in without freedom to explore.',
        supportingFactor: `${lagna.sign} Lagna`,
      });
    } else if (['aries', 'scorpio'].includes(lagnaSign)) {
      patterns.push({
        theme: 'resolute_and_focused',
        observation: 'Faces obstacles with courage and resilience; motivated when working towards a clear, purposeful objective.',
        supportingFactor: `Mars-ruled ${lagna.sign} Lagna`,
      });
    } else {
      patterns.push({
        theme: 'purposeful_and_principled',
        observation: 'Guided by a strong inner compass and value system; seeks meaning beyond mere material utility.',
        supportingFactor: `${lagna.sign} Lagna`,
      });
    }
  }

  // 3. Pressure Response (derived from Saturn or Rahu)
  if (saturn || rahu) {
    if (saturn && (saturn.house === 1 || saturn.house === 10 || saturn.house === 4)) {
      patterns.push({
        theme: 'high_self_accountability',
        observation: 'Holds self to exacting standards; can feel heavy burden of duty when things do not progress quickly.',
        supportingFactor: `Saturn in House ${saturn.house}`,
      });
    } else if (rahu && (rahu.house === 1 || rahu.house === 10)) {
      patterns.push({
        theme: 'ambitious_urgency',
        observation: 'Feels restless when vision outpaces current circumstances; seeks non-linear breakthroughs.',
        supportingFactor: `Rahu in House ${rahu.house}`,
      });
    }
  }

  return patterns.slice(0, 3);
}

export default buildMentalPatterns;
