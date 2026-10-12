import { RateLimiter } from '../types/rate-limit.types';

/**
 * Thrown by withRateLimit when a call exceeds the rate limit.
 */
export class RateLimitExceededError extends Error {
  /** Milliseconds until the caller may retry. */
  readonly retryAfter: number;
  /** Configured request limit. */
  readonly limit: number;

  constructor(retryAfter: number, limit: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter}ms.`);
    this.name = 'RateLimitExceededError';
    this.retryAfter = retryAfter;
    this.limit = limit;
  }
}

/**
 * Wraps any function with rate limiting. Calls that exceed the limit throw
 * a RateLimitExceededError instead of executing the handler.
 *
 * @example
 * const getUser = withRateLimit(fetchUser, {
 *   limit: 10,
 *   windowMs: 60_000,
 *   keyGenerator: (userId: string) => userId,
 * });
 */
export function withRateLimit<TArgs extends unknown[], R>(
  handler: (...args: TArgs) => R | Promise<R>,
  limiter: RateLimiter,
  keyGenerator?: (...args: TArgs) => string,
): (...args: TArgs) => Promise<R> {
  return async (...args: TArgs): Promise<R> => {
    const key = keyGenerator ? keyGenerator(...args) : 'global';
    const result = limiter.limit(key);
    if (!result.success) {
      throw new RateLimitExceededError(result.retryAfter, result.limit);
    }
    return handler(...args);
  };
}
