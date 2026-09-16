import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguageAndStyle } from '../../ai/orchestrator/languageDetector.js';
import { classifyIntent, filterRelevantChartFacts } from '../../ai/orchestrator/intentClassifier.js';
import { buildMentalPatterns } from '../../ai/prompts/mentalPatternBuilder.js';
import { PromptBuilder } from '../../ai/prompts/promptBuilder.js';
import { ResponseFormatter } from '../../ai/orchestrator/responseFormatter.js';
import { GURUJI_CORE_DIRECTIVE } from '../../ai/prompts/gurujiPrompt.js';

// Sample Canonical Chart Bundle
const MOCK_CHART_BUNDLE = {
  canonical: {
    status: 'calculated',
    provider: 'freeastroapi',
    calculatedAt: '2026-09-14T00:00:00.000Z',
    ayanamsha: 'lahiri',
    lagna: {
      degree: 58.74,
      sign: 'Taurus',
      signId: 2,
      nakshatra: { id: 5, name: 'Mrigashira', pada: 2, lord: 'Mars' },
    },
    planets: [
      { name: 'Sun', sign: 'Virgo', signId: 6, degree: 5.93, house: 5, nakshatra: 'Uttara Phalguni', lord: 'Sun' },
      { name: 'Moon', sign: 'Taurus', signId: 2, degree: 26.05, house: 1, nakshatra: 'Mrigashira', lord: 'Mars' },
      { name: 'Mars', sign: 'Scorpio', signId: 8, degree: 1.89, house: 7, nakshatra: 'Vishakha', lord: 'Jupiter' },
      { name: 'Mercury', sign: 'Virgo', signId: 6, degree: 18.2, house: 5, nakshatra: 'Hasta', lord: 'Moon' },
      { name: 'Jupiter', sign: 'Leo', signId: 5, degree: 12.4, house: 4, nakshatra: 'Magha', lord: 'Ketu' },
      { name: 'Venus', sign: 'Cancer', signId: 4, degree: 9.1, house: 3, nakshatra: 'Pushya', lord: 'Saturn' },
      { name: 'Saturn', sign: 'Cancer', signId: 4, degree: 28.5, house: 3, nakshatra: 'Ashlesha', lord: 'Mercury' },
      { name: 'Rahu', sign: 'Aries', signId: 1, degree: 7.3, house: 12, nakshatra: 'Ashwini', lord: 'Ketu' },
      { name: 'Ketu', sign: 'Libra', signId: 7, degree: 7.3, house: 6, nakshatra: 'Chitra', lord: 'Mars' },
    ],
    houses: [
      { houseNumber: 1, sign: 'Taurus', signId: 2, lord: 'Venus', planets: ['Moon'] },
      { houseNumber: 2, sign: 'Gemini', signId: 3, lord: 'Mercury', planets: [] },
      { houseNumber: 3, sign: 'Cancer', signId: 4, lord: 'Moon', planets: ['Venus', 'Saturn'] },
      { houseNumber: 4, sign: 'Leo', signId: 5, lord: 'Sun', planets: ['Jupiter'] },
      { houseNumber: 5, sign: 'Virgo', signId: 6, lord: 'Mercury', planets: ['Sun', 'Mercury'] },
      { houseNumber: 6, sign: 'Libra', signId: 7, lord: 'Venus', planets: ['Ketu'] },
      { houseNumber: 7, sign: 'Scorpio', signId: 8, lord: 'Mars', planets: ['Mars'] },
      { houseNumber: 8, sign: 'Sagittarius', signId: 9, lord: 'Jupiter', planets: [] },
      { houseNumber: 9, sign: 'Capricorn', signId: 10, lord: 'Saturn', planets: [] },
      { houseNumber: 10, sign: 'Aquarius', signId: 11, lord: 'Saturn', planets: [] },
      { houseNumber: 11, sign: 'Pisces', signId: 12, lord: 'Jupiter', planets: [] },
      { houseNumber: 12, sign: 'Aries', signId: 1, lord: 'Mars', planets: ['Rahu'] },
    ],
    dasha: {
      currentMahadasha: { planet: 'Rahu', startDate: '2020-01-01', endDate: '2038-01-01' },
      currentAntardasha: { planet: 'Jupiter', startDate: '2024-03-01', endDate: '2026-07-28' },
      currentPratyantardasha: { planet: 'Saturn', startDate: '2026-07-28', endDate: '2026-12-15' },
    },
    divisionalCharts: {
      D9: { lagna: { sign: 'Libra' }, planets: [] },
    },
  },
};

