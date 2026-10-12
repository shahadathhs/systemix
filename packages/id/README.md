# @systemix/id

[![npm](https://img.shields.io/npm/v/@systemix/id.svg)](https://www.npmjs.com/package/@systemix/id)

`@systemix/id` generates unique, non-secret identifiers: UUID v4, lexicographically sortable ULIDs, and nanoid-style URL-safe IDs. Built on crypto-grade randomness via `crypto.getRandomValues`. Zero dependencies.

> For secrets and tokens (API keys, session tokens), use [`@systemix/token`](https://www.npmjs.com/package/@systemix/token) instead.

## Features

- **UUID v4**: RFC 9562-compliant, with `getRandomValues` fallback.
- **ULID**: 26-character sortable IDs with 48-bit timestamp prefix, plus a monotonic factory.
- **nanoid-style**: Compact URL-safe IDs with custom size and alphabet support.
- **Bias-Free**: Rejection sampling guarantees uniform character distribution.
- **ID Validation**: `isUuid` helper with version and variant checking.
- **Zero Dependencies**: Purely built with platform primitives.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/id
```

or

```bash
npm install @systemix/id
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/id
```

Use `@shahadathhs/id` in imports.

## Usage

### nanoid-style IDs

```typescript
import { generateId } from '@systemix/id';

const id = generateId(); // "V1StGXR8_Z5jdHi6B-myT"
const short = generateId({ size: 10 });
const hex = generateId({ size: 16, alphabet: '0123456789abcdef' });
```

### ULID (sortable IDs)

```typescript
import { generateUlid, createMonotonicUlid } from '@systemix/id';

const ulid = generateUlid(); // "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// Monotonic factory — strictly increasing, even within the same millisecond
const nextUlid = createMonotonicUlid();
nextUlid(); // "01ARZ3NDEKTSV4RRFFQ69G5FAW"
nextUlid(); // "01ARZ3NDEKTSV4RRFFQ69G5FAX"
```

### UUID v4

```typescript
import { generateUuid, isUuid } from '@systemix/id';

const uuid = generateUuid(); // "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"

isUuid(uuid); // true (validates format, version, and variant)
isUuid(uuid, 4); // true — must be version 4
```

## API Reference

### `generateId(options?): string`

| Option     | Type     | Default       | Description                                     |
| :--------- | :------- | :------------ | :---------------------------------------------- |
| `size`     | `number` | `21`          | ID length (1 to 1024).                          |
| `alphabet` | `string` | `urlAlphabet` | Characters to draw from (2–256, no duplicates). |

### `generateUlid(timestamp?): string`

26-character Crockford Base32 ID: 10-char timestamp + 16-char random. Sorts chronologically as a string.

### `createMonotonicUlid(): (timestamp?) => string`

Returns a generator whose output strictly increases — when called within the same millisecond, the random suffix is incremented instead of re-randomized. Useful for database primary keys generated in tight loops.

### `generateUuid(): string`

Random UUID (version 4) in the standard 8-4-4-4-12 format.

### `isUuid(value, version?): string | false`

Validates RFC 9562 UUIDs (versions 1–8) including variant bits. Returns the (lowercased-insensitive) input string when valid, `false` otherwise. Throws on an invalid `version` argument.

### Other Exports

| Export             | Description                             |
| :----------------- | :-------------------------------------- |
| `urlAlphabet`      | Default 64-character URL-safe alphabet. |
| `CROCKFORD_BASE32` | ULID alphabet per the spec.             |
| `getRandomBytes`   | Cryptographically secure random bytes.  |
| `getRandomInt`     | Bias-free random integer in `[0, max)`. |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
