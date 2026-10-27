/**
 * Tests for @systemix/rate-limit – createRateLimiter, store, middleware.
 */
import { createRunner } from '@systemix/runner';
import {
  createRateLimiter,
  withRateLimit,
  expressRateLimit,
  RateLimitExceededError,
  rateLimitExceededMessage,
} from '../dist/index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createMockResponse() {
  const response = {
    statusCode: 0,
    headers: {},
    body: undefined,
    status(code) {
      response.statusCode = code;
      return response;
    },
    setHeader(name, value) {
      response.headers[name] = value;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
}

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrows, assertThrowsAsync }) => {
    // --- createRateLimiter integration (real time) ---
    const limiter = createRateLimiter({ limit: 3, windowMs: 40 });
    assert(limiter.options.limit === 3, 'resolves options');

    for (let i = 0; i < 3; i++) {
      assert((await limiter.limit('k1')).success, `request ${i + 1} allowed`);
    }
    assert(
      !(await limiter.limit('k1')).success,
      'blocks at limit (integration)',
    );

    const peeked = await limiter.peek('k1');
    assert(!peeked.success, 'peek does not record a hit');

    await limiter.resetKey('k1');
    assert((await limiter.limit('k1')).success, 'resetKey clears state');

    await sleep(45);
    assert((await limiter.limit('k1')).success, 'window reset in real time');

    await limiter.limit('k2');
    await limiter.resetAll();
    assert(
      (await limiter.peek('k2')).remaining === 3,
      'resetAll clears all keys',
    );

    await limiter.limit('a');
    await limiter.limit('b');
    await limiter.sweep();
    await limiter.resetAll();

    assertThrows(
      () => createRateLimiter({ limit: 0, windowMs: 1000 }),
      'rejects limit 0',
    );
    assertThrows(
      () => createRateLimiter({ limit: 5, windowMs: 0 }),
      'rejects windowMs 0',
    );
    assertThrows(
      () =>
        createRateLimiter({
          limit: 5,
          windowMs: 1000,
          algorithm: 'leaky-bucket',
        }),
      'rejects unknown algorithm',
    );
    await assertThrowsAsync(() => limiter.limit(''), 'rejects empty key');
    await assertThrowsAsync(
      () => limiter.limit('x'.repeat(1025)),
      'rejects keys over 1024 characters',
    );

    // --- withRateLimit ---
    const limiter2 = createRateLimiter({ limit: 2, windowMs: 50 });
    const wrapped = withRateLimit(
      async (userId) => `user:${userId}`,
      limiter2,
      (userId) => `user:${userId}`,
    );

    assert((await wrapped('a')) === 'user:a', 'wrapped handler executes');
    await wrapped('a');
    await assertThrowsAsync(
      () => wrapped('a'),
      'withRateLimit blocks excess calls',
    );
    assert((await wrapped('b')) === 'user:b', 'other keys unaffected');

    try {
      const limited = withRateLimit(
        () => 'x',
        createRateLimiter({ limit: 1, windowMs: 60_000 }),
      );
      await limited();
      await limited();
      assert(false, 'should have thrown');
    } catch (error) {
      assert(
        error instanceof RateLimitExceededError && error.retryAfter > 0,
        'RateLimitExceededError carries retryAfter',
      );
    }

    // --- expressRateLimit ---
    const middleware = expressRateLimit({ limit: 2, windowMs: 60_000 });
    const request = { headers: {}, ip: '10.0.0.1' };

    const response1 = createMockResponse();
    await middleware(request, response1, () => (response1.statusCode = 200));
    assert(response1.statusCode === 200, 'middleware allows under limit');
    assert(
      response1.headers['RateLimit-Limit'] === '2',
      'emits RateLimit-Limit header',
    );

    await middleware(request, createMockResponse(), () => {});
    const blocked = createMockResponse();
    await middleware(request, blocked, () => (blocked.statusCode = 200));
    assert(blocked.statusCode === 429, 'middleware returns 429 at limit');
    assert(
      blocked.body.message === rateLimitExceededMessage,
      'default block message',
    );
    assert(
      Number(blocked.headers['Retry-After']) > 0,
      'emits Retry-After header',
    );
    assert(
      Number(blocked.headers['RateLimit-Reset']) > 0 &&
        Number(blocked.headers['RateLimit-Reset']) <= 60,
      'RateLimit-Reset is seconds until reset, not an epoch timestamp',
    );

    const custom = expressRateLimit({
      limit: 1,
      windowMs: 60_000,
      statusCode: 429,
      keyGenerator: (req) => req.headers['x-api-key'],
      message: { error: 'custom' },
      headers: false,
    });
    const reqA = { headers: { 'x-api-key': 'a' } };
    const res1 = createMockResponse();
    await custom(reqA, res1, () => (res1.statusCode = 200));
    const res2 = createMockResponse();
    await custom(reqA, res2, () => (res2.statusCode = 200));
    assert(
      res2.statusCode === 429 && res2.body.error === 'custom',
      'custom key and message',
    );
    assert(!res2.headers['RateLimit-Limit'], 'headers can be disabled');
    const resB = createMockResponse();
    await custom(
      { headers: { 'x-api-key': 'b' } },
      resB,
      () => (resB.statusCode = 200),
    );
    assert(resB.statusCode === 200, 'custom keys independent');

    assertThrows(
      () => expressRateLimit({ limit: 1, windowMs: 1000, statusCode: 200 }),
      'rejects non-4xx/5xx status code',
    );
  },
);