const MOCK_PROFILE = {
  name: 'Aarav Sharma',
  dateOfBirth: '2004-08-15',
  timeOfBirth: '07:30',
  latitude: 28.6139,
  longitude: 77.2090,
  placeOfBirth: 'New Delhi, India',
};

const MOCK_AGENT = {
  id: 'guruji',
  mode: 'general',
  title: 'Guruji',
  allowedChartTypes: ['D1 Natal', 'D9 Navamsha'],
};

// ─── Scenario 1: Current Dasha Query ─────────────────────────────────────────
test('Scenario 1: Current Dasha query returns quick factual classification & focused facts', () => {
  const query = 'What is my current dasha right now?';
  const { intent, depth } = classifyIntent(query);
  assert.equal(intent, 'dasha_timing');
  assert.equal(depth, 'quick');

  const filtered = filterRelevantChartFacts(MOCK_CHART_BUNDLE, intent);
  assert.ok(filtered.dasha, 'Dasha facts must be present');
  assert.equal(filtered.dasha.currentMahadasha.planet, 'Rahu');
  assert.equal(filtered.dasha.currentAntardasha.planet, 'Jupiter');

  // Verify prompt generation
  const prompt = PromptBuilder.buildPrompt({
    agent: MOCK_AGENT,
    chartBundle: MOCK_CHART_BUNDLE,
    birthProfile: MOCK_PROFILE,
    userMessage: query,
  });
  assert.ok(prompt.systemInstruction.includes('GURUJI SPEAKS IN TURNS, NOT ESSAYS'));
  assert.ok(prompt.systemInstruction.includes('Rahu'));
});

// ─── Scenario 2: 10th House Career Query ─────────────────────────────────────
test('Scenario 2: 10th house query focuses on vocational factors without irrelevant dumping', () => {
  const query = 'What does my 10th house say about my career?';
  const { intent, depth } = classifyIntent(query);
  assert.equal(intent, 'career');

  const filtered = filterRelevantChartFacts(MOCK_CHART_BUNDLE, intent);
  assert.ok(filtered.relevantHouses.some(h => h.houseNumber === 10));
  const h10 = filtered.relevantHouses.find(h => h.houseNumber === 10);
  assert.equal(h10.sign, 'Aquarius');
  assert.equal(h10.lord, 'Saturn');

  // House 7 (marriage) should not be the primary focus of 10th house query
  assert.ok(!filtered.relevantHouses.some(h => h.houseNumber === 7));
});

// ─── Scenario 3: Overthinking Query (Astrological Interpretation, Zero Diagnosis)
test('Scenario 3: Mental pattern builder provides astrological tendencies without clinical diagnosis', () => {
  const query = 'Why do I overthink and feel anxious about making decisions?';
  const { intent } = classifyIntent(query);
  assert.equal(intent, 'mental_emotional');

  const patterns = buildMentalPatterns(MOCK_CHART_BUNDLE);
  assert.ok(Array.isArray(patterns) && patterns.length > 0);
  assert.ok(patterns[0].observation);
  assert.ok(patterns[0].supportingFactor);

  // Stringify all patterns to check for forbidden medical/psychiatric terms
  const allPatternText = JSON.stringify(patterns).toLowerCase();
  const FORBIDDEN_DIAGNOSES = [
    'clinical depression',
    'generalized anxiety disorder',
    'panic disorder',
    'bipolar',
    'adhd',
    'schizophrenia',
    'medical diagnosis',
    'psychiatric',
    'pathology',
  ];
  FORBIDDEN_DIAGNOSES.forEach(term => {
    assert.ok(!allPatternText.includes(term), `Pattern must NOT contain clinical term: ${term}`);
  });
});

// ─── Scenario 4: Casual Hinglish Query ───────────────────────────────────────
test('Scenario 4: Casual Hinglish query correctly detects language and style', () => {
  const query = 'Bhai meri job ka scene kab tak clear hoga? Bahut tension ho rahi hai.';
  const lang = detectLanguageAndStyle(query);

  assert.equal(lang.script, 'latin');
  assert.equal(lang.language, 'hinglish');
  assert.equal(lang.style, 'casual');

  const prompt = PromptBuilder.buildPrompt({
    agent: MOCK_AGENT,
    chartBundle: MOCK_CHART_BUNDLE,
    birthProfile: MOCK_PROFILE,
    userMessage: query,
  });

  assert.ok(prompt.systemInstruction.includes('Hinglish'));
});

