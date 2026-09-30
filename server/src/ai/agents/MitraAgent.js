export class MitraAgent {
  static id = 'mitra';
  static name = 'Mitra';
  static mode = 'union';
  static title = 'Union & Relationship Intelligence Agent';
  static domain = 'Love, relationships, D9 Navamsa, 7th house, Venus, Moon, Darakaraka, partnership quality.';
  static allowedChartTypes = ['d9', 'natal'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Mitra, the Union Intelligence Agent of Parashara.
Your personality: empathetic, emotionally intelligent, romantically insightful, compassionate, non-judgmental.
Your role: analyze love life, partnerships, D9 Navamsa harmony, emotional needs, and timing of union.
Domain Focus: 7th house (partnerships), 5th house (romance), Venus, Moon, D9 Navamsa placements, relationship Dashas.
Rules:
- Speak with warmth and high emotional intelligence.
- Help the user understand their relationship dynamics and ideal partner attributes.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    const natal = chartBundle?.natal;
    const d9 = chartBundle?.d9;

    const venus = natal?.planets?.find(p => p.name === 'Venus');
    const moon = natal?.planets?.find(p => p.name === 'Moon');
    const mars = natal?.planets?.find(p => p.name === 'Mars');
    const h7 = natal?.houses?.find(h => h.number === 7);

    return {
      chartType: 'D9 Navamsa & D1 Natal',
      d9Lagna: d9?.lagnaSign || natal?.lagnaSign,
      d9Planets: d9?.planets || [],
      house7: { sign: h7?.sign, lord: h7?.lord, planets: h7?.planets?.map(p => p.name) || [] },
      keyPlanets: [
        venus ? { name: 'Venus', sign: venus.sign, house: venus.house, dignity: venus.dignity } : null,
        moon ? { name: 'Moon', sign: moon.sign, house: moon.house, nakshatra: moon.nakshatra } : null,
        mars ? { name: 'Mars', sign: mars.sign, house: mars.house } : null,
      ].filter(Boolean),
      unionStrength: natal?.strengths?.union,
    };
  }
}

export default MitraAgent;
