---
'@systemix/cipher': minor
---

Versioned envelope, key ids and key rotation.

- `encrypt` now writes `SX | version | keyIdLen | keyId | IV | ciphertext+tag`. The header is authenticated as additional data. Payloads from 0.1.x (`[IV][ciphertext+tag]`) still decrypt; pass `allowLegacy: false` to reject them.
- New `createKeyring({ keys, current })` with `needsRotation()`; new `keyId` option; `parseEnvelope` exported.
- Breaking: the `iv` option is removed (caller-supplied IVs are a nonce-reuse risk). Output of `encrypt`/`encryptString` has a new layout.
- Fix: decryption failures now throw `DecryptionError` as documented (previously `InvalidPayloadError`); `InvalidPayloadError` is for structurally invalid payloads.
