/**
 * BaseLLMProvider
 * Abstract interface for LLM provider drivers (Gemini, OpenAI, Claude, DeepSeek, Local LLM).
 */
export class BaseLLMProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generate content using the provider.
   * Must return { text, rawResponse, promptTokens, completionTokens, modelUsed }
   */
  async generateContent({ systemInstruction, contents, temperature = 0.7, maxTokens = 1000 }) {
    throw new Error('generateContent must be implemented by concrete LLM provider subclass.');
  }
}

export default BaseLLMProvider;
