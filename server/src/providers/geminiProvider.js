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

  async generateContent({ systemInstruction, contents, temperature = 0.7, maxTokens = 2500 }) {
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

      console.log(`[GeminiProvider] Invoking model (${i + 1}/${candidateModels.length}): ${model}`);
      const startTime = Date.now();

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
