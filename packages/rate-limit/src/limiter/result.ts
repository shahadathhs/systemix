import {
  RateLimitEntry,
  RateLimitResult,
  RateLimitStore,
} from '../types/rate-limit.types';
import { createEntry } from './store';

/**
 * Reads an entry without recording a hit, for peek().
 */
export function readEntry(
  store: RateLimitStore,
  key: string,
  now: number,
): RateLimitEntry {
  return store.get(key) ?? createEntry(now);
}

/**
 * Builds the result for an allowed request.
 */
export function allowedResult(
  limit: number,
  remaining: number,
  reset: number,
): RateLimitResult {
  return { success: true, limit, remaining, reset, retryAfter: 0 };
}

/**
 * Builds the result for a blocked request.
 */
export function blockedResult(
  limit: number,
  reset: number,
  now: number,
): RateLimitResult {
  return {
    success: false,
    limit,
    remaining: 0,
    reset,
    retryAfter: Math.max(0, reset - now),
  };
}
