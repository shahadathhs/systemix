# @systemix/cipher

[![npm](https://img.shields.io/npm/v/@systemix/cipher.svg)](https://www.npmjs.com/package/@systemix/cipher)

`@systemix/cipher` provides authenticated AES-256-GCM encryption and decryption for sensitive data at rest — database fields, config secrets, tokens. Built entirely on Web Crypto. Zero dependencies. Requires Node.js 24.7+.

## Features

- **Authenticated Encryption**: AES-GCM with a 128-bit auth tag — tampering is detected, not decrypted.
- **Standard APIs**: built on Web Crypto, no native add-ons.
- **Versioned envelope**: `SX | version | keyId | IV | ciphertext + tag` — one value to store, no extra columns. The header is authenticated, so it can't be altered without detection.
- **Key rotation**: `createKeyring` encrypts with the current key and decrypts by the key id in the envelope; `needsRotation` flags payloads to re-encrypt.
- **No nonce footguns**: the IV is always random per call and cannot be supplied.
- **Backward compatible**: payloads from 0.1.x (`[IV][ciphertext+tag]`) still decrypt.
- **Additional Authenticated Data**: Bind ciphertext to context (user IDs, record types) via AAD.
- **Password-Derived Keys**: PBKDF2-HMAC-SHA256 key derivation helper.
- **Typed Errors**: `DecryptionError`, `InvalidKeyError`, `InvalidPayloadError`.
- **Zero Dependencies**: Purely built with platform primitives.
- **TypeScript Ready**: Full type definitions included.

## Installation

```bash
pnpm add @systemix/cipher
```

or

```bash
npm install @systemix/cipher
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/cipher
```

Use `@shahadathhs/cipher` in imports.

## Usage

### Encrypt / Decrypt Strings

```typescript
import {
  generateKeyBytes,
  encryptString,
  decryptString,
} from '@systemix/cipher';

const key = generateKeyBytes(); // 32 random bytes (AES-256)

const payload = await encryptString('sensitive data', key);
// → "U1gBAC..." (base64url of the envelope)

const plaintext = await decryptString(payload, key); // "sensitive data"
```

### Raw Bytes with AAD

```typescript
import { encrypt, decrypt } from '@systemix/cipher';

const payload = await encrypt(recordBytes, key, {
  additionalData: new TextEncoder().encode('user:42'),
});

// Decryption succeeds only with the same AAD:
await decrypt(payload, key, {
  additionalData: new TextEncoder().encode('user:42'),
});
```

### Key Derivation from a Password

```typescript
import { deriveKeyFromPassword, generateSalt } from '@systemix/cipher';

const salt = generateSalt(); // store alongside the ciphertext
const key = await deriveKeyFromPassword('master password', salt);
```

### Typed Error Handling

```typescript
import { decryptString, DecryptionError } from '@systemix/cipher';

try {
  await decryptString(payload, wrongKey);
} catch (error) {
  if (error instanceof DecryptionError) {
    // wrong key, tampered data, or malformed payload
  }
}
```

## API Reference

### `encrypt(data, key, options?): Promise<Uint8Array>`

| Option           | Type         | Default | Description                                             |
| :--------------- | :----------- | :------ | :------------------------------------------------------ |
| `additionalData` | `Uint8Array` | —       | AAD — authenticated but not encrypted.                  |
| `keyId`          | `string`     | `''`    | Key id written into the envelope header (max 64 bytes). |

`decrypt` also takes `allowLegacy` (default `true`) to accept or reject the pre-envelope 0.1.x format.

### `decrypt(payload, key, options?): Promise<Uint8Array>`

Throws `DecryptionError` on wrong key, tampered data (including the header), or wrong AAD, and `InvalidPayloadError` if the payload is too short.

### String Helpers

| Function                                  | Description                               |
| :---------------------------------------- | :---------------------------------------- |
| `encryptString(plaintext, key, options?)` | Encrypts to a base64url string.           |
| `decryptString(payload, key, options?)`   | Decrypts a base64url payload to a string. |

### Key rotation

```typescript
import { createKeyring } from '@systemix/cipher';

const ring = createKeyring({
  keys: { k2: newKey, k1: oldKey }, // keep retired keys until nothing uses them
  current: 'k2',
});

const blob = await ring.encryptString('secret'); // stamped "k2"
await ring.decryptString(oldBlob); // still works: envelope names "k1"

if (ring.needsRotation(oldBlob)) {
  // legacy payload or encrypted with an older key
  save(await ring.encryptString(await ring.decryptString(oldBlob)));
}
```

AES-GCM with random 96-bit IVs is safe for roughly 2^32 messages per key (NIST's collision bound). Rotate well before that.

### Key Management

| Function                                             | Description                                                 |
| :--------------------------------------------------- | :---------------------------------------------------------- |
| `generateKeyBytes(length?)`                          | Random AES key — 16, 24, or 32 bytes. Default 32 (AES-256). |
| `deriveKeyFromPassword(password, salt, iterations?)` | PBKDF2-SHA256 → 32-byte AES key.                            |
| `generateSalt(length?)`                              | Random salt (min 8 bytes). Default 16.                      |

### Errors

| Error                 | Thrown when                                              |
| :-------------------- | :------------------------------------------------------- |
| `CipherError`         | Base class for all cipher errors.                        |
| `DecryptionError`     | Authentication or decryption fails.                      |
| `InvalidKeyError`     | Key is not 16/24/32 bytes.                               |
| `InvalidPayloadError` | Payload is not bytes, too short, or not valid base64url. |

### Constants

| Constant              | Value          |
| :-------------------- | :------------- |
| `DEFAULT_KEY_LENGTH`  | `32`           |
| `IV_LENGTH`           | `12`           |
| `TAG_LENGTH`          | `128`          |
| `ALLOWED_KEY_LENGTHS` | `[16, 24, 32]` |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
