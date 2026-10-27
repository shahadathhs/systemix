import {
  RateLimitEntry,
  RateLimitResult,
  EntryStore,
} from '../types/rate-limit.types';
import { createEntry } from './store';
import { allowedResult, blockedResult } from './result';

/**
 * Computes the available tokens for an entry, refilling continuously at
 * limit/windowMs tokens per ms. Buckets start full.
 */
function refill(
  entry: RateLimitEntry,
  limit: number,
  windowMs: number,
  now: number,
): number {
  const elapsed = Math.max(0, now - entry.lastRefill);
  return Math.min(limit, entry.tokens + (elapsed * limit) / windowMs);
}

/**
 * Token bucket algorithm: a bucket of `limit` tokens refills continuously
 * at limit/windowMs tokens per ms. Each request consumes one token.
 * Smooths bursts while allowing short spikes.
 */
export function hitTokenBucket(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry = store.get(key) ?? createFullBucket(limit, now);
  const tokens = refill(entry, limit, windowMs, now);

  if (tokens < 1) {
    const reset = Math.ceil(now + (1 - tokens) * (windowMs / limit));
    store.set(key, {
      ...entry,
      tokens,
      lastRefill: now,
      expiresAt: Math.ceil(now + (limit - tokens) * (windowMs / limit)),
    });
    return blockedResult(limit, reset, now);
  }

  const remaining = Math.min(limit - 1, Math.floor(tokens - 1));
  const reset = Math.ceil(now + (limit - (tokens - 1)) * (windowMs / limit));
  store.set(key, {
    ...entry,
    tokens: tokens - 1,
    lastRefill: now,
    expiresAt: reset,
  });
  return allowedResult(limit, remaining, reset);
}

/**
 * Peeks at token-bucket state without consuming a token.
 */
export function peekTokenBucket(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry = store.get(key) ?? createFullBucket(limit, now);
  const tokens = refill(entry, limit, windowMs, now);

  if (tokens < 1) {
    const reset = Math.ceil(now + (1 - tokens) * (windowMs / limit));
    return blockedResult(limit, reset, now);
  }
  const reset = Math.ceil(now + (limit - tokens) * (windowMs / limit));
  return allowedResult(limit, Math.floor(tokens), reset);
}

function createFullBucket(limit: number, now: number): RateLimitEntry {
  const entry = createEntry(now);
  entry.tokens = limit;
  entry.lastRefill = now;
  return entry;
}
