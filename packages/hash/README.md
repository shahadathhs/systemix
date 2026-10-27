# @systemix/hash

[![npm](https://img.shields.io/npm/v/@systemix/hash.svg)](https://www.npmjs.com/package/@systemix/hash)

`@systemix/hash` provides password hashing and verification with **Argon2id** (the OWASP first choice), scrypt and PBKDF2, built entirely on Node.js built-ins. Zero dependencies, no native bindings. Completes the auth flow: generate (`@systemix/password`) → hash → store → verify.

**Requires Node.js 24.7 or newer** (`crypto.argon2`). Older runtimes are not supported.

## Features

- **Argon2id by default**: 19 MiB, 2 passes, 1 lane (OWASP minimum) — natively via `node:crypto`, no `argon2` package or compiler toolchain.
- **PHC string format**: `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>` — portable to other PHC-compatible libraries. Hashes from 0.1.x (`pbkdf2$…`, `scrypt$…`) still verify.
- **`needsRehash`**: detect weak or legacy hashes at login and upgrade them transparently.
- **scrypt and PBKDF2**: scrypt at N=2^17, PBKDF2-HMAC-SHA256 at 600,000 iterations (the FIPS-140 option).
- **Hostile-input safe**: cost parameters read from a stored hash are bounded (e.g. Argon2 memory ≤ 256 MiB), so a tampered hash can't force unbounded CPU or memory use.
- **Non-blocking**: Argon2 and scrypt run on the libuv threadpool, not the event loop.
- **Timing-safe verification**: `crypto.timingSafeEqual`.
- **TypeScript ready**: full type definitions included.

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
// → "$argon2id$v=19$m=19456,t=2,p=1$C5eX...$k9fT..."

const isValid = await verifyPassword('hunter2', encoded); // → true
const isWrong = await verifyPassword('letmein', encoded); // → false
```

### Upgrade hashes at login

```typescript
import { verifyPassword, hashPassword, needsRehash } from '@systemix/hash';

if (await verifyPassword(password, user.passwordHash)) {
  if (needsRehash(user.passwordHash)) {
    user.passwordHash = await hashPassword(password); // current defaults
    await user.save();
  }
}
```

`needsRehash` returns `true` for legacy-format hashes, a different algorithm, or any cost parameter weaker than the target. Pass the same options you hash with.

### Custom parameters

```typescript
await hashPassword('hunter2', {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});
await hashPassword('hunter2', { algorithm: 'scrypt' }); // N=2^17, r=8, p=1
await hashPassword('hunter2', { algorithm: 'pbkdf2' }); // SHA-256, 600,000 iterations
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

| Option                  | Type                                  | Default      | Description                             |
| :---------------------- | :------------------------------------ | :----------- | :-------------------------------------- |
| `algorithm`             | `'argon2id' \| 'scrypt' \| 'pbkdf2'`  | `'argon2id'` | Hashing algorithm.                      |
| `memoryCost`            | `number`                              | `19456`      | Argon2id memory in KiB (max 262,144).   |
| `timeCost`              | `number`                              | `2`          | Argon2id passes (max 10).               |
| `parallelism`           | `number`                              | `1`          | Argon2id lanes (max 16).                |
| `costFactor`            | `number`                              | `131072`     | scrypt cost factor N (power of 2).      |
| `blockSizeFactor`       | `number`                              | `8`          | scrypt block size r.                    |
| `parallelizationFactor` | `number`                              | `1`          | scrypt parallelization p.               |
| `digest`                | `'SHA-256' \| 'SHA-384' \| 'SHA-512'` | `'SHA-256'`  | PBKDF2 digest function.                 |
| `iterations`            | `number`                              | `600000`     | PBKDF2 iteration count.                 |
| `keyLength`             | `number`                              | `32`         | Derived key length in bytes (max 1024). |
| `salt`                  | `Uint8Array`                          | random 16B   | Custom salt (min 8 bytes).              |

Returns a PHC string:

- `$argon2id$v=19$m=<KiB>,t=<passes>,p=<lanes>$<salt>$<hash>`
- `$scrypt$ln=<log2 N>,r=<r>,p=<p>$<salt>$<hash>`
- `$pbkdf2-<sha256|sha384|sha512>$i=<iterations>$<salt>$<hash>`

Salt and hash are base64 without padding.

### `verifyPassword(password, encodedHash): Promise<boolean>`

Re-derives the hash with the stored parameters and compares in constant time. Accepts PHC and legacy (0.1.x) formats. Malformed hashes, and hashes whose parameters exceed the safety bounds, return `false` instead of throwing.

### `needsRehash(encodedHash, options?): boolean`

Whether a stored hash should be replaced with one made from the current parameters (see example above).

### Other Exports

| Export                                  | Description                                      |
| :-------------------------------------- | :----------------------------------------------- |
| `argon2DeriveBits`                      | Raw Argon2id key derivation.                     |
| `pbkdf2DeriveBits`                      | Raw PBKDF2 key derivation (Web Crypto).          |
| `scryptDeriveBits`                      | Raw scrypt key derivation.                       |
| `generateSalt`                          | Cryptographically secure random salt.            |
| `parseEncodedHash`                      | Parses a PHC or legacy hash into its components. |
| `secureEqual`                           | Constant-time string comparison.                 |
| `bytesEqual`                            | Constant-time byte comparison.                   |
| `isArgon2Supported`                     | Whether `crypto.argon2` exists in this runtime.  |
| `bytesToBase64Url` / `base64UrlToBytes` | URL-safe base64 helpers.                         |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
