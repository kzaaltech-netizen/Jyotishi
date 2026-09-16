/**
 * Centralized Guardrail & Safety Configuration
 * Sensible defaults with environment variable overrides and dynamic runtime support.
 */

const DEFAULT_CONFIG = {
  GURUJI_ENABLED: true,
  GURUJI_EMERGENCY_STOP: false,
  GURUJI_FREE_DAILY_LIMIT: 3,
  GURUJI_MAX_QUESTIONS_PER_SESSION: 20,
  GURUJI_SESSION_MINUTES: 10,
  GURUJI_RATE_LIMIT_PER_SECOND: 1,
  GEMINI_GLOBAL_DAILY_LIMIT: 1000,
  FREEASTROAPI_GLOBAL_DAILY_LIMIT: 500,
  MAX_USER_MESSAGE_LENGTH: 500,
  GEMINI_TIMEOUT_MS: 25000,
};

// In-memory overrides (used for testing or dynamic admin controls)
let runtimeOverrides = {};

export function getGuardrailConfig() {
  return {
    GURUJI_ENABLED: runtimeOverrides.GURUJI_ENABLED ?? (process.env.GURUJI_ENABLED !== 'false'),
    GURUJI_EMERGENCY_STOP: runtimeOverrides.GURUJI_EMERGENCY_STOP ?? (process.env.GURUJI_EMERGENCY_STOP === 'true'),
    GURUJI_FREE_DAILY_LIMIT: parseInt(runtimeOverrides.GURUJI_FREE_DAILY_LIMIT ?? process.env.GURUJI_FREE_DAILY_LIMIT ?? DEFAULT_CONFIG.GURUJI_FREE_DAILY_LIMIT, 10),
    GURUJI_MAX_QUESTIONS_PER_SESSION: parseInt(runtimeOverrides.GURUJI_MAX_QUESTIONS_PER_SESSION ?? process.env.GURUJI_MAX_QUESTIONS_PER_SESSION ?? DEFAULT_CONFIG.GURUJI_MAX_QUESTIONS_PER_SESSION, 10),
    GURUJI_SESSION_MINUTES: parseInt(runtimeOverrides.GURUJI_SESSION_MINUTES ?? process.env.GURUJI_SESSION_MINUTES ?? DEFAULT_CONFIG.GURUJI_SESSION_MINUTES, 10),
    GURUJI_RATE_LIMIT_PER_SECOND: parseInt(runtimeOverrides.GURUJI_RATE_LIMIT_PER_SECOND ?? process.env.GURUJI_RATE_LIMIT_PER_SECOND ?? DEFAULT_CONFIG.GURUJI_RATE_LIMIT_PER_SECOND, 10),
    GEMINI_GLOBAL_DAILY_LIMIT: parseInt(runtimeOverrides.GEMINI_GLOBAL_DAILY_LIMIT ?? process.env.GEMINI_GLOBAL_DAILY_LIMIT ?? DEFAULT_CONFIG.GEMINI_GLOBAL_DAILY_LIMIT, 10),
    FREEASTROAPI_GLOBAL_DAILY_LIMIT: parseInt(runtimeOverrides.FREEASTROAPI_GLOBAL_DAILY_LIMIT ?? process.env.FREEASTROAPI_GLOBAL_DAILY_LIMIT ?? DEFAULT_CONFIG.FREEASTROAPI_GLOBAL_DAILY_LIMIT, 10),
    MAX_USER_MESSAGE_LENGTH: parseInt(runtimeOverrides.MAX_USER_MESSAGE_LENGTH ?? process.env.MAX_USER_MESSAGE_LENGTH ?? DEFAULT_CONFIG.MAX_USER_MESSAGE_LENGTH, 10),
    GEMINI_TIMEOUT_MS: parseInt(runtimeOverrides.GEMINI_TIMEOUT_MS ?? process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_CONFIG.GEMINI_TIMEOUT_MS, 10),
  };
}

export function setRuntimeConfigOverride(key, value) {
  runtimeOverrides[key] = value;
}

export function resetRuntimeConfigOverrides() {
  runtimeOverrides = {};
}

export default {
  getGuardrailConfig,
  setRuntimeConfigOverride,
  resetRuntimeConfigOverrides,
};
