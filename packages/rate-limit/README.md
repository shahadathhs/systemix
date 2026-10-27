# @systemix/rate-limit

[![npm](https://img.shields.io/npm/v/@systemix/rate-limit.svg)](https://www.npmjs.com/package/@systemix/rate-limit)

`@systemix/rate-limit` provides rate limiting with fixed-window, sliding-window, and token-bucket algorithms, a pluggable store, and Express-compatible middleware. Built entirely on platform primitives. Zero dependencies. Requires Node.js 24.7+.

## Features

- **Three Algorithms**: Fixed-window (default), sliding-window (rolling log), and token-bucket (continuous refill) — pick per use case.
- **Atomic, async stores**: a bounded, self-sweeping in-memory store out of the box; implement `RateLimitStore` for shared backends (the store runs the algorithm atomically).
- **Standard headers**: legacy `RateLimit-*` or the IETF draft format, plus `Retry-After`.
- **Express-Compatible Middleware**: Dependency-free structural types work with Express, Next.js route handlers, and plain `http`. Emits standard `RateLimit-*` and `Retry-After` headers.
- **Generic Function Wrapper**: Rate-limit any function with `withRateLimit`.
- **Rich Results**: Every check returns `{ success, limit, remaining, reset, retryAfter }`.
- **Zero Dependencies**: Purely built with platform primitives.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/rate-limit
```

or

```bash
npm install @systemix/rate-limit
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/rate-limit
```

Use `@shahadathhs/rate-limit` in imports.

## Usage

### Basic Rate Limiting

```typescript
import { createRateLimiter } from '@systemix/rate-limit';

const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

const result = await limiter.limit('user:42');
// → { success: true, limit: 5, remaining: 4, reset: 1700000000000, retryAfter: 0 }

if (!result.success) {
  console.log(`Retry in ${result.retryAfter}ms`);
}
```

### Express Middleware

```typescript
import { expressRateLimit } from '@systemix/rate-limit';

app.use(
  '/api',
  expressRateLimit({
    limit: 100,
    windowMs: 60_000,
    statusCode: 429,
    message: { error: 'Slow down!' },
    keyGenerator: (req) => req.ip ?? 'unknown',
  }),
);
```

### Generic Function Wrapper

```typescript
import { createRateLimiter, withRateLimit } from '@systemix/rate-limit';

const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

const getUser = withRateLimit(fetchUser, limiter, (userId) => userId);
// throws RateLimitExceededError when the limit is hit
```

### Custom store (shared across processes)

The default in-memory store is atomic only inside one process. To limit across several servers, implement `RateLimitStore` against a shared system. The store owns the algorithm step, so it can run it atomically where the data lives (for example one Redis Lua script per hit) instead of a racy read-modify-write over the network:

```typescript
import type { RateLimitStore } from '@systemix/rate-limit';

class SharedStore implements RateLimitStore {
  async hit(key, policy, now) {
    /* atomically apply policy.algorithm; return a RateLimitResult */
  }
  async peek(key, policy, now) {
    /* same verdict, no state change */
  }
  async delete(key) {}
  async clear() {}
  async sweep(now) {} // optional
}
```

Requirements: `hit` must be atomic per key (concurrent hits can never both pass the limit), `peek` must not mutate, and idle keys should expire so memory follows active keys. The in-memory store is the reference implementation. **A Redis store is not included yet.**

### Memory bounds

The in-memory store sweeps idle entries on its own and caps the number of keys (`new InMemoryStore({ maxKeys: 100_000, sweepIntervalMs: 60_000 })`). Keys usually come from clients, so an unbounded map is a denial-of-service risk. When the cap is hit, idle entries go first, then the oldest keys — an evicted client starts over with a fresh allowance.

### Response headers

```typescript
import { rateLimitHeaders } from '@systemix/rate-limit';

const result = await limiter.limit(key);
const headers = rateLimitHeaders(result, limiter.options, 'legacy'); // or 'draft' | 'both'
// legacy: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset (seconds until reset), Retry-After when blocked
// draft:  RateLimit-Policy: "default";q=100;w=60   RateLimit: "default";r=99;t=31
```

`RateLimit-Reset` is **seconds until reset**, not an epoch timestamp. The `draft` format follows [draft-ietf-httpapi-ratelimit-headers](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), which is still an Internet-Draft and may change.

### Client IPs

`expressRateLimit` keys on `req.ip` by default, grouping IPv6 addresses by /64 (one subscriber usually owns a whole /64, so keying on the full address would give them 2^64 allowances). `X-Forwarded-For` is **not** read: clients can forge it. Behind a proxy, configure your framework's proxy trust so `req.ip` is correct, or pass a `keyGenerator`. Use `normalizeIp(ip)` in your own key generators.

## API Reference

### `createRateLimiter(options): RateLimiter`

| Option      | Type                                                   | Default          | Description                                |
| :---------- | :----------------------------------------------------- | :--------------- | :----------------------------------------- |
| `limit`     | `number`                                               | — (required)     | Max requests per window (bucket capacity). |
| `windowMs`  | `number`                                               | — (required)     | Window size in milliseconds.               |
| `algorithm` | `'fixed-window' \| 'sliding-window' \| 'token-bucket'` | `'fixed-window'` | Rate limiting algorithm.                   |
| `store`     | `RateLimitStore`                                       | in-memory        | Custom storage backend.                    |
| `clock`     | `() => number`                                         | `Date.now`       | Time source (for tests).                   |

Returns a limiter with:

All methods return promises, so the same code works with in-memory and shared stores.

| Method          | Description                                    |
| :-------------- | :--------------------------------------------- |
| `limit(key)`    | Records a hit and returns the verdict.         |
| `peek(key)`     | Reads state without recording a hit.           |
| `resetKey(key)` | Clears the state for one key.                  |
| `resetAll()`    | Clears all state.                              |
| `sweep()`       | Drops idle entries (the default store also does this itself). |

Keys must be non-empty strings of at most 1024 characters.

### `expressRateLimit(options)`

Express-compatible middleware. Extra options beyond the limiter's:

| Option            | Type              | Default                             | Description                          |
| :---------------- | :---------------- | :---------------------------------- | :----------------------------------- |
| `keyGenerator`    | `(req) => string` | request IP (IPv6 by /64)            | Extracts the rate limit key.         |
| `message`         | `unknown`         | `{ message: 'Too many requests…' }` | Body for blocked requests.           |
| `statusCode`      | `number`          | `429`                               | HTTP status for blocked requests.    |
| `headers`         | `'legacy' \| 'draft' \| 'both' \| false` | `'legacy'` | Which rate limit headers to emit. |
| `failOpen`        | `boolean`         | `false`                             | Let requests through if the store throws (default: `next(error)`). |

### `withRateLimit(handler, limiter, keyGenerator?)`

Wraps any function; blocked calls throw `RateLimitExceededError` (carries `retryAfter` and `limit`).

### Algorithms

| Algorithm        | Behavior                                       | Best for                 |
| :--------------- | :--------------------------------------------- | :----------------------- |
| `fixed-window`   | Counter resets every window — lowest memory    | Simple request caps      |
| `sliding-window` | Rolling log of timestamps — no boundary bursts | Fair, smooth quotas      |
| `token-bucket`   | Continuous refill — tolerates short bursts     | APIs with bursty traffic |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
