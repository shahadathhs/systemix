import {
  RateLimitAlgorithm,
  RateLimitOptions,
  RateLimitPolicy,
  RateLimiter,
} from '../types/rate-limit.types';
import { InMemoryStore } from './store';
import { algorithmError, keyError, limitError } from '../utils/error.message';

export const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'fixed-window';

/** Keys usually come from clients; cap them so they can't bloat the store. */
export const MAX_KEY_LENGTH = 1024;

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

function assertKey(key: string): void {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error(keyError);
  }
  if (key.length > MAX_KEY_LENGTH) {
    throw new Error(
      `Invalid key. It must be at most ${MAX_KEY_LENGTH} characters.`,
    );
  }
}

/**
 * Creates a rate limiter with the requested algorithm and store. Methods are
 * async so the same code works with in-memory and distributed stores.
 *
 * @example
 * const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
 * const result = await limiter.limit('user:42');
 * if (!result.success) console.log(`Retry in ${result.retryAfter}ms`);
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  validateOptions(options);

  const resolved = {
    limit: options.limit,
    windowMs: options.windowMs,
    algorithm: options.algorithm ?? DEFAULT_ALGORITHM,
    store: options.store ?? new InMemoryStore(),
    clock: options.clock ?? Date.now,
  };
  const policy: RateLimitPolicy = {
    limit: resolved.limit,
    windowMs: resolved.windowMs,
    algorithm: resolved.algorithm,
  };

  return {
    options: resolved,

    async limit(key: string) {
      assertKey(key);
      return resolved.store.hit(key, policy, resolved.clock());
    },

    async peek(key: string) {
      assertKey(key);
      return resolved.store.peek(key, policy, resolved.clock());
    },

    async resetKey(key: string) {
      await resolved.store.delete(key);
    },

    async resetAll() {
      await resolved.store.clear();
    },

    async sweep() {
      await resolved.store.sweep?.(resolved.clock());
    },
  };
}
