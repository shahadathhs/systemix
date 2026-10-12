# @systemix/hash

[![npm](https://img.shields.io/npm/v/@systemix/hash.svg)](https://www.npmjs.com/package/@systemix/hash)

`@systemix/hash` provides password hashing and verification with PBKDF2 and scrypt, built entirely on Web Crypto and Node.js built-ins. Zero dependencies, low supply-chain risk. Completes the auth flow: generate (`@systemix/password`) → hash → store → verify.

## Features

- **PBKDF2**: Isomorphic via Web Crypto — works in Node.js 18+ and browsers.
- **scrypt**: Node.js-only via `node:crypto` for memory-hard hashing.
- **Self-Describing Hashes**: Encoded output embeds algorithm, parameters, salt, and hash — no extra columns needed.
- **Timing-Safe Verification**: Constant-time comparison prevents timing attacks.
- **OWASP Defaults**: PBKDF2-HMAC-SHA256 with 210,000 iterations out of the box.
- **Zero Dependencies**: Purely built with platform primitives.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/hash
```

or

```bash
npm install @systemix/hash
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/hash
```

Use `@shahadathhs/hash` in imports.

## Usage

### Hash and Verify a Password

```typescript
import { hashPassword, verifyPassword } from '@systemix/hash';

const encoded = await hashPassword('hunter2');
// → "pbkdf2$SHA-256$210000$C5eX...$k9fT..."

const isValid = await verifyPassword('hunter2', encoded); // → true
const isWrong = await verifyPassword('letmein', encoded); // → false
```

### scrypt (Node.js only)

```typescript
const encoded = await hashPassword('hunter2', {
  algorithm: 'scrypt',
  costFactor: 16384, // N
});
```

### Custom Parameters

```typescript
const encoded = await hashPassword('hunter2', {
  digest: 'SHA-512',
  iterations: 310_000,
  keyLength: 64,
});
```

### Low-Level Derivation

```typescript
import {
  pbkdf2DeriveBits,
  scryptDeriveBits,
  generateSalt,
} from '@systemix/hash';

const salt = generateSalt(16);
const key = await pbkdf2DeriveBits('password', salt, {
  iterations: 100_000,
  keyLength: 32,
});
```

## API Reference

### `hashPassword(password, options?): Promise<string>`

| Option                  | Type                                  | Default     | Description                             |
| :---------------------- | :------------------------------------ | :---------- | :-------------------------------------- |
| `algorithm`             | `'pbkdf2' \| 'scrypt'`                | `'pbkdf2'`  | Hashing algorithm.                      |
| `digest`                | `'SHA-256' \| 'SHA-384' \| 'SHA-512'` | `'SHA-256'` | PBKDF2 digest function.                 |
| `iterations`            | `number`                              | `210000`    | PBKDF2 iteration count.                 |
| `keyLength`             | `number`                              | `32`        | Derived key length in bytes (max 1024). |
| `salt`                  | `Uint8Array`                          | random 16B  | Custom salt (min 8 bytes).              |
| `costFactor`            | `number`                              | `16384`     | scrypt cost factor N (power of 2).      |
| `blockSizeFactor`       | `number`                              | `8`         | scrypt block size r.                    |
| `parallelizationFactor` | `number`                              | `1`         | scrypt parallelization p.               |

Returns a string in the format `pbkdf2$<digest>$<iterations>$<salt>$<hash>` or `scrypt$<N>$<r>$<p>$<salt>$<hash>` (values base64url-encoded).

### `verifyPassword(password, encodedHash): Promise<boolean>`

Re-derives the hash with the stored parameters and compares in constant time. Malformed hashes return `false` instead of throwing.

### Other Exports

| Export                                  | Description                                         |
| :-------------------------------------- | :-------------------------------------------------- |
| `pbkdf2DeriveBits`                      | Raw PBKDF2 key derivation (isomorphic).             |
| `scryptDeriveBits`                      | Raw scrypt key derivation (Node.js only).           |
| `generateSalt`                          | Cryptographically secure random salt.               |
| `parseEncodedHash`                      | Parses an encoded hash string into its components.  |
| `secureEqual`                           | Constant-time string comparison.                    |
| `bytesEqual`                            | Constant-time byte comparison.                      |
| `isScryptSupported`                     | Whether scrypt is available in the current runtime. |
| `bytesToBase64Url` / `base64UrlToBytes` | URL-safe base64 helpers.                            |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
