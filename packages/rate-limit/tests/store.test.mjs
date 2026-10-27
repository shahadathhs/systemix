/**
 * Tests for stores, sweeping, atomicity, headers, IP keys and middleware
 * behavior added in the async-store redesign.
 */
import { createRunner } from '@systemix/runner';
import {
  InMemoryStore,
  createRateLimiter,
  expressRateLimit,
  normalizeIp,
  rateLimitHeaders,
} from '../dist/index.js';

function mockResponse() {
  const r = {
    statusCode: 0,
    headers: {},
    body: undefined,
    status(c) {
      r.statusCode = c;
      return r;
    },
    setHeader(n, v) {
      r.headers[n] = v;
      return r;
    },
    json(b) {
      r.body = b;
      return r;
    },
  };
  return r;
}

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrows, assertThrowsAsync }) => {
    // ── Controllable clock ──────────────────────────────────────────
    let now = 1_000_000;
    const clock = () => now;

    // ── Regression: sweep() must not reset exhausted token buckets ──
    const bucket = createRateLimiter({
      limit: 3,
      windowMs: 60_000,
      algorithm: 'token-bucket',
      clock,
    });
    for (let i = 0; i < 3; i++) await bucket.limit('abuser');
    assert(!(await bucket.limit('abuser')).success, 'bucket is exhausted');
    await bucket.sweep();
    assert(
      !(await bucket.limit('abuser')).success,
      'sweep() keeps an exhausted bucket exhausted',
    );

    // ── Idle entries are swept, active ones kept ────────────────────
    const store = new InMemoryStore({ sweepIntervalMs: 1_000_000_000 });
    const sw = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      algorithm: 'fixed-window',
      store,
      clock,
    });
    await sw.limit('a');
    await sw.limit('b');
    assert(store.size === 2, 'two keys tracked');
    now += 500;
    await sw.sweep();
    assert(store.size === 2, 'entries inside their window survive a sweep');
    now += 600;
    await sw.sweep();
    assert(store.size === 0, 'expired fixed-window entries are swept');

    for (const algorithm of ['sliding-window', 'token-bucket']) {
      const s = new InMemoryStore({ sweepIntervalMs: 1_000_000_000 });
      const l = createRateLimiter({
        limit: 2,
        windowMs: 1000,
        algorithm,
        store: s,
        clock,
      });
      await l.limit('k');
      assert(s.size === 1, `${algorithm}: key tracked`);
      await l.sweep();
      assert(s.size === 1, `${algorithm}: active key survives sweep`);
      now += 1100;
      await l.sweep();
      assert(s.size === 0, `${algorithm}: idle key swept once fully recovered`);
    }

    // ── Automatic sweeping bounds memory without manual sweep() ─────
    const auto = new InMemoryStore({ sweepIntervalMs: 100 });
    const al = createRateLimiter({
      limit: 1,
      windowMs: 50,
      store: auto,
      clock,
    });
    for (let i = 0; i < 50; i++) await al.limit(`old-${i}`);
    now += 1000;
    await al.limit('fresh');
    assert(
      auto.size === 1,
      'idle keys are dropped automatically on later hits',
    );

    // ── maxKeys cap ─────────────────────────────────────────────────
    const capped = new InMemoryStore({ maxKeys: 100 });
    const cl = createRateLimiter({
      limit: 5,
      windowMs: 60_000,
      store: capped,
      clock,
    });
    for (let i = 0; i < 1000; i++) await cl.limit(`flood-${i}`);
    assert(capped.size <= 100, 'key count never exceeds maxKeys');
    assertThrows(
      () => new InMemoryStore({ maxKeys: 0 }),
      'rejects maxKeys of 0',
    );

    // ── Atomicity: concurrent hits never exceed the limit ───────────
    for (const algorithm of [
      'fixed-window',
      'sliding-window',
      'token-bucket',
    ]) {
      const l = createRateLimiter({ limit: 10, windowMs: 60_000, algorithm });
      const results = await Promise.all(
        Array.from({ length: 200 }, () => l.limit('shared')),
      );
      assert(
        results.filter((r) => r.success).length === 10,
        `${algorithm}: exactly 10 of 200 concurrent hits allowed`,
      );
    }

    // ── A custom async store works through the limiter ──────────────
    const inner = new InMemoryStore();
    const calls = [];
    const asyncStore = {
      async hit(key, policy, t) {
        calls.push('hit');
        await new Promise((r) => setTimeout(r, 1));
        return inner.hit(key, policy, t);
      },
      async peek(key, policy, t) {
        calls.push('peek');
        return inner.peek(key, policy, t);
      },
      async delete(key) {
        inner.delete(key);
      },
      async clear() {
        inner.clear();
      },
    };
    const viaAsync = createRateLimiter({
      limit: 2,
      windowMs: 60_000,
      store: asyncStore,
    });
    await viaAsync.limit('x');
    await viaAsync.limit('x');
    assert(!(await viaAsync.limit('x')).success, 'async store enforces limit');
    assert(!(await viaAsync.peek('x')).success, 'async store peek');
    await viaAsync.resetKey('x');
    assert((await viaAsync.limit('x')).success, 'async store resetKey');
    await viaAsync.sweep(); // store has no sweep(): must not throw
    assert(calls.includes('hit') && calls.includes('peek'), 'store was used');

    // ── Headers ─────────────────────────────────────────────────────
    const allowed = {
      success: true,
      limit: 100,
      remaining: 99,
      reset: 31_500,
      retryAfter: 0,
    };
    const blockedR = {
      success: false,
      limit: 100,
      remaining: 0,
      reset: 31_500,
      retryAfter: 1_500,
    };
    const policy = { limit: 100, windowMs: 60_000 };
    const legacy = rateLimitHeaders(allowed, policy, 'legacy', 1_000);
    assert(
      legacy['RateLimit-Limit'] === '100' &&
        legacy['RateLimit-Remaining'] === '99' &&
        legacy['RateLimit-Reset'] === '31',
      'legacy headers: reset is seconds from now (ceil)',
    );
    assert(!legacy['Retry-After'], 'no Retry-After when allowed');
    const draft = rateLimitHeaders(allowed, policy, 'draft', 1_000);
    assert(
      draft['RateLimit-Policy'] === '"default";q=100;w=60' &&
        draft['RateLimit'] === '"default";r=99;t=31' &&
        !draft['RateLimit-Limit'],
      'draft headers use the structured-field format',
    );
    const both = rateLimitHeaders(blockedR, policy, 'both', 30_000);
    assert(
      both['RateLimit-Limit'] &&
        both['RateLimit'] &&
        both['Retry-After'] === '2',
      'both formats plus Retry-After (rounded up) when blocked',
    );
    assert(
      rateLimitHeaders(allowed, { limit: 5, windowMs: 400 }, 'draft', 0)[
        'RateLimit-Policy'
      ] === '"default";q=5;w=1',
      'sub-second windows are reported as 1s',
    );
    assert(
      rateLimitHeaders({ ...allowed, reset: 0 }, policy, 'legacy', 5_000)[
        'RateLimit-Reset'
      ] === '0',
      'reset never goes negative',
    );

    // ── Middleware: keys, headers, failures ─────────────────────────
    const mw = expressRateLimit({ limit: 1, windowMs: 60_000 });
    const spoof = (xff) => ({
      headers: { 'x-forwarded-for': xff },
      ip: '10.0.0.9',
    });
    await mw(spoof('1.1.1.1'), mockResponse(), () => {});
    const second = mockResponse();
    await mw(spoof('2.2.2.2'), second, () => {});
    assert(
      second.statusCode === 429,
      'X-Forwarded-For is ignored: spoofing it does not change the key',
    );

    const dr = mockResponse();
    await expressRateLimit({ limit: 3, windowMs: 60_000, headers: 'draft' })(
      { headers: {}, ip: '1.2.3.4' },
      dr,
      () => {},
    );
    assert(
      dr.headers['RateLimit-Policy'] === '"default";q=3;w=60' &&
        dr.headers['RateLimit'].startsWith('"default";r=2;t='),
      "headers: 'draft' emits RateLimit and RateLimit-Policy",
    );

    const brokenStore = {
      hit() {
        throw new Error('redis down');
      },
      peek() {
        throw new Error('redis down');
      },
      delete() {},
      clear() {},
    };
    let nextArg = 'unset';
    await expressRateLimit({ limit: 1, windowMs: 1000, store: brokenStore })(
      { headers: {}, ip: '1.1.1.1' },
      mockResponse(),
      (e) => (nextArg = e),
    );
    assert(
      nextArg instanceof Error && nextArg.message === 'redis down',
      'store errors go to next(error) by default',
    );
    nextArg = 'unset';
    const openRes = mockResponse();
    await expressRateLimit({
      limit: 1,
      windowMs: 1000,
      store: brokenStore,
      failOpen: true,
    })({ headers: {}, ip: '1.1.1.1' }, openRes, (e) => (nextArg = e));
    assert(
      nextArg === undefined && openRes.statusCode === 0,
      'failOpen lets the request through when the store fails',
    );

    // ── IP normalization ────────────────────────────────────────────
    assert(normalizeIp('203.0.113.7') === '203.0.113.7', 'IPv4 unchanged');
    assert(normalizeIp(' 203.0.113.7 ') === '203.0.113.7', 'trims whitespace');
    assert(
      normalizeIp('::ffff:203.0.113.7') === '203.0.113.7',
      'IPv4-mapped IPv6 becomes IPv4',
    );
    assert(
      normalizeIp('2001:db8:1:2:aaaa:bbbb:cccc:dddd') === '2001:db8:1:2::/64',
      'full IPv6 reduced to /64',
    );
    assert(
      normalizeIp('2001:DB8:1:2:ffff:ffff:ffff:ffff') ===
        normalizeIp('2001:db8:1:2::1'),
      'addresses in the same /64 share a key (case-insensitive, compressed)',
    );
    assert(
      normalizeIp('2001:db8:1:2::1') !== normalizeIp('2001:db8:1:3::1'),
      'different /64s get different keys',
    );
    assert(normalizeIp('::1') === '0:0:0:0::/64', 'loopback expands');
    assert(
      normalizeIp('fe80::1%eth0') === normalizeIp('fe80::2'),
      'zone id is stripped',
    );
    assert(
      normalizeIp('64:ff9b::192.0.2.1') === '64:ff9b:0:0::/64',
      'embedded IPv4 tail is handled',
    );
    assert(normalizeIp('not an ip:').length <= 128, 'garbage is capped');
    assert(
      normalizeIp('1:2:3:4:5:6:7:8:9') === '1:2:3:4:5:6:7:8:9',
      'too many groups is returned unchanged, not misparsed',
    );
    assert(
      normalizeIp('x'.repeat(500) + ':').length === 128,
      'long input capped',
    );
  },
);
