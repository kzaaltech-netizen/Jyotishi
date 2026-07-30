/**
 * ResponseFormatter
 * Normalizes raw LLM output into a clean, predictable JSON schema.
 */
export class ResponseFormatter {
  /**
   * Format raw text/JSON from LLM into standardized structured response.
   *
   * @param {string|object} rawInput - Text or object returned from LLM provider
   * @param {object} context - Additional context { agent, chartsUsed }
   */
  static format(rawInput, context = {}) {
    const { agent, chartsUsed = [] } = context;
    let parsed = null;

    if (typeof rawInput === 'object' && rawInput !== null) {
      parsed = rawInput;
    } else if (typeof rawInput === 'string') {
      try {
        // Strip markdown ```json code blocks if present
        let cleaned = rawInput.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
        }
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Fallback parsing if LLM didn't produce strict JSON
        parsed = {
          title: `${agent?.title || 'Astrological'} Insight`,
          summary: rawInput.trim().slice(0, 200) + '...',
          analysis: rawInput.trim(),
          recommendations: ['Reflect on your personal transits and dasha.'],
          confidence: 'High',
          suggestedFollowUps: ['How does my current Dasha affect this?', 'What transits should I watch out for?'],
          chartsUsed: chartsUsed.length > 0 ? chartsUsed : [agent?.allowedChartTypes?.[0] || 'D1 Natal'],
          warnings: [],
        };
      }
    }

    const title = parsed?.title || `${agent?.title || 'Astrological'} Reading`;
    const summary = parsed?.summary || (parsed?.analysis ? parsed.analysis.slice(0, 150) + '...' : '');
    const analysis = parsed?.analysis || parsed?.detailedAnalysis || parsed?.summary || String(rawInput);
    
    let recommendations = parsed?.recommendations;
    if (!Array.isArray(recommendations)) {
      recommendations = typeof recommendations === 'string' ? [recommendations] : [];
    }

    let suggestedFollowUps = parsed?.suggestedFollowUps || parsed?.suggestedFollowupQuestions;
    if (!Array.isArray(suggestedFollowUps)) {
      suggestedFollowUps = [
        `What actions should I take during my current Dasha?`,
        `How does this align with my natal lagna?`
      ];
    }

    let finalChartsUsed = parsed?.chartsUsed || chartsUsed;
    if (!Array.isArray(finalChartsUsed) || finalChartsUsed.length === 0) {
      finalChartsUsed = agent?.allowedChartTypes ? agent.allowedChartTypes : ['D1 Natal'];
    }

    return {
      title,
      summary,
      analysis,
      detailedAnalysis: analysis, // alias for frontend compatibility
      recommendations,
      confidence: parsed?.confidence || 'High',
      suggestedFollowUps,
      chartsUsed: finalChartsUsed,
      warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
    };
  }
}

export default ResponseFormatter;
