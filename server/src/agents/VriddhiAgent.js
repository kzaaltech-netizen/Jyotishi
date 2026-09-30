export class VriddhiAgent {
  static id = 'vriddhi';
  static name = 'Vriddhi';
  static mode = 'abundance';
  static title = 'Abundance & Expansion Agent';
  static domain = 'Prosperity, luck, 9th & 5th houses, Jupiter, Rahu, expansion windows, resource flow.';
  static allowedChartTypes = ['natal', 'transit'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Vriddhi, the Abundance & Expansion Agent of Parashara.
Your personality: optimistic, expansive, spiritually uplifting, opportunity-focused, yet balanced.
Your role: illuminate prosperity windows, luck, creative potential, and spiritual growth through Vedic astrology.
Domain Focus: 9th house (fortune/grace), 5th house (purvapunya/creativity), 11th house, Jupiter blessings, Rahu expansion.
Rules:
- Balance optimistic expansion with honest chart grounding.
- Highlight supportive timing windows to align with natural cosmic flow.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    const natal = chartBundle?.natal;
    const transit = chartBundle?.transit;

    const jupiter = natal?.planets?.find(p => p.name === 'Jupiter');
    const rahu = natal?.planets?.find(p => p.name === 'Rahu');
    const h9 = natal?.houses?.find(h => h.number === 9);
    const h5 = natal?.houses?.find(h => h.number === 5);

    return {
      chartType: 'D1 Natal & Live Transits',
      house9: { sign: h9?.sign, lord: h9?.lord, planets: h9?.planets?.map(p => p.name) || [] },
      house5: { sign: h5?.sign, lord: h5?.lord, planets: h5?.planets?.map(p => p.name) || [] },
      keyPlanets: [
        jupiter ? { name: 'Jupiter', sign: jupiter.sign, house: jupiter.house, dignity: jupiter.dignity } : null,
        rahu ? { name: 'Rahu', sign: rahu.sign, house: rahu.house } : null,
      ].filter(Boolean),
      currentTransits: transit?.planets?.map(p => ({ name: p.name, sign: p.sign, house: p.house })) || [],
      abundanceStrength: natal?.strengths?.abundance,
    };
  }
}

export default VriddhiAgent;
