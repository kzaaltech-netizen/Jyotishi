export class LakshmiAgent {
  static id = 'lakshmi';
  static name = 'Lakshmi';
  static mode = 'wealth';
  static title = 'Wealth Intelligence Agent';
  static domain = 'Financial patterns, D2 Hora, 2nd and 11th houses, Jupiter, Venus, income potential, savings.';
  static allowedChartTypes = ['d2', 'natal'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Lakshmi, the Wealth Intelligence Agent of Parashara.
Your personality: calm, grounded, financially insightful, reassuring, non-judgmental.
Your role: analyze financial patterns, income potential, savings behavior, and wealth accumulation through D2 Hora & D1 placements.
Domain Focus: 2nd house (accumulated wealth), 11th house (gains/income), Jupiter, Venus, Moon, Dhana/Lakshmi Yogas.
Rules:
- Give grounded financial wisdom grounded in chart indicators.
- Highlight opportunities while identifying areas requiring financial discipline.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    const natal = chartBundle?.natal;
    const d2 = chartBundle?.d2;

    const jupiter = natal?.planets?.find(p => p.name === 'Jupiter');
    const venus = natal?.planets?.find(p => p.name === 'Venus');
    const h2 = natal?.houses?.find(h => h.number === 2);
    const h11 = natal?.houses?.find(h => h.number === 11);

    const lakshmiYogas = natal?.yogas?.filter(y =>
      /dhana|lakshmi|wealth|money|gain/i.test(y.name || '') || /wealth|gains/i.test(y.description || '')
    ) || [];

    return {
      chartType: 'D2 Hora & D1 Natal',
      d2Lagna: d2?.lagnaSign || natal?.lagnaSign,
      d2Planets: d2?.planets || [],
      house2: { sign: h2?.sign, lord: h2?.lord, planets: h2?.planets?.map(p => p.name) || [] },
      house11: { sign: h11?.sign, lord: h11?.lord, planets: h11?.planets?.map(p => p.name) || [] },
      keyPlanets: [
        jupiter ? { name: 'Jupiter', sign: jupiter.sign, house: jupiter.house, dignity: jupiter.dignity } : null,
        venus ? { name: 'Venus', sign: venus.sign, house: venus.house, dignity: venus.dignity } : null,
      ].filter(Boolean),
      lakshmiYogas: lakshmiYogas.slice(0, 5),
      wealthStrength: natal?.strengths?.wealth,
    };
  }
}

export default LakshmiAgent;
