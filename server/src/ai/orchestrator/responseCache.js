import crypto from 'crypto';

// In-memory cache singleton (with simple TTL/LRU logic if desired)
const localCache = new Map();

export class ResponseCache {
  /**
   * Generate cache key hash.
   */
  static generateHash({ userId, mode, message, chartGeneratedAt }) {
    const dataStr = `${userId}:${mode}:${String(message).trim().toLowerCase()}:${chartGeneratedAt || ''}`;
    return crypto.createHash('sha256').update(dataStr).digest('hex');
  }

  /**
   * Try to get cached response from local memory cache.
   */
  static get({ userId, mode, message, chartGeneratedAt }) {
    const key = this.generateHash({ userId, mode, message, chartGeneratedAt });
    const cached = localCache.get(key);
    if (!cached) return null;

    // Check expiry (e.g. 1 hour expiry)
    if (Date.now() - cached.timestamp > 3600 * 1000) {
      localCache.delete(key);
      return null;
    }

    console.log(`[ResponseCache] HIT cache key: ${key.substring(0, 10)}...`);
    return cached.response;
  }

  /**
   * Save response to cache.
   */
  static set({ userId, mode, message, chartGeneratedAt, response }) {
    const key = this.generateHash({ userId, mode, message, chartGeneratedAt });
    console.log(`[ResponseCache] SET cache key: ${key.substring(0, 10)}...`);
    localCache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for a user.
   */
  static clearUserCache(userId) {
    for (const [key, value] of localCache.entries()) {
      if (key.startsWith(`${userId}:`)) {
        localCache.delete(key);
      }
    }
  }
}

export default ResponseCache;
