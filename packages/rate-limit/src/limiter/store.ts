import {
  RateLimitEntry,
  RateLimitPolicy,
  RateLimitResult,
  RateLimitStore,
} from '../types/rate-limit.types';
import { hitTokenBucket, peekTokenBucket } from './token-bucket.algorithm';
import {
  hitFixedWindow,
  hitSlidingWindow,
  peekFixedWindow,
  peekSlidingWindow,
} from './window.algorithms';

export interface InMemoryStoreOptions {
  /**
   * Maximum number of tracked keys. When full, idle entries are dropped
   * first; if that is not enough, the oldest keys are evicted (an evicted
   * client starts over with a fresh allowance).
   * @default 100_000
   */
  maxKeys?: number;

  /**
   * Minimum time between automatic sweeps of idle entries.
   * @default 60_000
   */
  sweepIntervalMs?: number;
}

/**
 * In-memory store backed by a Map. Every operation is synchronous, so each
 * hit is atomic within the process. Suitable for single-process servers and
 * development; use a shared store (see RateLimitStore) across processes.
 *
 * Memory is bounded: idle entries are swept automatically and the number of
 * keys is capped by `maxKeys`, because keys usually come from clients.
 */
export class InMemoryStore implements RateLimitStore {
  private readonly map = new Map<string, RateLimitEntry>();
  private readonly maxKeys: number;
  private readonly sweepIntervalMs: number;
  private lastSweep = 0;

  constructor(options: InMemoryStoreOptions = {}) {
    this.maxKeys = options.maxKeys ?? 100_000;
    this.sweepIntervalMs = options.sweepIntervalMs ?? 60_000;
    if (!Number.isInteger(this.maxKeys) || this.maxKeys <= 0) {
      throw new Error('Invalid maxKeys. It must be a positive integer.');
    }
  }

  hit(key: string, policy: RateLimitPolicy, now: number): RateLimitResult {
    this.maintain(key, now);
    const { limit, windowMs } = policy;
    switch (policy.algorithm) {
      case 'sliding-window':
        return hitSlidingWindow(this.map, key, limit, windowMs, now);
      case 'token-bucket':
        return hitTokenBucket(this.map, key, limit, windowMs, now);
      default:
        return hitFixedWindow(this.map, key, limit, windowMs, now);
    }
  }

  peek(key: string, policy: RateLimitPolicy, now: number): RateLimitResult {
    const { limit, windowMs } = policy;
    switch (policy.algorithm) {
      case 'sliding-window':
        return peekSlidingWindow(this.map, key, limit, windowMs, now);
      case 'token-bucket':
        return peekTokenBucket(this.map, key, limit, windowMs, now);
      default:
        return peekFixedWindow(this.map, key, limit, windowMs, now);
    }
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  /** Drops entries that are idle at `now`. */
  sweep(now: number = Date.now()): void {
    for (const [key, entry] of this.map) {
      if (entry.expiresAt <= now) this.map.delete(key);
    }
    this.lastSweep = now;
  }

  get size(): number {
    return this.map.size;
  }

  private maintain(key: string, now: number): void {
    if (now - this.lastSweep >= this.sweepIntervalMs) this.sweep(now);
    if (this.map.has(key) || this.map.size < this.maxKeys) return;

    this.sweep(now);
    // Still full: evict oldest-inserted keys to make room for this one.
    for (const oldest of this.map.keys()) {
      if (this.map.size < this.maxKeys) break;
      this.map.delete(oldest);
    }
  }
}

/**
 * Creates a fresh entry pre-filled with zero values. Algorithms mutate
 * only the fields they use.
 */
export function createEntry(now: number): RateLimitEntry {
  return {
    count: 0,
    resetAt: now,
    timestamps: [],
    tokens: 0,
    lastRefill: now,
    expiresAt: now,
  };
}
