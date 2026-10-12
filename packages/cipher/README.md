# @systemix/cipher

[![npm](https://img.shields.io/npm/v/@systemix/cipher.svg)](https://www.npmjs.com/package/@systemix/cipher)

`@systemix/cipher` provides authenticated AES-256-GCM encryption and decryption for sensitive data at rest — database fields, config secrets, tokens. Built entirely on Web Crypto, isomorphic across Node.js 18+ and browsers. Zero dependencies.

## Features

- **Authenticated Encryption**: AES-GCM with a 128-bit auth tag — tampering is detected, not decrypted.
- **Isomorphic**: Web Crypto in both Node.js and browsers.
- **Simple Blob Output**: Random 12-byte IV is embedded in the payload (`[IV][ciphertext+tag]`) — store one value, no extra columns.
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
// → "k9fT2x..." (base64url of [IV][ciphertext+tag])

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
| `iv`             | `Uint8Array` | random  | Custom 12-byte IV (omit unless you know you need this). |

### `decrypt(payload, key, options?): Promise<Uint8Array>`

Throws `DecryptionError` on wrong key, tampered data, wrong AAD, or malformed payload.

### String Helpers

| Function                                  | Description                               |
| :---------------------------------------- | :---------------------------------------- |
| `encryptString(plaintext, key, options?)` | Encrypts to a base64url string.           |
| `decryptString(payload, key, options?)`   | Decrypts a base64url payload to a string. |

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
