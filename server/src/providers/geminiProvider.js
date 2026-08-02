import BaseLLMProvider from './baseProvider.js';

export class GeminiProvider extends BaseLLMProvider {
  constructor() {
    super('gemini');
  }

  getApiKey() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || !key.trim()) {
      throw new Error('GEMINI_API_KEY is missing or empty on backend server.');
    }
    return key.trim();
  }

  getModel() {
    return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generateContent({ systemInstruction, contents, temperature = 0.7, maxTokens = 2500 }) {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature,
        topP: 0.95,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    };

    console.log(`[GeminiProvider] Invoking model: ${model}`);
    const startTime = Date.now();

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;
    const rawText = await res.text().catch(() => '');

    if (!res.ok) {
      console.error(`[GeminiProvider] Error HTTP ${res.status}: ${rawText.substring(0, 300)}`);
      let errData = {};
      try { errData = JSON.parse(rawText); } catch (e) {}
      const msg = errData?.error?.message || rawText || `Gemini API HTTP ${res.status}`;
      throw new Error(`AI_PROVIDER_ERROR: ${msg}`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      throw new Error('AI_PROVIDER_ERROR: Invalid JSON response from Gemini API.');
    }

    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    const usage = data?.usageMetadata || {};

    if (!text) {
      throw new Error('AI_PROVIDER_ERROR: Empty response text received from Gemini API.');
    }

    return {
      text,
      rawResponse: data,
      promptTokens: usage.promptTokenCount || null,
      completionTokens: usage.candidatesTokenCount || null,
      modelUsed: model,
      durationMs: duration,
    };
  }

  /**
   * Stream generate content from Gemini API using onChunk callback.
   */
  async generateContentStream({ systemInstruction, contents, temperature = 0.7, maxTokens = 1000, onChunk }) {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: {
        temperature,
        topP: 0.95,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    };

    console.log(`[GeminiProvider] Invoking stream model: ${model}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const rawText = await res.text().catch(() => '');
      throw new Error(`AI_PROVIDER_ERROR: ${rawText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let textAccumulator = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // SSE chunks are wrapped in JSON array elements or text lines
      // Simple parse / regex clean of chunk response
      try {
        // Try parsing buffer directly if it completes a chunk
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          
          // Parse chunk json structure from Google Stream
          let chunkJsonStr = cleanLine;
          if (chunkJsonStr.startsWith('[') || chunkJsonStr.startsWith(',')) {
            chunkJsonStr = chunkJsonStr.substring(1);
          }
          if (chunkJsonStr.endsWith(']')) {
            chunkJsonStr = chunkJsonStr.substring(0, chunkJsonStr.length - 1);
          }

          const parsedChunk = JSON.parse(chunkJsonStr);
          const chunkText = parsedChunk?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunkText) {
            textAccumulator += chunkText;
            if (typeof onChunk === 'function') {
              onChunk(chunkText);
            }
          }
        }
      } catch (e) {
        // Buffer incomplete, wait for next chunk
      }
    }

    return {
      text: textAccumulator,
      modelUsed: model,
    };
  }
}

export default GeminiProvider;
