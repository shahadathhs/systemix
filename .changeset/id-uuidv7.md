---
'@systemix/id': minor
---

Add UUID v7 and fix ordering and alphabet bugs.

- New `generateUuidV7`, `createMonotonicUuidV7`, `uuidV7Timestamp` (RFC 9562) and `ulidTimestamp`.
- Fix: `createMonotonicUlid` no longer goes backwards when the clock does, and throws on random-part overflow instead of silently wrapping to zero.
- Fix: `generateId` splits the alphabet by code point (astral characters such as emoji were previously split into surrogate halves) and draws random bytes in batches instead of one `getRandomValues` call per character.
- `generateUuid` calls `crypto.randomUUID` directly; the pre-Node-19 fallback is removed.
