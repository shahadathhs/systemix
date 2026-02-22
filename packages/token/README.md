# @systemix/token

[![npm](https://img.shields.io/npm/v/@systemix/token.svg)](https://www.npmjs.com/package/@systemix/token)

A cryptographically secure token generator and signed-token module for API keys, session tokens, CSRF tokens, and auth. Zero external dependencies, pure Node.js and browser built-ins.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Package Structure](#package-structure)
- [Token Generator](#token-generator)
- [Signed Tokens](#signed-tokens)
- [Shared Utilities](#shared-utilities)
- [Common Module (Internals)](#common-module-internals)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Security Notes](#security-notes)
- [API Reference](#api-reference)

---

## Features

- **Secure**: Uses `crypto.getRandomValues()` for cryptographically strong randomness.
- **Multiple Charsets**: Hex, base64, base64url (URL-safe), and alphanumeric.
- **Signed Tokens**: HMAC (HS256/384/512) and RSA (RS256/384/512) with standard claims.
- **Subpath Exports**: Import only what you need (`/token`, `/signed`, `/shared`, `/common`).
- **Zero Dependencies**: Built with Node.js/browser built-ins only.
- **TypeScript Ready**: Full type definitions included.

---

## Installation

```bash
pnpm add @systemix/token
```

```bash
npm install @systemix/token
```

---

## Package Structure

| Subpath | Contents |
| :------ | :------- |
| `@systemix/token` | Main entry — re-exports token, signed, shared |
| `@systemix/token/token` | Token generator, encoding utils, validation |
| `@systemix/token/signed` | Signed token encode/decode/verify |
| `@systemix/token/shared` | Crypto primitives (getRandomBytes, getRandomInt) |
| `@systemix/token/common` | Enums, types, errors, utils (for advanced use) |

---

## Token Generator

### `generateToken(props?)`

Generates cryptographically secure random tokens. Returns a single string or array of strings.

```typescript
import { generateToken } from '@systemix/token';

// Default: 32 bytes, hex encoding
const token = generateToken();
// → "a1b2c3d4e5f6789..."

// With options
const apiKey = generateToken({
  byteLength: 32,
  charset: 'hex',
});

const sessionToken = generateToken({
  byteLength: 24,
  charset: 'base64url', // URL-safe, no + or /
});

const batch = generateToken({
  byteLength: 16,
  charset: 'alphanumeric',
  count: 5,
});
// → ["Ab3xYz...", "Mn7pQr...", ...]
```

#### Props

| Property | Type | Default | Description |
| :------- | :--- | :------ | :---------- |
| `byteLength` | `number` | `32` | Number of random bytes (1–1024). Output length depends on charset. |
| `charset` | `'hex' \| 'base64' \| 'base64url' \| 'alphanumeric'` | `'hex'` | Encoding format. |
| `count` | `number` | `1` | Number of tokens to generate (1–10). Returns `string[]` when > 1. |

#### Charset behavior

| Charset | Output length | Use case |
| :------ | :------------ | :------- |
| `hex` | `byteLength × 2` | API keys, opaque IDs |
| `base64` | ~`byteLength × 4/3` | Compact tokens |
| `base64url` | ~`byteLength × 4/3`, URL-safe | URLs, cookies |
| `alphanumeric` | `byteLength` | Human-readable, no special chars |

---

### `generateTokenPropValidation(props)`

Validates props before generation. Throws if invalid. Useful when building custom flows.

```typescript
import { generateTokenPropValidation } from '@systemix/token/token';

try {
  generateTokenPropValidation({ byteLength: 64, charset: 'hex' });
  // proceed with generation
} catch (e) {
  console.error(e.message);
}
```

---

### Encoding utilities

Use these when you need to encode raw bytes yourself:

```typescript
import {
  bytesToHex,
  bytesToBase64,
  bytesToBase64Url,
  bytesToAlphanumeric,
} from '@systemix/token/token';

const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

bytesToHex(bytes);        // → "48656c6c6f"
bytesToBase64(bytes);     // → "SGVsbG8="
bytesToBase64Url(bytes);  // → "SGVsbG8" (no padding)
bytesToAlphanumeric(bytes); // → "NkF2bB2" (A–Z, a–z, 0–9)
```

| Function | Input | Output |
| :------- | :---- | :----- |
| `bytesToHex(bytes)` | `Uint8Array` | Hex string |
| `bytesToBase64(bytes)` | `Uint8Array` | Base64 string |
| `bytesToBase64Url(bytes)` | `Uint8Array` | URL-safe base64 |
| `bytesToAlphanumeric(bytes)` | `Uint8Array` | A–Z, a–z, 0–9 |

---

### Token enums and types

```typescript
import { CHARSETS, TokenPropsEnum, type Charset } from '@systemix/token/token';
import type { GenerateTokenFunctionProps } from '@systemix/token/token';

// CHARSETS: ['hex', 'base64', 'base64url', 'alphanumeric']
// Charset: 'hex' | 'base64' | 'base64url' | 'alphanumeric'
// TokenPropsEnum: BYTE_LENGTH, CHARSET, COUNT
```

---

## Signed Tokens

Signed tokens are compact, URL-safe strings with a header, payload, and signature. Use for auth, sessions, or any signed claims.

### `encodeSigned(payload, secret, options?)`

Creates a signed token. Supports HMAC (shared secret) and RSA (PEM private key).

```typescript
import { encodeSigned } from '@systemix/token/signed';

// HMAC (shared secret)
const token = encodeSigned(
  { userId: '123', role: 'admin' },
  'my-secret-key',
  {
    algorithm: 'HS256',
    expiresIn: 3600,
    issuer: 'my-app',
    audience: 'api',
    subject: 'user-123',
    tokenId: true, // auto-generate jti
  }
);

// RSA (PEM private key)
const tokenRsa = encodeSigned(
  { userId: '123' },
  privateKeyPem,
  { algorithm: 'RS256', expiresIn: 3600 }
);
```

#### Encode options

| Option | Type | Default | Description |
| :----- | :--- | :------ | :---------- |
| `algorithm` | `SignedAlgorithm` | `'HS256'` | Signing algorithm. |
| `typ` | `string` | `'ST'` | Token type in header. |
| `kid` | `string` | — | Key ID for key rotation. |
| `cty` | `string` | — | Content type. |
| `expiresIn` | `number` | — | Expiration in seconds from now. |
| `notBefore` | `number` | — | Not-before in seconds from now. |
| `issuedAt` | `number` | `now` | Issued-at timestamp. |
| `issuer` | `string` | — | `iss` claim. |
| `subject` | `string` | — | `sub` claim. |
| `audience` | `string \| string[]` | — | `aud` claim. |
| `tokenId` | `string \| true` | — | `jti` claim. `true` = auto-generate. |

---

### `decodeSigned(token)`

Decodes a token **without** verifying the signature. Use when you need to inspect header/payload before deciding whether to verify.

```typescript
import { decodeSigned } from '@systemix/token/signed';

const { header, payload, signature } = decodeSigned<{ userId: string }>(token);

console.log(header.alg);   // "HS256"
console.log(payload.userId); // "123"
```

Returns `DecodedToken<T>`:

```typescript
interface DecodedToken<T> {
  header: SignedHeader;
  payload: T;
  signature: string;
}
```

---

### `verifySigned(token, secret, options)`

Decodes and verifies a token. Validates signature and optional claims. **`algorithms` is required** to prevent algorithm confusion.

```typescript
import { verifySigned } from '@systemix/token/signed';

const payload = verifySigned<{ userId: string }>(token, 'my-secret', {
  algorithms: ['HS256'],
  issuer: 'my-app',
  audience: 'api',
  subject: 'user-123',
  clockTolerance: 60, // 60s skew for exp/nbf
});
```

#### Verify options

| Option | Type | Required | Description |
| :----- | :--- | :------- | :---------- |
| `algorithms` | `SignedAlgorithm[]` | **Yes** | Allowed algorithms. Prevents algorithm-swap attacks. |
| `issuer` | `string \| string[]` | No | Expected `iss`. |
| `audience` | `string \| string[]` | No | Expected `aud`. |
| `subject` | `string` | No | Expected `sub`. |
| `clockTolerance` | `number` | No | Seconds of skew for `exp`/`nbf`. |
| `ignoreExpiration` | `boolean` | No | Skip `exp` check. |
| `ignoreNotBefore` | `boolean` | No | Skip `nbf` check. |

---

### Algorithms

| Algorithm | Type | Secret / key |
| :-------- | :--- | :----------- |
| HS256, HS384, HS512 | HMAC (symmetric) | Shared secret string |
| RS256, RS384, RS512 | RSA (asymmetric) | PEM private key (encode), PEM public key (verify) |

```typescript
import {
  HMAC_ALGORITHMS,
  RSA_ALGORITHMS,
  type SignedAlgorithm,
  type HmacAlgorithm,
  type RsaAlgorithm,
} from '@systemix/token/common';
```

---

### Standard claims

| Claim | Type | Description |
| :---- | :--- | :---------- |
| `iss` | `string` | Issuer |
| `sub` | `string` | Subject |
| `aud` | `string \| string[]` | Audience |
| `exp` | `number` | Expiration (Unix seconds) |
| `nbf` | `number` | Not before (Unix seconds) |
| `iat` | `number` | Issued at (Unix seconds) |
| `jti` | `string` | Token ID |

---

### Signed token types

```typescript
import type {
  SignedHeader,
  SignedPayload,
  EncodeSignedOptions,
  VerifySignedOptions,
  DecodedToken,
  StandardClaims,
} from '@systemix/token/signed';
```

---

## Shared Utilities

Low-level crypto primitives. Use when building custom token logic.

```typescript
import { getRandomBytes, getRandomInt } from '@systemix/token/shared';

// Cryptographically secure random bytes
const bytes = getRandomBytes(32);

// Random integer in [0, max)
const n = getRandomInt(100);
```

| Function | Description |
| :------- | :---------- |
| `getRandomBytes(length)` | Returns `Uint8Array` of random bytes. |
| `getRandomInt(max)` | Returns random integer in `[0, max)`. |

---

## Common Module (Internals)

For advanced use: enums, types, errors, and encoding utils.

```typescript
import {
  // Enums
  CHARSETS,
  HMAC_ALGORITHMS,
  RSA_ALGORITHMS,
  TokenPropsEnum,
  ALG_TO_HASH,
  isHmac,
  isRsa,
  // Types
  type Charset,
  type SignedAlgorithm,
  type HmacAlgorithm,
  type RsaAlgorithm,
  type GenerateTokenFunctionProps,
  type SignedHeader,
  type SignedPayload,
  type StandardClaims,
  // Errors
  SignedTokenError,
  TokenExpiredError,
  NotBeforeError,
  InvalidSignatureError,
  InvalidTokenError,
  AudienceMismatchError,
  IssuerMismatchError,
  // Utils
  bytesToHex,
  bytesToBase64,
  bytesToBase64Url,
  bytesToAlphanumeric,
  base64UrlEncode,
  base64UrlDecode,
  base64UrlDecodeToUtf8,
} from '@systemix/token/common';
```

---

## Error Handling

### Token generator errors

`generateToken` and `generateTokenPropValidation` throw generic `Error` with messages such as:

- `Invalid byteLength. Must be a positive number.`
- `Invalid charset. Must be one of: hex, base64, base64url, alphanumeric.`
- `Invalid count. Count must be less than or equal to 10.`
- `Invalid prop(s): foo. Only the following options are allowed: byteLength, charset, count.`

### Signed token errors

All extend `SignedTokenError`:

| Error | When |
| :---- | :--- |
| `InvalidTokenError` | Malformed token, invalid encoding, missing alg |
| `InvalidSignatureError` | Signature mismatch, wrong secret, algorithm not allowed |
| `TokenExpiredError` | `exp` in the past |
| `NotBeforeError` | `nbf` in the future |
| `AudienceMismatchError` | `aud` does not match |
| `IssuerMismatchError` | `iss` does not match |

```typescript
import {
  verifySigned,
  TokenExpiredError,
  InvalidSignatureError,
} from '@systemix/token/signed';

try {
  const payload = verifySigned(token, secret, { algorithms: ['HS256'] });
} catch (e) {
  if (e instanceof TokenExpiredError) {
    console.log('Expired at', e.expiredAt);
  } else if (e instanceof InvalidSignatureError) {
    console.log('Invalid signature');
  }
}
```

---

## Usage Examples

### API key generation

```typescript
import { generateToken } from '@systemix/token';

const apiKey = generateToken({
  byteLength: 32,
  charset: 'hex',
});
// Store hashed in DB, return plain once to user
```

### Session token with signed payload

```typescript
import { encodeSigned, verifySigned } from '@systemix/token/signed';

// On login
const sessionToken = encodeSigned(
  { userId: user.id, email: user.email },
  process.env.SESSION_SECRET!,
  { expiresIn: 86400, issuer: 'my-app' }
);

// On request
const payload = verifySigned(sessionToken, process.env.SESSION_SECRET!, {
  algorithms: ['HS256'],
  issuer: 'my-app',
});
```

### RSA for distributed verification

```typescript
import { encodeSigned, verifySigned } from '@systemix/token/signed';
import { readFileSync } from 'fs';

const privateKey = readFileSync('private.pem', 'utf8');
const publicKey = readFileSync('public.pem', 'utf8');

const token = encodeSigned(
  { sub: 'user-1' },
  privateKey,
  { algorithm: 'RS256', expiresIn: 3600 }
);

// Any service with public key can verify
const payload = verifySigned(token, publicKey, {
  algorithms: ['RS256'],
});
```

### Custom encoding pipeline

```typescript
import { getRandomBytes } from '@systemix/token/shared';
import { bytesToBase64Url } from '@systemix/token/common';

const bytes = getRandomBytes(24);
const token = bytesToBase64Url(bytes);
```

---

## Security Notes

- **Algorithm whitelist**: Always pass `algorithms` to `verifySigned`. Never trust the token header.
- **Secret strength**: Use at least 256 bits (32 bytes) for HMAC secrets.
- **RSA keys**: Use 2048+ bit keys. Keep the private key secret.
- **Clock skew**: Use `clockTolerance` when servers may have time drift.
- **Sensitive data**: Signed tokens are signed, not encrypted. Do not put secrets in the payload.

---

## API Reference

### Main exports (`@systemix/token`)

Re-exports everything from `/token`, `/signed`, and `/shared`.

### Token (`@systemix/token/token`)

- `generateToken(props?)` → `string | string[]`
- `generateTokenPropValidation(props)` → `void`
- `bytesToHex`, `bytesToBase64`, `bytesToBase64Url`, `bytesToAlphanumeric`
- `CHARSETS`, `TokenPropsEnum`, `Charset`, `GenerateTokenFunctionProps`

### Signed (`@systemix/token/signed`)

- `encodeSigned(payload, secret, options?)` → `string`
- `decodeSigned(token)` → `DecodedToken<T>`
- `verifySigned(token, secret, options)` → `T`
- Types: `SignedHeader`, `SignedPayload`, `EncodeSignedOptions`, `VerifySignedOptions`, `DecodedToken`, `StandardClaims`
- Algorithms: `SignedAlgorithm`, `HmacAlgorithm`, `RsaAlgorithm`
- Errors: `SignedTokenError`, `TokenExpiredError`, `NotBeforeError`, `InvalidSignatureError`, `InvalidTokenError`, `AudienceMismatchError`, `IssuerMismatchError`

### Shared (`@systemix/token/shared`)

- `getRandomBytes(length)` → `Uint8Array`
- `getRandomInt(max)` → `number`

### Common (`@systemix/token/common`)

- Enums: `CHARSETS`, `HMAC_ALGORITHMS`, `RSA_ALGORITHMS`, `TokenPropsEnum`, `ALG_TO_HASH`, `isHmac`, `isRsa`
- Types: `Charset`, `SignedAlgorithm`, `HmacAlgorithm`, `RsaAlgorithm`, `GenerateTokenFunctionProps`, `SignedHeader`, `SignedPayload`, `StandardClaims`, etc.
- Errors: All signed token error classes
- Utils: `bytesToHex`, `bytesToBase64`, `bytesToBase64Url`, `bytesToAlphanumeric`, `base64UrlEncode`, `base64UrlDecode`, `base64UrlDecodeToUtf8`

---

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
