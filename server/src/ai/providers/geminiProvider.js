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
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  }

  getCandidateModels() {
    const primary = this.getModel();
    return Array.from(new Set([
      primary,
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.6-flash',
    ]));
  }

  // When every model is overloaded (HTTP 503 / high demand), wait a moment and try
  // the list once more before giving up.
  // A reply must arrive within AI_TOTAL_TIMEOUT_MS (default 50 s, under the app's
  // 60 s request limit); a single model gets at most AI_MODEL_TIMEOUT_MS (20 s), so a
  // model that never answers cannot hang the request.
  async generateContent(params) {
    const deadline = Date.now() + (Number(process.env.AI_TOTAL_TIMEOUT_MS) || 50_000);
    try {
      return await this.generateContentOnce(params, deadline);
    } catch (err) {
      if (!/high demand|temporarily unavailable|overloaded|HTTP 503|timed out/i.test(err.message)) throw err;
      if (deadline - Date.now() < 12_000) throw err;
      await new Promise((r) => setTimeout(r, Number(process.env.AI_BUSY_RETRY_MS) || 2500));
      return this.generateContentOnce(params, deadline);
    }
  }

  async generateContentOnce({ systemInstruction, contents, temperature = 0.7, maxTokens = 2500 }, deadline = Date.now() + 50_000) {
    const apiKey = this.getApiKey();
    const candidateModels = this.getCandidateModels();
    let lastError = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
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

      const remaining = deadline - Date.now();
      if (remaining < 3000) break;
      console.log(`[GeminiProvider] Invoking model (${i + 1}/${candidateModels.length}): ${model}`);
      const startTime = Date.now();

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(Math.min(Number(process.env.AI_MODEL_TIMEOUT_MS) || 20_000, remaining)),
        });

        const duration = Date.now() - startTime;
        const rawText = await res.text().catch(() => '');

        if (!res.ok) {
          let errData = {};
          try { errData = JSON.parse(rawText); } catch (e) {}
          const msg = errData?.error?.message || rawText || `Gemini API HTTP ${res.status}`;
          console.warn(`[GeminiProvider] Model ${model} returned HTTP ${res.status}: ${msg.substring(0, 160)}`);

          // If high demand (503), rate limit (429), or retired/not found (404), fall back to next model
          if (res.status === 503 || res.status === 429 || res.status === 404 || msg.includes('high demand') || msg.includes('Quota exceeded')) {
            lastError = new Error(`AI_PROVIDER_ERROR: ${msg}`);
            await new Promise(r => setTimeout(r, 400));
            continue;
          }
          throw new Error(`AI_PROVIDER_ERROR: ${msg}`);
        }

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          console.warn(`[GeminiProvider] Model ${model} returned unparseable JSON, trying next model...`);
          lastError = new Error('AI_PROVIDER_ERROR: Invalid JSON response from Gemini API.');
          continue;
        }

        const candidate = data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || '';
        const usage = data?.usageMetadata || {};

        if (!text) {
          console.warn(`[GeminiProvider] Model ${model} returned empty response text, trying next model...`);
          lastError = new Error('AI_PROVIDER_ERROR: Empty response text received from Gemini API.');
          continue;
        }

        return {
          text,
          rawResponse: data,
          promptTokens: usage.promptTokenCount || null,
          completionTokens: usage.candidatesTokenCount || null,
          modelUsed: model,
          durationMs: duration,
        };
      } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          console.warn(`[GeminiProvider] Model ${model} timed out, trying next model...`);
          lastError = new Error('AI_PROVIDER_ERROR: The AI model timed out.');
          continue;
        }
        if (err.message && (err.message.includes('high demand') || err.message.includes('503') || err.message.includes('429') || err.message.includes('404'))) {
          lastError = err;
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('AI_PROVIDER_ERROR: All Gemini models temporarily unavailable. Please retry in a few moments.');
  }

  /**
   * Stream generate content from Gemini API using onChunk callback.
   */
  async generateContentStream({ systemInstruction, contents, temperature = 0.7, maxTokens = 1000, onChunk }) {
    const apiKey = this.getApiKey();
    const candidateModels = this.getCandidateModels();
    let lastError = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
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

      console.log(`[GeminiProvider] Invoking stream model (${i + 1}/${candidateModels.length}): ${model}`);
      
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(Number(process.env.AI_STREAM_TIMEOUT_MS) || 90_000),
        });

        if (!res.ok) {
          const rawText = await res.text().catch(() => '');
          let errData = {};
          try { errData = JSON.parse(rawText); } catch (e) {}
          const msg = errData?.error?.message || rawText || `HTTP ${res.status}`;
          console.warn(`[GeminiProvider] Stream model ${model} returned HTTP ${res.status}: ${msg.substring(0, 160)}`);

          if (res.status === 503 || res.status === 429 || res.status === 404 || msg.includes('high demand')) {
            lastError = new Error(`AI_PROVIDER_ERROR: ${msg}`);
            await new Promise(r => setTimeout(r, 400));
            continue;
          }
          throw new Error(`AI_PROVIDER_ERROR: ${msg}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let textAccumulator = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          try {
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
              const cleanLine = line.trim();
              if (!cleanLine) continue;
              
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
            // Wait for full chunk
          }
        }

        return {
          text: textAccumulator,
          modelUsed: model,
        };
      } catch (err) {
        if (err.message && (err.message.includes('high demand') || err.message.includes('503') || err.message.includes('429') || err.message.includes('404'))) {
          lastError = err;
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('AI_PROVIDER_ERROR: All Gemini models temporarily unavailable.');
  }
}

export default GeminiProvider;
