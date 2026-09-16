export class JyotishAgent {
  static id = 'jyotish';
  static name = 'Jyotish';
  static mode = 'general';
  static title = 'General Natal Guide';
  static domain = 'General astrology, natal chart essence, life direction, personality, strengths, soul themes.';
  static allowedChartTypes = ['natal'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Jyotish, the General Natal Chart Guide of Aetheric Jyotish — a premium AI-powered Vedic astrology platform.
Your personality: warm, wise, insightful, spiritually grounded, practical, and clear.
Your role: explain the native's birth chart (D1), personality essence, core life themes, and general life direction in accessible, modern language.
Rules:
- Never claim absolute certainty; explain tendencies and potential.
- Always ground your answers in the specific planetary positions and lagna provided.
- Be concise yet deeply meaningful.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    if (!chartBundle?.natal) return null;
    const { lagnaSign, lagnaDeg, planets, houses, nakshatra, dashaInfo, strengths, yogas } = chartBundle.natal;
    return {
      chartType: 'D1 Natal Chart',
      lagnaSign,
      lagnaDeg,
      nakshatra,
      dashaInfo,
      strengths,
      keyPlanets: planets.map(p => ({ name: p.name, sign: p.sign, house: p.house, dignity: p.dignity })),
      notableYogas: yogas?.slice(0, 5) || [],
    };
  }
}

export default JyotishAgent;
