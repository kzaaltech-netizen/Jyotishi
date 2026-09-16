import crypto from 'crypto';
import { GURUJI_CORE_DIRECTIVE, GURUJI_JSON_SCHEMA_DIRECTIVE } from './gurujiPrompt.js';
import { detectLanguageAndStyle } from '../orchestrator/languageDetector.js';
import { classifyIntent, filterRelevantChartFacts } from '../orchestrator/intentClassifier.js';
import { buildMentalPatterns } from './mentalPatternBuilder.js';

export const PROMPT_VERSION = '2.0.0';
export const AGENT_VERSION = '3.3.0';

export class PromptBuilder {
  /**
   * Build complete prompt configuration for Guruji conversation engine.
   *
   * @param {object} params
   * @param {object} params.agent - Internal domain agent (e.g. JyotishAgent, KarmaAgent)
   * @param {object} params.chartBundle - Canonical chart bundle { natal, d9, d10, d2, d11, transit }
   * @param {object} params.birthProfile - User birth profile
   * @param {string} params.userMessage - Current user inquiry
   * @param {array} params.chatHistory - Previous conversation messages [{ role, content }]
   * @param {object} params.preferences - UserPreference db record
   * @param {boolean} params.isInterpretation - True if full domain reading, False if interactive chat
   */
  static buildPrompt({ agent, chartBundle, birthProfile, userMessage = '', chatHistory = [], preferences = {}, isInterpretation = false }) {
    // 1. Language & conversational style detection
    const langStyle = detectLanguageAndStyle(userMessage);

    // 2. Intent classification & adaptive depth
    const { intent, depth } = classifyIntent(userMessage);

    // 3. Relevant chart filtering (avoids dumping irrelevant Kundli facts)
    const relevantChartFacts = filterRelevantChartFacts(chartBundle, intent);

    // 4. Mental & personal pattern derivation
    const mentalPatterns = buildMentalPatterns(chartBundle);

    // 5. Seeker identity summary
    const seekerProfile = birthProfile ? {
      name: birthProfile.fullName?.split(' ')[0] || birthProfile.fullName || 'Seeker',
      fullName: birthProfile.fullName,
      dob: birthProfile.dob,
      birthTime: birthProfile.birthTime,
      birthplace: birthProfile.birthplace,
    } : null;

    // 6. User memory context
    const storedSummaries = preferences.summaries || '';

    // 7. Assemble unified Guruji system instruction
    const systemInstruction = `${GURUJI_CORE_DIRECTIVE}

=== SEEKER IDENTITY & TOPIC ===
Seeker Name: ${seekerProfile?.name || 'Seeker'}
Detected Query Intent: ${intent.toUpperCase()}
Target Response Depth: ${depth.toUpperCase()} (Keep answer adaptive to this depth)
${seekerProfile ? `Birth Profile: ${JSON.stringify(seekerProfile, null, 2)}` : ''}
${storedSummaries ? `Prior Conversation Memory: ${storedSummaries}` : ''}
================================

=== LANGUAGE & CADENCE DIRECTIVE ===
${langStyle.promptInstruction}
====================================

=== MENTAL & TEMPERAMENT PATTERNS IN CHART ===
(Synthesize these tendencies as astrological personality insights. Never diagnose medical or psychological conditions.)
${JSON.stringify(mentalPatterns, null, 2)}
==============================================

=== RELEVANT CALCULATED CHART FACTS (SOURCE OF TRUTH) ===
(Use ONLY these verified placements. Do not invent any planets, signs, houses, or yogas.)
${JSON.stringify(relevantChartFacts, null, 2)}
========================================================

${GURUJI_JSON_SCHEMA_DIRECTIVE}`;

    // 8. Assemble contents array for LLM
    const contents = [];

    // Append recent conversation context (last 8 messages for natural flow)
    const recentHistory = (chatHistory || []).slice(-8);
    recentHistory.forEach((msg) => {
      if (msg.content && typeof msg.content === 'string') {
        let textContent = msg.content.trim();
        // If content is serialized JSON, parse answer or analysis to give model clean conversational memory
        if (textContent.startsWith('{') && textContent.endsWith('}')) {
          try {
            const parsed = JSON.parse(textContent);
            textContent = parsed.answer || parsed.analysis || parsed.summary || textContent;
          } catch (e) {}
        }
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: textContent }],
        });
      }
    });

    // Add current user inquiry
    const finalPromptText = isInterpretation
      ? `Guruji, please provide your personal insight into my ${agent?.title || 'Kundli'} in a warm, direct consultation.`
      : (userMessage || 'Guruji, please guide me on my chart.').trim();

    contents.push({
      role: 'user',
      parts: [{ text: finalPromptText }],
    });

    // 9. Prompt Hash for caching
    const promptHash = crypto
      .createHash('sha256')
      .update(systemInstruction + '\n' + finalPromptText)
      .digest('hex');

    return {
      systemInstruction,
      contents,
      domainFacts: relevantChartFacts,
      mentalPatterns,
      intent,
      depth,
      langStyle,
      promptVersion: PROMPT_VERSION,
      promptHash,
      agentVersion: AGENT_VERSION,
    };
  }
}

export default PromptBuilder;
