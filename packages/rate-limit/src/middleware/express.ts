import {
  ExpressLikeRequest,
  ExpressLikeResponse,
  ExpressRateLimitOptions,
} from '../types/rate-limit.types';
import { createRateLimiter } from '../limiter/create-rate-limiter';
import { RateLimiter } from '../types/rate-limit.types';
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
) => void {
  const {
    keyGenerator,
    message = { message: rateLimitExceededMessage },
    statusCode = 429,
    standardHeaders = true,
    ...limiterOptions
  } = options;

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    throw new Error(statusCodeError);
  }

  const limiter: RateLimiter = createRateLimiter(limiterOptions);

  const getKey = (request: ExpressLikeRequest): string => {
    if (keyGenerator) return keyGenerator(request);
    return (
      request.ip ??
      request.socket?.remoteAddress ??
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ??
      'unknown'
    );
  };

  return (request, response, next) => {
    const result = limiter.limit(getKey(request));

    if (standardHeaders) {
      response.setHeader('RateLimit-Limit', String(result.limit));
      response.setHeader('RateLimit-Remaining', String(result.remaining));
      response.setHeader(
        'RateLimit-Reset',
        String(Math.ceil(result.reset / 1000)),
      );
    }

    if (result.success) {
      next();
      return;
    }

    if (standardHeaders) {
      response.setHeader(
        'Retry-After',
        String(Math.ceil(result.retryAfter / 1000)),
      );
    }
    response.status(statusCode).json(message);
  };
}
