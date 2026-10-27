# @systemix/rate-limit

## 0.2.0

### Minor Changes

- ad40f40: Require Node.js 24.7 or newer (`engines.node`). Older runtimes are no longer supported or tested; CI runs on Node 24 and 26.
- 4e9a99f: Async, atomic stores; fix a rate-limit bypass in `sweep()`; correct headers; bound memory.
  
  - Fix: `sweep()` deleted _exhausted_ token buckets (its "expired" test matched any depleted bucket), handing blocked clients a fresh allowance, while never removing full ones. Entries now carry `expiresAt` and are swept only when idle.
  - Fix: `RateLimit-Reset` was an epoch timestamp; it is now seconds until reset, as the IETF draft defines. `Retry-After` is clamped to at least 1 second.
  - Fix: the default key generator no longer falls back to the forgeable `X-Forwarded-For` header, and groups IPv6 clients by /64 (new `normalizeIp`), so one subscriber can't get 2^64 allowances.
  - Memory: the in-memory store sweeps idle entries automatically and caps tracked keys (`maxKeys`, default 100,000); keys over 1024 characters are rejected.
  - Breaking: `limit`, `peek`, `resetKey`, `resetAll` and `sweep` return promises. `RateLimitStore` is now `hit/peek/delete/clear/sweep?` (the store runs the algorithm atomically), replacing synchronous `get/set/entries`, which could not back a shared store. The low-level algorithm functions take a `Map`-like `EntryStore`.
  - New `rateLimitHeaders()` helper and `headers: 'legacy' | 'draft' | 'both' | false` (replaces `standardHeaders`); `failOpen` option; `clock` option.
  - A Redis reference store is not included yet.

## 0.1.1

### Patch Changes

- 0a3e262: Add package README (was missing from the initial release tarball).

## 0.1.0

### Minor Changes

- Initial release: fixed-window, sliding-window, and token-bucket algorithms with a pluggable store, Express-compatible middleware, and a generic withRateLimit wrapper.
