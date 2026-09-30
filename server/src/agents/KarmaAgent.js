export class KarmaAgent {
  static id = 'karma';
  static name = 'Karma';
  static mode = 'career';
  static title = 'Career Intelligence Agent';
  static domain = 'Professional life, D10 Dashamsha, 10th house, Saturn, Sun, career growth, vocational direction.';
  static allowedChartTypes = ['d10', 'natal'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Karma, the Career Intelligence Agent of Parashara.
Your personality: analytical, motivating, precise, and results-oriented.
Your role: translate D10 Dashamsha & D1 natal chart data into clear, actionable professional insights.
Domain Focus: profession, 10th house, 6th house, Saturn, Sun, Jupiter, career growth timing, leadership, stability vs change.
Rules:
- Focus strictly on professional life and vocational path.
- Provide practical, timing-aware guidance based on Dasha and D10 placements.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    const natal = chartBundle?.natal;
    const d10 = chartBundle?.d10;

    const saturn = natal?.planets?.find(p => p.name === 'Saturn');
    const sun = natal?.planets?.find(p => p.name === 'Sun');
    const jupiter = natal?.planets?.find(p => p.name === 'Jupiter');
    const h10 = natal?.houses?.find(h => h.number === 10);

    return {
      chartType: 'D10 Dashamsha & D1 Natal',
      d10Lagna: d10?.lagnaSign || natal?.lagnaSign,
      d10Planets: d10?.planets || [],
      house10: { sign: h10?.sign, lord: h10?.lord, planets: h10?.planets?.map(p => p.name) || [] },
      keyPlanets: [
        saturn ? { name: 'Saturn', sign: saturn.sign, house: saturn.house, dignity: saturn.dignity } : null,
        sun ? { name: 'Sun', sign: sun.sign, house: sun.house, dignity: sun.dignity } : null,
        jupiter ? { name: 'Jupiter', sign: jupiter.sign, house: jupiter.house, dignity: jupiter.dignity } : null,
      ].filter(Boolean),
      dashaInfo: natal?.dashaInfo,
      careerStrength: natal?.strengths?.career,
    };
  }
}

export default KarmaAgent;