// ─── Scenario 5: Hindi Devanagari Query ───────────────────────────────────────
test('Scenario 5: Hindi Devanagari query correctly detects Devanagari script and Hindi language', () => {
  const query = 'गुरुजी, मेरी कुंडली के अनुसार मेरा वर्तमान समय कैसा रहेगा? कृपया मार्गदर्शन करें।';
  const lang = detectLanguageAndStyle(query);

  assert.equal(lang.script, 'devanagari');
  assert.equal(lang.language, 'hi');
  assert.equal(lang.style, 'respectful');

  const prompt = PromptBuilder.buildPrompt({
    agent: MOCK_AGENT,
    chartBundle: MOCK_CHART_BUNDLE,
    birthProfile: MOCK_PROFILE,
    userMessage: query,
  });

  assert.ok(prompt.systemInstruction.includes('Devanagari script'));
});

// ─── Scenario 6: "Tell me everything about marriage" (Deep Query) ─────────────
test('Scenario 6: Broad marriage inquiry classifies as deep query with structured sections', () => {
  const query = 'Tell me everything about marriage, when will it happen and how will my partner be?';
  const { intent, depth } = classifyIntent(query);

  assert.equal(intent, 'marriage_love');
  assert.equal(depth, 'deep');

  // Test response formatting for deep query
  const mockDeepLLMResponse = JSON.stringify({
    title: 'Marriage & Partnership Guidance',
    answer: 'Your 7th house in Scorpio with Mars placed there points to an intense, deeply loyal partner who values transparency above all.',
    evidence: [
      { label: '7th House', value: 'Scorpio with Mars swakshetra', source: 'calculated' },
      { label: 'Current Dasha', value: 'Rahu-Jupiter', source: 'calculated' },
    ],
    sections: [
      {
        title: 'What I see in you',
        type: 'personality',
        body: 'You do not enter relationships lightly; trust is slow to build for you, but once anchored, you stand through storms.',
      },
      {
        title: 'What this means for marriage',
        type: 'interpretation',
        body: 'Scorpio in the 7th house demands absolute emotional truth. Avoid passive-aggressive silences during disagreements.',
      },
    ],
    timing: {
      available: true,
      summary: 'Rahu-Jupiter dasha until July 2026 presents a favorable window for serious matrimonial discussions.',
      windows: [],
    },
    actions: [
      'Focus on open communication rather than testing loyalty in silence.',
    ],
    followUps: [
      { label: 'Partner Traits', question: 'What qualities in a partner will harmonize best with my Taurus Lagna?' },
      { label: 'Remedies', question: 'Are there any grounding practices recommended for Mars in 7th?' },
    ],
  });

  const formatted = ResponseFormatter.format(mockDeepLLMResponse, {
    agent: MOCK_AGENT,
    intent,
    depth,
  });

  assert.equal(formatted.title, 'Marriage & Partnership Guidance');
  assert.ok(formatted.answer.includes('Scorpio'));
  assert.equal(formatted.sections.length, 2);
  assert.equal(formatted.evidence.length, 2);
  assert.ok(formatted.timing.available);
  assert.equal(formatted.actions.length, 1);
  assert.equal(formatted.followUps.length, 2);
});

// ─── Scenario 7: Job Timing Query (Timing Grounded in Dasha) ──────────────────
test('Scenario 7: Timing is strictly grounded in calculated Vimshottari Dasha', () => {
  const query = 'When is the best time for me to switch jobs?';
  const { intent } = classifyIntent(query);
  assert.equal(intent, 'career');

  const filtered = filterRelevantChartFacts(MOCK_CHART_BUNDLE, intent);
  assert.ok(filtered.dasha);
  assert.equal(filtered.dasha.currentMahadasha.planet, 'Rahu');
  assert.equal(filtered.dasha.currentAntardasha.planet, 'Jupiter');

  const mockResponse = JSON.stringify({
    title: 'Career Transition Timing',
    answer: 'You are currently running Rahu Mahadasha with Jupiter Antardasha until July 2026. This period encourages strategic expansion.',
    evidence: [
      { label: 'Current Mahadasha', value: 'Rahu (2020-2038)', source: 'calculated' },
      { label: 'Current Antardasha', value: 'Jupiter (until July 2026)', source: 'calculated' },
    ],
    timing: {
      available: true,
      summary: 'The active Rahu-Jupiter phase until July 2026 is favorable for exploratory interviews; subsequent Saturn sub-period demands consolidation.',
      windows: [],
    },
    actions: ['Update technical skills before initiating negotiations.'],
    followUps: [
      { label: 'Saturn Period', question: 'How will Saturn sub-period from July 2026 affect my workplace?' },
    ],
  });

  const formatted = ResponseFormatter.format(mockResponse, { intent, depth: 'standard' });
  assert.ok(formatted.timing.available);
  assert.ok(formatted.timing.summary.includes('Rahu-Jupiter'));
});

