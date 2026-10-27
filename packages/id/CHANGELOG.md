# @systemix/id

## 0.2.0

### Minor Changes

- 17a6aac: Add UUID v7 and fix ordering and alphabet bugs.

  - New `generateUuidV7`, `createMonotonicUuidV7`, `uuidV7Timestamp` (RFC 9562) and `ulidTimestamp`.
  - Fix: `createMonotonicUlid` no longer goes backwards when the clock does, and throws on random-part overflow instead of silently wrapping to zero.
  - Fix: `generateId` splits the alphabet by code point (astral characters such as emoji were previously split into surrogate halves) and draws random bytes in batches instead of one `getRandomValues` call per character.
  - `generateUuid` calls `crypto.randomUUID` directly; the pre-Node-19 fallback is removed.

- ad40f40: Require Node.js 24.7 or newer (`engines.node`). Older runtimes are no longer supported or tested; CI runs on Node 24 and 26.

## 0.1.1

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 0.1.0

### Minor Changes

- Initial release: UUID v4, ULID with monotonic factory, and nanoid-style ID generation with bias-free crypto-grade randomness, plus isUuid validation.
