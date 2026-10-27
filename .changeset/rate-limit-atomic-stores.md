---
'@systemix/rate-limit': minor
---

Async, atomic stores; fix a rate-limit bypass in `sweep()`; correct headers; bound memory.

- Fix: `sweep()` deleted _exhausted_ token buckets (its "expired" test matched any depleted bucket), handing blocked clients a fresh allowance, while never removing full ones. Entries now carry `expiresAt` and are swept only when idle.
- Fix: `RateLimit-Reset` was an epoch timestamp; it is now seconds until reset, as the IETF draft defines. `Retry-After` is clamped to at least 1 second.
- Fix: the default key generator no longer falls back to the forgeable `X-Forwarded-For` header, and groups IPv6 clients by /64 (new `normalizeIp`), so one subscriber can't get 2^64 allowances.
- Memory: the in-memory store sweeps idle entries automatically and caps tracked keys (`maxKeys`, default 100,000); keys over 1024 characters are rejected.
- Breaking: `limit`, `peek`, `resetKey`, `resetAll` and `sweep` return promises. `RateLimitStore` is now `hit/peek/delete/clear/sweep?` (the store runs the algorithm atomically), replacing synchronous `get/set/entries`, which could not back a shared store. The low-level algorithm functions take a `Map`-like `EntryStore`.
- New `rateLimitHeaders()` helper and `headers: 'legacy' | 'draft' | 'both' | false` (replaces `standardHeaders`); `failOpen` option; `clock` option.
- A Redis reference store is not included yet.
