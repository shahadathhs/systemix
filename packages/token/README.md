# @systemix/token

[![npm](https://img.shields.io/npm/v/@systemix/token.svg)](https://www.npmjs.com/package/@systemix/token)

`@systemix/token` is a cryptographically secure token generator for API keys, session tokens, CSRF tokens, and more. It also includes a signed-token module (encode, decode, verify) for compact signed payloads. Built for maximum security, it relies entirely on `crypto.getRandomValues()`, ensuring zero external dependencies and a low supply-chain risk profile.

## Features

- **Secure**: Uses `crypto.getRandomValues()` for cryptographically strong randomness.
- **Multiple Charsets**: Hex, base64, base64url (URL-safe), and alphanumeric.
- **Subpath Exports**: Import only what you need (`/token`, `/signed`, `/shared`).
- **Sub-functions**: Access encoding utilities (`bytesToHex`, `bytesToBase64`, etc.) and validation directly.
- **Zero Dependencies**: Purely built with Node.js/browser built-ins.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/token
```

or

```bash
npm install @systemix/token
```

## Usage

### Simple Example

```typescript
import { generateToken } from '@systemix/token';

// Default: 32 bytes, hex encoding
const token = generateToken();
console.log(token); // e.g. "a1b2c3d4e5f6..."
```

### API Keys (hex)

```typescript
const apiKey = generateToken({
  byteLength: 32,
  charset: 'hex',
});
```

### Session Tokens (base64url)

```typescript
const sessionToken = generateToken({
  byteLength: 24,
  charset: 'base64url',
});
// URL-safe, no padding
```

### Multiple Tokens

```typescript
const tokens = generateToken({
  byteLength: 16,
  charset: 'alphanumeric',
  count: 5,
});
// Returns string[]
```

### Subpath Imports

Import only the token module (smaller bundle):

```typescript
import {
  generateToken,
  bytesToHex,
  bytesToBase64,
} from '@systemix/token/token';
```

Import signed-token module (encode/decode/verify):

```typescript
import {
  encodeSigned,
  decodeSigned,
  verifySigned,
} from '@systemix/token/signed';
```

Import shared crypto utilities:

```typescript
import { getRandomInt, getRandomBytes } from '@systemix/token/shared';
```

## API Reference

### `generateToken(props?: TokenProps): string | string[]`

| Property     | Type     | Default | Description                                             |
| :----------- | :------- | :------ | :------------------------------------------------------ |
| `byteLength` | `number` | `32`    | Number of random bytes (1 to 1024).                     |
| `charset`    | `string` | `'hex'` | Encoding: `hex`, `base64`, `base64url`, `alphanumeric`. |
| `count`      | `number` | `1`     | Number of tokens to generate (1 to 10).                 |

### Sub-functions (from `@systemix/token` or `@systemix/token/token`)

| Function                             | Description                             |
| :----------------------------------- | :-------------------------------------- |
| `bytesToHex(bytes)`                  | Encode bytes to hex string.             |
| `bytesToBase64(bytes)`               | Encode bytes to base64.                 |
| `bytesToBase64Url(bytes)`            | Encode bytes to URL-safe base64.        |
| `bytesToAlphanumeric(bytes)`         | Encode bytes to alphanumeric string.    |
| `generateTokenPropValidation(props)` | Validate token props before generation. |

### Signed Tokens

Import from `@systemix/token/signed`:

| Function                                  | Description                                     |
| :---------------------------------------- | :---------------------------------------------- |
| `encodeSigned(payload, secret, options?)` | Create a signed token (HMAC or RSA).            |
| `decodeSigned(token)`                     | Decode without verification (header + payload). |
| `verifySigned(token, secret, options)`    | Decode and verify signature + claims.           |

**Algorithms:** HS256, HS384, HS512 (HMAC), RS256, RS384, RS512 (RSA).

**Standard claims:** `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`.

**Encode options:** `algorithm`, `expiresIn`, `notBefore`, `issuer`, `subject`, `audience`, `tokenId`, `kid`, `clockTolerance`.

**Verify options:** `algorithms` (required), `issuer`, `audience`, `subject`, `clockTolerance`, `ignoreExpiration`, `ignoreNotBefore`.

**Errors:** `TokenExpiredError`, `NotBeforeError`, `InvalidSignatureError`, `InvalidTokenError`, `AudienceMismatchError`, `IssuerMismatchError`.

**Design choices (vs common alternatives):**

- **Explicit algorithm whitelist** — `algorithms` is required when verifying. Never trust the token header; you declare what you accept. Prevents algorithm-swap forgery.
- **No `alg: none`** — Only HMAC and RSA; no unsigned or weak variants.
- **Generic naming** — Token type defaults to `ST` (signed token); no vendor-specific identifiers.

```typescript
import { encodeSigned, verifySigned } from '@systemix/token/signed';

const token = encodeSigned({ userId: '123' }, 'my-secret', {
  expiresIn: 3600,
  issuer: 'my-app',
});

const payload = verifySigned(token, 'my-secret', {
  algorithms: ['HS256'],
  issuer: 'my-app',
});
```

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
