import type { LeaderboardResponse } from './types.js';

/**
  - simple in-memory cache with TTL support
  - used for caching leaderboard responses to reduce GCS reads
*/

/**
  - union type of all cacheable values
  - add additional types here as caching needs expand
*/
type CacheableValue = LeaderboardResponse;

interface CacheEntry {
  data: CacheableValue;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/**
  - default TTL for cache entries (30 seconds)
*/
const DEFAULT_TTL_MS = 30 * 1000;

/**
  - gets a value from the cache
  - @param key - cache key
  - @returns cached value or undefined if not found or expired
*/
export function get(key: string): CacheableValue | undefined {
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  // check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.data;
}

/**
  - sets a value in the cache
  - @param key - cache key
  - @param value - value to cache
  - @param ttlMs - time to live in milliseconds (default 30 seconds)
*/
export function set(key: string, value: CacheableValue, ttlMs: number = DEFAULT_TTL_MS): void {
  cache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
  - invalidates a cache entry
  - @param key - cache key to invalidate
*/
export function invalidate(key: string): void {
  cache.delete(key);
}

/**
  - invalidates all cache entries matching a prefix
  - @param prefix - key prefix to match
*/
export function invalidateByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
  - clears the entire cache
*/
export function clear(): void {
  cache.clear();
}

/**
  - generates a cache key for leaderboard data
  - @param puzzleNum - puzzle number
  - @returns cache key
*/
export function leaderboardKey(puzzleNum: string): string {
  return `leaderboard-${puzzleNum}`;
}
