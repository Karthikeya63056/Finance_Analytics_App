/**
 * CacheManager — In-memory cache with TTL and LRU eviction
 *
 * Used by analytics, forecasting, and AI services to avoid
 * redundant computation. Singleton instance.
 */

import { EventBus, Events } from './EventBus';

class CacheManagerCore {
  constructor(maxSize = 200) {
    this._cache = new Map();
    this._maxSize = maxSize;
    this._hits = 0;
    this._misses = 0;
  }

  /**
   * Get a cached value
   * @param {string} key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const entry = this._cache.get(key);
    if (!entry) {
      this._misses++;
      return undefined;
    }
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._cache.delete(key);
      this._misses++;
      return undefined;
    }
    this._hits++;
    // Move to end for LRU
    this._cache.delete(key);
    this._cache.set(key, entry);
    return entry.value;
  }

  /**
   * Set a cached value
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlMs] - Time-to-live in milliseconds (0 = no expiry)
   */
  set(key, value, ttlMs = 0) {
    if (this._cache.size >= this._maxSize) {
      const firstKey = this._cache.keys().next().value;
      this._cache.delete(firstKey);
    }
    this._cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null,
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key) {
    const entry = this._cache.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this._cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Invalidate (delete) a specific key or pattern
   * @param {string} keyOrPattern - Exact key or glob pattern with *
   */
  invalidate(keyOrPattern) {
    if (!keyOrPattern.includes('*')) {
      this._cache.delete(keyOrPattern);
    } else {
      const regex = new RegExp(
        '^' + keyOrPattern.replace(/\*/g, '.*') + '$'
      );
      for (const key of [...this._cache.keys()]) {
        if (regex.test(key)) this._cache.delete(key);
      }
    }
    EventBus.publish(Events.CACHE_INVALIDATED, { pattern: keyOrPattern });
  }

  /**
   * Get or compute — returns cached value or runs factory and caches result
   * @param {string} key
   * @param {Function} factory - () => value (can be async)
   * @param {number} [ttlMs]
   * @returns {*}
   */
  async getOrCompute(key, factory, ttlMs = 0) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Synchronous version of getOrCompute
   */
  getOrComputeSync(key, factory, ttlMs = 0) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const value = factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /** Clear all cached entries */
  clear() {
    this._cache.clear();
    this._hits = 0;
    this._misses = 0;
  }

  /** Purge only expired entries */
  purgeExpired() {
    const now = Date.now();
    for (const [key, entry] of this._cache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this._cache.delete(key);
      }
    }
  }

  /** Diagnostic stats */
  get stats() {
    return {
      size: this._cache.size,
      maxSize: this._maxSize,
      hits: this._hits,
      misses: this._misses,
      hitRate: this._hits + this._misses > 0
        ? (this._hits / (this._hits + this._misses) * 100).toFixed(1) + '%'
        : '0%',
    };
  }
}

export const CacheManager = new CacheManagerCore();
