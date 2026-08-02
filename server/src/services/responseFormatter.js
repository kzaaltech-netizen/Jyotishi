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
      let cleaned = rawInput.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
      }

      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        // Regex fallback if JSON string was cut off mid-stream
        const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
        const summaryMatch = cleaned.match(/"summary"\s*:\s*"([^"]+)"/);
        const analysisMatch = cleaned.match(/"analysis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);

        if (titleMatch || summaryMatch || analysisMatch) {
          parsed = {
            title: titleMatch ? titleMatch[1] : null,
            summary: summaryMatch ? summaryMatch[1] : null,
            analysis: analysisMatch ? analysisMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : null,
          };
        } else {
          parsed = {
            title: `${agent?.title || 'Astrological'} Insight`,
            summary: '',
            analysis: cleaned,
          };
        }
      }
    }

    const title = parsed?.title || `${agent?.title || 'Astrological'} Reading`;
    const summary = parsed?.summary || '';
    let analysisBody = parsed?.analysis || parsed?.detailedAnalysis || String(rawInput);

    // Build unified, elegant markdown text combining Title, Summary, and Analysis
    let fullText = '';
    if (title && !analysisBody.includes(title)) {
      fullText += `### ${title}\n\n`;
    }
    if (summary && !analysisBody.includes(summary.slice(0, 30))) {
      fullText += `${summary}\n\n`;
    }
    fullText += analysisBody;

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
      analysis: fullText.trim(),
      detailedAnalysis: fullText.trim(),
      recommendations,
      confidence: parsed?.confidence || 'High',
      suggestedFollowUps,
      chartsUsed: finalChartsUsed,
      warnings: Array.isArray(parsed?.warnings) ? parsed.warnings : [],
    };
  }
}

export default ResponseFormatter;
