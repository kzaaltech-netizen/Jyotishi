/**
 * GuardrailService
 * Centralized server-side API protection layer.
 * Guards Gemini and FreeAstroAPI before any expensive external calls are initiated.
 */

import crypto from 'crypto';
import { getGuardrailConfig } from './guardrailConfig.js';

export const GUARDRAIL_ERROR_CODES = {
  RATE_LIMITED: 'RATE_LIMITED',
  CONCURRENT_REQUEST: 'CONCURRENT_REQUEST',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  MESSAGE_EMPTY: 'MESSAGE_EMPTY',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_QUESTION_LIMIT_REACHED: 'SESSION_QUESTION_LIMIT_REACHED',
  GURUJI_TEMPORARILY_DISABLED: 'GURUJI_TEMPORARILY_DISABLED',
  SERVICE_TEMPORARILY_UNAVAILABLE: 'SERVICE_TEMPORARILY_UNAVAILABLE',
  GLOBAL_LIMIT_EXCEEDED: 'GLOBAL_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
};

class GuardrailServiceClass {
  constructor() {
    // In-memory rate limiting: Map<userId, timestampMs>
    this.userLastRequest = new Map();

    // In-memory concurrency locks: Map<userId, { timestamp, messageHash }>
    this.inFlightLocks = new Map();

    // Global daily provider counters: Map<dateKey_provider, count>
    this.globalCounters = new Map();
  }

  /**
   * Helper: Get current UTC date key YYYY-MM-DD
   */
  getTodayUtcKey() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * 1. Global Kill Switch & Feature Check
   */
  checkGlobalStatus() {
    const config = getGuardrailConfig();
    if (config.GURUJI_EMERGENCY_STOP || !config.GURUJI_ENABLED) {
      return {
        allowed: false,
        code: GUARDRAIL_ERROR_CODES.GURUJI_TEMPORARILY_DISABLED,
        message: 'Guruji consultations are temporarily paused for maintenance. Please check back shortly.',
      };
    }
    return { allowed: true };
  }

  /**
   * 2. Global Provider Daily Limit Check
   */
  checkGlobalProviderLimit(providerName = 'gemini') {
    const config = getGuardrailConfig();
    const dateKey = this.getTodayUtcKey();
    const key = `${dateKey}_${providerName}`;
    const currentCount = this.globalCounters.get(key) || 0;

    const limit = providerName === 'freeastroapi'
      ? config.FREEASTROAPI_GLOBAL_DAILY_LIMIT
      : config.GEMINI_GLOBAL_DAILY_LIMIT;

    if (currentCount >= limit) {
      return {
        allowed: false,
        code: GUARDRAIL_ERROR_CODES.GLOBAL_LIMIT_EXCEEDED,
        message: 'Global daily consultation capacity reached. Please try again tomorrow.',
      };
    }

    return { allowed: true, currentCount, limit };
  }

  /**
   * Increment global provider daily counter
   */
  incrementGlobalProviderCounter(providerName = 'gemini') {
    const dateKey = this.getTodayUtcKey();
    const key = `${dateKey}_${providerName}`;
    const current = this.globalCounters.get(key) || 0;
    this.globalCounters.set(key, current + 1);
  }

  /**
   * 3. Input Message Size & Sanitization Check
   */
  validateInputMessage(message) {
    if (!message || typeof message !== 'string') {
      return {
        valid: false,
        code: GUARDRAIL_ERROR_CODES.MESSAGE_EMPTY,
        message: 'Consultation inquiry cannot be empty.',
      };
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return {
        valid: false,
        code: GUARDRAIL_ERROR_CODES.MESSAGE_EMPTY,
        message: 'Consultation inquiry cannot be empty.',
      };
    }

    const config = getGuardrailConfig();
    if (trimmed.length > config.MAX_USER_MESSAGE_LENGTH) {
      return {
        valid: false,
        code: GUARDRAIL_ERROR_CODES.MESSAGE_TOO_LONG,
        message: `Inquiry exceeds maximum permitted length of ${config.MAX_USER_MESSAGE_LENGTH} characters. Please keep questions concise.`,
        maxLength: config.MAX_USER_MESSAGE_LENGTH,
        receivedLength: trimmed.length,
      };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * 4. Per-User Rate Limiting (1 request/sec default)
   */
  checkRateLimit(userId) {
    if (!userId) return { allowed: true };

    const config = getGuardrailConfig();
    const now = Date.now();
    const minIntervalMs = 1000 / (config.GURUJI_RATE_LIMIT_PER_SECOND || 1);

    const lastTime = this.userLastRequest.get(userId);
    if (lastTime && (now - lastTime) < minIntervalMs) {
      const waitTimeMs = Math.ceil(minIntervalMs - (now - lastTime));
      return {
        allowed: false,
        code: GUARDRAIL_ERROR_CODES.RATE_LIMITED,
        message: 'Please take a moment between questions. Guruji reflects upon one inquiry at a time.',
        retryAfterMs: waitTimeMs,
      };
    }

    this.userLastRequest.set(userId, now);
    return { allowed: true };
  }

  /**
   * 5. Concurrency / In-Flight Request Lock
   * Prevents simultaneous requests from the same user from triggering Gemini in parallel.
   */
  acquireLock(userId, message) {
    if (!userId) return { acquired: true };

    const now = Date.now();
    const existing = this.inFlightLocks.get(userId);

    // Auto-release stale lock older than 30s
    if (existing && (now - existing.timestamp) > 30000) {
      this.inFlightLocks.delete(userId);
    } else if (existing) {
      return {
        acquired: false,
        code: GUARDRAIL_ERROR_CODES.CONCURRENT_REQUEST,
        message: 'A consultation inquiry is already being processed. Please wait for Guruji to complete the response.',
      };
    }

    const messageHash = crypto.createHash('sha256').update(String(message || '')).digest('hex').slice(0, 16);
    this.inFlightLocks.set(userId, { timestamp: now, messageHash });
    return { acquired: true, messageHash };
  }

  /**
   * Release Concurrency Lock
   */
  releaseLock(userId) {
    if (userId) {
      this.inFlightLocks.delete(userId);
    }
  }

  /**
   * Clear all in-memory state (useful for tests)
   */
  resetState() {
    this.userLastRequest.clear();
    this.inFlightLocks.clear();
    this.globalCounters.clear();
  }
}

export const GuardrailService = new GuardrailServiceClass();
export default GuardrailService;
