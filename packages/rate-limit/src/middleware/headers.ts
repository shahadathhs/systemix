import {
  RateLimitHeadersFormat,
  RateLimitPolicy,
  RateLimitResult,
} from '../types/rate-limit.types';

/**
 * Builds rate limit response headers for a verdict. Framework-agnostic:
 * apply the returned map to an Express response, a Fetch `Response`, etc.
 *
 * - 'legacy': `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
 *   (seconds until the window resets — not an epoch timestamp) and, when
 *   blocked, `Retry-After` (seconds).
 * - 'draft': `RateLimit-Policy: "default";q=<limit>;w=<window s>` and
 *   `RateLimit: "default";r=<remaining>;t=<seconds>` as defined by
 *   draft-ietf-httpapi-ratelimit-headers (an Internet-Draft, so the format
 *   may still change), plus `Retry-After` when blocked.
 * - 'both': all of the above.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  policy: Pick<RateLimitPolicy, 'limit' | 'windowMs'>,
  format: RateLimitHeadersFormat = 'legacy',
  now: number = Date.now(),
): Record<string, string> {
  const resetSeconds = Math.max(0, Math.ceil((result.reset - now) / 1000));
  const headers: Record<string, string> = {};

  if (format === 'legacy' || format === 'both') {
    headers['RateLimit-Limit'] = String(result.limit);
    headers['RateLimit-Remaining'] = String(result.remaining);
    headers['RateLimit-Reset'] = String(resetSeconds);
  }
  if (format === 'draft' || format === 'both') {
    headers['RateLimit-Policy'] =
      `"default";q=${policy.limit};w=${Math.max(1, Math.ceil(policy.windowMs / 1000))}`;
    headers['RateLimit'] = `"default";r=${result.remaining};t=${resetSeconds}`;
  }
  if (!result.success) {
    headers['Retry-After'] = String(
      Math.max(1, Math.ceil(result.retryAfter / 1000)),
    );
  }
  return headers;
}
