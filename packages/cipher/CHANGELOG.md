# @systemix/cipher

## 0.2.0

### Minor Changes

- 5a583cd: Versioned envelope, key ids and key rotation.
  
  - `encrypt` now writes `SX | version | keyIdLen | keyId | IV | ciphertext+tag`. The header is authenticated as additional data. Payloads from 0.1.x (`[IV][ciphertext+tag]`) still decrypt; pass `allowLegacy: false` to reject them.
  - New `createKeyring({ keys, current })` with `needsRotation()`; new `keyId` option; `parseEnvelope` exported.
  - Breaking: the `iv` option is removed (caller-supplied IVs are a nonce-reuse risk). Output of `encrypt`/`encryptString` has a new layout.
  - Fix: decryption failures now throw `DecryptionError` as documented (previously `InvalidPayloadError`); `InvalidPayloadError` is for structurally invalid payloads.
- ad40f40: Require Node.js 24.7 or newer (`engines.node`). Older runtimes are no longer supported or tested; CI runs on Node 24 and 26.

## 0.1.1

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 0.1.0

### Minor Changes

- Initial release: authenticated AES-256-GCM encryption and decryption with embedded IV, AAD support, PBKDF2 key derivation, and typed errors.
