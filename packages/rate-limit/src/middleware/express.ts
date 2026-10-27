import {
  ExpressLikeRequest,
  ExpressLikeResponse,
  ExpressRateLimitOptions,
} from '../types/rate-limit.types';
import { createRateLimiter } from '../limiter/create-rate-limiter';
import { RateLimiter } from '../types/rate-limit.types';
import { normalizeIp } from '../utils/ip';
import { rateLimitHeaders } from './headers';
import {
  rateLimitExceededMessage,
  statusCodeError,
} from '../utils/error.message';

export type NextFunction = (error?: unknown) => void;

/**
 * Express-compatible rate limiting middleware. Dependency-free: the request
 * and response types are structural, so it works with Express, Fastify
 * (with adapters), Next.js route handlers, and plain http handlers.
 *
 * @example
 * app.use('/api', expressRateLimit({ limit: 100, windowMs: 60_000 }));
 */
export function expressRateLimit(
  options: ExpressRateLimitOptions,
): (
  request: ExpressLikeRequest,
  response: ExpressLikeResponse,
  next: NextFunction,
) => Promise<void> {
  const {
    keyGenerator,
    message = { message: rateLimitExceededMessage },
    statusCode = 429,
    headers = 'legacy',
    failOpen = false,
    ...limiterOptions
  } = options;

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    throw new Error(statusCodeError);
  }

  const limiter: RateLimiter = createRateLimiter(limiterOptions);

  const getKey = (request: ExpressLikeRequest): string => {
    if (keyGenerator) return keyGenerator(request);
    return normalizeIp(
      request.ip ?? request.socket?.remoteAddress ?? 'unknown',
    );
  };

  return async (request, response, next) => {
    let result;
    try {
      result = await limiter.limit(getKey(request));
    } catch (error) {
      if (failOpen) next();
      else next(error);
      return;
    }

    if (headers) {
      const map = rateLimitHeaders(result, limiter.options, headers);
      for (const [name, value] of Object.entries(map)) {
        response.setHeader(name, value);
      }
    }

    if (result.success) {
      next();
      return;
    }
    response.status(statusCode).json(message);
  };
}
