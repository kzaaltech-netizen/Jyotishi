import GeminiProvider from './geminiProvider.js';

const providers = {
  gemini: new GeminiProvider(),
};

export function getProvider(name = 'gemini') {
  const providerKey = String(name || 'gemini').toLowerCase();
  const provider = providers[providerKey] || providers.gemini;
  return provider;
}
