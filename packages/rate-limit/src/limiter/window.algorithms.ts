import {
  RateLimitEntry,
  RateLimitResult,
  EntryStore,
} from '../types/rate-limit.types';
import { createEntry } from './store';
import { allowedResult, blockedResult, readEntry } from './result';

/**
 * Fixed window algorithm: a counter resets every windowMs.
 * Memory-efficient, allows bursts at window boundaries.
 */
export function hitFixedWindow(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, {
      ...createEntry(now),
      count: 1,
      resetAt,
      expiresAt: resetAt,
    });
    return allowedResult(limit, limit - 1, resetAt);
  }

  entry.count += 1;
  store.set(key, entry);

  if (entry.count > limit) {
    return blockedResult(limit, entry.resetAt, now);
  }
  return allowedResult(limit, limit - entry.count, entry.resetAt);
}

/**
 * Peeks at fixed-window state without recording a hit.
 */
export function peekFixedWindow(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry = readEntry(store, key, now);

  if (!entry.count || now >= entry.resetAt) {
    return allowedResult(limit, limit, now + windowMs);
  }
  if (entry.count >= limit) {
    return blockedResult(limit, entry.resetAt, now);
  }
  return allowedResult(limit, limit - entry.count, entry.resetAt);
}

/**
 * Sliding window algorithm (log): keeps timestamps of requests inside the
 * window. Smooth boundaries at the cost of more memory.
 */
export function hitSlidingWindow(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry: RateLimitEntry = store.get(key) ?? createEntry(now);
  const windowStart = now - windowMs;

  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limit) {
    entry.resetAt = entry.timestamps[0] + windowMs;
    entry.expiresAt = entry.timestamps[entry.timestamps.length - 1] + windowMs;
    store.set(key, entry);
    return blockedResult(limit, entry.resetAt, now);
  }

  entry.timestamps.push(now);
  entry.resetAt = entry.timestamps[0] + windowMs;
  entry.expiresAt = now + windowMs;
  store.set(key, entry);

  return allowedResult(limit, limit - entry.timestamps.length, entry.resetAt);
}

/**
 * Peeks at sliding-window state without recording a hit.
 */
export function peekSlidingWindow(
  store: EntryStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const entry = readEntry(store, key, now);
  const windowStart = now - windowMs;
  const active = entry.timestamps.filter((t) => t > windowStart);

  if (active.length >= limit) {
    return blockedResult(limit, active[0] + windowMs, now);
  }
  const reset = active.length ? active[0] + windowMs : now + windowMs;
  return allowedResult(limit, limit - active.length, reset);
}
