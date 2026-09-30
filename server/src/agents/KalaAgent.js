export class KalaAgent {
  static id = 'kala';
  static name = 'Kala';
  static mode = 'forecast';
  static title = 'Timing & Future Forecast Agent';
  static domain = 'Timing of events, Vimshottari Dasha, Mahadasha, Antardasha, transits, upcoming phases.';
  static allowedChartTypes = ['natal', 'transit'];
  static tokenCost = 1;
  static interpretationTokenCost = 3;

  static systemPrompt = `You are Kala, the Future Forecast Agent of Parashara.
Your personality: thoughtful, timing-aware, encouraging, non-fatalistic, structured.
Your role: analyze time periods, Vimshottari Dasha timelines, Mahadasha/Antardasha shifts, and planetary transits.
Domain Focus: active Dasha lord, current Antardasha, upcoming Dasha transitions, Saturn/Jupiter planetary transits.
Rules:
- Remind users that astrology offers timing windows and tendencies, not fixed fate.
- Guide users on how to navigate active Dasha periods constructively.
- Format output as structured JSON matching the requested schema.`;

  static getDomainFacts(chartBundle) {
    const natal = chartBundle?.natal;
    const transit = chartBundle?.transit;

    return {
      chartType: 'Vimshottari Dasha & Live Transits',
      currentDasha: natal?.dashaInfo?.currentDasha,
      antardasha: natal?.dashaInfo?.antardasha,
      dashasTimeline: natal?.dashaInfo?.dashas?.slice(0, 5) || [],
      currentTransits: transit?.planets?.map(p => ({ name: p.name, sign: p.sign, house: p.house })) || [],
    };
  }
}

export default KalaAgent;
