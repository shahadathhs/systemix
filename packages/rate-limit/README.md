# @systemix/rate-limit

[![npm](https://img.shields.io/npm/v/@systemix/rate-limit.svg)](https://www.npmjs.com/package/@systemix/rate-limit)

`@systemix/rate-limit` provides rate limiting with fixed-window, sliding-window, and token-bucket algorithms, a pluggable store, and Express-compatible middleware. Built entirely on platform primitives. Zero dependencies.

## Features

- **Three Algorithms**: Fixed-window (default), sliding-window (rolling log), and token-bucket (continuous refill) — pick per use case.
- **Pluggable Storage**: In-memory `Map` store out of the box; implement `RateLimitStore` for Redis or databases.
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

const result = limiter.limit('user:42');
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

### Pluggable Store

```typescript
const limiter = createRateLimiter({
  limit: 100,
  windowMs: 60_000,
  store: new RedisStore(), // implements RateLimitStore
});
```

## API Reference

### `createRateLimiter(options): RateLimiter`

| Option      | Type               | Default         | Description                              |
| :---------- | :----------------- | :-------------- | :--------------------------------------- |
| `limit`     | `number`           | — (required)    | Max requests per window (bucket capacity). |
| `windowMs`  | `number`           | — (required)    | Window size in milliseconds.             |
| `algorithm` | `'fixed-window' \| 'sliding-window' \| 'token-bucket'` | `'fixed-window'` | Rate limiting algorithm. |
| `store`     | `RateLimitStore`   | in-memory `Map` | Custom storage backend.                  |

Returns a limiter with:

| Method              | Description                                    |
| :------------------ | :--------------------------------------------- |
| `limit(key)`        | Records a hit and returns the verdict.         |
| `peek(key)`         | Reads state without recording a hit.           |
| `resetKey(key)`     | Clears the state for one key.                  |
| `resetAll()`        | Clears all state.                              |
| `sweep()`           | Removes expired entries from the store.        |

### `expressRateLimit(options)`

Express-compatible middleware. Extra options beyond the limiter's:

| Option            | Type         | Default                    | Description                       |
| :---------------- | :----------- | :------------------------- | :-------------------------------- |
| `keyGenerator`    | `(req) => string` | request IP            | Extracts the rate limit key.      |
| `message`         | `unknown`    | `{ message: 'Too many requests…' }` | Body for blocked requests. |
| `statusCode`      | `number`     | `429`                      | HTTP status for blocked requests. |
| `standardHeaders` | `boolean`    | `true`                     | Emits `RateLimit-*` / `Retry-After`. |

### `withRateLimit(handler, limiter, keyGenerator?)`

Wraps any function; blocked calls throw `RateLimitExceededError` (carries `retryAfter` and `limit`).

### Algorithms

| Algorithm        | Behavior                                         | Best for                  |
| :--------------- | :----------------------------------------------- | :------------------------ |
| `fixed-window`   | Counter resets every window — lowest memory      | Simple request caps       |
| `sliding-window` | Rolling log of timestamps — no boundary bursts   | Fair, smooth quotas       |
| `token-bucket`   | Continuous refill — tolerates short bursts       | APIs with bursty traffic  |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