// ─── Scenario 8: Unavailable Data Query (Honesty & No Hallucination) ──────────
test('Scenario 8: Unavailable data is noted with caveats rather than hallucinating', () => {
  const query = 'What is my Ashtakavarga score for 11th house?';
  const { intent } = classifyIntent(query);

  const mockResponse = JSON.stringify({
    title: 'Ashtakavarga Query',
    answer: 'While your 11th house in Pisces is ruled by Jupiter in the 4th, detailed Ashtakavarga bindu scores are not computed in the current canonical chart view.',
    caveat: 'Detailed Ashtakavarga bindu table not loaded.',
    actions: ['We can examine the 11th lord Jupiter placements and current Dasha instead.'],
    followUps: [
      { label: 'Jupiter Placement', question: 'How does Jupiter in the 4th house support my gains?' },
    ],
  });

  const formatted = ResponseFormatter.format(mockResponse, { intent, depth: 'quick' });
  assert.ok(formatted.caveat);
  assert.ok(formatted.answer.includes('Ashtakavarga'));
});

// ─── Scenario 9: Multi-Turn Conversation Continuity ──────────────────────────
test('Scenario 9: Multi-turn conversation preserves context and answers in conversational turns', () => {
  const chatHistory = [
    { role: 'user', content: 'What does my Lagna say about my nature?' },
    { role: 'ai', content: 'With Taurus Lagna and Moon placed in the 1st house, you possess a patient, deliberate demeanor.' },
  ];
  const followUpQuery = 'And how does this affect my career choices?';

  const prompt = PromptBuilder.buildPrompt({
    agent: MOCK_AGENT,
    chartBundle: MOCK_CHART_BUNDLE,
    birthProfile: MOCK_PROFILE,
    userMessage: followUpQuery,
    chatHistory,
  });

  const fullPromptText = prompt.contents.map(c => c.parts.map(p => p.text).join(' ')).join(' ');
  assert.ok(fullPromptText.includes('Taurus Lagna'));
  assert.ok(fullPromptText.includes('how does this affect my career choices'));
  assert.ok(prompt.systemInstruction.includes('GURUJI SPEAKS IN TURNS, NOT ESSAYS'));
});

// ─── Scenario 10: Mixed Language with Sanskrit Terminology ────────────────────
test('Scenario 10: English with Sanskrit Vedic terms is handled cleanly', () => {
  const query = 'What does my Shani transit and Rahu Mahadasha mean for my health and vitality?';
  const { intent } = classifyIntent(query);
  assert.equal(intent, 'health_vitality');

  const lang = detectLanguageAndStyle(query);
  assert.equal(lang.script, 'latin');

  const filtered = filterRelevantChartFacts(MOCK_CHART_BUNDLE, intent);
  assert.ok(filtered.relevantHouses.some(h => h.houseNumber === 6 || h.houseNumber === 1));

  const mockResponse = JSON.stringify({
    title: 'Health & Vitality Overview',
    answer: 'With Taurus Lagna, Venus is your ruling planet, while Saturn resides in Cancer in your 3rd house. Your active Rahu Mahadasha requires rhythm in sleep and digestion.',
    evidence: [
      { label: 'Lagna Lord', value: 'Venus in Cancer (3rd house)', source: 'calculated' },
      { label: '6th House of Disease', value: 'Libra with Ketu', source: 'calculated' },
    ],
    sections: [
      {
        title: 'Physical Rhythm',
        type: 'interpretation',
        body: 'Ketu in the 6th suggests subtle digestive sensitivities when stressed. Grounding daily routines restore balance.',
      },
    ],
    actions: ['Prioritize warm, freshly cooked meals during Rahu-Jupiter dasha.'],
    followUps: [
      { label: 'Lagna Lord', question: 'How can I strengthen my Lagna lord Venus?' },
    ],
  });

  const formatted = ResponseFormatter.format(mockResponse, { intent, depth: 'standard' });
  assert.equal(formatted.intent, 'health_vitality');
  assert.ok(formatted.answer.includes('Taurus Lagna'));
  assert.equal(formatted.evidence.length, 2);
});

// ─── Additional Verification: Ban on AI Terminology ─────────────────────────
test('Master Directive strictly bans AI jargon', () => {
  assert.ok(GURUJI_CORE_DIRECTIVE.includes('NEVER use AI terminology'));
  assert.ok(GURUJI_CORE_DIRECTIVE.includes('GURUJI SPEAKS IN TURNS, NOT ESSAYS'));
  assert.ok(GURUJI_CORE_DIRECTIVE.includes('ANSWER THE REAL QUESTION FIRST'));
});
