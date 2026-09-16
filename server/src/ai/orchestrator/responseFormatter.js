/**
 * ResponseFormatter
 * Normalizes raw LLM output into the canonical Guruji response schema.
 */

export class ResponseFormatter {
  /**
   * Format raw text/JSON from LLM into standardized Guruji structured response.
   *
   * @param {string|object} rawInput - Text or object returned from LLM provider
   * @param {object} context - Additional context { agent, intent, depth, langStyle }
   */
  static format(rawInput, context = {}) {
    const { agent, intent = 'general', depth = 'standard', langStyle = {} } = context;
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
        // Regex fallback extraction if model wrapped in partial JSON or truncated
        const answerMatch = cleaned.match(/"answer"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);
        const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
        const summaryMatch = cleaned.match(/"summary"\s*:\s*"([^"]+)"/);
        const analysisMatch = cleaned.match(/"analysis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);

        if (answerMatch || titleMatch || summaryMatch || analysisMatch) {
          parsed = {
            title: titleMatch ? titleMatch[1] : null,
            answer: answerMatch ? answerMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : (summaryMatch ? summaryMatch[1] : null),
            analysis: analysisMatch ? analysisMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : null,
          };
        } else {
          // Direct conversational text
          parsed = {
            title: 'Guruji Guidance',
            answer: cleaned,
            analysis: cleaned,
          };
        }
      }
    }

    // 1. Resolve direct answer
    const answer = parsed?.answer || parsed?.summary || parsed?.analysis || '';

    // 2. Resolve title
    const title = parsed?.title || (intent !== 'general' ? `${intent.replace('_', ' ').toUpperCase()} · Guruji Guidance` : 'Guruji Guidance');

    // 3. Resolve evidence (conditional)
    let evidence = Array.isArray(parsed?.evidence) ? parsed.evidence : [];
    evidence = evidence.filter(e => e && e.label && e.value).map(e => ({
      label: String(e.label).trim(),
      value: String(e.value).trim(),
      source: e.source || 'calculated',
    }));

    // 4. Resolve sections (conditional progressive disclosure)
    let sections = Array.isArray(parsed?.sections) ? parsed.sections : [];
    sections = sections.filter(s => s && s.body && String(s.body).trim().length > 0).map(s => ({
      title: s.title || (s.type === 'personality' ? 'What I see in you' : 'What this means'),
      type: s.type || 'interpretation',
      body: String(s.body).trim(),
    }));

    // 5. Resolve timing
    let timing = parsed?.timing;
    if (!timing || typeof timing !== 'object') {
      timing = {
        available: false,
        summary: null,
        windows: [],
      };
    } else {
      timing = {
        available: Boolean(timing.available),
        summary: timing.summary || null,
        windows: Array.isArray(timing.windows) ? timing.windows : [],
      };
    }

    // 6. Resolve actions / practical takeaways
    let actions = parsed?.actions || parsed?.recommendations;
    if (!Array.isArray(actions)) {
      actions = typeof actions === 'string' && actions.trim() ? [actions.trim()] : [];
    }
    actions = actions.filter(a => typeof a === 'string' && a.trim().length > 0);

    // 7. Resolve contextual follow-up questions
    let followUps = parsed?.followUps || parsed?.suggestedFollowUps;
    if (Array.isArray(followUps)) {
      followUps = followUps.map((item) => {
        if (typeof item === 'string') {
          return { label: item.slice(0, 30), question: item };
        }
        return {
          label: item.label || item.question?.slice(0, 30) || 'Explore',
          question: item.question || item.label || '',
        };
      }).filter(f => f.question && f.question.trim().length > 0);
    } else {
      followUps = [];
    }

    // Default follow-ups if empty based on intent
    if (followUps.length === 0) {
      if (intent === 'career') {
        followUps = [
          { label: 'Growth Timing', question: 'When does my next strong career phase activate?' },
          { label: 'Role Alignment', question: 'Which vocational direction aligns best with my 10th house?' },
        ];
      } else if (intent === 'marriage_love') {
        followUps = [
          { label: 'Partner Traits', question: 'What partner characteristics does my 7th house indicate?' },
          { label: 'Timing Window', question: 'When does my Dasha indicate favorable partnership timing?' },
        ];
      } else if (intent === 'mental_emotional') {
        followUps = [
          { label: 'Inner Calm', question: 'What daily practice grounds my Moon placement best?' },
          { label: 'Decision Timing', question: 'How can I avoid getting stuck in mental deliberation?' },
        ];
      } else {
        followUps = [
          { label: 'Current Dasha', question: 'How does my active Dasha influence this period?' },
          { label: 'Lagna Alignment', question: 'What does my Lagna suggest I focus on right now?' },
        ];
      }
    }

    // Build unified text for fallback and legacy readers
    let fullText = '';
    if (answer) fullText += `${answer}\n\n`;
    sections.forEach(s => {
      fullText += `### ${s.title}\n${s.body}\n\n`;
    });
    if (actions.length > 0) {
      fullText += `### What you can do\n` + actions.map(a => `• ${a}`).join('\n') + `\n\n`;
    }
    if (timing.available && timing.summary) {
      fullText += `### Timing Insight\n${timing.summary}\n\n`;
    }

    return {
      type: 'astrology_response',
      intent: parsed?.intent || intent,
      depth: parsed?.depth || depth,
      language: parsed?.language || langStyle.language || 'en',
      tone: 'guruji',
      title,
      answer: answer.trim(),
      evidence,
      sections,
      timing,
      actions,
      followUps: followUps.slice(0, 4),
      caveat: parsed?.caveat || null,
      // Legacy compatibility fields
      summary: answer.trim(),
      analysis: fullText.trim() || answer.trim(),
      recommendations: actions,
      suggestedFollowUps: followUps.map(f => f.question),
      confidence: parsed?.confidence || 'High',
      chartsUsed: parsed?.chartsUsed || ['D1 Natal'],
    };
  }
}

export default ResponseFormatter;
