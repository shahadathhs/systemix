import {
  RateLimitAlgorithm,
  RateLimitOptions,
  RateLimiter,
  RateLimitStore,
} from '../types/rate-limit.types';
import { InMemoryStore } from './store';
import {
  hitFixedWindow,
  hitSlidingWindow,
  peekFixedWindow,
  peekSlidingWindow,
} from './window.algorithms';
import { hitTokenBucket, peekTokenBucket } from './token-bucket.algorithm';
import { algorithmError, keyError, limitError } from '../utils/error.message';

export const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'fixed-window';

const ALLOWED_ALGORITHMS: RateLimitAlgorithm[] = [
  'fixed-window',
  'sliding-window',
  'token-bucket',
];

function validateOptions(options: RateLimitOptions): void {
  const { limit, windowMs, algorithm = DEFAULT_ALGORITHM } = options;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(limitError.invalidLimit);
  }
  if (!Number.isInteger(windowMs) || windowMs <= 0) {
    throw new Error(limitError.invalidWindowMs);
  }
  if (!ALLOWED_ALGORITHMS.includes(algorithm)) {
    throw new Error(algorithmError(ALLOWED_ALGORITHMS));
  }
}

/**
 * Creates a rate limiter with the requested algorithm and store.
 *
 * @example
 * const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
 * const result = limiter.limit('user:42');
 * if (!result.success) console.log(`Retry in ${result.retryAfter}ms`);
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  validateOptions(options);

  const resolved = {
    limit: options.limit,
    windowMs: options.windowMs,
    algorithm: options.algorithm ?? DEFAULT_ALGORITHM,
    store: options.store ?? new InMemoryStore(),
  };

  const hit = (store: RateLimitStore, key: string, now: number) => {
    switch (resolved.algorithm) {
      case 'sliding-window':
        return hitSlidingWindow(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
      case 'token-bucket':
        return hitTokenBucket(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
      default:
        return hitFixedWindow(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
    }
  };

  const peek = (store: RateLimitStore, key: string, now: number) => {
    switch (resolved.algorithm) {
      case 'sliding-window':
        return peekSlidingWindow(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
      case 'token-bucket':
        return peekTokenBucket(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
      default:
        return peekFixedWindow(
          store,
          key,
          resolved.limit,
          resolved.windowMs,
          now,
        );
    }
  };

  return {
    options: resolved,

    limit(key: string) {
      if (typeof key !== 'string' || key.length === 0) {
        throw new Error(keyError);
      }
      return hit(resolved.store, key, Date.now());
    },

    peek(key: string) {
      if (typeof key !== 'string' || key.length === 0) {
        throw new Error(keyError);
      }
      return peek(resolved.store, key, Date.now());
    },

    resetKey(key: string) {
      resolved.store.delete(key);
    },

    resetAll() {
      for (const [key] of resolved.store.entries()) {
        resolved.store.delete(key);
      }
    },

    sweep() {
      const now = Date.now();
      for (const [key, entry] of resolved.store.entries()) {
        const expired =
          entry.resetAt <= now &&
          (entry.timestamps.length === 0 ||
            entry.timestamps[entry.timestamps.length - 1] <=
              now - resolved.windowMs) &&
          entry.tokens < 1;
        if (expired) {
          resolved.store.delete(key);
        }
      }
    },
  };
}
