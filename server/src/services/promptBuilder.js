import crypto from 'crypto';

export const PROMPT_VERSION = '1.2.0';
export const AGENT_VERSION = '2.1.0';

export class PromptBuilder {
  /**
   * Build complete prompt configuration for LLM call.
   *
   * @param {object} params
   * @param {object} params.agent - Selected Agent class from Agent Registry
   * @param {object} params.chartBundle - Cached chart bundle { natal, d9, d10, d2, d11, transit }
   * @param {object} params.birthProfile - User birth profile
   * @param {string} params.userMessage - Current user input (or interpretation request)
   * @param {array} params.chatHistory - Previous conversation messages [{ role, content }]
   * @param {object} params.preferences - UserPreference db record (personality, language, goals, summaries)
   * @param {boolean} params.isInterpretation - True if full reading, False if chat message
   */
  static buildPrompt({ agent, chartBundle, birthProfile, userMessage, chatHistory = [], preferences = {}, isInterpretation = false }) {
    // 1. Extract domain-specific facts
    const domainFacts = agent.getDomainFacts(chartBundle);
    const profileSummary = birthProfile ? {
      fullName: birthProfile.fullName,
      dob: birthProfile.dob,
      birthTime: birthProfile.birthTime,
      birthplace: birthProfile.birthplace,
    } : null;

    // 2. Personalization instructions
    const personality = preferences.personality || 'Balanced';
    const language = preferences.language || 'English';
    const summaries = preferences.summaries || '';
    const goals = preferences.goals || '';

    const personalityPrompts = {
      Professional: 'Maintain a highly analytical, career-oriented, precise, objective, and structured tone. Avoid excessive mysticism.',
      Friendly: 'Be warm, encouraging, conversational, empathetic, and friendly. Speak like a supportive life coach.',
      Traditional: 'Incorporate classical Vedic terms (like Grahas, Rasis, Bhavas, Dashas) with their traditional meanings and remedies.',
      Spiritual: 'Focus heavily on soul growth, karma, spiritual lessons, higher consciousness, and inner alignment.',
      Scientific: 'Emphasize astronomical, mathematical, psychological, and logic-based correlation. Focus on metrics, scores, and patterns.',
      Balanced: 'A balanced blend of modern psychology, practical advice, and spiritual astrological framing.',
    };

    const languagePrompts = {
      English: 'Respond entirely in clear, modern English.',
      Hindi: 'Respond entirely in pure, elegant Hindi (in Devanagari script).',
      Hinglish: 'Respond in Hinglish (Hindi written in the Roman/Latin alphabet, using common colloquial vocabulary and phrasing).',
    };

    const hallucinationGuardPrompt = `
HALLUCINATION GUARD RULES:
1. You must ONLY state astrological placements, signs, degrees, and houses that are explicitly provided in the "Domain Facts" JSON block.
2. Do NOT invent or assume any planetary position, nakshatra, dasha date, or yoga not listed.
3. If the user asks about a planet, house, or dasha that is not present in the provided Facts block, state clearly that: "This specific data is not available in your calculated chart." Do not guess or hallucinate placements under any circumstances.`;

    const jsonOutputSchemaInstructions = `
IMPORTANT OUTPUT REQUIREMENT:
You MUST respond with valid JSON matching this structure exactly:
{
  "title": "A short, elegant headline title in the requested language",
  "summary": "1 to 2 sentence summary of key takeaway in the requested language",
  "analysis": "Detailed, thoughtful analysis grounded strictly in the provided chart facts, matching the requested tone, style, and language",
  "recommendations": ["Actionable step 1", "Actionable step 2"],
  "confidence": "High",
  "suggestedFollowUps": ["3 to 5 highly relevant follow-up questions tailored specifically to their chart facts and current topic"],
  "chartsUsed": ["${agent.allowedChartTypes.join('", "')}"],
  "warnings": []
}
Return ONLY valid JSON. Do not include markdown code fence formatting like \`\`\`json outside the JSON payload.`;

    const systemInstruction = `${agent.systemPrompt}

=== PERSONALIZATION PROFILE ===
Tone/Personality Style: ${personality} - ${personalityPrompts[personality] || personalityPrompts.Balanced}
Preferred Response Language: ${language} - ${languagePrompts[language] || languagePrompts.English}
User Life Goals: ${goals || 'None specified'}
Summarized Chat Memory Context: ${summaries || 'No previous history summary.'}
=================================================

=== USER PROFILE & DOMAIN ASTROLOGY FACTS ===
Profile: ${JSON.stringify(profileSummary, null, 2)}

Domain Facts (${agent.title}):
${JSON.stringify(domainFacts, null, 2)}
=================================================

${hallucinationGuardPrompt}

${jsonOutputSchemaInstructions}`;

    // 3. Build contents array
    const contents = [];

    // Append recent chat history (max 10 recent messages)
    const recentHistory = (chatHistory || []).slice(-10);
    recentHistory.forEach(msg => {
      if (msg.content && typeof msg.content === 'string') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content.trim() }],
        });
      }
    });

    // Add current user prompt
    const finalPromptText = isInterpretation
      ? `Provide a comprehensive ${agent.title} reading for my chart in my preferred language (${language}) using the requested tone (${personality}).`
      : (userMessage || `Analyze my ${agent.title} domain`).trim();

    contents.push({
      role: 'user',
      parts: [{ text: finalPromptText }],
    });

    // 4. Calculate prompt hash for versioning & cached response matching
    const promptHash = crypto.createHash('sha256').update(systemInstruction + '\n' + finalPromptText).digest('hex');

    return {
      systemInstruction,
      contents,
      domainFacts,
      promptVersion: PROMPT_VERSION,
      promptHash,
      agentVersion: AGENT_VERSION,
    };
  }
}

export default PromptBuilder;
